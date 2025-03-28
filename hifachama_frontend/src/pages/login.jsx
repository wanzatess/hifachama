import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error state before request

    try {
      const response = await axios.post("http://127.0.0.1:8080/api/token/", {
        email,
        password,
      });

      const { access, refresh, user } = response.data;

      // Save tokens to localStorage and sessionStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      sessionStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // Handle API error response
      if (err.response) {
        setError(err.response.data.detail || "Invalid email or password");
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(""); // Clear error when user types
          }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(""); // Clear error when user types
          }}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

