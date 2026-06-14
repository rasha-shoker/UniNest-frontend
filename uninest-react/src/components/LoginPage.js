import "./LoginPage.css";

function LoginPage() {
  const getResidentFullName = (resident) => {
    const firstName = resident.first_name || resident.firstName || "";
    const lastName = resident.last_name || resident.lastName || "";

    const fullName = (firstName + " " + lastName).trim();

    return fullName || resident.fullName || resident.name || "Resident";
  };

  const getResidentsData = () => {
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

  const handleLogin = (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim().toLowerCase();
    const password = event.target.password.value.trim();

    if (!email || !password) {
      alert("Please fill all fields.");
      return;
    }

    if (email === "admin@uninest.com" && password === "123456") {
      localStorage.setItem("loggedInAdminId", "1");
      localStorage.setItem("loggedInUser", "Admin");
      localStorage.setItem("loggedInUserEmail", email);
      localStorage.setItem("loggedInRole", "admin");
      localStorage.setItem("loggedInUserType", "admin");

      localStorage.removeItem("loggedInResidentId");
      localStorage.removeItem("redirectAfterLogin");

      window.location.href = "/admin-dashboard";
      return;
    }

    const residents = getResidentsData();

    const resident = residents.find((item) => {
      return (item.email || "").toLowerCase() === email;
    });

    if (!resident) {
      alert("Account not found. Please register first.");
      return;
    }

    if (resident.status === "Inactive") {
      alert("Your account is inactive. Please contact the admin.");
      return;
    }

    if (resident.password !== password) {
      alert("Incorrect password. Please try again.");
      return;
    }

    const residentId = resident.resident_id || resident.id || "";
    const residentName = getResidentFullName(resident);
    const residentEmail = resident.email || email;
    const userType = (resident.user_type || resident.role || "student").toLowerCase();

    localStorage.setItem("loggedInResidentId", residentId);
    localStorage.setItem("loggedInUser", residentName);
    localStorage.setItem("loggedInUserEmail", residentEmail);
    localStorage.setItem("loggedInRole", userType);
    localStorage.setItem("loggedInUserType", userType);

    localStorage.removeItem("loggedInAdminId");

    if (shouldRedirectToBooking() && (userType === "student" || userType === "employee")) {
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

    if (userType === "student" || userType === "employee") {
      window.location.href = "/student-dashboard";
      return;
    }

    localStorage.setItem("loggedInRole", "student");
    localStorage.setItem("loggedInUserType", "student");
    window.location.href = "/student-dashboard";
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