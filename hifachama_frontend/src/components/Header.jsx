import React from 'react';
import logo from '../static/images/logo.png'; // Ensure the logo path matches your project structure
import '../styles/Dashboard.css';

const Header = ({ userName, chamaName }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={logo} alt="HIFACHAMA Logo" className="header-logo" />
        <span className="welcome-text">Welcome, {userName || 'User'}</span>
      </div>
      <div className="header-right">
        <span className="chama-name">{chamaName || 'Chama'}</span>
      </div>
    </header>
  );
};

export default Header;