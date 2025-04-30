import React, { useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";

const ContributionForm = ({ onSuccess, chamaId, userId }) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    transaction_type: "contribution",
    purpose: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const response = await api.post(
        "/api/transactions/",
        {
          ...formData,
          transaction_type: "contribution",
          chama: chamaId,
          member: userId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
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
        if (onSuccess) onSuccess(); // trigger refresh
      }
    } catch (error) {
      console.error("Contribution error:", error.response?.data || error.message);
      toast.error("Failed to submit contribution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container bg-white p-4 rounded shadow mb-6">
      <h2 className="form-title text-xl font-semibold mb-3">Make a Contribution</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label className="form-label block">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="form-input w-full border p-2 rounded"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label block">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea w-full border p-2 rounded"
            rows="3"
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label block">Purpose</label>
          <select
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="form-select w-full border p-2 rounded"
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
          className="form-button bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Contribution"}
        </button>
      </form>
    </div>
  );
};

export default ContributionForm;
