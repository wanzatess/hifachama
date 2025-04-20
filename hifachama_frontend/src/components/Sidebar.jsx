import React, { useState } from 'react';
import logo from "../static/images/logo.png";
import {
  FaHome,
  FaMoneyBill,
  FaHandHoldingUsd,
  FaUsers,
  FaChartBar,
  FaBars,
  FaTimes
} from "react-icons/fa";
import '../styles/Sidebar.css';

const Sidebar = ({ role, chamaType, chamaName, balance, setActiveSection, activeSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationLinks = [
    { id: 'overview', label: 'Overview', icon: <FaHome /> },
    { id: 'contributions', label: 'Contributions', icon: <FaMoneyBill /> },
    { id: 'withdrawals', label: 'Withdrawals', icon: <FaHandHoldingUsd /> },
    { id: 'rotation', label: 'Rotation', icon: <FaUsers /> },
    { id: 'reports', label: 'Reports', icon: <FaChartBar /> },
  ];

  return (
    <>
      <div className="top-header">
        <div className="header-content">
          <div className="header-brand">
            <img src={logo} alt="Logo" className="header-logo" />
            <span className="header-title">HIFACHAMA</span>
          </div>
          <div className="header-info">
            <h3>{chamaName || "My Chama"}</h3>
            <p>Balance: KES {balance?.toLocaleString() || "0.00"}</p>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>
      </div>

      <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
        <nav className="sidebar-nav">
          {navigationLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveSection(link.id)}
              className={`sidebar-link ${activeSection === link.id ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{link.icon}</span>
              {!isCollapsed && <span className="sidebar-label">{link.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;