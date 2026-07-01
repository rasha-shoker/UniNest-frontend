import { useEffect, useState } from "react";
import "./ManageHousingsPage.css";
import {
  API_BASE_URL,
  getDorms,
  createDorm,
  updateDorm,
  deleteDorm as deleteDormApi,
  createRoom,
  updateRoom,
  deleteRoom as deleteRoomApi,
  createImage,
} from "../api";

function ManageHousingsPage() {
  const allowedCities = [
    "Beirut",
    "Hamra",
    "Hadath",
    "Fanar",
    "Byblos",
    "Zahle",
    "Zgharta",
    "Ghobeiry",
    "Ras Maska",
    "Other",
  ];

  const allowedRoomTypes = ["Single Room", "Shared Room", "Studio", "Apartment"];

  const getAdminId = () => {
    return Number(localStorage.getItem("loggedInAdminId") || 1);
  };

  const getTodayDateInput = () => {
    return new Date().toISOString().split("T")[0];
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizeStatus = (status) => {
    const value = String(status || "Available").toLowerCase();

    if (value === "full") return "Full";
    if (value === "unavailable") return "Full";
    if (value === "occupied") return "Full";

    return "Available";
  };

  const getImageUrl = (image) => {
    let imagePath = "";

    if (!image) {
      imagePath = "images/aub1.jpg";
    } else if (typeof image === "string") {
      imagePath = image;
    } else {
      imagePath = image.image_url || image.data || image.url || "images/aub1.jpg";
    }

    const path = String(imagePath);

    if (path.startsWith("data:") || path.startsWith("http")) {
      return path;
    }

    if (path.startsWith("/storage") || path.startsWith("storage")) {
      return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
    }

    const fileName = path.replace("images/", "");

    try {
      return require(`../assets/images/${fileName}`);
    } catch {
      try {
        return require("../assets/images/aub1.jpg");
      } catch {
        return "";
      }
    }
  };

  const getRawImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.image_url || image.data || image.url || "";
  };

  const calculateDormStatus = (rooms) => {
    if (!rooms || rooms.length === 0) return "Full";

    const hasAvailableRoom = rooms.some((room) => {
      return normalizeStatus(room.availability_status) === "Available";
    });

    return hasAvailableRoom ? "Available" : "Full";
  };

  const normalizeRoom = (room, dormId) => {
    const capacity = Number(room.room_capacity || room.capacity || 1);
    const occupancyLimit = Number(
      room.occupancy_limit || room.occupancyLimit || capacity || 1
    );
    const currentOccupancy = Number(
      room.current_occupancy || room.currentOccupancy || 0
    );

    const availabilityStatus =
      currentOccupancy >= occupancyLimit
        ? "Full"
        : normalizeStatus(room.availability_status || room.status || "Available");

    const firstImage =
      Array.isArray(room.images) && room.images.length > 0
        ? getRawImageUrl(room.images[0])
        : "";

    return {
      ...room,

      temp_id:
        room.temp_id ||
        room.room_id ||
        "temp-" + Date.now() + "-" + Math.floor(Math.random() * 1000),

      room_id: room.room_id || "",
      dorm_id: dormId || room.dorm_id || "",
      room_number: room.room_number || room.roomNumber || "",
      room_type: room.room_type || room.type || "Single Room",
      room_capacity: capacity,
      current_occupancy: currentOccupancy,
      occupancy_limit: occupancyLimit,
      room_price: Number(room.room_price || room.price || 0),
      availability_status: availabilityStatus,

      image_url: room.image_url || room.image || firstImage || "",
      images: Array.isArray(room.images) ? room.images : [],
    };
  };

  const normalizeDorm = (dorm) => {
    const dormId = dorm.dorm_id || dorm.id || "";

    const rooms = Array.isArray(dorm.rooms)
      ? dorm.rooms.map((room) => normalizeRoom(room, dormId))
      : [];

    const firstImage =
      Array.isArray(dorm.images) && dorm.images.length > 0
        ? getRawImageUrl(dorm.images[0])
        : "";

    const mainImage =
      dorm.image_url || dorm.image || dorm.housingImage || firstImage || "images/aub1.jpg";

    const prices = rooms
      .map((room) => Number(room.room_price || 0))
      .filter((price) => price > 0);

    const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

    return {
      ...dorm,

      dorm_id: dormId,
      dorm_name: dorm.dorm_name || dorm.name || "Dorm Name",

      city: dorm.city || "",
      area: dorm.area || "",
      street: dorm.street || "",
      building_number: dorm.building_number || dorm.buildingNumber || "",
      gps_location: dorm.gps_location || dorm.mapLink || "",

      dorm_description: dorm.dorm_description || dorm.description || "",
      eligibility_requirements:
        dorm.eligibility_requirements ||
        dorm.eligibility ||
        "Available for students and employees with valid identification documents.",

      contact_email: dorm.contact_email || "",
      contact_phone: dorm.contact_phone || dorm.contact || "",

      rating: Number(dorm.rating || 0),
      created_at: dorm.created_at || dorm.createdAt || formatDateToday(),
      admin_id: dorm.admin_id || getAdminId(),

      image_url: mainImage,
      images: Array.isArray(dorm.images) ? dorm.images : [],
      rooms: rooms,

      availability_status: calculateDormStatus(rooms),
      base_price: basePrice,
      main_room_type: rooms[0]?.room_type || "Single Room",
    };
  };

  const makeEmptyRoom = () => {
    return {
      temp_id: "temp-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      room_id: "",
      room_number: "",
      room_type: "Single Room",
      room_capacity: 1,
      current_occupancy: 0,
      occupancy_limit: 1,
      room_price: 300,
      availability_status: "Available",
      image_url: "",
      images: [],
    };
  };

  const emptyForm = {
    dorm_name: "",
    city: "Beirut",
    area: "Hamra",
    street: "Main Street",
    building_number: "B1",
    gps_location: "",
    contact_email: "",
    contact_phone: "+961 70 000 000",
    dorm_description: "",
    eligibility_requirements:
      "Available for students and employees with valid identification documents.",
    images: [],
    rooms: [makeEmptyRoom()],
  };

  const [dorms, setDorms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [deletedRoomIds, setDeletedRoomIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const loadDorms = async () => {
    try {
      setLoading(true);

      const response = await getDorms();

      const dormsList = Array.isArray(response) ? response : response.data || [];

      setDorms(dormsList.map(normalizeDorm));
    } catch (error) {
      console.error("Could not load dorms:", error);
      alert("Could not load dorms from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDorms();
  }, []);

  const totalDorms = dorms.length;

  const availableDorms = dorms.filter((dorm) => {
    return dorm.availability_status === "Available";
  }).length;

  const fullDorms = dorms.filter((dorm) => {
    return dorm.availability_status === "Full";
  }).length;

  const totalRooms = dorms.reduce((total, dorm) => {
    return total + ((dorm.rooms && dorm.rooms.length) || 0);
  }, 0);

  const openAddModal = () => {
    setEditIndex("");
    setDeletedRoomIds([]);
    setFormData({
      ...emptyForm,
      rooms: [makeEmptyRoom()],
    });
    setShowModal(true);
  };

  const openEditModal = (index) => {
    const dorm = dorms[index];

    if (!dorm) return;

    setEditIndex(index);
    setDeletedRoomIds([]);

    setFormData({
      dorm_name: dorm.dorm_name || "",
      city: dorm.city || "Beirut",
      area: dorm.area || "",
      street: dorm.street || "",
      building_number: dorm.building_number || "",
      gps_location: dorm.gps_location || "",
      contact_email: dorm.contact_email || "",
      contact_phone: dorm.contact_phone || "",
      dorm_description: dorm.dorm_description || "",
      eligibility_requirements: dorm.eligibility_requirements || "",
      images: Array.isArray(dorm.images) ? dorm.images : [],
      rooms:
        dorm.rooms && dorm.rooms.length > 0
          ? dorm.rooms.map((room) => normalizeRoom(room, dorm.dorm_id))
          : [makeEmptyRoom()],
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...formData.rooms];

    updatedRooms[index] = {
      ...updatedRooms[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      rooms: updatedRooms,
    });
  };

  const addRoomRow = () => {
    setFormData({
      ...formData,
      rooms: [...formData.rooms, makeEmptyRoom()],
    });
  };

  const removeRoomRow = (index) => {
    if (formData.rooms.length <= 1) {
      alert("Each dorm must have at least one room.");
      return;
    }

    const roomToRemove = formData.rooms[index];

    if (roomToRemove?.room_id) {
      setDeletedRoomIds([...deletedRoomIds, roomToRemove.room_id]);
    }

    const updatedRooms = formData.rooms.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      rooms: updatedRooms,
    });
  };

  const readImages = (files, callback) => {
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    const images = [];

    fileArray.forEach((file, index) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload image files only.");
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        images.push({
          image_id: "temp-image-" + Date.now() + "-" + index,
          dorm_id: null,
          room_id: null,
          maintenance_request_id: null,
          image_url: e.target.result,
          uploaded_at: formatDateToday(),
          data: e.target.result,
        });

        if (images.length === fileArray.length) {
          callback(images);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDormImages = (event) => {
    readImages(event.target.files, (images) => {
      setFormData({
        ...formData,
        images: images,
      });
    });
  };

  const handleRoomImage = (event, roomIndex) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file only.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      handleRoomChange(roomIndex, "image_url", e.target.result);
    };

    reader.readAsDataURL(file);
  };

  const getRoomsFromForm = () => {
    const rooms = [];
    const roomNumbers = [];

    for (let i = 0; i < formData.rooms.length; i++) {
      const room = formData.rooms[i];

      const roomNumber = String(room.room_number || "").trim();
      const roomType = String(room.room_type || "").trim();
      const capacity = Number(room.room_capacity || 1);
      const currentOccupancy = Number(room.current_occupancy || 0);
      const occupancyLimit = Number(room.occupancy_limit || 1);
      const price = Number(room.room_price || 0);

      if (!roomNumber || !roomType || !capacity || !occupancyLimit || !price) {
        alert("Please check all room rows. Required fields must be valid.");
        return [];
      }

      if (occupancyLimit > capacity) {
        alert("Occupancy limit cannot be greater than room capacity.");
        return [];
      }

      if (currentOccupancy > occupancyLimit) {
        alert("Current occupancy cannot be greater than occupancy limit.");
        return [];
      }

      if (roomNumbers.includes(roomNumber)) {
        alert("Room number " + roomNumber + " is already added.");
        return [];
      }

      roomNumbers.push(roomNumber);

      const availabilityStatus =
        currentOccupancy >= occupancyLimit
          ? "Full"
          : normalizeStatus(room.availability_status);

      rooms.push({
        ...room,
        room_number: roomNumber,
        room_type: roomType,
        room_capacity: capacity,
        current_occupancy: currentOccupancy,
        occupancy_limit: occupancyLimit,
        room_price: price,
        availability_status: availabilityStatus,
      });
    }

    return rooms;
  };

  const buildDormPayload = () => {
    return {
      dorm_name: formData.dorm_name.trim(),
      city: formData.city.trim(),
      area: formData.area.trim(),
      street: formData.street.trim(),
      building_number: formData.building_number.trim(),
      gps_location: formData.gps_location.trim(),
      dorm_description:
        formData.dorm_description.trim() || "Dorm listing added by admin.",
      eligibility_requirements:
        formData.eligibility_requirements.trim() ||
        "Available for students and employees with valid documents.",
      contact_email: formData.contact_email.trim(),
      contact_phone: formData.contact_phone.trim(),
      rating: 0,
      admin_id: getAdminId(),
    };
  };

  const buildRoomPayload = (room, dormId) => {
    return {
      dorm_id: Number(dormId),
      room_number: room.room_number,
      room_type: room.room_type,
      room_capacity: Number(room.room_capacity),
      current_occupancy: Number(room.current_occupancy),
      occupancy_limit: Number(room.occupancy_limit),
      room_price: Number(room.room_price),
      availability_status: room.availability_status,
    };
  };

  const saveDormImagesIfPossible = async (dormId) => {
    const images = Array.isArray(formData.images) ? formData.images : [];

    for (const image of images) {
      const imageUrl = getRawImageUrl(image);

      if (!imageUrl || !String(imageUrl).startsWith("data:")) {
        continue;
      }

      try {
        await createImage({
          dorm_id: Number(dormId),
          room_id: null,
          maintenance_request_id: null,
          image_url: imageUrl,
        });
      } catch (error) {
        console.warn("Dorm image could not be saved:", error);
      }
    }
  };

  const saveRoomImageIfPossible = async (roomId, room) => {
    const imageUrl = room.image_url || "";

    if (!imageUrl || !String(imageUrl).startsWith("data:")) {
      return;
    }

    try {
      await createImage({
        dorm_id: null,
        room_id: Number(roomId),
        maintenance_request_id: null,
        image_url: imageUrl,
      });
    } catch (error) {
      console.warn("Room image could not be saved:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dormName = formData.dorm_name.trim();

    if (
      !dormName ||
      !formData.city ||
      !formData.area ||
      !formData.street ||
      !formData.building_number ||
      !formData.contact_phone
    ) {
      alert("Please fill all required dorm fields.");
      return;
    }

    const rooms = getRoomsFromForm();

    if (rooms.length === 0) {
      alert("Please add at least one valid room.");
      return;
    }

    try {
      setSaving(true);

      const dormPayload = buildDormPayload();

      if (editIndex === "") {
        const createdDormResponse = await createDorm(dormPayload);
        const createdDorm =
          createdDormResponse?.data && createdDormResponse.data.dorm_id
            ? createdDormResponse.data
            : createdDormResponse;

        const newDormId = createdDorm?.dorm_id || createdDorm?.id;

        if (!newDormId) {
          throw new Error("Dorm was created but dorm_id was not returned.");
        }

        await saveDormImagesIfPossible(newDormId);

        for (const room of rooms) {
          const createdRoomResponse = await createRoom(
            buildRoomPayload(room, newDormId)
          );

          const createdRoom =
            createdRoomResponse?.data && createdRoomResponse.data.room_id
              ? createdRoomResponse.data
              : createdRoomResponse;

          const newRoomId = createdRoom?.room_id || createdRoom?.id;

          if (newRoomId) {
            await saveRoomImageIfPossible(newRoomId, room);
          }
        }

        alert("Dorm added successfully.");
      } else {
        const currentDorm = dorms[editIndex];
        const dormId = currentDorm.dorm_id;

        await updateDorm(dormId, dormPayload);
        await saveDormImagesIfPossible(dormId);

        for (const roomId of deletedRoomIds) {
          try {
            await deleteRoomApi(roomId);
          } catch (error) {
            console.warn("Room could not be deleted:", error);
          }
        }

        for (const room of rooms) {
          if (room.room_id) {
            await updateRoom(room.room_id, buildRoomPayload(room, dormId));
            await saveRoomImageIfPossible(room.room_id, room);
          } else {
            const createdRoomResponse = await createRoom(
              buildRoomPayload(room, dormId)
            );

            const createdRoom =
              createdRoomResponse?.data && createdRoomResponse.data.room_id
                ? createdRoomResponse.data
                : createdRoomResponse;

            const newRoomId = createdRoom?.room_id || createdRoom?.id;

            if (newRoomId) {
              await saveRoomImageIfPossible(newRoomId, room);
            }
          }
        }

        alert("Dorm updated successfully.");
      }

      setShowModal(false);
      setDeletedRoomIds([]);
      await loadDorms();
    } catch (error) {
      console.error("Save dorm failed:", error);
      alert(
        "Dorm could not be saved. Make sure POST/PATCH /dorms and /rooms exist in Laravel."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteDorm = async (index) => {
    const dorm = dorms[index];

    if (!dorm) {
      alert("Dorm not found.");
      return;
    }

    const ok = window.confirm("Are you sure you want to delete this dorm?");

    if (!ok) return;

    try {
      await deleteDormApi(dorm.dorm_id);
      alert("Dorm deleted successfully.");
      await loadDorms();
    } catch (error) {
      console.error("Delete dorm failed:", error);
      alert(
        "Dorm could not be deleted. It may have rooms or bookings connected to it."
      );
    }
  };

  const viewDorm = (dormId) => {
    localStorage.setItem("selectedDormId", dormId);
    localStorage.setItem("selectedHousingId", dormId);
    window.location.href = `/housing-details?id=${dormId}`;
  };

  return (
    <div className="manage-layout">
      <aside className="manage-sidebar">
        <div className="sidebar-logo">
          <h2>UniNest</h2>
          <p>Admin Panel</p>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a href="/admin-dashboard">
              <i className="fa-solid fa-chart-line"></i> Dashboard
            </a>
          </li>

          <li>
            <a href="/manage-housings" className="active">
              <i className="fa-solid fa-building"></i> Manage Dorms
            </a>
          </li>

          <li>
            <a href="/manage-bookings">
              <i className="fa-solid fa-bed"></i> Manage Bookings
            </a>
          </li>

          <li>
            <a href="/manage-students">
              <i className="fa-solid fa-users"></i> Manage Residents
            </a>
          </li>

          <li>
            <a href="/manage-maintenance">
              <i className="fa-solid fa-screwdriver-wrench"></i> Maintenance
            </a>
          </li>

          <li>
            <a href="/manage-reviews">
              <i className="fa-solid fa-star"></i> Manage Reviews
            </a>
          </li>

          <li>
            <a href="/reports">
              <i className="fa-solid fa-chart-pie"></i> Reports
            </a>
          </li>

          <li>
            <a href="/" onClick={logout}>
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </a>
          </li>
        </ul>
      </aside>

      <main className="manage-main">
        <div className="manage-topbar">
          <div>
            <h1>Manage Dorms</h1>
            <p>
              Add, edit, remove dorm listings, and manage rooms from the UniNest
              platform.
            </p>
          </div>

          <button className="add-btn" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i>
            Add New Dorm
          </button>
        </div>

        <section className="housing-stats">
          <div className="stat-card">
            <h3>{totalDorms}</h3>
            <p>Total Dorms</p>
          </div>

          <div className="stat-card">
            <h3>{availableDorms}</h3>
            <p>Available Dorms</p>
          </div>

          <div className="stat-card">
            <h3>{fullDorms}</h3>
            <p>Full Dorms</p>
          </div>

          <div className="stat-card">
            <h3>{totalRooms}</h3>
            <p>Total Rooms</p>
          </div>
        </section>

        <section className="housing-list">
          {loading ? (
            <div className="empty-housings">
              <h3>Loading dorms...</h3>
            </div>
          ) : dorms.length === 0 ? (
            <div className="empty-housings">
              <h3>No dorms found</h3>
              <p>Add your first dorm to start managing housing listings.</p>
            </div>
          ) : (
            dorms.map((dorm, index) => {
              const image = dorm.image_url || "images/aub1.jpg";
              const rooms = Array.isArray(dorm.rooms) ? dorm.rooms : [];

              const availableRooms = rooms.filter((room) => {
                return normalizeStatus(room.availability_status) === "Available";
              }).length;

              const fullRooms = rooms.filter((room) => {
                return normalizeStatus(room.availability_status) === "Full";
              }).length;

              return (
                <div className="housing-card" key={dorm.dorm_id}>
                  <div className="housing-image">
                    <img src={getImageUrl(image)} alt={dorm.dorm_name} />
                  </div>

                  <div className="housing-info">
                    <div className="housing-title-row">
                      <h2>{dorm.dorm_name || "Dorm Name"}</h2>

                      <span
                        className={
                          dorm.availability_status === "Available"
                            ? "housing-status available"
                            : "housing-status full"
                        }
                      >
                        {dorm.availability_status || "Available"}
                      </span>
                    </div>

                    <p>
                      <i className="fa-solid fa-location-dot"></i>{" "}
                      <strong>City:</strong> {dorm.city || "-"}
                    </p>

                    <p>
                      <i className="fa-solid fa-map"></i>{" "}
                      <strong>Area:</strong> {dorm.area || "-"}
                    </p>

                    <p>
                      <i className="fa-solid fa-road"></i>{" "}
                      <strong>Street:</strong> {dorm.street || "-"}
                    </p>

                    <p>
                      <i className="fa-solid fa-building"></i>{" "}
                      <strong>Building:</strong> {dorm.building_number || "-"}
                    </p>

                    <p>
                      <i className="fa-solid fa-bed"></i>{" "}
                      <strong>Main Room:</strong> {dorm.main_room_type || "-"}
                    </p>

                    <p>
                      <i className="fa-solid fa-dollar-sign"></i>{" "}
                      <strong>Base Price:</strong> ${dorm.base_price || 0} /
                      month
                    </p>

                    <p>
                      <i className="fa-solid fa-envelope"></i>{" "}
                      <strong>Email:</strong> {dorm.contact_email || "-"}
                    </p>

                    <p>
                      <i className="fa-solid fa-phone"></i>{" "}
                      <strong>Contact:</strong> {dorm.contact_phone || "-"}
                    </p>

                    <p>
                      <i className="fa-solid fa-user-check"></i>{" "}
                      <strong>Eligibility:</strong>{" "}
                      {dorm.eligibility_requirements ||
                        "Available for students and employees"}
                    </p>

                    {dorm.gps_location && (
                      <p>
                        <i className="fa-solid fa-map-location-dot"></i>{" "}
                        <strong>Map:</strong>{" "}
                        <a
                          href={dorm.gps_location}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Map
                        </a>
                      </p>
                    )}

                    <div className="description-box">
                      <strong>Description:</strong>
                      <p>
                        {dorm.dorm_description || "No description available."}
                      </p>
                    </div>

                    <div className="rooms-summary">
                      <span>{rooms.length} Total Rooms</span>
                      <span>{availableRooms} Available</span>
                      <span>{fullRooms} Full</span>
                    </div>

                    <div className="rooms-box">
                      <h4>Rooms</h4>

                      {rooms.length > 0 ? (
                        rooms.map((room) => (
                          <span
                            key={room.room_id || room.temp_id}
                            className={
                              normalizeStatus(room.availability_status) ===
                              "Available"
                                ? "room-available"
                                : "room-full"
                            }
                          >
                            Room {room.room_number || "-"} •{" "}
                            {room.room_type || "-"} • Capacity{" "}
                            {room.room_capacity || 1} • Occupied{" "}
                            {room.current_occupancy || 0}/
                            {room.occupancy_limit || 1} • $
                            {room.room_price || 0} •{" "}
                            {normalizeStatus(room.availability_status)}
                          </span>
                        ))
                      ) : (
                        <span>No rooms added</span>
                      )}
                    </div>
                  </div>

                  <div className="housing-actions">
                    <button
                      className="view-btn"
                      onClick={() => viewDorm(dorm.dorm_id)}
                    >
                      View
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(index)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteDorm(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay show" onClick={closeModal}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editIndex === "" ? "Add New Dorm" : "Edit Dorm"}</h2>

              <button className="close-btn" onClick={closeModal} type="button">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Dorm Name</label>
                  <input
                    type="text"
                    value={formData.dorm_name}
                    onChange={(event) =>
                      handleInputChange("dorm_name", event.target.value)
                    }
                    placeholder="Enter dorm name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City / Location</label>
                  <select
                    value={formData.city}
                    onChange={(event) =>
                      handleInputChange("city", event.target.value)
                    }
                    required
                  >
                    <option value="">Select city</option>
                    {allowedCities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Area</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(event) =>
                      handleInputChange("area", event.target.value)
                    }
                    placeholder="Example: Hamra Main Area"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Street</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(event) =>
                      handleInputChange("street", event.target.value)
                    }
                    placeholder="Example: Bliss Street"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Building Number</label>
                  <input
                    type="text"
                    value={formData.building_number}
                    onChange={(event) =>
                      handleInputChange("building_number", event.target.value)
                    }
                    placeholder="Example: B12"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Map Link</label>
                  <input
                    type="text"
                    value={formData.gps_location}
                    onChange={(event) =>
                      handleInputChange("gps_location", event.target.value)
                    }
                    placeholder="Paste Google Maps link"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(event) =>
                      handleInputChange("contact_email", event.target.value)
                    }
                    placeholder="Example: dorm@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(event) =>
                      handleInputChange("contact_phone", event.target.value)
                    }
                    placeholder="Example: +961 70 000 000"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Dorm Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDormImages}
                  />

                  <div className="dorm-images-preview">
                    {formData.images && formData.images.length > 0 ? (
                      formData.images.map((image, index) => (
                        <img
                          key={index}
                          src={getImageUrl(image)}
                          alt="Dorm"
                        />
                      ))
                    ) : (
                      <span>No images selected</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={formData.dorm_description}
                  onChange={(event) =>
                    handleInputChange("dorm_description", event.target.value)
                  }
                  placeholder="Write a short description about this dorm"
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label>Eligibility Requirements</label>
                <textarea
                  rows="3"
                  value={formData.eligibility_requirements}
                  onChange={(event) =>
                    handleInputChange(
                      "eligibility_requirements",
                      event.target.value
                    )
                  }
                  placeholder="Example: Available for students and employees with valid documents"
                ></textarea>
              </div>

              <div className="rooms-management">
                <div className="rooms-header">
                  <h3>Room Management</h3>

                  <button
                    type="button"
                    className="add-room-btn"
                    onClick={addRoomRow}
                  >
                    <i className="fa-solid fa-plus"></i>
                    Add Room
                  </button>
                </div>

                <div className="room-rows">
                  {formData.rooms.map((room, index) => (
                    <div className="room-row" key={room.room_id || room.temp_id}>
                      <div className="form-group">
                        <label>Room Number</label>
                        <input
                          type="text"
                          value={room.room_number || ""}
                          onChange={(event) =>
                            handleRoomChange(
                              index,
                              "room_number",
                              event.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Room Type</label>
                        <select
                          value={room.room_type || "Single Room"}
                          onChange={(event) =>
                            handleRoomChange(
                              index,
                              "room_type",
                              event.target.value
                            )
                          }
                          required
                        >
                          {allowedRoomTypes.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Capacity</label>
                        <input
                          type="number"
                          min="1"
                          value={room.room_capacity || 1}
                          onChange={(event) =>
                            handleRoomChange(
                              index,
                              "room_capacity",
                              event.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Occupancy Limit</label>
                        <input
                          type="number"
                          min="1"
                          value={room.occupancy_limit || 1}
                          onChange={(event) =>
                            handleRoomChange(
                              index,
                              "occupancy_limit",
                              event.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Current Occupancy</label>
                        <input
                          type="number"
                          min="0"
                          value={room.current_occupancy || 0}
                          onChange={(event) =>
                            handleRoomChange(
                              index,
                              "current_occupancy",
                              event.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Price</label>
                        <input
                          type="number"
                          min="1"
                          value={room.room_price || ""}
                          onChange={(event) =>
                            handleRoomChange(
                              index,
                              "room_price",
                              event.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={room.availability_status || "Available"}
                          onChange={(event) =>
                            handleRoomChange(
                              index,
                              "availability_status",
                              event.target.value
                            )
                          }
                          required
                        >
                          <option value="Available">Available</option>
                          <option value="Full">Full</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Room Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleRoomImage(event, index)}
                        />

                        <div className="room-image-preview">
                          {room.image_url ? (
                            <img src={getImageUrl(room.image_url)} alt="Room" />
                          ) : (
                            <span>No image selected</span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="remove-room-btn"
                        onClick={() => removeRoomRow(index)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-note">
                <p>
                  Dorm status is calculated automatically. If at least one room
                  is Available, the dorm is Available. If all rooms are Full, the
                  dorm becomes Full.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Dorm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageHousingsPage;