import { Outlet, NavLink } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import DashboardCards from "../pages/dashboard/DashboardCards";
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
        <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200">
          <img src={logo} alt="Logo" className="h-8 w-8" />
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
                  ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
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
        {/* ✅ Top Bar (Minimal Welcome) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 fixed w-full z-10 ml-64">
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.name} – {user?.chamaName} (ID: {user?.chamaId})
          </h1>
        </header>

        {/* Main Content */}
        <main className="pt-16 h-screen overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route index element={<DashboardCards />} />
            <Route path="*" element={<Outlet />} />
          </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}