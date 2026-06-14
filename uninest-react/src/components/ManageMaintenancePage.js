import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageMaintenancePage.css";

function ManageMaintenancePage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");
    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadRequests();
  }, [navigate]);

  const getMaintenanceRequests = () => {
    return JSON.parse(localStorage.getItem("maintenanceRequests")) || [];
  };

  const saveMaintenanceRequests = (items) => {
    localStorage.setItem("maintenanceRequests", JSON.stringify(items));
    setRequests(items);
  };

  const getNotifications = () => {
    return JSON.parse(localStorage.getItem("notifications")) || [];
  };

  const saveNotifications = (items) => {
    localStorage.setItem("notifications", JSON.stringify(items));
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const addNotification = (
    resident_id,
    notification_type,
    title,
    message,
    emailFallback
  ) => {
    if (!resident_id && !emailFallback) return;

    const notifications = getNotifications();
    const notificationId = Date.now() + Math.floor(Math.random() * 1000);

    const newNotification = {
      notification_id: notificationId,
      resident_id: resident_id || "",
      title,
      message,
      notification_type,
      is_read: false,
      created_at: formatDateToday(),

      id: notificationId,
      userEmail: emailFallback || "",
      type: notification_type,
      isRead: false,
      date: formatDateToday(),
    };

    notifications.unshift(newNotification);
    saveNotifications(notifications);
  };

  const normalizeRequest = (request) => {
    return {
      ...request,

      request_id: request.request_id || request.id,
      booking_id: request.booking_id || request.bookingId,
      staff_id: request.staff_id || request.staffId || null,

      resident_id: request.resident_id || "",
      resident_name:
        request.resident_name ||
        request.residentName ||
        request.userName ||
        request.studentName ||
        "Resident",

      email:
        request.email ||
        request.residentEmail ||
        request.userEmail ||
        request.studentEmail ||
        "-",

      dorm_id: request.dorm_id || request.housingId,
      dorm_name: request.dorm_name || request.housingName || "-",

      room_id: request.room_id || request.roomId || "",
      room_number: request.room_number || request.roomNumber || "-",
      room_type: request.room_type || request.roomType || "-",

      request_title:
        request.request_title || request.title || "Maintenance Request",

      maintenance_category:
        request.maintenance_category ||
        request.category ||
        request.issueType ||
        "-",

      issue_description: request.issue_description || request.description || "-",
      priority: request.priority || "Medium",

      request_status: request.request_status || request.status || "Pending",
      request_date:
        request.request_date ||
        request.submittedDate ||
        request.createdAt ||
        "-",

      updated_at: request.updated_at || request.updatedAt || "Not updated yet",

      images: Array.isArray(request.images)
        ? request.images.map((image) => {
            return {
              ...image,
              image_id:
                image.image_id || Date.now() + Math.floor(Math.random() * 1000),
              dorm_id: image.dorm_id || null,
              room_id: image.room_id || null,
              maintenance_request_id:
                image.maintenance_request_id ||
                request.request_id ||
                request.id ||
                null,
              image_url: image.image_url || image.data || "",
              uploaded_at:
                image.uploaded_at ||
                request.request_date ||
                request.submittedDate ||
                "",
            };
          })
        : [],
    };
  };

  const loadRequests = () => {
    setRequests(getMaintenanceRequests());
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return "pending";
    if (status === "In Progress") return "progress";
    if (status === "Resolved") return "resolved";
    return "pending";
  };

  const getPriorityClass = (priority) => {
    if (priority === "Low") return "low";
    if (priority === "Medium") return "medium";
    if (priority === "High") return "high";
    if (priority === "Urgent") return "urgent";
    return "medium";
  };

  const updateRequestStatus = (requestId, newStatus) => {
    const allRequests = getMaintenanceRequests();
    let updatedRequest = null;

    const updatedRequests = allRequests.map((request) => {
      const normalized = normalizeRequest(request);

      if (Number(normalized.request_id) === Number(requestId)) {
        updatedRequest = {
          ...request,
          request_status: newStatus,
          updated_at: formatDateToday(),

          status: newStatus,
          updatedAt: formatDateToday(),
        };

        return updatedRequest;
      }

      return request;
    });

    saveMaintenanceRequests(updatedRequests);

    if (updatedRequest) {
      const normalizedUpdated = normalizeRequest(updatedRequest);

      let title = "";
      let message = "";

      if (newStatus === "In Progress") {
        title = "Maintenance Request In Progress";
        message = `Your maintenance request "${
          normalizedUpdated.request_title || "Maintenance Request"
        }" for ${normalizedUpdated.dorm_name || "your dorm"}, Room ${
          normalizedUpdated.room_number || "-"
        }, is now in progress.`;
      }

      if (newStatus === "Resolved") {
        title = "Maintenance Request Resolved";
        message = `Your maintenance request "${
          normalizedUpdated.request_title || "Maintenance Request"
        }" for ${normalizedUpdated.dorm_name || "your dorm"}, Room ${
          normalizedUpdated.room_number || "-"
        }, has been resolved.`;
      }

      addNotification(
        normalizedUpdated.resident_id,
        "maintenance",
        title,
        message,
        normalizedUpdated.email
      );
    }

    alert("Maintenance request status updated successfully.");
  };

  const deleteRequest = (requestId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this maintenance request?"
    );

    if (!ok) return;

    const updatedRequests = getMaintenanceRequests().filter((request) => {
      const normalized = normalizeRequest(request);
      return Number(normalized.request_id) !== Number(requestId);
    });

    saveMaintenanceRequests(updatedRequests);
    alert("Maintenance request deleted successfully.");
  };

  const logout = () => {
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
    navigate("/login");
  };

  const normalizedRequests = requests.map(normalizeRequest);

  const pendingCount = normalizedRequests.filter(
    (request) => request.request_status === "Pending"
  ).length;

  const progressCount = normalizedRequests.filter(
    (request) => request.request_status === "In Progress"
  ).length;

  const resolvedCount = normalizedRequests.filter(
    (request) => request.request_status === "Resolved"
  ).length;

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
            <h3>{normalizedRequests.length}</h3>
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

        {normalizedRequests.length === 0 ? (
          <div className="empty-requests">
            <h3>No maintenance requests found</h3>
            <p>No resident maintenance requests have been submitted yet.</p>
          </div>
        ) : (
          <section className="request-list">
            {normalizedRequests.map((request) => {
              const requestId = request.request_id;
              const requestStatus = request.request_status || "Pending";
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
                        <i className="fa-solid fa-screwdriver-wrench"></i>{" "}
                        <strong>Category:</strong>{" "}
                        {request.maintenance_category || "-"}
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

                      <p>
                        <i className="fa-solid fa-image"></i>{" "}
                        <strong>Images:</strong>{" "}
                        {request.images.length > 0
                          ? `${request.images.length} uploaded`
                          : "No image uploaded"}
                      </p>

                      {Array.isArray(request.images) &&
                        request.images.length > 0 && (
                          <div className="maintenance-image-gallery">
                            {request.images.map((image) => (
                              <img
                                key={image.image_id}
                                src={image.image_url}
                                alt="Maintenance"
                              />
                            ))}
                          </div>
                        )}
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
                      className={`status-badge ${getStatusClass(requestStatus)}`}
                    >
                      {requestStatus}
                    </span>

                    <div className="request-actions">
                      {requestStatus === "Pending" && (
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

                      {requestStatus === "In Progress" && (
                        <button
                          className="complete-btn"
                          onClick={() =>
                            updateRequestStatus(requestId, "Resolved")
                          }
                        >
                          Mark Resolved
                        </button>
                      )}

                      {requestStatus === "Resolved" && (
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