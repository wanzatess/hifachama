// In Hybrid.jsx, Investment.jsx, and Merrygoround.jsx
import React, { useState } from 'react';
import '../styles/Dashboard.css';

export const SavingsTracker = () => {
  const [savings, setSavings] = useState(0);
  const [contribution, setContribution] = useState('');
  
  const handleContribution = () => {
    if (!contribution || isNaN(contribution)) return;
    setSavings(prev => prev + Number(contribution));
    setContribution('');
  };

  return (
    <div className="dashboard-card">
      <h3 className="card-title">💰 Group Savings</h3>
      <div className="stat-value">KES {savings.toLocaleString()}</div>
      
      <div className="form-group">
        <label>Add Contribution</label>
        <input 
          type="number" 
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          placeholder="Amount in KES"
        />
      </div>
      
      <button className="action-btn" onClick={handleContribution}>
        Record Contribution
      </button>
      
      <div className="recent-activity">
        <h4 className="activity-title">Recent Contributions</h4>
        {/* You can add actual transaction history here later */}
        <p>No recent contributions yet</p>
      </div>
    </div>
  );
};
