import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ReportsPage.css";

function ReportsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");

    if (role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  const getResidents = () => {
    const residents = JSON.parse(localStorage.getItem("residents"));
    const users = JSON.parse(localStorage.getItem("users"));

    if (residents && Array.isArray(residents)) {
      return residents.map(normalizeResident);
    }

    if (users && Array.isArray(users)) {
      return users.map(normalizeResident);
    }

    return [];
  };

  const getBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const getPayments = () => {
    return JSON.parse(localStorage.getItem("payments")) || [];
  };

  const getMaintenanceRequests = () => {
    return JSON.parse(localStorage.getItem("maintenanceRequests")) || [];
  };

  const getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews")) || [];
  };

  const getDorms = () => {
    const dorms = JSON.parse(localStorage.getItem("dorms"));
    const housings = JSON.parse(localStorage.getItem("housings"));

    if (dorms && Array.isArray(dorms)) {
      return dorms.map(normalizeDorm);
    }

    if (housings && Array.isArray(housings)) {
      return housings.map(normalizeDorm);
    }

    return [];
  };

  const normalizeResident = (resident) => {
    return {
      ...resident,
      resident_id: resident.resident_id || resident.id,
      first_name: resident.first_name || resident.firstName || "",
      last_name: resident.last_name || resident.lastName || "",
      email: resident.email || "",
      user_type: resident.user_type || resident.role || "student",
      university_name: resident.university_name || resident.university || "",
    };
  };

  const normalizeDorm = (dorm) => {
    return {
      ...dorm,
      dorm_id: dorm.dorm_id || dorm.id,
      dorm_name: dorm.dorm_name || dorm.name || "Dorm Name",
      university_name: dorm.university_name || dorm.university || "",
      availability_status:
        dorm.availability_status ||
        dorm.status ||
        dorm.availability ||
        "Available",

      rooms: Array.isArray(dorm.rooms)
        ? dorm.rooms.map((room) => {
            return {
              ...room,
              room_id: room.room_id || room.roomId,
              room_number: room.room_number || room.roomNumber || "",
              room_type: room.room_type || room.type || "",
              room_capacity: Number(room.room_capacity || room.capacity || 1),
              current_occupancy: Number(
                room.current_occupancy || room.currentOccupancy || 0
              ),
              occupancy_limit: Number(
                room.occupancy_limit ||
                  room.occupancyLimit ||
                  room.room_capacity ||
                  room.capacity ||
                  1
              ),
              room_price: Number(room.room_price || room.price || 0),
              availability_status:
                room.availability_status || room.status || "Available",
            };
          })
        : [],
    };
  };

  const normalizeBooking = (booking) => {
    return {
      ...booking,
      booking_id: booking.booking_id || booking.id,
      resident_id: booking.resident_id || "",
      dorm_id: booking.dorm_id || booking.housingId,
      room_id: booking.room_id || booking.roomId || "",
      room_number: booking.room_number || booking.roomNumber || "",
      total_price: Number(booking.total_price || booking.totalCost || 0),
      booking_status: booking.booking_status || booking.status || "Pending",
      payment_status: booking.payment_status || booking.paymentStatus || "Pending",
      created_at: booking.created_at || booking.createdAt || "",
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      payment_id: payment.payment_id || payment.paymentId,
      booking_id: payment.booking_id || payment.bookingId,
      amount: Number(payment.amount || 0),
      payment_method: payment.payment_method || payment.method || "",
      payment_status: payment.payment_status || payment.status || "Pending",
      payment_date: payment.payment_date || payment.paymentDate || "",
    };
  };

  const normalizeMaintenanceRequest = (request) => {
    return {
      ...request,
      request_id: request.request_id || request.id,
      booking_id: request.booking_id || request.bookingId,
      request_status: request.request_status || request.status || "Pending",
      request_date:
        request.request_date || request.submittedDate || request.createdAt || "",
    };
  };

  const normalizeReview = (review) => {
    return {
      ...review,
      review_id: review.review_id || review.id,
      resident_id: review.resident_id || "",
      dorm_id: review.dorm_id || review.housingId,
      rating: Number(review.rating || 0),
      review_comment: review.review_comment || review.comment || "",
      review_status: review.review_status || review.status || "Visible",
      created_at: review.created_at || review.createdAt || review.date || "",
    };
  };

  const percent = (part, total) => {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  const isPaid = (value) => {
    return value === "Completed" || value === "Paid";
  };

  const getUniversityFromResident = (resident) => {
    const universityName = String(resident.university_name || "").toUpperCase();
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

  const calculateTotalRevenue = (payments) => {
    return payments.reduce((total, payment) => {
      const normalized = normalizePayment(payment);

      if (isPaid(normalized.payment_status)) {
        return total + Number(normalized.amount || 0);
      }

      return total;
    }, 0);
  };

  const calculateAverageRating = (reviews) => {
    const normalizedReviews = reviews.map(normalizeReview);

    if (normalizedReviews.length === 0) return "0.0";

    const total = normalizedReviews.reduce((sum, review) => {
      return sum + Number(review.rating || 0);
    }, 0);

    return (total / normalizedReviews.length).toFixed(1);
  };

  const countRooms = (dorms) => {
    return dorms.reduce((total, dorm) => {
      if (Array.isArray(dorm.rooms)) {
        return total + dorm.rooms.length;
      }

      return total;
    }, 0);
  };

  const countOccupiedRooms = (dorms, bookings) => {
    let occupiedFromRooms = 0;

    dorms.forEach((dorm) => {
      if (Array.isArray(dorm.rooms)) {
        dorm.rooms.forEach((room) => {
          occupiedFromRooms += Number(room.current_occupancy || 0);
        });
      }
    });

    if (occupiedFromRooms > 0) return occupiedFromRooms;

    return bookings.filter((booking) => {
      const normalized = normalizeBooking(booking);
      return normalized.booking_status === "Approved";
    }).length;
  };

  const getBookingMonthIndex = (booking) => {
    const normalized = normalizeBooking(booking);

    if (normalized.created_at) {
      const createdDate = new Date(normalized.created_at);

      if (!isNaN(createdDate.getMonth())) {
        return createdDate.getMonth();
      }
    }

    if (normalized.booking_id) {
      const dateFromId = new Date(Number(normalized.booking_id));

      if (!isNaN(dateFromId.getMonth())) {
        return dateFromId.getMonth();
      }
    }

    return new Date().getMonth();
  };

  const getMonthlyOverview = (bookings) => {
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
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    navigate("/login");
  };

  const residents = getResidents().filter((resident) => {
    const userType = String(resident.user_type || "").toLowerCase();
    return userType === "student" || userType === "employee";
  });

  const bookings = getBookings().map(normalizeBooking);
  const payments = getPayments().map(normalizePayment);
  const maintenanceRequests = getMaintenanceRequests().map(
    normalizeMaintenanceRequest
  );
  const reviews = getReviews().map(normalizeReview);
  const dorms = getDorms();

  const approvedBookings = bookings.filter(
    (b) => b.booking_status === "Approved"
  ).length;

  const pendingBookings = bookings.filter(
    (b) => b.booking_status === "Pending"
  ).length;

  const rejectedBookings = bookings.filter(
    (b) => b.booking_status === "Rejected"
  ).length;

  const cancelledBookings = bookings.filter(
    (b) => b.booking_status === "Cancelled"
  ).length;

  const paidBookings = bookings.filter((booking) =>
    isPaid(booking.payment_status)
  ).length;

  const completedPayments = payments.filter((payment) =>
    isPaid(payment.payment_status)
  ).length;

  const totalRevenue = calculateTotalRevenue(payments);

  const pendingMaintenance = maintenanceRequests.filter(
    (r) => r.request_status === "Pending"
  ).length;

  const progressMaintenance = maintenanceRequests.filter(
    (r) => r.request_status === "In Progress"
  ).length;

  const resolvedMaintenance = maintenanceRequests.filter(
    (r) => r.request_status === "Resolved"
  ).length;

  const openMaintenance = pendingMaintenance + progressMaintenance;

  const visibleReviews = reviews.filter(
    (r) => (r.review_status || "Visible") === "Visible"
  ).length;

  const hiddenReviews = reviews.filter(
    (r) => r.review_status === "Hidden"
  ).length;

  const averageRating = calculateAverageRating(reviews);

  const totalRooms = countRooms(dorms);
  const occupiedRooms = countOccupiedRooms(dorms, bookings);
  const availableRooms = Math.max(0, totalRooms - occupiedRooms);

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

  const monthlyOverview = getMonthlyOverview(bookings);

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

            <ReportBar
              label="Paid Bookings"
              value={percent(paidBookings, bookings.length)}
              colorClass="blue-fill"
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
              value={percent(occupiedRooms, totalRooms)}
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
                <strong>Occupied:</strong> {occupiedRooms}
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
        <div className={`bar-fill ${colorClass}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

export default ReportsPage;