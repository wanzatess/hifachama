// In Hybrid.jsx, Investment.jsx, and Merrygoround.jsx
import React, { useState } from 'react';
export const BasicAccounting = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const addTransaction = () => {
    if (!amount || isNaN(amount)) return;
    
    setTransactions([...transactions, {
      id: Date.now(),
      amount: parseFloat(amount),
      description,
      date: new Date().toLocaleDateString()
    }]);
    setAmount('');
    setDescription('');
  };

  return (
    <div>
      <h3 className="card-title">📒 Basic Records</h3>
      <div className="form-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (KES)"
          step="0.01"
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
      </div>
      <button className="action-btn" onClick={addTransaction}>
        Add Entry
      </button>
      <div className="recent-activity">
        <h4 className="activity-title">Transactions</h4>
        <ul>
          {transactions.map(t => (
            <li key={t.id}>
              <span>KES {t.amount} - {t.description}</span>
              <small>{t.date}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
