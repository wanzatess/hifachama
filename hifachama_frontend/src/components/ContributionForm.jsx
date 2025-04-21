import React, { useState } from "react";
import api from "../api/axiosConfig"; // or the correct path
import { toast } from "react-toastify";
import { getAuthToken } from "../utils/auth";

const ContributionForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "", 
    transaction_type: "contribution",
    chama: "",
    member: "",
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
    console.log("Form submitted");
    
    if (formData.amount <= 0 || !formData.purpose || !formData.chama || !formData.member) {
      toast.error("All fields are required.");
      return;
    }    

    setLoading(true);

    try {
      // Check if token exists before making the request
      console.log("Raw token in localStorage:", localStorage.getItem("token"));
      const token = getAuthToken();
      if (!token) {
        toast.error("No token found. Please log in again.");
        setLoading(false);
        return;
      }      

      // Debug: Log the token (remove in production)
      console.log("About to send request with:", formData);
      const response = await api.post("/api/transactions/", formData);

      toast.success("Contribution submitted successfully!");
      setFormData({
        amount: "",
        description: "",
        transaction_type: "contribution",
        chama: "",
        member: "",
        purpose: ""
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.error || "Invalid contribution details.");
      } else {
        toast.error("Failed to submit contribution.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Make a Contribution</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Chama ID</label>
          <input
            type="text"
            name="chama"
            value={formData.chama}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Member ID</label>
          <input
            type="text"
            name="member"
            value={formData.member}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
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