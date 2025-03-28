import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // Importing from React Router v7
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./styles/Home.css"; // ✅ Corrected path

// Create a router with the routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppRoutes />, // Renders your routes
  },
  // Add additional routes if needed
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* ✅ RouterProvider now wraps the routes */}
  </React.StrictMode>
);













// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

