import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Ensure this path is correct

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Logout Function
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login", { replace: true }); // Ensures history is reset
  }, [navigate]);

  // ✅ Refresh Token Function
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return handleLogout();

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

      // Redirect based on role (Optional)
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error.response?.data || error.message);
    }
  };

  // ✅ Fetch User Data (Handles expired tokens)
  const fetchUser = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) return setLoading(false);

      let response = await api.get("/auth/user/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // Attempt token refresh if unauthorized
        const newToken = await refreshAccessToken();
        if (newToken) return fetchUser();
      }
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    console.log("Checking auth...");
    console.log("Token found:", token);
  
    if (token) {
      api
        .get("/auth/user/", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          console.log("User data:", response.data);
          setUser(response.data);
        })
        .catch(() => {
          console.log("Auth check failed, logging out...");
          handleLogout();
        })
        .finally(() => {
          console.log("Finished checking auth, setting loading to false.");
          setLoading(false);
        });
    } else {
      console.log("No token found, setting loading to false.");
      setLoading(false);
    }
  }, [handleLogout]);
  

  return (
    <AuthContext.Provider value={{ user, handleLogin, handleLogout, loading }}>
      {!loading && children} {/* Prevents UI from rendering until auth check is done */}
    </AuthContext.Provider>
  );
};

export default AuthContext;




