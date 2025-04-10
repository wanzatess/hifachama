import { 
  MemberManager, 
  SavingsTracker, 
  InvestmentTracker, 
  LoanManager, 
  MeetingManager, 
  ExpenseTracker, 
  FinancialReports, 
  NotificationCenter, 
  AssetRegister 
} from '../../components/Investment';
import { BasicAccounting } from '../../components/Hybrid';
import '../../styles/Dashboard.css';
import React, { useState } from 'react';

const InvestmentDashboard = () => {
  // Shared state
  const [transactions, setTransactions] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [expenses, setExpenses] = useState([]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Investment Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
        <div className="dashboard-card">
          <MemberManager />
        </div>
        <div className="dashboard-card">
          <SavingsTracker 
            contributions={contributions} 
            setContributions={setContributions} 
          />
        </div>
        <div className="dashboard-card">
          <InvestmentTracker 
            investments={investments} 
            setInvestments={setInvestments} 
          />
        </div>
        <div className="dashboard-card">
          <LoanManager 
            loans={loans} 
            setLoans={setLoans} 
          />
        </div>
        <div className="dashboard-card">
          <MeetingManager />
        </div>
        <div className="dashboard-card">
          <ExpenseTracker 
            expenses={expenses} 
            setExpenses={setExpenses} 
          />
        </div>
        <div className="dashboard-card">
          <FinancialReports 
            contributions={contributions}
            expenses={expenses}
            investments={investments}
            loans={loans}
          />
        </div>
        <div className="dashboard-card">
          <NotificationCenter />
        </div>
        <div className="dashboard-card">
          <AssetRegister />
        </div>
      </div>
    </div>
  );
};

export default InvestmentDashboard;