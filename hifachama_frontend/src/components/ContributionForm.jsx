import React, { useState } from "react";
import api from "../api/axiosConfig"; // or the correct path
import { toast } from "react-toastify";
import { getAuthToken } from "../utils/auth";

const ContributionForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "", 
    transaction_type: "contribution",
    purpose: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.amount <= 0 || !formData.purpose) {
      toast.error("All fields are required.");
      return;
    }
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem('accessToken'); // Match the key used in login
      if (!token) {
        toast.error("Please log in again.");
        // Redirect to login
        window.location.href = '/login';
        return;
      }
  
      const response = await api.post("/api/transactions/", 
        {
          ...formData,
          transaction_type: "contribution"
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data) {
        toast.success("Contribution submitted successfully!");
        setFormData({
          amount: "",
          description: "",
          transaction_type: "contribution",
          purpose: ""
        });
      }
    } catch (error) {
      console.error('Contribution error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || "Failed to submit contribution.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Make a Contribution</h2>
      <form onSubmit={handleSubmit}>
        {/* Removed the 'member' input */}
        <div className="form-group">
          <label className="form-label">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="form-input"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            rows="3"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Purpose</label>
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">-- Select Purpose --</option>
            <option value="monthly_dues">Monthly Dues</option>
            <option value="emergency_fund">Emergency Fund</option>
            <option value="project_fund">Project Fund</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          type="submit"
          className="form-button"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Contribution"}
        </button>
      </form>
    </div>
  );
};

export default ContributionForm;
