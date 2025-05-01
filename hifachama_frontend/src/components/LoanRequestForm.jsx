import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const LoanRequestForm = ({ onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [amount, setAmount] = useState("");
  const [repaymentPeriod, setRepaymentPeriod] = useState("3 months");
  const [purpose, setPurpose] = useState("");
  const [chamaId, setChamaId] = useState("");  // Field to enter Chama ID
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to request a loan.");
      return;
    }
  
    if (!amount || !purpose || !chamaId) {
      toast.error("Amount, purpose, and Chama ID are required!");
      return;
    }
  
    setLoading(true);
  
    try {
      await api.post("/api/loans/", {
        amount: parseFloat(amount),
        repayment_period: repaymentPeriod,
        purpose,
        chama_id: chamaId // Send the chama_id entered by the user
      });
  
      toast.success("Loan request submitted!");
      setAmount("");
      setPurpose("");
      setChamaId("");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Loan request error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to request loan.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Request a Loan</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block">Enter Chama ID</label>
          <input
            type="text"
            value={chamaId}
            onChange={(e) => setChamaId(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-2 rounded"
            required
            min={1}
          />
        </div>

        <div className="mb-3">
          <label className="block">Repayment Period</label>
          <select
            value={repaymentPeriod}
            onChange={(e) => setRepaymentPeriod(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="12 months">12 months</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block">Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Loan Request"}
        </button>
      </form>
    </div>
  );
};

export default LoanRequestForm;
