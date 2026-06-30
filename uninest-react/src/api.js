const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${endpoint}`);
  }

  return response.json();
}

export { API_BASE_URL };

// Dorms
export function getDorms() {
  return request("/dorms");
}

export function getDorm(dorm_id) {
  return request(`/dorms/${dorm_id}`);
}

// Rooms
export function getRooms() {
  return request("/rooms");
}

export function getRoom(room_id) {
  return request(`/rooms/${room_id}`);
}

// Bookings
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
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Residents
export function getResidents() {
  return request("/residents");
}

// Payments
export function getPayments() {
  return request("/payments");
}

export function createPayment(data) {
  return request("/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Documents
export function getDocuments() {
  return request("/documents");
}

export function createDocument(data) {
  return request("/documents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Maintenance
export function getMaintenanceRequests() {
  return request("/maintenance-requests");
}

export function createMaintenanceRequest(data) {
  return request("/maintenance-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMaintenanceStaff() {
  return request("/maintenance-staff");
}

// Reviews
export function getReviews() {
  return request("/reviews");
}

export function createReview(data) {
  return request("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Images
export function getImages() {
  return request("/images");
}