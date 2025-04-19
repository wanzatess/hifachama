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
        {/* Main content area: cards will be rendered here */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;