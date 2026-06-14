import { useState } from "react";
import "./HousingDetailsPage.css";
import { housingsData } from "../data/housingsData";

function HousingDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const idFromUrl = params.get("id");
  const idFromStorage =
    localStorage.getItem("selectedDormId") ||
    localStorage.getItem("selectedHousingId");

  const dormId = Number(idFromUrl || idFromStorage);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDormImage = (imagePath) => {
    const path = imagePath || "images/aub1.jpg";
    const fileName = path.replace("images/", "");

    try {
      return require(`../assets/images/${fileName}`);
    } catch {
      return require("../assets/images/aub1.jpg");
    }
  };

  const normalizeDorm = (dorm) => {
    return {
      ...dorm,

      dorm_id: dorm.dorm_id || dorm.id,
      dorm_name: dorm.dorm_name || dorm.name || "Dorm Name",

      university_name: dorm.university_name || dorm.university || "",
      city: dorm.city || "",
      area: dorm.area || dorm.location || "",

      dorm_description: dorm.dorm_description || dorm.description || "",
      eligibility_requirements:
        dorm.eligibility_requirements ||
        dorm.eligibility ||
        "Available for students and employees",

      rating: dorm.rating || 0,

      image_url: dorm.image_url || dorm.image || dorm.housingImage || "images/aub1.jpg",
      images: dorm.images || [],

      dorm_type: dorm.dorm_type || dorm.type || "Dorm",
      gender: dorm.gender || "Male / Female",
      distance: dorm.distance || "Near campus",
      availability_status:
        dorm.availability_status || dorm.status || dorm.availability || "Available",

      main_room_type: dorm.main_room_type || dorm.roomType || "",
      base_price: dorm.base_price || dorm.price || 0,

      rooms: Array.isArray(dorm.rooms)
        ? dorm.rooms.map((room, index) => {
            return {
              ...room,
              room_id: room.room_id || room.roomId || `${dorm.dorm_id}-${index + 1}`,
              room_number:
                room.room_number || room.roomNumber || `R-${dorm.dorm_id}-${index + 1}`,
              room_type: room.room_type || room.type || dorm.main_room_type || "Room",
              room_capacity: Number(room.room_capacity || room.capacity || 1),
              occupancy_limit: Number(
                room.occupancy_limit ||
                  room.occupancyLimit ||
                  room.capacity ||
                  room.room_capacity ||
                  1
              ),
              room_price: Number(room.room_price || room.price || dorm.base_price || 0),
              availability_status:
                room.availability_status ||
                room.status ||
                dorm.availability_status ||
                "Available",
              available_from: room.available_from || room.availableFrom || "Not specified",
              available_to: room.available_to || room.availableTo || "Not specified",
              image_url: room.image_url || room.image || "",
              facilities: room.facilities || [],
            };
          })
        : [],

      facilities: dorm.facilities || [],
    };
  };

  const getDorms = () => {
    const savedDorms = JSON.parse(localStorage.getItem("dorms"));
    const savedHousings = JSON.parse(localStorage.getItem("housings"));

    if (savedDorms && Array.isArray(savedDorms)) {
      return savedDorms.map(normalizeDorm);
    }

    if (savedHousings && Array.isArray(savedHousings)) {
      return savedHousings.map(normalizeDorm);
    }

    return housingsData.map(normalizeDorm);
  };

  const dorms = getDorms();

  const dorm = dorms.find((item) => {
    return Number(item.dorm_id || item.id) === Number(dormId);
  });

  if (dorm) {
    localStorage.setItem("selectedDormId", dorm.dorm_id);
    localStorage.setItem("selectedHousingId", dorm.dorm_id);
  }

  const getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews")) || [];
  };

  const getVisibleReviewsForDorm = (currentDormId) => {
    const reviews = getReviews();

    return reviews.filter((review) => {
      const reviewDormId = Number(review.dorm_id || review.housingId || review.dormId);
      const reviewStatus = review.review_status || review.status || "Visible";

      return reviewDormId === Number(currentDormId) && reviewStatus !== "Hidden";
    });
  };

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, review) => {
      return sum + Number(review.rating || 0);
    }, 0);

    return (total / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const value = Math.round(Number(rating) || 0);

    return [1, 2, 3, 4, 5].map((star) => {
      if (star <= value) {
        return <i key={star} className="fa-solid fa-star star-filled"></i>;
      }

      return <i key={star} className="fa-regular fa-star star-empty"></i>;
    });
  };

  const getFacilityIcon = (facility) => {
    const text = String(facility).toLowerCase();

    if (text.includes("wi")) return "fa-wifi";
    if (text.includes("laundry")) return "fa-shirt";
    if (text.includes("kitchen")) return "fa-kitchen-set";
    if (text.includes("safe")) return "fa-shield-halved";
    if (text.includes("air")) return "fa-snowflake";
    if (text.includes("parking")) return "fa-square-parking";
    if (text.includes("study")) return "fa-book";

    return "fa-circle-check";
  };

  const isResidentLoggedInForBooking = () => {
    const role = localStorage.getItem("loggedInRole");
    const userType = localStorage.getItem("loggedInUserType") || role;
    const residentId = localStorage.getItem("loggedInResidentId");
    const email = localStorage.getItem("loggedInUserEmail");
    const user = localStorage.getItem("loggedInUser");

    return (
      (userType === "student" || userType === "employee") &&
      (residentId || email || user)
    );
  };

  const bookHousing = () => {
    if (!dorm) {
      alert("Dorm not found.");
      return;
    }

    const userType =
      localStorage.getItem("loggedInUserType") ||
      localStorage.getItem("loggedInRole");

    if (userType === "admin") {
      alert("Admin cannot submit booking requests.");
      return;
    }

    if (!isResidentLoggedInForBooking()) {
      localStorage.setItem("redirectAfterLogin", "booking");
      alert("Please login or register before booking.");
      window.location.href = "/login";
      return;
    }

    if (!selectedRoom) {
      alert("Please select an available room first.");
      return;
    }

    const residentName = localStorage.getItem("loggedInUser") || "";
    const residentId = localStorage.getItem("loggedInResidentId") || "";
    const email = localStorage.getItem("loggedInUserEmail") || "";

    const bookingId = Date.now();

    const pendingBooking = {
      booking_id: bookingId,

      resident_id: residentId,
      resident_name: residentName,
      email: email,

      dorm_id: dorm.dorm_id,
      dorm_name: dorm.dorm_name,
      dorm_image: dorm.image_url || "images/aub1.jpg",

      university_name: dorm.university_name || "",
      city: dorm.city || "",
      area: dorm.area || "",

      room_id: selectedRoom.room_id,
      room_number: selectedRoom.room_number,
      room_type: selectedRoom.room_type,
      room_price: Number(selectedRoom.room_price),

      available_from: selectedRoom.available_from,
      available_to: selectedRoom.available_to,

      check_in_date: "",
      check_out_date: "",
      total_price: 0,

      booking_status: "Pending",
      document_status: "Pending",
      payment_status: "Pending",

      created_at: formatDateToday(),

      id: bookingId,
      userName: residentName,
      studentName: residentName,
      residentName: residentName,

      userEmail: email,
      studentEmail: email,
      residentEmail: email,

      housingId: dorm.dorm_id,
      housingName: dorm.dorm_name,
      housingImage: dorm.image_url || "images/aub1.jpg",
      university: dorm.university_name || "",
      location: dorm.area || dorm.city || "",

      roomId: selectedRoom.room_id,
      roomNumber: selectedRoom.room_number,
      roomType: selectedRoom.room_type,
      price: Number(selectedRoom.room_price),

      availableFrom: selectedRoom.available_from,
      availableTo: selectedRoom.available_to,

      checkInDate: "",
      checkOutDate: "",
      totalCost: 0,

      status: "Pending",
      documentStatus: "Pending",
      paymentStatus: "Pending",
    };

    localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));

    window.location.href = "/booking";
  };

  if (!dorm) {
    return (
      <div className="housing-details-page">
        <header className="details-navbar">
  <div className="details-logo">
    <h2>UniNest</h2>
  </div>

  <nav>
    <ul className="details-nav-links">
      <li>
        <a href="/">Home</a>
      </li>

      <li>
        <a href="/housings" className="active">
          Dorms
        </a>
      </li>

      <li>
        <a href="/student-dashboard">Dashboard</a>
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
        >
          Logout
        </a>
      </li>
    </ul>
  </nav>
</header>

        <section className="details-page-header">
          <div className="details-page-header-content">
            <h1>Dorm Not Found</h1>
            <p>The dorm you are looking for does not exist.</p>
          </div>
        </section>
      </div>
    );
  }

  const dormReviews = getVisibleReviewsForDorm(dorm.dorm_id);
  const averageRating = calculateAverageRating(dormReviews);

  const galleryImages =
    dorm.images && dorm.images.length > 0
      ? dorm.images
      : [dorm.image_url, dorm.image_url, dorm.image_url];

  const displayedMainImage = mainImage || dorm.image_url || "images/aub1.jpg";

  return (
    <div className="housing-details-page">
      <header className="details-navbar">
  <div className="details-logo">
    <h2>UniNest</h2>
  </div>

  <nav>
    <ul className="details-nav-links">
      <li>
        <a href="/">Home</a>
      </li>

      <li>
        <a href="/housings" className="active">
          Dorms
        </a>
      </li>

      <li>
        <a href="/student-dashboard">Dashboard</a>
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
        >
          Logout
        </a>
      </li>
    </ul>
  </nav>
</header>

      <section className="details-page-header">
        <div className="details-page-header-content">
          <h1>{dorm.dorm_name || "Dorm Details"}</h1>
          <p>
            View dorm information, rooms, facilities, ratings, and reviews before
            booking.
          </p>
        </div>
      </section>

      <section className="housing-details-section">
        <div className="housing-details-container">
          <div className="housing-gallery">
            <div className="main-image">
              <img src={getDormImage(displayedMainImage)} alt={dorm.dorm_name} />
            </div>

            <div className="small-images">
              {galleryImages.map((image, index) => {
                const imagePath =
                  typeof image === "string"
                    ? image
                    : image.image_url || image.data || dorm.image_url;

                return (
                  <img
                    key={index}
                    src={getDormImage(imagePath)}
                    alt={dorm.dorm_name}
                    onClick={() => setMainImage(imagePath)}
                  />
                );
              })}
            </div>
          </div>

          <div className="housing-details-info">
            <span className="housing-badge">{dorm.dorm_type || "Dorm"}</span>

            <h2>{dorm.dorm_name}</h2>

            <p>
              <i className="fa-solid fa-location-dot"></i>
              <strong>Location:</strong> {dorm.area || dorm.city || "-"}
            </p>

            <p>
              <i className="fa-solid fa-school"></i>
              <strong>Near:</strong> {dorm.university_name || "Nearby university"}
            </p>

            <p>
              <i className="fa-solid fa-venus-mars"></i>
              <strong>Gender:</strong> {dorm.gender || "Male / Female"}
            </p>

            <p>
              <i className="fa-solid fa-route"></i>
              <strong>Distance:</strong> {dorm.distance || "Near campus"}
            </p>

            <p>
              <i className="fa-solid fa-circle-check"></i>
              <strong>Availability:</strong>{" "}
              {dorm.availability_status || "Available"}
            </p>

            <p>
              <i className="fa-solid fa-star"></i>
              <strong>Rating:</strong>{" "}
              <span className="rating-stars">
                {renderStars(dormReviews.length > 0 ? averageRating : dorm.rating)}
              </span>{" "}
              <span className="rating-number">
                {dormReviews.length > 0
                  ? `${averageRating} / 5 (${dormReviews.length} reviews)`
                  : `${dorm.rating || "0.0"} / 5 (0 reviews)`}
              </span>
            </p>

            <p>
              <i className="fa-solid fa-user-check"></i>
              <strong>Eligibility:</strong>{" "}
              {dorm.eligibility_requirements ||
                "Available for students and employees"}
            </p>

            <p className="housing-description">
              {dorm.dorm_description || "No description available."}
            </p>

            {!isResidentLoggedInForBooking() && (
              <div className="visitor-note">
                <i className="fa-solid fa-circle-info"></i>
                <span>
                  Visitors can view dorm details. Login or registration is
                  required to submit a booking request.
                </span>
              </div>
            )}

            <div className="room-types">
              <h3>Available Rooms</h3>

              {dorm.rooms && dorm.rooms.length > 0 ? (
                dorm.rooms.map((room) => {
                  const isFull = room.availability_status === "Full";
                  const isSelected =
                    selectedRoom && selectedRoom.room_id === room.room_id;

                  return (
                    <div className="room-box" key={room.room_id}>
                      <div>
                        {room.image_url && (
                          <img
                            src={getDormImage(room.image_url)}
                            alt="Room"
                            className="room-detail-image"
                          />
                        )}

                        <p>
                          <strong>{room.room_type}</strong>
                        </p>
                        <p>Room Number: {room.room_number}</p>
                        <p>Capacity: {room.room_capacity}</p>
                        <p>Occupancy Limit: {room.occupancy_limit}</p>
                        <p>
                          Status:{" "}
                          <span className={isFull ? "room-full" : "room-available"}>
                            {room.availability_status}
                          </span>
                        </p>
                        <p>Available From: {room.available_from}</p>
                        <p>Available To: {room.available_to}</p>
                        <p>
                          Facilities:{" "}
                          {room.facilities && room.facilities.length > 0
                            ? room.facilities.join(", ")
                            : "No room facilities listed"}
                        </p>
                      </div>

                      <div className="room-price-action">
                        <p>
                          <strong>${room.room_price} / month</strong>
                        </p>

                        <button
                          type="button"
                          className={
                            isFull
                              ? "select-room-btn disabled-room-btn"
                              : isSelected
                              ? "select-room-btn selected-room"
                              : "select-room-btn"
                          }
                          disabled={isFull}
                          onClick={() => setSelectedRoom(room)}
                        >
                          {isFull ? "Full" : isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No rooms available for this dorm.</p>
              )}
            </div>

            <div className="details-actions">
              <button type="button" className="btn primary-btn" onClick={bookHousing}>
                Book Selected Room
              </button>

              <a href="/housings" className="btn secondary-btn">
                Back to Dorms
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="facilities-section">
        <div className="section-title">
          <h2>Room Facilities</h2>
          <p>Facilities available in this dorm or its rooms.</p>
        </div>

        <div className="facilities-container">
          {dorm.facilities && dorm.facilities.length > 0 ? (
            dorm.facilities.map((facility) => (
              <div className="facility-box" key={facility}>
                <i className={`fa-solid ${getFacilityIcon(facility)}`}></i>
                <h3>{facility}</h3>
              </div>
            ))
          ) : (
            <div className="facility-box">
              <i className="fa-solid fa-circle-info"></i>
              <h3>No facilities listed</h3>
            </div>
          )}
        </div>
      </section>

      <section className="reviews-section">
        <div className="section-title">
          <h2>Resident Reviews</h2>
          <p>Read ratings and comments submitted by residents.</p>
        </div>

        <div className="reviews-container">
          {dormReviews.length === 0 ? (
            <div className="review-card">
              <div className="review-header">
                <h3>No reviews yet</h3>
                <span>
                  <i className="fa-solid fa-star"></i> 0.0 / 5
                </span>
              </div>
              <p>
                Be the first resident to review this dorm after completing a
                booking.
              </p>
            </div>
          ) : (
            dormReviews.map((review, index) => (
              <div className="review-card" key={index}>
                <div className="review-header">
                  <h3>
                    {review.resident_name ||
                      review.residentName ||
                      review.userName ||
                      "Resident"}
                  </h3>

                  <span className="review-stars">
                    {renderStars(review.rating)}
                    {review.rating} / 5
                  </span>
                </div>

                <p>{review.review_comment || review.comment || ""}</p>

                <small>
                  <i className="fa-solid fa-calendar-days"></i>{" "}
                  {review.created_at || review.createdAt || review.date || ""}
                </small>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="details-footer">
        <div className="details-footer-container">
          <div className="details-footer-box">
            <h3>UniNest</h3>
            <p>
              A modern dorm booking platform that helps students and employees
              find safe, comfortable, and affordable accommodation.
            </p>
          </div>

          <div className="details-footer-box">
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

          <div className="details-footer-box">
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

          <div className="details-footer-box">
            <h3>Follow Us</h3>
            <div className="details-social-icons">
              <a href="#" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="details-footer-bottom">
          <p>&copy; 2026 UniNest. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HousingDetailsPage;