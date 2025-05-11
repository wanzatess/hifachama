import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import { toast } from 'react-toastify';
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path
import { useBalance } from '../../hooks/useBalance'; // Adjust path
import { useMembers } from '../../hooks/useMembers'; // Adjust path
import { useRotations } from '../../hooks/useRotations'; // Adjust path
import '../../styles/Form.css';

const WithdrawalForm = () => {
  const { chamaData, userData } = useContext(ChamaContext);
  const { balance } = useBalance();
  const { memberId } = useMembers();
  const { upcomingRotations } = useRotations();
  const [amount, setAmount] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const checkRotationEligibility = () => {
      if (!chamaData?.id || !userData?.id || !memberId || !upcomingRotations) {
        setError('Missing required data.');
        setLoading(false);
        return;
      }

      try {
        if (upcomingRotations.length === 0) {
          setIsEligible(false);
          setError('No upcoming rotations found.');
          return;
        }

        const firstRotation = upcomingRotations[0];
        const nextMemberId = firstRotation.member_id || firstRotation.member;
        if (!nextMemberId) {
          setError('No member ID found in upcoming rotations.');
          return;
        }

        const eligible = memberId === nextMemberId;
        setIsEligible(eligible);
        if (!eligible) {
          setError('You are not the next member in the rotation.');
        }
      } catch (err) {
        setError(err.message || 'Unable to verify rotation eligibility.');
        setIsEligible(false);
      } finally {
        setLoading(false);
      }
    };

    checkRotationEligibility();
  }, [chamaData, userData, memberId, upcomingRotations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    if (!isEligible) {
      toast.error('You are not eligible to request a withdrawal.');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (balance && parseFloat(amount) > balance.rotational_balance) {
      toast.error('Withdrawal amount exceeds rotational balance.');
      return;
    }
    if (!balance) {
      toast.error('No balance data available. Please contact the chama administrator.');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/transactions/withdrawal-request/`,
        {
          amount: parseFloat(amount),
          chama: chamaData.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage('Withdrawal requested successfully!');
      setAmount('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to request withdrawal.');
    }
  };

  return (
    <div className="form-container">
      <h2>Request Withdrawal</h2>
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
      {loading ? (
        <p>Loading eligibility status...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : !isEligible ? (
        <p className="error">You are not the next member in the rotation.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount (KES):</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
              disabled={!isEligible}
            />
          </div>
          {balance ? (
            <p>Available Rotational Balance: KES {balance.rotational_balance}</p>
          ) : (
            <p>No balance data available.</p>
          )}
          <button type="submit" className="submit-button" disabled={!isEligible}>
            Submit Withdrawal Request
          </button>
        </form>
      )}
    </div>
  );
};

export default WithdrawalForm;