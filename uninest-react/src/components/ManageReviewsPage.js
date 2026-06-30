import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageReviewsPage.css";
import { getReviews, updateReview, deleteReview as deleteReviewApi } from "../api";

function ManageReviewsPage() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");

    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadReviews();
  }, [navigate]);

  const normalizeStatus = (status) => {
    return String(status || "visible").toLowerCase();
  };

  const displayReviewStatus = (status) => {
    const value = normalizeStatus(status);

    if (value === "hidden") return "Hidden";

    return "Visible";
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
        resident.full_name ||
        resident.user?.full_name ||
        review.resident_name ||
        review.residentName ||
        "Resident",

      email:
        resident.email ||
        resident.user?.email ||
        review.email ||
        review.residentEmail ||
        "-",

      dorm_id: review.dorm_id || dorm.dorm_id || review.housingId || "",
      dorm_name: dorm.dorm_name || review.dorm_name || "Dorm Review",

      room_id: review.room_id || "",
      room_number: review.room_number || "-",
      room_type: review.room_type || "-",

      rating: Number(review.rating || 0),
      review_comment: review.review_comment || review.comment || "-",

      review_status: review.review_status || review.status || "visible",
      created_at: review.created_at || review.createdAt || review.date || "-",
      updated_at: review.updated_at || review.updatedAt || "Not updated yet",
    };
  };

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await getReviews();

      const reviewsList = Array.isArray(response) ? response : response.data || [];

      setReviews(reviewsList.map(normalizeReview));
    } catch (error) {
      console.error("Reviews load failed:", error);
      alert("Could not load reviews from backend.");
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const reviewStatus = displayReviewStatus(review.review_status);

      const matchStatus =
        statusFilter === "All" || reviewStatus === statusFilter;

      const matchRating =
        ratingFilter === "All" ||
        Number(review.rating) === Number(ratingFilter);

      return matchStatus && matchRating;
    });
  }, [reviews, statusFilter, ratingFilter]);

  const visibleCount = reviews.filter(
    (review) => displayReviewStatus(review.review_status) === "Visible"
  ).length;

  const hiddenCount = reviews.filter(
    (review) => displayReviewStatus(review.review_status) === "Hidden"
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const hideReview = async (reviewId) => {
    try {
      await updateReview(reviewId, {
        review_status: "hidden",
      });

      alert("Review hidden successfully.");
      loadReviews();
    } catch (error) {
      console.error("Hide review failed:", error);
      alert(
        "Review could not be hidden. We may need to add review_status in the backend later."
      );
    }
  };

  const showReview = async (reviewId) => {
    try {
      await updateReview(reviewId, {
        review_status: "visible",
      });

      alert("Review is visible again.");
      loadReviews();
    } catch (error) {
      console.error("Show review failed:", error);
      alert(
        "Review could not be shown. We may need to add review_status in the backend later."
      );
    }
  };

  const deleteReview = async (reviewId) => {
    const ok = window.confirm("Are you sure you want to delete this review?");

    if (!ok) return;

    try {
      await deleteReviewApi(reviewId);
      alert("Review deleted successfully.");
      loadReviews();
    } catch (error) {
      console.error("Delete review failed:", error);
      alert("Review could not be deleted. We may need to fix DELETE /reviews/{id} later.");
    }
  };

  const logout = () => {
    localStorage.removeItem("loggedInAdminId");
    localStorage.removeItem("loggedInResidentId");
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    localStorage.removeItem("loggedInUserType");

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
            <h3>{reviews.length}</h3>
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
              onChange={(event) => setStatusFilter(event.target.value)}
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
              onChange={(event) => setRatingFilter(event.target.value)}
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

        {loading ? (
          <div className="empty-reviews">
            <h3>Loading reviews...</h3>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="empty-reviews">
            <h3>No reviews found</h3>
            <p>No resident reviews have been submitted yet.</p>
          </div>
        ) : (
          <section className="reviews-list">
            {filteredReviews.map((review) => {
              const reviewId = review.review_id;
              const reviewStatus = displayReviewStatus(review.review_status);

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