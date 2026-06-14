import { useState } from "react";
import "./HousingsPage.css";
import { housingsData } from "../data/housingsData";

function HousingsPage() {
  const [university, setUniversity] = useState("");
  const [city, setCity] = useState("");
  const [roomType, setRoomType] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  
  const universityCities = {
    MU: ["Beirut"],
    LU: ["Hadath", "Fanar", "Ras Maska"],
    UA: ["Hadath", "Zahle", "Zgharta"],
    AUB: ["Beirut"],
    LAU: ["Beirut", "Byblos"],
    USJ: ["Beirut"],
  };

  const getDormImage = (dorm) => {
    const imagePath = dorm.image_url || dorm.image || dorm.housingImage || "images/aub1.jpg";
    const fileName = imagePath.replace("images/", "");

    try {
      return require(`../assets/images/${fileName}`);
    } catch {
      return require("../assets/images/aub1.jpg");
    }
  };

  const normalizeRoomType = (roomTypeValue) => {
    if (!roomTypeValue) return "";

    const value = String(roomTypeValue).trim().toLowerCase();

    if (value === "single" || value === "single room") return "Single Room";
    if (value === "double" || value === "double room") return "Double Room";
    if (value === "triple" || value === "triple room") return "Triple Room";
    if (value === "shared" || value === "shared room") return "Shared Room";
    if (value === "studio") return "Studio";
    if (value === "apartment") return "Apartment";

    return roomTypeValue;
  };

  const normalizeDorm = (dorm) => {
    return {
      ...dorm,

      dorm_id: dorm.dorm_id || dorm.id,
      dorm_name: dorm.dorm_name || dorm.name || "Dorm Name",

      university_name: dorm.university_name || dorm.university || "",
      city: dorm.city || "",
      area: dorm.area || dorm.location || "",

      image_url: dorm.image_url || dorm.image || dorm.housingImage || "images/aub1.jpg",

      availability_status:
        dorm.availability_status || dorm.status || dorm.availability || "Available",

      main_room_type: dorm.main_room_type || dorm.roomType || "",
      base_price: dorm.base_price || dorm.price || 0,

      rooms: Array.isArray(dorm.rooms)
        ? dorm.rooms.map((room) => {
            return {
              ...room,
              room_id: room.room_id || room.roomId,
              dorm_id: room.dorm_id || dorm.dorm_id || dorm.id,
              room_type: room.room_type || room.type || "",
              room_price: Number(room.room_price || room.price || 0),
              availability_status: room.availability_status || room.status || "Available",
            };
          })
        : [],

      facilities: dorm.facilities || [],
    };
  };

  const getDorms = () => {
  const savedDorms = JSON.parse(localStorage.getItem("dorms")) || [];
  const savedHousings = JSON.parse(localStorage.getItem("housings")) || [];
  const defaultDorms = housingsData || [];

  const allDorms = [
    ...defaultDorms,
    ...savedDorms,
    ...savedHousings,
  ].map(normalizeDorm);

  const uniqueDorms = [];

  allDorms.forEach((dorm) => {
    const dormId = String(dorm.dorm_id || dorm.id);

    const alreadyExists = uniqueDorms.some((item) => {
      return String(item.dorm_id || item.id) === dormId;
    });

    if (!alreadyExists) {
      uniqueDorms.push(dorm);
    }
  });

  localStorage.setItem("dorms", JSON.stringify(uniqueDorms));
  localStorage.setItem("housings", JSON.stringify(uniqueDorms));

  return uniqueDorms;
};

  const getStartingPrice = (dorm) => {
    const rooms = Array.isArray(dorm.rooms) ? dorm.rooms : [];

    if (rooms.length > 0) {
      const prices = rooms
        .map((room) => Number(room.room_price || room.price || 0))
        .filter((price) => price > 0);

      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }

    return Number(dorm.base_price || dorm.price || 0);
  };

  const dormMatchesRoomType = (dorm, selectedRoomType) => {
    const mainRoomType = normalizeRoomType(dorm.main_room_type || dorm.room_type || "");

    if (mainRoomType === selectedRoomType) {
      return true;
    }

    const rooms = Array.isArray(dorm.rooms) ? dorm.rooms : [];

    return rooms.some((room) => {
      return normalizeRoomType(room.room_type || room.type || "") === selectedRoomType;
    });
  };

  const dormMatchesPriceRange = (dorm, min, max) => {
    const rooms = Array.isArray(dorm.rooms) ? dorm.rooms : [];

    if (rooms.length > 0) {
      return rooms.some((room) => {
        const price = Number(room.room_price || room.price || 0);

        if (price <= 0) return false;
        if (min > 0 && price < min) return false;
        if (max > 0 && price > max) return false;

        return true;
      });
    }

    const price = getStartingPrice(dorm);

    if (min > 0 && price < min) return false;
    if (max > 0 && price > max) return false;

    return true;
  };

  const getFilteredDorms = () => {
    let dorms = getDorms();

    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (university) {
      dorms = dorms.filter((dorm) => dorm.university_name === university);
    }

    if (city) {
      dorms = dorms.filter((dorm) => dorm.city === city || dorm.area === city);
    }

    if (roomType) {
      dorms = dorms.filter((dorm) => dormMatchesRoomType(dorm, roomType));
    }

    if (status) {
      dorms = dorms.filter((dorm) => dorm.availability_status === status);
    }

    if (min > 0 || max > 0) {
      dorms = dorms.filter((dorm) => dormMatchesPriceRange(dorm, min, max));
    }

    return dorms;
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (min > 0 && max > 0 && min > max) {
      alert("Minimum price cannot be greater than maximum price.");
    }
  };

  const viewDetails = (dormId) => {
    localStorage.setItem("selectedDormId", dormId);
    localStorage.setItem("selectedHousingId", dormId);

    window.location.href = `/housing-details?id=${dormId}`;
  };

  const handleUniversityChange = (event) => {
    setUniversity(event.target.value);
    setCity("");
  };

  const filteredDorms = getFilteredDorms();
  const cities = university ? universityCities[university] || [] : [];

  return (
    <div className="housings-page">
      <header className="housings-navbar">
  <div className="housings-logo">
    <h2>UniNest</h2>
  </div>

  <nav>
    <ul className="housings-nav-links">
      <li>
        <a href="/">Home</a>
      </li>

      <li>
        <a href="/housings" className="active">
          Dorms
        </a>
      </li>

      <li>
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();

            localStorage.removeItem("loggedInRole");
            localStorage.removeItem("loggedInUserType");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("loggedInUserEmail");
            localStorage.removeItem("loggedInUserId");
            localStorage.removeItem("loggedInResidentId");

            window.location.href = "/";
          }}
          className="housings-login-link"
        >
          Login
        </a>
      </li>
    </ul>
  </nav>
