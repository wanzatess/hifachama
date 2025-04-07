import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.css";
import logo from '../static/images/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    role: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Hardcoded API URL - change this to your actual backend URL
    const BACKEND_URL = "http://127.0.0.1:8080/"; // ← CHANGE THIS IF NEEDED
    
    // 2. Validate form
    if (!validateForm()) {
      console.log("Validation failed", errors);
      return;
    }
  
    setIsLoading(true);
    setMessage({ text: "", type: "" });
  
    try {
      console.log("Attempting to register at:", `${BACKEND_URL}api/register/`);
      
      // 3. Make the API call with hardcoded URL
      const response = await axios.post(
        `${BACKEND_URL}api/register/`, 
        {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          role: formData.role,
          password: formData.password,
          password2: formData.confirmPassword
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );
  
      // 4. Success handling
      setMessage({ 
        text: `Welcome ${formData.first_name}! Registration successful.`, 
        type: "success" 
      });
      setTimeout(() => navigate("/login"), 1500);
  
    } catch (err) {
      // 5. Error handling
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response) {
        console.error("Server response:", err.response.data);
        if (err.response.data.email) {
          errorMessage = `Email error: ${err.response.data.email[0]}`;
        } else if (err.response.data.username) {
          errorMessage = `Username error: ${err.response.data.username[0]}`;
        }
      } else {
        console.error("Request error:", err.message);
        errorMessage = `Network error: ${err.message}`;
      }
  
      setMessage({ 
        text: errorMessage, 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="formWrapper">
        <div className="logo-header">
        <img src={logo} alt="HIFACHAMA" className="logo" />
          <h2>Create Account</h2>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            <strong>{formData.first_name} {formData.last_name}</strong>
            <p className="rounded-box">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="spaced-form">
          {/* Username */}
          <div className="inputGroup">
            <label>Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`input-field ${errors.username ? "error" : ""}`}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          {/* Email */}
          <div className="inputGroup">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? "error" : ""}`}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Name Fields */}
          <div className="name-fields">
            <div className="inputGroup half">
              <label>First Name</label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`input-field ${errors.first_name ? "error" : ""}`}
              />
              {errors.first_name && <span className="error-text">{errors.first_name}</span>}
            </div>
            <div className="inputGroup half">
              <label>Last Name</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`input-field ${errors.last_name ? "error" : ""}`}
              />
              {errors.last_name && <span className="error-text">{errors.last_name}</span>}
            </div>
          </div>

          {/* Phone Number */}
          <div className="inputGroup">
            <label>Phone Number</label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className={`input-field ${errors.phone_number ? "error" : ""}`}
              placeholder="+254700123456"
            />
            {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
          </div>

          {/* Role */}
          <div className="inputGroup">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="member">Member</option>
              <option value="chairperson">Chairperson</option>
              <option value="treasurer">Treasurer</option>
              <option value="secretary">Secretary</option>
            </select>
          </div>

          {/* Password */}
          <div className="inputGroup">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`input-field ${errors.password ? "error" : ""}`}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="inputGroup">
            <label>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`input-field ${errors.confirmPassword ? "error" : ""}`}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Processing..." : "Register"}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
