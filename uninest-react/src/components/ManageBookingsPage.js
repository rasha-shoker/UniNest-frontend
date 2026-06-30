import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageBookingsPage.css";
import {
  getBookings,
  getDocuments,
  getPayments,
  updateBooking,
  updateDocument,
  deleteBooking,
} from "../api";

function ManageBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");

    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadBookings();
  }, [navigate]);

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
      email: booking.email || resident.email || resident.user?.email || "-",

      dorm_id: booking.dorm_id || dorm.dorm_id || room.dorm_id || "",
      dorm_name: booking.dorm_name || dorm.dorm_name || "Dorm Name",

      city: booking.city || dorm.city || "",
      area: booking.area || dorm.area || "",

      room_id: booking.room_id || room.room_id || "",
      room_number: booking.room_number || room.room_number || "-",
      room_type: booking.room_type || room.room_type || "-",
      room_price: Number(booking.room_price || room.room_price || 0),

      check_in_date: booking.check_in_date || "-",
      check_out_date: booking.check_out_date || "-",
      total_price: Number(booking.total_price || 0),

      booking_status: booking.booking_status || "pending",
      admin_note: booking.admin_note || "",
      admin_id: booking.admin_id || null,

      created_at: booking.created_at || "-",
      updated_at: booking.updated_at || "Not updated yet",
    };
  };

  const normalizeDocument = (document) => {
    return {
      ...document,
      document_id: document.document_id,
      booking_id: document.booking_id,
      file_path: document.file_path || "",
      document_type: document.document_type || "Not specified",
      document_status: document.document_status || "pending",
      uploaded_at: document.uploaded_at || document.created_at || "",
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      payment_id: payment.payment_id,
      booking_id: payment.booking_id,
      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || "Not paid yet",
      payment_status: payment.payment_status || "pending",
      created_at: payment.created_at || "",
    };
  };

  const loadBookings = async () => {
    try {
      setLoading(true);

      const [bookingsResponse, documentsResponse, paymentsResponse] =
        await Promise.all([
          getBookings(),
          getDocuments().catch(() => []),
          getPayments().catch(() => []),
        ]);

      const bookingsList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      const documentsList = Array.isArray(documentsResponse)
        ? documentsResponse
        : documentsResponse.data || [];

      const paymentsList = Array.isArray(paymentsResponse)
        ? paymentsResponse
        : paymentsResponse.data || [];

      setBookings(bookingsList.map(normalizeBooking));
      setDocuments(documentsList.map(normalizeDocument));
      setPayments(paymentsList.map(normalizePayment));
    } catch (error) {
      console.error("Failed to load admin bookings:", error);
      alert("Could not load bookings from backend.");
    } finally {
      setLoading(false);
    }
  };

  const getDocumentForBooking = (bookingId) => {
    return documents.find((document) => {
      return Number(document.booking_id) === Number(bookingId);
    });
  };

  const getPaymentForBooking = (bookingId) => {
    return payments.find((payment) => {
      return Number(payment.booking_id) === Number(bookingId);
    });
  };

  const getImageUrl = () => {
    try {
      return require("../assets/images/aub1.jpg");
    } catch {
      return "";
    }
  };

  const approveDocument = async (bookingId) => {
    const document = getDocumentForBooking(bookingId);

    if (!document || !document.document_id) {
      alert("No document found for this booking.");
      return;
    }

    try {
      await updateDocument(document.document_id, {
        document_status: "approved",
      });

      alert("Document approved successfully.");
      loadBookings();
    } catch (error) {
      console.error("Document approval failed:", error);
      alert("Document could not be approved. Check PATCH /documents/{id}.");
    }
  };

  const rejectDocument = async (bookingId) => {
    const document = getDocumentForBooking(bookingId);

    if (!document || !document.document_id) {
      alert("No document found for this booking.");
      return;
    }

    try {
      await updateDocument(document.document_id, {
        document_status: "rejected",
      });

      await updateBooking(bookingId, {
        booking_status: "rejected",
        admin_note: "Document rejected.",
      });

      alert("Document rejected and booking rejected.");
      loadBookings();
    } catch (error) {
      console.error("Document rejection failed:", error);
      alert("Document could not be rejected. Check Laravel document route.");
    }
  };

  const approveBooking = async (bookingId) => {
    const booking = bookings.find((item) => {
      return Number(item.booking_id) === Number(bookingId);
    });

    if (!booking) {
      alert("Booking not found.");
      return;
    }

    const document = getDocumentForBooking(bookingId);
    const documentStatus = normalizeStatus(document?.document_status);

    if (document && documentStatus !== "approved") {
      alert("Please approve the uploaded document first.");
      return;
    }

    if (normalizeStatus(booking.booking_status) === "cancelled") {
      alert("This booking was cancelled by the resident.");
      return;
    }

    try {
      await updateBooking(bookingId, {
        booking_status: "approved",
        admin_id: localStorage.getItem("loggedInAdminId") || null,
        admin_note: "Booking approved.",
      });

      alert("Booking approved successfully.");
      loadBookings();
    } catch (error) {
      console.error("Booking approval failed:", error);
      alert("Booking could not be approved. Check PATCH /bookings/{id}.");
    }
  };

  const rejectBooking = async (bookingId) => {
    const adminNote =
      window.prompt("Write rejection reason:", "Booking rejected.") ||
      "Booking rejected.";

    try {
      await updateBooking(bookingId, {
        booking_status: "rejected",
        admin_note: adminNote,
      });

      alert("Booking rejected successfully.");
      loadBookings();
    } catch (error) {
      console.error("Booking rejection failed:", error);
      alert("Booking could not be rejected. Check PATCH /bookings/{id}.");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const ok = window.confirm("Are you sure you want to delete this booking?");

    if (!ok) {
      return;
    }

    try {
      await deleteBooking(bookingId);
      alert("Booking deleted successfully.");
      loadBookings();
    } catch (error) {
      console.error("Delete booking failed:", error);
      alert("Booking could not be deleted. Check DELETE /bookings/{id}.");
    }
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

  const approvedCount = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "approved"
  ).length;

  const pendingCount = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "pending"
  ).length;

  const rejectedCount = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "rejected"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "cancelled"
  ).length;

  return (
    <div className="manage-bookings-page bookings-layout">
      <aside className="bookings-sidebar">
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
            <Link to="/manage-bookings" className="active">
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
            <Link to="/manage-reviews">
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

      <main className="bookings-main">
        <div className="bookings-topbar">
          <div>
            <h1>Manage Bookings</h1>
            <p>
              Review booking requests, uploaded documents, and approve or reject
              requests.
            </p>
          </div>
        </div>

        <section className="booking-stats">
          <div className="stat-card">
            <h3>{bookings.length}</h3>
            <p>Total Bookings</p>
          </div>

          <div className="stat-card">
            <h3>{approvedCount}</h3>
            <p>Approved</p>
          </div>

          <div className="stat-card">
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>

          <div className="stat-card">
            <h3>{rejectedCount}</h3>
            <p>Rejected</p>
          </div>

          <div className="stat-card">
            <h3>{cancelledCount}</h3>
            <p>Cancelled</p>
          </div>
        </section>

        {loading ? (
          <div className="empty-bookings">
            <h3>Loading bookings...</h3>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-bookings">
            <h3>No bookings found</h3>
            <p>No resident booking requests have been submitted yet.</p>
          </div>
        ) : (
          <section className="booking-list">
            {bookings.map((booking) => {
              const bookingId = booking.booking_id;
              const document = getDocumentForBooking(bookingId);
              const payment = getPaymentForBooking(bookingId);

              const bookingStatus = displayStatus(booking.booking_status);
              const documentStatus = displayStatus(
                document?.document_status || "pending"
              );
              const paymentStatus = displayStatus(
                payment?.payment_status || "pending"
              );

              const rawBookingStatus = normalizeStatus(booking.booking_status);
              const rawDocumentStatus = normalizeStatus(
                document?.document_status || "pending"
              );

              return (
                <div className="booking-card" key={bookingId}>
                  <div className="booking-card-left">
                    <img src={getImageUrl()} alt={booking.dorm_name || "Dorm"} />
                  </div>

                  <div className="booking-card-middle">
                    <div className="booking-title-row">
                      <h2>{booking.dorm_name || "Dorm Name"}</h2>

                      <span
                        className={`status-badge ${getStatusClass(
                          booking.booking_status
                        )}`}
                      >
                        {bookingStatus}
                      </span>
                    </div>

                    <div className="booking-info-grid">
                      <p>
                        <i className="fa-solid fa-user"></i>{" "}
                        <strong>Resident:</strong> {booking.resident_name}
                      </p>

                      <p>
                        <i className="fa-solid fa-envelope"></i>{" "}
                        <strong>Email:</strong> {booking.email}
                      </p>

                      <p>
                        <i className="fa-solid fa-location-dot"></i>{" "}
                        <strong>Location:</strong>{" "}
                        {booking.city || "-"}
                        {booking.area ? ` - ${booking.area}` : ""}
                      </p>

                      <p>
                        <i className="fa-solid fa-door-open"></i>{" "}
                        <strong>Room Number:</strong>{" "}
                        {booking.room_number || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-bed"></i>{" "}
                        <strong>Room Type:</strong> {booking.room_type || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-dollar-sign"></i>{" "}
                        <strong>Price/month:</strong> ${booking.room_price || 0}
                      </p>

                      <p>
                        <i className="fa-solid fa-money-bill"></i>{" "}
                        <strong>Total Cost:</strong> ${booking.total_price || 0}
                      </p>

                      <p>
                        <i className="fa-solid fa-calendar-check"></i>{" "}
                        <strong>Check-in:</strong> {booking.check_in_date || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-calendar-xmark"></i>{" "}
                        <strong>Check-out:</strong>{" "}
                        {booking.check_out_date || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-clock"></i>{" "}
                        <strong>Submitted:</strong> {booking.created_at || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-credit-card"></i>{" "}
                        <strong>Payment Status:</strong> {paymentStatus}
                      </p>

                      {booking.admin_note && (
                        <p>
                          <i className="fa-solid fa-note-sticky"></i>{" "}
                          <strong>Admin Note:</strong> {booking.admin_note}
                        </p>
                      )}
                    </div>

                    <div className="document-box">
                      <h3>
                        <i className="fa-solid fa-file-lines"></i> Booking
                        Document
                      </h3>

                      <p>
                        <strong>Document Type:</strong>{" "}
                        {document?.document_type || "Not uploaded"}
                      </p>

                      {document?.file_path ? (
                        <div className="booking-document-view">
                          {String(document.file_path).startsWith("data:image") ? (
                            <img
                              src={document.file_path}
                              alt="Booking Document"
                            />
                          ) : (
                            <a
                              href={document.file_path}
                              target="_blank"
                              rel="noreferrer"
                              className="download-document-btn"
                            >
                              <i className="fa-solid fa-eye"></i>
                              View / Review Document
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="missing-document">
                          No stored document file found.
                        </p>
                      )}

                      <p>
                        <strong>Document Status:</strong>{" "}
                        <span
                          className={`document-status ${getStatusClass(
                            document?.document_status || "pending"
                          )}`}
                        >
                          {documentStatus}
                        </span>
                      </p>

                      <div className="document-actions">
                        {rawDocumentStatus === "pending" &&
                        rawBookingStatus === "pending" ? (
                          <>
                            <button
                              className="approve-doc-btn"
                              onClick={() => approveDocument(bookingId)}
                            >
                              Approve Document
                            </button>

                            <button
                              className="reject-doc-btn"
                              onClick={() => rejectDocument(bookingId)}
                            >
                              Reject Document
                            </button>
                          </>
                        ) : (
                          <button className="disabled-btn" disabled>
                            Document {documentStatus}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="booking-card-right">
                    <div className="booking-actions">
                      {rawBookingStatus === "pending" && (
                        <>
                          <button
                            className="approve-btn"
                            onClick={() => approveBooking(bookingId)}
                          >
                            Approve Booking
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() => rejectBooking(bookingId)}
                          >
                            Reject Booking
                          </button>
                        </>
                      )}

                      {rawBookingStatus === "approved" && (
                        <button className="disabled-btn" disabled>
                          Booking Approved
                        </button>
                      )}

                      {rawBookingStatus === "rejected" && (
                        <button className="disabled-btn" disabled>
                          Booking Rejected
                        </button>
                      )}

                      {rawBookingStatus === "cancelled" && (
                        <button className="disabled-btn" disabled>
                          Cancelled by Resident
                        </button>
                      )}

                      <Link
                        to={`/housing-details?id=${booking.dorm_id}`}
                        className="view-btn"
                      >
                        View Dorm
                      </Link>

                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteBooking(bookingId)}
                      >
                        Delete
                      </button>
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

export default ManageBookingsPage;