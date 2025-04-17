import { Outlet, NavLink } from "react-router-dom";
import { 
  FaWallet, 
  FaUsers, 
  FaMoneyCheck, 
  FaHome, 
  FaEnvelope, 
  FaCog, 
  FaBars, 
  FaTimes,
  FaChartLine,
  FaHandshake,
  FaFileAlt
} from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";  // Adjusted import path

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();  // Using the user context

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-[#4E4528] text-white flex flex-col transition-all duration-300 fixed h-full`}
      >
        {/* Logo and Toggle */}
        <div className="p-4 border-b border-[#9C8F5F] flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Chamasoft Logo" 
                className="h-8 mr-2"
              />
              <span className="text-xl font-bold">Chamasoft</span>
            </div>
          ) : (
            <img 
              src="/logo-icon.png" 
              alt="Chamasoft Icon" 
              className="h-8 mx-auto"
            />
          )}
          <button
            className="text-white hover:text-[#CDBE96]"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>

        {/* Chama Info (only shown when expanded) */}
        {sidebarOpen && (
          <div className="p-4 border-b border-[#9C8F5F]">
            <h3 className="font-semibold">{user?.currentChama?.name || "My Chama"}</h3>
            <p className="text-sm text-[#CDBE96]">
              {user?.currentChama?.type || "Merry-go-round"}
            </p>
            <div className="mt-2">
              <p className="text-xs text-[#F0EAD6]">Current Balance:</p>
              <p className="font-bold">
                KES {user?.currentChama?.balance?.toLocaleString() || "0.00"}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="" icon={<FaHome />} label="Dashboard" sidebarOpen={sidebarOpen} />
          <NavItem to="wallet" icon={<FaWallet />} label="E-Wallet" sidebarOpen={sidebarOpen} />
          <NavItem to="contributions" icon={<FaMoneyCheck />} label="Contributions" sidebarOpen={sidebarOpen} />
          <NavItem to="withdrawals" icon={<FaHandshake />} label="Withdrawals" sidebarOpen={sidebarOpen} />
          <NavItem to="loans" icon={<FaFileAlt />} label="Loans" sidebarOpen={sidebarOpen} />
          <NavItem to="members" icon={<FaUsers />} label="Members" sidebarOpen={sidebarOpen} />
          <NavItem to="reports" icon={<FaChartLine />} label="Reports" sidebarOpen={sidebarOpen} />
          <NavItem to="messages" icon={<FaEnvelope />} label="Messages" sidebarOpen={sidebarOpen} />
          
          {/* Admin-only items */}
          {(user?.role === 'admin' || user?.role === 'chairperson') && (
            <NavItem to="settings" icon={<FaCog />} label="Settings" sidebarOpen={sidebarOpen} />
          )}
        </nav>

        {/* Collapsed Footer */}
        {!sidebarOpen && (
          <div className="p-2 border-t border-[#9C8F5F] text-center">
            <button onClick={toggleSidebar} className="text-[#F0EAD6] hover:text-white">
              <FaBars size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${
        sidebarOpen ? "ml-64" : "ml-20"
      }`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, sidebarOpen }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center p-3 rounded-lg transition ${
          isActive 
            ? "bg-[#CDBE96] text-[#4E4528] font-semibold" 
            : "text-[#F0EAD6] hover:bg-[#9C8F5F] hover:text-white"
        }`
      }
    >
      <span className={`${sidebarOpen ? "mr-3" : "mx-auto"}`}>
        {icon}
      </span>
      {sidebarOpen && (
        <span className="whitespace-nowrap">{label}</span>
      )}
    </NavLink>
  );
}
