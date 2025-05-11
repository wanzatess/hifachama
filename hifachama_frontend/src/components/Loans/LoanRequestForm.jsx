import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import api from "../../api/axiosConfig";
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path

const LoanRequestForm = ({ onSuccess }) => {
  const { userData, chamaData } = useContext(ChamaContext);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [repaymentPeriod, setRepaymentPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!amount || !repaymentPeriod || !chamaData?.id || !userData?.id) {
      toast.error("All fields and user information are required!");
      return;
    }

    setLoading(true);

    try {
      const { data: memberData } = await api.get(`/api/chama-members/?user=${userData.id}&chama=${chamaData.id}`);
      if (!memberData || memberData.length === 0) {
        throw new Error("Chama member not found.");
      }
      const memberId = memberData[0].id;

      const response = await api.post("/api/loans/", {
        amount: parseFloat(amount),
        purpose,
        repayment_period: repaymentPeriod,
        chama_id: chamaData.id,
        member: memberId,
      });

      setSuccessMessage("Loan request submitted successfully!");
      setAmount("");
      setPurpose("");
      setRepaymentPeriod("");
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit loan request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Request a Loan</h3>
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
      <form onSubmit={handleSubmit} className="schedule-meeting-form">
        <div className="form-group">
          <label className="block">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
            required
            min={0}
            step={0.01}
          />
        </div>
        <div className="form-group">
          <label className="block">Purpose</label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="form-textarea"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label className="block">Repayment Period</label>
          <input
            type="text"
            value={repaymentPeriod}
            onChange={(e) => setRepaymentPeriod(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <button
          type="submit"
          className="form-button"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Loan Request"}
        </button>
      </form>
    </div>
  );
};

export default LoanRequestForm;