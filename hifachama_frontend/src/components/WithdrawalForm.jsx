import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';
import { toast } from 'react-toastify';
import '../styles/Form.css';

const WithdrawalForm = ({ chamaId, userId, balance, memberId }) => {
  const [amount, setAmount] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const checkRotationEligibility = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found.');
      }

      console.log('🔍 Checking rotation eligibility for chama:', chamaId, 'user:', userId);

      const rotationResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chamas/${chamaId}/upcoming-rotations/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('📡 Rotation response:', rotationResponse.data);

      if (rotationResponse.data.message === 'No upcoming rotations') {
        setIsEligible(false);
        setError('No upcoming rotations found.');
        return;
      }

      let nextMemberId;
      if (rotationResponse.data.upcoming_rotations && Array.isArray(rotationResponse.data.upcoming_rotations) && rotationResponse.data.upcoming_rotations.length > 0) {
        const firstRotation = rotationResponse.data.upcoming_rotations[0];
        nextMemberId = firstRotation.member_id || firstRotation.member;
        if (!nextMemberId) {
          throw new Error('No member ID found in upcoming rotations.');
        }
      } else if (rotationResponse.data.member) {
        nextMemberId = rotationResponse.data.member;
      } else if (rotationResponse.data.member_id) {
        nextMemberId = rotationResponse.data.member_id;
      } else {
        throw new Error('Rotation response missing member ID or invalid structure.');
      }

      console.log('🔄 Next rotation member ID:', nextMemberId);

      let currentMemberId = memberId;
      if (!currentMemberId) {
        console.log('🔍 Fetching member data for user:', userId, 'chama:', chamaId);
        const memberResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/chama-members/?user=${userId}&chama=${chamaId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('📡 Member response:', memberResponse.data);

        if (!memberResponse.data.members || !Array.isArray(memberResponse.data.members)) {
          throw new Error('Invalid member data structure.');
        }

        const currentMember = memberResponse.data.members.find(m => m.user === userId);
        if (!currentMember) {
          throw new Error('No member found for this user in the chama.');
        }
        currentMemberId = currentMember.id;
        console.log('👤 Current member ID:', currentMemberId);
      }

      const eligible = currentMemberId === nextMemberId;
      setIsEligible(eligible);
      if (!eligible) {
        setError('You are not the next member in the rotation.');
      }
    } catch (err) {
      console.error('❌ Error checking rotation eligibility:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Unable to verify rotation eligibility. Please try again.';
      setError(errorMessage);
      setIsEligible(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chamaId && userId) {
      checkRotationEligibility();
    } else {
      setError('Missing chama or user information.');
      setLoading(false);
    }
  }, [chamaId, userId]);

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
        '${import.meta.env.VITE_API_URL}/api/transactions/withdrawal-request/',
        {
          amount: parseFloat(amount),
          chama: chamaId,
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