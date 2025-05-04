import React, { useEffect, useState } from 'react';
import axios from 'axios';
import handleWithdrawalAction from '../components/handleWithdrawalAction';
import { getAuthToken } from '../utils/auth';

const WithdrawalTable = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get('http://127.0.0.1:8080/api/transactions/?type=withdrawal', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWithdrawals(response.data);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (transactionId, action) => {
    const result = await handleWithdrawalAction(transactionId, action);
    if (result) {
      fetchWithdrawals(); // Refresh list after success
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return (
    <div>
      <h2>Withdrawal Requests</h2>
      {loading ? (
        <p>Loading withdrawals...</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan="5">No withdrawal requests found.</td>
              </tr>
            ) : (
              withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td>{withdrawal.member_name || 'Unknown'}</td>
                  <td>KES {withdrawal.amount}</td>
                  <td>{withdrawal.status}</td>
                  <td>{new Date(withdrawal.date).toLocaleDateString()}</td>
                  <td>
                    {withdrawal.status === 'pending' ? (
                      <>
                        <button onClick={() => handleAction(withdrawal.id, 'approve')}>Approve</button>{' '}
                        <button onClick={() => handleAction(withdrawal.id, 'reject')}>Reject</button>
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WithdrawalTable;
