import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageMaintenancePage.css";
import {
  getMaintenanceRequests,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from "../api";

function ManageMaintenancePage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");

    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadRequests();
  }, [navigate]);

  const normalizeStatus = (status) => {
    return String(status || "pending").toLowerCase();
  };

  const displayStatus = (status) => {
    const value = normalizeStatus(status);

    if (value === "in_progress") return "In Progress";
    if (value === "completed") return "Resolved";
    if (value === "resolved") return "Resolved";

    return "Pending";
  };

  const backendStatus = (status) => {
    if (status === "In Progress") return "in_progress";
    if (status === "Resolved") return "completed";
    return "pending";
  };

  const normalizeRequest = (request) => {
    const booking = request.booking || {};
    const resident = booking.resident || {};
    const room = request.room || booking.room || {};
    const dorm = room.dorm || booking.dorm || {};

    return {
      ...request,

      request_id:
        request.maintenance_request_id || request.request_id || request.id,

      maintenance_request_id:
        request.maintenance_request_id || request.request_id || request.id,

      booking_id: request.booking_id || booking.booking_id || "",
      maintenance_id: request.maintenance_id || null,

      resident_id: resident.resident_id || booking.resident_id || "",
      resident_name:
        resident.full_name ||
        resident.user?.full_name ||
        request.resident_name ||
        request.residentName ||
        "Resident",

      email:
        resident.email ||
        resident.user?.email ||
        request.email ||
        request.residentEmail ||
        "-",

      dorm_id: dorm.dorm_id || room.dorm_id || "",
      dorm_name: dorm.dorm_name || request.dorm_name || "-",

      room_id: request.room_id || room.room_id || "",
      room_number: room.room_number || request.room_number || "-",
      room_type: room.room_type || request.room_type || "-",

      request_title: "Maintenance Request",

      maintenance_category: "-",
      issue_description: request.request_description || request.description || "-",
      priority: request.priority || "Medium",

      request_status: request.request_status || "pending",
      request_date: request.created_at || request.request_date || "-",

      updated_at: request.updated_at || "Not updated yet",

      images: Array.isArray(request.images) ? request.images : [],
    };
  };

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await getMaintenanceRequests();

      const requestsList = Array.isArray(response) ? response : response.data || [];

      setRequests(requestsList.map(normalizeRequest));
    } catch (error) {
      console.error("Maintenance load failed:", error);
      alert("Could not load maintenance requests from backend.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const value = normalizeStatus(status);

    if (value === "in_progress") return "progress";
    if (value === "completed" || value === "resolved") return "resolved";

    return "pending";
  };

  const getPriorityClass = (priority) => {
    if (priority === "Low") return "low";
    if (priority === "Medium") return "medium";
    if (priority === "High") return "high";
    if (priority === "Urgent") return "urgent";
    return "medium";
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      await updateMaintenanceRequest(requestId, {
        request_status: backendStatus(newStatus),
      });

      alert("Maintenance request status updated successfully.");
      loadRequests();
    } catch (error) {
      console.error("Maintenance update failed:", error);
      alert(
        "Status could not be updated. We may need to fix PATCH /maintenance-requests/{id} later."
      );
    }
  };

  const deleteRequest = async (requestId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this maintenance request?"
    );

    if (!ok) return;

    try {
      await deleteMaintenanceRequest(requestId);
      alert("Maintenance request deleted successfully.");
      loadRequests();
    } catch (error) {
      console.error("Maintenance delete failed:", error);
      alert(
        "Maintenance request could not be deleted. We may need to fix DELETE /maintenance-requests/{id} later."
      );
    }
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

  const pendingCount = requests.filter(
    (request) => normalizeStatus(request.request_status) === "pending"
  ).length;

  const progressCount = requests.filter(
    (request) => normalizeStatus(request.request_status) === "in_progress"
  ).length;

  const resolvedCount = requests.filter((request) => {
    const status = normalizeStatus(request.request_status);
    return status === "completed" || status === "resolved";
  }).length;

  return (
    <div className="manage-maintenance-page maintenance-layout">
      <aside className="maintenance-sidebar">
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

      <main className="maintenance-main">
        <div className="maintenance-topbar">
          <div>
            <h1>Manage Maintenance</h1>
            <p>Track and update all resident maintenance requests.</p>
          </div>
        </div>

        <section className="maintenance-stats">
          <div className="maintenance-stat-card">
            <h3>{requests.length}</h3>
            <p>Total Requests</p>
          </div>

          <div className="maintenance-stat-card">
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>

          <div className="maintenance-stat-card">
            <h3>{progressCount}</h3>
            <p>In Progress</p>
          </div>

          <div className="maintenance-stat-card">
            <h3>{resolvedCount}</h3>
            <p>Resolved</p>
          </div>
        </section>

        {loading ? (
          <div className="empty-requests">
            <h3>Loading maintenance requests...</h3>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-requests">
            <h3>No maintenance requests found</h3>
            <p>No resident maintenance requests have been submitted yet.</p>
          </div>
        ) : (
          <section className="request-list">
            {requests.map((request) => {
              const requestId = request.maintenance_request_id;
              const requestStatus = displayStatus(request.request_status);
              const rawStatus = normalizeStatus(request.request_status);
              const priority = request.priority || "Medium";

              return (
                <div className="request-card" key={requestId}>
                  <div className="request-main">
                    <h2>{request.request_title || "Maintenance Request"}</h2>

                    <div className="request-info-grid">
                      <p>
                        <i className="fa-solid fa-user"></i>{" "}
                        <strong>Resident:</strong>{" "}
                        {request.resident_name || "Resident"}
                      </p>

                      <p>
                        <i className="fa-solid fa-envelope"></i>{" "}
                        <strong>Email:</strong> {request.email || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-building"></i>{" "}
                        <strong>Dorm:</strong> {request.dorm_name || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-door-open"></i>{" "}
                        <strong>Room:</strong> {request.room_number || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-bed"></i>{" "}
                        <strong>Room Type:</strong> {request.room_type || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                        <strong>Priority:</strong>{" "}
                        <span className={`priority ${getPriorityClass(priority)}`}>
                          {priority}
                        </span>
                      </p>

                      <p>
                        <i className="fa-solid fa-calendar-days"></i>{" "}
                        <strong>Submitted:</strong>{" "}
                        {request.request_date || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-clock-rotate-left"></i>{" "}
                        <strong>Updated:</strong>{" "}
                        {request.updated_at || "Not updated yet"}
                      </p>
                    </div>

                    <div className="description-box">
                      <p>
                        <i className="fa-solid fa-file-lines"></i>{" "}
                        <strong>Description:</strong>
                      </p>
                      <p>{request.issue_description || "-"}</p>
                    </div>
                  </div>

                  <div className="request-side">
                    <span
                      className={`status-badge ${getStatusClass(
                        request.request_status
                      )}`}
                    >
                      {requestStatus}
                    </span>

                    <div className="request-actions">
                      {rawStatus === "pending" && (
                        <>
                          <button
                            className="progress-btn"
                            onClick={() =>
                              updateRequestStatus(requestId, "In Progress")
                            }
                          >
                            Set In Progress
                          </button>

                          <button
                            className="complete-btn"
                            onClick={() =>
                              updateRequestStatus(requestId, "Resolved")
                            }
                          >
                            Mark Resolved
                          </button>
                        </>
                      )}

                      {rawStatus === "in_progress" && (
                        <button
                          className="complete-btn"
                          onClick={() =>
                            updateRequestStatus(requestId, "Resolved")
                          }
                        >
                          Mark Resolved
                        </button>
                      )}

                      {(rawStatus === "completed" || rawStatus === "resolved") && (
                        <button className="disabled-btn" disabled>
                          Resolved
                        </button>
                      )}

                      <button
                        className="delete-btn"
                        onClick={() => deleteRequest(requestId)}
                      >
                        Delete
                      </button>
                    </div>
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