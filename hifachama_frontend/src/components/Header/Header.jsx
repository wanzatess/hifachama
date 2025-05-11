import React from 'react';
import './Header.css';

const Header = ({ userName, chamaName }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <span className="welcome-text">Welcome, {userName || 'User'}</span>
      </div>
      <div className="header-right">
        <span className="chama-name">{chamaName || 'Chama'}</span>
      </div>
    </header>
  );
};

export default Header;