import { SavingsTracker } from '../components/Investment';
import { BasicAccounting } from '../components/Hybrid';

const InvestmentDashboard = () => {
  return (
    <div className="dashboard-grid">
      <h1>Investment Chama Dashboard</h1>
      <div className="widgets-container">
        <SavingsTracker />
        <BasicAccounting />
      </div>
    </div>
  );
};

export default InvestmentDashboard;