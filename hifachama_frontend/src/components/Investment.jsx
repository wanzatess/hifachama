import React, { useState } from 'react';
import '../styles/Dashboard.css';

export const SavingsTracker = () => {
  const [savings, setSavings] = useState([]);
  const [amount, setAmount] = useState('');
  const [goal, setGoal] = useState('');

  const addSaving = () => {
    if (!amount || isNaN(amount)) return;
    setSavings([...savings, {
      id: Date.now(),
      amount: parseFloat(amount),
      goal,
      date: new Date().toLocaleDateString()
    }]);
    setAmount('');
    setGoal('');
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🎯</span>
        <h3 className="card-title">Savings Tracker</h3>
      </div>

      <div className="form-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount Saved (KES)"
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Goal"
        />
      </div>
      <button className="action-btn" onClick={addSaving}>
        Add Saving
      </button>

      <div className="recent-activity">
        <h4>Recent Savings</h4>
        <ul>
          {savings.map(s => (
            <li key={s.id}>
              <span>KES {s.amount} - {s.goal}</span>
              <small>{s.date}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
