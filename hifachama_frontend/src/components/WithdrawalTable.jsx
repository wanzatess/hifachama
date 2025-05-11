import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';
import handleWithdrawalAction from '../components/handleWithdrawalAction';
import { toast } from 'react-toastify';

const WithdrawalTable = ({ withdrawals: propWithdrawals, onAction, showActions = false, balance, role }) => {
  const [withdrawals, setWithdrawals] = useState(propWithdrawals || []);
  const [loading, setLoading] = useState(false);

  // Detailed debugging logs
  console.log("📋 WithdrawalTable Props:", { withdrawals: propWithdrawals, onAction, showActions, balance, role });
  console.log("🔍 Withdrawals Type:", typeof withdrawals, Array.isArray(withdrawals) ? 'Array' : 'Not Array');
  console.log("🔍 Withdrawals Content:", JSON.stringify(withdrawals, null, 2));

  const fetchWithdrawals = async () => {
    if (role !== 'Treasurer') {
      console.log('Skipping fetchWithdrawals: User is not a Treasurer');
      return;
    }
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get('${import.meta.env.VITE_API_URL}/api/transactions/?type=withdrawal', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWithdrawals(response.data);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      toast.error('Failed to fetch withdrawals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propWithdrawals) {
      setWithdrawals(propWithdrawals);
    } else if (role === 'Treasurer') {
      fetchWithdrawals();
    }
  }, [propWithdrawals, role]);

  // Handle invalid or empty withdrawals data
  if (!withdrawals || !Array.isArray(withdrawals) || withdrawals.length === 0) {
    console.warn("⚠️ No valid withdrawal data provided. Withdrawals:", withdrawals);
    return <div className="p-4 text-center text-[#4e4528]">No withdrawal requests available.</div>;
  }

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Withdrawal Requests</h3>
      {balance && (
        <p className="mb-2 text-[#4e4528]">
          Rotational Balance: KSh. {parseFloat(balance.rotational_balance).toFixed(2)}
        </p>
      )}
      {loading ? (
        <p className="p-4 text-center text-[#4e4528]">Loading withdrawals...</p>
      ) : (
        <div className="table-container">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#cdbe96]">
                <th className="border p-2 text-left text-[#4e4528]">Member Name</th>
                <th className="border p-2 text-left text-[#4e4528]">Amount</th>
                <th className="border p-2 text-left text-[#4e4528]">Status</th>
                <th className="border p-2 text-left text-[#4e4528]">Date</th>
                {showActions && <th className="border p-2 text-left text-[#4e4528]">Action</th>}
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal, index) => {
                // Log each withdrawal's structure
                console.log(`🔍 Withdrawal ${index} Details:`, JSON.stringify(withdrawal, null, 2));

                // Fallback values for missing or invalid properties
                const memberName = withdrawal.username || withdrawal.member_name || 'Unknown';
                const amount = withdrawal.amount
                  ? `KSh. ${parseFloat(withdrawal.amount).toFixed(2)}`
                  : 'N/A';
                const status = withdrawal.status
                  ? withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1).toLowerCase()
                  : 'Unknown';
                const date = withdrawal.date
                  ? new Date(withdrawal.date).toLocaleDateString()
                  : 'N/A';
                const actionText = status.toLowerCase() === 'pending' && !showActions
                  ? 'Awaiting Approval'
                  : status;

                return (
                  <tr
                    key={withdrawal.id || `withdrawal-${index}`}
                    className="border hover:bg-[#f0ead6]"
                  >
                    <td className="border p-2 text-[#4e4528]">{memberName}</td>
                    <td className="border p-2 text-[#4e4528]">{amount}</td>
                    <td className="border p-2 text-[#4e4528]">{status}</td>
                    <td className="border p-2 text-[#4e4528]">{date}</td>
                    {showActions ? (
                      <td className="border p-2 text-[#4e4528]">
                        {withdrawal.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleAction(withdrawal.id, 'approve', { penaltyType: 'amount', penaltyValue: 0 })}
                              className="bg-[#cdbe96] text-[#4e4528] px-2 py-1 rounded mr-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(withdrawal.id, 'reject')}
                              className="bg-[#cdbe96] text-[#4e4528] px-2 py-1 rounded"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    ) : (
                      <td className="border p-2 text-[#4e4528]">{actionText}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WithdrawalTable;