import "./AdminDashboardPage.css";
import { housingsData } from "../data/housingsData";

function AdminDashboardPage() {
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

  const normalizeDorm = (dorm) => {
    return {
      ...dorm,
      dorm_id: dorm.dorm_id || dorm.id,
      dorm_name: dorm.dorm_name || dorm.name || "Dorm Name",
      availability_status:
        dorm.availability_status ||
        dorm.status ||
        dorm.availability ||
        "Available",
    };
  };

  const normalizeResident = (resident) => {
    return {
      ...resident,
      resident_id: resident.resident_id || resident.id,
      first_name: resident.first_name || resident.firstName || "",
      last_name: resident.last_name || resident.lastName || "",
      email: resident.email || "",
      user_type: resident.user_type || resident.role || "student",
    };
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
        "Resident",

      email:
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        "",

      dorm_id: booking.dorm_id || booking.housingId,
      dorm_name: booking.dorm_name || booking.housingName || "Dorm",

      room_id: booking.room_id || booking.roomId || "",
      room_number: booking.room_number || booking.roomNumber || "-",
      room_type: booking.room_type || booking.roomType || "Room",

      booking_status: booking.booking_status || booking.status || "Pending",
      payment_status:
        booking.payment_status || booking.paymentStatus || "Pending",

      created_at:
        booking.created_at ||
        booking.createdAt ||
        booking.bookingDate ||
        booking.checkInDate ||
        "",
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      payment_id: payment.payment_id || payment.paymentId,
      booking_id: payment.booking_id || payment.bookingId,
      amount: Number(payment.amount || 0),
      payment_status: payment.payment_status || payment.status || "Pending",
    };
  };

  const normalizeMaintenanceRequest = (request) => {
    return {
      ...request,

      request_id: request.request_id || request.id,
      booking_id: request.booking_id || request.bookingId,

      resident_id: request.resident_id || "",
      resident_name:
        request.resident_name ||
        request.residentName ||
        request.userName ||
        request.studentName ||
        "Resident",

      email:
        request.email ||
        request.residentEmail ||
        request.userEmail ||
        request.studentEmail ||
        "",

      dorm_id: request.dorm_id || request.housingId,
      dorm_name:
        request.dorm_name || request.housingName || request.currentHousing || "Dorm",

      request_title:
        request.request_title || request.title || "Maintenance Request",

      request_status: request.request_status || request.status || "Pending",

      request_date:
        request.request_date ||
        request.submittedDate ||
        request.createdAt ||
        request.date ||
        "",
    };
  };

  const normalizeReview = (review) => {
    return {
      ...review,
      review_id: review.review_id || review.id,
      resident_id: review.resident_id || "",
      dorm_id: review.dorm_id || review.housingId,
      rating: Number(review.rating || 0),
      review_comment: review.review_comment || review.comment || "",
      review_status: review.review_status || review.status || "Visible",
      created_at: review.created_at || review.createdAt || review.date || "",
    };
  };

  const getDorms = () => {
    const savedDorms = JSON.parse(localStorage.getItem("dorms"));
    const savedHousings = JSON.parse(localStorage.getItem("housings"));

    if (savedDorms && Array.isArray(savedDorms) && savedDorms.length > 0) {
      return savedDorms.map(normalizeDorm);
    }

    if (
      savedHousings &&
      Array.isArray(savedHousings) &&
      savedHousings.length > 0
    ) {
      const normalizedDorms = savedHousings.map(normalizeDorm);
      localStorage.setItem("dorms", JSON.stringify(normalizedDorms));
      return normalizedDorms;
    }

    if (housingsData && Array.isArray(housingsData)) {
      const normalizedDorms = housingsData.map(normalizeDorm);
      localStorage.setItem("dorms", JSON.stringify(normalizedDorms));
      localStorage.setItem("housings", JSON.stringify(normalizedDorms));
      return normalizedDorms;
    }

    return [];
  };

  const getResidents = () => {
    const residents = JSON.parse(localStorage.getItem("residents"));
    const users = JSON.parse(localStorage.getItem("users"));

    if (residents && Array.isArray(residents)) {
      return residents.map(normalizeResident);
    }

    if (users && Array.isArray(users)) {
      return users.map(normalizeResident);
    }

    return [];
  };

  const getBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const getPayments = () => {
    return JSON.parse(localStorage.getItem("payments")) || [];
  };

  const getMaintenanceRequests = () => {
    return JSON.parse(localStorage.getItem("maintenanceRequests")) || [];
  };

  const getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews")) || [];
  };

  const isPaid = (value) => {
    return value === "Completed" || value === "Paid";
  };

  const getNewestValue = (item, idFields) => {
    for (let i = 0; i < idFields.length; i++) {
      const field = idFields[i];

      if (item[field]) {
        return Number(item[field]);
      }
    }

    return 0;
  };

  const sortByNewest = (items, idFields) => {
    return items.slice().sort((a, b) => {
      const aValue = getNewestValue(a, idFields);
      const bValue = getNewestValue(b, idFields);

      return bValue - aValue;
    });
  };

  const dorms = getDorms();

  const residents = getResidents().filter((resident) => {
    const userType = String(resident.user_type || "").toLowerCase();
    return userType === "student" || userType === "employee";
  });

  const bookings = getBookings().map(normalizeBooking);
  const payments = getPayments().map(normalizePayment);
  const maintenanceRequests = getMaintenanceRequests().map(
    normalizeMaintenanceRequest
  );
  const reviews = getReviews().map(normalizeReview);

  const approvedBookings = bookings.filter(
    (booking) => booking.booking_status === "Approved"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.booking_status === "Pending"
  ).length;

  const completedPayments = payments.filter((payment) =>
    isPaid(payment.payment_status)
  );

  const totalRevenue = completedPayments.reduce((total, payment) => {
    return total + Number(payment.amount || 0);
  }, 0);

  const openMaintenance = maintenanceRequests.filter((request) => {
    return (
      request.request_status === "Pending" ||
      request.request_status === "In Progress"
    );
  }).length;

  const recentBookings = sortByNewest(bookings, ["booking_id", "id"]).slice(
    0,
    5
  );

  const recentMaintenance = sortByNewest(maintenanceRequests, [
    "request_id",
    "id",
  ]).slice(0, 5);

  const getMaintenanceStatusClass = (status) => {
    if (status === "In Progress") return "progress";
    if (status === "Resolved") return "resolved";
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
                  const bookingStatus = booking.booking_status || "Pending";
                  const statusClass = bookingStatus.toLowerCase();

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
                          Payment: {booking.payment_status || "Pending"}{" "}
                          {booking.created_at ? "• " + booking.created_at : ""}
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
                  const requestStatus = request.request_status || "Pending";
                  const statusClass = getMaintenanceStatusClass(requestStatus);

                  return (
                    <div
                      className="maintenance-request-card"
                      key={request.request_id}
                    >
                      <div>
                        <h3>{request.request_title}</h3>
                        <p>
                          {request.resident_name || "Resident"} •{" "}
                          {request.dorm_name || "Dorm"}
                        </p>
                        <small>{request.request_date || ""}</small>
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
      </main>
    </div>
  );
}

export default AdminDashboardPage;