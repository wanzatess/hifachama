import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // ✅ Ensure this path is correct

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Logout Function
  const handleLogout = useCallback(() => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login", { replace: true }); // ✅ Redirects user to login
  }, [navigate]);

  // ✅ Refresh Token Function
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.log("No refresh token found. Logging out...");
        return handleLogout();
      }

      const response = await api.post("/auth/refresh/", { refresh: refreshToken });
      localStorage.setItem("token", response.data.access);
      return response.data.access;
    } catch (error) {
      console.error("Token refresh failed", error);
      handleLogout();
    }
  };

  // ✅ Login Function
  const handleLogin = async (email, password) => {
    try {
      const response = await api.post("/api/login/", { username: email, password });

      localStorage.setItem("token", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("role", response.data.role);
      setUser(response.data.user);

      console.log("Login successful! Redirecting to dashboard...");
      navigate("/dashboard"); // ✅ Redirect user after login
    } catch (error) {
      console.error("Login failed", error.response?.data || error.message);
    }
  };

  // ✅ Fetch User Data (Handles expired tokens)
  const fetchUser = useCallback(async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found. User not logged in.");
        return setLoading(false);
      }

      let response = await api.get("/auth/user/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("User authenticated:", response.data);
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("Token expired, attempting to refresh...");
        const newToken = await refreshAccessToken();
        if (newToken) return fetchUser(); // Retry fetching user
      } else {
        console.error("Authentication failed. Logging out...");
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    console.log("Checking authentication...");
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout, loading }}>
      {!loading ? children : <p>Loading...</p>} {/* ✅ Prevents UI flickering */}
    </AuthContext.Provider>
  );
};

export default AuthContext;
