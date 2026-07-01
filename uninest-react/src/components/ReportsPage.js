import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ReportsPage.css";
import {
  getDorms,
  getRooms,
  getBookings,
  getResidents,
  getPayments,
  getMaintenanceRequests,
  getReviews,
  getDocuments,
} from "../api";

function ReportsPage() {
  const navigate = useNavigate();

  const [dorms, setDorms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [residents, setResidents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [documents, setDocuments] = useState([]);
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

  const displayStatus = (status) => {
    const value = normalizeStatus(status);

    if (value === "approved") return "Approved";
    if (value === "rejected") return "Rejected";
    if (value === "cancelled") return "Cancelled";
    if (value === "paid") return "Paid";
    if (value === "completed") return "Completed";
    if (value === "resolved") return "Resolved";
    if (value === "in_progress") return "In Progress";
    if (value === "visible") return "Visible";
    if (value === "hidden") return "Hidden";

    return "Pending";
  };

  const getStatusClass = (status) => {
    const value = normalizeStatus(status);

    if (
      value === "approved" ||
      value === "paid" ||
      value === "completed" ||
      value === "resolved" ||
      value === "visible"
    ) {
      return "approved";
    }

    if (value === "in_progress") return "progress";

    if (
      value === "rejected" ||
      value === "cancelled" ||
      value === "hidden"
    ) {
      return "rejected";
    }

    return "pending";
  };

  const normalizeDorm = (dorm) => {
    return {
      ...dorm,
      dorm_id: dorm.dorm_id || dorm.id || dorm.housingId,
      dorm_name: dorm.dorm_name || dorm.name || dorm.housingName || "Dorm Name",
      city: dorm.city || "",
      area: dorm.area || dorm.location || "",
      rating: Number(dorm.rating || 0),
      admin_id: dorm.admin_id || "",
      created_at: dorm.created_at || dorm.createdAt || "",
      isLocal: dorm.isLocal || false,
    };
  };

  const normalizeRoom = (room) => {
    return {
      ...room,
      room_id: room.room_id || room.id || room.roomId,
      dorm_id: room.dorm_id || room.housingId || "",
      room_number: room.room_number || room.roomNumber || "-",
      room_type: room.room_type || room.roomType || "-",
      room_capacity: Number(room.room_capacity || room.capacity || 0),
      current_occupancy: Number(room.current_occupancy || room.currentOccupancy || 0),
      occupancy_limit: Number(room.occupancy_limit || room.occupancyLimit || room.room_capacity || 0),
      room_price: Number(room.room_price || room.price || 0),
      availability_status:
        room.availability_status || room.availabilityStatus || "available",
      isLocal: room.isLocal || false,
    };
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
      email: resident.email || resident.user?.email || resident.userEmail || "",
      phone: resident.phone || "",
      role: resident.role || resident.user_type || "student",
      university: resident.university || "",
      major: resident.major || "",
      company: resident.company || resident.company_name || "",
      created_at: resident.created_at || "",
      isLocal: resident.isLocal || false,
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

      email:
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        resident.email ||
        resident.user?.email ||
        "-",

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

      room_id: booking.room_id || booking.roomId || room.room_id || "",
      room_number:
        booking.room_number || booking.roomNumber || room.room_number || "-",
      room_type: booking.room_type || booking.roomType || room.room_type || "-",

      check_in_date: booking.check_in_date || booking.checkInDate || "",
      check_out_date: booking.check_out_date || booking.checkOutDate || "",

      total_price: Number(
        booking.total_price || booking.totalCost || booking.amount || 0
      ),

      booking_status: booking.booking_status || booking.status || "pending",
      payment_status:
        booking.payment_status || booking.paymentStatus || "pending",

      document_status:
        booking.document_status || booking.documentStatus || "pending",

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

  const normalizeMaintenanceRequest = (request) => {
    const booking = request.booking || {};
    const room = request.room || booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
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
        booking.resident_name ||
        "Resident",

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

      dorm_id: review.dorm_id || review.housingId || dorm.dorm_id || "",
      dorm_name:
        review.dorm_name ||
        review.housingName ||
        dorm.dorm_name ||
        "Dorm Name",

      rating: Number(review.rating || 0),
      review_comment: review.review_comment || review.comment || "",
      review_status: review.review_status || review.status || "visible",
      created_at: review.created_at || review.createdAt || review.date || "",
      isLocal: review.isLocal || false,
    };
  };

  const normalizeDocument = (document) => {
    return {
      ...document,
      document_id: document.document_id || document.id,
      booking_id: document.booking_id || document.bookingId,
      document_type: document.document_type || document.type || "Document",
      document_status: document.document_status || document.status || "pending",
      uploaded_at: document.uploaded_at || document.created_at || "",
      isLocal: document.isLocal || false,
    };
  };

  const getLocalDorms = () => {
    const localDorms =
      JSON.parse(localStorage.getItem("dorms")) ||
      JSON.parse(localStorage.getItem("housings")) ||
      JSON.parse(localStorage.getItem("housingsData")) ||
      [];

    return localDorms.map((dorm) =>
      normalizeDorm({
        ...dorm,
        isLocal: true,
      })
    );
  };

  const getLocalRooms = () => {
    const localRooms = JSON.parse(localStorage.getItem("rooms")) || [];

    return localRooms.map((room) =>
      normalizeRoom({
        ...room,
        isLocal: true,
      })
    );
  };

  const getLocalResidents = () => {
    const localResidents =
      JSON.parse(localStorage.getItem("residents")) ||
      JSON.parse(localStorage.getItem("users")) ||
      [];

    return localResidents.map((resident) =>
      normalizeResident({
        ...resident,
        isLocal: true,
      })
    );
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

  const getLocalDocuments = () => {
    const localDocuments = JSON.parse(localStorage.getItem("documents")) || [];

    return localDocuments.map((document) =>
      normalizeDocument({
        ...document,
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

  const loadReports = async () => {
    try {
      setLoading(true);

      const localDorms = getLocalDorms();
      const localRooms = getLocalRooms();
      const localResidents = getLocalResidents();
      const localBookings = getLocalBookings();
      const localPayments = getLocalPayments();
      const localMaintenance = getLocalMaintenanceRequests();
      const localReviews = getLocalReviews();
      const localDocuments = getLocalDocuments();

      let backendDorms = [];
      let backendRooms = [];
      let backendResidents = [];
      let backendBookings = [];
      let backendPayments = [];
      let backendMaintenance = [];
      let backendReviews = [];
      let backendDocuments = [];

      try {
        const dormsResponse = await getDorms();
        const dormsList = Array.isArray(dormsResponse)
          ? dormsResponse
          : dormsResponse.data || [];

        backendDorms = dormsList.map(normalizeDorm);

        const roomsFromDorms = dormsList.flatMap((dorm) => {
          const dormRooms = dorm.rooms || [];
          return dormRooms.map((room) =>
            normalizeRoom({
              ...room,
              dorm_id: room.dorm_id || dorm.dorm_id,
            })
          );
        });

        backendRooms = roomsFromDorms;
      } catch (error) {
        console.warn("Backend dorms could not be loaded:", error);
      }

      try {
        const roomsResponse = await getRooms();
        const roomsList = Array.isArray(roomsResponse)
          ? roomsResponse
          : roomsResponse.data || [];

        const roomsFromEndpoint = roomsList.map(normalizeRoom);

        backendRooms = mergeById(
          roomsFromEndpoint,
          backendRooms,
          "room_id"
        );
      } catch (error) {
        console.warn("Backend rooms could not be loaded:", error);
      }

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

      try {
        const documentsResponse = await getDocuments();
        const documentsList = Array.isArray(documentsResponse)
          ? documentsResponse
          : documentsResponse.data || [];

        backendDocuments = documentsList.map(normalizeDocument);
      } catch (error) {
        console.warn("Backend documents could not be loaded:", error);
      }

      setDorms(mergeById(backendDorms, localDorms, "dorm_id"));
      setRooms(mergeById(backendRooms, localRooms, "room_id"));
      setResidents(mergeById(backendResidents, localResidents, "resident_id"));

      setBookings(
        mergeById(backendBookings, localBookings, "booking_id").sort(
          (a, b) => Number(b.booking_id || 0) - Number(a.booking_id || 0)
        )
      );

      setPayments(mergeById(backendPayments, localPayments, "payment_id"));

      setMaintenanceRequests(
        mergeById(
          backendMaintenance,
          localMaintenance,
          "maintenance_request_id"
        ).sort((a, b) => {
          return (
            Number(b.maintenance_request_id || 0) -
            Number(a.maintenance_request_id || 0)
          );
        })
      );

      setReviews(
        mergeById(backendReviews, localReviews, "review_id").sort((a, b) => {
          return Number(b.review_id || 0) - Number(a.review_id || 0);
        })
      );

      setDocuments(
        mergeById(backendDocuments, localDocuments, "document_id")
      );
    } catch (error) {
      console.error("Reports load failed:", error);
      alert("Could not load reports.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("loggedInAdminId");
    localStorage.removeItem("loggedInResidentId");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUserType");

    navigate("/login");
  };

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter((booking) => {
    return normalizeStatus(booking.booking_status) === "pending";
  }).length;

  const approvedBookings = bookings.filter((booking) => {
    return normalizeStatus(booking.booking_status) === "approved";
  }).length;

  const rejectedBookings = bookings.filter((booking) => {
    return normalizeStatus(booking.booking_status) === "rejected";
  }).length;

  const cancelledBookings = bookings.filter((booking) => {
    return normalizeStatus(booking.booking_status) === "cancelled";
  }).length;

  const paidPayments = payments.filter((payment) => {
    const status = normalizeStatus(payment.payment_status);
    return status === "paid" || status === "completed";
  });

  const totalRevenue = paidPayments.reduce((total, payment) => {
    return total + Number(payment.amount || 0);
  }, 0);

  const pendingPayments = payments.filter((payment) => {
    return normalizeStatus(payment.payment_status) === "pending";
  }).length;

  const pendingDocuments = documents.filter((document) => {
    return normalizeStatus(document.document_status) === "pending";
  }).length;

  const approvedDocuments = documents.filter((document) => {
    return normalizeStatus(document.document_status) === "approved";
  }).length;

  const pendingMaintenance = maintenanceRequests.filter((request) => {
    return normalizeStatus(request.request_status) === "pending";
  }).length;

  const inProgressMaintenance = maintenanceRequests.filter((request) => {
    return normalizeStatus(request.request_status) === "in_progress";
  }).length;

  const completedMaintenance = maintenanceRequests.filter((request) => {
    const status = normalizeStatus(request.request_status);
    return status === "completed" || status === "resolved";
  }).length;

  const visibleReviews = reviews.filter((review) => {
    return normalizeStatus(review.review_status) === "visible";
  }).length;

  const hiddenReviews = reviews.filter((review) => {
    return normalizeStatus(review.review_status) === "hidden";
  }).length;

  const averageRating =
    reviews.length === 0
      ? 0
      : (
          reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1);

  const totalRoomCapacity = rooms.reduce((total, room) => {
    return total + Number(room.occupancy_limit || room.room_capacity || 0);
  }, 0);

  const occupiedRooms = bookings.filter((booking) => {
    return normalizeStatus(booking.booking_status) === "approved";
  }).length;

  const occupancyRate =
    totalRoomCapacity === 0
      ? 0
      : Math.round((occupiedRooms / totalRoomCapacity) * 100);

  const latestBookings = bookings.slice(0, 5);
  const latestMaintenance = maintenanceRequests.slice(0, 5);
  const latestReviews = reviews.slice(0, 5);

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
            <h1>Reports</h1>
            <p>
              System overview for dorms, rooms, bookings, payments,
              maintenance, and reviews.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="reports-card">
            <h2>Loading reports...</h2>
          </div>
        ) : (
          <>
            <section className="reports-stats">
              <div className="report-stat-card">
                <h3>{dorms.length}</h3>
                <p>Total Dorms</p>
              </div>

              <div className="report-stat-card">
                <h3>{rooms.length}</h3>
                <p>Total Rooms</p>
              </div>

              <div className="report-stat-card">
                <h3>{residents.length}</h3>
                <p>Total Residents</p>
              </div>

              <div className="report-stat-card">
                <h3>{totalBookings}</h3>
                <p>Total Bookings</p>
              </div>

              <div className="report-stat-card">
                <h3>${totalRevenue}</h3>
                <p>Total Revenue</p>
              </div>

              <div className="report-stat-card">
                <h3>{occupancyRate}%</h3>
                <p>Occupancy Rate</p>
              </div>

              <div className="report-stat-card">
                <h3>{maintenanceRequests.length}</h3>
                <p>Maintenance Requests</p>
              </div>

              <div className="report-stat-card">
                <h3>{averageRating}</h3>
                <p>Average Rating</p>
              </div>
            </section>

            <section className="reports-grid">
              <div className="reports-card">
                <h2>Booking Status</h2>

                <div className="mini-report-list">
                  <div>
                    <span>Pending</span>
                    <strong>{pendingBookings}</strong>
                  </div>

                  <div>
                    <span>Approved</span>
                    <strong>{approvedBookings}</strong>
                  </div>

                  <div>
                    <span>Rejected</span>
                    <strong>{rejectedBookings}</strong>
                  </div>

                  <div>
                    <span>Cancelled</span>
                    <strong>{cancelledBookings}</strong>
                  </div>
                </div>
              </div>

              <div className="reports-card">
                <h2>Payment Status</h2>

                <div className="mini-report-list">
                  <div>
                    <span>Paid Payments</span>
                    <strong>{paidPayments.length}</strong>
                  </div>

                  <div>
                    <span>Pending Payments</span>
                    <strong>{pendingPayments}</strong>
                  </div>

                  <div>
                    <span>Total Revenue</span>
                    <strong>${totalRevenue}</strong>
                  </div>
                </div>
              </div>

              <div className="reports-card">
                <h2>Document Status</h2>

                <div className="mini-report-list">
                  <div>
                    <span>Pending Documents</span>
                    <strong>{pendingDocuments}</strong>
                  </div>

                  <div>
                    <span>Approved Documents</span>
                    <strong>{approvedDocuments}</strong>
                  </div>

                  <div>
                    <span>Total Documents</span>
                    <strong>{documents.length}</strong>
                  </div>
                </div>
              </div>

              <div className="reports-card">
                <h2>Maintenance Status</h2>

                <div className="mini-report-list">
                  <div>
                    <span>Pending</span>
                    <strong>{pendingMaintenance}</strong>
                  </div>

                  <div>
                    <span>In Progress</span>
                    <strong>{inProgressMaintenance}</strong>
                  </div>

                  <div>
                    <span>Completed</span>
                    <strong>{completedMaintenance}</strong>
                  </div>
                </div>
              </div>

              <div className="reports-card">
                <h2>Review Status</h2>

                <div className="mini-report-list">
                  <div>
                    <span>Visible Reviews</span>
                    <strong>{visibleReviews}</strong>
                  </div>

                  <div>
                    <span>Hidden Reviews</span>
                    <strong>{hiddenReviews}</strong>
                  </div>

                  <div>
                    <span>Average Rating</span>
                    <strong>{averageRating}</strong>
                  </div>
                </div>
              </div>

              <div className="reports-card">
                <h2>Room Occupancy</h2>

                <div className="mini-report-list">
                  <div>
                    <span>Total Capacity</span>
                    <strong>{totalRoomCapacity}</strong>
                  </div>

                  <div>
                    <span>Approved Bookings</span>
                    <strong>{occupiedRooms}</strong>
                  </div>

                  <div>
                    <span>Occupancy Rate</span>
                    <strong>{occupancyRate}%</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="reports-table-section">
              <div className="reports-card">
                <div className="table-header">
                  <h2>Latest Bookings</h2>
                  <Link to="/manage-bookings">View All</Link>
                </div>

                {latestBookings.length === 0 ? (
                  <p>No bookings found.</p>
                ) : (
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Resident</th>
                        <th>Dorm</th>
                        <th>Room</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {latestBookings.map((booking) => (
                        <tr key={booking.booking_id}>
                          <td>#{booking.booking_id}</td>
                          <td>{booking.resident_name}</td>
                          <td>{booking.dorm_name}</td>
                          <td>{booking.room_number}</td>
                          <td>${booking.total_price || 0}</td>
                          <td>
                            <span
                              className={`status-badge ${getStatusClass(
                                booking.booking_status
                              )}`}
                            >
                              {displayStatus(booking.booking_status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="reports-card">
                <div className="table-header">
                  <h2>Latest Maintenance</h2>
                  <Link to="/manage-maintenance">View All</Link>
                </div>

                {latestMaintenance.length === 0 ? (
                  <p>No maintenance requests found.</p>
                ) : (
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Resident</th>
                        <th>Dorm</th>
                        <th>Category</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {latestMaintenance.map((request) => (
                        <tr key={request.maintenance_request_id}>
                          <td>#{request.maintenance_request_id}</td>
                          <td>{request.resident_name}</td>
                          <td>{request.dorm_name}</td>
                          <td>{request.maintenance_category}</td>
                          <td>
                            <span
                              className={`status-badge ${getStatusClass(
                                request.request_status
                              )}`}
                            >
                              {displayStatus(request.request_status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="reports-card">
                <div className="table-header">
                  <h2>Latest Reviews</h2>
                  <Link to="/manage-reviews">View All</Link>
                </div>

                {latestReviews.length === 0 ? (
                  <p>No reviews found.</p>
                ) : (
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Resident</th>
                        <th>Dorm</th>
                        <th>Rating</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {latestReviews.map((review) => (
                        <tr key={review.review_id}>
                          <td>#{review.review_id}</td>
                          <td>{review.resident_name}</td>
                          <td>{review.dorm_name}</td>
                          <td>{review.rating} / 5</td>
                          <td>
                            <span
                              className={`status-badge ${getStatusClass(
                                review.review_status
                              )}`}
                            >
                              {displayStatus(review.review_status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default ReportsPage;