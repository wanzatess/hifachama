import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import "./styles.css"; // ✅ Ensure it's inside src/

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ Router wraps everything just once */}
      <AuthProvider>
       <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);











// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

