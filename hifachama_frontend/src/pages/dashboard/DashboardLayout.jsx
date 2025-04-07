// DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import "../../styles/Dashboard.css";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <main>
        <Outlet />
      </main>
    </div>
  );
};
export default DashboardLayout;
