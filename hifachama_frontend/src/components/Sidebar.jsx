import React, { useState } from 'react';
import logo from "../static/images/logo.png";
import {
  FaHome,
  FaMoneyBill,
  FaHandHoldingUsd,
  FaUsers,
  FaChartBar,
  FaCalendar,
  FaCreditCard,
  FaCreditCard as FaPayment
} from "react-icons/fa";
import '../styles/Sidebar.css';

const Sidebar = ({ role, chamaType, chamaName, balance, setActiveSection, paymentDetails, activeSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define default navigation links
  const navigationLinks = [
    { id: 'overview', label: 'Overview', icon: <FaHome /> },
    { id: 'contributions', label: 'Contributions', icon: <FaMoneyBill /> },
    { id: 'withdrawals', label: 'Withdrawals', icon: <FaHandHoldingUsd /> },
    { id: 'rotation', label: 'Rotation', icon: <FaUsers /> },
    { id: 'reports', label: 'Reports', icon: <FaChartBar /> },
    { id: 'meetings', label: 'Meetings', icon: <FaCalendar /> },
    { id: 'loans', label: 'Loans', icon: <FaCreditCard /> },
  ];

  // Conditional Links for Chairperson, Treasurer, and Secretary
  const roleBasedLinks = {
    Chairperson: [
      { id: 'paymentDetails', label: 'Payment Details', icon: <FaPayment /> },
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
    return roleBasedLinks[role] || [];
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
          <h3>{chamaName || 'Chama'}</h3>
          {paymentDetails ? (
            <div className="payment-details">
              {paymentDetails.paybill_number && (
                <p><strong>PayBill:</strong> {paymentDetails.paybill_number}</p>
              )}
              {paymentDetails.till_number && (
                <p><strong>Till:</strong> {paymentDetails.till_number}</p>
              )}
              {paymentDetails.phone_number && (
                <p><strong>Phone:</strong> {paymentDetails.phone_number}</p>
              )}
              {paymentDetails.bank_account && (
                <p><strong>Bank:</strong> {paymentDetails.bank_account}</p>
              )}
              {!paymentDetails.paybill_number && !paymentDetails.till_number &&
               !paymentDetails.phone_number && !paymentDetails.bank_account && (
                <p>No payment details available.</p>
              )}
            </div>
          ) : (
            <p>No payment details available.</p>
          )}
          {balance !== undefined && (
            <p><strong>Balance:</strong> {balance} KES</p>
          )}
        </div>
      )}

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