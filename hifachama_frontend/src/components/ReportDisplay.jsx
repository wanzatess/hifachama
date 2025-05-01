import React from 'react';
import '../styles/Dashboard.css';

const ReportDisplay = ({ members = [], contributions = [], loans = [] }) => {
  const calculateStats = () => {
    const rotationalTotal = contributions
      .filter(c => c.type === 'rotational')
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    const investmentTotal = contributions
      .filter(c => c.type === 'investment')
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    const totalLoans = loans
      .reduce((sum, l) => sum + (l.amount || 0), 0);

    return {
      rotationalTotal,
      investmentTotal,
      totalLoans,
      memberCount: members.length
    };
  };

  const stats = calculateStats();

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📊</span>
        <h3 className="card-title">Financial Summary</h3>
      </div>

      <div className="report-summary">
        <div className="report-item">
          <h4>Rotational Pool</h4>
          <p>KES {stats.rotationalTotal.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Investment Pool</h4>
          <p>KES {stats.investmentTotal.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Active Loans</h4>
          <p>KES {stats.totalLoans.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Total Members</h4>
          <p>{stats.memberCount}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;
