import { useEffect, useState } from "react";
import "./ProfilePage.css";
import { getResidents, getBookings, updateResident } from "../api";

function ProfilePage() {
  const currentEmail = (
    localStorage.getItem("loggedInUserEmail") || ""
  ).toLowerCase();

  const currentResidentId = localStorage.getItem("loggedInResidentId") || "";

  const [resident, setResident] = useState(null);
  const [latestBooking, setLatestBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageData, setProfileImageData] = useState("");

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

  const normalizeResident = (item) => {
    return {
      ...item,
      resident_id: item.resident_id || item.id,
      user_id: item.user_id || "",
      full_name: item.full_name || item.user?.full_name || "Resident",
      email: item.email || item.user?.email || "",
      phone: item.phone || "",
      role:
        item.role ||
        item.user_type ||
        localStorage.getItem("loggedInUserType") ||
        "student",
      university: item.university || item.university_name || "",
      major: item.major || "",
      company: item.company || item.company_name || "",
      bio: item.bio || "",
      profile_image: item.profile_image || "",
    };
  };

  const normalizeBooking = (booking) => {
    const room = booking.room || {};
    const dorm = room.dorm || booking.dorm || {};
    const residentData = booking.resident || {};

    return {
      ...booking,
      booking_id: booking.booking_id || booking.id,
      resident_id: booking.resident_id || residentData.resident_id || "",
      email: booking.email || residentData.email || residentData.user?.email || "",

      dorm_id: booking.dorm_id || dorm.dorm_id || room.dorm_id || "",
      dorm_name: booking.dorm_name || dorm.dorm_name || "Dorm Name",

      room_id: booking.room_id || room.room_id || "",
      room_number: booking.room_number || room.room_number || "",
      room_type: booking.room_type || room.room_type || "",

      booking_status: booking.booking_status || "pending",
      created_at: booking.created_at || "",
    };
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      const [residentsResponse, bookingsResponse] = await Promise.all([
        getResidents(),
        getBookings().catch(() => []),
      ]);

      const residentsList = Array.isArray(residentsResponse)
        ? residentsResponse
        : residentsResponse.data || [];

      const bookingsList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : bookingsResponse.data || [];

      const normalizedResidents = residentsList.map(normalizeResident);

      const foundResident = normalizedResidents.find((item) => {
        const sameId = String(item.resident_id || "") === String(currentResidentId);
        const sameEmail = String(item.email || "").toLowerCase() === currentEmail;

        return sameId || sameEmail;
      });

      if (!foundResident) {
        setResident(null);
        return;
      }

      const normalizedBookings = bookingsList.map(normalizeBooking);

      const myBookings = normalizedBookings
        .filter((booking) => {
          const bookingResidentId = String(booking.resident_id || "");
          const bookingEmail = String(booking.email || "").toLowerCase();

          return (
            bookingResidentId === String(foundResident.resident_id) ||
            bookingEmail === currentEmail
          );
        })
        .sort((a, b) => Number(b.booking_id || 0) - Number(a.booking_id || 0));

      const activeBooking =
        myBookings.find((booking) => {
          const status = normalizeStatus(booking.booking_status);
          return status === "approved" || status === "pending";
        }) || null;

      setResident(foundResident);
      setLatestBooking(activeBooking);

      setFullName(foundResident.full_name || "Resident");
      setPhone(foundResident.phone || "");
      setUniversity(foundResident.university || "");
      setMajor(foundResident.major || "");
      setCompany(foundResident.company || "");
      setBio(foundResident.bio || "");
      setProfileImageData(foundResident.profile_image || "");
    } catch (error) {
      console.error("Profile load failed:", error);
      alert("Could not load profile from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!resident) {
      alert("Resident not found.");
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    const phoneRegex = /^\d{2}-\d{6}$/;

    if (!phoneRegex.test(phone.trim())) {
      alert("Phone number must be like this: 71-123456");
      return;
    }

    const userType = String(resident.role || "student").toLowerCase();

    if (userType === "student" && (!university.trim() || !major.trim())) {
      alert("Please fill university and major fields.");
      return;
    }

    if (userType === "employee" && !company.trim()) {
      alert("Please fill company field.");
      return;
    }

    try {
      setSaving(true);

      await updateResident(resident.resident_id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        role: userType,
        university: userType === "student" ? university.trim() : "",
        major: userType === "student" ? major.trim() : "",
        company: userType === "employee" ? company.trim() : "",
      });

      localStorage.setItem("loggedInUser", fullName.trim());
      localStorage.setItem("loggedInUserType", userType);
      localStorage.setItem("loggedInRole", userType);

      alert("Profile updated successfully.");
      loadProfile();
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Profile could not be updated. We may need to fix PATCH /residents/{id} later.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-layout">
        <main className="profile-main">
          <div className="profile-card">
            <h2>Loading profile...</h2>
          </div>
        </main>
      </div>
    );
  }

  if (!resident) {
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

  const initialUserType = String(resident.role || "student").toLowerCase();

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
                  Image preview is frontend-only for now.
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
                    value={resident.email || currentEmail}
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
              )}

              {initialUserType === "employee" && (
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
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentHousing">Current Dorm</label>
                  <input
                    type="text"
                    id="currentHousing"
                    value={latestBooking ? latestBooking.dorm_name || "" : ""}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="roomType">Room Type</label>
                  <input
                    type="text"
                    id="roomType"
                    value={latestBooking ? latestBooking.room_type || "" : ""}
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

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProfilePage;