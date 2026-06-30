import { useEffect, useState } from "react";
import "./PaymentPage.css";
import { createPayment, getBookings, getPayments } from "../api";

function PaymentPage() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = Number(params.get("bookingId"));

  const loggedInUser = localStorage.getItem("loggedInUser");
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail") || "";
  const loggedInRole = localStorage.getItem("loggedInRole");
  const loggedInUserType =
    localStorage.getItem("loggedInUserType") || loggedInRole;
  const loggedInResidentId = localStorage.getItem("loggedInResidentId");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userPayments, setUserPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

      check_in_date: booking.check_in_date || "-",
      check_out_date: booking.check_out_date || "-",
      total_price: Number(booking.total_price || 0),

      booking_status: booking.booking_status || "pending",
      created_at: booking.created_at || "",
    };
  };

  const normalizePayment = (payment) => {
    const booking = payment.booking || {};
    const bookingRoom = booking.room || {};
    const dorm = bookingRoom.dorm || {};

    return {
      ...payment,

      payment_id: payment.payment_id || payment.id,
      booking_id: payment.booking_id || booking.booking_id,

      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || "-",
      payment_status: payment.payment_status || "pending",
      created_at: payment.created_at || "-",

      dorm_name: payment.dorm_name || dorm.dorm_name || "Dorm Name",
      room_number: payment.room_number || bookingRoom.room_number || "-",
      room_type: payment.room_type || bookingRoom.room_type || "-",
    };
  };

  const loadPaymentPageData = async () => {
    try {
      setLoading(true);

      const [bookingsResponse, paymentsResponse] = await Promise.all([
        getBookings(),
        getPayments().catch(() => []),
      ]);

      const bookingsList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      const paymentsList = Array.isArray(paymentsResponse)
        ? paymentsResponse
        : paymentsResponse.data || [];

      const currentEmail = loggedInUserEmail.toLowerCase();
      const currentResidentId = String(loggedInResidentId || "");

      const normalizedBookings = bookingsList.map(normalizeBooking);

      const foundBooking = normalizedBookings.find((booking) => {
        const bookingEmail = String(booking.email || "").toLowerCase();
        const bookingResidentId = String(booking.resident_id || "");

        return (
          Number(booking.booking_id) === Number(bookingId) &&
          (bookingResidentId === currentResidentId ||
            bookingEmail === currentEmail)
        );
      });

      const normalizedPayments = paymentsList.map(normalizePayment);

      const filteredPayments = normalizedPayments.filter((payment) => {
        const paymentBooking = normalizedBookings.find((booking) => {
          return Number(booking.booking_id) === Number(payment.booking_id);
        });

        if (!paymentBooking) {
          return false;
        }

        const paymentBookingResidentId = String(paymentBooking.resident_id || "");
        const paymentBookingEmail = String(paymentBooking.email || "").toLowerCase();

        return (
          paymentBookingResidentId === currentResidentId ||
          paymentBookingEmail === currentEmail
        );
      });

      setSelectedBooking(foundBooking || null);
      setUserPayments(filteredPayments);
    } catch (error) {
      console.error("Failed to load payment data:", error);
      alert("Could not load payment data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentPageData();
  }, []);

  const paymentForSelectedBooking = userPayments.find((payment) => {
    return Number(payment.booking_id) === Number(bookingId);
  });

  const selectedPaymentStatus =
    paymentForSelectedBooking?.payment_status || "pending";

  const amount = Number(
    selectedBooking?.total_price || selectedBooking?.room_price || 0
  );

  const handleCardNumber = (event) => {
    let value = event.target.value.replace(/\D/g, "").substring(0, 16);
    value = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedBooking) {
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

    if (
      normalizeStatus(selectedPaymentStatus) === "paid" ||
      normalizeStatus(selectedPaymentStatus) === "completed"
    ) {
      alert("This booking has already been paid.");
      window.location.href = "/my-bookings";
      return;
    }

    try {
      setSubmitting(true);

      await createPayment({
        booking_id: selectedBooking.booking_id,
        amount: amount,
        payment_method: paymentMethod,
        payment_status: "paid",
      });

      alert("Payment completed successfully.");
      window.location.href = "/my-bookings";
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment could not be completed. Make sure POST /payments exists.");
    } finally {
      setSubmitting(false);
    }
  };

  const canShowPaymentForm =
    bookingId &&
    selectedBooking &&
    (loggedInUserType === "student" || loggedInUserType === "employee") &&
    normalizeStatus(selectedBooking.booking_status) === "approved" &&
    normalizeStatus(selectedPaymentStatus) !== "paid" &&
    normalizeStatus(selectedPaymentStatus) !== "completed";

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

            {loading ? (
              <div className="payment-warning">Loading payment details...</div>
            ) : !selectedBooking ? (
              <div className="payment-warning">
                Please choose an approved booking from My Bookings to pay.
              </div>
            ) : (
              <>
                <p>
                  <i className="fa-solid fa-building"></i>{" "}
                  <strong>Dorm:</strong>{" "}
                  {selectedBooking.dorm_name || "Dorm Name"}
                </p>

                <p>
                  <i className="fa-solid fa-location-dot"></i>{" "}
                  <strong>Location:</strong>{" "}
                  {selectedBooking.city || "-"}
                  {selectedBooking.area ? ` - ${selectedBooking.area}` : ""}
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
                  {displayStatus(selectedBooking.booking_status)}
                </p>

                <p>
                  <i className="fa-solid fa-credit-card"></i>{" "}
                  <strong>Payment Status:</strong>{" "}
                  {displayStatus(selectedPaymentStatus)}
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
                  Payment status will be saved as Paid after submission.
                </small>
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={!canShowPaymentForm || submitting}
              >
                {submitting ? "Processing..." : "Confirm Payment"}
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
                      {payment.created_at}
                    </p>
                  </div>

                  <span
                    className={`payment-status ${normalizeStatus(
                      payment.payment_status
                    )}`}
                  >
                    {displayStatus(payment.payment_status)}
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