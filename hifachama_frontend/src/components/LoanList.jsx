import React, { useState } from 'react';
import LoanApprovalForm from './LoanApprovalForm';

const LoanList = ({ loans, userData, chamaId, refreshLoans }) => {
  const [selectedLoan, setSelectedLoan] = useState(null);

  const handleApproveClick = (loan) => {
    console.log("🔍 Approve clicked for loan:", loan);
    console.log("🔍 userData before passing to LoanApprovalForm:", userData);
    setSelectedLoan(loan);
  };

  const handleApprovalSuccess = (updatedLoan) => {
    console.log("✅ Loan approval success:", updatedLoan);
    setSelectedLoan(null);
    if (refreshLoans) refreshLoans();
  };

  console.log("📋 Rendering LoanList with loans:", loans, "userData:", userData);

  if (!loans || loans.length === 0) {
    return <div className="p-4">No loans available.</div>;
  }

  return (
    <div className="p-4">
      {selectedLoan && (
        <>
          <LoanApprovalForm
            loan={selectedLoan}
            onSuccess={handleApprovalSuccess}
            chamaId={chamaId}
            userData={userData}
          />
        </>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Member Name</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id} className="border">
              <td className="border p-2">{loan.member_name}</td>
              <td className="border p-2">{loan.amount}</td>
              <td className="border p-2">{loan.status}</td>
              <td className="border p-2">
                {loan.status === 'pending' ? (
                  userData?.role === 'Chairperson' ? (
                    <button
                      onClick={() => handleApproveClick(loan)}
                      className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
                    >
                      Approve
                    </button>
                  ) : (
                    <span>Pending</span>
                  )
                ) : (
                  <span>{loan.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoanList;