// DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import "../../styles/Dashboard.css";

const DashboardLayout = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main-container">
        {/* Remove any top navigation/header here */}
        <main className="dashboard-content">
          {/* Page content cards/components */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
