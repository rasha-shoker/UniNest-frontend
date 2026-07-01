import { useEffect, useState } from "react";
import "./ReviewPage.css";
import { getBookings, getPayments, getReviews, createReview } from "../api";

function ReviewPage() {
  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";
  const loggedInUserEmail = (
    localStorage.getItem("loggedInUserEmail") || ""
  ).toLowerCase();
  const loggedInUser = localStorage.getItem("loggedInUser") || "Resident";

  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviewPage();
  }, []);

  const normalizeStatus = (status) => {
    return String(status || "pending").toLowerCase();
  };

  const displayStatus = (status) => {
    const value = normalizeStatus(status);

    if (value === "approved") return "Approved";
    if (value === "rejected") return "Rejected";
    if (value === "cancelled") return "Cancelled";
    if (value === "paid") return "Paid";
    if (value === "completed") return "Completed";

    return "Pending";
  };

  const getStatusClass = (status) => {
    const value = normalizeStatus(status);

    if (value === "approved") return "approved";
    if (value === "paid" || value === "completed") return "paid";
    if (value === "rejected") return "rejected";
    if (value === "cancelled") return "cancelled";

    return "pending";
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizeBooking = (booking) => {
    const room = booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
    const resident = booking.resident || {};

    return {
      ...booking,

      booking_id: booking.booking_id || booking.id,
      resident_id: booking.resident_id || resident.resident_id || "",
      resident_name:
        booking.resident_name ||
        booking.residentName ||
        booking.userName ||
        booking.studentName ||
        resident.full_name ||
        resident.user?.full_name ||
        "Resident",

      email: (
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        resident.email ||
        resident.user?.email ||
        ""
      ).toLowerCase(),

      dorm_id:
        booking.dorm_id ||
        booking.housingId ||
        dorm.dorm_id ||
        room.dorm_id ||
        "",

      dorm_name:
        booking.dorm_name ||
        booking.housingName ||
        dorm.dorm_name ||
        "Dorm Name",

      room_id: booking.room_id || booking.roomId || room.room_id || "",
      room_number:
        booking.room_number || booking.roomNumber || room.room_number || "-",
      room_type: booking.room_type || booking.roomType || room.room_type || "-",

      booking_status: booking.booking_status || booking.status || "pending",
      payment_status:
        booking.payment_status || booking.paymentStatus || "pending",

      total_price: Number(
        booking.total_price || booking.totalCost || booking.amount || 0
      ),

      isLocal: booking.isLocal || false,
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      payment_id: payment.payment_id || payment.id,
      booking_id: payment.booking_id || payment.bookingId,
      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || payment.method || "",
      payment_status: payment.payment_status || payment.status || "pending",
      created_at: payment.created_at || payment.payment_date || "",
      isLocal: payment.isLocal || false,
    };
  };

  const normalizeReview = (review) => {
    const resident = review.resident || {};
    const dorm = review.dorm || {};

    return {
      ...review,

      review_id: review.review_id || review.id,
      booking_id: review.booking_id || review.bookingId || "",

      resident_id: review.resident_id || resident.resident_id || "",
      resident_name:
        review.resident_name ||
        review.residentName ||
        review.userName ||
        resident.full_name ||
        resident.user?.full_name ||
        "Resident",

      email: (
        review.email ||
        review.residentEmail ||
        review.userEmail ||
        resident.email ||
        resident.user?.email ||
        ""
      ).toLowerCase(),

      dorm_id: review.dorm_id || review.housingId || dorm.dorm_id || "",
      dorm_name: review.dorm_name || review.housingName || dorm.dorm_name || "Dorm",

      rating: Number(review.rating || 0),
      review_comment: review.review_comment || review.comment || "",
      review_status: review.review_status || review.status || "visible",
      created_at: review.created_at || review.createdAt || review.date || "",
      isLocal: review.isLocal || false,
    };
  };

  const getLocalBookings = () => {
    const localBookings =
      JSON.parse(localStorage.getItem("studentBookings")) || [];

    return localBookings.map((booking) =>
      normalizeBooking({
        ...booking,
        isLocal: true,
      })
    );
  };

  const getLocalPayments = () => {
    const localPayments = JSON.parse(localStorage.getItem("payments")) || [];

    return localPayments.map((payment) =>
      normalizePayment({
        ...payment,
        isLocal: true,
      })
    );
  };

  const getLocalReviews = () => {
    const localReviews = JSON.parse(localStorage.getItem("reviews")) || [];

    return localReviews.map((review) =>
      normalizeReview({
        ...review,
        isLocal: true,
      })
    );
  };

  const mergeById = (backendItems, localItems, idField) => {
    const merged = [...localItems];

    backendItems.forEach((backendItem) => {
      const exists = merged.some((localItem) => {
        return Number(localItem[idField]) === Number(backendItem[idField]);
      });

      if (!exists) {
        merged.push(backendItem);
      }
    });

    return merged;
  };

  const loadReviewPage = async () => {
    try {
      setLoading(true);

      const localBookings = getLocalBookings();
      const localPayments = getLocalPayments();
      const localReviews = getLocalReviews();

      let backendBookings = [];
      let backendPayments = [];
      let backendReviews = [];

      try {
        const bookingsResponse = await getBookings();
        const bookingsList = Array.isArray(bookingsResponse)
          ? bookingsResponse
          : bookingsResponse.data || [];

        backendBookings = bookingsList.map(normalizeBooking);
      } catch (error) {
        console.warn("Backend bookings could not be loaded:", error);
      }

      try {
        const paymentsResponse = await getPayments();
        const paymentsList = Array.isArray(paymentsResponse)
          ? paymentsResponse
          : paymentsResponse.data || [];

        backendPayments = paymentsList.map(normalizePayment);
      } catch (error) {
        console.warn("Backend payments could not be loaded:", error);
      }

      try {
        const reviewsResponse = await getReviews();
        const reviewsList = Array.isArray(reviewsResponse)
          ? reviewsResponse
          : reviewsResponse.data || [];

        backendReviews = reviewsList.map(normalizeReview);
      } catch (error) {
        console.warn("Backend reviews could not be loaded:", error);
      }

      const mergedBookings = mergeById(
        backendBookings,
        localBookings,
        "booking_id"
      );

      const mergedPayments = mergeById(
        backendPayments,
        localPayments,
        "payment_id"
      );

      const mergedReviews = mergeById(
        backendReviews,
        localReviews,
        "review_id"
      ).sort((a, b) => Number(b.review_id || 0) - Number(a.review_id || 0));

      const myBookings = mergedBookings.filter((booking) => {
        const sameResident =
          String(booking.resident_id || "") === String(loggedInResidentId);

        const sameEmail =
          String(booking.email || "").toLowerCase() === loggedInUserEmail;

        return sameResident || sameEmail;
      });

      const myReviews = mergedReviews.filter((review) => {
        const sameResident =
          String(review.resident_id || "") === String(loggedInResidentId);

        const sameEmail =
          String(review.email || "").toLowerCase() === loggedInUserEmail;

        return sameResident || sameEmail;
      });

      setBookings(myBookings);
      setPayments(mergedPayments);
      setReviews(myReviews);
    } catch (error) {
      console.error("Review page load failed:", error);
      alert("Could not load review page.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentForBooking = (bookingId) => {
    return payments.find((payment) => {
      return Number(payment.booking_id) === Number(bookingId);
    });
  };

  const isBookingPaid = (booking) => {
    const payment = getPaymentForBooking(booking.booking_id);

    const bookingPaymentStatus = normalizeStatus(booking.payment_status);
    const paymentStatus = normalizeStatus(payment?.payment_status);

    return (
      bookingPaymentStatus === "paid" ||
      bookingPaymentStatus === "completed" ||
      paymentStatus === "paid" ||
      paymentStatus === "completed"
    );
  };

  const hasReviewedDorm = (dormId) => {
    return reviews.some((review) => {
      return Number(review.dorm_id) === Number(dormId);
    });
  };

  const eligibleBookings = bookings.filter((booking) => {
    return (
      normalizeStatus(booking.booking_status) === "approved" &&
      isBookingPaid(booking) &&
      !hasReviewedDorm(booking.dorm_id)
    );
  });

  const selectedBooking = eligibleBookings.find((booking) => {
    return Number(booking.booking_id) === Number(selectedBookingId);
  });

  const saveLocalReview = (reviewObject) => {
    const oldReviews = JSON.parse(localStorage.getItem("reviews")) || [];

    oldReviews.unshift(reviewObject);

    localStorage.setItem("reviews", JSON.stringify(oldReviews));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedBooking) {
      alert("Please select an approved and paid booking.");
      return;
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    if (!comment.trim()) {
      alert("Please write your review comment.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        resident_id: Number(loggedInResidentId || selectedBooking.resident_id),
        dorm_id: Number(selectedBooking.dorm_id),
        rating: Number(rating),
        review_comment: comment.trim(),
      };

      const createdReviewResponse = await createReview(payload);

      const createdReview =
        createdReviewResponse?.data && createdReviewResponse.data.review_id
          ? createdReviewResponse.data
          : createdReviewResponse;

      const newReviewId =
        createdReview?.review_id || createdReview?.id || Date.now();

      const localReview = {
        review_id: newReviewId,
        booking_id: selectedBooking.booking_id,

        resident_id: loggedInResidentId || selectedBooking.resident_id,
        resident_name: loggedInUser,
        email: loggedInUserEmail,

        dorm_id: selectedBooking.dorm_id,
        dorm_name: selectedBooking.dorm_name,

        rating: Number(rating),
        review_comment: comment.trim(),
        review_status: "visible",
        created_at: formatDateToday(),
        isLocal: selectedBooking.isLocal || false,
      };

      saveLocalReview(localReview);

      alert("Review submitted successfully.");

      setSelectedBookingId("");
      setRating(5);
      setComment("");
      loadReviewPage();
    } catch (error) {
      console.warn("Backend review failed, saving locally:", error);

      const localReview = {
        review_id: Date.now(),
        booking_id: selectedBooking.booking_id,

        resident_id: loggedInResidentId || selectedBooking.resident_id,
        resident_name: loggedInUser,
        email: loggedInUserEmail,

        dorm_id: selectedBooking.dorm_id,
        dorm_name: selectedBooking.dorm_name,

        rating: Number(rating),
        review_comment: comment.trim(),
        review_status: "visible",
        created_at: formatDateToday(),
        isLocal: true,
      };

      saveLocalReview(localReview);

      alert("Review saved locally for frontend testing.");

      setSelectedBookingId("");
      setRating(5);
      setComment("");
      loadReviewPage();
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value) => {
    const ratingValue = Math.round(Number(value) || 0);

    return [1, 2, 3, 4, 5].map((star) => (
      <i
        key={star}
        className={
          star <= ratingValue ? "fa-solid fa-star" : "fa-regular fa-star"
        }
      ></i>
    ));
  };

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
            <a href="/review" className="active">
              <i className="fa-solid fa-star"></i> Reviews
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
            <h1>Reviews</h1>
            <p>Review dorms after your approved and paid booking.</p>
          </div>
        </div>

        {loading ? (
          <div className="review-card">
            <h2>Loading reviews...</h2>
          </div>
        ) : (
          <>
            <section className="review-card">
              <h2>Submit Review</h2>

              {eligibleBookings.length === 0 ? (
                <div className="empty-reviews">
                  <h3>No eligible bookings</h3>
                  <p>
                    You can review a dorm only after your booking is approved
                    and paid, and only once per dorm.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="review-form">
                  <div className="form-group">
                    <label>Select Booking</label>
                    <select
                      value={selectedBookingId}
                      onChange={(event) =>
                        setSelectedBookingId(event.target.value)
                      }
                      required
                    >
                      <option value="">Choose booking</option>

                      {eligibleBookings.map((booking) => (
                        <option
                          key={booking.booking_id}
                          value={booking.booking_id}
                        >
                          {booking.dorm_name} - Room {booking.room_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBooking && (
                    <div className="selected-booking-box">
                      <p>
                        <strong>Dorm:</strong> {selectedBooking.dorm_name}
                      </p>

                      <p>
                        <strong>Room:</strong> {selectedBooking.room_number}
                      </p>

                      <p>
                        <strong>Booking Status:</strong>{" "}
                        {displayStatus(selectedBooking.booking_status)}
                      </p>

                      <p>
                        <strong>Payment Status:</strong>{" "}
                        {displayStatus(selectedBooking.payment_status)}
                      </p>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Rating</label>
                    <select
                      value={rating}
                      onChange={(event) => setRating(event.target.value)}
                      required
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>

                  <div className="rating-preview">
                    {renderStars(rating)}
                    <span>{rating} / 5</span>
                  </div>

                  <div className="form-group">
                    <label>Comment</label>
                    <textarea
                      rows="5"
                      placeholder="Write your review..."
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </section>

            <section className="review-card">
              <h2>My Reviews</h2>

              {reviews.length === 0 ? (
                <div className="empty-reviews">
                  <h3>No reviews yet</h3>
                  <p>Your submitted reviews will appear here.</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div className="review-item" key={review.review_id}>
                      <div className="review-title-row">
                        <h3>{review.dorm_name || "Dorm"}</h3>

                        <span className="status-badge approved">
                          {review.review_status === "hidden"
                            ? "Hidden"
                            : "Visible"}
                        </span>
                      </div>

                      <div className="review-stars">
                        {renderStars(review.rating)}
                        <span>{review.rating} / 5</span>
                      </div>

                      <p>{review.review_comment}</p>

                      <small>
                        <i className="fa-solid fa-calendar-days"></i>{" "}
                        {review.created_at || "-"}
                      </small>

                      {review.isLocal && (
                        <p>
                          <strong>Note:</strong> Saved locally until backend
                          review store is fixed.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default ReviewPage;