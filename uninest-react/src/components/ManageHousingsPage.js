import { useState } from "react";
import "./ManageHousingsPage.css";
import { housingsData } from "../data/housingsData";

function ManageHousingsPage() {
  const allowedUniversities = [
    "AUB",
    "LAU Beirut",
    "LAU Byblos",
    "Lebanese University",
    "USJ",
    "Antonine University",
    "Other",
  ];

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
  const allowedGenders = ["Male", "Female", "Mixed"];
  const allowedDormTypes = [
    "University Dorm",
    "Private Dorm",
    "Apartment",
    "Studio",
    "Private Residence",
  ];

  const getTodayDateInput = () => new Date().toISOString().split("T")[0];

  const getFutureDateInput = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split("T")[0];
  };

  const formatDateToday = () => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAdminId = () => {
    return localStorage.getItem("loggedInAdminId") || 1;
  };

  const normalizeOldRoomType = (type) => {
    if (type === "Single") return "Single Room";
    if (type === "Double") return "Shared Room";
    if (type === "Triple") return "Shared Room";
    if (type === "Shared") return "Shared Room";
    if (type === "Double Room") return "Shared Room";
    if (type === "Triple Room") return "Shared Room";
    if (allowedRoomTypes.includes(type)) return type;
    return "Single Room";
  };

  const normalizeOldGender = (gender) => {
    if (gender === "Male / Female") return "Mixed";
    if (allowedGenders.includes(gender)) return gender;
    return "Mixed";
  };

  const normalizeOldDormType = (type) => {
    if (type === "Private Nearby") return "Private Dorm";
    if (type === "Private") return "Private Dorm";
    if (type === "Dormitory") return "University Dorm";
    if (allowedDormTypes.includes(type)) return type;
    return "Private Dorm";
  };

  const normalizeOldUniversity = (university) => {
    if (allowedUniversities.includes(university)) return university;
    if (university === "LU") return "Lebanese University";
    if (university === "UA") return "Antonine University";
    return "Other";
  };

  const normalizeOldCity = (city) => {
    if (allowedCities.includes(city)) return city;

    const lowerCity = String(city || "").toLowerCase();

    if (lowerCity.includes("hamra")) return "Hamra";
    if (lowerCity.includes("beirut")) return "Beirut";
    if (lowerCity.includes("hadath")) return "Hadath";
    if (lowerCity.includes("fanar")) return "Fanar";
    if (lowerCity.includes("byblos")) return "Byblos";
    if (lowerCity.includes("zahle")) return "Zahle";
    if (lowerCity.includes("zgharta")) return "Zgharta";
    if (lowerCity.includes("ghobeiry")) return "Ghobeiry";
    if (lowerCity.includes("ras maska")) return "Ras Maska";

    return "Other";
  };

  const getImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.image_url || image.data || image.url || "";
  };

  const normalizeImageObjects = (images, dormId, roomId = null) => {
    if (!Array.isArray(images)) {
      images = images ? [images] : [];
    }

    return images
      .map((image, index) => {
        const imageUrl = getImageUrl(image);
        if (!imageUrl) return null;

        return {
          image_id:
            typeof image === "object"
              ? image.image_id || Date.now() + index
              : Date.now() + index,
          dorm_id:
            typeof image === "object" ? image.dorm_id || dormId || null : dormId || null,
          room_id:
            typeof image === "object" ? image.room_id || roomId || null : roomId || null,
          maintenance_request_id:
            typeof image === "object" ? image.maintenance_request_id || null : null,
          image_url: imageUrl,
          uploaded_at:
            typeof image === "object"
              ? image.uploaded_at || formatDateToday()
              : formatDateToday(),
          data: typeof image === "object" ? image.data || imageUrl : imageUrl,
        };
      })
      .filter(Boolean);
  };

  const normalizeFacilities = (facilities) => {
    if (!Array.isArray(facilities)) return [];

    return facilities
      .map((facility, index) => {
        if (typeof facility === "object") {
          return {
            facility_id: facility.facility_id || index + 1,
            facility_name: facility.facility_name || facility.name || "",
          };
        }

        return {
          facility_id: index + 1,
          facility_name: String(facility),
        };
      })
      .filter((facility) => facility.facility_name !== "");
  };

  const facilityNames = (facilities) => {
    if (!Array.isArray(facilities)) return [];

    return facilities
      .map((facility) => {
        if (typeof facility === "object") {
          return facility.facility_name || facility.name || "";
        }

        return String(facility);
      })
      .filter((name) => name !== "");
  };

  const normalizeRoom = (room, dormId) => {
    const roomId =
      room.room_id || room.roomId || Date.now() + Math.floor(Math.random() * 1000);

    const capacity = Number(room.room_capacity || room.capacity || 1);
    const occupancyLimit = Number(room.occupancy_limit || room.occupancyLimit || capacity || 1);
    const currentOccupancy = Number(room.current_occupancy || room.currentOccupancy || 0);

    const statusInput = room.availability_status || room.status || "Available";
    const availabilityStatus =
      currentOccupancy >= occupancyLimit ? "Full" : statusInput;

    const imageUrl =
      room.image_url ||
      room.image ||
      getImageUrl(Array.isArray(room.images) ? room.images[0] : room.images) ||
      "";

    return {
      ...room,

      room_id: roomId,
      dorm_id: dormId || room.dorm_id || null,
      room_number: room.room_number || room.roomNumber || "",
      room_type: normalizeOldRoomType(room.room_type || room.type || "Single Room"),
      room_capacity: capacity,
      current_occupancy: currentOccupancy,
      occupancy_limit: occupancyLimit,
      room_price: Number(room.room_price || room.price || 0),
      availability_status: availabilityStatus,

      available_from: room.available_from || room.availableFrom || getTodayDateInput(),
      available_to: room.available_to || room.availableTo || getFutureDateInput(12),

      image_url: imageUrl,
      images: normalizeImageObjects(
        room.images || (imageUrl ? [imageUrl] : []),
        dormId,
        roomId
      ),
      facilities: normalizeFacilities(room.facilities || []),

      roomId: roomId,
      roomNumber: room.room_number || room.roomNumber || "",
      type: normalizeOldRoomType(room.room_type || room.type || "Single Room"),
      capacity: capacity,
      currentOccupancy: currentOccupancy,
      occupancyLimit: occupancyLimit,
      price: Number(room.room_price || room.price || 0),
      status: availabilityStatus,
      availableFrom: room.available_from || room.availableFrom || getTodayDateInput(),
      availableTo: room.available_to || room.availableTo || getFutureDateInput(12),
      image: imageUrl,
    };
  };

  const calculateDormStatus = (rooms) => {
    if (!rooms || rooms.length === 0) return "Full";

    const hasAvailableRoom = rooms.some((room) => {
      const status = room.availability_status || room.status || "Available";
      return status === "Available";
    });

    return hasAvailableRoom ? "Available" : "Full";
  };

  const normalizeDorm = (dorm) => {
    const dormId =
      dorm.dorm_id || dorm.id || Date.now() + Math.floor(Math.random() * 1000);

    const rooms = Array.isArray(dorm.rooms)
      ? dorm.rooms.map((room) => normalizeRoom(room, dormId))
      : [];

    const mainImage =
      dorm.image_url ||
      dorm.image ||
      dorm.housingImage ||
      getImageUrl(Array.isArray(dorm.images) ? dorm.images[0] : dorm.images) ||
      "images/aub1.jpg";

    let imageObjects = normalizeImageObjects(dorm.images || [mainImage], dormId);

    if (imageObjects.length === 0) {
      imageObjects = normalizeImageObjects([mainImage], dormId);
    }

    const basePrice = Number(
      dorm.base_price || dorm.price || (rooms[0] && rooms[0].room_price) || 0
    );

    const mainRoomType = normalizeOldRoomType(
      dorm.main_room_type ||
        dorm.roomType ||
        (rooms[0] && rooms[0].room_type) ||
        "Single Room"
    );

    const dormName = dorm.dorm_name || dorm.name || "Dorm Name";
    const universityName = normalizeOldUniversity(
      dorm.university_name || dorm.university || ""
    );

    const city = normalizeOldCity(dorm.city || dorm.location || "");

    const availabilityStatus = calculateDormStatus(rooms);

    return {
      ...dorm,

      dorm_id: dormId,
      dorm_name: dormName,
      university_name: universityName,

      city: city,
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
      updated_at: dorm.updated_at || dorm.updatedAt || "",
      admin_id: dorm.admin_id || getAdminId(),

      availability_status: availabilityStatus,

      dorm_type: normalizeOldDormType(dorm.dorm_type || dorm.type || "Private Dorm"),
      gender: normalizeOldGender(dorm.gender || "Mixed"),
      distance: dorm.distance || "Near campus",
      base_price: basePrice,
      main_room_type: mainRoomType,

      image_url: mainImage,
      images: imageObjects,
      facilities: normalizeFacilities(dorm.facilities || []),
      rooms: rooms,

      id: dormId,
      name: dormName,
      university: universityName,
      location: city,
      buildingNumber: dorm.building_number || dorm.buildingNumber || "",
      mapLink: dorm.gps_location || dorm.mapLink || "",
      description: dorm.dorm_description || dorm.description || "",
      eligibility:
        dorm.eligibility_requirements ||
        dorm.eligibility ||
        "Available for students and employees with valid identification documents.",
      contact: dorm.contact_phone || dorm.contact || "",
      status: availabilityStatus,
      availability: availabilityStatus,
      type: normalizeOldDormType(dorm.dorm_type || dorm.type || "Private Dorm"),
      price: basePrice,
      roomType: mainRoomType,
      roomNumber: rooms[0] ? rooms[0].room_number : "",
      image: mainImage,
      housingImage: mainImage,
    };
  };

  const getInitialDorms = () => {
    const savedDorms = JSON.parse(localStorage.getItem("dorms"));
    const savedHousings = JSON.parse(localStorage.getItem("housings"));

    if (savedDorms && Array.isArray(savedDorms)) {
      return savedDorms.map(normalizeDorm);
    }

    if (savedHousings && Array.isArray(savedHousings)) {
      const normalizedDorms = savedHousings.map(normalizeDorm);
      saveDormsToStorage(normalizedDorms);
      return normalizedDorms;
    }

    const normalizedDorms = housingsData.map(normalizeDorm);
    saveDormsToStorage(normalizedDorms);
    return normalizedDorms;
  };

  const saveDormsToStorage = (dormsList) => {
    const normalizedDorms = dormsList.map(normalizeDorm);
    localStorage.setItem("dorms", JSON.stringify(normalizedDorms));
    localStorage.setItem("housings", JSON.stringify(normalizedDorms));
  };

  const [dorms, setDorms] = useState(getInitialDorms);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState("");

  const emptyRoom = {
    room_id: Date.now(),
    room_number: "101",
    room_type: "Single Room",
    room_capacity: 1,
    occupancy_limit: 1,
    current_occupancy: 0,
    room_price: 300,
    availability_status: "Available",
    available_from: getTodayDateInput(),
    available_to: getFutureDateInput(12),
    image_url: "",
    facilities: [{ facility_id: 1, facility_name: "Wi-Fi" }],
  };

  const emptyForm = {
    dorm_name: "",
    university_name: "AUB",
    city: "Beirut",
    area: "Hamra",
    street: "Main Street",
    building_number: "B1",
    gps_location: "",
    base_price: 300,
    main_room_type: "Single Room",
    sample_room_number: "101",
    gender: "Mixed",
    dorm_type: "Private Dorm",
    distance: "Near campus",
    contact_phone: "+961 70 000 000",
    dorm_description: "",
    eligibility_requirements:
      "Available for students and employees with valid identification documents.",
    facilitiesText: "Wi-Fi, Laundry, Study Room",
    images: normalizeImageObjects(["images/aub1.jpg", "images/aub2.jpg", "images/aub3.jpg"], null),
    rooms: [emptyRoom],
  };

  const [formData, setFormData] = useState(emptyForm);

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

  const saveDorms = (updatedDorms) => {
    const normalizedDorms = updatedDorms.map(normalizeDorm);
    setDorms(normalizedDorms);
    saveDormsToStorage(normalizedDorms);
  };

  const getBookings = () => {
    return JSON.parse(localStorage.getItem("studentBookings")) || [];
  };

  const hasActiveBooking = (dormId) => {
    return getBookings().some((booking) => {
      const bookingDormId = booking.dorm_id || booking.housingId;
      const bookingStatus = booking.booking_status || booking.status || "Pending";

      return (
        Number(bookingDormId) === Number(dormId) &&
        (bookingStatus === "Pending" || bookingStatus === "Approved")
      );
    });
  };

  const totalDorms = dorms.length;
  const availableDorms = dorms.filter(
    (dorm) => dorm.availability_status === "Available"
  ).length;
  const fullDorms = dorms.filter(
    (dorm) => dorm.availability_status === "Full"
  ).length;
  const totalRooms = dorms.reduce((total, dorm) => {
    return total + ((dorm.rooms && dorm.rooms.length) || 0);
  }, 0);

  const openAddModal = () => {
    setEditIndex("");
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (index) => {
    const dorm = dorms[index];

    if (!dorm) return;

    setEditIndex(index);

    setFormData({
      dorm_name: dorm.dorm_name || "",
      university_name: normalizeOldUniversity(dorm.university_name || ""),
      city: normalizeOldCity(dorm.city || ""),
      area: dorm.area || "",
      street: dorm.street || "",
      building_number: dorm.building_number || "",
      gps_location: dorm.gps_location || "",
      base_price: dorm.base_price || "",
      main_room_type: normalizeOldRoomType(dorm.main_room_type || "Single Room"),
      sample_room_number:
        dorm.rooms && dorm.rooms[0] ? dorm.rooms[0].room_number : "101",
      gender: normalizeOldGender(dorm.gender || "Mixed"),
      dorm_type: normalizeOldDormType(dorm.dorm_type || "Private Dorm"),
      distance: dorm.distance || "Near campus",
      contact_phone: dorm.contact_phone || "",
      dorm_description: dorm.dorm_description || "",
      eligibility_requirements: dorm.eligibility_requirements || "",
      facilitiesText: facilityNames(dorm.facilities).join(", "),
      images:
        Array.isArray(dorm.images) && dorm.images.length > 0
          ? dorm.images
          : normalizeImageObjects([dorm.image_url || "images/aub1.jpg"], dorm.dorm_id),
      rooms:
        dorm.rooms && dorm.rooms.length > 0
          ? dorm.rooms
          : [
              {
                ...emptyRoom,
                room_id: Date.now(),
              },
            ],
    });

    setShowModal(true);
  };

  const closeModal = () => {
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

  const handleRoomFacilityChange = (roomIndex, facilityName, checked) => {
    const updatedRooms = [...formData.rooms];
    const oldFacilities = facilityNames(updatedRooms[roomIndex].facilities || []);

    let newFacilities;

    if (checked) {
      newFacilities = [...new Set([...oldFacilities, facilityName])];
    } else {
      newFacilities = oldFacilities.filter((name) => name !== facilityName);
    }

    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      facilities: newFacilities.map((name, index) => ({
        facility_id: index + 1,
        facility_name: name,
      })),
    };

    setFormData({
      ...formData,
      rooms: updatedRooms,
    });
  };

  const addRoomRow = () => {
    setFormData({
      ...formData,
      rooms: [
        ...formData.rooms,
        {
          ...emptyRoom,
          room_id: Date.now() + Math.floor(Math.random() * 1000),
          room_number: "",
          room_type: formData.main_room_type || "Single Room",
          room_price: Number(formData.base_price) || 300,
        },
      ],
    });
  };

  const removeRoomRow = (index) => {
    if (formData.rooms.length <= 1) {
      alert("Each dorm must have at least one room.");
      return;
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
          image_id: Date.now() + index,
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

  const getRoomsFromForm = (dormId) => {
    const rooms = [];
    const roomNumbers = [];

    for (let i = 0; i < formData.rooms.length; i++) {
      const room = formData.rooms[i];

      const roomNumber = String(room.room_number || "").trim();
      const roomType = room.room_type;
      const capacity = Number(room.room_capacity || 1);
      const occupancyLimit = Number(room.occupancy_limit || 1);
      const currentOccupancy = Number(room.current_occupancy || 0);
      const price = Number(room.room_price || 0);
      const availableFrom = room.available_from;
      const availableTo = room.available_to;

      if (
        !roomNumber ||
        !roomType ||
        !capacity ||
        !occupancyLimit ||
        !price ||
        !availableFrom ||
        !availableTo
      ) {
        alert("Please check all room rows. Required fields must be valid.");
        return [];
      }

      if (new Date(availableFrom) > new Date(availableTo)) {
        alert("Available From date cannot be after Available To date.");
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
          : room.availability_status || "Available";

      rooms.push(
        normalizeRoom(
          {
            ...room,
            room_id: room.room_id || Date.now() + i,
            dorm_id: dormId,
            room_number: roomNumber,
            room_type: roomType,
            room_capacity: capacity,
            occupancy_limit: occupancyLimit,
            current_occupancy: currentOccupancy,
            room_price: price,
            availability_status: availabilityStatus,
            available_from: availableFrom,
            available_to: availableTo,
            image_url: room.image_url || "",
          },
          dormId
        )
      );
    }

    return rooms;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const dormName = formData.dorm_name.trim();
    const price = Number(formData.base_price);

    if (
      !dormName ||
      !formData.university_name ||
      !formData.city ||
      !price ||
      !formData.main_room_type ||
      !formData.sample_room_number ||
      !formData.gender ||
      !formData.dorm_type
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (price <= 0) {
      alert("Price must be greater than 0.");
      return;
    }

    let dormId;

    if (editIndex === "") {
      dormId = dorms.length
        ? Math.max(...dorms.map((dorm) => Number(dorm.dorm_id || dorm.id) || 0)) + 1
        : 1;
    } else {
      dormId = dorms[editIndex].dorm_id || dorms[editIndex].id;
    }

    const rooms = getRoomsFromForm(dormId);

    if (rooms.length === 0) {
      alert("Please add at least one valid room.");
      return;
    }

    const facilities = formData.facilitiesText
      ? formData.facilitiesText
          .split(",")
          .map((item, index) => ({
            facility_id: index + 1,
            facility_name: item.trim(),
          }))
          .filter((item) => item.facility_name !== "")
      : [];

    let images = normalizeImageObjects(formData.images, dormId);

    if (images.length === 0) {
      images = normalizeImageObjects(["images/aub1.jpg"], dormId);
    }

    const imageUrl = images[0]?.image_url || "images/aub1.jpg";
    const availabilityStatus = calculateDormStatus(rooms);

    const dormObject = normalizeDorm({
      ...(editIndex !== "" ? dorms[editIndex] : {}),

      dorm_id: dormId,
      dorm_name: dormName,
      university_name: formData.university_name,
      city: formData.city,
      area: formData.area.trim(),
      street: formData.street.trim(),
      building_number: formData.building_number.trim(),
      gps_location: formData.gps_location.trim(),
      base_price: price,
      main_room_type: formData.main_room_type,
      availability_status: availabilityStatus,
      image_url: imageUrl,
      images: images,
      dorm_description:
        formData.dorm_description.trim() || "Dorm listing added by admin.",
      eligibility_requirements:
        formData.eligibility_requirements.trim() ||
        "Available for students and employees with valid documents.",
      dorm_type: formData.dorm_type,
      gender: formData.gender,
      distance: formData.distance.trim() || "Near campus",
      contact_phone: formData.contact_phone.trim() || "+961 70 000 000",
      contact_email: "",
      facilities: facilities,
      rooms: rooms,
      rating: editIndex !== "" ? dorms[editIndex].rating || 0 : 0,
      created_at:
        editIndex !== "" ? dorms[editIndex].created_at || formatDateToday() : formatDateToday(),
      updated_at: editIndex !== "" ? formatDateToday() : "",
      admin_id: getAdminId(),
    });

    let updatedDorms;

    if (editIndex === "") {
      updatedDorms = [dormObject, ...dorms];
      alert("Dorm added successfully!");
    } else {
      updatedDorms = [...dorms];
      updatedDorms[editIndex] = dormObject;
      alert("Dorm updated successfully!");
    }

    saveDorms(updatedDorms);
    closeModal();
  };

  const deleteDorm = (index) => {
    const dorm = dorms[index];

    if (!dorm) {
      alert("Dorm not found.");
      return;
    }

    if (hasActiveBooking(dorm.dorm_id)) {
      alert("You cannot delete this dorm because it has Pending or Approved bookings.");
      return;
    }

    const ok = window.confirm("Are you sure you want to delete this dorm?");
    if (!ok) return;

    const updatedDorms = dorms.filter((_, i) => i !== index);
    saveDorms(updatedDorms);
    alert("Dorm deleted successfully.");
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
          {dorms.length === 0 ? (
            <div className="empty-housings">
              <h3>No dorms found</h3>
              <p>Add your first dorm to start managing housing listings.</p>
            </div>
          ) : (
            dorms.map((dorm, index) => {
              const image = dorm.image_url || "images/aub1.jpg";
              const facilities = facilityNames(dorm.facilities);
              const rooms = Array.isArray(dorm.rooms) ? dorm.rooms : [];

              const availableRooms = rooms.filter(
                (room) => room.availability_status === "Available"
              ).length;

              const fullRooms = rooms.filter(
                (room) => room.availability_status === "Full"
              ).length;

              return (
                <div className="housing-card" key={dorm.dorm_id}>
                  <div className="housing-image">
                    <img src={image} alt={dorm.dorm_name} />
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
                      <i className="fa-solid fa-school"></i>{" "}
                      <strong>University:</strong> {dorm.university_name || "-"}
                    </p>

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
                      <strong>Base Price:</strong> ${dorm.base_price || 0} / month
                    </p>

                    <p>
                      <i className="fa-solid fa-venus-mars"></i>{" "}
                      <strong>Gender:</strong> {dorm.gender || "Mixed"}
                    </p>

                    <p>
                      <i className="fa-solid fa-route"></i>{" "}
                      <strong>Distance:</strong> {dorm.distance || "Near campus"}
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
                        <a href={dorm.gps_location} target="_blank" rel="noreferrer">
                          Open Map
                        </a>
                      </p>
                    )}

                    <div className="description-box">
                      <strong>Description:</strong>
                      <p>{dorm.dorm_description || "No description available."}</p>
                    </div>

                    <div className="facilities-box">
                      {facilities.length > 0 ? (
                        facilities.map((facility, i) => (
                          <span key={i}>{facility}</span>
                        ))
                      ) : (
                        <span>No facilities</span>
                      )}
                    </div>

                    <div className="rooms-summary">
                      <span>{rooms.length} Total Rooms</span>
                      <span>{availableRooms} Available</span>
                      <span>{fullRooms} Full</span>
                    </div>

                    <div className="rooms-box">
                      <h4>Rooms</h4>

                      {rooms.length > 0 ? (
                        rooms.map((room) => {
                          const roomFacilities =
                            facilityNames(room.facilities).join(", ") ||
                            "No room facilities";

                          return (
                            <span
                              key={room.room_id}
                              className={
                                room.availability_status === "Available"
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
                              {room.availability_status || "Available"} •{" "}
                              {room.available_from || "-"} to{" "}
                              {room.available_to || "-"} • {roomFacilities}
                            </span>
                          );
                        })
                      ) : (
                        <span>No rooms added</span>
                      )}
                    </div>
                  </div>

                  <div className="housing-actions">
                    <button className="view-btn" onClick={() => viewDorm(dorm.dorm_id)}>
                      View
                    </button>

                    <button className="edit-btn" onClick={() => openEditModal(index)}>
                      Edit
                    </button>

                    <button className="delete-btn" onClick={() => deleteDorm(index)}>
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
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editIndex === "" ? "Add New Dorm" : "Edit Dorm"}</h2>
              <button className="close-btn" onClick={closeModal}>
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
                  <label>Nearby University</label>
                  <select
                    value={formData.university_name}
                    onChange={(event) =>
                      handleInputChange("university_name", event.target.value)
                    }
                    required
                  >
                    <option value="">Select university</option>
                    {allowedUniversities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>City / Location</label>
                  <select
                    value={formData.city}
                    onChange={(event) => handleInputChange("city", event.target.value)}
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
                    onChange={(event) => handleInputChange("area", event.target.value)}
                    placeholder="Example: Hamra Main Area"
                  />
                </div>

                <div className="form-group">
                  <label>Street</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(event) => handleInputChange("street", event.target.value)}
                    placeholder="Example: Bliss Street"
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
                  <label>Base Monthly Price</label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(event) =>
                      handleInputChange("base_price", event.target.value)
                    }
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Main Room Type</label>
                  <select
                    value={formData.main_room_type}
                    onChange={(event) =>
                      handleInputChange("main_room_type", event.target.value)
                    }
                    required
                  >
                    <option value="">Select room type</option>
                    {allowedRoomTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sample Room Number</label>
                  <input
                    type="text"
                    value={formData.sample_room_number}
                    onChange={(event) =>
                      handleInputChange("sample_room_number", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(event) =>
                      handleInputChange("gender", event.target.value)
                    }
                    required
                  >
                    <option value="">Select gender</option>
                    {allowedGenders.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select value="Available" disabled>
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Dorm Type</label>
                  <select
                    value={formData.dorm_type}
                    onChange={(event) =>
                      handleInputChange("dorm_type", event.target.value)
                    }
                    required
                  >
                    <option value="">Select dorm type</option>
                    {allowedDormTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Distance</label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(event) =>
                      handleInputChange("distance", event.target.value)
                    }
                    placeholder="Example: 5 minutes from campus"
                  />
                </div>

                <div className="form-group">
                  <label>Contact</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(event) =>
                      handleInputChange("contact_phone", event.target.value)
                    }
                    placeholder="Example: +961 70 000 000"
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
                <label>Dorm Facilities</label>
                <input
                  type="text"
                  value={formData.facilitiesText}
                  onChange={(event) =>
                    handleInputChange("facilitiesText", event.target.value)
                  }
                  placeholder="Example: Wi-Fi, Laundry, Study Room, Parking"
                />
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

                  <button type="button" className="add-room-btn" onClick={addRoomRow}>
                    <i className="fa-solid fa-plus"></i>
                    Add Room
                  </button>
                </div>

                <div className="room-rows">
                  {formData.rooms.map((room, index) => {
                    const roomFacilityNames = facilityNames(room.facilities || []);

                    return (
                      <div className="room-row" key={room.room_id || index}>
                        <div className="form-group">
                          <label>Room Number</label>
                          <input
                            type="text"
                            value={room.room_number || ""}
                            onChange={(event) =>
                              handleRoomChange(index, "room_number", event.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Room Type</label>
                          <select
                            value={room.room_type || "Single Room"}
                            onChange={(event) =>
                              handleRoomChange(index, "room_type", event.target.value)
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
                              handleRoomChange(index, "room_capacity", event.target.value)
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
                              handleRoomChange(index, "room_price", event.target.value)
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
                          <label>Available From</label>
                          <input
                            type="date"
                            value={room.available_from || getTodayDateInput()}
                            onChange={(event) =>
                              handleRoomChange(
                                index,
                                "available_from",
                                event.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Available To</label>
                          <input
                            type="date"
                            value={room.available_to || getFutureDateInput(12)}
                            onChange={(event) =>
                              handleRoomChange(index, "available_to", event.target.value)
                            }
                            required
                          />
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
                              <img src={room.image_url} alt="Room" />
                            ) : (
                              <span>No image selected</span>
                            )}
                          </div>
                        </div>

                        <div className="form-group room-facilities-group">
                          <label>Room Facilities</label>

                          {["Wi-Fi", "Air Conditioning", "Laundry Access", "Parking"].map(
                            (facility) => (
                              <label className="facility-check" key={facility}>
                                <input
                                  type="checkbox"
                                  checked={roomFacilityNames.includes(facility)}
                                  onChange={(event) =>
                                    handleRoomFacilityChange(
                                      index,
                                      facility,
                                      event.target.checked
                                    )
                                  }
                                />{" "}
                                {facility}
                              </label>
                            )
                          )}
                        </div>

                        <button
                          type="button"
                          className="remove-room-btn"
                          onClick={() => removeRoomRow(index)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    );
                  })}
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
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  Save Dorm
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