import { Outlet, NavLink } from "react-router-dom";
import { 
  FaHome, 
  FaUsers, 
  FaCalendarAlt, 
  FaWallet, 
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaExchangeAlt,
  FaChartLine,
  FaHeart,
  FaBullseye,
  FaBars,
  FaTimes,
  FaBell,
  FaCog
} from "react-icons/fa";
import { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import logo from "../../static/images/logo.png";

const navigationItems = [
  { to: "", icon: <FaHome />, label: "Home" },
  { to: "membership", icon: <FaUsers />, label: "Membership" },
  { to: "meetings", icon: <FaCalendarAlt />, label: "Meetings" },
  { to: "accounts", icon: <FaWallet />, label: "Accounts" },
  { to: "loans", icon: <FaMoneyBillWave />, label: "Loans" },
  { to: "soft-loans", icon: <FaHandHoldingUsd />, label: "Soft Loans" },
  { to: "merry-go-round", icon: <FaExchangeAlt />, label: "Merry Go Round" },
  { to: "shares", icon: <FaChartLine />, label: "Shares" },
  { to: "welfare", icon: <FaHeart />, label: "Welfare" },
  { to: "goals", icon: <FaBullseye />, label: "Goals" }
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 transition-all duration-300 h-screen fixed`}>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="h-8 w-8" />
              <span className="ml-2 text-xl font-semibold text-[#4E4528]">TESSIE</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center px-4 py-3 mb-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3 text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed w-full z-10">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Good Afternoon {user?.name} - {user?.chamaId || 'TES1100'}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-gray-500 hover:text-gray-700 relative">
              <FaBell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || "/default-avatar.png"}
                alt="Profile"
                className="h-8 w-8 rounded-full border-2 border-gray-200"
              />
              {user?.role === 'admin' && (
                <button className="text-gray-500 hover:text-gray-700">
                  <FaCog size={20} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16 h-screen overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}