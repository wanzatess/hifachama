import React from 'react';

const LoanList = ({ loans, userData, approveLoan }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Member Name</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {loans.map((loan) => (
          <tr key={loan.id}>
            <td>{loan.memberName}</td>
            <td>{loan.amount}</td>
            <td>{loan.status}</td>
            <td>
              {loan.status === 'pending' ? (
                userData?.role === 'Chairperson' ? (
                  <button onClick={() => approveLoan(loan.id)} className="approve-button">
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
  );
};

export default LoanList;
