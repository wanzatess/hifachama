import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    console.log("Register button clicked!"); // ✅ Debugging Step 1
    console.log("Sending request to:", "http://127.0.0.1:8080/api/register/"); // ✅ Debugging Step 2

    try {
      const response = await axios.post("http://127.0.0.1:8080/api/register/", {
        username,
        password,
        email,
      });

      console.log("Response received:", response.data); // ✅ Debugging Step 3
      setMessage("Registration successful!");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message); // ✅ Debugging Step 4
      setMessage("Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="button" onClick={handleSubmit}>Register</button> {/* ✅ Fixed button */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
