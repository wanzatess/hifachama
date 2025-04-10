import { BasicAccounting } from '../../components/Hybrid';
import { SavingsTracker } from '../../components/Investment';
import { MemberRotation } from '../../components/Merrygoround';
import '../../styles/Dashboard.css';

const HybridDashboard = () => {
  const dummyMembers = [
    { name: "Alice" },
    { name: "Bob" },
    { name: "Charlie" }
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Hybrid Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
        <div className="dashboard-card">
          <BasicAccounting />
        </div>
        <div className="dashboard-card">
          <SavingsTracker />
        </div>
        <div className="dashboard-card">
          <MemberRotation members={dummyMembers} />
        </div>
      </div>
    </div>
  );
};

export default HybridDashboard;
