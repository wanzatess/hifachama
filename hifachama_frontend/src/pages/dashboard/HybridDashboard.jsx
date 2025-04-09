import { BasicAccounting } from '../components/Hybrid';
import { SavingsTracker } from '../components/Investment';
import { MemberRotation } from '../components/Merrygoround';

const HybridDashboard = () => {
  const dummyMembers = [
    { name: "Alice" },
    { name: "Bob" },
    { name: "Charlie" }
  ];

  return (
    <div className="dashboard-grid">
      <h1>Hybrid Chama Dashboard</h1>
      <div className="widgets-container">
        <BasicAccounting />
        <SavingsTracker />
        <MemberRotation members={dummyMembers} />
      </div>
    </div>
  );
};

export default HybridDashboard;