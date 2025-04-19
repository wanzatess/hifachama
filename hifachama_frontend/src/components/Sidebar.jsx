import { Link, useLocation } from "react-router-dom";
import logo from "../static/images/logo.png";
import { useState } from "react";
import {
  FaHome,
  FaMoneyBill,
  FaHandHoldingUsd,
  FaUsers,
  FaChartBar,
  FaCog,
  FaBars,
  FaTimes,
  FaWallet
} from "react-icons/fa";

const Sidebar = ({ role, chamaType, chamaName, balance }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { pathname } = useLocation();

  const baseLinks = [
    { path: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/wallet", label: "E-Wallet", icon: <FaWallet /> },
  ];

  const roleBasedLinks = [];

  if (["chairperson", "treasurer", "member"].includes(role)) {
    roleBasedLinks.push({ path: "/contributions", label: "Contributions", icon: <FaMoneyBill /> });
  }

  if (["treasurer", "member"].includes(role)) {
    roleBasedLinks.push({ path: "/withdrawals", label: "Withdrawals", icon: <FaHandHoldingUsd /> });
  }

  if (["chairperson", "secretary"].includes(role)) {
    roleBasedLinks.push({ path: "/members", label: "Members", icon: <FaUsers /> });
  }

  if (["Hybrid", "Investment"].includes(chamaType)) {
    roleBasedLinks.push({ path: "/reports", label: "Reports", icon: <FaChartBar /> });
  }

  if (role === "chairperson") {
    roleBasedLinks.push({ path: "/settings", label: "Settings", icon: <FaCog /> });
  }

  const navigationLinks = [...baseLinks, ...roleBasedLinks];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo and Toggle */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between h-16">
        {!isCollapsed ? (
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 mr-2" />
            <span className="text-xl font-bold text-[#4E4528]">HIFACHAMA</span>
          </div>
        ) : (
          <img src={logo} alt="Logo" className="h-8 mx-auto" />
        )}
        <button
          className="text-gray-600 hover:text-[#4E4528]"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-lg">{chamaName || "My Group"}</h3>
          <p className="text-sm text-gray-500">Balance: KES {balance || "0.00"}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {navigationLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center p-3 mb-2 rounded-lg transition
              ${pathname.startsWith(link.path)
                ? "bg-[#4E4528] text-white"
                : "text-gray-600 hover:bg-gray-100"}`}
          >
            <span className={`text-xl ${!isCollapsed && 'mr-3'}`}>{link.icon}</span>
            {!isCollapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
