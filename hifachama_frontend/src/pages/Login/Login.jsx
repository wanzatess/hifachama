import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import "./Login.css";
import logo from '../../static/images/logo.png';
import { useAuth } from '../../context/AuthContext';
import { clearAuthTokens } from '../../utils/auth';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(email, password);
      console.log("Login.jsx: Response from login:", response); // Debug

      if (!response.success) {
        throw new Error(response.error || "Login failed");
      }

      console.log("Login.jsx: Login successful, expecting redirect by AuthContext");

    } catch (err) {
      console.error("Login error:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });

      if (err.message.includes('404') || err.response?.status === 404) {
        setError("Login service unavailable. Please try later.");
      } else if (err.message.includes('Network Error')) {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.response?.data?.detail || 
                 err.response?.data?.error || 
                 err.message || 
                 "Login failed. Please try again.");
      }

      clearAuthTokens();
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
              <Spinner message="Logging In..." />
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