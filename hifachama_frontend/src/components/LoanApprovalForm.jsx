import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";

const LoanApprovalForm = ({ loan, onSuccess, chamaId, userData }) => {
  const [interestRate, setInterestRate] = useState("");
  const [penaltyValue, setPenaltyValue] = useState("");
  const [penaltyType, setPenaltyType] = useState("amount");
  const [status, setStatus] = useState("approved");
  const [loading, setLoading] = useState(false);

  console.log("📋 Rendering LoanApprovalForm with props:", {
    loan,
    chamaId,
    userData,
    onSuccess: !!onSuccess,
  });
  console.log("🔍 Loan Details:", JSON.stringify(loan, null, 2));

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

  if (!loan) {
    console.warn("⚠️ Loan is undefined or null");
    return (
      <div className="dashboard-card">
        <h3 className="card-title">Approve Loan</h3>
        <div className="error-message">No loan selected. Please select a loan to approve.</div>
      </div>
    );
  }

  if (loan.status.toLowerCase() !== 'pending') {
    console.warn("⚠️ Loan is not pending. Status:", loan.status);
    return (
      <div className="dashboard-card">
        <h3 className="card-title">Approve Loan for {loan.member_name}</h3>
        <div className="error-message">
          This loan cannot be approved because it is not in pending status. Current status: {loan.status}.
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!interestRate || !penaltyValue || !penaltyType || !status) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);

    const requestPayload = {
      interest_rate: parseFloat(interestRate),
      penalty_value: parseFloat(penaltyValue),
      penalty_type: penaltyType,
      status,
      chama_id: chamaId,
    };

    console.log("📤 Sending API request to /api/loans/", loan.id, "/approve_loan/ with payload:", requestPayload);

    try {
      const response = await api.post(`/api/loans/${loan.id}/approve_loan/`, requestPayload);
      console.log("✅ API response:", response.data);
      toast.success(`Loan ${status} successfully!`);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to process loan approval.";
      console.error("❌ Loan approval error:", error.response?.data || error.message);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Approve Loan for {loan.member_name}</h3>
      <div className="mb-3">
        <p><strong>Loan Amount:</strong> KSh. {parseFloat(loan.amount).toFixed(2)}</p>
        <p><strong>Purpose:</strong> {loan.purpose || 'N/A'}</p>
        <p><strong>Repayment Period:</strong> {loan.repayment_period || 'N/A'}</p>
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