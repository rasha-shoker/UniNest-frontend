import { useEffect, useState } from "react";
import "./MyBookingsPage.css";
import { getBookings, getDocuments, getPayments, updateBooking } from "../api";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCurrentUserEmailValue = () => {
    return localStorage.getItem("loggedInUserEmail") || "";
  };

  const getCurrentResidentIdValue = () => {
    return localStorage.getItem("loggedInResidentId") || "";
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

    return "Pending";
  };

  const getStatusClass = (status) => {
    return normalizeStatus(status);
  };

  const getDormImage = () => {
    try {
      return require("../assets/images/aub1.jpg");
    } catch {
      return "";
    }
  };

  const normalizeBooking = (booking) => {
    const room = booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
    const resident = booking.resident || {};

    return {
      ...booking,

      booking_id: booking.booking_id || booking.id,
      resident_id: booking.resident_id || resident.resident_id || "",
      resident_name: booking.resident_name || resident.full_name || "",
      email: booking.email || resident.email || "",

      dorm_id: booking.dorm_id || dorm.dorm_id || room.dorm_id || "",
      dorm_name: booking.dorm_name || dorm.dorm_name || "Dorm Name",

      city: booking.city || dorm.city || "",
      area: booking.area || dorm.area || "",

      room_id: booking.room_id || room.room_id || "",
      room_number: booking.room_number || room.room_number || "",
      room_type: booking.room_type || room.room_type || "",
      room_price: Number(booking.room_price || room.room_price || 0),

      check_in_date: booking.check_in_date || "Not selected",
      check_out_date: booking.check_out_date || "Not selected",
      total_price: Number(booking.total_price || 0),

      booking_status: booking.booking_status || "pending",
      admin_note: booking.admin_note || "",
      created_at: booking.created_at || "Not specified",
    };
  };

  const getPaymentForBooking = (bookingId) => {
    return payments.find((payment) => {
      return Number(payment.booking_id) === Number(bookingId);
    });
  };

  const getDocumentForBooking = (bookingId) => {
    return documents.find((document) => {
      return Number(document.booking_id) === Number(bookingId);
    });
  };

  const getPaymentStatusForBooking = (bookingId) => {
    const payment = getPaymentForBooking(bookingId);

    if (!payment) {
      return "pending";
    }

    return payment.payment_status || "pending";
  };

  const getPaymentMethodForBooking = (bookingId) => {
    const payment = getPaymentForBooking(bookingId);

    if (!payment) {
      return "Not paid yet";
    }

    return payment.payment_method || "Not paid yet";
  };

  const getDocumentStatusForBooking = (bookingId) => {
    const document = getDocumentForBooking(bookingId);

    if (!document) {
      return "pending";
    }

    return document.document_status || "pending";
  };

  const getDocumentTypeForBooking = (bookingId) => {
    const document = getDocumentForBooking(bookingId);

    if (!document) {
      return "Not uploaded";
    }

    return document.document_type || "Not uploaded";
  };

  const loadBookings = async () => {
    try {
      setLoading(true);

      const [bookingsResponse, paymentsResponse, documentsResponse] =
        await Promise.all([
          getBookings(),
          getPayments().catch(() => []),
          getDocuments().catch(() => []),
        ]);

      const bookingsList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      const paymentsList = Array.isArray(paymentsResponse)
        ? paymentsResponse
        : paymentsResponse.data || [];

      const documentsList = Array.isArray(documentsResponse)
        ? documentsResponse
        : documentsResponse.data || [];

      const currentEmail = getCurrentUserEmailValue().toLowerCase();
      const currentResidentId = String(getCurrentResidentIdValue());

      const userBookings = bookingsList
        .map(normalizeBooking)
        .filter((booking) => {
          const bookingEmail = String(booking.email || "").toLowerCase();
          const bookingResidentId = String(booking.resident_id || "");

          return (
            bookingResidentId === currentResidentId ||
            bookingEmail === currentEmail
          );
        });

      setBookings(userBookings);
      setPayments(paymentsList);
      setDocuments(documentsList);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      alert("Could not load bookings from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    const ok = window.confirm("Are you sure you want to cancel this booking?");

    if (!ok) {
      return;
    }

    try {
      await updateBooking(bookingId, {
        booking_status: "cancelled",
      });

      alert("Booking cancelled successfully.");
      loadBookings();
    } catch (error) {
      console.error("Cancel booking failed:", error);
      alert(
        "Booking could not be cancelled. Make sure PATCH /bookings/{id} exists in Laravel."
      );
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

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "pending"
  ).length;
  const approvedBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "approved"
  ).length;
  const rejectedBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "rejected"
  ).length;
  const cancelledBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "cancelled"
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

        {loading ? (
          <div className="empty-bookings">
            <h3>Loading bookings...</h3>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-bookings">
            <h3>No bookings yet</h3>
            <p>You have not submitted any dorm booking request yet.</p>
            <a href="/housings" className="primary-btn">
              Explore Dorms
            </a>
          </div>
        ) : (
          <section className="booking-cards">
            {bookings.map((booking) => {
              const bookingId = booking.booking_id;
              const dormId = booking.dorm_id;

              const bookingStatus = displayStatus(booking.booking_status);
              const paymentStatus = displayStatus(
                getPaymentStatusForBooking(bookingId)
              );
              const documentStatus = displayStatus(
                getDocumentStatusForBooking(bookingId)
              );

              const paymentMethod = getPaymentMethodForBooking(bookingId);
              const documentType = getDocumentTypeForBooking(bookingId);

              const rawBookingStatus = normalizeStatus(booking.booking_status);
              const rawPaymentStatus = normalizeStatus(
                getPaymentStatusForBooking(bookingId)
              );

              return (
                <div className="booking-card" key={bookingId}>
                  <div className="booking-card-image">
                    <img src={getDormImage()} alt={booking.dorm_name || "Dorm"} />
                  </div>

                  <div className="booking-card-content">
                    <div className="booking-card-header">
                      <h2>{booking.dorm_name || "Dorm Name"}</h2>

                      <span
                        className={`booking-status ${getStatusClass(
                          booking.booking_status
                        )}`}
                      >
                        {bookingStatus}
                      </span>
                    </div>

                    <div className="booking-meta">
                      <p>
                        <i className="fa-solid fa-location-dot"></i>{" "}
                        {booking.city || "-"}
                        {booking.area ? ` - ${booking.area}` : ""}
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
                        <i className="fa-solid fa-dollar-sign"></i> Price/month:
                        ${booking.room_price || 0}
                      </p>

                      <p>
                        <i className="fa-solid fa-calendar-check"></i> Check-in:{" "}
                        {booking.check_in_date}
                      </p>

                      <p>
                        <i className="fa-solid fa-calendar-xmark"></i>{" "}
                        Check-out: {booking.check_out_date}
                      </p>

                      <p>
                        <i className="fa-solid fa-money-bill"></i> Total Cost:
                        ${booking.total_price}
                      </p>

                      <p>
                        <i className="fa-solid fa-credit-card"></i> Payment
                        Status: {paymentStatus}
                      </p>

                      <p>
                        <i className="fa-solid fa-receipt"></i> Payment Method:{" "}
                        {paymentMethod}
                      </p>

                      <p>
                        <i className="fa-solid fa-file"></i> Document:{" "}
                        {documentType}
                      </p>

                      <p>
                        <i className="fa-solid fa-file-circle-check"></i>{" "}
                        Document Status: {documentStatus}
                      </p>

                      <p>
                        <i className="fa-solid fa-clock"></i> Submitted:{" "}
                        {booking.created_at || "Not specified"}
                      </p>

                      {booking.admin_note && (
                        <p>
                          <i className="fa-solid fa-note-sticky"></i> Admin
                          Note: {booking.admin_note}
                        </p>
                      )}
                    </div>

                    <div className="booking-actions">
                      <a
                        href={`/housing-details?id=${dormId}`}
                        className="view-btn"
                      >
                        View Dorm
                      </a>

                      {rawBookingStatus === "pending" && (
                        <button
                          type="button"
                          onClick={() => cancelBooking(bookingId)}
                          className="cancel-btn"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {rawBookingStatus === "approved" &&
                        (rawPaymentStatus === "paid" ||
                        rawPaymentStatus === "completed" ? (
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

                      {(rawBookingStatus === "rejected" ||
                        rawBookingStatus === "cancelled") && (
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
        )}
      </main>
    </div>
  );
}

export default MyBookingsPage;