import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    const returnPath = location.pathname + location.search;

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(returnPath)}`}
        replace
      />
    );
  }

  return children;
}