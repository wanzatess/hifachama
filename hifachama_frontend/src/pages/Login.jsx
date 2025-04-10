import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import "../styles/Login.css";
import logo from '../static/images/logo.png';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      // Debug: Verify endpoint URL
      const loginUrl = `${api.defaults.baseURL}/login/`;
      console.log("Attempting login at:", loginUrl);

      // First check if endpoint exists
      const endpointCheck = await fetch(loginUrl, {
        method: 'OPTIONS'
      });

      if (!endpointCheck.ok) {
        throw new Error(`Endpoint not found (${endpointCheck.status})`);
      }

      // Proceed with actual login
      await login(email, password);

      // Verify token was stored
      if (!localStorage.getItem('authToken')) {
        throw new Error("Authentication token not received");
      }

    } catch (err) {
      console.error("Login error:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });

      // Handle 404 specifically
      if (err.message.includes('404') || err.response?.status === 404) {
        setError("Login service unavailable. Please try later.");
        console.error("Backend endpoint not found at:", err.config?.url);
      } 
      // Handle network errors
      else if (err.message.includes('Network Error')) {
        setError("Network error. Please check your connection.");
      }
      // Handle other errors
      else {
        setError(err.response?.data?.detail || 
                err.response?.data?.error || 
                "Login failed. Please try again.");
      }

      // Clear any partial authentication
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Company Logo" className="login-logo" />
          <h2>Welcome Back</h2>
          {process.env.NODE_ENV === 'development' && (
            <div className="dev-notice">
              Development Mode - Using endpoint: {api.defaults.baseURL}
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button 
              onClick={() => setError("")} 
              className="error-close"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              required
              className="form-input"
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Logging In...</span>
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/forgot-password" className="footer-link">
            Forgot Password?
          </Link>
          <p className="signup-text">
            Don't have an account?{" "}
            <Link to="/register" className="footer-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;