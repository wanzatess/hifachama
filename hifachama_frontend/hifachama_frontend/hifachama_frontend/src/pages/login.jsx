import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/login/", { username, password });
      const token = response.data.access;
      const decodedToken = jwtDecode(token); // ✅ Correct function usage

      // Store token and user role
      localStorage.setItem("token", token);
      localStorage.setItem("role", decodedToken.role); // Assuming the role is available in the token

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default Login;





