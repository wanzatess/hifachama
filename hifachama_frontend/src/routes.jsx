import { Routes, Route } from "react-router-dom";
import React from "react";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Contributions from "./pages/contributions";
import Loans from "./pages/loans";
import Withdrawals from "./pages/withdrawals";
import Meetings from "./pages/meetings";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import Homepage from "./pages/HomePage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      
      {/* Protect these routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contributions" element={<Contributions />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/withdrawals" element={<Withdrawals />} />
        <Route path="/meetings" element={<Meetings />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;



