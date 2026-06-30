import { useEffect, useState } from "react";
import "./StudentDashboardPage.css";
import {
  getBookings,
  getPayments,
  getMaintenanceRequests,
  getResidents,
} from "../api";

function StudentDashboardPage() {
  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";
  const loggedInUserEmail = (
    localStorage.getItem("loggedInUserEmail") || ""
  ).toLowerCase();
  const loggedInUserName = localStorage.getItem("loggedInUser") || "Resident";
  const loggedInUserType =
    localStorage.getItem("loggedInUserType") ||
    localStorage.getItem("loggedInRole") ||
    "student";

  const [resident, setResident] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDormImage = () => {
    try {
      return require("../assets/images/aub1.jpg");
    } catch {
      return "";
    }
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

  const normalizeResident = (item) => {
    return {
      ...item,
      resident_id: item.resident_id || item.id,
      user_id: item.user_id || "",
      full_name: item.full_name || loggedInUserName,
      email: item.email || item.user?.email || "",
      phone: item.phone || "",
      role: item.role || loggedInUserType,
      university: item.university || "",
      major: item.major || "",
      company: item.company || item.company_name || "",
    };
  };

  const normalizeBooking = (booking) => {
    const room = booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
    const residentData = booking.resident || {};

    return {
      ...booking,
      booking_id: booking.booking_id || booking.id,
      resident_id: booking.resident_id || residentData.resident_id || "",
      email: booking.email || residentData.email || "",

      dorm_id: booking.dorm_id || dorm.dorm_id || room.dorm_id || "",
      dorm_name: booking.dorm_name || dorm.dorm_name || "Dorm Name",
      city: booking.city || dorm.city || "",
      area: booking.area || dorm.area || "",

      room_id: booking.room_id || room.room_id || "",
      room_number: booking.room_number || room.room_number || "",
      room_type: booking.room_type || room.room_type || "",
      room_price: Number(booking.room_price || room.room_price || 0),

      check_in_date: booking.check_in_date || "-",
      check_out_date: booking.check_out_date || "-",
      total_price: Number(booking.total_price || 0),

      booking_status: booking.booking_status || "pending",
      created_at: booking.created_at || "",
    };
  };

  const normalizePayment = (payment) => {
    const booking = payment.booking || {};
    const room = booking.room || {};
    const dorm = room.dorm || {};

    return {
      ...payment,
      payment_id: payment.payment_id || payment.id,
      booking_id: payment.booking_id || booking.booking_id,

      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || "",
      payment_status: payment.payment_status || "pending",
      created_at: payment.created_at || "",

      dorm_name: payment.dorm_name || dorm.dorm_name || "Dorm",
    };
  };

  const normalizeMaintenanceRequest = (request) => {
    const booking = request.booking || {};
    const room = request.room || booking.room || {};
    const dorm = room.dorm || {};

    return {
      ...request,
      maintenance_request_id:
        request.maintenance_request_id || request.request_id || request.id,
      booking_id: request.booking_id || booking.booking_id,
      room_id: request.room_id || room.room_id || "",
      room_number: request.room_number || room.room_number || "",
      room_type: request.room_type || room.room_type || "",

      dorm_name: request.dorm_name || dorm.dorm_name || "Dorm",
      request_description:
        request.request_description || "Maintenance Request",
      request_status: request.request_status || "pending",
      created_at: request.created_at || "",
    };
  };

  const sortNewest = (items, idField) => {
    return items.slice().sort((a, b) => {
      return Number(b[idField] || 0) - Number(a[idField] || 0);
    });
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [
        residentsResponse,
        bookingsResponse,
        paymentsResponse,
        requestsResponse,
      ] = await Promise.all([
        getResidents().catch(() => []),
        getBookings().catch(() => []),
        getPayments().catch(() => []),
        getMaintenanceRequests().catch(() => []),
      ]);

      const residentsList = Array.isArray(residentsResponse)
        ? residentsResponse
        : residentsResponse.data || [];

      const bookingsList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      const paymentsList = Array.isArray(paymentsResponse)
        ? paymentsResponse
        : paymentsResponse.data || [];

      const requestsList = Array.isArray(requestsResponse)
        ? requestsResponse
        : requestsResponse.data || [];

      const normalizedResidents = residentsList.map(normalizeResident);

      const currentResident = normalizedResidents.find((item) => {
        const sameId =
          String(item.resident_id || "") === String(loggedInResidentId);
        const sameEmail = String(item.email || "").toLowerCase() === loggedInUserEmail;

        return sameId || sameEmail;
      });

      const normalizedBookings = bookingsList.map(normalizeBooking);

      const userBookings = normalizedBookings.filter((booking) => {
        const sameId =
          String(booking.resident_id || "") === String(loggedInResidentId);
        const sameEmail =
          String(booking.email || "").toLowerCase() === loggedInUserEmail;

        return sameId || sameEmail;
      });

      const userBookingIds = userBookings.map((booking) =>
        Number(booking.booking_id)
      );

      const userPayments = paymentsList.map(normalizePayment).filter((payment) => {
        return userBookingIds.includes(Number(payment.booking_id));
      });

      const userRequests = requestsList
        .map(normalizeMaintenanceRequest)
        .filter((request) => {
          return userBookingIds.includes(Number(request.booking_id));
        });

      setResident(currentResident || null);
      setMyBookings(sortNewest(userBookings, "booking_id"));
      setMyPayments(sortNewest(userPayments, "payment_id"));
      setMyRequests(sortNewest(userRequests, "maintenance_request_id"));
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      alert("Could not load dashboard data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const fullName = resident?.full_name || loggedInUserName;
  const finalUserType = resident?.role || loggedInUserType;

  let affiliation = "-";

  if (finalUserType === "student") {
    affiliation = resident?.university || "-";
  } else if (finalUserType === "employee") {
    affiliation = resident?.company || "-";
  }

  const approvedBookings = myBookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "approved"
  ).length;

  const pendingBookings = myBookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "pending"
  ).length;

  const completedPayments = myPayments.filter((payment) => {
    const status = normalizeStatus(payment.payment_status);
    return status === "paid" || status === "completed";
  }).length;

  const activeBooking = myBookings.find((booking) => {
    const status = normalizeStatus(booking.booking_status);
    return status === "approved" || status === "pending";
  });

  const recentActivities = [];

  myBookings.slice(0, 2).forEach((booking) => {
    recentActivities.push({
      text: `Booking ${displayStatus(booking.booking_status)} for ${
        booking.dorm_name || "Dorm"
      }`,
      dotClass: "blue-dot",
    });
  });

  myPayments.slice(0, 1).forEach((payment) => {
    recentActivities.push({
      text: `Payment ${displayStatus(payment.payment_status)}: $${
        payment.amount || 0
      } for ${payment.dorm_name || "Dorm"}`,
      dotClass: "green-dot",
    });
  });

  myRequests.slice(0, 2).forEach((request) => {
    recentActivities.push({
      text: `Maintenance request is ${displayStatus(
        request.request_status
      )}`,
      dotClass: "purple-dot",
    });
  });

  const firstName = fullName.split(" ")[0] || "Resident";
  const avatarLetter = fullName.charAt(0).toUpperCase() || "R";

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>UniNest</h2>
          <p>Resident Panel</p>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a href="/student-dashboard" className="active">
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

      <main className="dashboard-main">
        <div className="topbar">
          <div>
            <h1>Welcome Back, {firstName}</h1>
            <p>
              Manage your bookings, payments, maintenance requests, and
              notifications.
            </p>
          </div>

          <div className="topbar-user">
            <div className="user-avatar">{avatarLetter}</div>
          </div>
        </div>

        {loading ? (
          <section className="dashboard-card">
            <h2>Loading dashboard...</h2>
          </section>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon navy">
                  <i className="fa-solid fa-list"></i>
                </div>
                <div>
                  <h3>{myBookings.length}</h3>
                  <p>Total Bookings</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue">
                  <i className="fa-solid fa-bed"></i>
                </div>
                <div>
                  <h3>{approvedBookings}</h3>
                  <p>Approved Bookings</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon cyan">
                  <i className="fa-solid fa-clock"></i>
                </div>
                <div>
                  <h3>{pendingBookings}</h3>
                  <p>Pending Bookings</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <i className="fa-solid fa-credit-card"></i>
                </div>
                <div>
                  <h3>{completedPayments}</h3>
                  <p>Completed Payments</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <i className="fa-solid fa-screwdriver-wrench"></i>
                </div>
                <div>
                  <h3>{myRequests.length}</h3>
                  <p>Maintenance Requests</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <div>
                  <h3>0</h3>
                  <p>Unread Notifications</p>
                </div>
              </div>
            </section>

            <section className="dashboard-grid">
              <div className="dashboard-card large-card">
                <div className="card-header">
                  <h2>Current Booking</h2>

                  <span
                    className={`status-badge ${
                      activeBooking
                        ? normalizeStatus(activeBooking.booking_status)
                        : "rejected"
                    }`}
                  >
                    {activeBooking
                      ? displayStatus(activeBooking.booking_status)
                      : "No Booking"}
                  </span>
                </div>

                <div className="booking-info">
                  <div className="booking-image">
                    <img src={getDormImage()} alt="Dorm" />
                  </div>

                  <div className="booking-details">
                    <h3>{activeBooking?.dorm_name || "No booking yet"}</h3>

                    <p>
                      <i className="fa-solid fa-location-dot"></i>{" "}
                      {activeBooking?.city || "-"}
                      {activeBooking?.area ? ` - ${activeBooking.area}` : ""}
                    </p>

                    <p>
                      <i className="fa-solid fa-door-open"></i>{" "}
                      {activeBooking
                        ? `${activeBooking.room_type || "-"} - Room ${
                            activeBooking.room_number || "-"
                          }`
                        : "-"}
                    </p>

                    <p>
                      <i className="fa-solid fa-dollar-sign"></i>{" "}
                      {activeBooking
                        ? `$${activeBooking.room_price || 0} / month`
                        : "-"}
                    </p>

                    <p>
                      <i className="fa-solid fa-calendar-check"></i>{" "}
                      {activeBooking
                        ? `Check-in: ${activeBooking.check_in_date || "-"}`
                        : "-"}
                    </p>

                    <div className="booking-actions">
                      <a href="/my-bookings" className="primary-btn">
                        View Details
                      </a>

                      <a href="/maintenance" className="secondary-btn">
                        Request Maintenance
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Quick Actions</h2>
                </div>

                <div className="quick-actions">
                  <a href="/housings" className="action-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <span>Find Dorm</span>
                  </a>

                  <a href="/my-bookings" className="action-box">
                    <i className="fa-solid fa-bed"></i>
                    <span>My Bookings</span>
                  </a>

                  <a href="/payment" className="action-box">
                    <i className="fa-solid fa-credit-card"></i>
                    <span>Payments</span>
                  </a>

                  <a href="/maintenance" className="action-box">
                    <i className="fa-solid fa-screwdriver-wrench"></i>
                    <span>Maintenance</span>
                  </a>

                  <a href="/notifications" className="action-box">
                    <i className="fa-solid fa-bell"></i>
                    <span>Notifications</span>
                  </a>

                  <a href="/profile" className="action-box">
                    <i className="fa-solid fa-user-pen"></i>
                    <span>Edit Profile</span>
                  </a>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Recent Activity</h2>
                </div>

                <ul className="activity-list">
                  {recentActivities.length === 0 ? (
                    <li>
                      <span className="dot blue-dot"></span> No recent activity
                      yet
                    </li>
                  ) : (
                    recentActivities.map((activity, index) => (
                      <li key={index}>
                        <span className={`dot ${activity.dotClass}`}></span>{" "}
                        {activity.text}
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Profile Summary</h2>
                </div>

                <div className="profile-summary">
                  <p>
                    <strong>Name:</strong> {fullName}
                  </p>

                  <p>
                    <strong>Email:</strong> {loggedInUserEmail || "-"}
                  </p>

                  <p>
                    <strong>Role:</strong>{" "}
                    {finalUserType.charAt(0).toUpperCase() +
                      finalUserType.slice(1)}
                  </p>

                  <p>
                    <strong>University / Company:</strong> {affiliation}
                  </p>

                  <p>
                    <strong>Status:</strong> Active Resident
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentDashboardPage;