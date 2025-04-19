// DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import logo from "../../static/images/logo.png";
import "../../styles/Dashboard.css";

const DashboardLayout = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main-container">
        <header className="dashboard-header">
          <div className="header-content">
            <img src={logo} alt="Logo" className="logo" />
            <h1 className="dashboard-title">
              Welcome, {currentUser?.name}{' '}
              {currentUser?.chamaId && `(${currentUser.chamaId})`}
            </h1>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="dashboard-cards-grid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;