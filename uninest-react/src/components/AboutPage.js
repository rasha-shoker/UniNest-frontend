import { Link, useNavigate } from "react-router-dom";
import "./AboutPage.css";

function AboutPage() {
  const navigate = useNavigate();

  const role = localStorage.getItem("loggedInRole");
  const userType = localStorage.getItem("loggedInUserType") || role;

  const isLoggedIn = role || userType;
  const isStudentOrEmployee = userType === "student" || userType === "employee";

  const logout = (event) => {
    event.preventDefault();

    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUserType");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    localStorage.removeItem("loggedInUserId");
    localStorage.removeItem("loggedInResidentId");

    navigate("/");
  };

  return (
    <>
      <header className="about-navbar">
        <Link to="/" className="about-logo">
          UniNest
        </Link>

        <nav>
          <ul className="about-nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>


            <li>
              <Link to="/about" className="active">
                About
              </Link>
            </li>

            {isLoggedIn ? (
              <li>
                <button type="button" onClick={logout} className="about-logout-link">
                      Logout
                </button>
              </li>
            ) : (
              <li>
                <Link to="/login" className="login-link">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <section className="about-hero">
        <div className="hero-content">
          <span className="hero-badge">About UniNest</span>

          <h1>Your Trusted Student Housing Platform</h1>

          <p>
            UniNest helps students and employees find safe, comfortable, and
            affordable accommodation near universities in Lebanon.
          </p>
        </div>
      </section>

      <section className="about">
        <div className="about-text">
          <h2>Who We Are</h2>

          <p>
            UniNest is a modern housing platform created to make the dorm search
            process easier, safer, and more organized. Users can browse
            available dorms, book rooms, track payments, submit maintenance
            requests, and share reviews.
          </p>
        </div>

        <div className="features">
          <div className="box">
            <i className="fa-solid fa-house"></i>
            <h3>Safe Housing</h3>
            <p>
              We provide organized dorm listings with clear room details,
              prices, and availability.
            </p>
          </div>

          <div className="box">
            <i className="fa-solid fa-location-dot"></i>
            <h3>Best Locations</h3>
            <p>
              Students can find housing options near their universities and
              preferred cities.
            </p>
          </div>

          <div className="box">
            <i className="fa-solid fa-dollar-sign"></i>
            <h3>Affordable Options</h3>
            <p>
              UniNest helps users compare prices and choose accommodation based
              on their budget.
            </p>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <div className="mission-card">
          <i className="fa-solid fa-bullseye"></i>
          <h2>Our Mission</h2>
          <p>
            Our mission is to simplify student housing management by connecting
            residents with suitable dorms, while giving administrators tools to
            manage bookings, payments, reviews, and maintenance requests.
          </p>
        </div>

        <div className="mission-card">
          <i className="fa-solid fa-eye"></i>
          <h2>Our Vision</h2>
          <p>
            UniNest aims to become a reliable digital platform for university
            housing, improving the experience for both residents and dorm
            administrators.
          </p>
        </div>
      </section>

      <section className="why-section">
        <h2>Why Choose UniNest?</h2>

        <div className="why-grid">
          <div>
            <i className="fa-solid fa-bed"></i>
            <span>Easy dorm booking</span>
          </div>

          <div>
            <i className="fa-solid fa-credit-card"></i>
            <span>Payment tracking</span>
          </div>

          <div>
            <i className="fa-solid fa-screwdriver-wrench"></i>
            <span>Maintenance requests</span>
          </div>

          <div>
            <i className="fa-solid fa-star"></i>
            <span>Resident reviews</span>
          </div>
        </div>
      </section>

      <footer className="about-footer">
        <p>&copy; 2026 UniNest. All rights reserved.</p>
      </footer>
    </>
  );
}

export default AboutPage;