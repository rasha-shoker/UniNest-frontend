import { useState } from "react";
import "./ReviewPage.css";

function ReviewPage() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = Number(params.get("bookingId"));

  const loggedInUser = localStorage.getItem("loggedInUser") || "Resident";
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail") || "";
  const loggedInRole = localStorage.getItem("loggedInRole") || "";
  const loggedInUserType =
    localStorage.getItem("loggedInUserType") || loggedInRole;
  const loggedInResidentId =
    localStorage.getItem("loggedInResidentId") || "";

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  const logout = (event) => {
    event.preventDefault();

    localStorage.removeItem("loggedInAdminId");
    localStorage.removeItem("loggedInResidentId");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUserType");

    window.location.href = "/";
  };

  const getBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews")) || [];
  };

  const saveReviews = (reviews) => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  };

  const getNotifications = () => {
    return JSON.parse(localStorage.getItem("notifications")) || [];
  };

  const saveNotifications = (notifications) => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const addNotification = (residentId, notificationType, title, message) => {
    if (!residentId && !loggedInUserEmail) return;

    const notifications = getNotifications();
    const notificationId = Date.now() + Math.floor(Math.random() * 1000);

    const newNotification = {
      notification_id: notificationId,
      resident_id: residentId || "",
      title: title,
      message: message,
      notification_type: notificationType,
      is_read: false,
      created_at: formatDateToday(),

      id: notificationId,
      userEmail: loggedInUserEmail,
      type: notificationType,
      isRead: false,
      date: formatDateToday(),
    };

    notifications.unshift(newNotification);
    saveNotifications(notifications);
  };

  const normalizeBooking = (booking) => {
    return {
      ...booking,

      booking_id: booking.booking_id || booking.id,

      resident_id: booking.resident_id || "",
      resident_name:
        booking.resident_name ||
        booking.residentName ||
        booking.userName ||
        booking.studentName ||
        "",

      email:
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        "",

      dorm_id: booking.dorm_id || booking.housingId,
      dorm_name: booking.dorm_name || booking.housingName || "Dorm Name",

      university_name: booking.university_name || booking.university || "",
      city: booking.city || "",
      area: booking.area || booking.location || "",

      room_id: booking.room_id || booking.roomId || "",
      room_number: booking.room_number || booking.roomNumber || "",
      room_type: booking.room_type || booking.roomType || "",

      check_in_date: booking.check_in_date || booking.checkInDate || "-",
      check_out_date: booking.check_out_date || booking.checkOutDate || "-",

      booking_status: booking.booking_status || booking.status || "Pending",
      payment_status:
        booking.payment_status || booking.paymentStatus || "Pending",
    };
  };

  const normalizeReview = (review) => {
    return {
      ...review,

      review_id: review.review_id || review.id,
      booking_id: review.booking_id || review.bookingId,

      resident_id: review.resident_id || "",
      resident_name:
        review.resident_name ||
        review.residentName ||
        review.userName ||
        "",

      email: review.email || review.userEmail || review.residentEmail || "",

      dorm_id: review.dorm_id || review.housingId,
      dorm_name: review.dorm_name || review.housingName || "",

      rating: Number(review.rating || 0),
      review_comment: review.review_comment || review.comment || "",
      review_status: review.review_status || review.status || "Visible",
      created_at: review.created_at || review.createdAt || review.date || "",
    };
  };

  const isPaidBooking = (booking) => {
    const paymentStatus = booking.payment_status || "Pending";
    return paymentStatus === "Completed" || paymentStatus === "Paid";
  };

  const getSelectedBooking = () => {
    const bookings = getBookings().map(normalizeBooking);
    const currentEmail = loggedInUserEmail.toLowerCase();
    const currentResidentId = String(loggedInResidentId);

    return bookings.find((booking) => {
      const bookingEmail = (booking.email || "").toLowerCase();
      const bookingResidentId = String(booking.resident_id || "");

      return (
        Number(booking.booking_id) === Number(bookingId) &&
        (bookingResidentId === currentResidentId ||
          bookingEmail === currentEmail)
      );
    });
  };

  const selectedBooking = getSelectedBooking();

  const userAlreadyReviewed = () => {
    const reviews = getReviews().map(normalizeReview);
    const currentEmail = loggedInUserEmail.toLowerCase();
    const currentResidentId = String(loggedInResidentId);

    return reviews.some((review) => {
      const reviewEmail = (review.email || "").toLowerCase();
      const reviewResidentId = String(review.resident_id || "");

      return (
        Number(review.booking_id) === Number(bookingId) &&
        (reviewResidentId === currentResidentId ||
          reviewEmail === currentEmail)
      );
    });
  };

  const canWriteReview =
    bookingId &&
    selectedBooking &&
    (loggedInUserType === "student" || loggedInUserType === "employee") &&
    selectedBooking.booking_status === "Approved" &&
    isPaidBooking(selectedBooking) &&
    !userAlreadyReviewed();

  const handleSubmit = (event) => {
    event.preventDefault();

    const currentBooking = getSelectedBooking();

    if (!currentBooking) {
      alert("Booking not found.");
      window.location.href = "/my-bookings";
      return;
    }

    if (userAlreadyReviewed()) {
      alert("You already submitted a review for this booking.");
      window.location.href = "/my-bookings";
      return;
    }

    if (!rating || !comment.trim()) {
      alert("Please enter rating and comment.");
      return;
    }

    if (!canWriteReview) {
      alert("You can review only approved and paid bookings.");
      window.location.href = "/my-bookings";
      return;
    }

    const reviews = getReviews();

    const reviewId = Date.now();
    const createdAt = formatDateToday();

    const newReview = {
      review_id: reviewId,
      booking_id: currentBooking.booking_id,

      resident_id: loggedInResidentId || currentBooking.resident_id || "",
      resident_name: loggedInUser,
      email: loggedInUserEmail,

      dorm_id: currentBooking.dorm_id,
      dorm_name: currentBooking.dorm_name,

      room_id: currentBooking.room_id || "",
      room_number: currentBooking.room_number || "",
      room_type: currentBooking.room_type || "",

      rating: Number(rating),
      review_comment: comment.trim(),

      review_status: "Visible",
      created_at: createdAt,

      id: reviewId,
      bookingId: currentBooking.booking_id,

      housingId: currentBooking.dorm_id,
      housingName: currentBooking.dorm_name,

      userName: loggedInUser,
      residentName: loggedInUser,

      userEmail: loggedInUserEmail,
      residentEmail: loggedInUserEmail,

      roomNumber: currentBooking.room_number || "",
      roomType: currentBooking.room_type || "",

      comment: comment.trim(),
      status: "Visible",
      createdAt: createdAt,
    };

    reviews.unshift(newReview);
    saveReviews(reviews);

    addNotification(
      loggedInResidentId || currentBooking.resident_id,
      "review",
      "Review Submitted",
      "Your review for " +
        currentBooking.dorm_name +
        " has been submitted successfully."
    );

    alert("Review submitted successfully.");
    window.location.href = `/housing-details?id=${currentBooking.dorm_id}`;
  };

  return (
    <div className="review-layout">
      <aside className="review-sidebar">
        <div className="sidebar-logo">
          <h2>UniNest</h2>
          <p>Resident Panel</p>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a href="/student-dashboard">
              <i className="fa-solid fa-house"></i> Dashboard
            </a>
          </li>

          <li>
            <a href="/my-bookings">
              <i className="fa-solid fa-bed"></i> My Bookings
            </a>
          </li>

          <li>
            <a href="/payment">
              <i className="fa-solid fa-credit-card"></i> Payment
            </a>
          </li>

          <li>
            <a href="/maintenance">
              <i className="fa-solid fa-screwdriver-wrench"></i> Maintenance
            </a>
          </li>

          <li>
            <a href="/notifications">
              <i className="fa-solid fa-bell"></i> Notifications
            </a>
          </li>

          <li>
            <a href="/profile">
              <i className="fa-solid fa-user"></i> Profile
            </a>
          </li>

          <li>
            <a href="/housings">
              <i className="fa-solid fa-magnifying-glass"></i> Explore Dorms
            </a>
          </li>

          <li>
            <a href="/" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </a>
          </li>
        </ul>
      </aside>

      <main className="review-main">
       <div className="review-topbar">
          <div>
            <h1>Write Review</h1>
            <p>Rate your dorm experience and share your feedback.</p>
          </div>

          <a href="/my-bookings" className="review-back-btn">
            <i className="fa-solid fa-arrow-left"></i> My Bookings
          </a>
        </div>

        <section className="review-page-container">
          <div className="review-summary-card">
            <h2>Booking Summary</h2>

            {!selectedBooking ? (
              <div className="review-warning">
                Please choose a paid booking from My Bookings to review.
              </div>
            ) : (
              <>
                <p>
                  <i className="fa-solid fa-building"></i>{" "}
                  <strong>Dorm:</strong>{" "}
                  {selectedBooking.dorm_name || "Dorm Name"}
                </p>

                <p>
                  <i className="fa-solid fa-location-dot"></i>{" "}
                  <strong>Location:</strong>{" "}
                  {selectedBooking.area || selectedBooking.city || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-school"></i>{" "}
                  <strong>University:</strong>{" "}
                  {selectedBooking.university_name || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-door-open"></i>{" "}
                  <strong>Room Number:</strong>{" "}
                  {selectedBooking.room_number || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-bed"></i>{" "}
                  <strong>Room Type:</strong>{" "}
                  {selectedBooking.room_type || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-calendar-check"></i>{" "}
                  <strong>Check-in:</strong>{" "}
                  {selectedBooking.check_in_date || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-calendar-xmark"></i>{" "}
                  <strong>Check-out:</strong>{" "}
                  {selectedBooking.check_out_date || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-credit-card"></i>{" "}
                  <strong>Payment:</strong>{" "}
                  {selectedBooking.payment_status || "Pending"}
                </p>

                {!canWriteReview && (
                  <div className="review-warning">
                    You can review only approved and paid bookings. Also, one
                    review is allowed per booking.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="review-form-card">
            <h2>Your Review</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="rating">Rating</label>

                <select
                  id="rating"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  disabled={!canWriteReview}
                  required
                >
                  <option value="">Select rating</option>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Review Comment</label>

                <textarea
                  id="comment"
                  rows="6"
                  placeholder="Describe your experience..."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  disabled={!canWriteReview}
                  required
                ></textarea>
              </div>

             <div className="review-actions">
  <button
    type="submit"
    className="review-submit-btn"
    disabled={!canWriteReview}
  >
    Submit Review
  </button>

  <a href="/my-bookings" className="secondary-link">
    Back to My Bookings
  </a>
</div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ReviewPage;