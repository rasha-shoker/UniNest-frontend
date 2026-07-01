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
    const value = normalizeStatus(status);

    if (value === "approved") return "approved";
    if (value === "rejected") return "rejected";
    if (value === "cancelled") return "cancelled";
    if (value === "paid" || value === "completed") return "paid";

    return "pending";
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizeBooking = (booking) => {
    const room = booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
    const resident = booking.resident || {};

    return {
      ...booking,

      booking_id: booking.booking_id || booking.id,
      resident_id: booking.resident_id || resident.resident_id || "",
      resident_name:
        booking.resident_name ||
        booking.residentName ||
        booking.userName ||
        booking.studentName ||
        resident.full_name ||
        resident.user?.full_name ||
        "Resident",

      email:
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        resident.email ||
        resident.user?.email ||
        "-",

      dorm_id:
        booking.dorm_id ||
        booking.housingId ||
        dorm.dorm_id ||
        room.dorm_id ||
        "",

      dorm_name:
        booking.dorm_name ||
        booking.housingName ||
        dorm.dorm_name ||
        "Dorm Name",

      city: booking.city || dorm.city || "",
      area: booking.area || dorm.area || booking.location || "",

      room_id: booking.room_id || booking.roomId || room.room_id || "",
      room_number:
        booking.room_number || booking.roomNumber || room.room_number || "-",
      room_type: booking.room_type || booking.roomType || room.room_type || "-",
      room_price: Number(
        booking.room_price || booking.price || room.room_price || 0
      ),

      check_in_date: booking.check_in_date || booking.checkInDate || "-",
      check_out_date: booking.check_out_date || booking.checkOutDate || "-",
      total_price: Number(
        booking.total_price || booking.totalCost || booking.amount || 0
      ),

      booking_status: booking.booking_status || booking.status || "pending",
      admin_note: booking.admin_note || "",
      admin_id: booking.admin_id || "",

      created_at: booking.created_at || booking.createdAt || "-",
      updated_at: booking.updated_at || booking.updatedAt || "Not updated yet",

      document_status:
        booking.document_status || booking.documentStatus || "pending",

      payment_status:
        booking.payment_status || booking.paymentStatus || "pending",

      isLocal: booking.isLocal || false,
    };
  };

  const normalizeDocument = (document) => {
    return {
      ...document,
      document_id: document.document_id || document.id,
      booking_id: document.booking_id || document.bookingId,
      file_path: document.file_path || document.file || "",
      file_name: document.file_name || document.fileName || "",
      document_type: document.document_type || document.type || "Document",
      document_status: document.document_status || document.status || "pending",
      uploaded_at: document.uploaded_at || document.created_at || "",
      isLocal: document.isLocal || false,
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      payment_id: payment.payment_id || payment.id,
      booking_id: payment.booking_id || payment.bookingId,
      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || payment.method || "Not paid yet",
      payment_status: payment.payment_status || payment.status || "pending",
      created_at: payment.created_at || payment.payment_date || "",
      isLocal: payment.isLocal || false,
    };
  };

  const getLocalBookings = () => {
    const localBookings =
      JSON.parse(localStorage.getItem("studentBookings")) || [];

    return localBookings.map((booking) =>
      normalizeBooking({
        ...booking,
        isLocal: true,
      })
    );
  };

  const getLocalDocuments = () => {
    const localDocuments = JSON.parse(localStorage.getItem("documents")) || [];

    return localDocuments.map((document) =>
      normalizeDocument({
        ...document,
        isLocal: true,
      })
    );
  };

  const getLocalPayments = () => {
    const localPayments = JSON.parse(localStorage.getItem("payments")) || [];

    return localPayments.map((payment) =>
      normalizePayment({
        ...payment,
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

  const loadBookings = async () => {
    try {
      setLoading(true);

      const localBookings = getLocalBookings();
      const localDocuments = getLocalDocuments();
      const localPayments = getLocalPayments();

      let backendBookings = [];
      let backendDocuments = [];
      let backendPayments = [];

      try {
        const bookingsResponse = await getBookings();
        const bookingsList = Array.isArray(bookingsResponse)
          ? bookingsResponse
          : bookingsResponse.data || [];

        backendBookings = bookingsList.map(normalizeBooking);
      } catch (error) {
        console.warn("Backend bookings could not be loaded:", error);
      }

      try {
        const documentsResponse = await getDocuments();
        const documentsList = Array.isArray(documentsResponse)
          ? documentsResponse
          : documentsResponse.data || [];

        backendDocuments = documentsList.map(normalizeDocument);
      } catch (error) {
        console.warn("Backend documents could not be loaded:", error);
      }

      try {
        const paymentsResponse = await getPayments();
        const paymentsList = Array.isArray(paymentsResponse)
          ? paymentsResponse
          : paymentsResponse.data || [];

        backendPayments = paymentsList.map(normalizePayment);
      } catch (error) {
        console.warn("Backend payments could not be loaded:", error);
      }

      const mergedBookings = mergeById(
        backendBookings,
        localBookings,
        "booking_id"
      ).sort((a, b) => Number(b.booking_id || 0) - Number(a.booking_id || 0));

      const mergedDocuments = mergeById(
        backendDocuments,
        localDocuments,
        "document_id"
      );

      const mergedPayments = mergeById(
        backendPayments,
        localPayments,
        "payment_id"
      );

      setBookings(mergedBookings);
      setDocuments(mergedDocuments);
      setPayments(mergedPayments);
    } catch (error) {
      console.error("Failed to load admin bookings:", error);
      alert("Could not load bookings.");
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

  const updateLocalBooking = (bookingId, updates) => {
    const localBookings =
      JSON.parse(localStorage.getItem("studentBookings")) || [];

    const updatedBookings = localBookings.map((booking) => {
      const currentBookingId = booking.booking_id || booking.id;

      if (Number(currentBookingId) === Number(bookingId)) {
        return {
          ...booking,
          ...updates,
          status: updates.booking_status || updates.status || booking.status,
          updated_at: formatDateToday(),
          updatedAt: formatDateToday(),
        };
      }

      return booking;
    });

    localStorage.setItem("studentBookings", JSON.stringify(updatedBookings));
  };

  const updateLocalDocument = (documentId, updates) => {
    const localDocuments = JSON.parse(localStorage.getItem("documents")) || [];

    const updatedDocuments = localDocuments.map((document) => {
      const currentDocumentId = document.document_id || document.id;

      if (Number(currentDocumentId) === Number(documentId)) {
        return {
          ...document,
          ...updates,
          status:
            updates.document_status || updates.status || document.status,
          updated_at: formatDateToday(),
          updatedAt: formatDateToday(),
        };
      }

      return document;
    });

    localStorage.setItem("documents", JSON.stringify(updatedDocuments));
  };

  const deleteLocalBooking = (bookingId) => {
    const localBookings =
      JSON.parse(localStorage.getItem("studentBookings")) || [];

    const updatedBookings = localBookings.filter((booking) => {
      const currentBookingId = booking.booking_id || booking.id;
      return Number(currentBookingId) !== Number(bookingId);
    });

    localStorage.setItem("studentBookings", JSON.stringify(updatedBookings));
  };

  const deleteLocalDocumentsForBooking = (bookingId) => {
    const localDocuments = JSON.parse(localStorage.getItem("documents")) || [];

    const updatedDocuments = localDocuments.filter((document) => {
      return Number(document.booking_id) !== Number(bookingId);
    });

    localStorage.setItem("documents", JSON.stringify(updatedDocuments));
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

      updateLocalDocument(document.document_id, {
        document_status: "approved",
      });

      updateLocalBooking(bookingId, {
        document_status: "approved",
        documentStatus: "approved",
      });

      alert("Document approved successfully.");
      loadBookings();
    } catch (error) {
      console.warn("Backend document approval failed:", error);

      updateLocalDocument(document.document_id, {
        document_status: "approved",
      });

      updateLocalBooking(bookingId, {
        document_status: "approved",
        documentStatus: "approved",
      });

      alert("Document approved locally for frontend testing.");
      loadBookings();
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

      updateLocalDocument(document.document_id, {
        document_status: "rejected",
      });

      updateLocalBooking(bookingId, {
        booking_status: "rejected",
        document_status: "rejected",
        admin_note: "Document rejected.",
      });

      alert("Document rejected and booking rejected.");
      loadBookings();
    } catch (error) {
      console.warn("Backend document rejection failed:", error);

      updateLocalDocument(document.document_id, {
        document_status: "rejected",
      });

      updateLocalBooking(bookingId, {
        booking_status: "rejected",
        document_status: "rejected",
        admin_note: "Document rejected.",
      });

      alert("Document rejected locally for frontend testing.");
      loadBookings();
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
    const documentStatus = normalizeStatus(
      document?.document_status || booking.document_status
    );

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
        admin_id: localStorage.getItem("loggedInAdminId") || 1,
        admin_note: "Booking approved.",
      });

      updateLocalBooking(bookingId, {
        booking_status: "approved",
        status: "approved",
        admin_id: localStorage.getItem("loggedInAdminId") || 1,
        admin_note: "Booking approved.",
      });

      alert("Booking approved successfully.");
      loadBookings();
    } catch (error) {
      console.warn("Backend booking approval failed:", error);

      updateLocalBooking(bookingId, {
        booking_status: "approved",
        status: "approved",
        admin_id: localStorage.getItem("loggedInAdminId") || 1,
        admin_note: "Booking approved.",
      });

      alert("Booking approved locally for frontend testing.");
      loadBookings();
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

      updateLocalBooking(bookingId, {
        booking_status: "rejected",
        status: "rejected",
        admin_note: adminNote,
      });

      alert("Booking rejected successfully.");
      loadBookings();
    } catch (error) {
      console.warn("Backend booking rejection failed:", error);

      updateLocalBooking(bookingId, {
        booking_status: "rejected",
        status: "rejected",
        admin_note: adminNote,
      });

      alert("Booking rejected locally for frontend testing.");
      loadBookings();
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const ok = window.confirm("Are you sure you want to delete this booking?");

    if (!ok) return;

    try {
      await deleteBooking(bookingId);

      deleteLocalBooking(bookingId);
      deleteLocalDocumentsForBooking(bookingId);

      alert("Booking deleted successfully.");
      loadBookings();
    } catch (error) {
      console.warn("Backend delete booking failed:", error);

      deleteLocalBooking(bookingId);
      deleteLocalDocumentsForBooking(bookingId);

      alert("Booking deleted locally for frontend testing.");
      loadBookings();
    }
  };

  const getImageUrl = () => {
    try {
      return require("../assets/images/aub1.jpg");
    } catch {
      return "";
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
                document?.document_status || booking.document_status
              );
              const paymentStatus = displayStatus(
                payment?.payment_status || booking.payment_status
              );

              const rawBookingStatus = normalizeStatus(booking.booking_status);
              const rawDocumentStatus = normalizeStatus(
                document?.document_status || booking.document_status
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
                        <strong>Location:</strong> {booking.city || "-"}
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
                        <strong>Check-in:</strong>{" "}
                        {booking.check_in_date || "-"}
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

                      {booking.isLocal && (
                        <p>
                          <i className="fa-solid fa-circle-info"></i>{" "}
                          <strong>Note:</strong> Saved locally until backend
                          booking store is fixed.
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
                          {String(document.file_path).startsWith(
                            "data:image"
                          ) ? (
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
                              <i className="fa-solid fa-eye"></i> View / Review
                              Document
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
                            document?.document_status ||
                              booking.document_status ||
                              "pending"
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