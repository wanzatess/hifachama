import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

// Pages
import HomePage from '../pages/HomePage.jsx';
import Features from '../pages/Features.jsx';
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
// Add these imports at the top of AppRoutes.jsx
import HybridDashboard from '../pages/dashboard/HybridDashboard';
import InvestmentDashboard from '../pages/dashboard/InvestmentDashboard';
import MerrygoroundDashboard from '../pages/dashboard/MerrygoroundDashboard';

// Components
import LoadingSpinner from '../components/LoadingSpinner';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/features" element={<Features />} />

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
          <Route path="create-chama" element={<CreateChama />} />
            {/* Add these new routes */}
          <Route path="hybrid/:id" element={<HybridDashboard />} />
          <Route path="merry_go_round/:id" element={<MerrygoroundDashboard />} />
          <Route path="investment/:id" element={<InvestmentDashboard />} />
        </Route>

        {/* Other Protected Routes */}
        <Route
          path="/chamas/:id"
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
    </>
  );
};

export default AppRoutes;