import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { useAuth } from '../context/AuthContext'; 

// Pages
import HomePage from '../pages/HomePage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import DashboardHome from '../pages/dashboard/DashboardHome';
import DashboardLayout from '../pages/dashboard/DashboardLayout';
import JoinChama from '../pages/dashboard/JoinChama';
import Contributions from '../pages/Contributions';
import Loans from '../pages/Loans';
import Members from '../pages/Members';
import ChamaDetails from '../pages/ChamaDetails';
import CreateChama from '../pages/dashboard/CreateChama';

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