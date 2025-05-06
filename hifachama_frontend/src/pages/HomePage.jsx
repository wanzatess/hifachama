import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/Home.css";
import logo from '../static/images/logo1.png';
import background from '../static/images/money 4.jpg';

const Homepage = () => {
  return (
    <div className="homepage-full" style={{ backgroundImage: `url(${background})` }}>
      <header className="homepage-header">
        <div className="logo-section">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <nav className="nav-links" style={{ backgroundColor: "#8A7B50", color: "#F0EAD6" }}>
          <Link to="/features" className="nav-link">Features</Link>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link register-btn">Register</Link>
        </nav>
      </header>

      <main className="homepage-content">
        <h1 className="hero-title">HIFACHAMA</h1>
        <p className="hero-subtitle">Manage your group contributions, loans, and withdrawals easily.</p>
        <Link to="/register" className="cta-button">Get Started</Link>
      </main>

      <footer className="homepage-footer">
        <p>© {new Date().getFullYear()} HIFACHAMA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;
