import { useEffect, useState } from "react";
import "./HousingDetailsPage.css";
import { getDorm, API_BASE_URL } from "../api";

function HousingDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const idFromUrl = params.get("id");
  const idFromStorage = localStorage.getItem("selectedDormId");

  const dormId = Number(idFromUrl || idFromStorage);

  const [dorm, setDorm] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!dormId) {
      setError("Dorm ID is missing.");
      setLoading(false);
      return;
    }

    loadDormDetails();
  }, [dormId]);

  const loadDormDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDorm(dormId);

      const dormData =
        response && response.data && response.data.dorm_id
          ? response.data
          : response;

      if (!dormData || !dormData.dorm_id) {
        setError("Dorm not found.");
        setLoading(false);
        return;
      }

      const normalizedDorm = normalizeDorm(dormData);

      setDorm(normalizedDorm);
      localStorage.setItem("selectedDormId", normalizedDorm.dorm_id);
      localStorage.setItem("selectedHousingId", normalizedDorm.dorm_id);

      if (normalizedDorm.image_url) {
        setMainImage(normalizedDorm.image_url);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load dorm details:", error);
      setError("Could not load dorm details from the backend.");
      setLoading(false);
    }
  };

  const getImageSource = (imageInput) => {
    let imagePath = "";

    if (typeof imageInput === "string") {
      imagePath = imageInput;
    } else if (imageInput && typeof imageInput === "object") {
      imagePath =
        imageInput.image_url ||
        imageInput.image ||
        imageInput.housingImage ||
        imageInput.data ||
        "";
    }

    if (!imagePath) {
      imagePath = "images/aub1.jpg";
    }

    const imagePathString = String(imagePath);

    if (imagePathString.startsWith("data:")) {
      return imagePathString;
    }

    if (imagePathString.startsWith("http")) {
      return imagePathString;
    }

    if (
      imagePathString.startsWith("/storage") ||
      imagePathString.startsWith("storage")
    ) {
      return `${BACKEND_BASE_URL}/${imagePathString.replace(/^\/+/, "")}`;
    }

    if (
      imagePathString.startsWith("/uploads") ||
      imagePathString.startsWith("uploads")
    ) {
      return `${BACKEND_BASE_URL}/${imagePathString.replace(/^\/+/, "")}`;
    }

    const fileName = imagePathString.replace("images/", "");

    try {
      return require(`../assets/images/${fileName}`);
    } catch {
      try {
        return require("../assets/images/aub1.jpg");
      } catch {
        return "";
      }
    }
  };

  const getRawImageUrl = (imageInput) => {
    if (!imageInput) return "";

    if (typeof imageInput === "string") {
      return imageInput;
    }

    return (
      imageInput.image_url ||
      imageInput.image ||
      imageInput.housingImage ||
      imageInput.data ||
      ""
    );
  };

  const getFacilityName = (facility) => {
    if (typeof facility === "string") {
      return facility;
    }

    return (
      facility.facility_name ||
      facility.name ||
      facility.room_facility_name ||
      facility.facility?.facility_name ||
      facility.facility?.name ||
      "Facility"
    );
  };

  const getAllFacilities = (dormData, rooms) => {
    const facilities = [];

    if (Array.isArray(dormData.facilities)) {
      dormData.facilities.forEach((facility) => {
        const name = getFacilityName(facility);
        if (name && !facilities.find((item) => item.name === name)) {
          facilities.push({
            id: facility.facility_id || facility.id || name,
            name,
          });
        }
      });
    }

    rooms.forEach((room) => {
      if (Array.isArray(room.facilities)) {
        room.facilities.forEach((facility) => {
          const name = getFacilityName(facility);
          if (name && !facilities.find((item) => item.name === name)) {
            facilities.push({
              id: facility.facility_id || facility.id || name,
              name,
            });
          }
        });
      }
    });

    return facilities;
  };

  const normalizeRoom = (room) => {
    const currentOccupancy = Number(room.current_occupancy || 0);
    const occupancyLimit = Number(
      room.occupancy_limit || room.room_capacity || 0
    );

    let availabilityStatus = room.availability_status || "available";

    if (occupancyLimit > 0 && currentOccupancy >= occupancyLimit) {
      availabilityStatus = "full";
    }

    const roomImages = Array.isArray(room.images) ? room.images : [];

    return {
      ...room,
      room_id: room.room_id,
      dorm_id: room.dorm_id,
      room_number: room.room_number || "-",
      room_type: room.room_type || "Room",
      room_capacity: Number(room.room_capacity || 1),
      current_occupancy: currentOccupancy,
      occupancy_limit: occupancyLimit,
      room_price: Number(room.room_price || 0),
      availability_status: availabilityStatus,
      image_url:
        room.image_url ||
        getRawImageUrl(roomImages[0]) ||
        "",
      images: roomImages,
      facilities: Array.isArray(room.facilities) ? room.facilities : [],
    };
  };

  const normalizeReview = (review) => {
    const resident = review.resident || {};

    return {
      ...review,
      review_id: review.review_id || review.id,
      resident_id: review.resident_id || resident.resident_id || "",
      resident_name:
        resident.full_name ||
        resident.user?.full_name ||
        review.resident_name ||
        "Resident",
      rating: Number(review.rating || 0),
      review_comment: review.review_comment || review.comment || "",
      created_at: review.created_at || "",
      review_status: review.review_status || review.status || "visible",
    };
  };

  const normalizeDorm = (dormData) => {
    const rooms = Array.isArray(dormData.rooms) ? dormData.rooms : [];
    const images = Array.isArray(dormData.images) ? dormData.images : [];
    const reviews = Array.isArray(dormData.reviews) ? dormData.reviews : [];

    const normalizedRooms = rooms.map(normalizeRoom);

    const visibleReviews = reviews
      .map(normalizeReview)
      .filter((review) => {
        return String(review.review_status || "visible").toLowerCase() !== "hidden";
      });

    const mainImage =
      dormData.image_url ||
      getRawImageUrl(images[0]) ||
      "images/aub1.jpg";

    return {
      ...dormData,
      dorm_id: dormData.dorm_id,
      dorm_name: dormData.dorm_name || "Dorm Name",
      city: dormData.city || "",
      area: dormData.area || "",
      street: dormData.street || "",
      building_number: dormData.building_number || "",
      gps_location: dormData.gps_location || "",
      dorm_description: dormData.dorm_description || "",
      eligibility_requirements:
        dormData.eligibility_requirements ||
        "Available for students and employees",
      contact_email: dormData.contact_email || "",
      contact_phone: dormData.contact_phone || "",
      rating: Number(dormData.rating || 0),
      admin_id: dormData.admin_id || "",
      image_url: mainImage,
      images,
      reviews: visibleReviews,
      rooms: normalizedRooms,
      facilities: getAllFacilities(dormData, normalizedRooms),
    };
  };

  const getDormAvailability = (currentDorm) => {
    const rooms = Array.isArray(currentDorm.rooms) ? currentDorm.rooms : [];

    if (rooms.length === 0) {
      return "No Rooms";
    }

    const hasAvailableRoom = rooms.some((room) => {
      return !isRoomFull(room);
    });

    return hasAvailableRoom ? "Available" : "Full";
  };

  const isRoomFull = (room) => {
    const status = String(room.availability_status || "").toLowerCase();

    if (status.includes("full") || status.includes("unavailable")) {
      return true;
    }

    const currentOccupancy = Number(room.current_occupancy || 0);
    const occupancyLimit = Number(room.occupancy_limit || room.room_capacity || 0);

    return occupancyLimit > 0 && currentOccupancy >= occupancyLimit;
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;

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
    const text = String(getFacilityName(facility)).toLowerCase();

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

    if (!selectedRoom) {
      alert("Please select an available room first.");
      return;
    }

    if (isRoomFull(selectedRoom)) {
      alert("This room is full. Please select another room.");
      return;
    }

    if (!isResidentLoggedInForBooking()) {
      localStorage.setItem("redirectAfterLogin", "booking");

      const visitorPendingBooking = buildPendingBooking("", "", "");
      localStorage.setItem("pendingBooking", JSON.stringify(visitorPendingBooking));

      alert("Please login or register before booking.");
      window.location.href = "/login";
      return;
    }

    const residentName = localStorage.getItem("loggedInUser") || "";
    const residentId = localStorage.getItem("loggedInResidentId") || "";
    const email = localStorage.getItem("loggedInUserEmail") || "";

    const pendingBooking = buildPendingBooking(residentId, residentName, email);

    localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
    window.location.href = "/booking";
  };

  const buildPendingBooking = (residentId, residentName, email) => {
    const bookingId = Date.now();

    return {
      booking_id: bookingId,
      resident_id: residentId,
      room_id: selectedRoom.room_id,
      check_in_date: "",
      check_out_date: "",
      total_price: 0,
      booking_status: "pending",
      admin_note: "",
      created_at: formatDateToday(),
      admin_id: dorm.admin_id || "",

      resident_name: residentName,
      email: email,

      dorm_id: dorm.dorm_id,
      dorm_name: dorm.dorm_name,
      dorm_image: dorm.image_url || "images/aub1.jpg",
      city: dorm.city || "",
      area: dorm.area || "",

      room_number: selectedRoom.room_number,
      room_type: selectedRoom.room_type,
      room_price: Number(selectedRoom.room_price || 0),

      document_status: "pending",
      payment_status: "pending",

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
      location: dorm.area || dorm.city || "",

      roomId: selectedRoom.room_id,
      roomNumber: selectedRoom.room_number,
      roomType: selectedRoom.room_type,
      price: Number(selectedRoom.room_price || 0),

      checkInDate: "",
      checkOutDate: "",
      totalCost: 0,

      status: "pending",
      documentStatus: "pending",
      paymentStatus: "pending",
    };
  };

  const logout = (event) => {
    event.preventDefault();

    localStorage.removeItem("loggedInAdminId");
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUserType");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    localStorage.removeItem("loggedInUserId");
    localStorage.removeItem("loggedInResidentId");

    window.location.href = "/";
  };

  if (loading) {
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
            </ul>
          </nav>
        </header>

        <section className="details-page-header">
          <div className="details-page-header-content">
            <h1>Loading Dorm Details...</h1>
            <p>Please wait while we load the dorm information.</p>
          </div>
        </section>
      </div>
    );
  }

  if (error || !dorm) {
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
                <a href="/login">Login</a>
              </li>
            </ul>
          </nav>
        </header>

        <section className="details-page-header">
          <div className="details-page-header-content">
            <h1>Dorm Not Found</h1>
            <p>{error || "The dorm you are looking for does not exist."}</p>
            <p>Make sure Laravel is running on http://127.0.0.1:8000.</p>
          </div>
        </section>
      </div>
    );
  }

  const dormReviews = Array.isArray(dorm.reviews) ? dorm.reviews : [];
  const averageRating = calculateAverageRating(dormReviews);

  const galleryImages =
    dorm.images && dorm.images.length > 0
      ? dorm.images
      : [dorm.image_url, dorm.image_url, dorm.image_url];

  const displayedMainImage = mainImage || dorm.image_url || "images/aub1.jpg";
  const dormAvailability = getDormAvailability(dorm);

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
              <a href="/" onClick={logout}>
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
              <img src={getImageSource(displayedMainImage)} alt={dorm.dorm_name} />
            </div>

            <div className="small-images">
              {galleryImages.map((image, index) => {
                return (
                  <img
                    key={index}
                    src={getImageSource(image)}
                    alt={dorm.dorm_name}
                    onClick={() => setMainImage(getRawImageUrl(image))}
                  />
                );
              })}
            </div>
          </div>

          <div className="housing-details-info">
            <span className="housing-badge">Dorm</span>

            <h2>{dorm.dorm_name}</h2>

            <p>
              <i className="fa-solid fa-location-dot"></i>
              <strong>Location:</strong>{" "}
              {dorm.city || "-"}
              {dorm.area ? ` - ${dorm.area}` : ""}
            </p>

            <p>
              <i className="fa-solid fa-road"></i>
              <strong>Address:</strong>{" "}
              {dorm.street || "-"}
              {dorm.building_number
                ? `, Building ${dorm.building_number}`
                : ""}
            </p>

            {dorm.gps_location && (
              <p>
                <i className="fa-solid fa-map-location-dot"></i>
                <strong>GPS:</strong>{" "}
                <a href={dorm.gps_location} target="_blank" rel="noreferrer">
                  Open Location
                </a>
              </p>
            )}

            <p>
              <i className="fa-solid fa-circle-check"></i>
              <strong>Availability:</strong> {dormAvailability}
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

            {dorm.contact_email && (
              <p>
                <i className="fa-solid fa-envelope"></i>
                <strong>Email:</strong> {dorm.contact_email}
              </p>
            )}

            {dorm.contact_phone && (
              <p>
                <i className="fa-solid fa-phone"></i>
                <strong>Phone:</strong> {dorm.contact_phone}
              </p>
            )}

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
                  const full = isRoomFull(room);
                  const isSelected =
                    selectedRoom && selectedRoom.room_id === room.room_id;

                  return (
                    <div className="room-box" key={room.room_id}>
                      <div>
                        {room.image_url && (
                          <img
                            src={getImageSource(room.image_url)}
                            alt="Room"
                            className="room-detail-image"
                          />
                        )}

                        <p>
                          <strong>{room.room_type}</strong>
                        </p>

                        <p>Room Number: {room.room_number}</p>
                        <p>Capacity: {room.room_capacity}</p>
                        <p>Current Occupancy: {room.current_occupancy}</p>
                        <p>Occupancy Limit: {room.occupancy_limit}</p>

                        <p>
                          Status:{" "}
                          <span className={full ? "room-full" : "room-available"}>
                            {full ? "Full" : "Available"}
                          </span>
                        </p>

                        <p>
                          Facilities:{" "}
                          {room.facilities && room.facilities.length > 0
                            ? room.facilities.map(getFacilityName).join(", ")
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
                            full
                              ? "select-room-btn disabled-room-btn"
                              : isSelected
                              ? "select-room-btn selected-room"
                              : "select-room-btn"
                          }
                          disabled={full}
                          onClick={() => setSelectedRoom(room)}
                        >
                          {full ? "Full" : isSelected ? "Selected" : "Select"}
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
            dorm.facilities.map((facility, index) => (
              <div
                className="facility-box"
                key={facility.facility_id || facility.id || facility.name || index}
              >
                <i className={`fa-solid ${getFacilityIcon(facility)}`}></i>
                <h3>{getFacilityName(facility)}</h3>
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
              <div className="review-card" key={review.review_id || index}>
                <div className="review-header">
                  <h3>{review.resident_name || "Resident"}</h3>

                  <span className="review-stars">
                    {renderStars(review.rating)}
                    {review.rating} / 5
                  </span>
                </div>

                <p>{review.review_comment || ""}</p>

                <small>
                  <i className="fa-solid fa-calendar-days"></i>{" "}
                  {review.created_at || ""}
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