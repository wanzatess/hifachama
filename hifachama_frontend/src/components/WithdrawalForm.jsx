import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const WithdrawalForm = () => {
  const [formData, setFormData] = useState({
    amount: "", 
    description: "",
    transaction_type: "withdrawal",
    chama: "",
    member: ""
  });
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  const fetchBalance = async () => {
    if (!formData.chama) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://hifachama-backend.onrender.com/api/chamas/${formData.chama}/balance/`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCurrentBalance(response.data.balance);
    } catch (error) {
      toast.error("Failed to fetch Chama balance.");
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [formData.chama]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.chama || !formData.member) {
      toast.error("Chama ID and Member ID are required.");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    if (parseFloat(formData.amount) > currentBalance) {
      toast.error("Withdrawal amount exceeds the current balance.");
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

      toast.success("Withdrawal request submitted successfully!");
      setFormData({
        amount: "",
        description: "",
        transaction_type: "withdrawal",
        chama: formData.chama,
        member: formData.member
      });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.error || "Invalid withdrawal details.");
        } else if (error.response.status === 403) {
          toast.error("Withdrawal amount exceeds chama balance.");
        } else {
          toast.error("Failed to submit withdrawal request.");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Request Withdrawal</h2>
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
          {formData.chama && (
            <p className="balance-info">Current Balance: {currentBalance}</p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Reason/Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            rows="3"
            required
          />
        </div>
        <button
          type="submit"
          className="form-button"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Withdrawal Request"}
        </button>
      </form>
    </div>
  );
};

export default WithdrawalForm;