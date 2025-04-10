import React, { useState } from 'react';
import '../styles/Dashboard.css';

export const MemberRotation = ({ members = [] }) => {
  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🔁</span>
        <h3 className="card-title">Rotation Schedule</h3>
      </div>

      <div className="rotation-list">
        {members.length === 0 ? (
          <p>No members available.</p>
        ) : (
          <ol>
            {members.map((member, index) => (
              <li key={index}>
                {index + 1}. {member.name}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};
