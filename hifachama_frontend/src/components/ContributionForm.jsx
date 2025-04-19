import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ContributionForm = ({ chamaId, userId }) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    transaction_type: "contribution",
    chama: chamaId,
    member: userId,
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
      toast.error("Amount and purpose are required.");
      return;
    }    

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://hifachama-backend.onrender.com/api/transactions/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Contribution submitted successfully!");
      setFormData({
        amount: "",
        description: "",
        transaction_type: "contribution",
        chama: chamaId,
        member: userId,
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
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Make a Contribution</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
            rows="3"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Purpose</label>
          <select
           name="purpose"
           value={formData.purpose}
           onChange={handleChange}
           className="w-full border rounded p-2"
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
          className="bg-blue-500 text-white p-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Contribution"}
        </button>
      </form>
    </div>
  );
};

export default ContributionForm;