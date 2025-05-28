import React, { useContext } from 'react';
import { useWithdrawals } from '../../hooks/useWithdrawals'; 
import { useBalance } from '../../hooks/useBalance'; 
import { ChamaContext } from '../../context/ChamaContext'; 
import handleWithdrawalAction from './ApproveWithdrawals';
import { toast } from 'react-toastify';

const WithdrawalTable = ({ onAction, showActions = false }) => {
  const { userData, chamaData } = useContext(ChamaContext);
  const { withdrawals } = useWithdrawals();
  const { balance } = useBalance();

  const handleAction = async (transactionId, action) => {
    const result = await handleWithdrawalAction(transactionId, action, { chamaId: chamaData.id });
    if (result && onAction) {
      onAction(result);
    }
  };

  if (!withdrawals || !Array.isArray(withdrawals) || withdrawals.length === 0) {
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
                            onClick={() => handleAction(withdrawal.id, 'approve')}
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
    </div>
  );
};

export default WithdrawalTable;