import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig"; // Adjust the path based on your project structure
import { toast } from "react-toastify";

const WithdrawalForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    transaction_type: "withdrawal",
    chama: "",
    member: "",
  });
  const [loading, setLoading] = useState(false);
  const [rotationalBalance, setRotationalBalance] = useState(0);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [nextInLine, setNextInLine] = useState(null);

  const fetchBalance = async () => {
    if (!formData.chama) return;

    try {
      const response = await api.get(
        `/api/chamas/${formData.chama}/balance/`
      );
      setRotationalBalance(response.data.rotational_balance);
    } catch (error) {
      toast.error("Failed to fetch rotational balance.");
    }
  };

  const checkUserTurn = async () => {
    if (!formData.chama || !formData.member) return;

    try {
      const response = await api.get(
        `/api/chamas/${formData.chama}/next-rotation/`
      );
      if (response.data.message === "No active rotation found") {
        setIsUserTurn(false);
        setNextInLine(null);
      } else {
        const currentMemberId = response.data.member_id;
        setIsUserTurn(currentMemberId === parseInt(formData.member));
        setNextInLine(response.data.next_in_line);
      }
    } catch (error) {
      toast.error("Failed to verify rotation turn.");
      setIsUserTurn(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    checkUserTurn();
  }, [formData.chama, formData.member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.chama || !formData.member) {
      toast.error("Chama ID and Member ID are required.");
      return;
    }

    if (!isUserTurn) {
      toast.error("It is not your turn to withdraw.");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    if (parseFloat(formData.amount) > rotationalBalance) {
      toast.error("Withdrawal amount exceeds the rotational balance.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/transactions/withdrawal/", formData);
      toast.success("Withdrawal request submitted successfully!");
      setFormData({
        amount: "",
        description: "",
        transaction_type: "withdrawal",
        chama: formData.chama,
        member: formData.member,
      });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.error || "Invalid withdrawal details.");
        } else if (error.response.status === 403) {
          toast.error("Not your turn or insufficient balance.");
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
      {formData.chama && (
        <p className="balance-info">Rotational Balance: {rotationalBalance}</p>
      )}
      {nextInLine && (
        <p className="turn-info">
          {isUserTurn
            ? "It is your turn to withdraw."
            : `Next in line: ${nextInLine}`}
        </p>
      )}
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
          disabled={loading || !isUserTurn}
        >
          {loading ? "Processing..." : "Submit Withdrawal Request"}
        </button>
      </form>
    </div>
  );
};

export default WithdrawalForm;
