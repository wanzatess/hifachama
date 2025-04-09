import { SavingsTracker } from '../components/Investment';
import { BasicAccounting } from '../components/Hybrid';
import './Dashboard.css';

const InvestmentDashboard = () => {
  return (
    <div className="dashboard-main">
      <h1 className="dashboard-title">Investment Chama Dashboard</h1>
      <div className="dashboard-grid">
        <SavingsTracker />
        <BasicAccounting />
      </div>
    </div>
  );
};

export default InvestmentDashboard;