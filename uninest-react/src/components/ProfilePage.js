import { useState } from "react";
import "./ProfilePage.css";

function ProfilePage() {
  const currentEmail = (
    localStorage.getItem("loggedInUserEmail") || ""
  ).toLowerCase();

  const currentResidentId = localStorage.getItem("loggedInResidentId") || "";

  const getUsers = () => {
    return JSON.parse(localStorage.getItem("users")) || [];
  };

  const saveUsers = (users) => {
    localStorage.setItem("users", JSON.stringify(users));
  };

  const getBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const saveBookings = (bookings) => {
    localStorage.setItem("studentBookings", JSON.stringify(bookings));
  };

  const getMaintenanceRequests = () => {
    return JSON.parse(localStorage.getItem("maintenanceRequests")) || [];
  };

  const saveMaintenanceRequests = (requests) => {
    localStorage.setItem("maintenanceRequests", JSON.stringify(requests));
  };

  const getPayments = () => {
    return JSON.parse(localStorage.getItem("payments")) || [];
  };

  const savePayments = (payments) => {
    localStorage.setItem("payments", JSON.stringify(payments));
  };

  const getReviews = () => {
    return JSON.parse(localStorage.getItem("reviews")) || [];
  };

  const saveReviews = (reviews) => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const splitFullName = (fullName) => {
    const parts = fullName
      .trim()
      .split(" ")
      .filter((part) => part !== "");

    return {
      first_name: parts[0] || "",
      last_name: parts.length > 1 ? parts.slice(1).join(" ") : "",
    };
  };

  const getResidentFullName = (resident) => {
    const firstName = resident?.first_name || "";
    const lastName = resident?.last_name || "";
    const fullName = (firstName + " " + lastName).trim();

    return fullName || "Resident";
  };

  const getCurrentUser = () => {
    const users = getUsers();

    return users.find((user) => {
      return (
        String(user.resident_id || "") === String(currentResidentId) ||
        (user.email || "").toLowerCase() === currentEmail
      );
    });
  };

  const getLatestBooking = () => {
    const bookings = getBookings();

    const myBookings = bookings
      .filter((booking) => {
        const bookingResidentId = String(booking.resident_id || "");
        const bookingEmail = (
          booking.email ||
          booking.userEmail ||
          booking.studentEmail ||
          ""
        ).toLowerCase();

        return (
          bookingResidentId === String(currentResidentId) ||
          bookingEmail === currentEmail
        );
      })
      .sort((a, b) => {
        return Number(b.booking_id || b.id || 0) - Number(a.booking_id || a.id || 0);
      });

    return myBookings.find((booking) => {
      const bookingStatus = booking.booking_status || booking.status || "Pending";
      return bookingStatus === "Approved" || bookingStatus === "Pending";
    });
  };

  const currentUser = getCurrentUser();
  const latestBooking = getLatestBooking();

  const initialFullName = currentUser ? getResidentFullName(currentUser) : "Resident";

  const initialUserType = (
    currentUser?.user_type ||
    localStorage.getItem("loggedInUserType") ||
    localStorage.getItem("loggedInRole") ||
    "student"
  ).toLowerCase();

  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [university, setUniversity] = useState(currentUser?.university_name || "");
  const [major, setMajor] = useState(currentUser?.major || "");
  const [company, setCompany] = useState(currentUser?.company_name || "");
  const [jobTitle, setJobTitle] = useState(currentUser?.job_position || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [profileImageData, setProfileImageData] = useState(
    currentUser?.profile_image || ""
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const updateRelatedData = (newName) => {
    const bookings = getBookings().map((booking) => {
      const bookingResidentId = String(booking.resident_id || "");
      const bookingEmail = (
        booking.email ||
        booking.userEmail ||
        booking.studentEmail ||
        ""
      ).toLowerCase();

      if (
        bookingResidentId === String(currentResidentId) ||
        bookingEmail === currentEmail
      ) {
        return {
          ...booking,
          resident_name: newName,
          userName: newName,
          studentName: newName,
          residentName: newName,
        };
      }

      return booking;
    });

    saveBookings(bookings);

    const requests = getMaintenanceRequests().map((request) => {
      const requestResidentId = String(request.resident_id || "");
      const requestEmail = (
        request.email ||
        request.userEmail ||
        request.studentEmail ||
        request.residentEmail ||
        ""
      ).toLowerCase();

      if (
        requestResidentId === String(currentResidentId) ||
        requestEmail === currentEmail
      ) {
        return {
          ...request,
          resident_name: newName,
          userName: newName,
          studentName: newName,
          residentName: newName,
        };
      }

      return request;
    });

    saveMaintenanceRequests(requests);

    const payments = getPayments().map((payment) => {
      const paymentResidentId = String(payment.resident_id || "");
      const paymentEmail = (
        payment.email ||
        payment.userEmail ||
        payment.studentEmail ||
        ""
      ).toLowerCase();

      if (
        paymentResidentId === String(currentResidentId) ||
        paymentEmail === currentEmail
      ) {
        return {
          ...payment,
          resident_name: newName,
          userName: newName,
          studentName: newName,
          residentName: newName,
        };
      }

      return payment;
    });

    savePayments(payments);

    const reviews = getReviews().map((review) => {
      const reviewResidentId = String(review.resident_id || "");
      const reviewEmail = (
        review.email ||
        review.userEmail ||
        review.residentEmail ||
        ""
      ).toLowerCase();

      if (
        reviewResidentId === String(currentResidentId) ||
        reviewEmail === currentEmail
      ) {
        return {
          ...review,
          resident_name: newName,
          userName: newName,
          residentName: newName,
        };
      }

      return review;
    });

    saveReviews(reviews);
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
      setProfileImageData(e.target.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!fullName.trim() || !phone.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const phoneRegex = /^\d{2}-\d{6}$/;

    if (!phoneRegex.test(phone.trim())) {
      alert("Phone number must be like this: 71-123456");
      return;
    }

    const users = getUsers();

    const currentResident = users.find((user) => {
      return (
        String(user.resident_id || "") === String(currentResidentId) ||
        (user.email || "").toLowerCase() === currentEmail
      );
    });

    if (!currentResident) {
      alert("User not found.");
      return;
    }

    const userType = (
      currentResident.user_type ||
      localStorage.getItem("loggedInUserType") ||
      localStorage.getItem("loggedInRole") ||
      "student"
    ).toLowerCase();

    if (userType === "student" && (!university.trim() || !major.trim())) {
      alert("Please fill university and major fields.");
      return;
    }

    if (userType === "employee" && (!company.trim() || !jobTitle.trim())) {
      alert("Please fill company and job title fields.");
      return;
    }

    let finalPassword = currentResident.password || "";

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill all password fields to change your password.");
        return;
      }

      if (currentPassword !== currentResident.password) {
        alert("Current password is incorrect.");
        return;
      }

      if (newPassword.length < 6) {
        alert("New password must be at least 6 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("New password and confirmation do not match.");
        return;
      }

      finalPassword = newPassword;
    }

    const nameParts = splitFullName(fullName);

    const updatedUsers = users.map((user) => {
      const sameResident =
        String(user.resident_id || "") === String(currentResidentId) ||
        (user.email || "").toLowerCase() === currentEmail;

      if (sameResident) {
        return {
          ...user,

          first_name: nameParts.first_name,
          last_name: nameParts.last_name,

          phone: phone.trim(),
          user_type: userType,

          university_name: userType === "student" ? university.trim() : "",
          major: userType === "student" ? major.trim() : "",

          company_name: userType === "employee" ? company.trim() : "",
          job_position: userType === "employee" ? jobTitle.trim() : "",

          bio: bio.trim(),
          profile_image: profileImageData,
          password: finalPassword,
          updated_at: formatDateToday(),
        };
      }

      return user;
    });

    saveUsers(updatedUsers);
    updateRelatedData(fullName.trim());

    localStorage.setItem("loggedInUser", fullName.trim());
    localStorage.setItem("loggedInUserType", userType);
    localStorage.setItem("loggedInRole", userType);

    alert("Profile updated successfully!");
    window.location.reload();
  };

  if (!currentUser) {
    return (
      <div className="profile-layout">
        <main className="profile-main">
          <div className="profile-card">
            <h2>Profile not found</h2>
            <p>Please login again.</p>
            <a href="/login" className="save-btn">
              Go to Login
            </a>
          </div>
        </main>
      </div>
    );
  }

  const readableRole =
    initialUserType.charAt(0).toUpperCase() + initialUserType.slice(1);

  const tagAffiliation =
    initialUserType === "student"
      ? university || "University"
      : initialUserType === "employee"
      ? company || "Company"
      : "Affiliation";

  return (
    <div className="profile-layout">
      <aside className="profile-sidebar">
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
            <a href="/maintenance">
              <i className="fa-solid fa-screwdriver-wrench"></i> Maintenance
            </a>
          </li>

          <li>
            <a href="/notifications">
              <i className="fa-solid fa-bell"></i> Notifications
            </a>
          </li>

          <li>
            <a href="/profile" className="active">
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

      <main className="profile-main">
        <div className="profile-topbar">
          <div>
            <h1>My Profile</h1>
            <p>View and manage your resident information.</p>
          </div>
        </div>

        <section className="profile-grid">
          <div className="profile-card profile-info-card">
            <div className="profile-avatar">
              {profileImageData ? (
                <img src={profileImageData} alt="Profile" />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>

            <h2>{fullName || "Resident Name"}</h2>
            <p className="profile-role">Active {readableRole}</p>

            <div className="profile-tags">
              <span>{readableRole}</span>
              <span>{tagAffiliation}</span>
              <span>{phone || "Phone"}</span>
            </div>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <h2>Personal Information</h2>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="profileImage">Profile Image</label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <small className="form-note">
                  Upload a profile image from your device.
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="residentEmail">Email</label>
                  <input
                    type="email"
                    id="residentEmail"
                    value={currentUser.email || currentEmail}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    placeholder="Example: 71-123456"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <input type="text" id="role" value={readableRole} disabled />
                </div>
              </div>

              {initialUserType === "student" && (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="university">University</label>
                      <input
                        type="text"
                        id="university"
                        value={university}
                        onChange={(event) => setUniversity(event.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="major">Major</label>
                      <input
                        type="text"
                        id="major"
                        value={major}
                        onChange={(event) => setMajor(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {initialUserType === "employee" && (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="company">Company</label>
                      <input
                        type="text"
                        id="company"
                        value={company}
                        onChange={(event) => setCompany(event.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="jobTitle">Job Title</label>
                      <input
                        type="text"
                        id="jobTitle"
                        value={jobTitle}
                        onChange={(event) => setJobTitle(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentHousing">Current Dorm</label>
                  <input
                    type="text"
                    id="currentHousing"
                    value={
                      latestBooking
                        ? latestBooking.dorm_name || latestBooking.housingName || ""
                        : ""
                    }
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="roomType">Room Type</label>
                  <input
                    type="text"
                    id="roomType"
                    value={
                      latestBooking
                        ? latestBooking.room_type || latestBooking.roomType || ""
                        : ""
                    }
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Short Bio</label>
                <textarea
                  id="bio"
                  rows="5"
                  placeholder="Write something about yourself..."
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                ></textarea>
              </div>

              <div className="password-section">
                <h3>Change Password</h3>
                <p>
                  Leave these fields empty if you do not want to change your
                  password.
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                  />
                </div>
              </div>

              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProfilePage;