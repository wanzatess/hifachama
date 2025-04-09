// In Hybrid.jsx, Investment.jsx, and Merrygoround.jsx
import React, { useState } from 'react';
import '../styles/Dashboard.css';

export const MemberRotation = ({ members }) => {
  const [completed, setCompleted] = useState(false);
  
  const handleComplete = () => {
    setCompleted(true);
    // Add logic to rotate members here
  };

  return (
    <div className="dashboard-card">
      <h3 className="card-title">🎯 Rotation Cycle</h3>
      
      <div className="rotation-status">
        <h4>Current Recipient:</h4>
        <div className="current-recipient">
          {members[0]?.name || "No members"}
        </div>
      </div>
      
      <div className="upcoming-members">
        <h4>Next in Rotation:</h4>
        <ul className="member-list">
          {members.slice(1).map((member, index) => (
            <li key={index} className="member-item">
              {member.name}
            </li>
          ))}
        </ul>
      </div>
      
      <button 
        className={`action-btn ${completed ? 'completed' : ''}`}
        onClick={handleComplete}
        disabled={completed}
      >
        {completed ? 'Cycle Completed' : 'Mark Current Cycle Complete'}
      </button>
    </div>
  );
};
