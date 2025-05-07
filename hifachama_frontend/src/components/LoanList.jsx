import React, { useState } from 'react';

const LoanList = ({ loans, userData, chamaId, refreshLoans }) => {
  const [selectedLoan, setSelectedLoan] = useState(null);

  const handleApproveClick = (loan) => {
    console.log("🔍 Approve clicked for loan:", loan);
    setSelectedLoan(loan);
  };

  console.log("📋 Rendering LoanList with loans:", loans, "userData:", userData);

  if (!loans || loans.length === 0) {
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
              <th className="border p-2 text-left text-[#4e4528]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} className="border hover:bg-[#f0ead6]">
                <td className="border p-2 text-[#4e4528]">{loan.member_name}</td>
                <td className="border p-2 text-[#4e4528]">{loan.amount}</td>
                <td className="border p-2 text-[#4e4528]">{loan.status}</td>
                <td className="border p-2">
                  {loan.status === 'pending' ? (
                    userData?.role === 'Chairperson' ? (
                      <button
                        onClick={() => handleApproveClick(loan)}
                        className="form-button"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-[#4e4528]">Pending</span>
                    )
                  ) : (
                    <span className="text-[#4e4528]">{loan.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanList;