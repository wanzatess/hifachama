import React, { useState, useEffect } from 'react';
import '../styles/PaymentDetails.css';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const AddPaymentDetailsForm = ({ chamaId, initialData, onSuccess }) => {
  const [paybillNumber, setPaybillNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill form with initialData
  useEffect(() => {
    if (initialData) {
      setPaybillNumber(initialData.paybill_number || '');
      setTillNumber(initialData.till_number || '');
      setPhoneNumber(initialData.phone_number || '');
      setBankAccount(initialData.bank_account || '');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (!paybillNumber && !tillNumber && !phoneNumber && !bankAccount) {
      setErrorMessage('At least one field must be provided.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `http://127.0.0.1:8080/api/chamas/${chamaId}/add-payment-details/`,
        {
          paybill_number: paybillNumber,
          till_number: tillNumber,
          phone_number: phoneNumber,
          bank_account: bankAccount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('💳 Payment details updated:', response.data);
      onSuccess(response.data.data);
      alert('Payment details updated successfully!');
      setIsSubmitting(false);
    } catch (err) {
      console.error('❌ Error updating payment details:', err.response?.data || err.message);
      setErrorMessage(err.response?.data?.error || 'Failed to update payment details.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <span className="card-icon">💳</span>
        <h3 className="card-title">Payment Details</h3>
      </div>
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