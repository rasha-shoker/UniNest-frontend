import { useEffect, useState } from "react";
import "./ReviewPage.css";
import { getBookings, getPayments, getReviews, createReview } from "../api";

function ReviewPage() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = Number(params.get("bookingId"));

  const loggedInUser = localStorage.getItem("loggedInUser") || "Resident";
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail") || "";
  const loggedInRole = localStorage.getItem("loggedInRole") || "";
  const loggedInUserType =
    localStorage.getItem("loggedInUserType") || loggedInRole;
  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";

  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const normalizeStatus = (status) => {
    return String(status || "pending").toLowerCase();
  };

  const displayStatus = (status) => {
    const value = normalizeStatus(status);

    if (value === "approved") return "Approved";
    if (value === "paid") return "Paid";
    if (value === "completed") return "Completed";
    if (value === "rejected") return "Rejected";
    if (value === "cancelled") return "Cancelled";

    return "Pending";
  };

  const normalizeBooking = (booking) => {
    const room = booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
    const resident = booking.resident || {};

    return {
      ...booking,
      booking_id: booking.booking_id || booking.id,
      resident_id: booking.resident_id || resident.resident_id || "",
      email: booking.email || resident.email || "",

      dorm_id: booking.dorm_id || dorm.dorm_id || room.dorm_id || "",
      dorm_name: booking.dorm_name || dorm.dorm_name || "Dorm Name",
      city: booking.city || dorm.city || "",
      area: booking.area || dorm.area || "",

      room_id: booking.room_id || room.room_id || "",
      room_number: booking.room_number || room.room_number || "",
      room_type: booking.room_type || room.room_type || "",

      check_in_date: booking.check_in_date || "-",
      check_out_date: booking.check_out_date || "-",

      booking_status: booking.booking_status || "pending",
    };
  };

  const loadReviewData = async () => {
    try {
      setLoading(true);

      const [bookingsResponse, paymentsResponse, reviewsResponse] =
        await Promise.all([
          getBookings(),
          getPayments().catch(() => []),
          getReviews().catch(() => []),
        ]);

      const bookingsList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      const paymentsList = Array.isArray(paymentsResponse)
        ? paymentsResponse
        : paymentsResponse.data || [];

      const reviewsList = Array.isArray(reviewsResponse)
        ? reviewsResponse
        : reviewsResponse.data || [];

      const currentResidentId = String(loggedInResidentId);
      const currentEmail = loggedInUserEmail.toLowerCase();

      const normalizedBookings = bookingsList.map(normalizeBooking);

      const foundBooking = normalizedBookings.find((booking) => {
        const bookingResidentId = String(booking.resident_id || "");
        const bookingEmail = String(booking.email || "").toLowerCase();

        return (
          Number(booking.booking_id) === Number(bookingId) &&
          (bookingResidentId === currentResidentId ||
            bookingEmail === currentEmail)
        );
      });

      setSelectedBooking(foundBooking || null);
      setPayments(paymentsList);
      setReviews(reviewsList);
    } catch (error) {
      console.error("Failed to load review data:", error);
      alert("Could not load review data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewData();
  }, []);

  const paymentForBooking = payments.find((payment) => {
    return Number(payment.booking_id) === Number(bookingId);
  });

  const paymentStatus = paymentForBooking?.payment_status || "pending";

  const alreadyReviewed = reviews.some((review) => {
    return (
      Number(review.resident_id) === Number(loggedInResidentId) &&
      Number(review.dorm_id) === Number(selectedBooking?.dorm_id)
    );
  });

  const canWriteReview =
    bookingId &&
    selectedBooking &&
    (loggedInUserType === "student" || loggedInUserType === "employee") &&
    normalizeStatus(selectedBooking.booking_status) === "approved" &&
    (normalizeStatus(paymentStatus) === "paid" ||
      normalizeStatus(paymentStatus) === "completed") &&
    !alreadyReviewed;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedBooking) {
      alert("Booking not found.");
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

    try {
      setSubmitting(true);

      await createReview({
        resident_id: Number(loggedInResidentId),
        dorm_id: Number(selectedBooking.dorm_id),
        rating: Number(rating),
        review_comment: comment.trim(),
      });

      alert("Review submitted successfully.");
      window.location.href = `/housing-details?id=${selectedBooking.dorm_id}`;
    } catch (error) {
      console.error("Review submit failed:", error);
      alert("Review could not be submitted. Make sure POST /reviews exists.");
    } finally {
      setSubmitting(false);
    }
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

            {loading ? (
              <div className="review-warning">Loading booking...</div>
            ) : !selectedBooking ? (
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
                  {selectedBooking.city || "-"}
                  {selectedBooking.area ? ` - ${selectedBooking.area}` : ""}
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
                  <strong>Payment:</strong> {displayStatus(paymentStatus)}
                </p>

                {!canWriteReview && (
                  <div className="review-warning">
                    You can review only approved and paid bookings. Also, one
                    review is allowed per dorm.
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
                  disabled={!canWriteReview || submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
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