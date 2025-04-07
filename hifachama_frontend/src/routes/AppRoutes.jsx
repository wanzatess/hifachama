import { Routes, Route, Navigate } from 'react-router-dom';  // Fixed spelling
import { useContext } from 'react';
import { useAuth } from '../context/AuthContext'; 

// Pages
import HomePage from '../pages/HomePage.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import DashboardHome from '../pages/dashboard/DashboardHome.jsx';
import DashboardLayout from '../pages/dashboard/DashboardLayout.jsx';
import JoinChama from '../pages/dashboard/JoinChama.jsx';
import Contributions from '../pages/Contributions.jsx';
import Loans from '../pages/Loans.jsx';
import Members from '../pages/Members.jsx';
import ChamaDetails from '../pages/ChamaDetails.jsx';
import CreateChama from '../pages/dashboard/CreateChama.jsx';

// Components
import LoadingSpinner from '../components/LoadingSpinner';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="home" element={<DashboardHome />} />
        <Route path="join-chama" element={<JoinChama />} />
        <Route 
          path="create-chama" 
          element={<CreateChama />} 
        />
      </Route>

      {/* Other Protected Routes */}
      <Route
        path="/chama/:id"
        element={
          <PrivateRoute>
            <ChamaDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/contributions"
        element={
          <PrivateRoute>
            <Contributions />
          </PrivateRoute>
        }
      />
      <Route
        path="/loans"
        element={
          <PrivateRoute>
            <Loans />
          </PrivateRoute>
        }
      />
      <Route
        path="/members"
        element={
          <PrivateRoute>
            <Members />
          </PrivateRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;