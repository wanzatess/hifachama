import { 
  MemberManager, 
  ContributionTracker, 
  MemberRotation, 
  InvestmentTracker,
  HybridReports
} from '../../components/Hybrid';
import '../../styles/Dashboard.css';
import React, { useState } from 'react';

const HybridDashboard = () => {
  const [members, setMembers] = useState([
    { id: 1, name: "Alice", role: "Chairperson", phone: "0712345678", joinDate: "2023-01-01" },
    { id: 2, name: "Bob", role: "Treasurer", phone: "0723456789", joinDate: "2023-01-01" }
  ]);
  const [contributions, setContributions] = useState([]);
  const [investments, setInvestments] = useState([]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Hybrid Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
        <div className="dashboard-card">
          <MemberManager members={members} setMembers={setMembers} />
        </div>
        <div className="dashboard-card">
          <ContributionTracker 
            members={members} 
            contributions={contributions} 
            setContributions={setContributions} 
          />
        </div>
        <div className="dashboard-card">
          <MemberRotation members={members} contributions={contributions} />
        </div>
        <div className="dashboard-card">
          <InvestmentTracker 
            investments={investments} 
            setInvestments={setInvestments} 
          />
        </div>
        <div className="dashboard-card">
          <HybridReports 
            members={members}
            contributions={contributions}
            investments={investments}
          />
        </div>
      </div>
    </div>
  );
};

export default HybridDashboard;