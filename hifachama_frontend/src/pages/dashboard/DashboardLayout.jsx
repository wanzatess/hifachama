import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import logo from "../../static/images/logo.png";
import "../../styles/Dashboard.css";

const DashboardLayout = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="header">
        <img src={logo} alt="Logo" className="h-8 w-8 mr-3" />
        <h1>Welcome, {currentUser?.name} {currentUser?.chamaId && `(${currentUser.chamaId})`}</h1>
      </header>

      <Sidebar />

      <div className="main-content">
        <div className="card-grid">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;