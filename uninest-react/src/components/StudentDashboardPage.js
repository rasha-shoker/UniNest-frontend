import "./StudentDashboardPage.css";

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

  const getDormImage = (imagePath) => {
    const path = imagePath || "images/aub1.jpg";
    const fileName = path.replace("images/", "");

    try {
      return require(`../assets/images/${fileName}`);
    } catch {
      return require("../assets/images/aub1.jpg");
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

  const getNotifications = () => {
    return JSON.parse(localStorage.getItem("notifications")) || [];
  };

  const normalizeResident = (resident) => {
    const firstName = resident.first_name || resident.firstName || "";
    const lastName = resident.last_name || resident.lastName || "";

    const fullName =
      (firstName + " " + lastName).trim() ||
      resident.fullName ||
      resident.name ||
      loggedInUserName;

    return {
      ...resident,
      resident_id: resident.resident_id || resident.id,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      email: resident.email || "",
      phone: resident.phone || "",
      user_type: resident.user_type || resident.role || "student",
      university_name: resident.university_name || resident.university || "",
      major: resident.major || "",
      company_name: resident.company_name || resident.company || "",
      job_position: resident.job_position || resident.jobTitle || "",
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
        "",

      email:
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        "",

      dorm_id: booking.dorm_id || booking.housingId,
      dorm_name: booking.dorm_name || booking.housingName || "Dorm Name",
      dorm_image: booking.dorm_image || booking.housingImage || "images/aub1.jpg",

      university_name: booking.university_name || booking.university || "",
      city: booking.city || "",
      area: booking.area || booking.location || "",

      room_id: booking.room_id || booking.roomId || "",
      room_number: booking.room_number || booking.roomNumber || "",
      room_type: booking.room_type || booking.roomType || "",
      room_price: Number(booking.room_price || booking.price || 0),

      check_in_date: booking.check_in_date || booking.checkInDate || "-",
      check_out_date: booking.check_out_date || booking.checkOutDate || "-",

      total_price: Number(booking.total_price || booking.totalCost || 0),

      booking_status: booking.booking_status || booking.status || "Pending",
      payment_status: booking.payment_status || booking.paymentStatus || "Pending",

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

      payment_id: payment.payment_id || payment.paymentId || payment.id,
      booking_id: payment.booking_id || payment.bookingId,

      resident_id: payment.resident_id || "",
      resident_name: payment.resident_name || payment.userName || payment.studentName || "",
      email: payment.email || payment.userEmail || payment.studentEmail || "",

      dorm_id: payment.dorm_id || payment.housingId,
      dorm_name: payment.dorm_name || payment.housingName || "Dorm",

      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || payment.method || "",
      payment_status: payment.payment_status || payment.status || "Pending",
      payment_date: payment.payment_date || payment.paymentDate || "",
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
        "",

      email:
        request.email ||
        request.userEmail ||
        request.studentEmail ||
        request.residentEmail ||
        "",

      dorm_id: request.dorm_id || request.housingId,
      dorm_name: request.dorm_name || request.housingName || request.currentHousing || "Dorm",

      request_title: request.request_title || request.title || "Maintenance Request",
      request_status: request.request_status || request.status || "Pending",
      request_date:
        request.request_date ||
        request.submittedDate ||
        request.createdAt ||
        request.date ||
        "",
    };
  };

  const normalizeNotification = (notification) => {
    return {
      ...notification,

      notification_id: notification.notification_id || notification.id,

      resident_id: notification.resident_id || "",
      email: notification.email || notification.userEmail || "",

      title: notification.title || "Notification",
      message: notification.message || "-",
      notification_type:
        notification.notification_type || notification.type || "notification",

      is_read:
        notification.is_read !== undefined
          ? notification.is_read
          : notification.isRead || false,

      created_at: notification.created_at || notification.date || "",
    };
  };

  const isPaid = (value) => {
    return value === "Completed" || value === "Paid";
  };

  const isMineByResidentOrEmail = (item) => {
    const itemResidentId = String(item.resident_id || "");
    const itemEmail = String(item.email || "").toLowerCase();

    return itemResidentId === String(loggedInResidentId) || itemEmail === loggedInUserEmail;
  };

  const sortNewest = (items, idField) => {
    return items.slice().sort((a, b) => {
      return Number(b[idField] || 0) - Number(a[idField] || 0);
    });
  };

  const getMyBookings = () => {
    return sortNewest(
      getBookings().map(normalizeBooking).filter(isMineByResidentOrEmail),
      "booking_id"
    );
  };

  const getMyPayments = () => {
    return sortNewest(
      getPayments().map(normalizePayment).filter(isMineByResidentOrEmail),
      "payment_id"
    );
  };

  const getMyMaintenanceRequests = () => {
    return sortNewest(
      getMaintenanceRequests()
        .map(normalizeMaintenanceRequest)
        .filter(isMineByResidentOrEmail),
      "request_id"
    );
  };

  const getMyNotifications = () => {
    return sortNewest(
      getNotifications().map(normalizeNotification).filter(isMineByResidentOrEmail),
      "notification_id"
    );
  };

  const residents = getResidents();

  const resident = residents.find((item) => {
    const sameId = String(item.resident_id || "") === String(loggedInResidentId);
    const sameEmail = (item.email || "").toLowerCase() === loggedInUserEmail;

    return sameId || sameEmail;
  });

  const fullName = resident?.full_name || loggedInUserName;
  const finalUserType = resident?.user_type || loggedInUserType;

  let affiliation = "-";

  if (finalUserType === "student") {
    affiliation = resident?.university_name || "-";
  } else if (finalUserType === "employee") {
    affiliation = resident?.company_name || "-";
  }

  const myBookings = getMyBookings();
  const myPayments = getMyPayments();
  const myRequests = getMyMaintenanceRequests();
  const myNotifications = getMyNotifications();

  const approvedBookings = myBookings.filter(
    (booking) => booking.booking_status === "Approved"
  ).length;

  const pendingBookings = myBookings.filter(
    (booking) => booking.booking_status === "Pending"
  ).length;

  const completedPayments = myPayments.filter((payment) =>
    isPaid(payment.payment_status)
  ).length;

  const unreadNotifications = myNotifications.filter(
    (notification) => notification.is_read === false
  ).length;

  const activeBooking = myBookings.find((booking) => {
    return (
      booking.booking_status === "Approved" ||
      booking.booking_status === "Pending"
    );
  });

  const recentActivities = [];

  myBookings.slice(0, 2).forEach((booking) => {
    recentActivities.push({
      text: `Booking ${booking.booking_status || "Pending"} for ${
        booking.dorm_name || "Dorm"
      }`,
      dotClass: "blue-dot",
    });
  });

  myPayments.slice(0, 1).forEach((payment) => {
    recentActivities.push({
      text: `Payment ${payment.payment_status || "Completed"}: $${
        payment.amount || 0
      } for ${payment.dorm_name || "Dorm"}`,
      dotClass: "green-dot",
    });
  });

  myRequests.slice(0, 2).forEach((request) => {
    recentActivities.push({
      text: `Maintenance request "${
        request.request_title || "Request"
      }" is ${request.request_status || "Pending"}`,
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
              <h3>{unreadNotifications}</h3>
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
                    ? (activeBooking.booking_status || "Pending").toLowerCase()
                    : "rejected"
                }`}
              >
                {activeBooking ? activeBooking.booking_status : "No Booking"}
              </span>
            </div>

            <div className="booking-info">
              <div className="booking-image">
                <img
                  src={getDormImage(activeBooking?.dorm_image)}
                  alt={activeBooking?.dorm_name || "Housing"}
                />
              </div>

              <div className="booking-details">
                <h3>{activeBooking?.dorm_name || "No booking yet"}</h3>

                <p>
                  <i className="fa-solid fa-location-dot"></i>{" "}
                  {activeBooking?.area || activeBooking?.city || "-"}
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

                <p>
                  <i className="fa-solid fa-credit-card"></i>{" "}
                  {activeBooking
                    ? `Payment: ${activeBooking.payment_status || "Pending"}`
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
                  <span className="dot blue-dot"></span> No recent activity yet
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
              <h2>Recent Notifications</h2>
              <a href="/notifications" className="small-link">
                View All
              </a>
            </div>

            <ul className="activity-list">
              {myNotifications.length === 0 ? (
                <li>
                  <span className="dot blue-dot"></span> No notifications yet
                </li>
              ) : (
                myNotifications.slice(0, 4).map((notification) => {
                  const dotClass = notification.is_read ? "blue-dot" : "green-dot";

                  return (
                    <li key={notification.notification_id}>
                      <span className={`dot ${dotClass}`}></span>{" "}
                      <strong>{notification.title || "Notification"}:</strong>{" "}
                      {notification.message || "-"}
                    </li>
                  );
                })
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
                {finalUserType.charAt(0).toUpperCase() + finalUserType.slice(1)}
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
      </main>
    </div>
  );
}

export default StudentDashboardPage;