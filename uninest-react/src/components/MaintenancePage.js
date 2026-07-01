import { useEffect, useState } from "react";
import "./MaintenancePage.css";
import {
  getBookings,
  getPayments,
  getMaintenanceRequests,
  createMaintenanceRequest,
} from "../api";

function MaintenancePage() {
  const loggedInResidentId = localStorage.getItem("loggedInResidentId") || "";
  const loggedInUserEmail = (
    localStorage.getItem("loggedInUserEmail") || ""
  ).toLowerCase();

  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMaintenancePage();
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

      booking_status: booking.booking_status || booking.status || "pending",
      payment_status:
        booking.payment_status || booking.paymentStatus || "pending",

      check_in_date: booking.check_in_date || booking.checkInDate || "",
      check_out_date: booking.check_out_date || booking.checkOutDate || "",
      total_price: Number(
        booking.total_price || booking.totalCost || booking.amount || 0
      ),

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
    const dorm = room.dorm || {};
    const resident = booking.resident || {};

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

      room_type:
        request.room_type ||
        request.roomType ||
        room.room_type ||
        booking.room_type ||
        "-",

      maintenance_category:
        request.maintenance_category ||
        request.category ||
        "General",

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

      image_url: request.image_url || request.image || "",
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

  const loadMaintenancePage = async () => {
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
      ).sort((a, b) => {
        return (
          Number(b.maintenance_request_id || 0) -
          Number(a.maintenance_request_id || 0)
        );
      });

      const myBookings = mergedBookings.filter((booking) => {
        const sameResident =
          String(booking.resident_id || "") === String(loggedInResidentId);

        const sameEmail =
          String(booking.email || "").toLowerCase() === loggedInUserEmail;

        return sameResident || sameEmail;
      });

      const myRequests = mergedRequests.filter((request) => {
        const sameResident =
          String(request.resident_id || "") === String(loggedInResidentId);

        const sameEmail =
          String(request.email || "").toLowerCase() === loggedInUserEmail;

        const requestBookingBelongsToMe = myBookings.some((booking) => {
          return Number(booking.booking_id) === Number(request.booking_id);
        });

        return sameResident || sameEmail || requestBookingBelongsToMe;
      });

      setBookings(myBookings);
      setPayments(mergedPayments);
      setRequests(myRequests);
    } catch (error) {
      console.error("Maintenance page load failed:", error);
      alert("Could not load maintenance page.");
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

  const eligibleBookings = bookings.filter((booking) => {
    return (
      normalizeStatus(booking.booking_status) === "approved" &&
      isBookingPaid(booking)
    );
  });

  const selectedBooking = eligibleBookings.find((booking) => {
    return Number(booking.booking_id) === Number(selectedBookingId);
  });

  const saveLocalMaintenanceRequest = (requestObject) => {
    const oldRequests =
      JSON.parse(localStorage.getItem("maintenanceRequests")) || [];

    oldRequests.unshift(requestObject);

    localStorage.setItem("maintenanceRequests", JSON.stringify(oldRequests));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file only.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setImageFile(e.target.result);
      setImageFileName(file.name);
    };

    reader.readAsDataURL(file);
  };

  const buildLocalRequestObject = (requestId) => {
    return {
      maintenance_request_id: requestId,
      request_id: requestId,

      booking_id: selectedBooking.booking_id,
      room_id: selectedBooking.room_id,
      maintenance_id: null,

      resident_id: loggedInResidentId,
      resident_name: localStorage.getItem("loggedInUser") || "Resident",
      email: loggedInUserEmail,

      dorm_id: selectedBooking.dorm_id,
      dorm_name: selectedBooking.dorm_name,

      room_number: selectedBooking.room_number,
      room_type: selectedBooking.room_type,

      maintenance_category: category,
      category: category,
      priority: priority,

      request_description: description.trim(),
      issue_description: description.trim(),
      description: description.trim(),

      request_status: "pending",
      status: "pending",

      created_at: formatDateToday(),
      request_date: formatDateToday(),

      image_url: imageFile,
      image_name: imageFileName,

      isLocal: true,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedBooking) {
      alert("Please select an approved and paid booking.");
      return;
    }

    if (!description.trim()) {
      alert("Please describe the maintenance problem.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        booking_id: Number(selectedBooking.booking_id),
        room_id: Number(selectedBooking.room_id),
        maintenance_id: null,
        request_description: `${category} - ${priority}: ${description.trim()}`,
        request_status: "pending",
      };

      const createdRequestResponse = await createMaintenanceRequest(payload);

      const createdRequest =
        createdRequestResponse?.data &&
        createdRequestResponse.data.maintenance_request_id
          ? createdRequestResponse.data
          : createdRequestResponse;

      const newRequestId =
        createdRequest?.maintenance_request_id ||
        createdRequest?.request_id ||
        Date.now();

      const localRequest = buildLocalRequestObject(newRequestId);

      saveLocalMaintenanceRequest(localRequest);

      alert("Maintenance request submitted successfully.");
      setSelectedBookingId("");
      setCategory("General");
      setPriority("Medium");
      setDescription("");
      setImageFile("");
      setImageFileName("");
      loadMaintenancePage();
    } catch (error) {
      console.warn("Backend maintenance request failed, saving locally:", error);

      const localRequest = buildLocalRequestObject(Date.now());

      saveLocalMaintenanceRequest(localRequest);

      alert("Maintenance request saved locally for frontend testing.");
      setSelectedBookingId("");
      setCategory("General");
      setPriority("Medium");
      setDescription("");
      setImageFile("");
      setImageFileName("");
      loadMaintenancePage();
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

  const pendingCount = requests.filter((request) => {
    return normalizeStatus(request.request_status) === "pending";
  }).length;

  const progressCount = requests.filter((request) => {
    return normalizeStatus(request.request_status) === "in_progress";
  }).length;

  const completedCount = requests.filter((request) => {
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
            <h1>Maintenance</h1>
            <p>Submit and track maintenance requests for your paid bookings.</p>
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
            <h3>{completedCount}</h3>
            <p>Completed</p>
          </div>
        </section>

        {loading ? (
          <div className="maintenance-card">
            <h2>Loading maintenance page...</h2>
          </div>
        ) : (
          <>
            <section className="maintenance-card">
              <h2>Submit Maintenance Request</h2>

              {eligibleBookings.length === 0 ? (
                <div className="empty-requests">
                  <h3>No eligible bookings</h3>
                  <p>
                    You need an approved and paid booking before submitting a
                    maintenance request.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="maintenance-form">
                  <div className="form-group">
                    <label>Select Booking</label>
                    <select
                      value={selectedBookingId}
                      onChange={(event) =>
                        setSelectedBookingId(event.target.value)
                      }
                      required
                    >
                      <option value="">Choose booking</option>

                      {eligibleBookings.map((booking) => (
                        <option
                          key={booking.booking_id}
                          value={booking.booking_id}
                        >
                          {booking.dorm_name} - Room {booking.room_number} (
                          {booking.room_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBooking && (
                    <div className="selected-booking-box">
                      <p>
                        <strong>Dorm:</strong> {selectedBooking.dorm_name}
                      </p>
                      <p>
                        <strong>Room:</strong> {selectedBooking.room_number}
                      </p>
                      <p>
                        <strong>Room Type:</strong> {selectedBooking.room_type}
                      </p>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        required
                      >
                        <option value="General">General</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Internet">Internet</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={priority}
                        onChange={(event) => setPriority(event.target.value)}
                        required
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows="5"
                      placeholder="Describe the maintenance issue..."
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Upload Image Optional</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                    {imageFileName && (
                      <small className="form-note">
                        Uploaded: {imageFileName}
                      </small>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
              )}
            </section>

            <section className="maintenance-card">
              <h2>My Maintenance Requests</h2>

              {requests.length === 0 ? (
                <div className="empty-requests">
                  <h3>No maintenance requests yet</h3>
                  <p>Your submitted requests will appear here.</p>
                </div>
              ) : (
                <div className="requests-list">
                  {requests.map((request) => (
                    <div
                      className="request-card"
                      key={request.maintenance_request_id}
                    >
                      <div className="request-main">
                        <div className="request-title-row">
                          <h3>
                            {request.maintenance_category ||
                              "Maintenance Request"}
                          </h3>

                          <span
                            className={`status-badge ${getStatusClass(
                              request.request_status
                            )}`}
                          >
                            {displayStatus(request.request_status)}
                          </span>
                        </div>

                        <p>
                          <strong>Dorm:</strong> {request.dorm_name || "-"}
                        </p>

                        <p>
                          <strong>Room:</strong> {request.room_number || "-"}
                        </p>

                        <p>
                          <strong>Priority:</strong> {request.priority || "-"}
                        </p>

                        <p>
                          <strong>Description:</strong>{" "}
                          {request.request_description || "-"}
                        </p>

                        <p>
                          <strong>Submitted:</strong>{" "}
                          {request.created_at || "-"}
                        </p>

                        {request.image_url && (
                          <div className="maintenance-image-preview">
                            <img src={request.image_url} alt="Maintenance" />
                          </div>
                        )}

                        {request.isLocal && (
                          <p>
                            <strong>Note:</strong> Saved locally until backend
                            maintenance store is fixed.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default MaintenancePage;