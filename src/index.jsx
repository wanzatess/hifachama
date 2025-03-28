import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import "./styles.css"; // ✅ Ensure it's inside src/

// Create a router with the routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppRoutes />,
  },
  // Define more routes if needed
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* Updated to use RouterProvider */}
  </React.StrictMode>
);












// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

