import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ContributionForm from "../components/ContributionForm";
import ContributionHistory from "../components/ContributionHistory";
import LoanRequestForm from "../components/LoanRequestForm";

const Dashboard = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ Ensure useNavigate() is inside the component
  const [loading, setLoading] = useState(false);

  // Function to download reports with a loading state
  const downloadReport = (type) => {
    setLoading(true);
    const url = `http://127.0.0.1:8080/reports/${type}/`;
    window.open(url, "_blank"); // Opens report in a new tab for download
    setLoading(false); // Stop loading after download starts
  };

  // If no user is logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-indigo-600">Dashboard</h1>
      <p className="text-gray-700 text-lg">Welcome, {user?.email}!</p>

      {/* Role-Based Navigation */}
      <nav className="my-6">
        {user?.role === "chairperson" && (
          <Link to="/dashboard" className="text-xl text-indigo-600 hover:text-indigo-800 mr-4">
            Chairperson Dashboard
          </Link>
        )}
        {user?.role === "treasurer" && (
          <Link to="/contributions" className="text-xl text-indigo-600 hover:text-indigo-800 mr-4">
            Manage Contributions
          </Link>
        )}
        {user?.role === "member" && (
          <>
            <Link to="/contributions" className="text-xl text-indigo-600 hover:text-indigo-800 mr-4">
              Make Contributions
            </Link>
            <Link to="/loans" className="text-xl text-indigo-600 hover:text-indigo-800 mr-4">
              Apply for Loans
            </Link>
            <Link to="/withdrawals" className="text-xl text-indigo-600 hover:text-indigo-800">
              Request Withdrawals
            </Link>
          </>
        )}
      </nav>

      {/* Display Components Based on Role */}
      {user?.role === "member" && (
        <div className="space-y-6">
          <ContributionForm />
          <ContributionHistory />
          <LoanRequestForm />
        </div>
      )}

      {/* Report Download Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800">Download Reports</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => downloadReport("pdf")}
            className={`mt-2 ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white px-6 py-2 rounded-lg shadow-md`}
            disabled={loading}
          >
            {loading ? "Downloading..." : "Download PDF"}
          </button>
          <button
            onClick={() => downloadReport("excel")}
            className={`mt-2 ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"} text-white px-6 py-2 rounded-lg shadow-md`}
            disabled={loading}
          >
            {loading ? "Downloading..." : "Download Excel"}
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={() => handleLogout(navigate)} // ✅ Pass navigate here
        className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;








  
