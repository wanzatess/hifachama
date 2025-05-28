import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';
import { toast } from 'react-toastify';

export const ChamaContext = createContext();

export const ChamaProvider = ({ children }) => {
  console.log('ChamaProvider instantiated'); // Debug multiple providers

  const [userData, setUserData] = useState(null);
  const [chamaData, setChamaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const fetchUserAndChamaData = async () => {
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token) {
      setError('Please log in to access the dashboard.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Get user info
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;
      console.log('User API response:', user);

      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('Invalid user data received from API');
      }

      setUserData(user);

      if (!user?.chama_id) {
        setError('No chama found. Please join or create a chama.');
        setIsLoading(false);
        return;
      }

      // 2. Fetch chama details separately by chama_id to get chama_type
      const chamaResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/chamas/${user.chama_id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const chamaData = chamaResponse.data;

      // 3. Set chama data including chama_type
      const chama = {
        id: chamaData.id,
        name: chamaData.name || 'Unnamed Chama',
        chama_type: chamaData.chama_type || 'unknown',
      };

      setChamaData(chama);

    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Error fetching user or chama data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this useEffect to call fetchUserAndChamaData automatically on mount
  useEffect(() => {
    fetchUserAndChamaData();
  }, []);

  const handleSendOTP = async (email) => {
    if (otpSent) {
      toast.info('OTP already sent. Please check your email.');
      return;
    }

    const token = getAuthToken();
    try {
      console.log('Sending OTP request for:', email); // Debug OTP send
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/otp/send/`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(true);
      toast.success('OTP sent to your email.');
    } catch (err) {
      setOtpSent(false);
      toast.error('Failed to send OTP: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleVerifyOTP = async (email, otp) => {
    const token = getAuthToken();
    try {
      console.log('Verification payload:', { email, otp }); // Debug payload
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/otp/verify/`,
        { email, otp: String(otp) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(false);
      toast.success('OTP verified!');
      return true;
    } catch (err) {
      console.error('Verification error:', err.response?.data || err.message);
      toast.error('Invalid OTP: ' + (err.response?.data?.error || err.message));
      return false;
    }
  };

  const resetOtpState = () => {
    setOtpSent(false);
  };

  return (
    <ChamaContext.Provider
      value={{
        userData,
        chamaData,
        isLoading,
        error,
        fetchUserAndChamaData,
        handleSendOTP,
        handleVerifyOTP,
        resetOtpState,
      }}
    >
      {children}
    </ChamaContext.Provider>
  );
};
