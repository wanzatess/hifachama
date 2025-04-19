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
  FaFileAlt,
  FaGlobe,
  FaBell
} from "react-icons/fa";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 fixed w-full z-10">
        <div className="flex items-center">
          <button className="text-gray-600 hover:text-[#4E4528] mr-4" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
          <select className="border-none bg-transparent text-blue-500">
            <option>QUICK ACTIONS</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <FaBell className="text-gray-600" />
          <select className="border-none bg-transparent">
            <option>English</option>
            <option>Swahili</option>
          </select>
          <div className="flex items-center">
            <img src={user?.avatar || "/default-avatar.png"} alt="User" className="h-8 w-8 rounded-full" />
            <span className="ml-2 text-gray-700">{user?.name || "User"}</span>
          </div>
        </div>
      </header>

      <div className="flex pt-16 h-full">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white text-gray-800 border-r border-gray-200 flex flex-col transition-all duration-300 fixed h-full`}>
          {/* Logo and Toggle */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center">
                <img src="/logo.png" alt="Logo" className="h-8 mr-2" />
                <span className="text-xl font-bold text-[#4E4528]">Chamasoft</span>
              </div>
            ) : (
              <img src="/logo-icon.png" alt="Icon" className="h-8 mx-auto" />
            )}
            <button className="text-gray-600 hover:text-[#4E4528]" onClick={toggleSidebar}>
              {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>

          {/* Group Info */}
          {sidebarOpen && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-lg">{user?.currentChama?.name || "My Group"}</h3>
              <p className="text-sm text-gray-500">
                {user?.currentChama?.type || "Hybrid"}
              </p>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Current Balance:</p>
                <p className="font-bold text-[#4E4528]">
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
            
            {['admin', 'chairperson'].includes(user?.role) && (
              <NavItem to="settings" icon={<FaCog />} label="Settings" sidebarOpen={sidebarOpen} />
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
          <div className="p-6 bg-gray-100 min-h-full">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
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
            ? "bg-[#4E4528] text-white font-semibold" 
            : "text-gray-600 hover:bg-gray-100 hover:text-[#4E4528]"
        }`
      }
    >
      <span className={`${sidebarOpen ? "mr-3" : "mx-auto"}`}>
        {icon}
      </span>
      {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
  );
}