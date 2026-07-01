import { useEffect, useState } from "react";
import "./MyBookingsPage.css";
import { getBookings, getDocuments, getPayments, updateBooking } from "../api";

function MyBookingsPage() {
  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";
  const loggedInUserEmail = (
    localStorage.getItem("loggedInUserEmail") || ""
  ).toLowerCase();

  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
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

      email: (
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        resident.email ||
        resident.user?.email ||
        ""
      ).toLowerCase(),

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

      dorm_image:
        booking.dorm_image ||
        booking.housingImage ||
        dorm.image_url ||
        "images/aub1.jpg",

      city: booking.city || dorm.city || "",
      area: booking.area || dorm.area || booking.location || "",

      room_id: booking.room_id || booking.roomId || room.room_id || "",
      room_number:
        booking.room_number || booking.roomNumber || room.room_number || "-",
      room_type: booking.room_type || booking.roomType || room.room_type || "-",
      room_price: Number(
        booking.room_price || booking.price || room.room_price || 0
      ),

      check_in_date: booking.check_in_date || booking.checkInDate || "",
      check_out_date: booking.check_out_date || booking.checkOutDate || "",
      total_price: Number(
        booking.total_price || booking.totalCost || booking.amount || 0
      ),

      booking_status: booking.booking_status || booking.status || "pending",
      admin_note: booking.admin_note || "",
      created_at: booking.created_at || booking.createdAt || "",
      admin_id: booking.admin_id || "",

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
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      payment_id: payment.payment_id || payment.id,
      booking_id: payment.booking_id || payment.bookingId,
      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || payment.method || "",
      payment_status: payment.payment_status || payment.status || "pending",
      created_at: payment.created_at || payment.payment_date || "",
    };
  };

  const getLocalBookings = () => {
    const localBookings = JSON.parse(localStorage.getItem("studentBookings")) || [];

    return localBookings.map((booking) =>
      normalizeBooking({
        ...booking,
        isLocal: true,
      })
    );
  };

  const getLocalDocuments = () => {
    const localDocuments = JSON.parse(localStorage.getItem("documents")) || [];

    return localDocuments.map(normalizeDocument);
  };

  const getLocalPayments = () => {
    const localPayments = JSON.parse(localStorage.getItem("payments")) || [];

    return localPayments.map(normalizePayment);
  };

  const mergeBookings = (backendBookings, localBookings) => {
    const merged = [...localBookings];

    backendBookings.forEach((backendBooking) => {
      const exists = merged.some((localBooking) => {
        return (
          Number(localBooking.booking_id) === Number(backendBooking.booking_id)
        );
      });

      if (!exists) {
        merged.push(backendBooking);
      }
    });

    return merged.sort((a, b) => {
      return Number(b.booking_id || 0) - Number(a.booking_id || 0);
    });
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

      const mergedBookings = mergeBookings(backendBookings, localBookings);

      const myBookings = mergedBookings.filter((booking) => {
        const bookingResidentId = String(booking.resident_id || "");
        const bookingEmail = String(booking.email || "").toLowerCase();

        return (
          bookingResidentId === String(loggedInResidentId) ||
          bookingEmail === loggedInUserEmail
        );
      });

      setBookings(myBookings);
      setDocuments([...backendDocuments, ...localDocuments]);
      setPayments([...backendPayments, ...localPayments]);
    } catch (error) {
      console.error("My bookings load failed:", error);
      alert("Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

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

  const updateLocalBookingStatus = (bookingId, newStatus) => {
    const localBookings = JSON.parse(localStorage.getItem("studentBookings")) || [];

    const updatedBookings = localBookings.map((booking) => {
      const currentBookingId = booking.booking_id || booking.id;

      if (Number(currentBookingId) === Number(bookingId)) {
        return {
          ...booking,
          booking_status: newStatus,
          status: newStatus,
        };
      }

      return booking;
    });

    localStorage.setItem("studentBookings", JSON.stringify(updatedBookings));
  };

  const cancelBooking = async (booking) => {
    const ok = window.confirm("Are you sure you want to cancel this booking?");

    if (!ok) return;

    try {
      await updateBooking(booking.booking_id, {
        booking_status: "cancelled",
      });

      updateLocalBookingStatus(booking.booking_id, "cancelled");

      alert("Booking cancelled successfully.");
      loadBookings();
    } catch (error) {
      console.warn("Backend cancel failed, cancelling locally:", error);

      updateLocalBookingStatus(booking.booking_id, "cancelled");

      alert("Booking cancelled locally. Later we will fix backend update if needed.");
      loadBookings();
    }
  };

  const goToPayment = (booking) => {
    localStorage.setItem("selectedBookingForPayment", JSON.stringify(booking));
    window.location.href = "/payment";
  };

  const totalBookings = bookings.length;

  const pendingCount = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "pending"
  ).length;

  const approvedCount = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "approved"
  ).length;

  const rejectedCount = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "rejected"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "cancelled"
  ).length;

  return (
    <div className="my-bookings-layout">
      <aside className="my-bookings-sidebar">
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

      <main className="my-bookings-main">
        <div className="my-bookings-topbar">
          <div>
            <h1>My Bookings</h1>
            <p>Track your dorm booking requests, documents, and payments.</p>
          </div>
        </div>

        <section className="booking-stats">
          <div className="stat-card">
            <h3>{totalBookings}</h3>
            <p>Total Bookings</p>
          </div>

          <div className="stat-card">
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>

          <div className="stat-card">
            <h3>{approvedCount}</h3>
            <p>Approved</p>
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
            <p>You have not submitted any booking requests yet.</p>
            <a href="/housings" className="explore-btn">
              Explore Dorms
            </a>
          </div>
        ) : (
          <section className="bookings-list">
            {bookings.map((booking) => {
              const document = getDocumentForBooking(booking.booking_id);
              const payment = getPaymentForBooking(booking.booking_id);

              const bookingStatus = normalizeStatus(booking.booking_status);
              const documentStatus = document
                ? displayStatus(document.document_status)
                : displayStatus(booking.document_status);

              const paymentStatus = payment
                ? displayStatus(payment.payment_status)
                : displayStatus(booking.payment_status);

              const canPay =
                bookingStatus === "approved" &&
                normalizeStatus(payment?.payment_status || booking.payment_status) !==
                  "paid" &&
                normalizeStatus(payment?.payment_status || booking.payment_status) !==
                  "completed";

              return (
                <div className="booking-card" key={booking.booking_id}>
                  <div className="booking-card-main">
                    <div className="booking-title-row">
                      <h2>{booking.dorm_name || "Dorm Name"}</h2>

                      <span
                        className={`status-badge ${getStatusClass(
                          booking.booking_status
                        )}`}
                      >
                        {displayStatus(booking.booking_status)}
                      </span>
                    </div>

                    <div className="booking-info-grid">
                      <p>
                        <i className="fa-solid fa-location-dot"></i>{" "}
                        <strong>Location:</strong>{" "}
                        {booking.city || booking.area || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-door-open"></i>{" "}
                        <strong>Room:</strong> {booking.room_number || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-bed"></i>{" "}
                        <strong>Room Type:</strong> {booking.room_type || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-dollar-sign"></i>{" "}
                        <strong>Monthly Price:</strong> ${booking.room_price || 0}
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
                        <i className="fa-solid fa-money-bill"></i>{" "}
                        <strong>Total Price:</strong> ${booking.total_price || 0}
                      </p>

                      <p>
                        <i className="fa-solid fa-file-lines"></i>{" "}
                        <strong>Document:</strong> {documentStatus}
                      </p>

                      <p>
                        <i className="fa-solid fa-credit-card"></i>{" "}
                        <strong>Payment:</strong> {paymentStatus}
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

                    {document?.file_path && (
                      <div className="document-preview-box">
                        <p>
                          <strong>Uploaded Document:</strong>{" "}
                          {document.file_name || document.document_type}
                        </p>

                        {String(document.file_path).startsWith("data:image") ? (
                          <img src={document.file_path} alt="Uploaded Document" />
                        ) : (
                          <a
                            href={document.file_path}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="booking-actions">
                    <a
                      href={`/housing-details?id=${booking.dorm_id}`}
                      className="view-btn"
                    >
                      View Dorm
                    </a>

                    {canPay && (
                      <button
                        className="pay-btn"
                        onClick={() => goToPayment(booking)}
                      >
                        Pay Now
                      </button>
                    )}

                    {bookingStatus === "pending" && (
                      <button
                        className="cancel-btn"
                        onClick={() => cancelBooking(booking)}
                      >
                        Cancel Booking
                      </button>
                    )}

                    {bookingStatus === "approved" && !canPay && (
                      <button className="disabled-btn" disabled>
                        Approved
                      </button>
                    )}

                    {bookingStatus === "rejected" && (
                      <button className="disabled-btn" disabled>
                        Rejected
                      </button>
                    )}

                    {bookingStatus === "cancelled" && (
                      <button className="disabled-btn" disabled>
                        Cancelled
                      </button>
                    )}
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