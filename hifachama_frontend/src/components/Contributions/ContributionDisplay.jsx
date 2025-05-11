import React from 'react';
import '../../pages/Dashboards/Dashboard.css';
import '../Membership/MemberList.css';

const ContributionDisplay = ({ contributions }) => {
  // Handle loading or empty states
  if (!contributions || contributions.length === 0) {
    return (
      <div className="contribution-display-card">
        <div className="card-header">
          <span className="card-icon">💰</span>
          <h3 className="card-title">Contribution Summary</h3>
        </div>
        <p>No contributions found.</p>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not Available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not Available';
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Not Available';
    }
  };

  return (
    <div className="contribution-display-card">
      <div className="card-header">
        <span className="card-icon">💰</span>
        <h3 className="card-title">Contribution Summary</h3>
      </div>

      <div className="member-list-container">
        <h4 className="section-title">Recent Contributions</h4>
        <div className="table-container">
          <table className="member-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Type</th>
                <th>Amount (KES)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {contributions.slice(0, 5).map((c, index) => (
                <tr key={c.id}>
                  <td>{index + 1}</td>
                  <td>{c.username || 'N/A'}</td>
                  <td>{c.transaction_type || 'N/A'}</td>
                  <td>{(c.amount || 0).toFixed(2)}</td>
                  <td>{formatDate(c.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContributionDisplay;