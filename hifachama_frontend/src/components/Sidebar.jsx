import { Link, useLocation } from "react-router-dom";
import logo from "../static/images/logo.png";
import { useState } from "react";
import {
  FaHome, FaMoneyBill, FaHandHoldingUsd, FaUsers,
  FaChartBar, FaCog, FaBars, FaTimes, FaWallet
} from "react-icons/fa";
import '../styles/Sidebar.css';

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
    <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed ? (
          <div className="sidebar-brand">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <span>HIFACHAMA</span>
          </div>
        ) : (
          <img src={logo} alt="Logo" className="sidebar-logo" />
        )}
        <button
          className="sidebar-tool-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="sidebar-profile">
          <h3>{chamaName || "My Group"}</h3>
          <p>Balance: KES {balance || "0.00"}</p>
        </div>
      )}

      <nav className="sidebar-list">
        {navigationLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${pathname.startsWith(link.path) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{link.icon}</span>
            {!isCollapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
