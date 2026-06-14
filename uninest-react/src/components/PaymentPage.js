import { useState } from "react";
import "./PaymentPage.css";

function PaymentPage() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = Number(params.get("bookingId"));

  const loggedInUser = localStorage.getItem("loggedInUser");
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail") || "";
  const loggedInRole = localStorage.getItem("loggedInRole");
  const loggedInUserType =
    localStorage.getItem("loggedInUserType") || loggedInRole;
  const loggedInResidentId = localStorage.getItem("loggedInResidentId");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");

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

  const getBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const saveBookings = (bookings) => {
    localStorage.setItem("studentBookings", JSON.stringify(bookings));
  };

  const getPayments = () => {
    return JSON.parse(localStorage.getItem("payments")) || [];
  };

  const savePayments = (payments) => {
    localStorage.setItem("payments", JSON.stringify(payments));
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

  const addNotification = (residentId, notificationType, title, message) => {
    if (!residentId && !loggedInUserEmail) return;

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
      userEmail: loggedInUserEmail || "",
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

      check_in_date: booking.check_in_date || booking.checkInDate || "-",
      check_out_date: booking.check_out_date || booking.checkOutDate || "-",

      total_price: Number(
        booking.total_price || booking.totalCost || booking.price || 0
      ),

      booking_status: booking.booking_status || booking.status || "Pending",
      document_status:
        booking.document_status || booking.documentStatus || "Pending",

      payment_status:
        booking.payment_status || booking.paymentStatus || "Pending",

      payment_method:
        booking.payment_method || booking.paymentMethod || "Not paid yet",

      payment_date: booking.payment_date || booking.paymentDate || "",
      created_at: booking.created_at || booking.createdAt || "",
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,

      payment_id: payment.payment_id || payment.paymentId,
      booking_id: payment.booking_id || payment.bookingId,

      resident_id: payment.resident_id || "",
      resident_name:
        payment.resident_name ||
        payment.userName ||
        payment.studentName ||
        loggedInUser ||
        "",

      email:
        payment.email ||
        payment.userEmail ||
        payment.studentEmail ||
        loggedInUserEmail ||
        "",

      dorm_id: payment.dorm_id || payment.housingId,
      dorm_name: payment.dorm_name || payment.housingName || "Dorm Name",

      room_id: payment.room_id || payment.roomId || "",
      room_number: payment.room_number || payment.roomNumber || "",
      room_type: payment.room_type || payment.roomType || "",

      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || payment.method || "-",
      payment_status: payment.payment_status || payment.status || "Completed",
      payment_date: payment.payment_date || payment.paymentDate || "-",
    };
  };

  const getSelectedBooking = () => {
    const bookings = getBookings();

    return bookings.map(normalizeBooking).find((booking) => {
      const bookingEmail = (booking.email || "").toLowerCase();
      const bookingResidentId = String(booking.resident_id || "");

      return (
        Number(booking.booking_id) === Number(bookingId) &&
        (bookingResidentId === String(loggedInResidentId) ||
          bookingEmail === loggedInUserEmail.toLowerCase())
      );
    });
  };

  const selectedBooking = getSelectedBooking();

  const payments = getPayments().map(normalizePayment);

  const userPayments = payments.filter((payment) => {
    const paymentEmail = (payment.email || "").toLowerCase();
    const paymentResidentId = String(payment.resident_id || "");

    return (
      paymentResidentId === String(loggedInResidentId) ||
      paymentEmail === loggedInUserEmail.toLowerCase()
    );
  });

  const amount = Number(
    selectedBooking?.total_price || selectedBooking?.room_price || 0
  );

  const handleCardNumber = (event) => {
    let value = event.target.value.replace(/\D/g, "").substring(0, 16);
    value = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const currentBooking = getSelectedBooking();

    if (!currentBooking) {
      alert("Booking not found.");
      window.location.href = "/my-bookings";
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (
      (paymentMethod === "Credit Card" || paymentMethod === "Debit Card") &&
      cardNumber.replace(/\s/g, "").length !== 16
    ) {
      alert("Please enter a valid 16-digit card number.");
      return;
    }

    if (
      (paymentMethod === "Credit Card" || paymentMethod === "Debit Card") &&
      cardHolder.trim().length < 3
    ) {
      alert("Please enter the card holder name.");
      return;
    }

    const paymentAmount = Number(currentBooking.total_price || currentBooking.room_price || 0);

    const alreadyPaid = getPayments()
      .map(normalizePayment)
      .some((payment) => {
        return (
          Number(payment.booking_id) === Number(currentBooking.booking_id) &&
          (payment.payment_status === "Completed" ||
            payment.payment_status === "Paid")
        );
      });

    if (alreadyPaid) {
      alert("This booking has already been paid.");
      window.location.href = "/my-bookings";
      return;
    }

    const paymentId = Date.now();
    const paymentDate = formatDateToday();

    const paymentRecord = {
      payment_id: paymentId,
      booking_id: currentBooking.booking_id,
      amount: paymentAmount,
      payment_method: paymentMethod,
      payment_status: "Completed",
      payment_date: paymentDate,

      resident_id: loggedInResidentId || currentBooking.resident_id || "",
      resident_name: loggedInUser,
      email: loggedInUserEmail,

      dorm_id: currentBooking.dorm_id,
      dorm_name: currentBooking.dorm_name,

      room_id: currentBooking.room_id || "",
      room_number: currentBooking.room_number || "",
      room_type: currentBooking.room_type || "",

      paymentId: paymentId,
      bookingId: currentBooking.booking_id,

      userName: loggedInUser,
      studentName: loggedInUser,

      userEmail: loggedInUserEmail,
      studentEmail: loggedInUserEmail,

      housingId: currentBooking.dorm_id,
      housingName: currentBooking.dorm_name,
      roomId: currentBooking.room_id || "",
      roomNumber: currentBooking.room_number || "",
      roomType: currentBooking.room_type || "",

      method: paymentMethod,
      status: "Completed",
      paymentDate: paymentDate,
    };

    const savedPayments = getPayments();
    savedPayments.push(paymentRecord);
    savePayments(savedPayments);

    const updatedBookings = getBookings().map((booking) => {
      const normalized = normalizeBooking(booking);

      if (Number(normalized.booking_id) === Number(currentBooking.booking_id)) {
        return {
          ...booking,

          payment_status: "Completed",
          payment_date: paymentDate,
          payment_method: paymentMethod,

          paymentStatus: "Completed",
          paymentDate: paymentDate,
          paymentMethod: paymentMethod,
        };
      }

      return booking;
    });

    saveBookings(updatedBookings);

    addNotification(
      loggedInResidentId || currentBooking.resident_id,
      "payment",
      "Payment Completed Successfully",
      "Your payment of $" +
        paymentAmount +
        " for " +
        currentBooking.dorm_name +
        " has been completed successfully."
    );

    alert("Payment completed successfully.");
    window.location.href = "/my-bookings";
  };

  const canShowPaymentForm =
    bookingId &&
    selectedBooking &&
    (loggedInUserType === "student" || loggedInUserType === "employee") &&
    selectedBooking.booking_status === "Approved" &&
    selectedBooking.payment_status !== "Completed" &&
    selectedBooking.payment_status !== "Paid";

  return (
    <div className="payment-page payment-layout">
      <aside className="payment-sidebar">
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
            <a href="/payment" className="active">
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

      <main className="payment-main">
        <div className="payment-topbar">
          <div>
            <h1>Payment</h1>
            <p>Pay your approved booking fees and view your payment history.</p>
          </div>

          <a href="/my-bookings" className="primary-btn">
            <i className="fa-solid fa-arrow-left"></i> My Bookings
          </a>
        </div>

        <section className="payment-container">
          <div className="payment-summary-card">
            <h2>Booking Summary</h2>

            {!selectedBooking ? (
              <div className="payment-warning">
                Please choose an approved booking from My Bookings to pay.
              </div>
            ) : (
              <>
                <p>
                  <i className="fa-solid fa-building"></i>{" "}
                  <strong>Dorm:</strong> {selectedBooking.dorm_name || "Dorm Name"}
                </p>

                <p>
                  <i className="fa-solid fa-location-dot"></i>{" "}
                  <strong>Location:</strong>{" "}
                  {selectedBooking.area || selectedBooking.city || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-school"></i>{" "}
                  <strong>University:</strong>{" "}
                  {selectedBooking.university_name || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-door-open"></i>{" "}
                  <strong>Room Number:</strong>{" "}
                  {selectedBooking.room_number || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-bed"></i>{" "}
                  <strong>Room Type:</strong>{" "}
                  {selectedBooking.room_type || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-calendar-check"></i>{" "}
                  <strong>Check-in:</strong>{" "}
                  {selectedBooking.check_in_date || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-calendar-xmark"></i>{" "}
                  <strong>Check-out:</strong>{" "}
                  {selectedBooking.check_out_date || "-"}
                </p>

                <p>
                  <i className="fa-solid fa-money-bill"></i>{" "}
                  <strong>Total Cost:</strong> ${amount}
                </p>

                <p>
                  <i className="fa-solid fa-circle-check"></i>{" "}
                  <strong>Booking Status:</strong>{" "}
                  {selectedBooking.booking_status || "Pending"}
                </p>

                <p>
                  <i className="fa-solid fa-file-circle-check"></i>{" "}
                  <strong>Document Status:</strong>{" "}
                  {selectedBooking.document_status || "Pending"}
                </p>

                <p>
                  <i className="fa-solid fa-credit-card"></i>{" "}
                  <strong>Payment Status:</strong>{" "}
                  {selectedBooking.payment_status || "Pending"}
                </p>

                {!canShowPaymentForm && (
                  <div className="payment-warning">
                    Only approved unpaid bookings can be paid.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="payment-form-card">
            <h2>Payment Information</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="paymentMethod">Payment Method</label>

                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  disabled={!canShowPaymentForm}
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {(paymentMethod === "Credit Card" ||
                paymentMethod === "Debit Card") && (
                <div className="card-fields">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength="19"
                      value={cardNumber}
                      onChange={handleCardNumber}
                      disabled={!canShowPaymentForm}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cardHolder">Card Holder Name</label>
                    <input
                      type="text"
                      id="cardHolder"
                      placeholder="Full name"
                      value={cardHolder}
                      onChange={(event) => setCardHolder(event.target.value)}
                      disabled={!canShowPaymentForm}
                    />
                  </div>
                </div>
              )}

              <div className="payment-total-box">
                <p>Payment Amount</p>
                <h3>${amount}</h3>
                <small>
                  Payment status will be saved as Completed after submission.
                </small>
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={!canShowPaymentForm}
              >
                Confirm Payment
              </button>
            </form>
          </div>
        </section>

        <section className="payment-history-section">
          <div className="payment-topbar small-topbar">
            <div>
              <h2>Payment History</h2>
              <p>All your previous payment records.</p>
            </div>
          </div>

          {userPayments.length === 0 ? (
            <div className="payment-empty">
              <h3>No payments yet</h3>
              <p>You have not completed any payment yet.</p>
            </div>
          ) : (
            userPayments
              .slice()
              .reverse()
              .map((payment) => (
                <div className="payment-history-card" key={payment.payment_id}>
                  <div>
                    <h3>{payment.dorm_name || "Dorm Name"}</h3>
                    <p>
                      <i className="fa-solid fa-receipt"></i> Payment ID:{" "}
                      {payment.payment_id}
                    </p>
                    <p>
                      <i className="fa-solid fa-door-open"></i> Room:{" "}
                      {payment.room_number || "-"} - {payment.room_type || "-"}
                    </p>
                    <p>
                      <i className="fa-solid fa-money-bill"></i> Amount: $
                      {payment.amount}
                    </p>
                    <p>
                      <i className="fa-solid fa-credit-card"></i> Method:{" "}
                      {payment.payment_method}
                    </p>
                    <p>
                      <i className="fa-solid fa-calendar-days"></i> Date:{" "}
                      {payment.payment_date}
                    </p>
                  </div>

                  <span className="payment-status completed">
                    {payment.payment_status || "Completed"}
                  </span>
                </div>
              ))
          )}
        </section>
      </main>
    </div>
  );
}

export default PaymentPage;