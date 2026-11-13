
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
    const { user } = useAuth();
    const location = useLocation();

    const token = localStorage.getItem("thevedika_token");

    if (!token || !user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // If no roles are specified, authentication alone is sufficient.
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === "OWNER") {
            return <Navigate to="/owner/dashboard" replace />;
        }

        if (user.role === "ADMIN") {
            return <Navigate to="/admin/dashboard" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
