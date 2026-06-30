const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getDorms() {
  const response = await fetch(`${API_BASE_URL}/dorms`);

  if (!response.ok) {
    throw new Error("Failed to fetch dorms");
  }

  return response.json();
}

export async function getRooms() {
  const response = await fetch(`${API_BASE_URL}/rooms`);

  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }

  return response.json();
}

export async function getBookings() {
  const response = await fetch(`${API_BASE_URL}/bookings`);

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}