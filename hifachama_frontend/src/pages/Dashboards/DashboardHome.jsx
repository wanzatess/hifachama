import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.hasChama) {
      navigate(`/chama/${user.chamaId}`); // Redirect existing members
    }
  }, [user, navigate]);

  return null; // Just a redirect wrapper
};

export default DashboardHome;
