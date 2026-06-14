import { useState } from "react";
import "./NotificationsPage.css";

function NotificationsPage() {
  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";
  const loggedInUserEmail = (
    localStorage.getItem("loggedInUserEmail") || ""
  ).toLowerCase();

  const [typeFilter, setTypeFilter] = useState("All");
  const [readFilter, setReadFilter] = useState("All");
  const [refresh, setRefresh] = useState(0);

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

  const getNotifications = () => {
    return JSON.parse(localStorage.getItem("notifications")) || [];
  };

  const saveNotifications = (notifications) => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
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

  const normalizeType = (type) => {
    return String(type || "notification").toLowerCase();
  };

  const displayType = (type) => {
    const value = normalizeType(type);

    if (value === "booking") return "Booking";
    if (value === "payment") return "Payment";
    if (value === "maintenance") return "Maintenance";
    if (value === "review") return "Review";

    return "Notification";
  };

  const getNotificationIcon = (type) => {
    const value = normalizeType(type);

    if (value === "booking") return "fa-bed";
    if (value === "payment") return "fa-credit-card";
    if (value === "maintenance") return "fa-screwdriver-wrench";
    if (value === "review") return "fa-star";

    return "fa-bell";
  };

  const getMyNotifications = () => {
    return getNotifications()
      .map(normalizeNotification)
      .filter((notification) => {
        const notificationResidentId = String(notification.resident_id || "");
        const notificationEmail = (notification.email || "").toLowerCase();

        return (
          notificationResidentId === String(loggedInResidentId) ||
          notificationEmail === loggedInUserEmail
        );
      })
      .sort((a, b) => Number(b.notification_id || 0) - Number(a.notification_id || 0));
  };

  const myNotifications = getMyNotifications();

  const filteredNotifications = myNotifications.filter((notification) => {
    const notificationType = normalizeType(notification.notification_type);

    const matchType =
      typeFilter === "All" || notificationType === typeFilter;

    const matchRead =
      readFilter === "All" ||
      (readFilter === "Unread" && notification.is_read === false) ||
      (readFilter === "Read" && notification.is_read === true);

    return matchType && matchRead;
  });

  const unreadCount = myNotifications.filter(
    (notification) => notification.is_read === false
  ).length;

  const bookingCount = myNotifications.filter(
    (notification) => normalizeType(notification.notification_type) === "booking"
  ).length;

  const paymentCount = myNotifications.filter(
    (notification) => normalizeType(notification.notification_type) === "payment"
  ).length;

  const maintenanceCount = myNotifications.filter(
    (notification) =>
      normalizeType(notification.notification_type) === "maintenance"
  ).length;

  const reviewCount = myNotifications.filter(
    (notification) => normalizeType(notification.notification_type) === "review"
  ).length;

  const markAsRead = (notificationId) => {
    const notifications = getNotifications();

    const updatedNotifications = notifications.map((notification) => {
      const normalized = normalizeNotification(notification);

      const sameNotification =
        Number(normalized.notification_id) === Number(notificationId);

      const sameResident =
        String(normalized.resident_id || "") === String(loggedInResidentId) ||
        (normalized.email || "").toLowerCase() === loggedInUserEmail;

      if (sameNotification && sameResident) {
        return {
          ...notification,
          is_read: true,
          isRead: true,
        };
      }

      return notification;
    });

    saveNotifications(updatedNotifications);
    setRefresh(refresh + 1);
  };

  const markAllAsRead = () => {
    const notifications = getNotifications();

    const updatedNotifications = notifications.map((notification) => {
      const normalized = normalizeNotification(notification);

      const sameResident =
        String(normalized.resident_id || "") === String(loggedInResidentId) ||
        (normalized.email || "").toLowerCase() === loggedInUserEmail;

      if (sameResident) {
        return {
          ...notification,
          is_read: true,
          isRead: true,
        };
      }

      return notification;
    });

    saveNotifications(updatedNotifications);
    setRefresh(refresh + 1);
  };

  const deleteNotification = (notificationId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!ok) return;

    const notifications = getNotifications();

    const updatedNotifications = notifications.filter((notification) => {
      const normalized = normalizeNotification(notification);

      const sameNotification =
        Number(normalized.notification_id) === Number(notificationId);

      const sameResident =
        String(normalized.resident_id || "") === String(loggedInResidentId) ||
        (normalized.email || "").toLowerCase() === loggedInUserEmail;

      return !(sameNotification && sameResident);
    });

    saveNotifications(updatedNotifications);
    setRefresh(refresh + 1);
  };

  const deleteAllNotifications = () => {
    const ok = window.confirm(
      "Are you sure you want to delete all your notifications?"
    );

    if (!ok) return;

    const notifications = getNotifications();

    const updatedNotifications = notifications.filter((notification) => {
      const normalized = normalizeNotification(notification);

      const sameResident =
        String(normalized.resident_id || "") === String(loggedInResidentId) ||
        (normalized.email || "").toLowerCase() === loggedInUserEmail;

      return !sameResident;
    });

    saveNotifications(updatedNotifications);
    setRefresh(refresh + 1);
  };

  return (
    <div className="notifications-layout">
      <aside className="notifications-sidebar">
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
            <a href="/notifications" className="active">
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

      <main className="notifications-main">
        <div className="notifications-topbar">
          <div>
            <h1>Notifications</h1>
            <p>View booking, payment, maintenance, and review updates.</p>
          </div>

          <div className="topbar-actions">
            <button className="mark-btn" onClick={markAllAsRead}>
              <i className="fa-solid fa-check-double"></i>
              Mark All as Read
            </button>

            <button className="delete-all-btn" onClick={deleteAllNotifications}>
              <i className="fa-solid fa-trash"></i>
              Delete All
            </button>
          </div>
        </div>

        <section className="notifications-stats">
          <div className="stat-card">
            <h3>{myNotifications.length}</h3>
            <p>Total</p>
          </div>

          <div className="stat-card">
            <h3>{unreadCount}</h3>
            <p>Unread</p>
          </div>

          <div className="stat-card">
            <h3>{bookingCount}</h3>
            <p>Booking</p>
          </div>

          <div className="stat-card">
            <h3>{paymentCount}</h3>
            <p>Payment</p>
          </div>

          <div className="stat-card">
            <h3>{maintenanceCount}</h3>
            <p>Maintenance</p>
          </div>

          <div className="stat-card">
            <h3>{reviewCount}</h3>
            <p>Review</p>
          </div>
        </section>

        <section className="notifications-filter-card">
          <div className="filter-group">
            <label htmlFor="typeFilter">Filter by Type</label>

            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="All">All Types</option>
              <option value="booking">Booking</option>
              <option value="payment">Payment</option>
              <option value="maintenance">Maintenance</option>
              <option value="review">Review</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="readFilter">Filter by Status</label>

            <select
              id="readFilter"
              value={readFilter}
              onChange={(event) => setReadFilter(event.target.value)}
            >
              <option value="All">All</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
        </section>

        <section className="notifications-list">
          {filteredNotifications.map((notification) => {
            const notificationType = normalizeType(notification.notification_type);

            return (
              <div
                className={
                  notification.is_read
                    ? "notification-card read"
                    : "notification-card unread"
                }
                key={notification.notification_id}
              >
                <div className={`notification-icon ${notificationType}`}>
                  <i
                    className={`fa-solid ${getNotificationIcon(
                      notificationType
                    )}`}
                  ></i>
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h2>{notification.title || "Notification"}</h2>

                    <span className="notification-type">
                      {displayType(notificationType)}
                    </span>
                  </div>

                  <p>{notification.message || "-"}</p>

                  <small>
                    <i className="fa-solid fa-calendar-days"></i>{" "}
                    {notification.created_at || ""}
                  </small>
                </div>

                <div className="notification-actions">
                  {notification.is_read ? (
                    <button className="disabled-btn" disabled>
                      Read
                    </button>
                  ) : (
                    <button
                      className="read-btn"
                      onClick={() => markAsRead(notification.notification_id)}
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteNotification(notification.notification_id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {filteredNotifications.length === 0 && (
          <div className="empty-notifications">
            <h3>No notifications found</h3>
            <p>You do not have any notifications yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default NotificationsPage;