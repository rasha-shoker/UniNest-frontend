import { useEffect, useState } from "react";
import "./MaintenancePage.css";
import {
  getBookings,
  getMaintenanceRequests,
  createMaintenanceRequest,
} from "../api";

function MaintenancePage() {
  const [relatedBooking, setRelatedBooking] = useState("");
  const [requestTitle, setRequestTitle] = useState("");
  const [maintenanceCategory, setMaintenanceCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail") || "";
  const loggedInUserName = localStorage.getItem("loggedInUser") || "Resident";

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

  const displayMaintenanceStatus = (status) => {
    const value = normalizeStatus(status);

    if (value === "in_progress") return "In Progress";
    if (value === "completed") return "Resolved";
    if (value === "resolved") return "Resolved";

    return "Pending";
  };

  const getStatusClass = (status) => {
    const value = normalizeStatus(status);

    if (value === "in_progress") return "progress";
    if (value === "completed" || value === "resolved") return "resolved";

    return "pending";
  };

  const getPriorityClass = (priorityValue) => {
    if (priorityValue === "Low") return "low";
    if (priorityValue === "Medium") return "medium";
    if (priorityValue === "High") return "high";
    if (priorityValue === "Urgent") return "urgent";
    return "medium";
  };

  const normalizeBooking = (booking) => {
    const room = booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
    const resident = booking.resident || {};

    return {
      ...booking,
      booking_id: booking.booking_id || booking.id,
      resident_id: booking.resident_id || resident.resident_id || "",
      email: booking.email || resident.email || "",
      booking_status: booking.booking_status || "pending",

      room_id: booking.room_id || room.room_id || "",
      room_number: booking.room_number || room.room_number || "",
      room_type: booking.room_type || room.room_type || "",

      dorm_id: booking.dorm_id || dorm.dorm_id || room.dorm_id || "",
      dorm_name: booking.dorm_name || dorm.dorm_name || "Dorm Name",
    };
  };

  const normalizeMaintenanceRequest = (request) => {
    const booking = request.booking || {};
    const room = request.room || booking.room || {};
    const dorm = room.dorm || {};

    return {
      ...request,
      maintenance_request_id:
        request.maintenance_request_id || request.request_id || request.id,
      booking_id: request.booking_id || booking.booking_id,
      room_id: request.room_id || room.room_id || "",
      room_number: request.room_number || room.room_number || "",
      room_type: request.room_type || room.room_type || "",

      dorm_id: request.dorm_id || dorm.dorm_id || "",
      dorm_name: request.dorm_name || dorm.dorm_name || "Dorm Name",

      request_description: request.request_description || "",
      request_status: request.request_status || "pending",
      created_at: request.created_at || "",
    };
  };

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);

      const [bookingsResponse, requestsResponse] = await Promise.all([
        getBookings(),
        getMaintenanceRequests().catch(() => []),
      ]);

      const bookingsList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      const requestsList = Array.isArray(requestsResponse)
        ? requestsResponse
        : requestsResponse.data || [];

      const currentResidentId = String(loggedInResidentId);
      const currentEmail = loggedInUserEmail.toLowerCase();

      const userBookings = bookingsList.map(normalizeBooking).filter((booking) => {
        const bookingResidentId = String(booking.resident_id || "");
        const bookingEmail = String(booking.email || "").toLowerCase();

        return (
          bookingResidentId === currentResidentId || bookingEmail === currentEmail
        );
      });

      const approved = userBookings.filter((booking) => {
        return normalizeStatus(booking.booking_status) === "approved";
      });

      const userBookingIds = userBookings.map((booking) =>
        Number(booking.booking_id)
      );

      const userRequests = requestsList
        .map(normalizeMaintenanceRequest)
        .filter((request) => {
          return userBookingIds.includes(Number(request.booking_id));
        });

      setApprovedBookings(approved);
      setMyRequests(userRequests);
    } catch (error) {
      console.error("Failed to load maintenance data:", error);
      alert("Could not load maintenance data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const previewMaintenanceImages = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) {
      setUploadedImages([]);
      return;
    }

    const imageFiles = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload image files only.");
        event.target.value = "";
        setUploadedImages([]);
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        imageFiles.push({
          name: file.name,
          data: e.target.result,
        });

        if (imageFiles.length === files.length) {
          setUploadedImages(imageFiles);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const bookingId = Number(relatedBooking);

    if (!bookingId) {
      alert("Please select an approved booking.");
      return;
    }

    const selectedBooking = approvedBookings.find((booking) => {
      return Number(booking.booking_id) === Number(bookingId);
    });

    if (!selectedBooking) {
      alert("Selected booking not found or not approved.");
      return;
    }

    if (!requestTitle || !maintenanceCategory || !priority || !description) {
      alert("Please fill all required fields.");
      return;
    }

    const fullDescription = `
Title: ${requestTitle}
Category: ${maintenanceCategory}
Priority: ${priority}

Description:
${description}
    `.trim();

    try {
      setSubmitting(true);

      await createMaintenanceRequest({
        booking_id: selectedBooking.booking_id,
        room_id: selectedBooking.room_id,
        maintenance_id: null,
        request_description: fullDescription,
        request_status: "pending",
      });

      setRelatedBooking("");
      setRequestTitle("");
      setMaintenanceCategory("");
      setPriority("");
      setDescription("");
      setUploadedImages([]);

      alert("Maintenance request submitted successfully.");
      loadMaintenanceData();
    } catch (error) {
      console.error("Maintenance submit failed:", error);
      alert(
        "Maintenance request could not be submitted. Make sure POST /maintenance-requests exists in Laravel."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalRequests = myRequests.length;
  const pendingRequests = myRequests.filter(
    (request) => normalizeStatus(request.request_status) === "pending"
  ).length;
  const progressRequests = myRequests.filter(
    (request) => normalizeStatus(request.request_status) === "in_progress"
  ).length;
  const resolvedRequests = myRequests.filter((request) => {
    const status = normalizeStatus(request.request_status);
    return status === "completed" || status === "resolved";
  }).length;

  return (
    <div className="maintenance-layout">
      <aside className="maintenance-sidebar">
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
            <a href="/payment">
              <i className="fa-solid fa-credit-card"></i> Payment
            </a>
          </li>

          <li>
            <a href="/maintenance" className="active">
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

      <main className="maintenance-main">
        <div className="maintenance-topbar">
          <div>
            <h1>Maintenance Requests</h1>
            <p>
              Submit and track maintenance issues related to your approved
              bookings.
            </p>
          </div>
        </div>

        <section className="maintenance-grid">
          <div className="maintenance-card">
            <div className="card-header">
              <h2>New Maintenance Request</h2>
              <p>Select an approved booking and describe the maintenance issue.</p>
            </div>

            <form className="maintenance-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="relatedBooking">Related Booking</label>

                <select
                  id="relatedBooking"
                  value={relatedBooking}
                  onChange={(event) => setRelatedBooking(event.target.value)}
                  required
                >
                  <option value="">Select approved booking</option>

                  {approvedBookings.map((booking) => (
                    <option key={booking.booking_id} value={booking.booking_id}>
                      {booking.dorm_name} - Room {booking.room_number || "-"} (
                      {booking.room_type || "-"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="requestTitle">Request Title</label>
                <input
                  type="text"
                  id="requestTitle"
                  placeholder="Example: Broken window"
                  value={requestTitle}
                  onChange={(event) => setRequestTitle(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="maintenanceCategory">Maintenance Category</label>

                <select
                  id="maintenanceCategory"
                  value={maintenanceCategory}
                  onChange={(event) =>
                    setMaintenanceCategory(event.target.value)
                  }
                  required
                >
                  <option value="">Select category</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Internet">Internet</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Bathroom">Bathroom</option>
                  <option value="Air Conditioning">Air Conditioning</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  required
                >
                  <option value="">Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Detailed Issue Description</label>

                <textarea
                  id="description"
                  rows="5"
                  placeholder="Describe the issue clearly..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="maintenanceImages">Upload Issue Images</label>

                <input
                  type="file"
                  id="maintenanceImages"
                  accept="image/*"
                  multiple
                  onChange={previewMaintenanceImages}
                />

                <div className="maintenance-images-preview">
                  {uploadedImages.length === 0 ? (
                    <span>No images selected</span>
                  ) : (
                    uploadedImages.map((image, index) => (
                      <img
                        key={index}
                        src={image.data}
                        alt={image.name || "Maintenance"}
                      />
                    ))
                  )}
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>

          <div className="maintenance-card small-card">
            <div className="card-header">
              <h2>Summary</h2>
            </div>

            <div className="summary-boxes">
              <div className="summary-item">
                <h3>{totalRequests}</h3>
                <p>Total Requests</p>
              </div>

              <div className="summary-item">
                <h3>{pendingRequests}</h3>
                <p>Pending</p>
              </div>

              <div className="summary-item">
                <h3>{progressRequests}</h3>
                <p>In Progress</p>
              </div>

              <div className="summary-item">
                <h3>{resolvedRequests}</h3>
                <p>Resolved</p>
              </div>
            </div>
          </div>

          <div className="maintenance-card full-card">
            <div className="card-header">
              <h2>My Requests</h2>
              <p>Track the progress of your submitted maintenance requests.</p>
            </div>

            <div className="request-list">
              {loading ? (
                <div className="empty-requests-message">
                  <p>Loading maintenance requests...</p>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="empty-requests-message">
                  <p>No maintenance requests yet.</p>
                </div>
              ) : (
                myRequests.map((request) => {
                  const requestText = request.request_description || "-";

                  return (
                    <div
                      className="request-item"
                      key={request.maintenance_request_id}
                    >
                      <div className="request-info">
                        <h3>Maintenance Request</h3>

                        <p>
                          <i className="fa-solid fa-building"></i> Dorm:{" "}
                          {request.dorm_name || "-"}
                        </p>

                        <p>
                          <i className="fa-solid fa-door-open"></i> Room:{" "}
                          {request.room_number || "-"}
                        </p>

                        <p>
                          <i className="fa-solid fa-file-lines"></i>{" "}
                          {requestText}
                        </p>

                        <p>
                          <i className="fa-solid fa-calendar-days"></i>{" "}
                          Submitted: {request.created_at || "-"}
                        </p>
                      </div>

                      <span
                        className={`status ${getStatusClass(
                          request.request_status
                        )}`}
                      >
                        {displayMaintenanceStatus(request.request_status)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MaintenancePage;