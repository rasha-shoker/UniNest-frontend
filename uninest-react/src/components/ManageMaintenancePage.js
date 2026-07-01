import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageMaintenancePage.css";
import {
  getMaintenanceRequests,
  updateMaintenanceRequest,
  getBookings,
  getPayments,
} from "../api";

function ManageMaintenancePage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");

    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadMaintenanceRequests();
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

    return "Pending";
  };

  const getStatusClass = (status) => {
    const value = normalizeStatus(status);

    if (value === "completed" || value === "resolved") return "completed";
    if (value === "in_progress") return "progress";
    if (value === "approved" || value === "paid") return "approved";
    if (value === "rejected" || value === "cancelled") return "rejected";

    return "pending";
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const parseRequestDetails = (request) => {
    const rawDescription =
      request.request_description ||
      request.issue_description ||
      request.description ||
      "";

    let category =
      request.maintenance_category || request.category || "General";

    let priority = request.priority || "Medium";

    let description = rawDescription;

    const match = rawDescription.match(/^(.+?)\s-\s(.+?):\s(.+)$/);

    if (match) {
      category = match[1] || category;
      priority = match[2] || priority;
      description = match[3] || description;
    }

    return {
      category,
      priority,
      description,
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

      city: booking.city || dorm.city || "",
      area: booking.area || dorm.area || booking.location || "",

      room_id: booking.room_id || booking.roomId || room.room_id || "",
      room_number:
        booking.room_number || booking.roomNumber || room.room_number || "-",
      room_type: booking.room_type || booking.roomType || room.room_type || "-",

      booking_status: booking.booking_status || booking.status || "pending",
      payment_status:
        booking.payment_status || booking.paymentStatus || "pending",

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

  const normalizeRequest = (request) => {
    const booking = request.booking || {};
    const room = request.room || booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
    const resident = booking.resident || {};
    const details = parseRequestDetails(request);

    return {
      ...request,

      maintenance_request_id:
        request.maintenance_request_id || request.request_id || request.id,

      booking_id: request.booking_id || booking.booking_id || "",
      room_id: request.room_id || room.room_id || "",
      maintenance_id: request.maintenance_id || null,

      resident_id:
        request.resident_id ||
        resident.resident_id ||
        booking.resident_id ||
        "",

      resident_name:
        request.resident_name ||
        request.residentName ||
        request.userName ||
        resident.full_name ||
        resident.user?.full_name ||
        booking.resident_name ||
        "Resident",

      email:
        request.email ||
        request.userEmail ||
        request.studentEmail ||
        request.residentEmail ||
        resident.email ||
        resident.user?.email ||
        booking.email ||
        "-",

      dorm_id:
        request.dorm_id ||
        request.housingId ||
        dorm.dorm_id ||
        booking.dorm_id ||
        "",

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

      room_type:
        request.room_type ||
        request.roomType ||
        room.room_type ||
        booking.room_type ||
        "-",

      maintenance_category: details.category,
      category: details.category,

      priority: details.priority,

      request_description: details.description,
      issue_description: details.description,
      description: details.description,

      request_status: request.request_status || request.status || "pending",
      status: request.request_status || request.status || "pending",

      created_at:
        request.created_at ||
        request.request_date ||
        request.submittedDate ||
        request.createdAt ||
        "-",

      updated_at: request.updated_at || request.updatedAt || "",

      image_url: request.image_url || request.image || "",
      image_name: request.image_name || request.imageName || "",

      isLocal: request.isLocal || false,
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

  const getLocalRequests = () => {
    const localRequests =
      JSON.parse(localStorage.getItem("maintenanceRequests")) || [];

    return localRequests.map((request) =>
      normalizeRequest({
        ...request,
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

  const enrichRequestWithBooking = (request, allBookings) => {
    const relatedBooking = allBookings.find((booking) => {
      return Number(booking.booking_id) === Number(request.booking_id);
    });

    if (!relatedBooking) return request;

    return normalizeRequest({
      ...request,

      resident_id: request.resident_id || relatedBooking.resident_id,
      resident_name: request.resident_name || relatedBooking.resident_name,
      email: request.email || relatedBooking.email,

      dorm_id: request.dorm_id || relatedBooking.dorm_id,
      dorm_name: request.dorm_name || relatedBooking.dorm_name,

      room_id: request.room_id || relatedBooking.room_id,
      room_number: request.room_number || relatedBooking.room_number,
      room_type: request.room_type || relatedBooking.room_type,
    });
  };

  const loadMaintenanceRequests = async () => {
    try {
      setLoading(true);

      const localBookings = getLocalBookings();
      const localPayments = getLocalPayments();
      const localRequests = getLocalRequests();

      let backendBookings = [];
      let backendPayments = [];
      let backendRequests = [];

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
        const requestsResponse = await getMaintenanceRequests();

        const requestsList = Array.isArray(requestsResponse)
          ? requestsResponse
          : requestsResponse.data || [];

        backendRequests = requestsList.map(normalizeRequest);
      } catch (error) {
        console.warn("Backend maintenance requests could not be loaded:", error);
      }

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

      const mergedRequests = mergeById(
        backendRequests,
        localRequests,
        "maintenance_request_id"
      )
        .map((request) => enrichRequestWithBooking(request, mergedBookings))
        .sort((a, b) => {
          return (
            Number(b.maintenance_request_id || 0) -
            Number(a.maintenance_request_id || 0)
          );
        });

      setBookings(mergedBookings);
      setPayments(mergedPayments);
      setRequests(mergedRequests);
    } catch (error) {
      console.error("Failed to load maintenance requests:", error);
      alert("Could not load maintenance requests.");
    } finally {
      setLoading(false);
    }
  };

  const updateLocalRequest = (requestId, updates) => {
    const localRequests =
      JSON.parse(localStorage.getItem("maintenanceRequests")) || [];

    const updatedRequests = localRequests.map((request) => {
      const currentRequestId =
        request.maintenance_request_id || request.request_id || request.id;

      if (Number(currentRequestId) === Number(requestId)) {
        return {
          ...request,
          ...updates,
          request_status:
            updates.request_status || updates.status || request.request_status,
          status: updates.request_status || updates.status || request.status,
          updated_at: formatDateToday(),
          updatedAt: formatDateToday(),
        };
      }

      return request;
    });

    localStorage.setItem(
      "maintenanceRequests",
      JSON.stringify(updatedRequests)
    );
  };

  const updateRequestStatus = async (request, newStatus) => {
    const requestId = request.maintenance_request_id;

    try {
      await updateMaintenanceRequest(requestId, {
        booking_id: Number(request.booking_id),
        room_id: Number(request.room_id),
        maintenance_id: request.maintenance_id || null,
        request_description: request.request_description,
        request_status: newStatus,
      });

      updateLocalRequest(requestId, {
        request_status: newStatus,
        status: newStatus,
      });

      alert(`Maintenance request marked as ${displayStatus(newStatus)}.`);
      loadMaintenanceRequests();
    } catch (error) {
      console.warn("Backend maintenance update failed:", error);

      updateLocalRequest(requestId, {
        request_status: newStatus,
        status: newStatus,
      });

      alert(
        `Maintenance request marked as ${displayStatus(
          newStatus
        )} locally for frontend testing.`
      );

      loadMaintenanceRequests();
    }
  };

  const getPaymentForBooking = (bookingId) => {
    return payments.find((payment) => {
      return Number(payment.booking_id) === Number(bookingId);
    });
  };

  const getBookingForRequest = (bookingId) => {
    return bookings.find((booking) => {
      return Number(booking.booking_id) === Number(bookingId);
    });
  };

  const isBookingPaid = (bookingId) => {
    const booking = getBookingForRequest(bookingId);
    const payment = getPaymentForBooking(bookingId);

    const bookingPaymentStatus = normalizeStatus(booking?.payment_status);
    const paymentStatus = normalizeStatus(payment?.payment_status);

    return (
      bookingPaymentStatus === "paid" ||
      bookingPaymentStatus === "completed" ||
      paymentStatus === "paid" ||
      paymentStatus === "completed"
    );
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

  const totalRequests = requests.length;

  const pendingCount = requests.filter((request) => {
    return normalizeStatus(request.request_status) === "pending";
  }).length;

  const inProgressCount = requests.filter((request) => {
    return normalizeStatus(request.request_status) === "in_progress";
  }).length;

  const completedCount = requests.filter((request) => {
    const status = normalizeStatus(request.request_status);
    return status === "completed" || status === "resolved";
  }).length;

  return (
    <div className="manage-maintenance-page maintenance-admin-layout">
      <aside className="maintenance-admin-sidebar">
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
            <Link to="/manage-maintenance" className="active">
              <i className="fa-solid fa-screwdriver-wrench"></i> Maintenance
            </Link>
          </li>

          <li>
            <Link to="/manage-reviews">
              <i className="fa-solid fa-star"></i> Manage Reviews
            </Link>
          </li>

          <li>
            <Link to="/reports">
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

      <main className="maintenance-admin-main">
        <div className="maintenance-admin-topbar">
          <div>
            <h1>Manage Maintenance</h1>
            <p>
              Review resident maintenance requests and update their progress.
            </p>
          </div>
        </div>

        <section className="maintenance-admin-stats">
          <div className="maintenance-stat-card">
            <h3>{totalRequests}</h3>
            <p>Total Requests</p>
          </div>

          <div className="maintenance-stat-card">
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>

          <div className="maintenance-stat-card">
            <h3>{inProgressCount}</h3>
            <p>In Progress</p>
          </div>

          <div className="maintenance-stat-card">
            <h3>{completedCount}</h3>
            <p>Completed</p>
          </div>
        </section>

        {loading ? (
          <div className="maintenance-admin-card">
            <h2>Loading maintenance requests...</h2>
          </div>
        ) : requests.length === 0 ? (
          <div className="maintenance-admin-card empty-maintenance">
            <h2>No maintenance requests found</h2>
            <p>No residents have submitted maintenance requests yet.</p>
          </div>
        ) : (
          <section className="maintenance-requests-list">
            {requests.map((request) => {
              const requestStatus = normalizeStatus(request.request_status);
              const paid = isBookingPaid(request.booking_id);

              return (
                <div
                  className="maintenance-request-card"
                  key={request.maintenance_request_id}
                >
                  <div className="request-header">
                    <div>
                      <h2>
                        {request.maintenance_category || "Maintenance Request"}
                      </h2>
                      <p>
                        Request ID #{request.maintenance_request_id}
                        {request.isLocal ? " - Local" : ""}
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

                  <div className="request-info-grid">
                    <p>
                      <i className="fa-solid fa-user"></i>{" "}
                      <strong>Resident:</strong> {request.resident_name}
                    </p>

                    <p>
                      <i className="fa-solid fa-envelope"></i>{" "}
                      <strong>Email:</strong> {request.email}
                    </p>

                    <p>
                      <i className="fa-solid fa-building"></i>{" "}
                      <strong>Dorm:</strong> {request.dorm_name}
                    </p>

                    <p>
                      <i className="fa-solid fa-door-open"></i>{" "}
                      <strong>Room:</strong> {request.room_number}
                    </p>

                    <p>
                      <i className="fa-solid fa-bed"></i>{" "}
                      <strong>Room Type:</strong> {request.room_type}
                    </p>

                    <p>
                      <i className="fa-solid fa-circle-exclamation"></i>{" "}
                      <strong>Priority:</strong> {request.priority}
                    </p>

                    <p>
                      <i className="fa-solid fa-calendar-days"></i>{" "}
                      <strong>Submitted:</strong> {request.created_at}
                    </p>

                    <p>
                      <i className="fa-solid fa-credit-card"></i>{" "}
                      <strong>Booking Paid:</strong> {paid ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="request-description-box">
                    <h3>Description</h3>
                    <p>{request.request_description || "-"}</p>
                  </div>

                  {request.image_url && (
                    <div className="maintenance-image-box">
                      <h3>Attached Image</h3>
                      <img src={request.image_url} alt="Maintenance" />
                    </div>
                  )}

                  {request.isLocal && (
                    <div className="local-note-box">
                      <p>
                        <strong>Note:</strong> This request is saved locally
                        until backend maintenance store/update is fixed.
                      </p>
                    </div>
                  )}

                  <div className="request-actions">
                    {requestStatus === "pending" && (
                      <>
                        <button
                          className="progress-btn"
                          onClick={() =>
                            updateRequestStatus(request, "in_progress")
                          }
                        >
                          Mark In Progress
                        </button>

                        <button
                          className="complete-btn"
                          onClick={() =>
                            updateRequestStatus(request, "completed")
                          }
                        >
                          Mark Completed
                        </button>
                      </>
                    )}

                    {requestStatus === "in_progress" && (
                      <button
                        className="complete-btn"
                        onClick={() =>
                          updateRequestStatus(request, "completed")
                        }
                      >
                        Mark Completed
                      </button>
                    )}

                    {(requestStatus === "completed" ||
                      requestStatus === "resolved") && (
                      <button className="disabled-btn" disabled>
                        Request Completed
                      </button>
                    )}

                    {requestStatus !== "pending" &&
                      requestStatus !== "in_progress" &&
                      requestStatus !== "completed" &&
                      requestStatus !== "resolved" && (
                        <button className="disabled-btn" disabled>
                          {displayStatus(request.request_status)}
                        </button>
                      )}

                    <Link
                      to={`/housing-details?id=${request.dorm_id}`}
                      className="view-dorm-btn"
                    >
                      View Dorm
                    </Link>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default ManageMaintenancePage;