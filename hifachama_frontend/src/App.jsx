import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/dashboard";
import Loans from "./pages/loans";
import Contributions from "./pages/contributions";
import Withdrawals from "./pages/withdrawals";
import Meetings from "./pages/meetings";
import ChamaList from "./pages/ChamaList";
import Transactions from "./pages/transactions"; // ✅ Import Transactions Page
import Login from "./pages/login";
import Register from "./pages/register";
import AuthContext from "./context/AuthContext";

// ✅ Private Route Component (Redirects unauthorized users to login)
const PrivateRoute = ({ element }) => {
  const { user } = useContext(AuthContext);
  return user ? element : <Navigate to="/login" replace />;
};

function App() {
  const location = useLocation(); // ✅ Get current page URL

  // ✅ Hide Sidebar for Public Pages (Login, Register, and HomePage)
  const hideSidebar = ["/login", "/register", "/"].includes(location.pathname);

  return (
    <div className="flex h-screen bg-primary text-white">
      {!hideSidebar && <Sidebar />} {/* ✅ Sidebar only for logged-in users */}
      <div className="flex-1 p-6 bg-gray-100 text-gray-900">
        <Routes>
          {/* ✅ Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/chamas" element={<PrivateRoute element={<ChamaList />} />} />
          <Route path="/loans" element={<PrivateRoute element={<Loans />} />} />
          <Route path="/contributions" element={<PrivateRoute element={<Contributions />} />} />
          <Route path="/withdrawals" element={<PrivateRoute element={<Withdrawals />} />} />
          <Route path="/meetings" element={<PrivateRoute element={<Meetings />} />} />
          <Route path="/transactions" element={<PrivateRoute element={<Transactions />} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
