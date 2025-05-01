import React from 'react';
import '../styles/Dashboard.css';

const RotationSchedule = ({ members, contributions }) => {
  const calculateRotationalTotal = () => {
    return contributions
      .filter(c => c.type === 'rotational')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🔄</span>
        <h3 className="card-title">Current Rotation</h3>
      </div>

      <div className="rotation-status">
        <h4>Current Pool:</h4>
        <p className="pool-amount">KES {calculateRotationalTotal().toFixed(2)}</p>
      </div>

      <div className="recent-activity">
        <h4 className="activity-title">Rotation Order</h4>
        <ol className="member-list">
          {members.map((member, index) => (
            <li key={member.id}>
              {index + 1}. {member.name}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RotationSchedule;
