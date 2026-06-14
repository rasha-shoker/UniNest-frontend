import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ManageStudentsPage.css";

function ManageStudentsPage() {
  const navigate = useNavigate();

  const [residents, setResidents] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editEmail, setEditEmail] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    user_type: "",
    university_name: "",
    major: "",
    company_name: "",
    job_position: "",
    resident_status: "Active",
  });

  useEffect(() => {
    const role = localStorage.getItem("loggedInRole");
    if (role !== "admin") {
      navigate("/login");
      return;
    }

    loadResidents();
  }, [navigate]);

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizeUserType = (userType) => {
    const value = String(userType || "student").toLowerCase();
    return value === "employee" ? "employee" : "student";
  };

  const splitFullName = (fullName) => {
    const parts = fullName.trim().split(" ").filter((part) => part !== "");

    return {
      first_name: parts[0] || "",
      last_name: parts.length > 1 ? parts.slice(1).join(" ") : "",
    };
  };

  const getResidentFullName = (resident) => {
    const firstName = resident.first_name || resident.firstName || "";
    const lastName = resident.last_name || resident.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || resident.fullName || resident.name || "Resident";
  };

  const normalizeResident = (resident) => {
    const oldFullName = resident.fullName || resident.name || "";
    const splitName = splitFullName(oldFullName);

    const first_name =
      resident.first_name || resident.firstName || splitName.first_name || "";

    const last_name =
      resident.last_name || resident.lastName || splitName.last_name || "";

    const user_type = normalizeUserType(resident.user_type || resident.role);

    const residentId =
      resident.resident_id ||
      resident.id ||
      Date.now() + Math.floor(Math.random() * 1000);

    return {
      ...resident,

      resident_id: residentId,
      first_name,
      last_name,

      email: resident.email || "",
      password: resident.password || "123456",
      phone: resident.phone || "",

      user_type,

      university_name:
        user_type === "student"
          ? resident.university_name || resident.university || ""
          : "",

      major: user_type === "student" ? resident.major || "" : "",

      company_name:
        user_type === "employee"
          ? resident.company_name || resident.company || ""
          : "",

      job_position:
        user_type === "employee"
          ? resident.job_position || resident.jobTitle || ""
          : "",

      profile_image: resident.profile_image || resident.profileImage || "",
      resident_status: resident.resident_status || resident.status || "Active",
      created_at: resident.created_at || resident.createdAt || formatDateToday(),
      updated_at: resident.updated_at || resident.updatedAt || "",

      id: residentId,
      fullName: `${first_name} ${last_name}`.trim(),
      name: `${first_name} ${last_name}`.trim(),
      role: user_type,
      university:
        user_type === "student"
          ? resident.university_name || resident.university || ""
          : "",
      company:
        user_type === "employee"
          ? resident.company_name || resident.company || ""
          : "",
      jobTitle:
        user_type === "employee"
          ? resident.job_position || resident.jobTitle || ""
          : "",
      profileImage: resident.profile_image || resident.profileImage || "",
      status: resident.resident_status || resident.status || "Active",
      createdAt: resident.created_at || resident.createdAt || formatDateToday(),
      updatedAt: resident.updated_at || resident.updatedAt || "",
    };
  };

  const getResidentsData = () => {
    const storedResidents = JSON.parse(localStorage.getItem("residents"));
    const storedUsers = JSON.parse(localStorage.getItem("users"));

    if (storedResidents && Array.isArray(storedResidents)) {
      return storedResidents.map(normalizeResident);
    }

    if (storedUsers && Array.isArray(storedUsers)) {
      const normalized = storedUsers.map(normalizeResident);
      saveResidentsData(normalized);
      return normalized;
    }

    return [];
  };

  const saveResidentsData = (items) => {
    const normalized = items.map(normalizeResident);
    localStorage.setItem("residents", JSON.stringify(normalized));
    localStorage.setItem("users", JSON.stringify(normalized));
    setResidents(normalized);
  };

  const loadResidents = () => {
    setResidents(getResidentsData());
  };

  const getBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const saveBookings = (items) => {
    localStorage.setItem("studentBookings", JSON.stringify(items));
  };

  const getPayments = () => {
    return JSON.parse(localStorage.getItem("payments")) || [];
  };

  const savePayments = (items) => {
    localStorage.setItem("payments", JSON.stringify(items));
  };

  const getMaintenanceRequests = () => {
    return JSON.parse(localStorage.getItem("maintenanceRequests")) || [];
  };

  const saveMaintenanceRequests = (items) => {
    localStorage.setItem("maintenanceRequests", JSON.stringify(items));
  };

  const getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews")) || [];
  };

  const saveReviews = (items) => {
    localStorage.setItem("reviews", JSON.stringify(items));
  };

  const normalizeBooking = (booking) => {
    return {
      ...booking,
      booking_id: booking.booking_id || booking.id,
      resident_id: booking.resident_id || "",
      resident_name:
        booking.resident_name ||
        booking.residentName ||
        booking.userName ||
        booking.studentName ||
        "",
      email:
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        booking.residentEmail ||
        "",
      dorm_name: booking.dorm_name || booking.housingName || "Dorm",
      room_number: booking.room_number || booking.roomNumber || "",
      room_type: booking.room_type || booking.roomType || "",
      booking_status: booking.booking_status || booking.status || "Pending",
      payment_status: booking.payment_status || booking.paymentStatus || "Pending",
      created_at: booking.created_at || booking.createdAt || "",
    };
  };

  const normalizePayment = (payment) => {
    return {
      ...payment,
      resident_id: payment.resident_id || "",
      resident_name:
        payment.resident_name || payment.userName || payment.studentName || "",
      email: payment.email || payment.userEmail || payment.studentEmail || "",
      payment_status: payment.payment_status || payment.status || "Pending",
    };
  };

  const normalizeMaintenanceRequest = (request) => {
    return {
      ...request,
      resident_id: request.resident_id || "",
      resident_name:
        request.resident_name ||
        request.residentName ||
        request.userName ||
        request.studentName ||
        "",
      email:
        request.email ||
        request.userEmail ||
        request.studentEmail ||
        request.residentEmail ||
        "",
      request_status: request.request_status || request.status || "Pending",
    };
  };

  const normalizeReview = (review) => {
    return {
      ...review,
      resident_id: review.resident_id || "",
      resident_name:
        review.resident_name || review.residentName || review.userName || "",
      email: review.email || review.userEmail || review.residentEmail || "",
    };
  };

  const isPaid = (value) => {
    return value === "Completed" || value === "Paid";
  };

  const isSameResidentByIdOrEmail = (item, resident) => {
    const itemResidentId = String(item.resident_id || "");
    const residentId = String(resident.resident_id || "");
    const itemEmail = String(item.email || "").toLowerCase();
    const residentEmail = String(resident.email || "").toLowerCase();

    return itemResidentId === residentId || itemEmail === residentEmail;
  };

  const getResidents = () => {
    return residents.filter((resident) => {
      const userType = normalizeUserType(resident.user_type);
      return userType === "student" || userType === "employee";
    });
  };

  const getBookingsForResident = (resident) => {
    return getBookings()
      .map(normalizeBooking)
      .filter((booking) => isSameResidentByIdOrEmail(booking, resident))
      .sort((a, b) => Number(b.booking_id || 0) - Number(a.booking_id || 0));
  };

  const getPaymentsForResident = (resident) => {
    return getPayments()
      .map(normalizePayment)
      .filter((payment) => isSameResidentByIdOrEmail(payment, resident));
  };

  const getMaintenanceForResident = (resident) => {
    return getMaintenanceRequests()
      .map(normalizeMaintenanceRequest)
      .filter((request) => isSameResidentByIdOrEmail(request, resident));
  };

  const getReviewsForResident = (resident) => {
    return getReviews()
      .map(normalizeReview)
      .filter((review) => isSameResidentByIdOrEmail(review, resident));
  };

  const getLatestBookingForResident = (resident) => {
    const myBookings = getBookingsForResident(resident);
    return myBookings.length > 0 ? myBookings[0] : null;
  };

  const getResidentStatus = (resident) => {
    return resident.resident_status || resident.status || "Active";
  };

  const allResidents = getResidents();

  const filteredResidents = useMemo(() => {
    let result = allResidents;

    if (roleFilter !== "All") {
      result = result.filter(
        (resident) => normalizeUserType(resident.user_type) === roleFilter
      );
    }

    const value = searchValue.trim().toLowerCase();

    if (value) {
      result = result.filter((resident) => {
        const name = getResidentFullName(resident).toLowerCase();
        const email = String(resident.email || "").toLowerCase();
        const phone = String(resident.phone || "").toLowerCase();
        const university = String(resident.university_name || "").toLowerCase();
        const company = String(resident.company_name || "").toLowerCase();

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

  const studentsCount = allResidents.filter(
    (resident) => normalizeUserType(resident.user_type) === "student"
  ).length;

  const employeesCount = allResidents.filter(
    (resident) => normalizeUserType(resident.user_type) === "employee"
  ).length;

  const assignedCount = allResidents.filter((resident) => {
    const latestBooking = getLatestBookingForResident(resident);
    return latestBooking && latestBooking.booking_status === "Approved";
  }).length;

  const openAddResidentModal = () => {
    setEditEmail("");
    setForm({
      fullName: "",
      email: "",
      phone: "",
      user_type: "",
      university_name: "",
      major: "",
      company_name: "",
      job_position: "",
      resident_status: "Active",
    });
    setShowModal(true);
  };

  const openEditResidentModal = (email) => {
    const resident = allResidents.find(
      (item) => String(item.email || "").toLowerCase() === email.toLowerCase()
    );

    if (!resident) {
      alert("Resident not found.");
      return;
    }

    const userType = normalizeUserType(resident.user_type);

    setEditEmail(resident.email);
    setForm({
      fullName: getResidentFullName(resident),
      email: resident.email || "",
      phone: resident.phone || "",
      user_type: userType,
      university_name: resident.university_name || "",
      major: resident.major || "",
      company_name: resident.company_name || "",
      job_position: resident.job_position || "",
      resident_status: getResidentStatus(resident),
    });

    setShowModal(true);
  };

  const closeResidentModal = () => {
    setShowModal(false);
  };

  const updateRelatedData = (resident, newName) => {
    const residentId = String(resident.resident_id || "");
    const targetEmail = String(resident.email || "").toLowerCase();

    const bookings = getBookings().map((booking) => {
      const normalized = normalizeBooking(booking);

      if (
        String(normalized.resident_id || "") === residentId ||
        String(normalized.email || "").toLowerCase() === targetEmail
      ) {
        return {
          ...booking,
          resident_name: newName,
          email: targetEmail,
          userName: newName,
          studentName: newName,
          residentName: newName,
          userEmail: targetEmail,
          studentEmail: targetEmail,
          residentEmail: targetEmail,
        };
      }

      return booking;
    });

    saveBookings(bookings);

    const requests = getMaintenanceRequests().map((request) => {
      const normalized = normalizeMaintenanceRequest(request);

      if (
        String(normalized.resident_id || "") === residentId ||
        String(normalized.email || "").toLowerCase() === targetEmail
      ) {
        return {
          ...request,
          resident_name: newName,
          email: targetEmail,
          userName: newName,
          studentName: newName,
          residentName: newName,
          userEmail: targetEmail,
          studentEmail: targetEmail,
          residentEmail: targetEmail,
        };
      }

      return request;
    });

    saveMaintenanceRequests(requests);

    const payments = getPayments().map((payment) => {
      const normalized = normalizePayment(payment);

      if (
        String(normalized.resident_id || "") === residentId ||
        String(normalized.email || "").toLowerCase() === targetEmail
      ) {
        return {
          ...payment,
          resident_name: newName,
          email: targetEmail,
          userName: newName,
          studentName: newName,
          userEmail: targetEmail,
          studentEmail: targetEmail,
        };
      }

      return payment;
    });

    savePayments(payments);

    const reviews = getReviews().map((review) => {
      const normalized = normalizeReview(review);

      if (
        String(normalized.resident_id || "") === residentId ||
        String(normalized.email || "").toLowerCase() === targetEmail
      ) {
        return {
          ...review,
          resident_name: newName,
          email: targetEmail,
          userName: newName,
          residentName: newName,
          userEmail: targetEmail,
          residentEmail: targetEmail,
        };
      }

      return review;
    });

    saveReviews(reviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const oldEmail = editEmail.trim().toLowerCase();

    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const userType = form.user_type;
    const universityName = form.university_name.trim();
    const major = form.major.trim();
    const companyName = form.company_name.trim();
    const jobPosition = form.job_position.trim();
    const residentStatus = form.resident_status;

    if (!fullName || !email || !phone || !userType) {
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

    if (userType === "student" && (!universityName || !major)) {
      alert("Please fill university and major fields.");
      return;
    }

    if (userType === "employee" && (!companyName || !jobPosition)) {
      alert("Please fill company and job title fields.");
      return;
    }

    let allData = getResidentsData();

    const emailExists = allData.find((resident) => {
      const residentEmail = String(resident.email || "").toLowerCase();
      return residentEmail === email && residentEmail !== oldEmail;
    });

    if (emailExists) {
      alert("This email is already used by another account.");
      return;
    }

    const nameParts = splitFullName(fullName);

    if (!oldEmail) {
      const residentId = Date.now();

      const newResident = normalizeResident({
        resident_id: residentId,
        first_name: nameParts.first_name,
        last_name: nameParts.last_name,
        email,
        password: "123456",
        phone,
        user_type: userType,
        university_name: userType === "student" ? universityName : "",
        major: userType === "student" ? major : "",
        company_name: userType === "employee" ? companyName : "",
        job_position: userType === "employee" ? jobPosition : "",
        profile_image: "",
        resident_status: residentStatus,
        created_at: formatDateToday(),
        updated_at: "",
      });

      allData.unshift(newResident);
      saveResidentsData(allData);

      alert("Resident added successfully. Default password is 123456.");
    } else {
      let updatedResident = null;

      allData = allData.map((resident) => {
        if (String(resident.email || "").toLowerCase() === oldEmail) {
          const currentUserType = normalizeUserType(
            resident.user_type || resident.role || userType
          );

          updatedResident = normalizeResident({
            ...resident,
            first_name: nameParts.first_name,
            last_name: nameParts.last_name,
            phone,
            user_type: currentUserType,
            university_name: currentUserType === "student" ? universityName : "",
            major: currentUserType === "student" ? major : "",
            company_name: currentUserType === "employee" ? companyName : "",
            job_position: currentUserType === "employee" ? jobPosition : "",
            resident_status: residentStatus,
            updated_at: formatDateToday(),
          });

          return updatedResident;
        }

        return resident;
      });

      saveResidentsData(allData);

      if (updatedResident) {
        updateRelatedData(updatedResident, fullName);
      }

      alert("Resident updated successfully.");
    }

    closeResidentModal();
  };

  const toggleResidentStatus = (email) => {
    const allData = getResidentsData();

    const updated = allData.map((resident) => {
      if (String(resident.email || "").toLowerCase() === email.toLowerCase()) {
        const oldStatus = getResidentStatus(resident);
        const newStatus = oldStatus === "Inactive" ? "Active" : "Inactive";

        return normalizeResident({
          ...resident,
          resident_status: newStatus,
          status: newStatus,
          updated_at: formatDateToday(),
          updatedAt: formatDateToday(),
        });
      }

      return resident;
    });

    saveResidentsData(updated);
  };

  const viewResidentDetails = (email) => {
    const resident = allResidents.find(
      (item) => String(item.email || "").toLowerCase() === email.toLowerCase()
    );

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
      getResidentFullName(resident) +
      "\n" +
      "Email: " +
      (resident.email || "-") +
      "\n" +
      "Phone: " +
      (resident.phone || "-") +
      "\n" +
      "Role: " +
      normalizeUserType(resident.user_type) +
      "\n" +
      "Status: " +
      getResidentStatus(resident) +
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

  const deleteResident = (email) => {
    const ok = window.confirm(
      "Are you sure you want to delete this resident?\n\n" +
        "This will remove the account only. Old bookings, payments, maintenance requests, and reviews will stay as historical records."
    );

    if (!ok) return;

    const updated = getResidentsData().filter((resident) => {
      return String(resident.email || "").toLowerCase() !== email.toLowerCase();
    });

    saveResidentsData(updated);
    alert("Resident deleted successfully.");
  };

  const logout = () => {
    localStorage.removeItem("loggedInRole");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("loggedInUserEmail");
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
              onChange={(e) => setRoleFilter(e.target.value)}
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
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </section>

        {filteredResidents.length === 0 ? (
          <div className="empty-students">
            <h3>No residents found</h3>
            <p>No student or employee accounts match your search.</p>
          </div>
        ) : (
          <section className="student-list">
            {filteredResidents.map((resident) => {
              const userType = normalizeUserType(resident.user_type);
              const status = getResidentStatus(resident);
              const fullName = getResidentFullName(resident);
              const email = resident.email || "-";
              const phone = resident.phone || "-";

              const latestBooking = getLatestBookingForResident(resident);
              const residentBookings = getBookingsForResident(resident);
              const residentPayments = getPaymentsForResident(resident);
              const residentMaintenance = getMaintenanceForResident(resident);
              const residentReviews = getReviewsForResident(resident);

              const approvedBookings = residentBookings.filter(
                (booking) => booking.booking_status === "Approved"
              ).length;

              const completedPayments = residentPayments.filter((payment) =>
                isPaid(payment.payment_status)
              ).length;

              const openMaintenance = residentMaintenance.filter((request) => {
                return (
                  request.request_status === "Pending" ||
                  request.request_status === "In Progress"
                );
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
                <div className="student-card" key={resident.email}>
                  <div className="student-main">
                    <div className="student-title-row">
                      <h2>{fullName}</h2>
                      <span className={`role-badge ${userType}`}>{userType}</span>
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
                            {resident.university_name || "-"}
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
                            {resident.company_name || "-"}
                          </p>

                          <p>
                            <i className="fa-solid fa-briefcase"></i>{" "}
                            <strong>Job Title:</strong>{" "}
                            {resident.job_position || "-"}
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
                    <span
                      className={`status-badge ${
                        status === "Active" ? "active-status" : "inactive-status"
                      }`}
                    >
                      {status}
                    </span>

                    <div className="student-actions">
                      <button
                        className="view-btn"
                        onClick={() => viewResidentDetails(email)}
                      >
                        View Details
                      </button>

                      <button
                        className="edit-btn"
                        onClick={() => openEditResidentModal(email)}
                      >
                        Edit
                      </button>

                      <button
                        className="toggle-btn"
                        onClick={() => toggleResidentStatus(email)}
                      >
                        {status === "Active" ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteResident(email)}
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
        onClick={(e) => {
          if (e.target.classList.contains("modal-overlay")) {
            closeResidentModal();
          }
        }}
      >
        <div className="modal-card">
          <div className="modal-header">
            <h2>{editEmail ? "Edit Resident" : "Add Resident"}</h2>
            <button className="close-btn" onClick={closeResidentModal}>
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
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
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
                  disabled={!!editEmail}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  placeholder="Example: 71-123456"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={form.user_type}
                  disabled={!!editEmail}
                  onChange={(e) =>
                    setForm({ ...form, user_type: e.target.value })
                  }
                  required
                >
                  <option value="">Select role</option>
                  <option value="student">Student</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              {form.user_type === "student" && (
                <>
                  <div className="form-group student-field">
                    <label>University</label>
                    <input
                      type="text"
                      placeholder="Example: AUB, LAU, LU"
                      value={form.university_name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          university_name: e.target.value,
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
                      onChange={(e) =>
                        setForm({ ...form, major: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {form.user_type === "employee" && (
                <>
                  <div className="form-group employee-field">
                    <label>Company</label>
                    <input
                      type="text"
                      placeholder="Enter company"
                      value={form.company_name}
                      onChange={(e) =>
                        setForm({ ...form, company_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group employee-field">
                    <label>Job Title</label>
                    <input
                      type="text"
                      placeholder="Enter job title"
                      value={form.job_position}
                      onChange={(e) =>
                        setForm({ ...form, job_position: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.resident_status}
                  onChange={(e) =>
                    setForm({ ...form, resident_status: e.target.value })
                  }
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="modal-note">
              <p>
                Default password for admin-created accounts is{" "}
                <strong>123456</strong>.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={closeResidentModal}
              >
                Cancel
              </button>

              <button type="submit" className="save-btn">
                Save Resident
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManageStudentsPage;