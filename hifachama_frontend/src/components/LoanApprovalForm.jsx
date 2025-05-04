import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";

const LoanApprovalForm = ({ loan, onSuccess, chamaId, userData }) => {
  const [interestRate, setInterestRate] = useState("");
  const [penaltyValue, setPenaltyValue] = useState("");
  const [penaltyType, setPenaltyType] = useState("amount");
  const [status, setStatus] = useState("approved");
  const [loading, setLoading] = useState(false);

  console.log("📋 Rendering LoanApprovalForm for loan:", loan, "userData:", userData);
  console.log("🔍 userData.role value:", userData?.role);

  if (!userData) {
    console.warn("⚠️ userData is undefined or null");
    return <div className="p-4 text-red-600">Error: User data is missing.</div>;
  }

  // Normalize role check to handle case sensitivity or unexpected values
  const isChairperson = userData?.role && 
    userData.role.toLowerCase().trim() === 'chairperson';

  if (!isChairperson) {
    console.warn("⚠️ Role check failed. Expected 'Chairperson', got:", userData?.role);
    return <div className="p-4 text-red-600">Access denied. Only chairpersons can approve loans.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!interestRate || !penaltyValue || !penaltyType || !status) {
      toast.error("Interest rate, penalty value, penalty type, and status are required!");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/api/loans/${loan.id}/approve_loan/`, {
        interest_rate: parseFloat(interestRate),
        penalty_value: parseFloat(penaltyValue),
        penalty_type: penaltyType,
        status,
        chama_id: chamaId,
      });

      toast.success(`Loan ${status} successfully!`);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error("Loan approval error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Failed to process loan approval.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Approve Loan for {loan.member_name}</h2>
      <div className="mb-3">
        <p><strong>Loan Amount:</strong> {loan.amount}</p>
        <p><strong>Purpose:</strong> {loan.purpose}</p>
        <p><strong>Repayment Period:</strong> {loan.repayment_period}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block">Interest Rate (%)</label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full border p-2 rounded"
            required
            min={0}
            step={0.01}
          />
        </div>

        <div className="mb-3">
          <label className="block">Penalty Type</label>
          <select
            value={penaltyType}
            onChange={(e) => setPenaltyType(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="amount">Fixed Amount</option>
            <option value="percentage">Percentage of Loan</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block">
            Penalty {penaltyType === 'amount' ? 'Amount' : 'Percentage (%)'}
          </label>
          <input
            type="number"
            value={penaltyValue}
            onChange={(e) => setPenaltyValue(e.target.value)}
            className="w-full border p-2 rounded"
            required
            min={0}
            step={penaltyType === 'amount' ? 0.01 : 0.1}
          />
        </div>

        <div className="mb-3">
          <label className="block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Approval"}
        </button>
      </form>
    </div>
  );
};

export default LoanApprovalForm;