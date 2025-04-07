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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
  
    try {
      const loginResult = await login(email, password);
      
      if (loginResult.success) {
        // Use redirectTo from login result to navigate
        navigate(loginResult.redirectTo || "/dashboard", { replace: true });
      } else {
        setError(loginResult.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Full login error:", {
        error: err,
        response: err.response,
        request: err.request
      });
  
      let errorMessage = "Login failed. Please try again.";
  
      if (err.code === "ERR_NETWORK") {
        errorMessage = "Cannot connect to server. Please check your network connection.";
      } else if (err.response) {
        // Handle Django error responses
        if (err.response.status === 400) {
          errorMessage = err.response.data?.error || "Invalid email or password";
        } else if (err.response.status === 401) {
          errorMessage = "Invalid credentials";
        } else if (err.response.status === 403) {
          errorMessage = "Account inactive - contact administrator";
        } else {
          errorMessage = err.response.data?.error || 
                         err.response.data?.detail || 
                         JSON.stringify(err.response.data);
        }
      }
  
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const { success, redirectTo } = await login(email, password);
      
      if (success) {
        // Only navigate if we have a redirect path
        if (redirectTo) {
          navigate(redirectTo, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
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
