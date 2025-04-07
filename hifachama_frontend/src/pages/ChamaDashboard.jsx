import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthProvider } from "../context/AuthContext";
import "../styles/ChamaDashboard.css";

const ChamaDashboard = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const { chamaId } = useParams();
  const [loading, setLoading] = useState(true);
  const [chamaData, setChamaData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hifachama-backend.onrender.com';

  useEffect(() => {
    const fetchChamaData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/chamas/${chamaId}/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem('authToken')}`
          }
        });
        setChamaData(response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error("You don't have access to this Chama");
          navigate("/dashboard");
        } else {
          toast.error("Failed to load Chama data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChamaData();
  }, [chamaId]);

  const handleLogoutClick = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    handleLogout();
    navigate("/login");
  };

  if (!user || loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="chama-dashboard-container">
      {/* Header Section */}
      <header className="chama-header">
        <div className="header-left">
          <h1 className="chama-name">{chamaData?.name || "Chama"}</h1>
          <p className="chama-description">{chamaData?.description}</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user.first_name || user.username}</span>
            <span className="user-role">({user.role})</span>
          </div>
          <button onClick={handleLogoutClick} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="chama-content">
        {/* Sidebar Navigation */}
        <nav className="chama-sidebar">
          <button 
            className={`sidebar-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
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
          <button 
            className={`sidebar-btn ${activeTab === "loans" ? "active" : ""}`}
            onClick={() => setActiveTab("loans")}
          >
            Loans
          </button>
          <button 
            className={`sidebar-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
          {user.role === "chairperson" && (
            <button 
              className={`sidebar-btn ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => setActiveTab("admin")}
            >
              Admin Tools
            </button>
          )}
        </nav>

        {/* Main Panel */}
        <main className="main-panel">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Balance</h3>
                  <p className="stat-value">KES {chamaData?.total_balance?.toLocaleString() || "0"}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Members</h3>
                  <p className="stat-value">{chamaData?.member_count || "0"}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Loans</h3>
                  <p className="stat-value">{chamaData?.active_loans || "0"}</p>
                </div>
                <div className="stat-card">
                  <h3>Next Contribution</h3>
                  <p className="stat-value">KES {chamaData?.contribution_amount || "0"} {chamaData?.contribution_frequency}</p>
                </div>
              </div>

              <div className="recent-activity">
                <h2>Recent Transactions</h2>
                {/* Transaction list component would go here */}
                <div className="activity-list">
                  {chamaData?.recent_transactions?.map(tx => (
                    <div key={tx.id} className="activity-item">
                      <div className="activity-details">
                        <span className="activity-type">{tx.type}</span>
                        <span className="activity-amount">KES {tx.amount}</span>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-date">{tx.date}</span>
                        <span className="activity-member">{tx.member}</span>
                      </div>
                    </div>
                  )) || <p>No recent transactions</p>}
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="transactions-tab">
              <h2>Transaction History</h2>
              {/* Full transaction table would go here */}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="reports-tab">
              <h2>Generate Reports</h2>
              <div className="report-options">
                <button className="report-btn">Financial Statement</button>
                <button className="report-btn">Member Contributions</button>
                <button className="report-btn">Loan Portfolio</button>
              </div>
            </div>
          )}

          {/* Admin Tab (Chairperson only) */}
          {activeTab === "admin" && user.role === "chairperson" && (
            <div className="admin-tab">
              <h2>Administration Tools</h2>
              <div className="admin-actions">
                <button className="admin-btn">Manage Members</button>
                <button className="admin-btn">Adjust Contributions</button>
                <button className="admin-btn">Chama Settings</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChamaDashboard;
