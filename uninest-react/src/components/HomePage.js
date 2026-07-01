import { useEffect, useState } from "react";
import "./HomePage.css";
import heroImage from "../assets/images/hero-student-housing.jpg";
import { getDorms, API_BASE_URL } from "../api";

function HomePage() {
  const [featuredDorms, setFeaturedDorms] = useState([]);
  const [loadingDorms, setLoadingDorms] = useState(true);

  useEffect(() => {
    getDorms()
      .then((data) => {
        const dormsList = Array.isArray(data) ? data : data.data || [];
        setFeaturedDorms(dormsList.slice(0, 3));
        setLoadingDorms(false);
      })
      .catch((error) => {
        console.error("Failed to load dorms:", error);
        setFeaturedDorms([]);
        setLoadingDorms(false);
      });
  }, []);

  const getDormImage = (dorm) => {
    const imagePath =
      dorm.image_url ||
      dorm.images?.[0]?.image_url ||
      dorm.image ||
      dorm.housingImage ||
      "images/aub1.jpg";

    const imagePathString = String(imagePath);

    if (imagePathString.startsWith("http")) {
      return imagePathString;
    }

    if (
      imagePathString.startsWith("/storage") ||
      imagePathString.startsWith("storage")
    ) {
      return `${API_BASE_URL}/${imagePathString.replace(/^\/+/, "")}`;
    }

    const fileName = imagePathString.replace("images/", "");

    try {
      return require(`../assets/images/${fileName}`);
    } catch {
      return require("../assets/images/aub1.jpg");
    }
  };

  const getStartingPrice = (dorm) => {
    const rooms = dorm.rooms || [];

    if (rooms.length > 0) {
      const prices = rooms
        .map((room) => Number(room.room_price || 0))
        .filter((price) => !isNaN(price) && price > 0);

      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }

    return Number(dorm.base_price || dorm.price || 0);
  };

  return (
    <>
      <header className="navbar">
        <div className="logo">
          <h2>UniNest</h2>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <a href="/" className="active">
                Home
              </a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a href="/register" className="register-btn">
                Register
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1>Find the Perfect Dorm Room for Your Stay</h1>

          <p>
            UniNest helps students and employees browse available dorms, compare
            room types, prices, facilities, ratings, and submit booking requests
            after registration.
          </p>

          <div className="visitor-note">
            <i className="fa-solid fa-circle-info"></i>
            <span>
              Visitors can browse dorms freely. Login or registration is
              required only for booking rooms, making payments, submitting
              reviews, and sending maintenance requests.
            </span>
          </div>

          <div className="hero-buttons">
            <a href="/housings" className="btn primary-btn">
              Browse Dorms
            </a>
            <a href="/register" className="btn secondary-btn">
              Create Account
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img src={heroImage} alt="Dorm Room" />
        </div>
      </section>

      <section className="featured-housings">
        <div className="section-title">
          <h2>Featured Dorms</h2>
          <p>
            Discover popular dorms with room types, prices, ratings, and
            facilities.
          </p>
        </div>

        {loadingDorms ? (
          <p>Loading featured dorms...</p>
        ) : featuredDorms.length === 0 ? (
          <p>No featured dorms available yet.</p>
        ) : (
          <div className="housing-cards">
            {featuredDorms.map((dorm) => {
              const dormId = dorm.dorm_id;
              const dormName = dorm.dorm_name || "Dorm Name";
              const city = dorm.city || "Not specified";
              const area = dorm.area || "";
              const rating = dorm.rating || "Not rated";
              const startingPrice = getStartingPrice(dorm);

              return (
                <div className="housing-card" key={dormId}>
                  <img src={getDormImage(dorm)} alt={dormName} />

                  <div className="housing-info">
                    <h3>{dormName}</h3>

                    <p>
                      <i className="fa-solid fa-location-dot"></i>
                      {city}
                      {area ? ` - ${area}` : ""}, Lebanon
                    </p>

                    <p>
                      <i className="fa-solid fa-circle-info"></i>
                      {dorm.eligibility_requirements ||
                        "Eligibility not specified"}
                    </p>

                    <p>
                      <i className="fa-solid fa-star"></i>
                      {rating} / 5 rating
                    </p>

                    <p>
                      <i className="fa-solid fa-dollar-sign"></i>
                      {startingPrice > 0
                        ? `Starting from $${startingPrice}/month`
                        : "Price not available"}
                    </p>

                    <a
                      href={`/housing-details?id=${dormId}`}
                      className="card-btn"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="why-choose-us">
        <div className="section-title">
          <h2>Why Choose UniNest?</h2>
          <p>
            We make dorm search, booking, and stay management easier and more
            reliable.
          </p>
        </div>

        <div className="features-container">
          <div className="feature-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <h3>Easy Search</h3>
            <p>Search dorms by location, room type, and price range.</p>
          </div>

          <div className="feature-box">
            <i className="fa-solid fa-bed"></i>
            <h3>Room Details</h3>
            <p>
              View room types, capacity, prices, facilities, and availability
              before booking.
            </p>
          </div>

          <div className="feature-box">
            <i className="fa-solid fa-calendar-check"></i>
            <h3>Online Booking</h3>
            <p>
              Submit booking requests with check-in and check-out dates after
              registration.
            </p>
          </div>

          <div className="feature-box">
            <i className="fa-solid fa-screwdriver-wrench"></i>
            <h3>Maintenance Support</h3>
            <p>
              Residents can submit and track maintenance requests during their
              stay.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-title">
          <h2>How It Works</h2>
          <p>Find and manage your dorm stay in a few simple steps.</p>
        </div>

        <div className="steps-container">
          <div className="step-box">
            <span>01</span>
            <h3>Browse</h3>
            <p>Visitors can browse available dorms without logging in.</p>
          </div>

          <div className="step-box">
            <span>02</span>
            <h3>Compare</h3>
            <p>
              Compare location, room types, facilities, prices, ratings, and
              reviews.
            </p>
          </div>

          <div className="step-box">
            <span>03</span>
            <h3>Register</h3>
            <p>Create an account as a student or employee to request a booking.</p>
          </div>

          <div className="step-box">
            <span>04</span>
            <h3>Book & Manage</h3>
            <p>
              Book a room, upload documents, view payments, and manage
              maintenance requests.
            </p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-box">
          <h3>200+</h3>
          <p>Residents Served</p>
        </div>

        <div className="stat-box">
          <h3>10+</h3>
          <p>Dorm Options</p>
        </div>

        <div className="stat-box">
          <h3>30+</h3>
          <p>Rooms Available</p>
        </div>

        <div className="stat-box">
          <h3>24/7</h3>
          <p>Support Service</p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-box">
            <h3>UniNest</h3>
            <p>
              A modern dorm booking platform that helps students and employees
              find safe, comfortable, and affordable accommodation.
            </p>
          </div>

          <div className="footer-box">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/housings">Dorms</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
            </ul>
          </div>

          <div className="footer-box">
            <h3>Contact Info</h3>
            <p>
              <i className="fa-solid fa-envelope"></i> support@uninest.com
            </p>
            <p>
              <i className="fa-solid fa-phone"></i> +961 76 741 699
            </p>
            <p>
              <i className="fa-solid fa-phone"></i> +961 81 894 380
            </p>
          </div>

          <div className="footer-box">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 UniNest. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default HomePage;