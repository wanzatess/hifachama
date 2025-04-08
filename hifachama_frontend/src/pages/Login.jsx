import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
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
  const { login, isAuthenticated } = useAuth();

// Simplify the handler to use AuthContext's redirect:
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const result = await login(email, password);
    if (result.success) {
      // Redirect after successful login
      navigate(result.redirectTo);  // Use the redirect path from AuthContext
    } else if (result.error) {
      setError(result.error);
    }
  } catch (err) {
    setError(err.message || "Login failed");
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
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              className="form-input"
              autoComplete="username"
              autoFocus
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                className="form-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
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
