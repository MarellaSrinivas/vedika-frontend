
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireAuth from "./utils/RequireAuth";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home/Home";
import Farmhouses from "./pages/Farmhouses/Farmhouses";
import FarmhouseDetails from "./pages/FarmhouseDetails/FarmhouseDetails";
import Booking from "./pages/Booking/Booking";
import BookingConfirmation from "./pages/Booking/BookingConfirmation";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import MyBookings from "./pages/MyBookings/MyBookings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/farmhouses" element={<Farmhouses />} />
          <Route path="/farmhouses/:id" element={ <RequireAuth>
      <FarmhouseDetails />
    </RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Pages requiring login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/booking/:id" element={<Booking />} />
            <Route
              path="/booking-confirmation/:reference"
              element={<BookingConfirmation />}
            />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>
        </Routes>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
