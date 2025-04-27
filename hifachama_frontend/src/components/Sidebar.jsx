import React, { useState } from 'react';
import logo from "../static/images/logo.png";
import {
  FaHome,
  FaMoneyBill,
  FaHandHoldingUsd,
  FaUsers,
  FaChartBar,
  FaCalendar,
  FaCreditCard
} from "react-icons/fa";
import '../styles/Sidebar.css';

const Sidebar = ({ role, chamaType, chamaName, balance, setActiveSection, paymentDetails, activeSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define your default navigation links
  const navigationLinks = [
    { id: 'overview', label: 'Overview', icon: <FaHome /> },
    { id: 'contributions', label: 'Contributions', icon: <FaMoneyBill /> },
    { id: 'withdrawals', label: 'Withdrawals', icon: <FaHandHoldingUsd /> },
    { id: 'rotation', label: 'Rotation', icon: <FaUsers /> },
    { id: 'reports', label: 'Reports', icon: <FaChartBar /> },
    { id: 'meetings', label: 'Meetings', icon: <FaCalendar /> },
    { id: 'loans', label: 'Loans', icon: <FaCreditCard /> },  // Always visible
  ];

  // Conditional Links for Chairperson, Treasurer, and Secretary
  const roleBasedLinks = {
    Chairperson: [
      { id: 'loan-approval', label: 'Loan Approval', icon: <FaHandHoldingUsd /> },
      { id: 'view-loans', label: 'View Loans', icon: <FaCreditCard /> },
    ],
    Treasurer: [
      { id: 'manage-contributions', label: 'Manage Contributions', icon: <FaMoneyBill /> },
      { id: 'approve-withdrawals', label: 'Approve Withdrawals', icon: <FaHandHoldingUsd /> },
    ],
    Secretary: [
      { id: 'schedule-meetings', label: 'Schedule Meetings', icon: <FaCalendar /> },
      { id: 'edit-reports', label: 'Edit Reports', icon: <FaChartBar /> },
    ],
  };

  const getRoleLinks = () => {
    return roleBasedLinks[role] || []; // Return links based on the role
  };

  return (
    <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-brand">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <span>HIFACHAMA</span>
          </div>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? ">" : "<"}
        </button>
      </div>

      {!isCollapsed && (
        <div className="sidebar-profile">
          <h3>{chamaName}</h3>
          {paymentDetails ? (
            <>
              <p>PayBill/Till: {paymentDetails.payBillTill}</p>
              <p>Phone Number: {paymentDetails.phoneNumber}</p>
            </>
          ) : (
            <p>No payment details available</p>
          )}
        </div>
      )}

      <nav className="sidebar-nav">
        {/* Render default navigation links */}
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

        {/* Role-based links */}
        {getRoleLinks().map((link) => (
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
  );
};

export default Sidebar;
