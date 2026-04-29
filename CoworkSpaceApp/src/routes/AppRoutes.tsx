import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import RoomsPage from '../pages/rooms/RoomsPage';
import RoomDetailPage from '../pages/rooms/RoomDetailPage';
import RoomFormPage from '../pages/rooms/RoomFormPage';
import MyRoomsPage from '../pages/rooms/MyRoomsPage';
import BookingsPage from '../pages/bookings/BookingsPage';
import MyRoomsBookingsPage from '../pages/bookings/MyRoomsBookingsPage';
import AdminRoomsPage from '../pages/admin/AdminRoomsPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';
import ProfilePage from '../pages/profile/ProfilePage';



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

        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/rooms/new" element={<PrivateRoute><RoomFormPage /></PrivateRoute>} />
        <Route path="/rooms/:id/edit" element={<PrivateRoute><RoomFormPage /></PrivateRoute>} />
        <Route path="/rooms/my" element={<PrivateRoute><MyRoomsPage /></PrivateRoute>} />

        <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
        <Route path="/bookings/my-rooms" element={<PrivateRoute><MyRoomsBookingsPage /></PrivateRoute>} />

        <Route path="/admin/rooms" element={<AdminRoute><AdminRoomsPage /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />

        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/rooms" />} />
      </Routes>
    </BrowserRouter>
  );
}