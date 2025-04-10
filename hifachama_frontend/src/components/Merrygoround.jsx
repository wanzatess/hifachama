import React, { useState } from 'react';
import '../styles/Dashboard.css';

export const MemberRotation = ({ members = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotationHistory, setRotationHistory] = useState([]);

  const rotateMembers = () => {
    if (members.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % members.length;
    setCurrentIndex(nextIndex);
    
    // Add to rotation history
    const currentDate = new Date().toLocaleDateString();
    setRotationHistory([{
      date: currentDate,
      recipient: members[currentIndex].name
    }, ...rotationHistory.slice(0, 4)]); // Keep only last 5 entries
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🔁</span>
        <h3 className="card-title">Rotation Schedule</h3>
      </div>

      {members.length > 0 && (
        <div className="rotation-status">
          <h4>Current Recipient:</h4>
          <div className="current-recipient">
            {members[currentIndex].name}
          </div>
        </div>
      )}

      <button 
        className="action-btn" 
        onClick={rotateMembers}
        disabled={members.length === 0}
      >
        Rotate Members
      </button>

      {members.length > 0 && (
        <div className="upcoming-members">
          <h4>Upcoming Rotation:</h4>
          <ol className="member-list">
            {members.map((member, index) => (
              <li 
                key={index} 
                className={index === currentIndex ? 'text-success' : ''}
              >
                {index + 1}. {member.name}
                {index === currentIndex && ' (Current)'}
              </li>
            ))}
          </ol>
        </div>
      )}

      {rotationHistory.length > 0 && (
        <div className="recent-activity">
          <h4 className="activity-title">Rotation History</h4>
          <ul>
            {rotationHistory.map((item, index) => (
              <li key={index}>
                <span>{item.recipient}</span>
                <small>{item.date}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const RotationAnalytics = () => {
  // This could be a new component for rotation-specific analytics
  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📊</span>
        <h3 className="card-title">Rotation Analytics</h3>
      </div>
      <div className="recent-activity">
        <p>Rotation statistics and analytics would go here...</p>
      </div>
    </div>
  );
};

// Combined exports
export default {
  MemberRotation,
  RotationAnalytics
};