import "./LoginPage.css";

function ForgotPasswordPage() {
  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizeUserType = (userType) => {
    const value = String(userType || "student").toLowerCase();

    if (value === "employee") {
      return "employee";
    }

    if (value === "admin") {
      return "admin";
    }

    return "student";
  };

  const splitFullName = (fullName) => {
    const parts = fullName
      .trim()
      .split(" ")
      .filter((part) => part !== "");

    const firstName = parts[0] || "";
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

    return {
      first_name: firstName,
      last_name: lastName,
    };
  };

  const normalizeResident = (resident) => {
    const oldFullName = resident.fullName || resident.name || "";
    const splitName = splitFullName(oldFullName);

    const firstName =
      resident.first_name || resident.firstName || splitName.first_name || "";

    const lastName =
      resident.last_name || resident.lastName || splitName.last_name || "";

    const userType = normalizeUserType(resident.user_type || resident.role);

    const residentId =
      resident.resident_id ||
      resident.id ||
      Date.now() + Math.floor(Math.random() * 1000);

    const fullName = (firstName + " " + lastName).trim();

    return {
      ...resident,

      resident_id: residentId,
      first_name: firstName,
      last_name: lastName,
      email: resident.email || "",
      password: resident.password || "",
      phone: resident.phone || "",
      user_type: userType,

      university_name:
        userType === "student"
          ? resident.university_name || resident.university || ""
          : "",

      major: userType === "student" ? resident.major || "" : "",

      company_name:
        userType === "employee"
          ? resident.company_name || resident.company || ""
          : "",

      job_position:
        userType === "employee"
          ? resident.job_position || resident.jobTitle || ""
          : "",

      profile_image: resident.profile_image || resident.profileImage || "",
      created_at: resident.created_at || resident.createdAt || formatDateToday(),
      updated_at: resident.updated_at || resident.updatedAt || "",

      // Compatibility with old pages
      id: residentId,
      fullName: fullName,
      name: fullName,
      role: userType,
      university:
        userType === "student"
          ? resident.university_name || resident.university || ""
          : "",
      company:
        userType === "employee"
          ? resident.company_name || resident.company || ""
          : "",
      jobTitle:
        userType === "employee"
          ? resident.job_position || resident.jobTitle || ""
          : "",
      profileImage: resident.profile_image || resident.profileImage || "",
      createdAt: resident.created_at || resident.createdAt || formatDateToday(),
      updatedAt: resident.updated_at || resident.updatedAt || "",
    };
  };

  const saveResidentsData = (residents) => {
    const normalizedResidents = residents.map(normalizeResident);

    localStorage.setItem("residents", JSON.stringify(normalizedResidents));
    localStorage.setItem("users", JSON.stringify(normalizedResidents));
  };

  const getResidentsData = () => {
    const residents = JSON.parse(localStorage.getItem("residents"));
    const users = JSON.parse(localStorage.getItem("users"));

    if (residents && Array.isArray(residents)) {
      return residents.map(normalizeResident);
    }

    if (users && Array.isArray(users)) {
      const normalizedResidents = users.map(normalizeResident);
      saveResidentsData(normalizedResidents);
      return normalizedResidents;
    }

    return [];
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim().toLowerCase();
    const newPassword = event.target.newPassword.value.trim();
    const confirmPassword = event.target.confirmPassword.value.trim();

    if (!email || !newPassword || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    let residents = getResidentsData();

    const residentIndex = residents.findIndex((resident) => {
      return (resident.email || "").toLowerCase() === email;
    });

    if (residentIndex === -1) {
      alert("No account found with this email.");
      return;
    }

    residents[residentIndex] = normalizeResident({
      ...residents[residentIndex],
      password: newPassword,
      updated_at: formatDateToday(),
      updatedAt: formatDateToday(),
    });

    saveResidentsData(residents);

    alert("Password reset successfully. You can now login.");
    window.location.href = "/login";
  };

  return (
    <div className="login-wrapper">
      <div className="login-brand">
        <a href="/" className="brand-logo">
          <i className="fa-solid fa-building-user"></i>
          UniNest
        </a>

        <h1>Reset Password</h1>

        <p>
          Enter your registered email and create a new password to access your
          UniNest account again.
        </p>

        <div className="brand-features">
          <div>
            <i className="fa-solid fa-shield-halved"></i>
            <span>Secure account access</span>
          </div>

          <div>
            <i className="fa-solid fa-key"></i>
            <span>Reset your password easily</span>
          </div>

          <div>
            <i className="fa-solid fa-user-check"></i>
            <span>Continue managing your bookings</span>
          </div>
        </div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-page-header">
            <h2>Forgot Password</h2>
            <p>Reset your UniNest account password</p>
          </div>

          <form id="forgotPasswordForm" onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label htmlFor="email">Account Email</label>

              <div className="input-box">
                <i className="fa-solid fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>

              <div className="input-box">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>

              <div className="input-box">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button type="submit">
              <i className="fa-solid fa-key"></i>
              Reset Password
            </button>
          </form>

          <div className="login-links">
            <p>
              Remember your password?
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

export default ForgotPasswordPage;