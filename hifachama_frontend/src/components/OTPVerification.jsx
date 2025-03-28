import React, { useState } from "react";
import axios from "axios";

const OTPVerification = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Request OTP from the backend
  const handleRequestOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/send_otp/`,
        { email }
      );
      setMessage(response.data.message);
      setIsOtpSent(true); // OTP has been sent
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP.");
    }
  };

  // Verify OTP with the backend
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/verify_otp/`,
        { otp }
      );
      setMessage(response.data.message);
      // Redirect or update state after successful OTP verification
    } catch (err) {
      setMessage(err.response?.data?.error || "Invalid OTP.");
    }
  };

  return (
    <div className="otp-container">
      <h2>OTP Verification</h2>
      {!isOtpSent ? (
        <form onSubmit={handleRequestOtp}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Request OTP</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default OTPVerification;
