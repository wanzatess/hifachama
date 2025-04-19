import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import logo from "../../static/images/logo.png";
import "../../styles/Dashboard.css";

const DashboardLayout = () => {
  const { currentUser } = useAuth();

  // Ensure to extract role, chamaName, and balance from currentUser
  const role = currentUser?.role;
  const chamaType = currentUser?.chamaType; // Add chamaType here
  const chamaName = currentUser?.chamaName; // Add chamaName here
  const balance = currentUser?.balance || "0.00"; // Add balance here

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Pass required props to Sidebar */}
      <Sidebar 
        role={role} 
        chamaType={chamaType} 
        chamaName={chamaName} 
        balance={balance}
      />

      <div className="flex-1 ml-64">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed w-full z-10">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-8 mr-3" />
            <h1 className="text-xl font-semibold text-gray-800">
              Welcome, {currentUser?.name} {currentUser?.chamaId && `(${currentUser.chamaId})`}
            </h1>
          </div>
        </header>

        <main className="pt-16 h-screen overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
