import React, { useState, useEffect, useContext } from "react";
import { ChamaContext } from "../../context/ChamaContext";
import "./OTPVerification.css";

const OTPVerification = ({ action, onVerify, onCancel }) => {
  const [otp, setOtp] = useState("");
  const [hasSentOtp, setHasSentOtp] = useState(false); // Local state to track OTP send
  const { userData, handleSendOTP, handleVerifyOTP, otpSent, resetOtpState } = useContext(ChamaContext);

  useEffect(() => {
    if (!action || !userData?.email) {
      onCancel();
      return;
    }

    if (!hasSentOtp && !otpSent) {
      console.log('Sending OTP for action:', action); // Debug log
      handleSendOTP(userData.email);
      setHasSentOtp(true); // Prevent further sends
    }
  }, [action, userData?.email, hasSentOtp, otpSent, handleSendOTP, onCancel]);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    const success = await handleVerifyOTP(userData.email, otp);
    if (success) {
      onVerify();
    }
  };

  const resendOTP = async () => {
    resetOtpState();
    setHasSentOtp(false); // Allow new OTP send
    await handleSendOTP(userData.email);
    alert("New OTP sent to your email.");
  };

  const handleCancel = () => {
    resetOtpState();
    setHasSentOtp(false); // Reset for future attempts
    onCancel();
  };

  if (!action || !userData?.email) {
    return null;
  }

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <h3>Enter OTP</h3>
        <p>Please check your email for the 6-digit OTP.</p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          className="otp-input"
        />
        <div className="otp-button-group">
          <button className="otp-button cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="otp-button resend" onClick={resendOTP}>
            Resend OTP
          </button>
          <button className="otp-button verify" onClick={handleVerify}>
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;