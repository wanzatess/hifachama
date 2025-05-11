import React, { useContext } from 'react';
import { useLoans } from '../../hooks/useLoans'; // Adjust path
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path

const LoanList = () => {
  const { userData, chamaData } = useContext(ChamaContext);
  const { loans, refreshLoans } = useLoans();

  if (!loans || !Array.isArray(loans) || loans.length === 0) {
    return <div className="p-4 text-center text-[#4e4528]">No loans available.</div>;
  }

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Loan Requests</h3>
      <div className="table-container">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#cdbe96]">
              <th className="border p-2 text-left text-[#4e4528]">Member Name</th>
              <th className="border p-2 text-left text-[#4e4528]">Amount</th>
              <th className="border p-2 text-left text-[#4e4528]">Status</th>
              <th className="border p-2 text-left text-[#4e4528]">Approval Date</th>
              <th className="border p-2 text-left text-[#4e4528]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan, index) => {
              const memberName = loan.member_name || loan.username || 'Unknown';
              const amount = loan.amount
                ? `KSh. ${parseFloat(loan.amount).toFixed(2)}`
                : 'N/A';
              const status = loan.status
                ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1).toLowerCase()
                : 'Unknown';
              const approvalDate = loan.approval_date
                ? new Date(loan.approval_date).toLocaleDateString()
                : 'N/A';
              const actionText = status.toLowerCase() === 'pending' ? 'Awaiting Approval' : status;

              return (
                <tr
                  key={loan.id || `loan-${index}`}
                  className="border hover:bg-[#f0ead6]"
                >
                  <td className="border p-2 text-[#4e4528]">{memberName}</td>
                  <td className="border p-2 text-[#4e4528]">{amount}</td>
                  <td className="border p-2 text-[#4e4528]">{status}</td>
                  <td className="border p-2 text-[#4e4528]">{approvalDate}</td>
                  <td className="border p-2 text-[#4e4528]">{actionText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanList;