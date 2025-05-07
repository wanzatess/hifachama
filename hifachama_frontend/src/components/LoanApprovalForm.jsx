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

  if (!userData) {
    console.warn("⚠️ userData is undefined or null");
    return <div className="error-message">Error: User data is missing.</div>;
  }

  const isChairperson = userData?.role && 
    userData.role.toLowerCase().trim() === 'chairperson';

  if (!isChairperson) {
    console.warn("⚠️ Role check failed. Expected 'Chairperson', got:", userData?.role);
    return <div className="error-message">Access denied. Only chairpersons can approve loans.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!interestRate || !penaltyValue || !penaltyType || !status) {
      toast.error("All fields are required!");
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
    <div className="dashboard-card">
      <h3 className="card-title">Approve Loan for {loan.member_name}</h3>
      <div className="mb-3">
        <p><strong>Loan Amount:</strong> {loan.amount}</p>
        <p><strong>Purpose:</strong> {loan.purpose}</p>
        <p><strong>Repayment Period:</strong> {loan.repayment_period}</p>
      </div>
      <form onSubmit={handleSubmit} className="schedule-meeting-form">
        <div className="form-group">
          <label className="block">Interest Rate (%)</label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="form-input"
            required
            min={0}
            step={0.01}
          />
        </div>
        <div className="form-group">
          <label className="block">Penalty Type</label>
          <select
            value={penaltyType}
            onChange={(e) => setPenaltyType(e.target.value)}
            className="form-input"
            required
          >
            <option value="amount">Fixed Amount</option>
            <option value="percentage">Percentage of Loan</option>
          </select>
        </div>
        <div className="form-group">
          <label className="block">
            Penalty {penaltyType === 'amount' ? 'Amount' : 'Percentage (%)'}
          </label>
          <input
            type="number"
            value={penaltyValue}
            onChange={(e) => setPenaltyValue(e.target.value)}
            className="form-input"
            required
            min={0}
            step={penaltyType === 'amount' ? 0.01 : 0.1}
          />
        </div>
        <div className="form-group">
          <label className="block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-input"
            required
          >
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
          </select>
        </div>
        <button
          type="submit"
          className="form-button"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Approval"}
        </button>
      </form>
    </div>
  );
};

export default LoanApprovalForm;