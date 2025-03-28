import { Routes, Route } from "react-router-dom";
import React from "react";
import Login from "./pages/login";
import Register from "./pages/register";
import Homepage from "./pages/HomePage";
import Dashboard from "./pages/dashboard";
import Contributions from "./pages/contributions";
import Loans from "./pages/loans";
import Meetings from "./pages/meetings";
import Members from "./pages/members";
import Transactions from "./pages/transactions";
import Withdrawals from "./pages/withdrawals";
import ChamaList from "./pages/ChamaList";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/contributions" element={<Contributions />} />
      <Route path="/loans" element={<Loans />} />
      <Route path="/meetings" element={<Meetings />} />
      <Route path="/members" element={<Members />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/withdrawals" element={<Withdrawals />} />
      <Route path="/chama-list" element={<ChamaList />} />
    </Routes>
  );
};

export default AppRoutes;