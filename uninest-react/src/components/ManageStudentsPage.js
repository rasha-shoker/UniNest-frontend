import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageStudentsPage.css";
import {
  getResidents,
  createResident,
  updateResident,
  deleteResident as deleteResidentApi,
  getBookings,
  getPayments,
  getMaintenanceRequests,
  getReviews,
} from "../api";

function ManageStudentsPage() {
  const navigate = useNavigate();

  const [residents, setResidents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [roleFilter, setRoleFilter] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editResidentId, setEditResidentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    university: "",
    major: "",
    company: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");

    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadResidentsPageData();
  }, [navigate]);

  const normalizeUserType = (userType) => {
    const value = String(userType || "student").toLowerCase();
    return value === "employee" ? "employee" : "student";
  };

  const displayRole = (role) => {
    const value = normalizeUserType(role);
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const normalizeResident = (resident) => {
    return {
      ...resident,
      resident_id: resident.resident_id || resident.id,
      user_id: resident.user_id || "",
      full_name:
        resident.full_name ||
        resident.user?.full_name ||
        resident.name ||
        "Resident",
      email: resident.email || resident.user?.email || "",
      phone: resident.phone || "",
      role: normalizeUserType(resident.role || resident.user_type),
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
      email: booking.email || resident.email || resident.user?.email || "",

      dorm_name: booking.dorm_name || dorm.dorm_name || "Dorm",
      room_number: booking.room_number || room.room_number || "",
      room_type: booking.room_type || room.room_type || "",
      booking_status: booking.booking_status || "pending",
      created_at: booking.created_at || "",
    };
  };

  const normalizePayment = (payment) => {
    const booking = payment.booking || {};

    return {
      ...payment,
      payment_id: payment.payment_id || payment.id,
      booking_id: payment.booking_id || booking.booking_id,
      payment_status: payment.payment_status || "pending",
      amount: Number(payment.amount || 0),
    };
  };

  const normalizeMaintenanceRequest = (request) => {
    const booking = request.booking || {};
    const resident = booking.resident || {};

    return {
      ...request,
      maintenance_request_id:
        request.maintenance_request_id || request.request_id || request.id,
      booking_id: request.booking_id || booking.booking_id,
      resident_id: resident.resident_id || "",
      email: resident.email || resident.user?.email || "",
      request_status: request.request_status || "pending",
    };
  };

  const normalizeReview = (review) => {
    const resident = review.resident || {};

    return {
      ...review,
      review_id: review.review_id || review.id,
      resident_id: review.resident_id || resident.resident_id || "",
      email: resident.email || resident.user?.email || "",
    };
  };

  const loadResidentsPageData = async () => {
    try {
      setLoading(true);

      const [
        residentsResponse,
        bookingsResponse,
        paymentsResponse,
        maintenanceResponse,
        reviewsResponse,
      ] = await Promise.all([
        getResidents(),
        getBookings().catch(() => []),
        getPayments().catch(() => []),
        getMaintenanceRequests().catch(() => []),
        getReviews().catch(() => []),
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

      setResidents(residentsList.map(normalizeResident));
      setBookings(bookingsList.map(normalizeBooking));
      setPayments(paymentsList.map(normalizePayment));
      setMaintenanceRequests(maintenanceList.map(normalizeMaintenanceRequest));
      setReviews(reviewsList.map(normalizeReview));
    } catch (error) {
      console.error("Residents load failed:", error);
      alert("Could not load residents from backend.");
    } finally {
      setLoading(false);
    }
  };

  const isPaid = (value) => {
    const status = String(value || "").toLowerCase();
    return status === "completed" || status === "paid";
  };

  const isSameResidentByIdOrEmail = (item, resident) => {
    const itemResidentId = String(item.resident_id || "");
    const residentId = String(resident.resident_id || "");
    const itemEmail = String(item.email || "").toLowerCase();
    const residentEmail = String(resident.email || "").toLowerCase();

    return itemResidentId === residentId || itemEmail === residentEmail;
  };

  const allResidents = residents.filter((resident) => {
    const userType = normalizeUserType(resident.role);
    return userType === "student" || userType === "employee";
  });

  const getBookingsForResident = (resident) => {
    return bookings
      .filter((booking) => isSameResidentByIdOrEmail(booking, resident))
      .sort((a, b) => Number(b.booking_id || 0) - Number(a.booking_id || 0));
  };

  const getPaymentsForResident = (resident) => {
    const residentBookings = getBookingsForResident(resident);
    const residentBookingIds = residentBookings.map((booking) =>
      Number(booking.booking_id)
    );

    return payments.filter((payment) => {
      return residentBookingIds.includes(Number(payment.booking_id));
    });
  };

  const getMaintenanceForResident = (resident) => {
    const residentBookings = getBookingsForResident(resident);
    const residentBookingIds = residentBookings.map((booking) =>
      Number(booking.booking_id)
    );

    return maintenanceRequests.filter((request) => {
      return (
        residentBookingIds.includes(Number(request.booking_id)) ||
        isSameResidentByIdOrEmail(request, resident)
      );
    });
  };

  const getReviewsForResident = (resident) => {
    return reviews.filter((review) => isSameResidentByIdOrEmail(review, resident));
  };

  const getLatestBookingForResident = (resident) => {
    const myBookings = getBookingsForResident(resident);
    return myBookings.length > 0 ? myBookings[0] : null;
  };

  const filteredResidents = useMemo(() => {
    let result = allResidents;

    if (roleFilter !== "All") {
      result = result.filter((resident) => {
        return normalizeUserType(resident.role) === roleFilter;
      });
    }

    const value = searchValue.trim().toLowerCase();

    if (value) {
      result = result.filter((resident) => {
        const name = String(resident.full_name || "").toLowerCase();
        const email = String(resident.email || "").toLowerCase();
        const phone = String(resident.phone || "").toLowerCase();
        const university = String(resident.university || "").toLowerCase();
        const company = String(resident.company || "").toLowerCase();

        return (
          name.includes(value) ||
          email.includes(value) ||
          phone.includes(value) ||
          university.includes(value) ||
          company.includes(value)
        );
      });
    }

    return result;
  }, [residents, roleFilter, searchValue]);

  const studentsCount = allResidents.filter((resident) => {
    return normalizeUserType(resident.role) === "student";
  }).length;

  const employeesCount = allResidents.filter((resident) => {
    return normalizeUserType(resident.role) === "employee";
  }).length;

  const assignedCount = allResidents.filter((resident) => {
    const latestBooking = getLatestBookingForResident(resident);
    return latestBooking && String(latestBooking.booking_status).toLowerCase() === "approved";
  }).length;

  const openAddResidentModal = () => {
    setEditResidentId("");
    setForm({
      full_name: "",
      email: "",
      phone: "",
      role: "",
      university: "",
      major: "",
      company: "",
    });
    setShowModal(true);
  };

  const openEditResidentModal = (residentId) => {
    const resident = allResidents.find((item) => {
      return Number(item.resident_id) === Number(residentId);
    });

    if (!resident) {
      alert("Resident not found.");
      return;
    }

    setEditResidentId(resident.resident_id);
    setForm({
      full_name: resident.full_name || "",
      email: resident.email || "",
      phone: resident.phone || "",
      role: normalizeUserType(resident.role),
      university: resident.university || "",
      major: resident.major || "",
      company: resident.company || "",
    });

    setShowModal(true);
  };

  const closeResidentModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullName = form.full_name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const role = form.role;
    const university = form.university.trim();
    const major = form.major.trim();
    const company = form.company.trim();

    if (!fullName || !email || !phone || !role) {
      alert("Please fill all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^\d{2}-\d{6}$/;

    if (!phoneRegex.test(phone)) {
      alert("Phone number must be like this: 71-123456");
      return;
    }

    if (role === "student" && (!university || !major)) {
      alert("Please fill university and major fields.");
      return;
    }

    if (role === "employee" && !company) {
      alert("Please fill company field.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        full_name: fullName,
        email,
        phone,
        role,
        university: role === "student" ? university : "",
        major: role === "student" ? major : "",
        company: role === "employee" ? company : "",
      };

      if (!editResidentId) {
        await createResident({
          ...payload,
          password: "123456",
        });

        alert("Resident added successfully. Default password is 123456.");
      } else {
        await updateResident(editResidentId, payload);
        alert("Resident updated successfully.");
      }

      closeResidentModal();
      loadResidentsPageData();
    } catch (error) {
      console.error("Save resident failed:", error);
      alert(
        "Resident could not be saved. We may need to fix POST/PATCH /residents later."
      );
    } finally {
      setSaving(false);
    }
  };

  const viewResidentDetails = (residentId) => {
    const resident = allResidents.find((item) => {
      return Number(item.resident_id) === Number(residentId);
    });

    if (!resident) {
      alert("Resident not found.");
      return;
    }

    const residentBookings = getBookingsForResident(resident);
    const residentPayments = getPaymentsForResident(resident);
    const residentMaintenance = getMaintenanceForResident(resident);
    const residentReviews = getReviewsForResident(resident);
    const latestBooking = getLatestBookingForResident(resident);

    const details =
      "Resident Details\n\n" +
      "Name: " +
      (resident.full_name || "-") +
      "\n" +
      "Email: " +
      (resident.email || "-") +
      "\n" +
      "Phone: " +
      (resident.phone || "-") +
      "\n" +
      "Role: " +
      displayRole(resident.role) +
      "\n\n" +
      "Current Dorm: " +
      (latestBooking ? latestBooking.dorm_name || "-" : "Not assigned") +
      "\n" +
      "Room: " +
      (latestBooking ? latestBooking.room_number || "-" : "-") +
      "\n\n" +
      "Total Bookings: " +
      residentBookings.length +
      "\n" +
      "Payments: " +
      residentPayments.length +
      "\n" +
      "Maintenance Requests: " +
      residentMaintenance.length +
      "\n" +
      "Reviews: " +
      residentReviews.length;

    alert(details);
  };

  const deleteResident = async (residentId) => {
    const ok = window.confirm(
      "Are you sure you want to delete this resident?"
    );

    if (!ok) return;

    try {
      await deleteResidentApi(residentId);
      alert("Resident deleted successfully.");
      loadResidentsPageData();
    } catch (error) {
      console.error("Delete resident failed:", error);
      alert(
        "Resident could not be deleted. It may have bookings connected to it."
      );
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

  return (
    <div className="manage-students-page students-layout">
      <aside className="students-sidebar">
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
            <Link to="/manage-students" className="active">
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

      <main className="students-main">
        <div className="students-topbar">
          <div>
            <h1>Manage Residents</h1>
            <p>
              Review student and employee accounts, contact details, and booking
              assignments.
            </p>
          </div>

          <button className="add-btn" onClick={openAddResidentModal}>
            <i className="fa-solid fa-plus"></i> Add Resident
          </button>
        </div>

        <section className="student-stats">
          <div className="stat-card">
            <h3>{allResidents.length}</h3>
            <p>Total Residents</p>
          </div>

          <div className="stat-card">
            <h3>{studentsCount}</h3>
            <p>Students</p>
          </div>

          <div className="stat-card">
            <h3>{employeesCount}</h3>
            <p>Employees</p>
          </div>

          <div className="stat-card">
            <h3>{assignedCount}</h3>
            <p>Assigned Dorm</p>
          </div>
        </section>

        <section className="filter-card">
          <div className="filter-group">
            <label>Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="All">All Residents</option>
              <option value="student">Students</option>
              <option value="employee">Employees</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search Resident</label>
            <input
              type="text"
              placeholder="Search by name, email, phone, university, or company"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>
        </section>

        {loading ? (
          <div className="empty-students">
            <h3>Loading residents...</h3>
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="empty-students">
            <h3>No residents found</h3>
            <p>No student or employee accounts match your search.</p>
          </div>
        ) : (
          <section className="student-list">
            {filteredResidents.map((resident) => {
              const userType = normalizeUserType(resident.role);
              const fullName = resident.full_name || "Resident";
              const email = resident.email || "-";
              const phone = resident.phone || "-";

              const latestBooking = getLatestBookingForResident(resident);
              const residentBookings = getBookingsForResident(resident);
              const residentPayments = getPaymentsForResident(resident);
              const residentMaintenance = getMaintenanceForResident(resident);
              const residentReviews = getReviewsForResident(resident);

              const approvedBookings = residentBookings.filter((booking) => {
                return String(booking.booking_status).toLowerCase() === "approved";
              }).length;

              const completedPayments = residentPayments.filter((payment) =>
                isPaid(payment.payment_status)
              ).length;

              const openMaintenance = residentMaintenance.filter((request) => {
                const status = String(request.request_status || "").toLowerCase();
                return status === "pending" || status === "in_progress";
              }).length;

              const dorm = latestBooking
                ? latestBooking.dorm_name || "Dorm"
                : "Not assigned";

              const room = latestBooking
                ? `${latestBooking.room_type || "-"} - Room ${
                    latestBooking.room_number || "-"
                  }`
                : "-";

              const bookingStatus = latestBooking
                ? latestBooking.booking_status || "Pending"
                : "No Booking";

              return (
                <div className="student-card" key={resident.resident_id}>
                  <div className="student-main">
                    <div className="student-title-row">
                      <h2>{fullName}</h2>
                      <span className={`role-badge ${userType}`}>
                        {displayRole(userType)}
                      </span>
                    </div>

                    <div className="student-info-grid">
                      <p>
                        <i className="fa-solid fa-envelope"></i>{" "}
                        <strong>Email:</strong> {email}
                      </p>

                      <p>
                        <i className="fa-solid fa-phone"></i>{" "}
                        <strong>Phone:</strong> {phone}
                      </p>

                      {userType === "student" ? (
                        <>
                          <p>
                            <i className="fa-solid fa-school"></i>{" "}
                            <strong>University:</strong>{" "}
                            {resident.university || "-"}
                          </p>

                          <p>
                            <i className="fa-solid fa-book"></i>{" "}
                            <strong>Major:</strong> {resident.major || "-"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p>
                            <i className="fa-solid fa-building-user"></i>{" "}
                            <strong>Company:</strong>{" "}
                            {resident.company || "-"}
                          </p>
                        </>
                      )}

                      <p>
                        <i className="fa-solid fa-house"></i>{" "}
                        <strong>Current Dorm:</strong> {dorm}
                      </p>

                      <p>
                        <i className="fa-solid fa-bed"></i>{" "}
                        <strong>Room:</strong> {room}
                      </p>

                      <p>
                        <i className="fa-solid fa-calendar-days"></i>{" "}
                        <strong>Created:</strong> {resident.created_at || "-"}
                      </p>

                      <p>
                        <i className="fa-solid fa-circle-check"></i>{" "}
                        <strong>Booking Status:</strong> {bookingStatus}
                      </p>
                    </div>

                    <div className="resident-mini-stats">
                      <span>
                        <strong>{residentBookings.length}</strong> Bookings
                      </span>

                      <span>
                        <strong>{approvedBookings}</strong> Approved
                      </span>

                      <span>
                        <strong>{completedPayments}</strong> Payments
                      </span>

                      <span>
                        <strong>{openMaintenance}</strong> Open Maintenance
                      </span>

                      <span>
                        <strong>{residentReviews.length}</strong> Reviews
                      </span>
                    </div>
                  </div>

                  <div className="student-side">
                    <span className="status-badge active-status">Active</span>

                    <div className="student-actions">
                      <button
                        className="view-btn"
                        onClick={() => viewResidentDetails(resident.resident_id)}
                      >
                        View Details
                      </button>

                      <button
                        className="edit-btn"
                        onClick={() => openEditResidentModal(resident.resident_id)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteResident(resident.resident_id)}
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

      <div
        className={`modal-overlay ${showModal ? "show" : ""}`}
        onClick={(event) => {
          if (event.target.classList.contains("modal-overlay")) {
            closeResidentModal();
          }
        }}
      >
        <div className="modal-card">
          <div className="modal-header">
            <h2>{editResidentId ? "Edit Resident" : "Add Resident"}</h2>

            <button
              type="button"
              className="close-btn"
              onClick={closeResidentModal}
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.full_name}
                  onChange={(event) =>
                    setForm({ ...form, full_name: event.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={form.email}
                  disabled={!!editResidentId}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="Example: 71-123456"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={form.role}
                  disabled={!!editResidentId}
                  onChange={(event) =>
                    setForm({ ...form, role: event.target.value })
                  }
                  required
                >
                  <option value="">Select role</option>
                  <option value="student">Student</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              {form.role === "student" && (
                <>
                  <div className="form-group student-field">
                    <label>University</label>
                    <input
                      type="text"
                      placeholder="Example: AUB, LAU, LU"
                      value={form.university}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          university: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group student-field">
                    <label>Major</label>
                    <input
                      type="text"
                      placeholder="Enter major"
                      value={form.major}
                      onChange={(event) =>
                        setForm({ ...form, major: event.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {form.role === "employee" && (
                <div className="form-group employee-field">
                  <label>Company</label>
                  <input
                    type="text"
                    placeholder="Enter company"
                    value={form.company}
                    onChange={(event) =>
                      setForm({ ...form, company: event.target.value })
                    }
                  />
                </div>
              )}
            </div>

            <div className="modal-note">
              <p>
                Adding residents from admin may need backend adjustment because
                your database uses <strong>user_id</strong> in the resident
                table.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={closeResidentModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Resident"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManageStudentsPage;