import { MemberRotation, RotationAnalytics, MemberManager } from '../../components/Merrygoround';
import '../../styles/Dashboard.css';
import React, { useState } from 'react';

const MerryGoRoundDashboard = () => {
  const [members, setMembers] = useState([
    { id: 1, name: "David", role: "Chairperson", phone: "0712345678", joinDate: "2023-01-01" },
    { id: 2, name: "Eve", role: "Treasurer", phone: "0723456789", joinDate: "2023-01-01" },
    { id: 3, name: "Frank", role: "Member", phone: "0734567890", joinDate: "2023-01-15" }
  ]);
  
  const [contributions, setContributions] = useState([]);
  const [missedContributions, setMissedContributions] = useState([]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Merry-go-round Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
        <div className="dashboard-card">
          <MemberManager members={members} setMembers={setMembers} />
        </div>
        <div className="dashboard-card">
          <MemberRotation 
            members={members} 
            onUpdateMembers={setMembers}
            contributions={contributions}
            setContributions={setContributions}
            missedContributions={missedContributions}
            setMissedContributions={setMissedContributions}
          />
        </div>
        <div className="dashboard-card">
          <RotationAnalytics 
            members={members}
            contributions={contributions}
            missedContributions={missedContributions}
          />
        </div>
      </div>
    </div>
  );
};

export default MerryGoRoundDashboard;