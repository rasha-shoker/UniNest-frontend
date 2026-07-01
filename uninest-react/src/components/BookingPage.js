import { useEffect, useState } from "react";
import "./BookingPage.css";
import { createBooking, createDocument } from "../api";

function BookingPage() {
  const [pendingBooking, setPendingBooking] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [documentType, setDocumentType] = useState("ID");
  const [documentFile, setDocumentFile] = useState("");
  const [documentFileName, setDocumentFileName] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail") || "";
  const loggedInUser = localStorage.getItem("loggedInUser") || "";
  const loggedInRole = localStorage.getItem("loggedInRole") || "";

  useEffect(() => {
    const savedPendingBooking = localStorage.getItem("pendingBooking");

    if (!savedPendingBooking) {
      alert("No selected room found. Please choose a room first.");
      window.location.href = "/housings";
      return;
    }

    const booking = JSON.parse(savedPendingBooking);

    if (!booking.room_id && !booking.roomId) {
      alert("Selected room is missing. Please choose a room again.");
      window.location.href = "/housings";
      return;
    }

    if (!loggedInResidentId && loggedInRole !== "student" && loggedInRole !== "employee") {
      localStorage.setItem("redirectAfterLogin", "booking");
      alert("Please login before booking.");
      window.location.href = "/login";
      return;
    }

    setPendingBooking(booking);
  }, [loggedInResidentId, loggedInRole]);

  useEffect(() => {
    calculateTotalPrice();
  }, [checkInDate, checkOutDate, pendingBooking]);

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRoomPrice = () => {
    if (!pendingBooking) return 0;

    return Number(
      pendingBooking.room_price ||
        pendingBooking.price ||
        pendingBooking.roomPrice ||
        0
    );
  };

  const calculateMonths = () => {
    if (!checkInDate || !checkOutDate) return 0;

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    if (end <= start) return 0;

    const yearDifference = end.getFullYear() - start.getFullYear();
    const monthDifference = end.getMonth() - start.getMonth();
    const dayDifference = end.getDate() - start.getDate();

    let months = yearDifference * 12 + monthDifference;

    if (dayDifference > 0) {
      months += 1;
    }

    return months > 0 ? months : 1;
  };

  const calculateTotalPrice = () => {
    const months = calculateMonths();
    const price = getRoomPrice();

    setTotalPrice(months * price);
  };

  const handleDocumentChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      setDocumentFile(e.target.result);
      setDocumentFileName(file.name);
    };

    reader.readAsDataURL(file);
  };

  const saveLocalBookingFallback = (bookingObject) => {
    const oldBookings = JSON.parse(localStorage.getItem("studentBookings")) || [];

    oldBookings.unshift(bookingObject);

    localStorage.setItem("studentBookings", JSON.stringify(oldBookings));
  };

  const saveLocalDocumentFallback = (documentObject) => {
    const oldDocuments = JSON.parse(localStorage.getItem("documents")) || [];

    oldDocuments.unshift(documentObject);

    localStorage.setItem("documents", JSON.stringify(oldDocuments));
  };

  const buildBookingPayload = () => {
    return {
      resident_id: Number(loggedInResidentId || pendingBooking.resident_id),
      room_id: Number(pendingBooking.room_id || pendingBooking.roomId),
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      total_price: Number(totalPrice),
      booking_status: "pending",
      admin_note: "",
      admin_id: pendingBooking.admin_id || null,
    };
  };

  const buildLocalBookingObject = (bookingId) => {
    return {
      ...pendingBooking,

      booking_id: bookingId,
      resident_id: loggedInResidentId || pendingBooking.resident_id || "",
      resident_name: loggedInUser || pendingBooking.resident_name || "",
      email: loggedInUserEmail || pendingBooking.email || "",

      room_id: pendingBooking.room_id || pendingBooking.roomId,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      total_price: Number(totalPrice),
      booking_status: "pending",
      admin_note: "",
      created_at: formatDateToday(),

      document_status: documentFile ? "pending" : "not_uploaded",
      payment_status: "pending",

      id: bookingId,
      userName: loggedInUser || pendingBooking.resident_name || "",
      studentName: loggedInUser || pendingBooking.resident_name || "",
      residentName: loggedInUser || pendingBooking.resident_name || "",

      userEmail: loggedInUserEmail || pendingBooking.email || "",
      studentEmail: loggedInUserEmail || pendingBooking.email || "",
      residentEmail: loggedInUserEmail || pendingBooking.email || "",

      roomId: pendingBooking.room_id || pendingBooking.roomId,
      roomNumber: pendingBooking.room_number || pendingBooking.roomNumber,
      roomType: pendingBooking.room_type || pendingBooking.roomType,
      price: Number(pendingBooking.room_price || pendingBooking.price || 0),

      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      totalCost: Number(totalPrice),

      status: "pending",
      documentStatus: documentFile ? "pending" : "not_uploaded",
      paymentStatus: "pending",
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!pendingBooking) {
      alert("No pending booking found.");
      return;
    }

    if (!loggedInResidentId) {
      alert("Please login again before booking.");
      window.location.href = "/login";
      return;
    }

    if (!checkInDate || !checkOutDate) {
      alert("Please choose check-in and check-out dates.");
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    if (!documentFile) {
      alert("Please upload your required document.");
      return;
    }

    if (totalPrice <= 0) {
      alert("Total price must be greater than 0.");
      return;
    }

    try {
      setSubmitting(true);

      const bookingPayload = buildBookingPayload();

      const createdBookingResponse = await createBooking(bookingPayload);

      const createdBooking =
        createdBookingResponse?.data && createdBookingResponse.data.booking_id
          ? createdBookingResponse.data
          : createdBookingResponse;

      const newBookingId =
        createdBooking?.booking_id ||
        createdBooking?.id ||
        pendingBooking.booking_id ||
        Date.now();

      const localBookingObject = buildLocalBookingObject(newBookingId);

      saveLocalBookingFallback(localBookingObject);

      try {
        await createDocument({
          booking_id: Number(newBookingId),
          file_path: documentFile,
          document_type: documentType,
          document_status: "pending",
        });

        saveLocalDocumentFallback({
          document_id: Date.now(),
          booking_id: Number(newBookingId),
          file_path: documentFile,
          file_name: documentFileName,
          document_type: documentType,
          document_status: "pending",
          uploaded_at: formatDateToday(),
        });
      } catch (documentError) {
        console.warn("Document backend save failed:", documentError);

        saveLocalDocumentFallback({
          document_id: Date.now(),
          booking_id: Number(newBookingId),
          file_path: documentFile,
          file_name: documentFileName,
          document_type: documentType,
          document_status: "pending",
          uploaded_at: formatDateToday(),
        });
      }

      localStorage.removeItem("pendingBooking");
      localStorage.removeItem("redirectAfterLogin");

      alert("Booking request submitted successfully.");
      window.location.href = "/my-bookings";
    } catch (error) {
      console.error("Booking backend save failed:", error);

      const localBookingId = pendingBooking.booking_id || Date.now();
      const localBookingObject = buildLocalBookingObject(localBookingId);

      saveLocalBookingFallback(localBookingObject);

      saveLocalDocumentFallback({
        document_id: Date.now(),
        booking_id: Number(localBookingId),
        file_path: documentFile,
        file_name: documentFileName,
        document_type: documentType,
        document_status: "pending",
        uploaded_at: formatDateToday(),
      });

      localStorage.removeItem("pendingBooking");
      localStorage.removeItem("redirectAfterLogin");

      alert(
        "Booking saved locally for frontend testing. Later we will fix backend POST /api/bookings if needed."
      );

      window.location.assign("/my-bookings");
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

  if (!pendingBooking) {
    return (
      <div className="booking-layout">
        <main className="booking-main">
          <div className="booking-card">
            <h2>Loading booking...</h2>
          </div>
        </main>
      </div>
    );
  }

  const months = calculateMonths();

  return (
    <div className="booking-layout">
      <aside className="booking-sidebar">
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

      <main className="booking-main">
        <div className="booking-topbar">
          <div>
            <h1>Complete Booking</h1>
            <p>Confirm your selected dorm room and submit your booking request.</p>
          </div>
        </div>

        <section className="booking-content">
          <div className="booking-summary-card">
            <h2>Selected Room</h2>

            <div className="booking-summary-grid">
              <p>
                <strong>Dorm:</strong>{" "}
                {pendingBooking.dorm_name ||
                  pendingBooking.housingName ||
                  "Dorm Name"}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {pendingBooking.area ||
                  pendingBooking.city ||
                  pendingBooking.location ||
                  "-"}
              </p>

              <p>
                <strong>Room Number:</strong>{" "}
                {pendingBooking.room_number ||
                  pendingBooking.roomNumber ||
                  "-"}
              </p>

              <p>
                <strong>Room Type:</strong>{" "}
                {pendingBooking.room_type ||
                  pendingBooking.roomType ||
                  "-"}
              </p>

              <p>
                <strong>Monthly Price:</strong> ${getRoomPrice()}
              </p>

              <p>
                <strong>Resident:</strong> {loggedInUser || "Resident"}
              </p>
            </div>
          </div>

          <div className="booking-card">
            <h2>Booking Information</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Check-in Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(event) => setCheckInDate(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Check-out Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(event) => setCheckOutDate(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="price-box">
                <p>
                  <strong>Duration:</strong> {months} month(s)
                </p>

                <p>
                  <strong>Total Price:</strong> ${totalPrice}
                </p>
              </div>

              <div className="form-group">
                <label>Document Type</label>
                <select
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                  required
                >
                  <option value="ID">ID</option>
                  <option value="University ID">University ID</option>
                  <option value="Employee ID">Employee ID</option>
                  <option value="Passport">Passport</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Upload Document</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleDocumentChange}
                  required
                />

                {documentFileName && (
                  <small className="form-note">
                    Uploaded: {documentFileName}
                  </small>
                )}
              </div>

              <div className="booking-note">
                <p>
                  Your booking will be sent as <strong>Pending</strong>. The
                  admin must approve your document and booking request.
                </p>
              </div>

              <div className="booking-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    localStorage.removeItem("pendingBooking");
                    window.location.href = "/housings";
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Booking Request"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default BookingPage;