import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';  // Correct for v6+
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./styles/Home.css";
import "./styles/Login.css";
import "./styles/Register.css";
import "./styles/Dashboard.css";

// Error boundary wrapper component
class AuthErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    console.error("Authentication error:", error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Auth Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-error-fallback">
          <h2>Authentication System Error</h2>
          <p>Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AuthErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);

// Optional performance monitoring
// reportWebVitals(console.log);