</header>

      <section className="housings-page-header">
        <div className="housings-page-header-content">
          <h1>Explore Student Dorms</h1>
          <p>
            Browse safe, comfortable, and affordable dorms near top universities
            in Lebanon.
          </p>
        </div>
      </section>

      <section className="housing-filter-section">
        <div className="filter-box">
          <h2>Find Your Ideal Dorm</h2>

          <form className="filter-form" onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="university">University</label>
              <select id="university" value={university} onChange={handleUniversityChange}>
                <option value="">All Universities</option>
                <option value="MU">MU</option>
                <option value="LU">LU</option>
                <option value="UA">UA</option>
                <option value="AUB">AUB</option>
                <option value="LAU">LAU</option>
                <option value="USJ">USJ</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="city">City / Location</label>
              <select id="city" value={city} onChange={(event) => setCity(event.target.value)}>
                <option value="">All Cities</option>
                {cities.map((cityName) => (
                  <option value={cityName} key={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="roomTypeFilter">Room Type</label>
              <select
                id="roomTypeFilter"
                value={roomType}
                onChange={(event) => setRoomType(event.target.value)}
              >
                <option value="">All Room Types</option>
                <option value="Single Room">Single Room</option>
                <option value="Double Room">Double Room</option>
                <option value="Triple Room">Triple Room</option>
                <option value="Shared Room">Shared Room</option>
                <option value="Studio">Studio</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Availability</label>
              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All</option>
                <option value="Available">Available</option>
                <option value="Full">Full</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="minPrice">Min Price</label>
              <input
                type="number"
                id="minPrice"
                placeholder="Example: 100"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxPrice">Max Price</label>
              <input
                type="number"
                id="maxPrice"
                placeholder="Example: 300"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>

            <div className="form-group search-btn-group">
              <button type="submit" className="btn primary-btn">
                Search Now
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="available-housings-section">
        <div className="section-title">
          <h2>Available Dorms</h2>
          <p>Choose a dorm and view its details before booking.</p>
        </div>

        {filteredDorms.length === 0 ? (
          <div className="empty-housings-message">
            <h3>No dorms found</h3>
            <p>Try changing your search filters.</p>
          </div>
        ) : (
          <div className="available-housings-grid">
            {filteredDorms.map((dorm) => {
              const dormId = dorm.dorm_id;
              const dormName = dorm.dorm_name || "Dorm Name";
              const location = dorm.area || dorm.city || "-";
              const universityName = dorm.university_name || "-";
              const startingPrice = getStartingPrice(dorm);
              const availabilityStatus = dorm.availability_status || "Available";
              const displayRoomType = normalizeRoomType(
                dorm.main_room_type ||
                  (dorm.rooms && dorm.rooms[0] ? dorm.rooms[0].room_type : "") ||
                  "-"
              );
              const facilities = dorm.facilities || [];

              return (
                <div className="housings-card" key={dormId}>
                  <img src={getDormImage(dorm)} alt={dormName} />

                  <div className="housings-info">
                    <div className="housings-title-row">
                      <h3>{dormName}</h3>
                      <span
                        className={
                          availabilityStatus === "Available"
                            ? "housings-status available"
                            : "housings-status full"
                        }
                      >
                        {availabilityStatus}
                      </span>
                    </div>

                    <p>
                      <i className="fa-solid fa-location-dot"></i>
                      {location}
                    </p>

                    <p>
                      <i className="fa-solid fa-school"></i>
                      {universityName}
                    </p>

                    <p>
                      <i className="fa-solid fa-bed"></i>
                      {displayRoomType}
                    </p>

                    <p>
                      <i className="fa-solid fa-dollar-sign"></i>
                      Starting from ${startingPrice}/month
                    </p>

                    <div className="housings-facilities">
                      {facilities.slice(0, 3).map((facility) => (
                        <span key={facility}>{facility}</span>
                      ))}
                    </div>

                    <button
                      className="housings-card-btn"
                      onClick={() => viewDetails(dormId)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="housings-why-section">
        <div className="section-title">
          <h2>What Makes Our Dorms Special?</h2>
          <p>
            Each dorm option is selected to offer comfort, security, and
            convenience.
          </p>
        </div>

        <div className="housings-features-container">
          <div className="housings-feature-box">
            <i className="fa-solid fa-shield-halved"></i>
            <h3>Safe Environment</h3>
            <p>
              All listed accommodations prioritize resident safety and secure
              living conditions.
            </p>
          </div>

          <div className="housings-feature-box">
            <i className="fa-solid fa-wifi"></i>
            <h3>Modern Facilities</h3>
            <p>
              Enjoy services like Wi-Fi, study areas, laundry rooms, and shared
              kitchens.
            </p>
          </div>

          <div className="housings-feature-box">
            <i className="fa-solid fa-map-location-dot"></i>
            <h3>Prime Locations</h3>
            <p>
              Stay close to your university or workplace and save transportation
              time.
            </p>
          </div>

          <div className="housings-feature-box">
            <i className="fa-solid fa-wallet"></i>
            <h3>Affordable Prices</h3>
            <p>
              Find options that fit different budgets without sacrificing
              comfort.
            </p>
          </div>
        </div>
      </section>

      <footer className="housings-footer">
        <div className="housings-footer-container">
          <div className="housings-footer-box">
            <h3>UniNest</h3>
            <p>
              A modern dorm booking platform that helps students and employees
              find safe, comfortable, and affordable accommodation.
            </p>
          </div>

          <div className="housings-footer-box">
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

          <div className="housings-footer-box">
            <h3>Contact Info</h3>
            <p>
              <i className="fa-solid fa-envelope"></i> support@uninest.com
            </p>
            <p>
              <i className="fa-solid fa-phone"></i> +961 70 123 456
            </p>
            <p>
              <i className="fa-solid fa-location-dot"></i> Beirut, Lebanon
            </p>
          </div>

          <div className="housings-footer-box">
            <h3>Follow Us</h3>
            <div className="housings-social-icons">
              <a href="#">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="housings-footer-bottom">
          <p>&copy; 2026 UniNest. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HousingsPage;