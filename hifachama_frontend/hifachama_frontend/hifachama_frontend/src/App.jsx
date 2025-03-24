import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/dashboard";  
import Loans from "./pages/loans";
import Contributions from "./pages/contributions";
import Withdrawals from "./pages/withdrawals";
import Meetings from "./pages/meetings";
import ChamaList from "./pages/ChamaList";
import Login from "./pages/login";
import Register from "./pages/register";
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

// ✅ Private Route Component (Redirects unauthorized users to login)
const PrivateRoute = ({ element }) => {
  const { user } = useContext(AuthContext);
  return user ? element : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="flex h-screen bg-primary text-white">
      <Sidebar /> {/* ✅ Sidebar is outside Routes */}
      <div className="flex-1 p-6 bg-gray-100 text-gray-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ Add "/dashboard" route */}
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />

          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/chamas" element={<PrivateRoute element={<ChamaList />} />} />
          <Route path="/loans" element={<PrivateRoute element={<Loans />} />} />
          <Route path="/contributions" element={<PrivateRoute element={<Contributions />} />} />
          <Route path="/withdrawals" element={<PrivateRoute element={<Withdrawals />} />} />
          <Route path="/meetings" element={<PrivateRoute element={<Meetings />} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;





