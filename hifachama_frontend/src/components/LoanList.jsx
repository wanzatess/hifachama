import React from 'react';

const LoanList = ({ loans, userData, chamaId, refreshLoans }) => {
  // Detailed debugging logs
  console.log("📋 LoanList Props:", { loans, userData, chamaId, refreshLoans });
  console.log("🔍 Loans Type:", typeof loans, Array.isArray(loans) ? 'Array' : 'Not Array');
  console.log("🔍 Loans Content:", JSON.stringify(loans, null, 2));

  // Handle invalid or empty loans data
  if (!loans || !Array.isArray(loans) || loans.length === 0) {
    console.warn("⚠️ No valid loan data provided. Loans:", loans);
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
              <th className="border p-2 text -left text-[#4e4528">Approval Date</th>
              <th className="border p-2 text-left text-[#4e4528]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan, index) => {
              // Log each loan's structure
              console.log(`🔍 Loan ${index} Details:`, JSON.stringify(loan, null, 2));

              // Fallback values for missing or invalid properties
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