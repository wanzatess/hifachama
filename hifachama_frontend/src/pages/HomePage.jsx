import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Home.css"; // Move your CSS file to React's src/styles/

const Home = () => {
  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#4E4528" }}>
        <div className="container">
          <a className="navbar-brand text-light" href="#">HIFACHAMA</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link text-light" to="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link text-light" to="/features">Features</Link></li>
              <li className="nav-item"><Link className="nav-link btn btn-light text-dark" to="/login">Login</Link></li>
              <li className="nav-item">
                <Link className="nav-link btn" style={{ backgroundColor: "#9C8F5F", color: "#FFFFFF" }} to="/register">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="text-center py-5" style={{ backgroundColor: "#6F623E", color: "#F0EAD6" }}>
        <div className="container">
          <h1 className="display-4">Welcome to HIFACHAMA</h1>
          <p className="lead">Manage your group contributions, loans, and withdrawals easily.</p>
          <Link to="/register" className="btn btn-light text-dark btn-lg">Get Started</Link>
        </div>
      </header>

      {/* What We Offer Section */}
      <section className="container text-center my-5">
        <h2 className="mb-4">What We Offer</h2>
        <div className="row">
          <div className="col-md-4">
            <h3>🔄 Merry-Go-Round Chama</h3>
            <p>Participate in a rotating savings system where members contribute and receive payouts in turns.</p>
          </div>
          <div className="col-md-4">
            <h3>📈 Investment Chama</h3>
            <p>Grow wealth together by investing in businesses, assets, and profitable ventures.</p>
          </div>
          <div className="col-md-4">
            <h3>⚖️ Hybrid Chama</h3>
            <p>Enjoy the best of both worlds—merry-go-round savings and long-term investments.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container text-center my-5">
        <h2 className="mb-4">Our Features</h2>
        <div className="row">
          <div className="col-md-4">
            <h3>📢 Contributions</h3>
            <p>Make secure contributions to your chama with ease.</p>
          </div>
          <div className="col-md-4">
            <h3>💰 Loans</h3>
            <p>Request and manage loans with transparency.</p>
          </div>
          <div className="col-md-4">
            <h3>💳 Withdrawals</h3>
            <p>Withdraw funds conveniently when approved.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-3" style={{ backgroundColor: "#4E4528", color: "#F0EAD6" }}>
        <p>&copy; 2025 HIFACHAMA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
