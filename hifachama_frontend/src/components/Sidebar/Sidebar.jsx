import React, { useState } from 'react';
import { FaHome, FaMoneyBill, FaHandHoldingUsd, FaUsers, FaChartBar, FaCalendar, FaCreditCard, FaAngleDown } from "react-icons/fa";
import logo from '../../static/images/logo1.png';
import './Sidebar.css';

const Sidebar = ({ role, chamaName, setActiveSection, activeSection }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Define navigation links with dropdowns
  const navigationLinks = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FaHome />,
      dropdown: [
        { id: 'overview', label: 'Member List', icon: <FaUsers /> },
        { id: 'payment-details', label: 'Payment Details', icon: <FaCreditCard /> },
      ],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <FaMoneyBill />,
      dropdown: [
        { id: 'contributions', label: 'Contributions', icon: <FaMoneyBill /> },
        { id: 'withdrawals', label: 'Withdrawals', icon: <FaHandHoldingUsd /> },
        { id: 'approve-withdrawal', label: 'Approve a Withdrawal', icon: <FaHandHoldingUsd /> }
      ],
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: <FaCalendar />,
      dropdown: [
        { id: 'meetings', label: 'Meeting Schedule', icon: <FaCalendar /> },
        { id: 'schedule-meeting', label: 'Schedule a Meeting', icon: <FaCalendar /> },
      ],
    },
    {
      id: 'loans',
      label: 'Loans',
      icon: <FaCreditCard />,
      dropdown: [
        { id: 'loans', label: 'Request a Loan', icon: <FaCreditCard /> },
        { id: 'approve-loan', label: 'Approve a Loan', icon: <FaHandHoldingUsd /> },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FaChartBar />,
      dropdown: [
        { id: 'meeting-minutes', label: 'Meeting Minutes', icon: <FaChartBar /> },
        { id: 'contribution-reports', label: 'Contribution Reports', icon: <FaChartBar /> },
        { id: 'loan-reports', label: 'Loan Reports', icon: <FaChartBar /> },
      ],
    },
    {
      id: 'rotation',
      label: 'Rotation',
      icon: <FaUsers />,
      dropdown: [
        { id: 'rotation', label: 'Rotation Schedule', icon: <FaUsers /> },
        { id: 'rotation-details', label: 'Rotation Details', icon: <FaUsers /> },
      ],
    },
  ];

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <img
          src={logo}
          alt="Chama Logo"
          className="sidebar-logo"
          style={{
            maxWidth: '80%',
            margin: '1rem auto',
            display: 'block',
          }}
        />
      </div>

      <nav className="sidebar-nav">
        {navigationLinks.map((link) => (
          <div key={link.id} className="sidebar-dropdown">
            <button
              onClick={() => {
                if (link.dropdown) {
                  toggleDropdown(link.id);
                } else {
                  setActiveSection(link.id);
                }
              }}
              className={`sidebar-link ${activeSection === link.id ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span className="sidebar-label">{link.label}</span>
              {link.dropdown && (
                <span className={`dropdown-icon ${openDropdowns[link.id] ? 'open' : ''}`}>
                  <FaAngleDown />
                </span>
              )}
            </button>
            {link.dropdown && openDropdowns[link.id] && (
              <div className={`sidebar-dropdown-menu ${openDropdowns[link.id] ? 'open' : ''}`}>
                {link.dropdown.map((subLink) => (
                  <div key={subLink.id} className="sidebar-sub-dropdown">
                    <button
                      onClick={() => setActiveSection(subLink.id)}
                      className={`sidebar-link ${activeSection === subLink.id ? 'active' : ''}`}
                    >
                      <span className="sidebar-icon">{subLink.icon}</span>
                      <span className="sidebar-label">{subLink.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;