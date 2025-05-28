import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import "./Login.css";
import logo from '../../static/images/logo.png';
import { useAuth } from '../../context/AuthContext';
import { clearAuthTokens } from '../../utils/auth';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsLoading(true);

    try {
      const response = await login(email, password);
      console.log("Login.jsx: Response from login:", response);

      if (!response.success) {
        throw new Error(response.error || "Login failed");
      }

      setMessage({
        text: "Login successful! Redirecting...",
        type: "success"
      });

    } catch (err) {
      console.error("Login error:", {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });

      let errorMessage = "Login failed. Please try again.";
      
      if (err.message.includes('404') || err.response?.status === 404) {
        errorMessage = "Login service unavailable. Please try later.";
      } else if (err.message.includes('Network Error')) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.response?.data?.detail || 
                      err.response?.data?.error || 
                      err.message || 
                      "Login failed. Please try again.";
      }

      setMessage({
        text: errorMessage,
        type: "error"
      });

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

        {message.text && (
          <div className={`message ${message.type}`}>
            <p className="rounded-box">{message.text}</p>
            <button 
              onClick={() => setMessage({ text: "", type: "" })} 
              className="error-close"
              aria-label="Close message"
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
            {isLoading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <div className="login-footer">
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