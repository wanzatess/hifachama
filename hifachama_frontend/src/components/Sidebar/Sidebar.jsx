import React, { useState } from 'react';
import { FaHome, FaMoneyBill, FaHandHoldingUsd, FaUsers, FaChartBar, FaCalendar, FaCreditCard, FaAngleDown } from "react-icons/fa";
import logo from '../../static/images/logo1.png';
import './Sidebar.css';

const Sidebar = ({ role, chamaType, setActiveSection, activeSection }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Base navigation links configuration
  const baseNavigationLinks = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FaHome />,
      chamaTypes: ['hybrid', 'investment', 'merrygoround'],
      dropdown: [
        { id: 'overview', label: 'Member List', icon: <FaUsers />, chamaTypes: ['hybrid', 'investment', 'merrygoround'] },
        { id: 'payment-details', label: 'Payment Details', icon: <FaCreditCard />, chamaTypes: ['hybrid', 'investment', 'merrygoround'] },
      ],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <FaMoneyBill />,
      chamaTypes: ['hybrid', 'investment', 'merrygoround'],
      dropdown: [
        { id: 'contributions', label: 'Contributions', icon: <FaMoneyBill />, chamaTypes: ['hybrid', 'investment', 'merrygoround'] },
        { id: 'withdrawals', label: 'Withdrawals', icon: <FaHandHoldingUsd />, chamaTypes: ['hybrid', 'merrygoround'] },
        { id: 'approve-withdrawal', label: 'Approve a Withdrawal', icon: <FaHandHoldingUsd />, chamaTypes: ['hybrid', 'merrygoround'] },
      ],
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: <FaCalendar />,
      chamaTypes: ['hybrid', 'investment', 'merrygoround'],
      dropdown: [
        { id: 'meetings', label: 'Meeting Schedule', icon: <FaCalendar />, chamaTypes: ['hybrid', 'investment', 'merrygoround'] },
        { id: 'schedule-meeting', label: 'Schedule a Meeting', icon: <FaCalendar />, chamaTypes: ['hybrid', 'investment', 'merrygoround'] },
      ],
    },
    {
      id: 'loans',
      label: 'Loans',
      icon: <FaCreditCard />,
      chamaTypes: ['hybrid', 'merrygoround'],
      dropdown: [
        { id: 'loans', label: 'Request a Loan', icon: <FaCreditCard />, chamaTypes: ['hybrid', 'merrygoround'] },
        { id: 'approve-loan', label: 'Approve a Loan', icon: <FaHandHoldingUsd />, chamaTypes: ['hybrid', 'merrygoround'] },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FaChartBar />,
      chamaTypes: ['hybrid', 'investment', 'merrygoround'],
      dropdown: [
        { id: 'meeting-minutes', label: 'Meeting Minutes', icon: <FaChartBar />, chamaTypes: ['hybrid', 'investment', 'merrygoround'] },
        { id: 'contribution-reports', label: 'Contribution Reports', icon: <FaChartBar />, chamaTypes: ['hybrid', 'investment', 'merrygoround'] },
        { id: 'loan-reports', label: 'Loan Reports', icon: <FaChartBar />, chamaTypes: ['hybrid', 'merrygoround'] },
      ],
    },
    {
      id: 'rotation',
      label: 'Rotation',
      icon: <FaUsers />,
      chamaTypes: ['hybrid', 'merrygoround'],
      dropdown: [
        { id: 'rotation', label: 'Rotation Schedule', icon: <FaUsers />, chamaTypes: ['hybrid', 'merrygoround'] },
        { id: 'rotation-details', label: 'Rotation Details', icon: <FaUsers />, chamaTypes: ['hybrid', 'merrygoround'] },
      ],
    },
  ];

  // Filter navigation links based on chamaType
  const getNavigationLinks = (type) => {
    const normalizedType = type?.toLowerCase() || 'hybrid';
    return baseNavigationLinks
      .filter(link => link.chamaTypes.includes(normalizedType))
      .map(link => ({
        ...link,
        dropdown: link.dropdown?.filter(subLink => subLink.chamaTypes.includes(normalizedType)),
      }))
      .filter(link => !link.dropdown || link.dropdown.length > 0);
  };

  const navigationLinks = getNavigationLinks(chamaType);

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