
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireAuth from "./utils/RequireAuth";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Customer pages
import Home from "./pages/Home/Home";
import Farmhouses from "./pages/Farmhouses/Farmhouses";
import FarmhouseDetails from "./pages/FarmhouseDetails/FarmhouseDetails";
import Booking from "./pages/Booking/Booking";
import BookingConfirmation from "./pages/Booking/BookingConfirmation";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import MyBookings from "./pages/MyBookings/MyBookings";

// Owner pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerLayout from "./components/owner/OwnerLayout";
import OwnerBookings from "./pages/owner/OwnerBookings";
import OwnerPayments from "./pages/owner/OwnerPayments";
import OwnerProfile from "./pages/owner/OwnerProfile";
import OwnerFarmhouseCalendar from "./pages/owner/OwnerFarmhouseCalendar";
import OwnerFarmhouseAddons from "./pages/owner/OwnerFarmhouseAddons";
import OwnerFarmhouses from "./pages/owner/OwnerFarmhouses";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminOwners from "./pages/Admin/AdminOwners";
import AdminFarmhouses from "./pages/Admin/AdminFarmhouses";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminPayments from "./pages/Admin/AdminPayments";
import AdminCustomers from "./pages/Admin/AdminCustomers";
import AdminFarmhouseCalendar from "./pages/Admin/AdminFarmhouseCalendar";
import AdminFarmhouseAddons from "./pages/Admin/AdminFarmhouseAddons";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />

                <Routes>
                    {/* Public pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/farmhouses" element={<Farmhouses />} />

                    <Route
                        path="/farmhouses/:id"
                        element={
                            <RequireAuth>
                                <FarmhouseDetails />
                            </RequireAuth>
                        }
                    />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Customer protected pages */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/booking/:id" element={<Booking />} />
                        <Route
                            path="/booking-confirmation/:reference"
                            element={<BookingConfirmation />}
                        />
                        <Route path="/my-bookings" element={<MyBookings />} />
                    </Route>

                    {/* Owner protected routes */}
<Route element={<ProtectedRoute allowedRoles={["OWNER"]} />}>
    <Route path="/owner" element={<OwnerLayout />}>
        <Route path="dashboard" element={<OwnerDashboard />} />

        <Route path="farmhouses" element={<OwnerFarmhouses />} />

        <Route path="bookings" element={<OwnerBookings />} />

        <Route path="payments" element={<OwnerPayments />} />

        <Route path="profile" element={<OwnerProfile />} />

        <Route
            path="farmhouses/:id/calendar"
            element={<OwnerFarmhouseCalendar />}
        />

        <Route
            path="farmhouses/:id/addons"
            element={<OwnerFarmhouseAddons />}
        />
    </Route>
</Route>

                    {/* Admin protected routes */}
                    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="owners" element={<AdminOwners />} />
                            <Route path="farmhouses" element={<AdminFarmhouses />} />
                            <Route path="bookings" element={<AdminBookings />} />
                            <Route path="payments" element={<AdminPayments />} />
                            <Route path="customers" element={<AdminCustomers />} />

                            <Route
                                path="farmhouses/:id/calendar"
                                element={<AdminFarmhouseCalendar />}
                            />

                            <Route
                                path="farmhouses/:id/addons"
                                element={<AdminFarmhouseAddons />}
                            />
                        </Route>
                    </Route>
                </Routes>

                <Footer />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
