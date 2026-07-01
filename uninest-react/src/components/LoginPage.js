import "./LoginPage.css";
import { getAdmins, getResidents } from "../api";

function LoginPage() {
  const getResidentFullName = (resident) => {
    return (
      resident.full_name ||
      resident.user?.full_name ||
      resident.name ||
      resident.fullName ||
      "Resident"
    );
  };

  const getResidentEmail = (resident) => {
    return (
      resident.email ||
      resident.user?.email ||
      resident.userEmail ||
      ""
    ).toLowerCase();
  };

  const getResidentPassword = (resident) => {
    return resident.password || resident.user?.password || "";
  };

  const getResidentRole = (resident) => {
    return (
      resident.role ||
      resident.user_type ||
      resident.user?.role ||
      "student"
    ).toLowerCase();
  };

  const getLocalResidentsData = () => {
    const residents = JSON.parse(localStorage.getItem("residents"));
    const users = JSON.parse(localStorage.getItem("users"));

    if (residents && Array.isArray(residents) && residents.length > 0) {
      return residents;
    }

    if (users && Array.isArray(users)) {
      return users;
    }

    return [];
  };

  const shouldRedirectToBooking = () => {
    const pendingBooking = localStorage.getItem("pendingBooking");
    const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");

    return pendingBooking && redirectAfterLogin === "booking";
  };

  const saveResidentSession = (resident) => {
    const residentId = resident.resident_id || resident.id || "";
    const residentName = getResidentFullName(resident);
    const residentEmail = getResidentEmail(resident);
    const userType = getResidentRole(resident);

    localStorage.setItem("loggedInResidentId", residentId);
    localStorage.setItem("loggedInUser", residentName);
    localStorage.setItem("loggedInUserEmail", residentEmail);
    localStorage.setItem("loggedInRole", userType);
    localStorage.setItem("loggedInUserType", userType);

    localStorage.removeItem("loggedInAdminId");

    if (
      shouldRedirectToBooking() &&
      (userType === "student" || userType === "employee")
    ) {
      const pendingBooking = JSON.parse(localStorage.getItem("pendingBooking"));

      pendingBooking.resident_id = residentId;
      pendingBooking.resident_name = residentName;
      pendingBooking.email = residentEmail;

      pendingBooking.userName = residentName;
      pendingBooking.studentName = residentName;
      pendingBooking.residentName = residentName;

      pendingBooking.userEmail = residentEmail;
      pendingBooking.studentEmail = residentEmail;
      pendingBooking.residentEmail = residentEmail;

      localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
      localStorage.removeItem("redirectAfterLogin");

      window.location.href = "/booking";
      return;
    }

    localStorage.removeItem("redirectAfterLogin");

    window.location.href = "/student-dashboard";
  };

  const saveAdminSession = (admin) => {
    const adminId = admin.admin_id || admin.id || 1;
    const adminName =
      admin.full_name ||
      `${admin.first_name || ""} ${admin.last_name || ""}`.trim() ||
      "Admin";

    const adminEmail = (admin.email || "admin@uninest.com").toLowerCase();

    localStorage.setItem("loggedInAdminId", adminId);
    localStorage.setItem("loggedInUser", adminName);
    localStorage.setItem("loggedInUserEmail", adminEmail);
    localStorage.setItem("loggedInRole", "admin");
    localStorage.setItem("loggedInUserType", "admin");

    localStorage.removeItem("loggedInResidentId");
    localStorage.removeItem("redirectAfterLogin");

    window.location.href = "/admin-dashboard";
  };

  const findAdminFromBackend = async (email, password) => {
    try {
      const response = await getAdmins();
      const admins = Array.isArray(response) ? response : response.data || [];

      return admins.find((admin) => {
        return (
          String(admin.email || "").toLowerCase() === email &&
          String(admin.password || "") === password
        );
      });
    } catch (error) {
      console.warn("Backend admins could not be loaded:", error);
      return null;
    }
  };

  const findResidentFromBackend = async (email, password) => {
    try {
      const response = await getResidents();
      const residents = Array.isArray(response) ? response : response.data || [];

      return residents.find((resident) => {
        const residentEmail = getResidentEmail(resident);
        const residentPassword = getResidentPassword(resident);

        return residentEmail === email && String(residentPassword) === password;
      });
    } catch (error) {
      console.warn("Backend residents could not be loaded:", error);
      return null;
    }
  };

  const findResidentFromLocalStorage = (email, password) => {
    const residents = getLocalResidentsData();

    return residents.find((resident) => {
      return (
        String(resident.email || "").toLowerCase() === email &&
        String(resident.password || "") === password
      );
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim().toLowerCase();
    const password = event.target.password.value.trim();

    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    const backendAdmin = await findAdminFromBackend(email, password);

    if (backendAdmin) {
      saveAdminSession(backendAdmin);
      return;
    }

    if (email === "admin@uninest.com" && password === "123456") {
      saveAdminSession({
        admin_id: 1,
        first_name: "Admin",
        last_name: "",
        email,
        password,
      });
      return;
    }

    const backendResident = await findResidentFromBackend(email, password);

    if (backendResident) {
      saveResidentSession(backendResident);
      return;
    }

    const localResident = findResidentFromLocalStorage(email, password);

    if (localResident) {
      if (localResident.status === "Inactive") {
        alert("Your account is inactive. Please contact the admin.");
        return;
      }

      saveResidentSession(localResident);
      return;
    }

    alert(
      "Account not found or password is incorrect. If this account exists in the database, we may need to fix backend login/password response later."
    );
  };

  return (
    <div className="login-wrapper">
      <div className="login-brand">
        <a href="/" className="brand-logo">
          <i className="fa-solid fa-building-user"></i>
          UniNest
        </a>

        <h1>Welcome Back</h1>

        <p>
          Login to continue managing your dorm bookings, payments, maintenance
          requests, and reviews.
        </p>

        <div className="brand-features">
          <div>
            <i className="fa-solid fa-bed"></i>
            <span>Book dorm rooms easily</span>
          </div>

          <div>
            <i className="fa-solid fa-credit-card"></i>
            <span>Track payments safely</span>
          </div>

          <div>
            <i className="fa-solid fa-screwdriver-wrench"></i>
            <span>Submit maintenance requests</span>
          </div>
        </div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-page-header">
            <h2>Login</h2>
            <p>Access your UniNest account</p>
          </div>

          <form id="loginForm" onSubmit={handleLogin}>
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

            <div className="forgot-password-box">
              <a href="/forgot-password">Forgot Password?</a>
            </div>

            <button type="submit">
              <i className="fa-solid fa-right-to-bracket"></i>
              Login
            </button>
          </form>

          <div className="login-links">
            <p>
              Don't have an account?
              <a href="/register"> Register</a>
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

export default LoginPage;