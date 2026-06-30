import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ReportsPage.css";
import {
  getResidents,
  getBookings,
  getPayments,
  getMaintenanceRequests,
  getReviews,
  getDorms,
  getRooms,
} from "../api";

function ReportsPage() {
  const navigate = useNavigate();

  const [residents, setResidents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [dorms, setDorms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");

    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadReports();
  }, [navigate]);

  const normalizeStatus = (status) => {
    return String(status || "pending").toLowerCase();
  };

  const normalizeResident = (resident) => {
    return {
      ...resident,
      resident_id: resident.resident_id || resident.id,
      full_name: resident.full_name || resident.user?.full_name || "Resident",
      email: resident.email || resident.user?.email || "",
      role: resident.role || resident.user_type || "student",
      university: resident.university || resident.university_name || "",
      company: resident.company || resident.company_name || "",
    };
  };

  const normalizeDorm = (dorm) => {
    return {
      ...dorm,
      dorm_id: dorm.dorm_id || dorm.id,
      dorm_name: dorm.dorm_name || dorm.name || "Dorm Name",
      city: dorm.city || "",
      area: dorm.area || "",
      rooms: Array.isArray(dorm.rooms) ? dorm.rooms : [],
    };
  };

  const normalizeRoom = (room) => {
    return {
      ...room,
      room_id: room.room_id || room.id,
      dorm_id: room.dorm_id || "",
      room_number: room.room_number || "",
      room_type: room.room_type || "",
      room_capacity: Number(room.room_capacity || 1),
      current_occupancy: Number(room.current_occupancy || 0),
      occupancy_limit: Number(
        room.occupancy_limit || room.room_capacity || 1
      ),
      room_price: Number(room.room_price || 0),
      availability_status: room.availability_status || "available",
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
      dorm_id: booking.dorm_id || dorm.dorm_id || room.dorm_id || "",
      room_id: booking.room_id || room.room_id || "",
      total_price: Number(booking.total_price || 0),
      booking_status: booking.booking_status || "pending",
      created_at: booking.created_at || "",
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      payment_id: payment.payment_id || payment.id,
      booking_id: payment.booking_id || "",
      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || "",
      payment_status: payment.payment_status || "pending",
      created_at: payment.created_at || "",
    };
  };

  const normalizeMaintenanceRequest = (request) => {
    return {
      ...request,
      request_id:
        request.maintenance_request_id || request.request_id || request.id,
      booking_id: request.booking_id || "",
      request_status: request.request_status || "pending",
      created_at: request.created_at || "",
    };
  };

  const normalizeReview = (review) => {
    return {
      ...review,
      review_id: review.review_id || review.id,
      resident_id: review.resident_id || "",
      dorm_id: review.dorm_id || "",
      rating: Number(review.rating || 0),
      review_comment: review.review_comment || "",
      review_status: review.review_status || review.status || "visible",
      created_at: review.created_at || "",
    };
  };

  const loadReports = async () => {
    try {
      setLoading(true);

      const [
        residentsResponse,
        bookingsResponse,
        paymentsResponse,
        maintenanceResponse,
        reviewsResponse,
        dormsResponse,
        roomsResponse,
      ] = await Promise.all([
        getResidents().catch(() => []),
        getBookings().catch(() => []),
        getPayments().catch(() => []),
        getMaintenanceRequests().catch(() => []),
        getReviews().catch(() => []),
        getDorms().catch(() => []),
        getRooms().catch(() => []),
      ]);

      const residentsList = Array.isArray(residentsResponse)
        ? residentsResponse
        : residentsResponse.data || [];

      const bookingsList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      const paymentsList = Array.isArray(paymentsResponse)
        ? paymentsResponse
        : paymentsResponse.data || [];

      const maintenanceList = Array.isArray(maintenanceResponse)
        ? maintenanceResponse
        : maintenanceResponse.data || [];

      const reviewsList = Array.isArray(reviewsResponse)
        ? reviewsResponse
        : reviewsResponse.data || [];

      const dormsList = Array.isArray(dormsResponse)
        ? dormsResponse
        : dormsResponse.data || [];

      const roomsList = Array.isArray(roomsResponse)
        ? roomsResponse
        : roomsResponse.data || [];

      setResidents(residentsList.map(normalizeResident));
      setBookings(bookingsList.map(normalizeBooking));
      setPayments(paymentsList.map(normalizePayment));
      setMaintenanceRequests(maintenanceList.map(normalizeMaintenanceRequest));
      setReviews(reviewsList.map(normalizeReview));
      setDorms(dormsList.map(normalizeDorm));
      setRooms(roomsList.map(normalizeRoom));
    } catch (error) {
      console.error("Reports load failed:", error);
      alert("Could not load reports from backend.");
    } finally {
      setLoading(false);
    }
  };

  const percent = (part, total) => {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  const isPaid = (value) => {
    const status = normalizeStatus(value);
    return status === "completed" || status === "paid";
  };

  const calculateTotalRevenue = () => {
    return payments.reduce((total, payment) => {
      if (isPaid(payment.payment_status)) {
        return total + Number(payment.amount || 0);
      }

      return total;
    }, 0);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return "0.0";

    const total = reviews.reduce((sum, review) => {
      return sum + Number(review.rating || 0);
    }, 0);

    return (total / reviews.length).toFixed(1);
  };

  const getUniversityFromResident = (resident) => {
    const universityName = String(resident.university || "").toUpperCase();
    const email = String(resident.email || "").toLowerCase();

    if (universityName.includes("AUB") || email.endsWith("@aub.edu.lb")) {
      return "AUB";
    }

    if (universityName.includes("LAU") || email.endsWith("@lau.edu")) {
      return "LAU";
    }

    if (universityName.includes("USJ") || email.endsWith("@usj.edu.lb")) {
      return "USJ";
    }

    return "Other";
  };

  const getBookingMonthIndex = (booking) => {
    if (booking.created_at) {
      const createdDate = new Date(booking.created_at);

      if (!isNaN(createdDate.getMonth())) {
        return createdDate.getMonth();
      }
    }

    return new Date().getMonth();
  };

  const getMonthlyOverview = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthCounts = new Array(12).fill(0);

    bookings.forEach((booking) => {
      const monthIndex = getBookingMonthIndex(booking);

      if (monthIndex >= 0 && monthIndex <= 11) {
        monthCounts[monthIndex]++;
      }
    });

    return months.map((month, index) => ({
      month,
      count: monthCounts[index],
    }));
  };

  const logout = () => {
    localStorage.removeItem("loggedInAdminId");
    localStorage.removeItem("loggedInResidentId");
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    localStorage.removeItem("loggedInUserType");

    navigate("/login");
  };

  const approvedBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "approved"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "pending"
  ).length;

  const rejectedBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "rejected"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => normalizeStatus(booking.booking_status) === "cancelled"
  ).length;

  const completedPayments = payments.filter((payment) =>
    isPaid(payment.payment_status)
  ).length;

  const totalRevenue = calculateTotalRevenue();

  const pendingMaintenance = maintenanceRequests.filter(
    (request) => normalizeStatus(request.request_status) === "pending"
  ).length;

  const progressMaintenance = maintenanceRequests.filter(
    (request) => normalizeStatus(request.request_status) === "in_progress"
  ).length;

  const resolvedMaintenance = maintenanceRequests.filter((request) => {
    const status = normalizeStatus(request.request_status);
    return status === "completed" || status === "resolved";
  }).length;

  const openMaintenance = pendingMaintenance + progressMaintenance;

  const visibleReviews = reviews.filter(
    (review) => normalizeStatus(review.review_status) !== "hidden"
  ).length;

  const hiddenReviews = reviews.filter(
    (review) => normalizeStatus(review.review_status) === "hidden"
  ).length;

  const averageRating = calculateAverageRating();

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.reduce((total, room) => {
    return total + Number(room.current_occupancy || 0);
  }, 0);

  const fallbackOccupiedRooms = bookings.filter((booking) => {
    return normalizeStatus(booking.booking_status) === "approved";
  }).length;

  const finalOccupiedRooms =
    occupiedRooms > 0 ? occupiedRooms : fallbackOccupiedRooms;

  const availableRooms = Math.max(0, totalRooms - finalOccupiedRooms);

  const universityCounts = {
    AUB: 0,
    LAU: 0,
    USJ: 0,
    Others: 0,
  };

  residents.forEach((resident) => {
    const university = getUniversityFromResident(resident);

    if (university === "AUB") {
      universityCounts.AUB++;
    } else if (university === "LAU") {
      universityCounts.LAU++;
    } else if (university === "USJ") {
      universityCounts.USJ++;
    } else {
      universityCounts.Others++;
    }
  });

  const monthlyOverview = getMonthlyOverview();

  return (
    <div className="reports-page reports-layout">
      <aside className="reports-sidebar">
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
            <Link to="/manage-bookings">
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
            <Link to="/reports" className="active">
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

      <main className="reports-main">
        <div className="reports-topbar">
          <div>
            <h1>Reports & Analytics</h1>
            <p>
              Track platform performance, bookings, payments, maintenance
              requests, and reviews.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="report-card">
            <h2>Loading reports...</h2>
          </div>
        ) : (
          <>
            <section className="report-stats">
              <div className="report-stat-card">
                <h3>{residents.length}</h3>
                <p>Total Residents</p>
              </div>

              <div className="report-stat-card">
                <h3>{bookings.length}</h3>
                <p>Total Bookings</p>
              </div>

              <div className="report-stat-card">
                <h3>{dorms.length}</h3>
                <p>Total Dorms</p>
              </div>

              <div className="report-stat-card">
                <h3>{totalRooms}</h3>
                <p>Total Rooms</p>
              </div>

              <div className="report-stat-card">
                <h3>{openMaintenance}</h3>
                <p>Open Maintenance</p>
              </div>

              <div className="report-stat-card">
                <h3>{payments.length}</h3>
                <p>Total Payments</p>
              </div>

              <div className="report-stat-card">
                <h3>${totalRevenue}</h3>
                <p>Total Revenue</p>
              </div>

              <div className="report-stat-card">
                <h3>{averageRating}</h3>
                <p>Average Rating</p>
              </div>
            </section>

            <section className="reports-grid">
              <div className="report-card">
                <h2>Booking Status</h2>

                <ReportBar
                  label="Approved"
                  value={percent(approvedBookings, bookings.length)}
                  colorClass="green-fill"
                />

                <ReportBar
                  label="Pending"
                  value={percent(pendingBookings, bookings.length)}
                  colorClass="orange-fill"
                />

                <ReportBar
                  label="Rejected"
                  value={percent(rejectedBookings, bookings.length)}
                  colorClass="red-fill"
                />

                <ReportBar
                  label="Cancelled"
                  value={percent(cancelledBookings, bookings.length)}
                  colorClass="gray-fill"
                />
              </div>

              <div className="report-card">
                <h2>Payment Report</h2>

                <ReportBar
                  label="Completed Payments"
                  value={percent(completedPayments, payments.length)}
                  colorClass="green-fill"
                />

                <div className="report-summary-box">
                  <p>
                    <strong>Total Revenue:</strong> ${totalRevenue}
                  </p>
                  <p>
                    <strong>Total Payment Records:</strong> {payments.length}
                  </p>
                </div>
              </div>

              <div className="report-card">
                <h2>Maintenance Requests</h2>

                <ReportBar
                  label="Pending"
                  value={percent(pendingMaintenance, maintenanceRequests.length)}
                  colorClass="orange-fill"
                />

                <ReportBar
                  label="In Progress"
                  value={percent(progressMaintenance, maintenanceRequests.length)}
                  colorClass="blue-fill"
                />

                <ReportBar
                  label="Resolved"
                  value={percent(resolvedMaintenance, maintenanceRequests.length)}
                  colorClass="green-fill"
                />
              </div>

              <div className="report-card">
                <h2>Review Statistics</h2>

                <ReportBar
                  label="Visible Reviews"
                  value={percent(visibleReviews, reviews.length)}
                  colorClass="green-fill"
                />

                <ReportBar
                  label="Hidden Reviews"
                  value={percent(hiddenReviews, reviews.length)}
                  colorClass="red-fill"
                />

                <div className="report-summary-box">
                  <p>
                    <strong>Average Rating:</strong> {averageRating} / 5
                  </p>
                  <p>
                    <strong>Total Reviews:</strong> {reviews.length}
                  </p>
                </div>
              </div>

              <div className="report-card">
                <h2>Dorm Occupancy</h2>

                <ReportBar
                  label="Occupied Rooms"
                  value={percent(finalOccupiedRooms, totalRooms)}
                  colorClass="blue-fill"
                />

                <ReportBar
                  label="Available Rooms"
                  value={percent(availableRooms, totalRooms)}
                  colorClass="cyan-fill"
                />

                <div className="report-summary-box">
                  <p>
                    <strong>Total Rooms:</strong> {totalRooms}
                  </p>
                  <p>
                    <strong>Occupied:</strong> {finalOccupiedRooms}
                  </p>
                </div>
              </div>

              <div className="report-card">
                <h2>University Distribution</h2>

                <ReportBar
                  label="AUB"
                  value={percent(universityCounts.AUB, residents.length)}
                  colorClass="blue-fill"
                />

                <ReportBar
                  label="LAU"
                  value={percent(universityCounts.LAU, residents.length)}
                  colorClass="cyan-fill"
                />

                <ReportBar
                  label="USJ"
                  value={percent(universityCounts.USJ, residents.length)}
                  colorClass="green-fill"
                />

                <ReportBar
                  label="Others"
                  value={percent(universityCounts.Others, residents.length)}
                  colorClass="orange-fill"
                />
              </div>

              <div className="report-card full-card">
                <h2>Monthly Booking Overview</h2>

                <div className="overview-grid">
                  {monthlyOverview.map((item) => (
                    <div className="overview-box" key={item.month}>
                      <h3>{item.month}</h3>
                      <p>{item.count} Bookings</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function ReportBar({ label, value, colorClass }) {
  return (
    <div className="bar-item">
      <div className="bar-label">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="bar-track">
        <div
          className={`bar-fill ${colorClass}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ReportsPage;