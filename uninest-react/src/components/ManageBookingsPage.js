import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageBookingsPage.css";

function ManageBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");
    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadBookings();
  }, [navigate]);

  const getBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const saveBookings = (items) => {
    localStorage.setItem("studentBookings", JSON.stringify(items));
    setBookings(items);
  };

  const getNotifications = () => {
    return JSON.parse(localStorage.getItem("notifications")) || [];
  };

  const saveNotifications = (items) => {
    localStorage.setItem("notifications", JSON.stringify(items));
  };

  const getDorms = () => {
    const dorms = JSON.parse(localStorage.getItem("dorms"));
    const housings = JSON.parse(localStorage.getItem("housings"));

    if (dorms && Array.isArray(dorms)) return dorms;

    if (housings && Array.isArray(housings)) {
      localStorage.setItem("dorms", JSON.stringify(housings));
      return housings;
    }

    return [];
  };

  const saveDorms = (dorms) => {
    localStorage.setItem("dorms", JSON.stringify(dorms));
    localStorage.setItem("housings", JSON.stringify(dorms));
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
        "-",

      dorm_id: booking.dorm_id || booking.housingId,
      dorm_name: booking.dorm_name || booking.housingName || "Dorm Name",
      dorm_image: booking.dorm_image || booking.housingImage || "images/aub1.jpg",

      university_name: booking.university_name || booking.university || "-",
      city: booking.city || "",
      area: booking.area || booking.location || "-",

      room_id: booking.room_id || booking.roomId || "",
      room_number: booking.room_number || booking.roomNumber || "-",
      room_type: booking.room_type || booking.roomType || "-",
      room_price: Number(booking.room_price || booking.price || 0),

      check_in_date:
        booking.check_in_date ||
        booking.checkInDate ||
        booking.moveInDate ||
        "-",

      check_out_date: booking.check_out_date || booking.checkOutDate || "-",
      total_price: Number(booking.total_price || booking.totalCost || 0),

      booking_status: booking.booking_status || booking.status || "Pending",
      document_status:
        booking.document_status || booking.documentStatus || "Pending",

      document_type:
        booking.document_type || booking.documentType || "Not specified",

      file_path: booking.file_path || booking.documentData || "",
      file_name: booking.file_name || booking.documentName || "No file uploaded",
      file_type: booking.file_type || booking.documentFileType || "",

      payment_status: booking.payment_status || booking.paymentStatus || "Pending",

      created_at: booking.created_at || booking.createdAt || "-",
      updated_at: booking.updated_at || booking.updatedAt || "Not updated yet",
    };
  };

  const loadBookings = () => {
    setBookings(getBookings());
  };

  const getImageUrl = (image) => {
    if (!image) return "/images/aub1.jpg";

    if (
      image.startsWith("data:") ||
      image.startsWith("http") ||
      image.startsWith("/")
    ) {
      return image;
    }

    return "/" + image;
  };

  const getStatusClass = (status) => {
    return String(status || "Pending").toLowerCase();
  };

  const addNotification = (
    resident_id,
    notification_type,
    title,
    message,
    emailFallback
  ) => {
    if (!resident_id && !emailFallback) return;

    const notifications = getNotifications();
    const notificationId = Date.now() + Math.floor(Math.random() * 1000);

    const newNotification = {
      notification_id: notificationId,
      resident_id: resident_id || "",
      title,
      message,
      notification_type,
      is_read: false,
      created_at: formatDateToday(),

      id: notificationId,
      userEmail: emailFallback || "",
      type: notification_type,
      isRead: false,
      date: formatDateToday(),
    };

    notifications.unshift(newNotification);
    saveNotifications(notifications);
  };

  const calculateDormStatus = (rooms) => {
    if (!rooms || rooms.length === 0) return "Full";

    const hasAvailableRoom = rooms.some((room) => {
      const availabilityStatus =
        room.availability_status || room.status || "Available";

      return availabilityStatus === "Available";
    });

    return hasAvailableRoom ? "Available" : "Full";
  };

  const updateRoomOccupancyAfterApproval = (booking) => {
    const normalizedBooking = normalizeBooking(booking);
    const dorms = getDorms();

    const dormIndex = dorms.findIndex((dorm) => {
      return Number(dorm.dorm_id || dorm.id) === Number(normalizedBooking.dorm_id);
    });

    if (dormIndex === -1) {
      alert("Dorm not found. Room occupancy was not updated.");
      return false;
    }

    const dorm = dorms[dormIndex];

    if (!Array.isArray(dorm.rooms)) {
      alert("No rooms found for this dorm.");
      return false;
    }

    const roomIndex = dorm.rooms.findIndex((room) => {
      return (
        String(room.room_id || room.roomId || "") ===
          String(normalizedBooking.room_id || "") ||
        String(room.room_number || room.roomNumber || "") ===
          String(normalizedBooking.room_number || "")
      );
    });

    if (roomIndex === -1) {
      alert("Room not found. Room occupancy was not updated.");
      return false;
    }

    const room = dorm.rooms[roomIndex];

    const occupancyLimit = Number(
      room.occupancy_limit ||
        room.occupancyLimit ||
        room.room_capacity ||
        room.capacity ||
        1
    );

    const currentOccupancy = Number(
      room.current_occupancy || room.currentOccupancy || 0
    );

    if (currentOccupancy >= occupancyLimit) {
      alert("This room is already full. Booking cannot be approved.");
      return false;
    }

    const newOccupancy = currentOccupancy + 1;
    const newRoomStatus = newOccupancy >= occupancyLimit ? "Full" : "Available";

    dorm.rooms[roomIndex] = {
      ...room,
      current_occupancy: newOccupancy,
      occupancy_limit: occupancyLimit,
      availability_status: newRoomStatus,

      currentOccupancy: newOccupancy,
      occupancyLimit: occupancyLimit,
      status: newRoomStatus,
    };

    const dormStatus = calculateDormStatus(dorm.rooms);

    dorms[dormIndex] = {
      ...dorm,
      rooms: dorm.rooms,
      availability_status: dormStatus,
      status: dormStatus,
      availability: dormStatus,
    };

    saveDorms(dorms);
    return true;
  };

  const approveDocument = (bookingId) => {
    const updatedBookings = getBookings().map((booking) => {
      const normalized = normalizeBooking(booking);

      if (Number(normalized.booking_id) === Number(bookingId)) {
        addNotification(
          normalized.resident_id,
          "booking",
          "Document Approved",
          "Your document for " +
            normalized.dorm_name +
            " has been approved. Your booking is ready for final approval.",
          normalized.email
        );

        return {
          ...booking,
          document_status: "Approved",
          updated_at: formatDateToday(),

          documentStatus: "Approved",
          updatedAt: formatDateToday(),
        };
      }

      return booking;
    });

    saveBookings(updatedBookings);
    alert("Document approved successfully.");
  };

  const rejectDocument = (bookingId) => {
    const updatedBookings = getBookings().map((booking) => {
      const normalized = normalizeBooking(booking);

      if (Number(normalized.booking_id) === Number(bookingId)) {
        addNotification(
          normalized.resident_id,
          "booking",
          "Document Rejected",
          "Your document for " +
            normalized.dorm_name +
            " has been rejected. Your booking request has also been rejected.",
          normalized.email
        );

        return {
          ...booking,
          document_status: "Rejected",
          booking_status: "Rejected",
          updated_at: formatDateToday(),

          documentStatus: "Rejected",
          status: "Rejected",
          updatedAt: formatDateToday(),
        };
      }

      return booking;
    });

    saveBookings(updatedBookings);
    alert("Document rejected. Booking has also been rejected.");
  };

  const approveBooking = (bookingId) => {
    const allBookings = getBookings();

    const booking = allBookings.find((item) => {
      const normalized = normalizeBooking(item);
      return Number(normalized.booking_id) === Number(bookingId);
    });

    if (!booking) {
      alert("Booking not found.");
      return;
    }

    const normalizedBooking = normalizeBooking(booking);

    if (normalizedBooking.booking_status === "Cancelled") {
      alert("This booking was cancelled by the resident.");
      return;
    }

    if (normalizedBooking.booking_status === "Approved") {
      alert("This booking is already approved.");
      return;
    }

    if (normalizedBooking.document_status !== "Approved") {
      alert("Please approve the uploaded document before approving the booking.");
      return;
    }

    const occupancyUpdated = updateRoomOccupancyAfterApproval(normalizedBooking);

    if (!occupancyUpdated) return;

    const updatedBookings = allBookings.map((item) => {
      const normalized = normalizeBooking(item);

      if (Number(normalized.booking_id) === Number(bookingId)) {
        addNotification(
          normalized.resident_id,
          "booking",
          "Booking Approved",
          "Your booking at " +
            normalized.dorm_name +
            ", Room " +
            (normalized.room_number || "-") +
            ", has been approved. You can now complete your payment.",
          normalized.email
        );

        return {
          ...item,
          booking_status: "Approved",
          document_status: "Approved",
          payment_status: normalized.payment_status || "Pending",
          admin_id: localStorage.getItem("loggedInAdminId") || 1,
          updated_at: formatDateToday(),

          status: "Approved",
          documentStatus: "Approved",
          paymentStatus: normalized.payment_status || "Pending",
          updatedAt: formatDateToday(),
        };
      }

      return item;
    });

    saveBookings(updatedBookings);
    alert("Booking approved successfully. Room occupancy has been updated.");
  };

  const rejectBooking = (bookingId) => {
    const updatedBookings = getBookings().map((booking) => {
      const normalized = normalizeBooking(booking);

      if (Number(normalized.booking_id) === Number(bookingId)) {
        addNotification(
          normalized.resident_id,
          "booking",
          "Booking Rejected",
          "Your booking request at " + normalized.dorm_name + " has been rejected.",
          normalized.email
        );

        const finalDocumentStatus =
          normalized.document_status === "Pending"
            ? "Rejected"
            : normalized.document_status;

        return {
          ...booking,
          booking_status: "Rejected",
          document_status: finalDocumentStatus,
          updated_at: formatDateToday(),

          status: "Rejected",
          documentStatus: finalDocumentStatus,
          updatedAt: formatDateToday(),
        };
      }

      return booking;
    });

    saveBookings(updatedBookings);
    alert("Booking rejected successfully.");
  };

  const deleteBooking = (bookingId) => {
    const ok = window.confirm("Are you sure you want to delete this booking?");
    if (!ok) return;

    const updatedBookings = getBookings().filter((booking) => {
      const normalized = normalizeBooking(booking);
      return Number(normalized.booking_id) !== Number(bookingId);
    });

    saveBookings(updatedBookings);
    alert("Booking deleted successfully.");
  };

  const logout = () => {
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    navigate("/login");
  };

  const normalizedBookings = bookings.map(normalizeBooking);

  const approvedCount = normalizedBookings.filter(
    (b) => b.booking_status === "Approved"
  ).length;

  const pendingCount = normalizedBookings.filter(
    (b) => b.booking_status === "Pending"
  ).length;

  const rejectedCount = normalizedBookings.filter(
    (b) => b.booking_status === "Rejected"
  ).length;

  const cancelledCount = normalizedBookings.filter(
    (b) => b.booking_status === "Cancelled"
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
            <h3>{normalizedBookings.length}</h3>
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

        {normalizedBookings.length === 0 ? (
          <div className="empty-bookings">
            <h3>No bookings found</h3>
            <p>No resident booking requests have been submitted yet.</p>
          </div>
        ) : (
          <section className="booking-list">
            {normalizedBookings.map((booking) => {
              const bookingId = booking.booking_id;
              const bookingStatus = booking.booking_status;
              const documentStatus = booking.document_status;
              const paymentStatus = booking.payment_status;

              return (
                <div className="booking-card" key={bookingId}>
                  <div className="booking-card-left">
                    <img
                      src={getImageUrl(booking.dorm_image)}
                      alt={booking.dorm_name || "Dorm"}
                    />
                  </div>

                  <div className="booking-card-middle">
                    <div className="booking-title-row">
                      <h2>{booking.dorm_name || "Dorm Name"}</h2>
                      <span className={`status-badge ${getStatusClass(bookingStatus)}`}>
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
                        {booking.area || booking.city || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-school"></i>{" "}
                        <strong>Near:</strong> {booking.university_name || "-"}
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
                        <i className="fa-solid fa-clock-rotate-left"></i>{" "}
                        <strong>Updated:</strong>{" "}
                        {booking.updated_at || "Not updated yet"}
                      </p>

                      <p>
                        <i className="fa-solid fa-credit-card"></i>{" "}
                        <strong>Payment Status:</strong> {paymentStatus}
                      </p>
                    </div>

                    <div className="document-box">
                      <h3>
                        <i className="fa-solid fa-file-lines"></i> Booking Document
                      </h3>

                      <p>
                        <strong>Document Type:</strong>{" "}
                        {booking.document_type || "Not specified"}
                      </p>

                      <p>
                        <strong>File Name:</strong>{" "}
                        {booking.file_name || "No file uploaded"}
                      </p>

                      {booking.file_path ? (
                        <div className="booking-document-view">
                          {booking.file_type &&
                          booking.file_type.startsWith("image/") ? (
                            <img
                              src={booking.file_path}
                              alt={booking.file_name || "Booking Document"}
                            />
                          ) : (
                            <a
                              href={booking.file_path}
                              download={booking.file_name || "booking-document"}
                              className="download-document-btn"
                            >
                              <i className="fa-solid fa-download"></i>
                              Download / Review Document
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
                            documentStatus
                          )}`}
                        >
                          {documentStatus}
                        </span>
                      </p>

                      <div className="document-actions">
                        {documentStatus === "Pending" &&
                        bookingStatus === "Pending" ? (
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
                      {bookingStatus === "Pending" && (
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

                      {bookingStatus === "Approved" && (
                        <button className="disabled-btn" disabled>
                          Booking Approved
                        </button>
                      )}

                      {bookingStatus === "Rejected" && (
                        <button className="disabled-btn" disabled>
                          Booking Rejected
                        </button>
                      )}

                      {bookingStatus === "Cancelled" && (
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
                        onClick={() => deleteBooking(bookingId)}
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