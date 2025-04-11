// Update ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If user tries to access root but has a chama, redirect to dashboard
  if (window.location.pathname === '/' && user?.chama_id) {
    return <Navigate to={`/dashboard/chama/${user.chama_id}`} />;
  }

  return children;
};

export default ProtectedRoute;