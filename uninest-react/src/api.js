const API_BASE_URL = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error("API request failed:", {
        url,
        status: response.status,
        responseText,
      });

      throw new Error(responseText || `Request failed: ${endpoint}`);
    }

    if (!responseText) {
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  } catch (error) {
    console.error("API connection error:", {
      url,
      error,
    });

    throw error;
  }
}

export { API_BASE_URL };

/* =========================
   Admins
========================= */

export function getAdmins() {
  return request("/admins");
}

export function getAdmin(admin_id) {
  return request(`/admins/${admin_id}`);
}

export function createAdmin(data) {
  return request("/admins", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAdmin(admin_id, data) {
  return request(`/admins/${admin_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAdmin(admin_id) {
  return request(`/admins/${admin_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Dorms
========================= */

export function getDorms() {
  return request("/dorms");
}

export function getDorm(dorm_id) {
  return request(`/dorms/${dorm_id}`);
}

export function createDorm(data) {
  return request("/dorms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDorm(dorm_id, data) {
  return request(`/dorms/${dorm_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteDorm(dorm_id) {
  return request(`/dorms/${dorm_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Rooms
========================= */

export function getRooms() {
  return request("/rooms");
}

export function getRoom(room_id) {
  return request(`/rooms/${room_id}`);
}

export function createRoom(data) {
  return request("/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoom(room_id, data) {
  return request(`/rooms/${room_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoom(room_id) {
  return request(`/rooms/${room_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Bookings
========================= */

export function getBookings() {
  return request("/bookings");
}

export function getBooking(booking_id) {
  return request(`/bookings/${booking_id}`);
}

export function createBooking(data) {
  return request("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateBooking(booking_id, data) {
  return request(`/bookings/${booking_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteBooking(booking_id) {
  return request(`/bookings/${booking_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Residents
========================= */

export function getResidents() {
  return request("/residents");
}

export function getResident(resident_id) {
  return request(`/residents/${resident_id}`);
}

export function createResident(data) {
  return request("/residents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateResident(resident_id, data) {
  return request(`/residents/${resident_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteResident(resident_id) {
  return request(`/residents/${resident_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Payments
========================= */

export function getPayments() {
  return request("/payments");
}

export function getPayment(payment_id) {
  return request(`/payments/${payment_id}`);
}

export function createPayment(data) {
  return request("/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePayment(payment_id, data) {
  return request(`/payments/${payment_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deletePayment(payment_id) {
  return request(`/payments/${payment_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Documents
========================= */

export function getDocuments() {
  return request("/documents");
}

export function getDocument(document_id) {
  return request(`/documents/${document_id}`);
}

export function createDocument(data) {
  return request("/documents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDocument(document_id, data) {
  return request(`/documents/${document_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteDocument(document_id) {
  return request(`/documents/${document_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Maintenance Requests
========================= */

export function getMaintenanceRequests() {
  return request("/maintenance-requests");
}

export function getMaintenanceRequest(maintenance_request_id) {
  return request(`/maintenance-requests/${maintenance_request_id}`);
}

export function createMaintenanceRequest(data) {
  return request("/maintenance-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMaintenanceRequest(maintenance_request_id, data) {
  return request(`/maintenance-requests/${maintenance_request_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteMaintenanceRequest(maintenance_request_id) {
  return request(`/maintenance-requests/${maintenance_request_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Maintenance Staff
========================= */

export function getMaintenanceStaff() {
  return request("/maintenance-staff");
}

export function getMaintenanceStaffMember(maintenance_id) {
  return request(`/maintenance-staff/${maintenance_id}`);
}

export function createMaintenanceStaff(data) {
  return request("/maintenance-staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMaintenanceStaff(maintenance_id, data) {
  return request(`/maintenance-staff/${maintenance_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteMaintenanceStaff(maintenance_id) {
  return request(`/maintenance-staff/${maintenance_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Reviews
========================= */

export function getReviews() {
  return request("/reviews");
}

export function getReview(review_id) {
  return request(`/reviews/${review_id}`);
}

export function createReview(data) {
  return request("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateReview(review_id, data) {
  return request(`/reviews/${review_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteReview(review_id) {
  return request(`/reviews/${review_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Images
========================= */

export function getImages() {
  return request("/images");
}

export function getImage(image_id) {
  return request(`/images/${image_id}`);
}

export function createImage(data) {
  return request("/images", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateImage(image_id, data) {
  return request(`/images/${image_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteImage(image_id) {
  return request(`/images/${image_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Notifications
========================= */

export function getNotifications() {
  return request("/notifications");
}

export function getNotification(notification_id) {
  return request(`/notifications/${notification_id}`);
}

export function createNotification(data) {
  return request("/notifications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateNotification(notification_id, data) {
  return request(`/notifications/${notification_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteNotification(notification_id) {
  return request(`/notifications/${notification_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Facilities
========================= */

export function getFacilities() {
  return request("/facilities");
}

export function getFacility(facility_id) {
  return request(`/facilities/${facility_id}`);
}

export function createFacility(data) {
  return request("/facilities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateFacility(facility_id, data) {
  return request(`/facilities/${facility_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteFacility(facility_id) {
  return request(`/facilities/${facility_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Room Availabilities
========================= */

export function getRoomAvailabilities() {
  return request("/room-availabilities");
}

export function getRoomAvailability(availability_id) {
  return request(`/room-availabilities/${availability_id}`);
}

export function createRoomAvailability(data) {
  return request("/room-availabilities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoomAvailability(availability_id, data) {
  return request(`/room-availabilities/${availability_id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoomAvailability(availability_id) {
  return request(`/room-availabilities/${availability_id}`, {
    method: "DELETE",
  });
}

/* =========================
   Room Facilities
========================= */

export function getRoomFacilities() {
  return request("/room-facilities");
}

export function getRoomFacility(room_id, facility_id) {
  return request(`/room-facilities/${room_id}/${facility_id}`);
}

export function createRoomFacility(data) {
  return request("/room-facilities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteRoomFacility(room_id, facility_id) {
  return request(`/room-facilities/${room_id}/${facility_id}`, {
    method: "DELETE",
  });
}