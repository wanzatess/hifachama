import React from 'react';
import './Header.css';

const Header = ({ userName, chamaName, chamaId }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <span className="welcome-text">Welcome, {userName || 'User'}</span>
      </div>
      <div className="header-right">
        <span className="chama-name">
          {chamaName || 'Chama'}
          {chamaId && <span className="chama-id"> ID:{chamaId}</span>}
        </span>
      </div>
    </header>
  );
};

export default Header;
