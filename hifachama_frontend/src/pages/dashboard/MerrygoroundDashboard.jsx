import { MemberRotation, RotationAnalytics } from '../../components/Merrygoround';
import { BasicAccounting } from '../../components/Hybrid';
import '../../styles/Dashboard.css';
import React, { useState } from 'react';

const MerryGoRoundDashboard = () => {
  const dummyMembers = [
    { name: "David" },
    { name: "Eve" },
    { name: "Frank" }
  ];
  
  // State to share transactions between components
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Merry-go-round Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
        <div className="dashboard-card">
          <MemberRotation members={dummyMembers} />
        </div>
        <div className="dashboard-card">
          <BasicAccounting 
            transactions={transactions} 
            setTransactions={setTransactions} 
          />
        </div>
        <div className="dashboard-card">
          <RotationAnalytics />
        </div>
      </div>
    </div>
  );
};

export default MerryGoRoundDashboard;