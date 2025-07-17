// API Configuration for Next.js Backend
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-nextjs-backend.vercel.app"
    : "http://localhost:3000";

export const API_ENDPOINTS = {
  // User endpoints
  USER_REGISTER: `${API_BASE_URL}/api/user/register`,
  USER_LOGIN: `${API_BASE_URL}/api/user/login`,
  USER_PROFILE: `${API_BASE_URL}/api/user/get-profile`,
  USER_UPDATE_PROFILE: `${API_BASE_URL}/api/user/update-profile`,
  BOOK_APPOINTMENT: `${API_BASE_URL}/api/user/book-appointment`,
  USER_APPOINTMENTS: `${API_BASE_URL}/api/user/appointment`,
  CANCEL_APPOINTMENT: `${API_BASE_URL}/api/user/cancel-appointment`,

  // Doctor endpoints
  DOCTOR_LIST: `${API_BASE_URL}/api/doctors/list`,
  DOCTOR_LOGIN: `${API_BASE_URL}/api/doctor/login`,
  DOCTOR_BOOK_APPOINTMENT: `${API_BASE_URL}/api/doctor/book-appointment`,

  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_REGISTER: `${API_BASE_URL}/api/admin/register`,
  ADMIN_ALL_DOCTORS: `${API_BASE_URL}/api/admin/all-doctor`,
  ADMIN_APPOINTMENT_LIST: `${API_BASE_URL}/api/admin/appointment-list`,
  ADMIN_DASHBOARD_STATS: `${API_BASE_URL}/api/admin/dashboard-stats`,
  ADMIN_ADD_DOCTOR: `${API_BASE_URL}/api/admin/add-doctor`,
  ADMIN_CHANGE_AVAILABILITY: `${API_BASE_URL}/api/admin/change-availability`,
};

// CORS Configuration
export const CORS_ORIGINS = [
  "http://localhost:5173", // Frontend dev
  "https://prescripto-frontend-ecru.vercel.app", // Your deployed frontend
  "http://localhost:5174", // Admin panel dev
  "https://your-admin-panel.vercel.app", // Admin panel production
];
