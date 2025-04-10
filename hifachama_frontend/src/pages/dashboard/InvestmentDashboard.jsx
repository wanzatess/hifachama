import { SavingsTracker, InvestmentSummary } from '../../components/Investment';
import { BasicAccounting } from '../../components/Hybrid';
import '../../styles/Dashboard.css';
import React, { useState } from 'react';

const InvestmentDashboard = () => {
  // State to share transactions between components
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Investment Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
        <div className="dashboard-card">
          <SavingsTracker />
        </div>
        <div className="dashboard-card">
          <BasicAccounting 
            transactions={transactions} 
            setTransactions={setTransactions} 
          />
        </div>
        <div className="dashboard-card">
          <InvestmentSummary />
        </div>
      </div>
    </div>
  );
};

export default InvestmentDashboard;