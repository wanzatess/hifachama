import { BasicAccounting } from '../../components/Hybrid';
import { SavingsTracker } from '../../components/Investment';
import { MemberRotation } from '../../components/Merrygoround';
import { BarChartComponent } from '../../components/Hybrid'; // Add this import
import '../../styles/Dashboard.css';

const HybridDashboard = () => {
  const dummyMembers = [
    { name: "Alice" },
    { name: "Bob" },
    { name: "Charlie" }
  ];

  // State to share transactions between components
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Hybrid Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
        <div className="dashboard-card">
          <BasicAccounting 
            transactions={transactions} 
            setTransactions={setTransactions} 
          />
        </div>
        <div className="dashboard-card">
          <SavingsTracker />
        </div>
        <div className="dashboard-card">
          <MemberRotation members={dummyMembers} />
        </div>
        {/* Add the Bar Chart component */}
        <div className="dashboard-card">
          <BarChartComponent transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default HybridDashboard;