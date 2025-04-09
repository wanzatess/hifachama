import { MemberRotation } from '../components/Merrygoround';
import { BasicAccounting } from '../components/Hybrid';

const MerryGoRoundDashboard = () => {
  const dummyMembers = [
    { name: "David" },
    { name: "Eve" },
    { name: "Frank" }
  ];

  return (
    <div className="dashboard-grid">
      <h1>Merry-go-round Chama Dashboard</h1>
      <div className="widgets-container">
        <MemberRotation members={dummyMembers} />
        <BasicAccounting />
      </div>
    </div>
  );
};

export default MerryGoRoundDashboard;