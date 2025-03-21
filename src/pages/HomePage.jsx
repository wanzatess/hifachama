import React from "react";
import "../styles.css"; // ✅ Ensure correct path

const HomePage = () => {
  return (
    <div>
      <header>
        <img src="/logo.png" alt="HIFACHAMA Logo" className="logo" />
        <nav>
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <section id="hero">
          <h1>Welcome to HIFACHAMA</h1>
          <p>Manage your Chama finances with ease.</p>
          <a href="#features" className="cta-button">Get Started</a>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 HIFACHAMA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage; // ✅ Fix component name


