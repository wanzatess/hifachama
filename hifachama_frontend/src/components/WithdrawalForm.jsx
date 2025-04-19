import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const WithdrawalForm = ({ chamaId, userId }) => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    transaction_type: "withdrawal",
    chama: chamaId,
    member: userId
  });
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    // Fetch the current balance for the chama when the component mounts
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://hifachama-backend.onrender.com/api/chamas/${chamaId}/balance/`, 
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

    fetchBalance();
  }, [chamaId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        chama: chamaId,
        member: userId
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
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Request Withdrawal</h2>
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
          <label className="block text-gray-700">Reason/Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
            rows="3"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Withdrawal Request"}
        </button>
      </form>
    </div>
  );
};

export default WithdrawalForm;
