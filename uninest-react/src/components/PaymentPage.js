import { useEffect, useState } from "react";
import "./PaymentPage.css";
import { createPayment, getPayments, updateBooking } from "../api";

function PaymentPage() {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";
  const loggedInUserEmail = (
    localStorage.getItem("loggedInUserEmail") || ""
  ).toLowerCase();

  useEffect(() => {
    loadPaymentPage();
  }, []);

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

    if (value === "paid" || value === "completed") return "paid";
    if (value === "approved") return "approved";
    if (value === "rejected") return "rejected";
    if (value === "cancelled") return "cancelled";

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
      payment_status:
        booking.payment_status || booking.paymentStatus || "pending",

      created_at: booking.created_at || booking.createdAt || "",
      isLocal: booking.isLocal || false,
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      payment_id: payment.payment_id || payment.id,
      booking_id: payment.booking_id || payment.bookingId,
      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || payment.method || "Cash",
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

  const getLocalPayments = () => {
    const localPayments = JSON.parse(localStorage.getItem("payments")) || [];

    return localPayments.map((payment) =>
      normalizePayment({
        ...payment,
        isLocal: true,
      })
    );
  };

  const loadPaymentPage = async () => {
    try {
      setLoading(true);

      const savedBooking = localStorage.getItem("selectedBookingForPayment");

      if (savedBooking) {
        setSelectedBooking(normalizeBooking(JSON.parse(savedBooking)));
      }

      const localPayments = getLocalPayments();

      let backendPayments = [];

      try {
        const paymentsResponse = await getPayments();

        const paymentsList = Array.isArray(paymentsResponse)
          ? paymentsResponse
          : paymentsResponse.data || [];

        backendPayments = paymentsList.map(normalizePayment);
      } catch (error) {
        console.warn("Backend payments could not be loaded:", error);
      }

      setPayments([...backendPayments, ...localPayments]);
    } catch (error) {
      console.error("Payment page load failed:", error);
      alert("Could not load payment page.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentForBooking = (bookingId) => {
    return payments.find((payment) => {
      return Number(payment.booking_id) === Number(bookingId);
    });
  };

  const saveLocalPayment = (paymentObject) => {
    const oldPayments = JSON.parse(localStorage.getItem("payments")) || [];

    const exists = oldPayments.some((payment) => {
      return Number(payment.booking_id) === Number(paymentObject.booking_id);
    });

    if (!exists) {
      oldPayments.unshift(paymentObject);
      localStorage.setItem("payments", JSON.stringify(oldPayments));
    }
  };

  const updateLocalBookingPaymentStatus = (bookingId, newStatus) => {
    const localBookings =
      JSON.parse(localStorage.getItem("studentBookings")) || [];

    const updatedBookings = localBookings.map((booking) => {
      const currentBookingId = booking.booking_id || booking.id;

      if (Number(currentBookingId) === Number(bookingId)) {
        return {
          ...booking,
          payment_status: newStatus,
          paymentStatus: newStatus,
        };
      }

      return booking;
    });

    localStorage.setItem("studentBookings", JSON.stringify(updatedBookings));

    const savedBooking = localStorage.getItem("selectedBookingForPayment");

    if (savedBooking) {
      const parsedBooking = JSON.parse(savedBooking);

      if (Number(parsedBooking.booking_id || parsedBooking.id) === Number(bookingId)) {
        localStorage.setItem(
          "selectedBookingForPayment",
          JSON.stringify({
            ...parsedBooking,
            payment_status: newStatus,
            paymentStatus: newStatus,
          })
        );
      }
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!selectedBooking) {
      alert("No booking selected for payment.");
      window.location.href = "/my-bookings";
      return;
    }

    if (normalizeStatus(selectedBooking.booking_status) !== "approved") {
      alert("Only approved bookings can be paid.");
      return;
    }

    const existingPayment = getPaymentForBooking(selectedBooking.booking_id);

    if (
      existingPayment &&
      (normalizeStatus(existingPayment.payment_status) === "paid" ||
        normalizeStatus(existingPayment.payment_status) === "completed")
    ) {
      alert("This booking is already paid.");
      return;
    }

    if (paymentMethod === "Card") {
      if (!cardHolder.trim() || !cardNumber.trim()) {
        alert("Please fill card holder and card number.");
        return;
      }

      if (cardNumber.trim().length < 8) {
        alert("Card number is too short.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const paymentPayload = {
        booking_id: Number(selectedBooking.booking_id),
        amount: Number(selectedBooking.total_price || 0),
        payment_method: paymentMethod,
        payment_status: "paid",
      };

      const createdPaymentResponse = await createPayment(paymentPayload);

      const createdPayment =
        createdPaymentResponse?.data && createdPaymentResponse.data.payment_id
          ? createdPaymentResponse.data
          : createdPaymentResponse;

      const localPayment = {
        payment_id: createdPayment?.payment_id || Date.now(),
        booking_id: Number(selectedBooking.booking_id),
        amount: Number(selectedBooking.total_price || 0),
        payment_method: paymentMethod,
        payment_status: "paid",
        created_at: formatDateToday(),
        payment_date: formatDateToday(),
        isLocal: selectedBooking.isLocal || false,
      };

      saveLocalPayment(localPayment);

      try {
        await updateBooking(selectedBooking.booking_id, {
          payment_status: "paid",
        });
      } catch (bookingUpdateError) {
        console.warn("Booking payment status update failed:", bookingUpdateError);
      }

      updateLocalBookingPaymentStatus(selectedBooking.booking_id, "paid");

      alert("Payment completed successfully.");
      window.location.href = "/my-bookings";
    } catch (error) {
      console.warn("Backend payment failed, saving locally:", error);

      const localPayment = {
        payment_id: Date.now(),
        booking_id: Number(selectedBooking.booking_id),
        amount: Number(selectedBooking.total_price || 0),
        payment_method: paymentMethod,
        payment_status: "paid",
        created_at: formatDateToday(),
        payment_date: formatDateToday(),
        isLocal: true,
      };

      saveLocalPayment(localPayment);
      updateLocalBookingPaymentStatus(selectedBooking.booking_id, "paid");

      alert("Payment saved locally for frontend testing.");
      window.location.href = "/my-bookings";
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

  const myPayments = payments.filter((payment) => {
    const localBookings = getLocalBookings();

    const relatedBooking = localBookings.find((booking) => {
      return Number(booking.booking_id) === Number(payment.booking_id);
    });

    if (!relatedBooking) {
      return true;
    }

    const sameResident =
      String(relatedBooking.resident_id || "") === String(loggedInResidentId);

    const sameEmail =
      String(relatedBooking.email || "").toLowerCase() === loggedInUserEmail;

    return sameResident || sameEmail;
  });

  return (
    <div className="payment-layout">
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
            <p>Pay your approved booking and view payment records.</p>
          </div>
        </div>

        {loading ? (
          <div className="payment-card">
            <h2>Loading payment page...</h2>
          </div>
        ) : (
          <section className="payment-content">
            <div className="payment-card">
              <h2>Selected Booking</h2>

              {selectedBooking ? (
                <>
                  <div className="payment-booking-summary">
                    <p>
                      <strong>Dorm:</strong> {selectedBooking.dorm_name}
                    </p>

                    <p>
                      <strong>Room:</strong> {selectedBooking.room_number}
                    </p>

                    <p>
                      <strong>Room Type:</strong> {selectedBooking.room_type}
                    </p>

                    <p>
                      <strong>Check-in:</strong>{" "}
                      {selectedBooking.check_in_date || "-"}
                    </p>

                    <p>
                      <strong>Check-out:</strong>{" "}
                      {selectedBooking.check_out_date || "-"}
                    </p>

                    <p>
                      <strong>Booking Status:</strong>{" "}
                      {displayStatus(selectedBooking.booking_status)}
                    </p>

                    <p>
                      <strong>Payment Status:</strong>{" "}
                      {displayStatus(selectedBooking.payment_status)}
                    </p>

                    <p className="payment-amount">
                      <strong>Total Amount:</strong> $
                      {selectedBooking.total_price || 0}
                    </p>
                  </div>

                  {normalizeStatus(selectedBooking.booking_status) ===
                  "approved" ? (
                    normalizeStatus(selectedBooking.payment_status) === "paid" ||
                    normalizeStatus(selectedBooking.payment_status) ===
                      "completed" ? (
                      <div className="payment-note success-note">
                        <p>This booking is already paid.</p>
                      </div>
                    ) : (
                      <form onSubmit={handlePayment} className="payment-form">
                        <div className="form-group">
                          <label>Payment Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(event) =>
                              setPaymentMethod(event.target.value)
                            }
                          >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                        </div>

                        {paymentMethod === "Card" && (
                          <>
                            <div className="form-group">
                              <label>Card Holder</label>
                              <input
                                type="text"
                                value={cardHolder}
                                onChange={(event) =>
                                  setCardHolder(event.target.value)
                                }
                                placeholder="Enter card holder name"
                              />
                            </div>

                            <div className="form-group">
                              <label>Card Number</label>
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={(event) =>
                                  setCardNumber(event.target.value)
                                }
                                placeholder="Enter card number"
                              />
                            </div>
                          </>
                        )}

                        <button
                          type="submit"
                          className="pay-btn"
                          disabled={submitting}
                        >
                          {submitting ? "Processing..." : "Confirm Payment"}
                        </button>
                      </form>
                    )
                  ) : (
                    <div className="payment-note">
                      <p>
                        This booking must be approved by admin before payment.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="payment-note">
                  <p>No booking selected for payment.</p>
                  <a href="/my-bookings" className="pay-btn">
                    Go to My Bookings
                  </a>
                </div>
              )}
            </div>

            <div className="payment-card">
              <h2>Payment History</h2>

              {myPayments.length === 0 ? (
                <div className="empty-payments">
                  <p>No payments yet.</p>
                </div>
              ) : (
                <div className="payment-list">
                  {myPayments.map((payment) => (
                    <div className="payment-history-card" key={payment.payment_id}>
                      <div>
                        <h3>Payment #{payment.payment_id}</h3>
                        <p>
                          <strong>Booking ID:</strong> {payment.booking_id}
                        </p>
                        <p>
                          <strong>Method:</strong> {payment.payment_method}
                        </p>
                        <p>
                          <strong>Date:</strong> {payment.created_at || "-"}
                        </p>
                      </div>

                      <div>
                        <p>
                          <strong>${payment.amount}</strong>
                        </p>

                        <span
                          className={`status-badge ${getStatusClass(
                            payment.payment_status
                          )}`}
                        >
                          {displayStatus(payment.payment_status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default PaymentPage;