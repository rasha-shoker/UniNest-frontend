import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import HousingsPage from "./components/HousingsPage";
import HousingDetailsPage from "./components/HousingDetailsPage";
import BookingPage from "./components/BookingPage";
import MyBookingsPage from "./components/MyBookingsPage";
import StudentDashboardPage from "./components/StudentDashboardPage";
import PaymentPage from "./components/PaymentPage";
import MaintenancePage from "./components/MaintenancePage";
import NotificationsPage from "./components/NotificationsPage";
import ProfilePage from "./components/ProfilePage";
import ReviewPage from "./components/ReviewPage";
import AdminDashboardPage from "./components/AdminDashboardPage";
import ManageHousingsPage from "./components/ManageHousingsPage";
import ManageBookingsPage from "./components/ManageBookingsPage";
import ManageStudentsPage from "./components/ManageStudentsPage";
import ManageMaintenancePage from "./components/ManageMaintenancePage";
import ManageReviewsPage from "./components/ManageReviewsPage";
import ReportsPage from "./components/ReportsPage";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/housings" element={<HousingsPage />} />
        <Route path="/housing-details" element={<HousingDetailsPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/student-dashboard" element={<StudentDashboardPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/manage-housings" element={<ManageHousingsPage />} />
        <Route path="/manage-bookings" element={<ManageBookingsPage />} />
        <Route path="/manage-students" element={<ManageStudentsPage />} />
        <Route path="/manage-maintenance" element={<ManageMaintenancePage />} />
        <Route path="/manage-reviews" element={<ManageReviewsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;