import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

// Pages
import HomePage from '../pages/HomePage/HomePage.jsx';
import Features from '../pages/HomePage/Features.jsx';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Registration/Register.jsx';
import DashboardHome from '../pages/Dashboards/DashboardHome.jsx';
import DashboardLayout from '../pages/Dashboards/DashboardLayout.jsx';
import JoinChama from '../pages/Login/JoinChama.jsx';
import ChamaDetails from '../pages/ChamaDetails.jsx';
import CreateChama from '../pages/Login/CreateChama.jsx';
import HybridDashboard from '../pages/Dashboards/HybridDashboard';
import InvestmentDashboard from '../pages/Dashboards/InvestmentDashboard';
import MerrygoroundDashboard from '../pages/Dashboards/MerrygoroundDashboard';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const location = useLocation();

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
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
