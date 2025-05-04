import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";

const LoanRequestForm = ({ chamaId, userId, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [repaymentPeriod, setRepaymentPeriod] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !repaymentPeriod || !chamaId || !userId) {
      toast.error("All fields and user information are required!");
      return;
    }

    setLoading(true);

    try {
      // Fetch the ChamaMember ID for the user
      const { data: memberData } = await api.get(`/api/chama-members/?user=${userId}&chama=${chamaId}`);
      if (!memberData || memberData.length === 0) {
        throw new Error("Chama member not found.");
      }
      const memberId = memberData[0].id;

      const response = await api.post("/api/loans/", {
        amount: parseFloat(amount),
        purpose,
        repayment_period: repaymentPeriod,
        chama_id: chamaId,
        member: memberId,
      });

      toast.success("Loan request submitted successfully!");
      setAmount("");
      setPurpose("");
      setRepaymentPeriod("");
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Loan request error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to submit loan request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Request a Loan</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border p-2 rounded"
            required
            min={0}
            step={0.01}
          />
        </div>

        <div className="mb-3">
          <label className="block">Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full border p-2 rounded"
            rows={4}
          />
        </div>

        <div className="mb-3">
          <label className="block">Repayment Period</label>
          <input
            type="text"
            value={repaymentPeriod}
            onChange={(e) => setRepaymentPeriod(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Loan Request"}
        </button>
      </form>
    </div>
  );
};

export default LoanRequestForm;