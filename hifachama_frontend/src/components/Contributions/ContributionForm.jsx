import React, { useState, useContext } from "react";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";
import { toast } from "react-toastify";
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path
import { useMembers } from '../../hooks/useMembers'; // Adjust path

const ContributionForm = ({ onSuccess }) => {
  const { chamaData } = useContext(ChamaContext);
  const { memberId } = useMembers(); // Custom hook for logged-in member
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    transaction_type: "rotational",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!memberId) {
      toast.error("Member data not loaded. Please try again.");
      return;
    }

    if (formData.amount <= 0 || !formData.transaction_type || !formData.date) {
      toast.error("All required fields must be filled.");
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const payload = {
        amount: parseFloat(formData.amount),
        category: "contribution",
        transaction_type: formData.transaction_type,
        date: formData.date,
        member: memberId,
        chama: chamaData.id
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/transactions/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage("Contribution submitted successfully!");
      setFormData({
        amount: "",
        transaction_type: "rotational",
        date: new Date().toISOString().split("T")[0],
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      const errors = error.response?.data;
      let errorMessage = errors?.error || "Failed to submit contribution.";

      if (errors?.category) {
        errorMessage = `Category error: ${errors.category.join(", ")}`;
      } else if (errors?.amount) {
        errorMessage = `Amount error: ${errors.amount.join(", ")}`;
      } else if (errors?.transaction_type) {
        errorMessage = `Transaction type error: ${errors.transaction_type.join(", ")}`;
      } else if (errors?.member) {
        errorMessage = `Member error: ${errors.member.join(", ")}`;
      } else if (errors?.non_field_errors) {
        errorMessage = errors.non_field_errors.join(", ");
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container bg-white p-4 rounded shadow mb-6">
      <h2 className="form-title text-xl font-semibold mb-3">Make a Contribution</h2>

      {successMessage && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '0.95rem',
          backgroundColor: '#D4EDDA',
          color: '#155724'
        }}>
          <p style={{
            margin: '0',
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)'
          }}>
            {successMessage}
          </p>
        </div>
      )}

      {error && <div className="error-message text-red-500 mb-3">{error}</div>}

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
          <label className="form-label block">Transaction Type</label>
          <select
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleChange}
            className="form-select w-full border p-2 rounded"
            required
          >
            <option value="rotational">Rotational</option>
            <option value="investment">Investment</option>
          </select>
        </div>

        <div className="form-group mb-3">
          <label className="form-label block">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input w-full border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="form-button bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading || !memberId}
        >
          {loading ? "Processing..." : "Submit Contribution"}
        </button>
      </form>
    </div>
  );
};

export default ContributionForm;
