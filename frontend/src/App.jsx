import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ListingDetail from './pages/ListingDetail';
import BookingConfirmation from './pages/BookingConfirmation';
import AdminDashboard from './pages/AdminDashboard';
import HostDashboard from './pages/HostDashboard';
import UserDashboard from './pages/UserDashboard';
import Unauthorized from './pages/Unauthorized';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute roles={[ 'admin' ]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host-dashboard"
              element={
                <ProtectedRoute roles={[ 'host', 'admin' ]}>
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute roles={[ 'user', 'host', 'admin' ]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-confirmation"
              element={
                <ProtectedRoute roles={[ 'user', 'host', 'admin' ]}>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </main>
        <footer className="bg-gray-100 mt-12 py-8 text-center text-gray-600">
          <p>&copy; 2026 Vacation Booking System. All rights reserved.</p>
        </footer>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
