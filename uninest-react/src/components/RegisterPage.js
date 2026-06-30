import { useState } from "react";
import "./RegisterPage.css";
import { createResident, getResidents } from "../api";

function RegisterPage() {
  const [role, setRole] = useState("");

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getLocalUsers = () => {
    return JSON.parse(localStorage.getItem("users")) || [];
  };

  const saveLocalUser = (newResident) => {
    const users = getLocalUsers();
    users.push(newResident);
    localStorage.setItem("users", JSON.stringify(users));
  };

  const checkBackendEmailExists = async (email) => {
    try {
      const response = await getResidents();
      const residents = Array.isArray(response) ? response : response.data || [];

      return residents.some((resident) => {
        const residentEmail = (
          resident.email ||
          resident.user?.email ||
          resident.userEmail ||
          ""
        ).toLowerCase();

        return residentEmail === email;
      });
    } catch (error) {
      console.warn("Could not check backend residents:", error);
      return false;
    }
  };

  const checkLocalEmailExists = (email) => {
    const users = getLocalUsers();

    return users.some((user) => {
      return String(user.email || "").toLowerCase() === email;
    });
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const fullName = event.target.fullname.value.trim();
    const email = event.target.email.value.trim().toLowerCase();
    const phone = event.target.phone.value.trim();
    const userType = event.target.role.value;

    const universityName = event.target.university?.value.trim() || "";
    const major = event.target.major?.value.trim() || "";

    const companyName = event.target.company?.value.trim() || "";
    const jobPosition = event.target.jobTitle?.value.trim() || "";

    const password = event.target.password.value.trim();
    const confirmPassword = event.target.confirmPassword.value.trim();

    if (
      !fullName ||
      !email ||
      !phone ||
      !userType ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^\d{2}-\d{6}$/;

    if (!phoneRegex.test(phone)) {
      alert("Phone number must be like this: 71-123456");
      return;
    }

    if (userType === "student" && (!universityName || !major)) {
      alert("Please fill university and major fields.");
      return;
    }

    if (userType === "employee" && (!companyName || !jobPosition)) {
      alert("Please fill company and job title fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (email === "admin@uninest.com") {
      alert("This account already exists. Please login.");
      return;
    }

    const backendExists = await checkBackendEmailExists(email);
    const localExists = checkLocalEmailExists(email);

    if (backendExists || localExists) {
      alert("This account already exists. Please login.");
      return;
    }

    const payload = {
      full_name: fullName,
      email: email,
      password: password,
      phone: phone,
      role: userType,
      university: userType === "student" ? universityName : "",
      major: userType === "student" ? major : "",
      company: userType === "employee" ? companyName : "",
    };

    try {
      await createResident(payload);

      alert("Registered successfully! You can now login.");
      window.location.href = "/login";
    } catch (error) {
      console.warn("Backend registration failed, saving locally:", error);

      const newResident = {
        resident_id: Date.now(),
        full_name: fullName,
        email: email,
        password: password,
        phone: phone,
        role: userType,
        user_type: userType,

        university: userType === "student" ? universityName : "",
        university_name: userType === "student" ? universityName : "",
        major: userType === "student" ? major : "",

        company: userType === "employee" ? companyName : "",
        company_name: userType === "employee" ? companyName : "",
        job_position: userType === "employee" ? jobPosition : "",

        profile_image: "",
        created_at: formatDateToday(),
        updated_at: "",
      };

      saveLocalUser(newResident);

      alert(
        "Registered locally for frontend testing. Later we will fix backend POST /residents."
      );

      window.location.href = "/login";
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-brand">
        <a href="/" className="brand-logo">
          <i className="fa-solid fa-building-user"></i>
          UniNest
        </a>

        <h1>Create Your Account</h1>

        <p>
          Join UniNest to book dorms, manage payments, submit maintenance
          requests, and review your housing experience.
        </p>

        <div className="brand-features">
          <div>
            <i className="fa-solid fa-user-graduate"></i>
            <span>For students and employees</span>
          </div>

          <div>
            <i className="fa-solid fa-house"></i>
            <span>Find nearby dorms easily</span>
          </div>

          <div>
            <i className="fa-solid fa-bell"></i>
            <span>Receive booking notifications</span>
          </div>
        </div>
      </div>

      <div className="register-container">
        <div className="register-card">
          <div className="register-page-header">
            <h2>Register</h2>
            <p>Create your UniNest resident account</p>
          </div>

          <form id="registerForm" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="fullname">Full Name</label>

              <div className="input-box">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-box">
                <i className="fa-solid fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>

              <div className="input-box">
                <i className="fa-solid fa-phone"></i>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Example: 71-123456"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Register As</label>

              <div className="input-box">
                <i className="fa-solid fa-users"></i>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  required
                >
                  <option value="">Select role</option>
                  <option value="student">Student</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
            </div>

            {role === "student" && (
              <div className="role-fields">
                <div className="form-group">
                  <label htmlFor="university">University</label>

                  <div className="input-box">
                    <i className="fa-solid fa-school"></i>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      placeholder="Example: AUB, LAU, LU"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="major">Major</label>

                  <div className="input-box">
                    <i className="fa-solid fa-book"></i>
                    <input
                      type="text"
                      id="major"
                      name="major"
                      placeholder="Enter your major"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === "employee" && (
              <div className="role-fields">
                <div className="form-group">
                  <label htmlFor="company">Company</label>

                  <div className="input-box">
                    <i className="fa-solid fa-building"></i>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="jobTitle">Job Title</label>

                  <div className="input-box">
                    <i className="fa-solid fa-briefcase"></i>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      placeholder="Enter your job title"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="input-box">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div className="input-box">
                <i className="fa-solid fa-shield-halved"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button type="submit">
              <i className="fa-solid fa-user-plus"></i>
              Register
            </button>
          </form>

          <div className="register-links">
            <p>
              Already have an account?
              <a href="/login"> Login</a>
            </p>

            <p>
              <a href="/">Back to Home</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;