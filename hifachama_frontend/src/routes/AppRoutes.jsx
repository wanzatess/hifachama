import { Routes, Route } from "react-router-dom";
import React from "react";

// Pages
import Homepage from "/src/pages/HomePage";
import Login from "/src/pages/Login";
import Register from "/src/pages/Register";
import Dashboard from "/src/pages/Dashboard";
import Contributions from "/src/pages/Contributions";
import Loans from "/src/pages/Loans";
import Meetings from "/src/pages/Meetings";
import Members from "/src/pages/Members";
import Transactions from "/src/pages/Transactions";
import Withdrawals from "/src/pages/Withdrawals";
import ChamaList from "/src/pages/ChamaList";

// Protected Route Wrapper
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contributions"
        element={
          <ProtectedRoute>
            <Contributions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loans"
        element={
          <ProtectedRoute>
            <Loans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <ProtectedRoute>
            <Meetings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <Members />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/withdrawals"
        element={
          <ProtectedRoute>
            <Withdrawals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chama-list"
        element={
          <ProtectedRoute>
            <ChamaList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

