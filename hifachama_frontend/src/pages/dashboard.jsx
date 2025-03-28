import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ContributionForm from "../components/ContributionForm";
import ContributionHistory from "../components/ContributionHistory";
import LoanRequestForm from "../components/LoanRequestForm";
import { isLoggedIn } from "../utils/auth"; // Import the isLoggedIn function

const Dashboard = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if no user is logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Function to download reports
  const downloadReport = (type) => {
    setLoading(true);
    const url = `http://127.0.0.1:8080/reports/${type}/`;
    window.open(url, "_blank");
    setTimeout(() => setLoading(false), 2000); // Simulated loading state
  };

  // Logout function
  const handleLogoutClick = () => {
    // Clear authentication data
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    // Redirect to login page after logout
    navigate("/login");
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-indigo-600">Dashboard</h1>
      
      {/* Welcome message based on login status */}
      <p className="text-gray-700 text-lg">{isLoggedIn() ? "Welcome Back!" : "Please Login"}</p>

      <p className="text-gray-700 text-lg">Welcome, {user.email}!</p>

      {/* Role-Based Navigation */}
      <nav className="my-6 flex flex-wrap gap-4">
        {user.role === "chairperson" && (
          <Link to="/dashboard" className="btn btn-primary">
            Chairperson Dashboard
          </Link>
        )}
        {user.role === "treasurer" && (
          <Link to="/contributions" className="btn btn-primary">
            Manage Contributions
          </Link>
        )}
        {user.role === "member" && (
          <>
            <Link to="/contributions" className="btn btn-primary">
              Make Contributions
            </Link>
            <Link to="/loans" className="btn btn-primary">
              Apply for Loans
            </Link>
            <Link to="/withdrawals" className="btn btn-primary">
              Request Withdrawals
            </Link>
          </>
        )}
      </nav>

      {/* Member-Specific Components */}
      {user.role === "member" && (
        <div className="space-y-6">
          <ContributionForm />
          <ContributionHistory />
          <LoanRequestForm />
        </div>
      )}

      {/* Download Reports Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800">Download Reports</h2>
        <div className="flex gap-4">
          <button
            onClick={() => downloadReport("pdf")}
            className={`btn ${loading ? "btn-secondary" : "btn-success"}`}
            disabled={loading}
          >
            {loading ? "Downloading..." : "Download PDF"}
          </button>
          <button
            onClick={() => downloadReport("excel")}
            className={`btn ${loading ? "btn-secondary" : "btn-info"}`}
            disabled={loading}
          >
            {loading ? "Downloading..." : "Download Excel"}
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button onClick={handleLogoutClick} className="mt-6 btn btn-danger">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;