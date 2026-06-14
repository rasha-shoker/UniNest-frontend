import { useState } from "react";
import "./MyBookingsPage.css";

function MyBookingsPage() {
  const [refresh, setRefresh] = useState(0);

  const getCurrentUserEmailValue = () => {
    return localStorage.getItem("loggedInUserEmail") || "";
  };

  const getCurrentResidentIdValue = () => {
    return localStorage.getItem("loggedInResidentId") || "";
  };

  const getAllBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const saveBookings = (bookings) => {
    localStorage.setItem("studentBookings", JSON.stringify(bookings));
  };

  const getNotifications = () => {
    return JSON.parse(localStorage.getItem("notifications")) || [];
  };

  const saveNotifications = (notifications) => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDormImage = (imagePath) => {
    const path = imagePath || "images/aub1.jpg";
    const fileName = path.replace("images/", "");

    try {
      return require(`../assets/images/${fileName}`);
    } catch {
      return require("../assets/images/aub1.jpg");
    }
  };

  const addNotification = (residentId, notificationType, title, message) => {
    if (!residentId && !getCurrentUserEmailValue()) {
      return;
    }

    const notifications = getNotifications();

    const notificationId = Date.now() + Math.floor(Math.random() * 1000);

    const newNotification = {
      notification_id: notificationId,
      resident_id: residentId || "",
      title: title,
      message: message,
      notification_type: notificationType,
      is_read: false,
      created_at: formatDateToday(),

      id: notificationId,
      userEmail: getCurrentUserEmailValue(),
      type: notificationType,
      isRead: false,
      date: formatDateToday(),
    };

    notifications.unshift(newNotification);
    saveNotifications(notifications);
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

      check_in_date:
        booking.check_in_date ||
        booking.checkInDate ||
        booking.moveInDate ||
        "Not selected",

      check_out_date:
        booking.check_out_date || booking.checkOutDate || "Not selected",

      total_price: Number(booking.total_price || booking.totalCost || 0),

      booking_status: booking.booking_status || booking.status || "Pending",

      document_type:
        booking.document_type || booking.documentType || "Not uploaded",

      document_status:
        booking.document_status || booking.documentStatus || "Pending",

      payment_status:
        booking.payment_status || booking.paymentStatus || "Pending",

      payment_method:
        booking.payment_method || booking.paymentMethod || "Not paid yet",

      created_at: booking.created_at || booking.createdAt || "Not specified",
    };
  };

  const getUserBookings = () => {
    const currentEmail = getCurrentUserEmailValue().toLowerCase();
    const currentResidentId = String(getCurrentResidentIdValue());

    const bookings = getAllBookings();

    return bookings
      .map(normalizeBooking)
      .filter((booking) => {
        const bookingEmail = (booking.email || "").toLowerCase();
        const bookingResidentId = String(booking.resident_id || "");

        return (
          bookingResidentId === currentResidentId || bookingEmail === currentEmail
        );
      });
  };

  const getStatusClass = (status) => {
    return String(status || "Pending").toLowerCase();
  };

  const cancelBooking = (bookingId) => {
    const ok = window.confirm("Are you sure you want to cancel this booking?");

    if (!ok) {
      return;
    }

    const currentEmail = getCurrentUserEmailValue().toLowerCase();
    const currentResidentId = String(getCurrentResidentIdValue());

    const bookings = getAllBookings();

    let cancelledBooking = null;

    const updatedBookings = bookings.map((booking) => {
      const normalized = normalizeBooking(booking);

      const sameBooking = Number(normalized.booking_id) === Number(bookingId);

      const sameResident =
        String(normalized.resident_id || "") === currentResidentId ||
        (normalized.email || "").toLowerCase() === currentEmail;

      if (
        sameBooking &&
        sameResident &&
        normalized.booking_status === "Pending"
      ) {
        cancelledBooking = {
          ...booking,
          booking_status: "Cancelled",
          status: "Cancelled",
        };

        return cancelledBooking;
      }

      return booking;
    });

    saveBookings(updatedBookings);

    if (cancelledBooking) {
      const normalizedCancelled = normalizeBooking(cancelledBooking);

      addNotification(
        normalizedCancelled.resident_id || currentResidentId,
        "booking",
        "Booking Cancelled",
        "Your booking request for " +
          normalizedCancelled.dorm_name +
          " has been cancelled."
      );
    }

    alert("Booking cancelled successfully.");
    setRefresh(refresh + 1);
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

  const bookings = getUserBookings();

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (booking) => booking.booking_status === "Pending"
  ).length;
  const approvedBookings = bookings.filter(
    (booking) => booking.booking_status === "Approved"
  ).length;
  const rejectedBookings = bookings.filter(
    (booking) => booking.booking_status === "Rejected"
  ).length;
  const cancelledBookings = bookings.filter(
    (booking) => booking.booking_status === "Cancelled"
  ).length;

  return (
    <div className="bookings-layout">
      <aside className="bookings-sidebar">
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
            <a href="/my-bookings" className="active">
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

      <main className="bookings-main">
        <div className="bookings-topbar">
          <div>
            <h1>My Bookings</h1>
            <p>View your current and previous dorm booking requests.</p>
          </div>

          <a href="/housings" className="primary-btn">
            <i className="fa-solid fa-plus"></i> New Booking
          </a>
        </div>

        <section className="booking-summary-stats">
          <div className="summary-box">
            <h3>{totalBookings}</h3>
            <p>Total Bookings</p>
          </div>

          <div className="summary-box">
            <h3>{pendingBookings}</h3>
            <p>Pending</p>
          </div>

          <div className="summary-box">
            <h3>{approvedBookings}</h3>
            <p>Approved</p>
          </div>

          <div className="summary-box">
            <h3>{rejectedBookings}</h3>
            <p>Rejected</p>
          </div>

          <div className="summary-box">
            <h3>{cancelledBookings}</h3>
            <p>Cancelled</p>
          </div>
        </section>

        <section className="booking-cards">
          {bookings.map((booking) => {
            const bookingId = booking.booking_id;
            const dormId = booking.dorm_id;

            const bookingStatus = booking.booking_status || "Pending";
            const documentStatus = booking.document_status || "Pending";
            const paymentStatus = booking.payment_status || "Pending";

            const checkInDate = booking.check_in_date || "Not selected";
            const checkOutDate = booking.check_out_date || "Not selected";
            const totalPrice = booking.total_price || 0;

            return (
              <div className="booking-card" key={bookingId}>
                <div className="booking-card-image">
                  <img
                    src={getDormImage(booking.dorm_image)}
                    alt={booking.dorm_name || "Dorm"}
                  />
                </div>

                <div className="booking-card-content">
                  <div className="booking-card-header">
                    <h2>{booking.dorm_name || "Dorm Name"}</h2>

                    <span
                      className={`booking-status ${getStatusClass(
                        bookingStatus
                      )}`}
                    >
                      {bookingStatus}
                    </span>
                  </div>

                  <div className="booking-meta">
                    <p>
                      <i className="fa-solid fa-location-dot"></i>{" "}
                      {booking.area ||
                        booking.city ||
                        "Location not specified"}
                    </p>

                    <p>
                      <i className="fa-solid fa-school"></i> Near{" "}
                      {booking.university_name || "Nearby university"}
                    </p>

                    <p>
                      <i className="fa-solid fa-door-open"></i> Room Number:{" "}
                      {booking.room_number || "Not specified"}
                    </p>

                    <p>
                      <i className="fa-solid fa-bed"></i> Room Type:{" "}
                      {booking.room_type || "Not specified"}
                    </p>

                    <p>
                      <i className="fa-solid fa-dollar-sign"></i> Price/month: $
                      {booking.room_price || 0}
                    </p>

                    <p>
                      <i className="fa-solid fa-calendar-check"></i> Check-in:{" "}
                      {checkInDate}
                    </p>

                    <p>
                      <i className="fa-solid fa-calendar-xmark"></i> Check-out:{" "}
                      {checkOutDate}
                    </p>

                    <p>
                      <i className="fa-solid fa-money-bill"></i> Total Cost: $
                      {totalPrice}
                    </p>

                    <p>
                      <i className="fa-solid fa-credit-card"></i> Payment
                      Status: {paymentStatus}
                    </p>

                    <p>
                      <i className="fa-solid fa-receipt"></i> Payment Method:{" "}
                      {booking.payment_method || "Not paid yet"}
                    </p>

                    <p>
                      <i className="fa-solid fa-file"></i> Document:{" "}
                      {booking.document_type || "Not uploaded"}
                    </p>

                    <p>
                      <i className="fa-solid fa-file-circle-check"></i> Document
                      Status: {documentStatus}
                    </p>

                    <p>
                      <i className="fa-solid fa-clock"></i> Submitted:{" "}
                      {booking.created_at || "Not specified"}
                    </p>
                  </div>

                  <div className="booking-actions">
                    <a
                      href={`/housing-details?id=${dormId}`}
                      className="view-btn"
                    >
                      View Dorm
                    </a>

                    {bookingStatus === "Pending" && (
                      <button
                        type="button"
                        onClick={() => cancelBooking(bookingId)}
                        className="cancel-btn"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {bookingStatus === "Approved" &&
                      (paymentStatus === "Completed" ||
                      paymentStatus === "Paid" ? (
                        <>
                          <button
                            type="button"
                            className="disabled-btn"
                            disabled
                          >
                            Paid
                          </button>

                          <a
                            href={`/review?bookingId=${bookingId}`}
                            className="review-btn"
                          >
                            Write Review
                          </a>
                        </>
                      ) : (
                        <a
                          href={`/payment?bookingId=${bookingId}`}
                          className="success-btn"
                        >
                          Pay Now
                        </a>
                      ))}

                    {(bookingStatus === "Rejected" ||
                      bookingStatus === "Cancelled") && (
                      <button type="button" className="disabled-btn" disabled>
                        {bookingStatus}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {bookings.length === 0 && (
          <div className="empty-bookings">
            <h3>No bookings yet</h3>
            <p>You have not submitted any dorm booking request yet.</p>
            <a href="/housings" className="primary-btn">
              Explore Dorms
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyBookingsPage;