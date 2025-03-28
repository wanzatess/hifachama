import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
  // Define routes for the app
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Homepage />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    // Protected Routes
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/contributions",
      element: (
        <ProtectedRoute>
          <Contributions />
        </ProtectedRoute>
      ),
    },
    {
      path: "/loans",
      element: (
        <ProtectedRoute>
          <Loans />
        </ProtectedRoute>
      ),
    },
    {
      path: "/meetings",
      element: (
        <ProtectedRoute>
          <Meetings />
        </ProtectedRoute>
      ),
    },
    {
      path: "/members",
      element: (
        <ProtectedRoute>
          <Members />
        </ProtectedRoute>
      ),
    },
    {
      path: "/transactions",
      element: (
        <ProtectedRoute>
          <Transactions />
        </ProtectedRoute>
      ),
    },
    {
      path: "/withdrawals",
      element: (
        <ProtectedRoute>
          <Withdrawals />
        </ProtectedRoute>
      ),
    },
    {
      path: "/chama-list",
      element: (
        <ProtectedRoute>
          <ChamaList />
        </ProtectedRoute>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AppRoutes;

