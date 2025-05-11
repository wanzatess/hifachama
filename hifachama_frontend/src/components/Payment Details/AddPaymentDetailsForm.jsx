import React, { useState, useEffect, useContext } from 'react';
import './PaymentDetails.css';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path
import { usePaymentDetails } from '../../hooks/usePaymentDetails'; // Adjust path

const AddPaymentDetailsForm = ({ onSuccess }) => {
  const { chamaData } = useContext(ChamaContext);
  const { paymentDetails, setPaymentDetails } = usePaymentDetails();
  const [paybillNumber, setPaybillNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (paymentDetails) {
      setPaybillNumber(paymentDetails.paybill_number || '');
      setTillNumber(paymentDetails.till_number || '');
      setPhoneNumber(paymentDetails.phone_number || '');
      setBankAccount(paymentDetails.bank_account || '');
    }
  }, [paymentDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!paybillNumber && !tillNumber && !phoneNumber && !bankAccount) {
      setErrorMessage('At least one field must be provided.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chamas/${chamaData.id}/add-payment-details/`,
        {
          paybill_number: paybillNumber,
          till_number: tillNumber,
          phone_number: phoneNumber,
          bank_account: bankAccount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentDetails(response.data.data);
      setSuccessMessage('Payment details updated successfully!');
      if (onSuccess) onSuccess(response.data.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to update payment details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <span className="card-icon">💳</span>
        <h3 className="card-title">Payment Details</h3>
      </div>
      {successMessage && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '0.95rem',
          backgroundColor: '#D4EDDA',
          color: '#155724'
        }}>
          <p style={{
            margin: '0',
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)'
          }}>
            {successMessage}
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="payment-details-form">
        <div className="form-group">
          <label htmlFor="paybillNumber">PayBill Number</label>
          <input
            id="paybillNumber"
            type="text"
            className="form-input"
            value={paybillNumber}
            onChange={(e) => setPaybillNumber(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter PayBill number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="tillNumber">Till Number</label>
          <input
            id="tillNumber"
            type="text"
            className="form-input"
            value={tillNumber}
            onChange={(e) => setTillNumber(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter Till number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            type="text"
            className="form-input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter Phone number"
          />
        </div>
        <div className="form-group">
          <label htmlFor="bankAccount">Bank Account</label>
          <input
            id="bankAccount"
            type="text"
            className="form-input"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            disabled={isSubmitting}
            placeholder="Enter Bank account details"
          />
        </div>
        <div className="form-group form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span> Submitting...
              </>
            ) : (
              'Save Details'
            )}
          </button>
        </div>
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
            <button
              className="error-close"
              onClick={() => setErrorMessage('')}
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddPaymentDetailsForm;