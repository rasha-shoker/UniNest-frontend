import { useState } from "react";
import "./BookingPage.css";
import { API_BASE_URL, createBooking, createDocument } from "../api";

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
  const [submitting, setSubmitting] = useState(false);

  const getTodayISO = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getDormImage = (imagePath) => {
    const path = imagePath || "images/aub1.jpg";
    const pathString = String(path);

    if (pathString.startsWith("http")) {
      return pathString;
    }

    if (pathString.startsWith("/storage") || pathString.startsWith("storage")) {
      return `${API_BASE_URL}/${pathString.replace(/^\/+/, "")}`;
    }

    const fileName = pathString.replace("images/", "");

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
      dorm_image:
        booking.dorm_image || booking.housingImage || "images/aub1.jpg",

      city: booking.city || "",
      area: booking.area || booking.location || "",

      room_id: booking.room_id || booking.roomId || "",
      room_number: booking.room_number || booking.roomNumber || "",
      room_type: booking.room_type || booking.roomType || "",
      room_price: Number(booking.room_price || booking.price || 0),

      check_in_date: booking.check_in_date || booking.checkInDate || "",
      check_out_date: booking.check_out_date || booking.checkOutDate || "",
      total_price: Number(booking.total_price || booking.totalCost || 0),

      booking_status: booking.booking_status || booking.status || "pending",
      admin_note: booking.admin_note || "",
      admin_id: booking.admin_id || null,
    };
  };

  const normalizedPendingBooking = normalizePendingBooking(pendingBooking);

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
      };

      setBookingDocument(documentObject);
      setDocumentPreview(documentObject);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
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

    if (!loggedInResidentId) {
      alert("Resident ID is missing. Please login again.");
      window.location.href = "/login";
      return;
    }

    const totalPrice = calculateTotalCost();

    if (totalPrice <= 0) {
      alert("Please select a valid check-in and check-out date.");
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

    try {
      setSubmitting(true);

      const bookingPayload = {
        resident_id: Number(loggedInResidentId),
        room_id: Number(normalizedPendingBooking.room_id),
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: totalPrice,
        booking_status: "pending",
        admin_note: "",
        admin_id: normalizedPendingBooking.admin_id || null,
      };

      const createdBooking = await createBooking(bookingPayload);

      const newBooking =
        createdBooking.data && createdBooking.data.booking_id
          ? createdBooking.data
          : createdBooking;

      const newBookingId = newBooking.booking_id || createdBooking.booking_id;

      if (newBookingId) {
        try {
          await createDocument({
            booking_id: newBookingId,
            document_type: documentType,
            file_path: bookingDocument.file_path,
            document_status: "pending",
          });
        } catch (documentError) {
          console.error("Document upload failed:", documentError);
          alert(
            "Booking was submitted, but the document could not be saved. We can fix the document endpoint after."
          );
        }
      }

      localStorage.removeItem("pendingBooking");

      alert(
        "Booking request submitted successfully. Your booking is now pending admin approval."
      );

      window.location.href = "/my-bookings";
    } catch (error) {
      console.error("Booking submit failed:", error);
      alert(
        "Booking could not be submitted. Make sure POST /bookings exists in Laravel."
      );
    } finally {
      setSubmitting(false);
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
  const minDate = getTodayISO();

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
              <a href="/" onClick={logout}>
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
                {normalizedPendingBooking.city || "-"}
                {normalizedPendingBooking.area
                  ? ` - ${normalizedPendingBooking.area}`
                  : ""}
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

              <button
                type="submit"
                className="btn primary-btn"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Booking Request"}
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