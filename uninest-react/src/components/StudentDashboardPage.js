import { useEffect, useState } from "react";
import "./StudentDashboardPage.css";
import {
  getBookings,
  getPayments,
  getMaintenanceRequests,
  getReviews,
  getResidents,
} from "../api";

function StudentDashboardPage() {
  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";
  const loggedInUserEmail = (
    localStorage.getItem("loggedInUserEmail") || ""
  ).toLowerCase();
  const loggedInUser = localStorage.getItem("loggedInUser") || "Resident";

  const [resident, setResident] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
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
    if (value === "in_progress") return "In Progress";
    if (value === "resolved") return "Resolved";

    return "Pending";
  };

  const getStatusClass = (status) => {
    const value = normalizeStatus(status);

    if (value === "approved") return "approved";
    if (value === "paid" || value === "completed") return "paid";
    if (value === "rejected") return "rejected";
    if (value === "cancelled") return "cancelled";
    if (value === "in_progress") return "progress";
    if (value === "resolved") return "resolved";

    return "pending";
  };

  const normalizeResident = (resident) => {
    return {
      ...resident,
      resident_id: resident.resident_id || resident.id,
      full_name:
        resident.full_name ||
        resident.user?.full_name ||
        resident.name ||
        resident.fullName ||
        "Resident",
      email: (
        resident.email ||
        resident.user?.email ||
        resident.userEmail ||
        ""
      ).toLowerCase(),
      phone: resident.phone || "",
      role:
        resident.role ||
        resident.user_type ||
        localStorage.getItem("loggedInUserType") ||
        "student",
      university: resident.university || resident.university_name || "",
      major: resident.major || "",
      company: resident.company || resident.company_name || "",
      created_at: resident.created_at || "",
    };
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
      payment_method: payment.payment_method || payment.method || "",
      payment_status: payment.payment_status || payment.status || "pending",
      created_at: payment.created_at || payment.payment_date || "",
      isLocal: payment.isLocal || false,
    };
  };

  const normalizeMaintenanceRequest = (request) => {
    const booking = request.booking || {};
    const room = request.room || booking.room || {};
    const dorm = room.dorm || {};
    const resident = booking.resident || {};

    return {
      ...request,

      maintenance_request_id:
        request.maintenance_request_id || request.request_id || request.id,

      booking_id: request.booking_id || booking.booking_id || "",
      room_id: request.room_id || room.room_id || "",

      resident_id:
        request.resident_id ||
        resident.resident_id ||
        booking.resident_id ||
        "",

      resident_name:
        request.resident_name ||
        request.residentName ||
        resident.full_name ||
        resident.user?.full_name ||
        "Resident",

      email: (
        request.email ||
        request.residentEmail ||
        resident.email ||
        resident.user?.email ||
        ""
      ).toLowerCase(),

      dorm_name:
        request.dorm_name ||
        request.housingName ||
        dorm.dorm_name ||
        booking.dorm_name ||
        "Dorm",

      room_number:
        request.room_number ||
        request.roomNumber ||
        room.room_number ||
        booking.room_number ||
        "-",

      maintenance_category:
        request.maintenance_category || request.category || "General",

      priority: request.priority || "Medium",

      request_description:
        request.request_description ||
        request.issue_description ||
        request.description ||
        "",

      request_status: request.request_status || request.status || "pending",
      created_at:
        request.created_at ||
        request.request_date ||
        request.submittedDate ||
        request.createdAt ||
        "",

      isLocal: request.isLocal || false,
    };
  };

  const normalizeReview = (review) => {
    const resident = review.resident || {};
    const dorm = review.dorm || {};

    return {
      ...review,

      review_id: review.review_id || review.id,
      booking_id: review.booking_id || review.bookingId || "",

      resident_id: review.resident_id || resident.resident_id || "",
      resident_name:
        review.resident_name ||
        review.residentName ||
        review.userName ||
        resident.full_name ||
        resident.user?.full_name ||
        "Resident",

      email: (
        review.email ||
        review.residentEmail ||
        review.userEmail ||
        resident.email ||
        resident.user?.email ||
        ""
      ).toLowerCase(),

      dorm_id: review.dorm_id || review.housingId || dorm.dorm_id || "",
      dorm_name: review.dorm_name || review.housingName || dorm.dorm_name || "Dorm",

      rating: Number(review.rating || 0),
      review_comment: review.review_comment || review.comment || "",
      review_status: review.review_status || review.status || "visible",
      created_at: review.created_at || review.createdAt || review.date || "",
      isLocal: review.isLocal || false,
    };
  };

  const getLocalResidents = () => {
    const residents = JSON.parse(localStorage.getItem("residents")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const source = residents.length > 0 ? residents : users;

    return source.map(normalizeResident);
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

  const getLocalMaintenanceRequests = () => {
    const localRequests =
      JSON.parse(localStorage.getItem("maintenanceRequests")) || [];

    return localRequests.map((request) =>
      normalizeMaintenanceRequest({
        ...request,
        isLocal: true,
      })
    );
  };

  const getLocalReviews = () => {
    const localReviews = JSON.parse(localStorage.getItem("reviews")) || [];

    return localReviews.map((review) =>
      normalizeReview({
        ...review,
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

  const itemBelongsToMe = (item) => {
    const sameResident =
      String(item.resident_id || "") === String(loggedInResidentId);

    const sameEmail =
      String(item.email || "").toLowerCase() === loggedInUserEmail;

    return sameResident || sameEmail;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const localResidents = getLocalResidents();
      const localBookings = getLocalBookings();
      const localPayments = getLocalPayments();
      const localMaintenance = getLocalMaintenanceRequests();
      const localReviews = getLocalReviews();

      let backendResidents = [];
      let backendBookings = [];
      let backendPayments = [];
      let backendMaintenance = [];
      let backendReviews = [];

      try {
        const residentsResponse = await getResidents();
        const residentsList = Array.isArray(residentsResponse)
          ? residentsResponse
          : residentsResponse.data || [];

        backendResidents = residentsList.map(normalizeResident);
      } catch (error) {
        console.warn("Backend residents could not be loaded:", error);
      }

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
        const paymentsResponse = await getPayments();
        const paymentsList = Array.isArray(paymentsResponse)
          ? paymentsResponse
          : paymentsResponse.data || [];

        backendPayments = paymentsList.map(normalizePayment);
      } catch (error) {
        console.warn("Backend payments could not be loaded:", error);
      }

      try {
        const maintenanceResponse = await getMaintenanceRequests();
        const maintenanceList = Array.isArray(maintenanceResponse)
          ? maintenanceResponse
          : maintenanceResponse.data || [];

        backendMaintenance = maintenanceList.map(normalizeMaintenanceRequest);
      } catch (error) {
        console.warn("Backend maintenance could not be loaded:", error);
      }

      try {
        const reviewsResponse = await getReviews();
        const reviewsList = Array.isArray(reviewsResponse)
          ? reviewsResponse
          : reviewsResponse.data || [];

        backendReviews = reviewsList.map(normalizeReview);
      } catch (error) {
        console.warn("Backend reviews could not be loaded:", error);
      }

      const mergedResidents = mergeById(
        backendResidents,
        localResidents,
        "resident_id"
      );

      const foundResident =
        mergedResidents.find((item) => {
          return itemBelongsToMe(item);
        }) || null;

      const mergedBookings = mergeById(
        backendBookings,
        localBookings,
        "booking_id"
      );

      const mergedPayments = mergeById(
        backendPayments,
        localPayments,
        "payment_id"
      );

      const mergedMaintenance = mergeById(
        backendMaintenance,
        localMaintenance,
        "maintenance_request_id"
      );

      const mergedReviews = mergeById(
        backendReviews,
        localReviews,
        "review_id"
      );

      const myBookings = mergedBookings
        .filter(itemBelongsToMe)
        .sort((a, b) => Number(b.booking_id || 0) - Number(a.booking_id || 0));

      const myBookingIds = myBookings.map((booking) =>
        Number(booking.booking_id)
      );

      const myPayments = mergedPayments.filter((payment) => {
        return myBookingIds.includes(Number(payment.booking_id));
      });

      const myMaintenance = mergedMaintenance
        .filter((request) => {
          const directMatch = itemBelongsToMe(request);
          const bookingMatch = myBookingIds.includes(Number(request.booking_id));
          return directMatch || bookingMatch;
        })
        .sort((a, b) => {
          return (
            Number(b.maintenance_request_id || 0) -
            Number(a.maintenance_request_id || 0)
          );
        });

      const myReviews = mergedReviews
        .filter(itemBelongsToMe)
        .sort((a, b) => Number(b.review_id || 0) - Number(a.review_id || 0));

      setResident(foundResident);
      setBookings(myBookings);
      setPayments(myPayments);
      setMaintenanceRequests(myMaintenance);
      setReviews(myReviews);
    } catch (error) {
      console.error("Student dashboard load failed:", error);
      alert("Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentForBooking = (bookingId) => {
    return payments.find((payment) => {
      return Number(payment.booking_id) === Number(bookingId);
    });
  };

  const isBookingPaid = (booking) => {
    const payment = getPaymentForBooking(booking.booking_id);

    const bookingPaymentStatus = normalizeStatus(booking.payment_status);
    const paymentStatus = normalizeStatus(payment?.payment_status);

    return (
      bookingPaymentStatus === "paid" ||
      bookingPaymentStatus === "completed" ||
      paymentStatus === "paid" ||
      paymentStatus === "completed"
    );
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

  const totalBookings = bookings.length;

  const approvedBookings = bookings.filter((booking) => {
    return normalizeStatus(booking.booking_status) === "approved";
  }).length;

  const pendingBookings = bookings.filter((booking) => {
    return normalizeStatus(booking.booking_status) === "pending";
  }).length;

  const paidBookings = bookings.filter(isBookingPaid).length;

  const openMaintenance = maintenanceRequests.filter((request) => {
    const status = normalizeStatus(request.request_status);
    return status === "pending" || status === "in_progress";
  }).length;

  const latestBooking = bookings[0] || null;
  const latestMaintenance = maintenanceRequests.slice(0, 3);
  const latestReviews = reviews.slice(0, 3);

  const role =
    resident?.role ||
    localStorage.getItem("loggedInUserType") ||
    localStorage.getItem("loggedInRole") ||
    "student";

  const readableRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="student-dashboard-layout">
      <aside className="student-dashboard-sidebar">
        <div className="sidebar-logo">
          <h2>UniNest</h2>
          <p>Resident Panel</p>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a href="/student-dashboard" className="active">
              <i className="fa-solid fa-house"></i> Dashboard
            </a>
          </li>

          <li>
            <a href="/my-bookings">
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
            <a href="/review">
              <i className="fa-solid fa-star"></i> Reviews
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

      <main className="student-dashboard-main">
        <div className="student-dashboard-topbar">
          <div>
            <h1>Welcome, {resident?.full_name || loggedInUser}</h1>
            <p>
              Track your bookings, payments, maintenance requests, and reviews.
            </p>
          </div>

          <div className="student-dashboard-avatar">
            {(resident?.full_name || loggedInUser || "R")
              .charAt(0)
              .toUpperCase()}
          </div>
        </div>

        {loading ? (
          <div className="dashboard-card">
            <h2>Loading dashboard...</h2>
          </div>
        ) : (
          <>
            <section className="dashboard-profile-card">
              <div>
                <h2>{resident?.full_name || loggedInUser}</h2>
                <p>{readableRole}</p>
                <p>{resident?.email || loggedInUserEmail}</p>
              </div>

              <a href="/profile" className="dashboard-action-btn">
                View Profile
              </a>
            </section>

            <section className="student-dashboard-stats">
              <div className="stat-card">
                <h3>{totalBookings}</h3>
                <p>Total Bookings</p>
              </div>

              <div className="stat-card">
                <h3>{pendingBookings}</h3>
                <p>Pending</p>
              </div>

              <div className="stat-card">
                <h3>{approvedBookings}</h3>
                <p>Approved</p>
              </div>

              <div className="stat-card">
                <h3>{paidBookings}</h3>
                <p>Paid</p>
              </div>

              <div className="stat-card">
                <h3>{openMaintenance}</h3>
                <p>Open Maintenance</p>
              </div>

              <div className="stat-card">
                <h3>{reviews.length}</h3>
                <p>Reviews</p>
              </div>
            </section>

            <section className="dashboard-quick-actions">
              <a href="/housings" className="quick-action-card">
                <i className="fa-solid fa-magnifying-glass"></i>
                <span>Explore Dorms</span>
              </a>

              <a href="/my-bookings" className="quick-action-card">
                <i className="fa-solid fa-bed"></i>
                <span>My Bookings</span>
              </a>

              <a href="/payment" className="quick-action-card">
                <i className="fa-solid fa-credit-card"></i>
                <span>Payment</span>
              </a>

              <a href="/maintenance" className="quick-action-card">
                <i className="fa-solid fa-screwdriver-wrench"></i>
                <span>Maintenance</span>
              </a>

              <a href="/review" className="quick-action-card">
                <i className="fa-solid fa-star"></i>
                <span>Reviews</span>
              </a>
            </section>

            <section className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Latest Booking</h2>
                  <a href="/my-bookings">View All</a>
                </div>

                {latestBooking ? (
                  <div className="latest-booking-box">
                    <h3>{latestBooking.dorm_name}</h3>

                    <p>
                      <strong>Room:</strong> {latestBooking.room_number} -{" "}
                      {latestBooking.room_type}
                    </p>

                    <p>
                      <strong>Check-in:</strong>{" "}
                      {latestBooking.check_in_date || "-"}
                    </p>

                    <p>
                      <strong>Check-out:</strong>{" "}
                      {latestBooking.check_out_date || "-"}
                    </p>

                    <p>
                      <strong>Total:</strong> ${latestBooking.total_price || 0}
                    </p>

                    <span
                      className={`status-badge ${getStatusClass(
                        latestBooking.booking_status
                      )}`}
                    >
                      {displayStatus(latestBooking.booking_status)}
                    </span>
                  </div>
                ) : (
                  <div className="empty-message">
                    <p>No booking yet.</p>
                    <a href="/housings" className="dashboard-action-btn">
                      Explore Dorms
                    </a>
                  </div>
                )}
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Recent Maintenance</h2>
                  <a href="/maintenance">View All</a>
                </div>

                {latestMaintenance.length === 0 ? (
                  <div className="empty-message">
                    <p>No maintenance requests yet.</p>
                  </div>
                ) : (
                  latestMaintenance.map((request) => (
                    <div
                      className="dashboard-list-item"
                      key={request.maintenance_request_id}
                    >
                      <div>
                        <h3>{request.maintenance_category || "Maintenance"}</h3>
                        <p>
                          {request.dorm_name} - Room {request.room_number}
                        </p>
                      </div>

                      <span
                        className={`status-badge ${getStatusClass(
                          request.request_status
                        )}`}
                      >
                        {displayStatus(request.request_status)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h2>Recent Reviews</h2>
                  <a href="/review">View All</a>
                </div>

                {latestReviews.length === 0 ? (
                  <div className="empty-message">
                    <p>No reviews yet.</p>
                  </div>
                ) : (
                  latestReviews.map((review) => (
                    <div className="dashboard-list-item" key={review.review_id}>
                      <div>
                        <h3>{review.dorm_name}</h3>
                        <p>{review.review_comment}</p>
                      </div>

                      <span className="status-badge approved">
                        {review.rating} / 5
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentDashboardPage;