import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageReviewsPage.css";

function ManageReviewsPage() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");
    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadReviews();
  }, [navigate]);

  const getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews")) || [];
  };

  const saveReviews = (items) => {
    localStorage.setItem("reviews", JSON.stringify(items));
    setReviews(items);
  };

  const getNotifications = () => {
    return JSON.parse(localStorage.getItem("notifications")) || [];
  };

  const saveNotifications = (items) => {
    localStorage.setItem("notifications", JSON.stringify(items));
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const addNotification = (
    resident_id,
    notification_type,
    title,
    message,
    emailFallback
  ) => {
    if (!resident_id && !emailFallback) return;

    const notifications = getNotifications();
    const notificationId = Date.now() + Math.floor(Math.random() * 1000);

    const newNotification = {
      notification_id: notificationId,
      resident_id: resident_id || "",
      title,
      message,
      notification_type,
      is_read: false,
      created_at: formatDateToday(),

      id: notificationId,
      userEmail: emailFallback || "",
      type: notification_type,
      isRead: false,
      date: formatDateToday(),
    };

    notifications.unshift(newNotification);
    saveNotifications(notifications);
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
        "Resident",

      email:
        review.email ||
        review.residentEmail ||
        review.userEmail ||
        "-",

      dorm_id: review.dorm_id || review.housingId,
      dorm_name: review.dorm_name || review.housingName || "Dorm Review",

      room_id: review.room_id || review.roomId || "",
      room_number: review.room_number || review.roomNumber || "-",
      room_type: review.room_type || review.roomType || "-",

      rating: Number(review.rating || 0),
      review_comment: review.review_comment || review.comment || "-",

      review_status: review.review_status || review.status || "Visible",
      created_at: review.created_at || review.createdAt || review.date || "-",
      updated_at: review.updated_at || review.updatedAt || "Not updated yet",
    };
  };

  const loadReviews = () => {
    setReviews(getReviews());
  };

  const normalizedReviews = reviews.map(normalizeReview);

  const filteredReviews = useMemo(() => {
    return normalizedReviews.filter((review) => {
      const reviewStatus = review.review_status || "Visible";

      const matchStatus =
        statusFilter === "All" || reviewStatus === statusFilter;

      const matchRating =
        ratingFilter === "All" ||
        Number(review.rating) === Number(ratingFilter);

      return matchStatus && matchRating;
    });
  }, [reviews, statusFilter, ratingFilter]);

  const visibleCount = normalizedReviews.filter(
    (review) => review.review_status === "Visible"
  ).length;

  const hiddenCount = normalizedReviews.filter(
    (review) => review.review_status === "Hidden"
  ).length;

  const averageRating =
    normalizedReviews.length > 0
      ? (
          normalizedReviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
          ) / normalizedReviews.length
        ).toFixed(1)
      : "0.0";

  const hideReview = (reviewId) => {
    const allReviews = getReviews();
    let updatedReview = null;

    const updatedReviews = allReviews.map((review) => {
      const normalized = normalizeReview(review);

      if (Number(normalized.review_id) === Number(reviewId)) {
        updatedReview = {
          ...review,
          review_status: "Hidden",
          updated_at: formatDateToday(),

          status: "Hidden",
          updatedAt: formatDateToday(),
        };

        return updatedReview;
      }

      return review;
    });

    saveReviews(updatedReviews);

    if (updatedReview) {
      const normalizedUpdated = normalizeReview(updatedReview);

      addNotification(
        normalizedUpdated.resident_id,
        "review",
        "Review Hidden",
        "Your review for " +
          normalizedUpdated.dorm_name +
          " has been hidden by the admin.",
        normalizedUpdated.email
      );
    }

    alert("Review hidden successfully.");
  };

  const showReview = (reviewId) => {
    const allReviews = getReviews();
    let updatedReview = null;

    const updatedReviews = allReviews.map((review) => {
      const normalized = normalizeReview(review);

      if (Number(normalized.review_id) === Number(reviewId)) {
        updatedReview = {
          ...review,
          review_status: "Visible",
          updated_at: formatDateToday(),

          status: "Visible",
          updatedAt: formatDateToday(),
        };

        return updatedReview;
      }

      return review;
    });

    saveReviews(updatedReviews);

    if (updatedReview) {
      const normalizedUpdated = normalizeReview(updatedReview);

      addNotification(
        normalizedUpdated.resident_id,
        "review",
        "Review Visible Again",
        "Your review for " +
          normalizedUpdated.dorm_name +
          " is now visible again.",
        normalizedUpdated.email
      );
    }

    alert("Review is visible again.");
  };

  const deleteReview = (reviewId) => {
    const ok = window.confirm("Are you sure you want to delete this review?");
    if (!ok) return;

    const updatedReviews = getReviews().filter((review) => {
      const normalized = normalizeReview(review);
      return Number(normalized.review_id) !== Number(reviewId);
    });

    saveReviews(updatedReviews);
    alert("Review deleted successfully.");
  };

  const logout = () => {
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    navigate("/login");
  };

  const renderStars = (rating) => {
    const items = [];

    for (let i = 1; i <= 5; i++) {
      items.push(
        <i
          key={i}
          className={i <= Number(rating) ? "fa-solid fa-star" : "fa-regular fa-star"}
        ></i>
      );
    }

    return items;
  };

  return (
    <div className="manage-reviews-page reviews-layout">
      <aside className="reviews-sidebar">
        <div className="sidebar-logo">
          <h2>UniNest</h2>
          <p>Admin Panel</p>
        </div>

        <ul className="sidebar-menu">
          <li>
            <Link to="/admin-dashboard">
              <i className="fa-solid fa-chart-line"></i> Dashboard
            </Link>
          </li>

          <li>
            <Link to="/manage-housings">
              <i className="fa-solid fa-building"></i> Manage Dorms
            </Link>
          </li>

          <li>
            <Link to="/manage-bookings">
              <i className="fa-solid fa-bed"></i> Manage Bookings
            </Link>
          </li>

          <li>
            <Link to="/manage-students">
              <i className="fa-solid fa-users"></i> Manage Residents
            </Link>
          </li>

          <li>
            <Link to="/manage-maintenance">
              <i className="fa-solid fa-screwdriver-wrench"></i> Maintenance
            </Link>
          </li>

          <li>
            <Link to="/manage-reviews" className="active">
              <i className="fa-solid fa-star"></i> Manage Reviews
            </Link>
          </li>

          <li>
            <Link to="/reports">
              <i className="fa-solid fa-chart-pie"></i> Reports
            </Link>
          </li>

          <li>
            <button type="button" className="logout-link" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </button>
          </li>
        </ul>
      </aside>

      <main className="reviews-main">
        <div className="reviews-topbar">
          <div>
            <h1>Manage Reviews</h1>
            <p>View, hide, show, or delete resident reviews.</p>
          </div>
        </div>

        <section className="reviews-stats">
          <div className="review-stat-card">
            <h3>{normalizedReviews.length}</h3>
            <p>Total Reviews</p>
          </div>

          <div className="review-stat-card">
            <h3>{visibleCount}</h3>
            <p>Visible</p>
          </div>

          <div className="review-stat-card">
            <h3>{hiddenCount}</h3>
            <p>Hidden</p>
          </div>

          <div className="review-stat-card">
            <h3>{averageRating}</h3>
            <p>Average Rating</p>
          </div>
        </section>

        <section className="reviews-filter-card">
          <div className="filter-group">
            <label>Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Reviews</option>
              <option value="Visible">Visible</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </section>

        {filteredReviews.length === 0 ? (
          <div className="empty-reviews">
            <h3>No reviews found</h3>
            <p>No resident reviews have been submitted yet.</p>
          </div>
        ) : (
          <section className="reviews-list">
            {filteredReviews.map((review) => {
              const reviewId = review.review_id;
              const reviewStatus = review.review_status || "Visible";

              return (
                <div className="review-admin-card" key={reviewId}>
                  <div className="review-main">
                    <div className="review-title-row">
                      <h2>{review.dorm_name || "Dorm Review"}</h2>
                      <span
                        className={`review-status ${reviewStatus.toLowerCase()}`}
                      >
                        {reviewStatus}
                      </span>
                    </div>

                    <div className="review-meta-grid">
                      <p>
                        <i className="fa-solid fa-user"></i>{" "}
                        <strong>Resident:</strong>{" "}
                        {review.resident_name || "Resident"}
                      </p>

                      <p>
                        <i className="fa-solid fa-envelope"></i>{" "}
                        <strong>Email:</strong> {review.email || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-building"></i>{" "}
                        <strong>Dorm:</strong> {review.dorm_name || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-door-open"></i>{" "}
                        <strong>Room:</strong> {review.room_number || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-bed"></i>{" "}
                        <strong>Room Type:</strong> {review.room_type || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-calendar-days"></i>{" "}
                        <strong>Date:</strong> {review.created_at || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-clock-rotate-left"></i>{" "}
                        <strong>Updated:</strong>{" "}
                        {review.updated_at || "Not updated yet"}
                      </p>
                    </div>

                    <div className="rating-row">
                      <span>{renderStars(review.rating)}</span>
                      <strong>{review.rating || 0} / 5</strong>
                    </div>

                    <div className="comment-box">
                      <p>{review.review_comment || "-"}</p>
                    </div>
                  </div>

                  <div className="review-actions">
                    <Link
                      to={`/housing-details?id=${review.dorm_id}`}
                      className="view-btn"
                    >
                      View Dorm
                    </Link>

                    {reviewStatus === "Hidden" ? (
                      <button
                        className="show-btn"
                        onClick={() => showReview(reviewId)}
                      >
                        Show Review
                      </button>
                    ) : (
                      <button
                        className="hide-btn"
                        onClick={() => hideReview(reviewId)}
                      >
                        Hide Review
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => deleteReview(reviewId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default ManageReviewsPage;