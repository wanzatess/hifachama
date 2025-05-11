import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { 
  SavingsTracker,
  DividendCalculator 
} from "../components/chama-types/Investment";
import { 
  BasicAccounting,
  FlexibleContributions 
} from "../components/chama-types/Hybrid";
import { 
  MemberRotation,
  PayoutSchedule 
} from "../components/chama-types/MerryGoRound";
import "../styles/ChamaDashboard.css";

const ChamaDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { chamaId } = useParams();
  const [loading, setLoading] = useState(true);
  const [chamaData, setChamaData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}';

  useEffect(() => {
    const fetchChamaData = async () => {
      try {
        const [chamaRes, membersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/chamas/${chamaId}/`, {
            headers: { Authorization: `Token ${localStorage.getItem('authToken')}` }
          }),
          axios.get(`${API_BASE_URL}/api/chamas/${chamaId}/members/`, {
            headers: { Authorization: `Token ${localStorage.getItem('authToken')}` }
          })
        ]);
        
        setChamaData({
          ...chamaRes.data,
          members: membersRes.data
        });
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error("Access denied");
          navigate("/dashboard");
        } else {
          toast.error("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChamaData();
  }, [chamaId]);

  const renderTypeSpecificComponents = () => {
    if (!chamaData?.chama_type) return null;

    switch(chamaData.chama_type) {
      case 'investment':
        return (
          <>
            <SavingsTracker />
            <DividendCalculator />
          </>
        );
      case 'hybrid':
        return (
          <>
            <BasicAccounting />
            <FlexibleContributions />
          </>
        );
      case 'merry_go_round':
        return (
          <>
            <MemberRotation members={chamaData.members} />
            <PayoutSchedule />
          </>
        );
      default:
        return null;
    }
  };

  const getTabLabel = () => {
    switch(chamaData?.chama_type) {
      case 'investment': return 'Portfolio Tools';
      case 'hybrid': return 'Accounting Tools';
      case 'merry_go_round': return 'Rotation Tools';
      default: return 'Chama Tools';
    }
  };

  if (loading || !user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="chama-dashboard-container">
      <header className="chama-header">
        <div className="header-left">
          <h1>{chamaData?.name || "Chama Dashboard"}</h1>
          <p className="chama-type-badge">
            {chamaData?.chama_type?.replace(/_/g, ' ') || "Type not specified"}
          </p>
        </div>
        <div className="header-right">
          <span className="user-info">
            {user.first_name} ({user.role})
          </span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="chama-content">
        <nav className="chama-sidebar">
          <button 
            className={`sidebar-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          
          <button 
            className={`sidebar-btn ${activeTab === "tools" ? "active" : ""}`}
            onClick={() => setActiveTab("tools")}
          >
            {getTabLabel()}
          </button>
          
          <button 
            className={`sidebar-btn ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
          
          <button 
            className={`sidebar-btn ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            Members
          </button>

          {user.role === "chairperson" && (
            <button 
              className={`sidebar-btn ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => setActiveTab("admin")}
            >
              Admin
            </button>
          )}
        </nav>

        <main className="main-panel">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Balance</h3>
                  <p>KES {chamaData?.total_balance?.toLocaleString() || "0"}</p>
                </div>
                <div className="stat-card">
                  <h3>Members</h3>
                  <p>{chamaData?.members?.length || "0"}</p>
                </div>
              </div>
              
              {renderTypeSpecificComponents()}
            </div>
          )}

          {activeTab === "tools" && (
            <div className="tools-tab">
              {renderTypeSpecificComponents()}
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="transactions-tab">
              <h2>Transaction History</h2>
              {/* Transaction table component */}
            </div>
          )}

          {activeTab === "members" && (
            <div className="members-tab">
              <h2>Member List</h2>
              <ul className="member-list">
                {chamaData?.members?.map(member => (
                  <li key={member.id}>
                    {member.name} - {member.role}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "admin" && user.role === "chairperson" && (
            <div className="admin-tab">
              <h2>Administration</h2>
              <div className="admin-actions">
                <button className="admin-btn">Manage Members</button>
                <button className="admin-btn">Settings</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChamaDashboard;