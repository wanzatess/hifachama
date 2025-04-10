import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

export const MemberRotation = ({ members = [], onUpdateMembers }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotationHistory, setRotationHistory] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [frequency, setFrequency] = useState('Monthly');
  const [nextPayoutDate, setNextPayoutDate] = useState('');
  const [notes, setNotes] = useState('');
  const [missedContributions, setMissedContributions] = useState([]);
  const [penaltyRate, setPenaltyRate] = useState(10); // 10% penalty

  // Initialize next payout date
  useEffect(() => {
    calculateNextPayoutDate();
  }, [frequency]);

  const calculateNextPayoutDate = () => {
    const today = new Date();
    let nextDate = new Date(today);
    
    if (frequency === 'Weekly') {
      nextDate.setDate(today.getDate() + 7);
    } else {
      nextDate.setMonth(today.getMonth() + 1);
    }
    
    setNextPayoutDate(nextDate.toLocaleDateString());
  };

  const rotateMembers = () => {
    if (members.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % members.length;
    setCurrentIndex(nextIndex);
    
    // Add to rotation history
    const currentDate = new Date().toLocaleDateString();
    const newHistory = [{
      date: currentDate,
      recipient: members[currentIndex].name,
      amount: calculatePayoutAmount(),
      notes
    }, ...rotationHistory];
    
    setRotationHistory(newHistory.slice(0, 10)); // Keep last 10 entries
    setNotes('');
    calculateNextPayoutDate();
    sendNotification(`Payout completed for ${members[currentIndex].name}`);
  };

  const calculatePayoutAmount = () => {
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    return totalContributions / members.length;
  };

  const recordContribution = (memberId, amount, date = new Date().toLocaleDateString()) => {
    const newContribution = {
      memberId,
      amount: parseFloat(amount),
      date,
      status: 'Paid'
    };
    setContributions([...contributions, newContribution]);
    sendNotification(`Contribution received from ${members.find(m => m.id === memberId)?.name}`);
  };

  const recordMissedContribution = (memberId) => {
    const amount = frequency === 'Weekly' ? 500 : 2000; // Example amounts
    const newMissed = {
      memberId,
      amount,
      date: new Date().toLocaleDateString(),
      penalty: amount * (penaltyRate / 100),
      status: 'Missed'
    };
    setMissedContributions([...missedContributions, newMissed]);
    sendNotification(`${members.find(m => m.id === memberId)?.name} missed contribution`);
  };

  const sendNotification = (message) => {
    // In a real app, this would go to your notification system
    console.log('Notification:', message);
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🔁</span>
        <h3 className="card-title">Rotation Schedule</h3>
      </div>

      <div className="form-group">
        <label>Contribution Frequency</label>
        <select 
          value={frequency} 
          onChange={(e) => setFrequency(e.target.value)}
          className="form-control"
        >
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      {members.length > 0 && (
        <>
          <div className="rotation-status">
            <h4>Current Recipient:</h4>
            <div className="current-recipient">
              {members[currentIndex].name}
            </div>
            <p>Next rotation: {nextPayoutDate}</p>
            <p>Payout amount: KES {calculatePayoutAmount().toFixed(2)}</p>
          </div>

          <div className="form-group">
            <label>Rotation Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this rotation..."
              className="form-control"
            />
          </div>
        </>
      )}

      <button 
        className="action-btn" 
        onClick={rotateMembers}
        disabled={members.length === 0}
      >
        Complete Current Rotation
      </button>

      {members.length > 0 && (
        <div className="upcoming-members">
          <h4>Member Rotation Order:</h4>
          <ol className="member-list">
            {members.map((member, index) => (
              <li 
                key={member.id} 
                className={index === currentIndex ? 'text-success' : ''}
              >
                <div className="member-item">
                  <span>{index + 1}. {member.name} ({member.role || 'Member'})</span>
                  {index === currentIndex && <span className="text-success">(Current)</span>}
                  <div className="member-actions">
                    <button 
                      className="small-btn"
                      onClick={() => recordContribution(member.id, frequency === 'Weekly' ? 500 : 2000)}
                    >
                      Record Payment
                    </button>
                    <button 
                      className="small-btn text-danger"
                      onClick={() => recordMissedContribution(member.id)}
                    >
                      Mark Missed
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="recent-activity">
        <h4 className="activity-title">Rotation History</h4>
        <ul className="transaction-list">
          {rotationHistory.map((item, index) => (
            <li key={index}>
              <span>{item.recipient} - KES {item.amount?.toFixed(2)}</span>
              <small>{item.date} {item.notes && `| Notes: ${item.notes}`}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const RotationAnalytics = ({ members, contributions, missedContributions }) => {
  const calculateStats = () => {
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalMissed = missedContributions.reduce((sum, m) => sum + m.amount, 0);
    const totalPenalties = missedContributions.reduce((sum, m) => sum + m.penalty, 0);
    
    return {
      totalContributions,
      totalMissed,
      totalPenalties,
      averageContribution: contributions.length > 0 
        ? totalContributions / contributions.length 
        : 0
    };
  };

  const stats = calculateStats();

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">📊</span>
        <h3 className="card-title">Rotation Analytics</h3>
      </div>

      <div className="report-summary">
        <div className="report-item">
          <h4>Total Contributions</h4>
          <p>KES {stats.totalContributions.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Missed Contributions</h4>
          <p>KES {stats.totalMissed.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Collected Penalties</h4>
          <p>KES {stats.totalPenalties.toFixed(2)}</p>
        </div>
        <div className="report-item">
          <h4>Avg. Contribution</h4>
          <p>KES {stats.averageContribution.toFixed(2)}</p>
        </div>
      </div>

      <div className="recent-activity mt-20">
        <h4 className="activity-title">Missed Contributions</h4>
        {missedContributions.length > 0 ? (
          <ul className="transaction-list">
            {missedContributions.map((item, index) => (
              <li key={index}>
                <span>
                  {members.find(m => m.id === item.memberId)?.name || 'Unknown'} 
                  - KES {item.amount} (Penalty: KES {item.penalty.toFixed(2)})
                </span>
                <small>{item.date}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No missed contributions</p>
        )}
      </div>
    </div>
  );
};

export const MemberManager = ({ members, setMembers }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Member');
  const [phone, setPhone] = useState('');

  const addMember = () => {
    if (!name) return;
    const newMember = {
      id: Date.now(),
      name,
      role,
      phone,
      joinDate: new Date().toLocaleDateString()
    };
    setMembers([...members, newMember]);
    setName('');
    setPhone('');
    setRole('Member');
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">👥</span>
        <h3 className="card-title">Member Management</h3>
      </div>

      <div className="form-group">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
        />
      </div>
      <div className="form-group">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
        />
      </div>
      <div className="form-group">
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Member">Member</option>
          <option value="Chairperson">Chairperson</option>
          <option value="Treasurer">Treasurer</option>
          <option value="Secretary">Secretary</option>
        </select>
      </div>
      <button className="action-btn" onClick={addMember}>
        Add Member
      </button>

      <div className="recent-activity">
        <h4 className="activity-title">Member List</h4>
        <ul className="member-list">
          {members.map(m => (
            <li key={m.id} className="member-item">
              <span>{m.name} - {m.role}</span>
              <small>{m.phone} | Joined: {m.joinDate}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default {
  MemberRotation,
  RotationAnalytics,
  MemberManager
};