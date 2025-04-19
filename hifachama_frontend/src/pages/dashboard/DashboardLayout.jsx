import { Outlet, NavLink } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import DashboardCards from "./DashboardCards";
import Sidebar from "../../components/Sidebar";  // Update this line
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
  const { user } = useAuth();
  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar is now a separate component */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 fixed top-0 right-0 left-0 z-40 ml-20 lg:ml-64 transition-all duration-300">
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.name} – {user?.chamaName} (ID: {user?.chamaId})
          </h1>
        </header>

        {/* Main Content */}
        <main className="pt-16 h-full overflow-y-auto transition-all duration-300 ml-20 lg:ml-64">
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