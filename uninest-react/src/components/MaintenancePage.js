import { useState } from "react";
import "./MaintenancePage.css";

function MaintenancePage() {
  const [relatedBooking, setRelatedBooking] = useState("");
  const [requestTitle, setRequestTitle] = useState("");
  const [maintenanceCategory, setMaintenanceCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [refresh, setRefresh] = useState(0);

  const getCurrentUserEmailValue = () => {
    return localStorage.getItem("loggedInUserEmail") || "";
  };

  const getCurrentUserNameValue = () => {
    return localStorage.getItem("loggedInUser") || "Resident";
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

  const getBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const getMaintenanceRequests = () => {
    return JSON.parse(localStorage.getItem("maintenanceRequests")) || [];
  };

  const saveMaintenanceRequests = (requests) => {
    localStorage.setItem("maintenanceRequests", JSON.stringify(requests));
  };

  const getNotifications = () => {
    return JSON.parse(localStorage.getItem("notifications")) || [];
  };

  const saveNotifications = (notifications) => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const addNotification = (userEmail, type, title, message) => {
    if (!userEmail) return;

    const notifications = getNotifications();

    const newNotification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      userEmail: userEmail,
      type: type,
      title: title,
      message: message,
      isRead: false,
      date: formatDateToday(),

      notification_id: Date.now() + Math.floor(Math.random() * 1000),
      email: userEmail,
      notification_type: type,
      is_read: false,
      created_at: formatDateToday(),
    };

    notifications.unshift(newNotification);
    saveNotifications(notifications);
  };

  const normalizeBooking = (booking) => {
    return {
      ...booking,

      id: booking.id || booking.booking_id,
      booking_id: booking.booking_id || booking.id,

      userEmail:
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        booking.email ||
        "",

      studentEmail:
        booking.studentEmail ||
        booking.userEmail ||
        booking.residentEmail ||
        booking.email ||
        "",

      status: booking.status || booking.booking_status || "Pending",
      booking_status: booking.booking_status || booking.status || "Pending",

      housingId: booking.housingId || booking.dorm_id,
      housingName: booking.housingName || booking.dorm_name || "Dorm Name",

      roomId: booking.roomId || booking.room_id || "",
      roomNumber: booking.roomNumber || booking.room_number || "",
      roomType: booking.roomType || booking.room_type || "",
    };
  };

  const currentEmail = getCurrentUserEmailValue().toLowerCase();

  const approvedBookings = getBookings()
    .map(normalizeBooking)
    .filter((booking) => {
      const bookingEmail = (
        booking.userEmail ||
        booking.studentEmail ||
        ""
      ).toLowerCase();

      return bookingEmail === currentEmail && booking.status === "Approved";
    });

  const myRequests = getMaintenanceRequests().filter((request) => {
    const requestEmail = (
      request.userEmail ||
      request.residentEmail ||
      request.email ||
      ""
    ).toLowerCase();

    return requestEmail === currentEmail;
  });

  const totalRequests = myRequests.length;
  const pendingRequests = myRequests.filter(
    (request) => request.status === "Pending"
  ).length;
  const progressRequests = myRequests.filter(
    (request) => request.status === "In Progress"
  ).length;
  const resolvedRequests = myRequests.filter(
    (request) => request.status === "Resolved"
  ).length;

  const getStatusClass = (status) => {
    if (status === "Pending") return "pending";
    if (status === "In Progress") return "progress";
    if (status === "Resolved") return "resolved";
    return "pending";
  };

  const getPriorityClass = (priorityValue) => {
    if (priorityValue === "Low") return "low";
    if (priorityValue === "Medium") return "medium";
    if (priorityValue === "High") return "high";
    if (priorityValue === "Urgent") return "urgent";
    return "medium";
  };

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

  const handleSubmit = (event) => {
    event.preventDefault();

    const bookingId = Number(relatedBooking);

    if (!bookingId) {
      alert("Please select an approved booking.");
      return;
    }

    const selectedBooking = approvedBookings.find((booking) => {
      return Number(booking.id) === Number(bookingId);
    });

    if (!selectedBooking) {
      alert("Selected booking not found or not approved.");
      return;
    }

    if (!requestTitle || !maintenanceCategory || !priority || !description) {
      alert("Please fill all required fields.");
      return;
    }

    const requests = getMaintenanceRequests();
    const today = formatDateToday();

    const newRequest = {
      id: Date.now(),

      request_id: Date.now(),
      booking_id: selectedBooking.booking_id || selectedBooking.id,
      bookingId: selectedBooking.id,

      userName: getCurrentUserNameValue(),
      residentName: getCurrentUserNameValue(),
      resident_name: getCurrentUserNameValue(),

      userEmail: getCurrentUserEmailValue(),
      residentEmail: getCurrentUserEmailValue(),
      email: getCurrentUserEmailValue(),

      housingId: selectedBooking.housingId,
      housingName: selectedBooking.housingName,

      dorm_id: selectedBooking.housingId,
      dorm_name: selectedBooking.housingName,

      roomId: selectedBooking.roomId || "",
      roomNumber: selectedBooking.roomNumber || "",
      roomType: selectedBooking.roomType || "",

      room_id: selectedBooking.roomId || "",
      room_number: selectedBooking.roomNumber || "",
      room_type: selectedBooking.roomType || "",

      title: requestTitle,
      request_title: requestTitle,

      category: maintenanceCategory,
      issueType: maintenanceCategory,

      priority: priority,
      description: description,

      imageName: uploadedImages.length > 0 ? uploadedImages[0].name : "",
      images: uploadedImages,

      status: "Pending",
      request_status: "Pending",

      submittedDate: today,
      createdAt: today,
      request_date: today,
    };

    requests.unshift(newRequest);
    saveMaintenanceRequests(requests);

    addNotification(
      getCurrentUserEmailValue(),
      "maintenance",
      "Maintenance Request Submitted",
      "Your maintenance request for " +
        selectedBooking.housingName +
        " has been submitted and is pending review."
    );

    setRelatedBooking("");
    setRequestTitle("");
    setMaintenanceCategory("");
    setPriority("");
    setDescription("");
    setUploadedImages([]);
    setRefresh(refresh + 1);

    alert("Maintenance request submitted successfully.");
  };

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
                    <option key={booking.id} value={booking.id}>
                      {booking.housingName} - Room {booking.roomNumber || "-"} (
                      {booking.roomType || "-"})
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
                <label htmlFor="maintenanceCategory">
                  Maintenance Category
                </label>

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

              <button type="submit" className="submit-btn">
                Submit Request
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
              {myRequests.map((request) => {
                const requestPriority = request.priority || "Medium";

                return (
                  <div className="request-item" key={request.id}>
                    <div className="request-info">
                      <h3>{request.title || "Maintenance Request"}</h3>

                      <p>
                        <i className="fa-solid fa-building"></i> Dorm:{" "}
                        {request.housingName || request.dorm_name || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-door-open"></i> Room:{" "}
                        {request.roomNumber || request.room_number || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-screwdriver-wrench"></i>{" "}
                        Category: {request.category || request.issueType || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-triangle-exclamation"></i>{" "}
                        Priority:{" "}
                        <span
                          className={`priority ${getPriorityClass(
                            requestPriority
                          )}`}
                        >
                          {requestPriority}
                        </span>
                      </p>

                      <p>
                        <i className="fa-solid fa-calendar-days"></i> Submitted:{" "}
                        {request.submittedDate || request.createdAt || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-file-lines"></i>{" "}
                        {request.description || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-image"></i> Image:{" "}
                        {request.imageName || "No image uploaded"}
                      </p>

                      {Array.isArray(request.images) &&
                        request.images.length > 0 && (
                          <div className="maintenance-image-gallery">
                            {request.images.map((image, index) => (
                              <img
                                key={index}
                                src={image.data}
                                alt={image.name || "Maintenance"}
                              />
                            ))}
                          </div>
                        )}
                    </div>

                    <span
                      className={`status ${getStatusClass(
                        request.status || "Pending"
                      )}`}
                    >
                      {request.status || "Pending"}
                    </span>
                  </div>
                );
              })}

              {myRequests.length === 0 && (
                <div className="empty-requests-message">
                  <p>No maintenance requests yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MaintenancePage;