import { useState } from "react";
import "./BookingPage.css";

function BookingPage() {
  const pendingBooking = JSON.parse(localStorage.getItem("pendingBooking"));

  const loggedInUser = localStorage.getItem("loggedInUser");
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail");
  const loggedInRole = localStorage.getItem("loggedInRole");
  const loggedInUserType =
    localStorage.getItem("loggedInUserType") || loggedInRole;
  const loggedInResidentId = localStorage.getItem("loggedInResidentId");

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [bookingDocument, setBookingDocument] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTodayISO = () => {
    return new Date().toISOString().split("T")[0];
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

  const normalizePendingBooking = (booking) => {
    if (!booking) return null;

    return {
      ...booking,

      booking_id: booking.booking_id || booking.id || Date.now(),

      resident_id: booking.resident_id || loggedInResidentId || "",
      resident_name:
        booking.resident_name ||
        booking.residentName ||
        booking.userName ||
        booking.studentName ||
        loggedInUser ||
        "",

      email:
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        loggedInUserEmail ||
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

      available_from:
        booking.available_from || booking.availableFrom || "Not specified",

      available_to:
        booking.available_to || booking.availableTo || "Not specified",

      check_in_date: booking.check_in_date || booking.checkInDate || "",
      check_out_date: booking.check_out_date || booking.checkOutDate || "",
      total_price: Number(booking.total_price || booking.totalCost || 0),

      booking_status: booking.booking_status || booking.status || "Pending",
      document_status:
        booking.document_status || booking.documentStatus || "Pending",
      payment_status:
        booking.payment_status || booking.paymentStatus || "Pending",

      created_at: booking.created_at || booking.createdAt || formatDateToday(),
    };
  };

  const normalizedPendingBooking = normalizePendingBooking(pendingBooking);

  const getBookings = () => {
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

  const addNotification = (residentId, notificationType, title, message) => {
    if (!residentId && !loggedInUserEmail) return;

    const notifications = getNotifications();

    const newNotification = {
      notification_id: Date.now() + Math.floor(Math.random() * 1000),
      resident_id: residentId || "",
      title: title,
      message: message,
      notification_type: notificationType,
      is_read: false,
      created_at: formatDateToday(),

      id: Date.now() + Math.floor(Math.random() * 1000),
      userEmail: loggedInUserEmail || "",
      type: notificationType,
      isRead: false,
      date: formatDateToday(),
    };

    notifications.unshift(newNotification);
    saveNotifications(notifications);
  };

  const calculateTotalCost = () => {
    if (!checkInDate || !checkOutDate || !normalizedPendingBooking) {
      return 0;
    }

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    if (outDate <= inDate) {
      return 0;
    }

    const diffTime = outDate - inDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const monthlyPrice = Number(normalizedPendingBooking.room_price || 0);
    const dailyPrice = monthlyPrice / 30;

    return Math.ceil(dailyPrice * diffDays);
  };

  const isDateInsideRoomAvailability = () => {
    const availableFrom = normalizedPendingBooking.available_from;
    const availableTo = normalizedPendingBooking.available_to;

    if (
      !availableFrom ||
      !availableTo ||
      availableFrom === "Not specified" ||
      availableTo === "Not specified"
    ) {
      return true;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const from = new Date(availableFrom);
    const to = new Date(availableTo);

    if (checkIn < from || checkOut > to) {
      alert(
        "This room is only available from " +
          availableFrom +
          " to " +
          availableTo +
          ". Please choose dates inside this period."
      );
      return false;
    }

    return true;
  };

  const previewBookingDocument = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setBookingDocument(null);
      setDocumentPreview(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid file: PDF, JPG, PNG, DOC, or DOCX.");
      event.target.value = "";
      setBookingDocument(null);
      setDocumentPreview(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const documentObject = {
        file_name: file.name,
        file_type: file.type,
        file_path: e.target.result,

        name: file.name,
        type: file.type,
        data: e.target.result,
      };

      setBookingDocument(documentObject);
      setDocumentPreview(documentObject);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!normalizedPendingBooking) {
      alert("No selected room found. Please select a room first.");
      window.location.href = "/housings";
      return;
    }

    if (!loggedInUser || !loggedInUserEmail || !loggedInUserType) {
      alert("Please login first to complete your booking.");
      window.location.href = "/login";
      return;
    }

    if (loggedInUserType !== "student" && loggedInUserType !== "employee") {
      alert("Only residents can submit booking requests.");
      return;
    }

    if (loggedInUserType === "admin") {
      alert("Admin cannot submit booking requests.");
      window.location.href = "/admin-dashboard";
      return;
    }

    const totalPrice = calculateTotalCost();

    if (totalPrice <= 0) {
      alert("Please select a valid check-in and check-out date.");
      return;
    }

    if (!isDateInsideRoomAvailability()) {
      return;
    }

    if (!documentType) {
      alert("Please select document type.");
      return;
    }

    if (!bookingDocument || !bookingDocument.file_path) {
      alert("Please upload a booking document.");
      return;
    }

    const bookings = getBookings();

    const duplicatePending = bookings.find((booking) => {
      const bookingResidentId = String(booking.resident_id || "");
      const bookingEmail = (
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        ""
      ).toLowerCase();

      const bookingDormId = Number(booking.dorm_id || booking.housingId);
      const bookingRoomId = String(booking.room_id || booking.roomId || "");
      const bookingStatus = booking.booking_status || booking.status || "Pending";

      return (
        (bookingResidentId === String(loggedInResidentId) ||
          bookingEmail === loggedInUserEmail.toLowerCase()) &&
        bookingDormId === Number(normalizedPendingBooking.dorm_id) &&
        bookingRoomId === String(normalizedPendingBooking.room_id) &&
        bookingStatus === "Pending"
      );
    });

    if (duplicatePending) {
      alert("You already have a pending booking request for this room.");
      return;
    }

    const bookingId = Date.now();

    const completedBooking = {
      ...normalizedPendingBooking,

      booking_id: bookingId,

      resident_id: loggedInResidentId || normalizedPendingBooking.resident_id || "",
      resident_name: loggedInUser,
      email: loggedInUserEmail,
      user_type: loggedInUserType,

      dorm_id: normalizedPendingBooking.dorm_id,
      dorm_name: normalizedPendingBooking.dorm_name,
      dorm_image: normalizedPendingBooking.dorm_image || "images/aub1.jpg",

      university_name: normalizedPendingBooking.university_name || "",
      city: normalizedPendingBooking.city || "",
      area: normalizedPendingBooking.area || "",

      room_id: normalizedPendingBooking.room_id || "",
      room_number: normalizedPendingBooking.room_number || "",
      room_type: normalizedPendingBooking.room_type || "",
      room_price: Number(normalizedPendingBooking.room_price || 0),

      available_from: normalizedPendingBooking.available_from || "",
      available_to: normalizedPendingBooking.available_to || "",

      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      total_price: totalPrice,

      booking_status: "Pending",
      admin_note: "",
      admin_id: null,

      document_type: documentType,
      document_status: "Pending",
      file_path: bookingDocument.file_path,
      file_name: bookingDocument.file_name,
      file_type: bookingDocument.file_type,

      payment_status: "Pending",

      created_at: formatDateToday(),

      id: bookingId,

      userName: loggedInUser,
      studentName: loggedInUser,
      residentName: loggedInUser,

      userEmail: loggedInUserEmail,
      studentEmail: loggedInUserEmail,
      residentEmail: loggedInUserEmail,

      userRole: loggedInUserType,

      housingId: normalizedPendingBooking.dorm_id,
      housingName: normalizedPendingBooking.dorm_name,
      housingImage: normalizedPendingBooking.dorm_image || "images/aub1.jpg",

      university: normalizedPendingBooking.university_name || "",
      location: normalizedPendingBooking.area || normalizedPendingBooking.city || "",

      roomId: normalizedPendingBooking.room_id || "",
      roomNumber: normalizedPendingBooking.room_number || "",
      roomType: normalizedPendingBooking.room_type || "",
      price: Number(normalizedPendingBooking.room_price || 0),

      availableFrom: normalizedPendingBooking.available_from || "",
      availableTo: normalizedPendingBooking.available_to || "",

      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalCost: totalPrice,

      documentType: documentType,
      documentName: bookingDocument.file_name,
      documentFileType: bookingDocument.file_type,
      documentData: bookingDocument.file_path,

      documentStatus: "Pending",
      status: "Pending",
      paymentStatus: "Pending",

      createdAt: formatDateToday(),
    };

    bookings.push(completedBooking);
    saveBookings(bookings);

    localStorage.removeItem("pendingBooking");

    addNotification(
      completedBooking.resident_id,
      "booking",
      "Booking Request Submitted",
      "Your booking request for " +
        completedBooking.dorm_name +
        " is pending admin approval."
    );

    alert(
      "Booking request submitted successfully. Your booking is now pending admin approval."
    );

    window.location.href = "/my-bookings";
  };

  if (!normalizedPendingBooking) {
    return (
      <div className="booking-page">
        <header className="navbar">
          <div className="logo">
            <h2>UniNest</h2>
          </div>
        </header>

        <section className="page-header">
          <div className="page-header-content">
            <h1>No Booking Selected</h1>
            <p>Please select a room first before submitting a booking request.</p>
          </div>
        </section>
      </div>
    );
  }

  const totalCost = calculateTotalCost();

  const minDate =
    normalizedPendingBooking.available_from &&
    normalizedPendingBooking.available_from !== "Not specified"
      ? normalizedPendingBooking.available_from
      : getTodayISO();

  const maxDate =
    normalizedPendingBooking.available_to &&
    normalizedPendingBooking.available_to !== "Not specified"
      ? normalizedPendingBooking.available_to
      : undefined;

  return (
    <div className="booking-page">
      <header className="navbar">
        <div className="logo">
          <h2>UniNest</h2>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/housings">Dorms</a>
            </li>
            <li>
              <a href="/student-dashboard">Dashboard</a>
            </li>
            <li>
              <a href="/my-bookings">My Bookings</a>
            </li>
            <li>
              <a href="/" onClick={(event) => {
                event.preventDefault();
                localStorage.removeItem("loggedInAdminId");
                localStorage.removeItem("loggedInResidentId");
                localStorage.removeItem("loggedInUser");
                localStorage.removeItem("loggedInUserEmail");
                localStorage.removeItem("loggedInRole");
                localStorage.removeItem("loggedInUserType");
                window.location.href = "/";
              }}>
                Logout
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <section className="page-header">
        <div className="page-header-content">
          <h1>Booking Request</h1>
          <p>
            Complete your booking request by selecting dates and uploading the
            required document.
          </p>
        </div>
      </section>

      <section className="booking-section">
        <div className="booking-container">
          <div className="booking-summary-card">
            <img
              src={getDormImage(normalizedPendingBooking.dorm_image)}
              alt="Dorm"
            />

            <div className="booking-summary-info">
              <h2>{normalizedPendingBooking.dorm_name || "Dorm Name"}</h2>

              <p>
                <i className="fa-solid fa-location-dot"></i>
                <strong>Location:</strong>{" "}
                {normalizedPendingBooking.area ||
                  normalizedPendingBooking.city ||
                  "-"}
              </p>

              <p>
                <i className="fa-solid fa-school"></i>
                <strong>University:</strong>{" "}
                {normalizedPendingBooking.university_name || "-"}
              </p>

              <p>
                <i className="fa-solid fa-bed"></i>
                <strong>Room Type:</strong>{" "}
                {normalizedPendingBooking.room_type || "-"}
              </p>

              <p>
                <i className="fa-solid fa-door-open"></i>
                <strong>Room Number:</strong>{" "}
                {normalizedPendingBooking.room_number || "-"}
              </p>

              <p>
                <i className="fa-solid fa-dollar-sign"></i>
                <strong>Price/month:</strong> $
                {normalizedPendingBooking.room_price || "0"}
              </p>

              <p>
                <i className="fa-solid fa-calendar-check"></i>
                <strong>Available From:</strong>{" "}
                {normalizedPendingBooking.available_from || "Not specified"}
              </p>

              <p>
                <i className="fa-solid fa-calendar-xmark"></i>
                <strong>Available To:</strong>{" "}
                {normalizedPendingBooking.available_to || "Not specified"}
              </p>

              <p>
                <i className="fa-solid fa-file-circle-check"></i>
                <strong>Document Status:</strong> Pending
              </p>

              <p>
                <i className="fa-solid fa-circle-info"></i>
                <strong>Booking Status:</strong> Pending
              </p>

              <p>
                <i className="fa-solid fa-credit-card"></i>
                <strong>Payment Status:</strong> Pending
              </p>
            </div>
          </div>

          <div className="booking-form-card">
            <h2>Complete Booking Information</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="checkInDate">Check-in Date</label>
                <input
                  type="date"
                  id="checkInDate"
                  value={checkInDate}
                  min={minDate}
                  max={maxDate}
                  onChange={(event) => {
                    setCheckInDate(event.target.value);

                    if (
                      checkOutDate &&
                      new Date(checkOutDate) <= new Date(event.target.value)
                    ) {
                      setCheckOutDate("");
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkOutDate">Check-out Date</label>
                <input
                  type="date"
                  id="checkOutDate"
                  value={checkOutDate}
                  min={checkInDate || minDate}
                  max={maxDate}
                  onChange={(event) => setCheckOutDate(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="documentType">Document Type</label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                  required
                >
                  <option value="">Select document type</option>
                  <option value="Identification Document">
                    Identification Document
                  </option>
                  <option value="University Document">
                    University Document
                  </option>
                  <option value="Company Verification Document">
                    Company Verification Document
                  </option>
                  <option value="Work Verification Document">
                    Work Verification Document
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bookingDocument">Upload Booking Document</label>

                <input
                  type="file"
                  id="bookingDocument"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={previewBookingDocument}
                  required
                />

                <small className="input-note">
                  Allowed files: PDF, JPG, PNG, DOC, DOCX.
                </small>

                <div className="booking-document-preview">
                  {!documentPreview && <span>No document selected</span>}

                  {documentPreview &&
                    documentPreview.file_type &&
                    documentPreview.file_type.startsWith("image/") && (
                      <>
                        <img
                          src={documentPreview.file_path}
                          alt="Booking Document"
                        />
                        <p>{documentPreview.file_name}</p>
                      </>
                    )}

                  {documentPreview &&
                    documentPreview.file_type &&
                    !documentPreview.file_type.startsWith("image/") && (
                      <div className="file-preview-box">
                        <i className="fa-solid fa-file-lines"></i>
                        <p>{documentPreview.file_name}</p>
                      </div>
                    )}
                </div>
              </div>

              <div className="total-cost-box">
                <p>Total Cost</p>
                <h3>${totalCost}</h3>
                <small>
                  The cost is calculated automatically based on room price and
                  stay duration.
                </small>
              </div>

              <button type="submit" className="btn primary-btn">
                Submit Booking Request
              </button>

              <a
                href={`/housing-details?id=${normalizedPendingBooking.dorm_id}`}
                className="secondary-link"
              >
                Back to dorm details
              </a>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-box">
            <h3>UniNest</h3>
            <p>
              A modern dorm booking platform that helps students and employees
              find safe, comfortable, and affordable accommodation.
            </p>
          </div>

          <div className="footer-box">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/housings">Dorms</a>
              </li>
              <li>
                <a href="/student-dashboard">Dashboard</a>
              </li>
              <li>
                <a href="/my-bookings">My Bookings</a>
              </li>
            </ul>
          </div>

          <div className="footer-box">
            <h3>Contact Info</h3>
            <p>
              <i className="fa-solid fa-envelope"></i> support@uninest.com
            </p>
            <p>
              <i className="fa-solid fa-phone"></i> +961 76 741 699
            </p>
            <p>
              <i className="fa-solid fa-phone"></i> +961 81 894 380
            </p>
          </div>

          <div className="footer-box">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 UniNest. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default BookingPage;