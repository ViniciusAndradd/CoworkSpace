import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import RoomsPage from '../pages/rooms/RoomsPage';
import RoomDetailPage from '../pages/rooms/RoomDetailPage';
import BookingsPage from '../pages/bookings/BookingsPage';
import AdminRoomsPage from '../pages/admin/AdminRoomsPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/rooms" />;
  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/rooms" element={<PrivateRoute><RoomsPage /></PrivateRoute>} />
        <Route path="/rooms/:id" element={<PrivateRoute><RoomDetailPage /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />

        <Route path="/admin/rooms" element={<AdminRoute><AdminRoomsPage /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/rooms" />} />
      </Routes>
    </BrowserRouter>
  );
}