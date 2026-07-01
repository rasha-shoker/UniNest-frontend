import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageReviewsPage.css";
import { getReviews, updateReview, deleteReview } from "../api";

function ManageReviewsPage() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
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

  const displayStatus = (status) => {
    const value = normalizeStatus(status);

    if (value === "hidden") return "Hidden";
    if (value === "rejected") return "Rejected";
    if (value === "pending") return "Pending";

    return "Visible";
  };

  const getStatusClass = (status) => {
    const value = normalizeStatus(status);

    if (value === "hidden" || value === "rejected") return "rejected";
    if (value === "pending") return "pending";

    return "approved";
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

      email:
        review.email ||
        review.residentEmail ||
        review.userEmail ||
        resident.email ||
        resident.user?.email ||
        "-",

      dorm_id: review.dorm_id || review.housingId || dorm.dorm_id || "",

      dorm_name:
        review.dorm_name ||
        review.housingName ||
        dorm.dorm_name ||
        "Dorm Name",

      rating: Number(review.rating || 0),

      review_comment: review.review_comment || review.comment || "",

      review_status: review.review_status || review.status || "visible",

      created_at:
        review.created_at ||
        review.createdAt ||
        review.date ||
        formatDateToday(),

      updated_at: review.updated_at || review.updatedAt || "",

      isLocal: review.isLocal || false,
    };
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

  const loadReviews = async () => {
    try {
      setLoading(true);

      const localReviews = getLocalReviews();

      let backendReviews = [];

      try {
        const reviewsResponse = await getReviews();

        const reviewsList = Array.isArray(reviewsResponse)
          ? reviewsResponse
          : reviewsResponse.data || [];

        backendReviews = reviewsList.map(normalizeReview);
      } catch (error) {
        console.warn("Backend reviews could not be loaded:", error);
      }

      const mergedReviews = mergeById(
        backendReviews,
        localReviews,
        "review_id"
      ).sort((a, b) => {
        return Number(b.review_id || 0) - Number(a.review_id || 0);
      });

      setReviews(mergedReviews);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      alert("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  };

  const updateLocalReview = (reviewId, updates) => {
    const localReviews = JSON.parse(localStorage.getItem("reviews")) || [];

    const updatedReviews = localReviews.map((review) => {
      const currentReviewId = review.review_id || review.id;

      if (Number(currentReviewId) === Number(reviewId)) {
        return {
          ...review,
          ...updates,
          status: updates.review_status || updates.status || review.status,
          review_status:
            updates.review_status || updates.status || review.review_status,
          updated_at: formatDateToday(),
          updatedAt: formatDateToday(),
        };
      }

      return review;
    });

    localStorage.setItem("reviews", JSON.stringify(updatedReviews));
  };

  const deleteLocalReview = (reviewId) => {
    const localReviews = JSON.parse(localStorage.getItem("reviews")) || [];

    const updatedReviews = localReviews.filter((review) => {
      const currentReviewId = review.review_id || review.id;
      return Number(currentReviewId) !== Number(reviewId);
    });

    localStorage.setItem("reviews", JSON.stringify(updatedReviews));
  };

  const changeReviewStatus = async (review, newStatus) => {
    const reviewId = review.review_id;

    try {
      await updateReview(reviewId, {
        resident_id: Number(review.resident_id),
        dorm_id: Number(review.dorm_id),
        rating: Number(review.rating),
        review_comment: review.review_comment,
        review_status: newStatus,
      });

      updateLocalReview(reviewId, {
        review_status: newStatus,
        status: newStatus,
      });

      alert(`Review marked as ${displayStatus(newStatus)}.`);
      loadReviews();
    } catch (error) {
      console.warn("Backend review update failed:", error);

      updateLocalReview(reviewId, {
        review_status: newStatus,
        status: newStatus,
      });

      alert(
        `Review marked as ${displayStatus(
          newStatus
        )} locally for frontend testing.`
      );

      loadReviews();
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const ok = window.confirm("Are you sure you want to delete this review?");

    if (!ok) return;

    try {
      await deleteReview(reviewId);

      deleteLocalReview(reviewId);

      alert("Review deleted successfully.");
      loadReviews();
    } catch (error) {
      console.warn("Backend review delete failed:", error);

      deleteLocalReview(reviewId);

      alert("Review deleted locally for frontend testing.");
      loadReviews();
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

  const logout = () => {
    localStorage.removeItem("loggedInAdminId");
    localStorage.removeItem("loggedInResidentId");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUserType");

    navigate("/login");
  };

  const totalReviews = reviews.length;

  const visibleCount = reviews.filter((review) => {
    return normalizeStatus(review.review_status) === "visible";
  }).length;

  const hiddenCount = reviews.filter((review) => {
    return normalizeStatus(review.review_status) === "hidden";
  }).length;

  const averageRating =
    reviews.length === 0
      ? 0
      : (
          reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1);

  return (
    <div className="manage-reviews-page reviews-admin-layout">
      <aside className="reviews-admin-sidebar">
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

      <main className="reviews-admin-main">
        <div className="reviews-admin-topbar">
          <div>
            <h1>Manage Reviews</h1>
            <p>Review resident feedback and control what appears publicly.</p>
          </div>
        </div>

        <section className="reviews-admin-stats">
          <div className="review-stat-card">
            <h3>{totalReviews}</h3>
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

        {loading ? (
          <div className="reviews-admin-card">
            <h2>Loading reviews...</h2>
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-admin-card empty-reviews">
            <h2>No reviews found</h2>
            <p>No residents have submitted reviews yet.</p>
          </div>
        ) : (
          <section className="reviews-list">
            {reviews.map((review) => {
              const reviewStatus = normalizeStatus(review.review_status);

              return (
                <div className="admin-review-card" key={review.review_id}>
                  <div className="review-header">
                    <div>
                      <h2>{review.dorm_name}</h2>
                      <p>
                        Review ID #{review.review_id}
                        {review.isLocal ? " - Local" : ""}
                      </p>
                    </div>

                    <span
                      className={`status-badge ${getStatusClass(
                        review.review_status
                      )}`}
                    >
                      {displayStatus(review.review_status)}
                    </span>
                  </div>

                  <div className="review-info-grid">
                    <p>
                      <i className="fa-solid fa-user"></i>{" "}
                      <strong>Resident:</strong> {review.resident_name}
                    </p>

                    <p>
                      <i className="fa-solid fa-envelope"></i>{" "}
                      <strong>Email:</strong> {review.email}
                    </p>

                    <p>
                      <i className="fa-solid fa-building"></i>{" "}
                      <strong>Dorm:</strong> {review.dorm_name}
                    </p>

                    <p>
                      <i className="fa-solid fa-calendar-days"></i>{" "}
                      <strong>Submitted:</strong> {review.created_at}
                    </p>
                  </div>

                  <div className="review-rating-box">
                    <div className="review-stars">{renderStars(review.rating)}</div>
                    <span>{review.rating} / 5</span>
                  </div>

                  <div className="review-comment-box">
                    <h3>Comment</h3>
                    <p>{review.review_comment || "-"}</p>
                  </div>

                  {review.isLocal && (
                    <div className="local-note-box">
                      <p>
                        <strong>Note:</strong> This review is saved locally until
                        backend review store/update is fixed.
                      </p>
                    </div>
                  )}

                  <div className="review-actions">
                    {reviewStatus === "visible" && (
                      <button
                        className="hide-btn"
                        onClick={() => changeReviewStatus(review, "hidden")}
                      >
                        Hide Review
                      </button>
                    )}

                    {reviewStatus === "hidden" && (
                      <button
                        className="show-btn"
                        onClick={() => changeReviewStatus(review, "visible")}
                      >
                        Show Review
                      </button>
                    )}

                    {reviewStatus !== "visible" && reviewStatus !== "hidden" && (
                      <>
                        <button
                          className="show-btn"
                          onClick={() => changeReviewStatus(review, "visible")}
                        >
                          Mark Visible
                        </button>

                        <button
                          className="hide-btn"
                          onClick={() => changeReviewStatus(review, "hidden")}
                        >
                          Hide Review
                        </button>
                      </>
                    )}

                    <Link
                      to={`/housing-details?id=${review.dorm_id}`}
                      className="view-dorm-btn"
                    >
                      View Dorm
                    </Link>

                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteReview(review.review_id)}
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