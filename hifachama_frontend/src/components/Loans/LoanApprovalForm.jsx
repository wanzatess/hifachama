import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import api from "../../api/axiosConfig";
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path

const LoanApprovalForm = ({ loan, onSuccess }) => {
  const { userData, chamaData } = useContext(ChamaContext);
  const [interestRate, setInterestRate] = useState("");
  const [penaltyValue, setPenaltyValue] = useState("");
  const [penaltyType, setPenaltyType] = useState("amount");
  const [status, setStatus] = useState("approved");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  if (!userData) {
    return <div className="error-message">Error: User data is missing.</div>;
  }

  const isChairperson = userData?.role?.toLowerCase().trim() === 'chairperson';

  if (!isChairperson) {
    return <div className="error-message">Access denied. Only chairpersons can approve loans.</div>;
  }

  if (!loan) {
    return (
      <div className="dashboard-card">
        <h3 className="card-title">Approve Loan</h3>
        <div className="error-message">No loan selected. Please select a loan to approve.</div>
      </div>
    );
  }

  if (loan.status.toLowerCase() !== 'pending') {
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
    setSuccessMessage('');

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
      chama_id: chamaData.id,
    };

    try {
      const response = await api.post(`/api/loans/${loan.id}/approve_loan/`, requestPayload);
      setSuccessMessage(`Loan ${status} successfully!`);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to process loan approval.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Approve Loan for {loan.member_name}</h3>
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