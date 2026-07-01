import { useEffect, useState } from "react";
import "./AdminDashboardPage.css";
import {
  getDorms,
  getResidents,
  getBookings,
  getPayments,
  getMaintenanceRequests,
  getReviews,
} from "../api";

function AdminDashboardPage() {
  const [dorms, setDorms] = useState([]);
  const [residents, setResidents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (value === "rejected") return "Rejected";
    if (value === "cancelled") return "Cancelled";
    if (value === "paid") return "Paid";
    if (value === "completed") return "Completed";
    if (value === "in_progress") return "In Progress";

    return "Pending";
  };

  const normalizeDorm = (dorm) => {
    return {
      ...dorm,
      dorm_id: dorm.dorm_id,
      dorm_name: dorm.dorm_name || "Dorm Name",
      rooms: Array.isArray(dorm.rooms) ? dorm.rooms : [],
    };
  };

  const normalizeResident = (resident) => {
    return {
      ...resident,
      resident_id: resident.resident_id,
      full_name: resident.full_name || resident.user?.full_name || "Resident",
      email: resident.email || resident.user?.email || "",
      role: resident.role || "student",
    };
  };

  const normalizeBooking = (booking) => {
    const room = booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
    const resident = booking.resident || {};

    return {
      ...booking,
      booking_id: booking.booking_id,
      resident_id: booking.resident_id || resident.resident_id || "",
      resident_name:
        booking.resident_name || resident.full_name || "Resident",
      email: booking.email || resident.email || resident.user?.email || "",

      dorm_id: booking.dorm_id || dorm.dorm_id || room.dorm_id || "",
      dorm_name: booking.dorm_name || dorm.dorm_name || "Dorm",

      room_id: booking.room_id || room.room_id || "",
      room_number: booking.room_number || room.room_number || "-",
      room_type: booking.room_type || room.room_type || "Room",

      booking_status: booking.booking_status || "pending",
      total_price: Number(booking.total_price || 0),
      created_at: booking.created_at || "",
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      payment_id: payment.payment_id,
      booking_id: payment.booking_id,
      amount: Number(payment.amount || 0),
      payment_status: payment.payment_status || "pending",
      payment_method: payment.payment_method || "-",
      created_at: payment.created_at || "",
    };
  };

  const normalizeMaintenanceRequest = (request) => {
    const booking = request.booking || {};
    const room = request.room || booking.room || {};
    const dorm = room.dorm || {};

    return {
      ...request,
      maintenance_request_id: request.maintenance_request_id,
      booking_id: request.booking_id || booking.booking_id || "",

      dorm_name: request.dorm_name || dorm.dorm_name || "Dorm",
      room_number: request.room_number || room.room_number || "-",

      request_description:
        request.request_description || "Maintenance Request",
      request_status: request.request_status || "pending",
      created_at: request.created_at || "",
    };
  };

  const normalizeReview = (review) => {
    const resident = review.resident || {};
    const dorm = review.dorm || {};

    return {
      ...review,
      review_id: review.review_id,
      resident_id: review.resident_id,
      resident_name: resident.full_name || "Resident",
      dorm_id: review.dorm_id,
      dorm_name: dorm.dorm_name || "Dorm",
      rating: Number(review.rating || 0),
      review_comment: review.review_comment || "",
      created_at: review.created_at || "",
    };
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        dormsResponse,
        residentsResponse,
        bookingsResponse,
        paymentsResponse,
        maintenanceResponse,
        reviewsResponse,
      ] = await Promise.all([
        getDorms().catch(() => []),
        getResidents().catch(() => []),
        getBookings().catch(() => []),
        getPayments().catch(() => []),
        getMaintenanceRequests().catch(() => []),
        getReviews().catch(() => []),
      ]);

      const dormsList = Array.isArray(dormsResponse)
        ? dormsResponse
        : dormsResponse.data || [];

      const residentsList = Array.isArray(residentsResponse)
        ? residentsResponse
        : residentsResponse.data || [];

      const bookingsList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      const paymentsList = Array.isArray(paymentsResponse)
        ? paymentsResponse
        : paymentsResponse.data || [];

      const maintenanceList = Array.isArray(maintenanceResponse)
        ? maintenanceResponse
        : maintenanceResponse.data || [];

      const reviewsList = Array.isArray(reviewsResponse)
        ? reviewsResponse
        : reviewsResponse.data || [];

      setDorms(dormsList.map(normalizeDorm));
      setResidents(residentsList.map(normalizeResident));
      setBookings(bookingsList.map(normalizeBooking));
      setPayments(paymentsList.map(normalizePayment));
      setMaintenanceRequests(maintenanceList.map(normalizeMaintenanceRequest));
      setReviews(reviewsList.map(normalizeReview));
    } catch (error) {
      console.error("Admin dashboard load failed:", error);
      alert("Could not load admin dashboard data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const approvedBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "approved"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "pending"
  ).length;

  const completedPayments = payments.filter((payment) => {
    const status = normalizeStatus(payment.payment_status);
    return status === "paid" || status === "completed";
  });

  const totalRevenue = completedPayments.reduce((total, payment) => {
    return total + Number(payment.amount || 0);
  }, 0);

  const openMaintenance = maintenanceRequests.filter((request) => {
    const status = normalizeStatus(request.request_status);
    return status === "pending" || status === "in_progress";
  }).length;

  const recentBookings = bookings
    .slice()
    .sort((a, b) => Number(b.booking_id || 0) - Number(a.booking_id || 0))
    .slice(0, 5);

  const recentMaintenance = maintenanceRequests
    .slice()
    .sort(
      (a, b) =>
        Number(b.maintenance_request_id || 0) -
        Number(a.maintenance_request_id || 0)
    )
    .slice(0, 5);

  const getMaintenanceStatusClass = (status) => {
    const value = normalizeStatus(status);

    if (value === "in_progress") return "progress";
    if (value === "completed" || value === "resolved") return "resolved";

    return "pending";
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>UniNest</h2>
          <p>Admin Panel</p>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a href="/admin-dashboard" className="active">
              <i className="fa-solid fa-chart-line"></i> Dashboard
            </a>
          </li>

          <li>
            <a href="/manage-housings">
              <i className="fa-solid fa-building"></i> Manage Dorms
            </a>
          </li>

          <li>
            <a href="/manage-bookings">
              <i className="fa-solid fa-bed"></i> Manage Bookings
            </a>
          </li>

          <li>
            <a href="/manage-students">
              <i className="fa-solid fa-users"></i> Manage Residents
            </a>
          </li>

          <li>
            <a href="/manage-maintenance">
              <i className="fa-solid fa-screwdriver-wrench"></i> Maintenance
            </a>
          </li>

          <li>
            <a href="/manage-reviews">
              <i className="fa-solid fa-star"></i> Manage Reviews
            </a>
          </li>

          <li>
            <a href="/reports">
              <i className="fa-solid fa-chart-pie"></i> Reports
            </a>
          </li>

          <li>
            <a href="/" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </a>
          </li>
        </ul>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Monitor dorms, residents, bookings, payments, maintenance, and
              reviews.
            </p>
          </div>

          <div className="admin-avatar">A</div>
        </div>

        {loading ? (
          <div className="admin-card">
            <h2>Loading dashboard...</h2>
          </div>
        ) : (
          <>
            <section className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon blue">
                  <i className="fa-solid fa-building"></i>
                </div>
                <div>
                  <h3>{dorms.length}</h3>
                  <p>Total Dorms</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon cyan">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div>
                  <h3>{residents.length}</h3>
                  <p>Total Residents</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon orange">
                  <i className="fa-solid fa-bed"></i>
                </div>
                <div>
                  <h3>{bookings.length}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon green">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <h3>{approvedBookings}</h3>
                  <p>Approved Bookings</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon yellow">
                  <i className="fa-solid fa-clock"></i>
                </div>
                <div>
                  <h3>{pendingBookings}</h3>
                  <p>Pending Bookings</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon purple">
                  <i className="fa-solid fa-dollar-sign"></i>
                </div>
                <div>
                  <h3>${totalRevenue}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon red">
                  <i className="fa-solid fa-screwdriver-wrench"></i>
                </div>
                <div>
                  <h3>{openMaintenance}</h3>
                  <p>Open Maintenance</p>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon pink">
                  <i className="fa-solid fa-star"></i>
                </div>
                <div>
                  <h3>{reviews.length}</h3>
                  <p>Total Reviews</p>
                </div>
              </div>
            </section>

            <section className="quick-actions-section">
              <a href="/manage-housings" className="quick-action-card">
                <i className="fa-solid fa-building"></i>
                <span>Manage Dorms</span>
              </a>

              <a href="/manage-bookings" className="quick-action-card">
                <i className="fa-solid fa-bed"></i>
                <span>Manage Bookings</span>
              </a>

              <a href="/manage-students" className="quick-action-card">
                <i className="fa-solid fa-users"></i>
                <span>Manage Residents</span>
              </a>

              <a href="/manage-maintenance" className="quick-action-card">
                <i className="fa-solid fa-screwdriver-wrench"></i>
                <span>Maintenance</span>
              </a>

              <a href="/manage-reviews" className="quick-action-card">
                <i className="fa-solid fa-star"></i>
                <span>Reviews</span>
              </a>

              <a href="/reports" className="quick-action-card">
                <i className="fa-solid fa-chart-pie"></i>
                <span>Reports</span>
              </a>
            </section>

            <section className="admin-dashboard-grid">
              <div className="admin-card">
                <div className="card-header">
                  <h2>Recent Booking Requests</h2>
                  <a href="/manage-bookings">View All</a>
                </div>

                <div className="booking-request-list">
                  {recentBookings.length === 0 ? (
                    <div className="empty-message">
                      <p>No booking requests yet.</p>
                    </div>
                  ) : (
                    recentBookings.map((booking) => {
                      const bookingStatus = displayStatus(
                        booking.booking_status
                      );
                      const statusClass = normalizeStatus(
                        booking.booking_status
                      );

                      return (
                        <div
                          className="booking-request-card"
                          key={booking.booking_id}
                        >
                          <div>
                            <h3>{booking.resident_name || "Resident"}</h3>
                            <p>
                              {booking.dorm_name || "Dorm"} •{" "}
                              {booking.room_type || "Room"} • Room{" "}
                              {booking.room_number || "-"}
                            </p>
                            <small>
                              Total: ${booking.total_price || 0}{" "}
                              {booking.created_at
                                ? "• " + booking.created_at
                                : ""}
                            </small>
                          </div>

                          <span className={`status-badge ${statusClass}`}>
                            {bookingStatus}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="admin-card">
                <div className="card-header">
                  <h2>Recent Maintenance Requests</h2>
                  <a href="/manage-maintenance">View All</a>
                </div>

                <div className="maintenance-list">
                  {recentMaintenance.length === 0 ? (
                    <div className="empty-message">
                      <p>No maintenance requests yet.</p>
                    </div>
                  ) : (
                    recentMaintenance.map((request) => {
                      const requestStatus = displayStatus(
                        request.request_status
                      );
                      const statusClass = getMaintenanceStatusClass(
                        request.request_status
                      );

                      return (
                        <div
                          className="maintenance-request-card"
                          key={request.maintenance_request_id}
                        >
                          <div>
                            <h3>Maintenance Request</h3>
                            <p>
                              {request.dorm_name || "Dorm"} • Room{" "}
                              {request.room_number || "-"}
                            </p>
                            <small>{request.created_at || ""}</small>
                          </div>

                          <span className={`status-badge ${statusClass}`}>
                            {requestStatus}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboardPage;