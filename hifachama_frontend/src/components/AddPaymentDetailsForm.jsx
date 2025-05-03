import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../utils/auth'; // Adjust path if needed

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
          bank_account: bankAccount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("💳 Payment details updated:", response.data);
      // Call onSuccess with updated data
      onSuccess(response.data.data); // Assumes response includes serialized data
      alert('Payment details updated successfully!');
      setIsSubmitting(false);
    } catch (err) {
      console.error("❌ Error updating payment details:", err.response?.data || err.message);
      setErrorMessage(err.response?.data?.error || 'Failed to update payment details.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-details-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>PayBill Number</label>
          <input
            type="text"
            value={paybillNumber}
            onChange={(e) => setPaybillNumber(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Till Number</label>
          <input
            type="text"
            value={tillNumber}
            onChange={(e) => setTillNumber(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Bank Account</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Save Details'}
          </button>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </form>
    </div>
  );
};

export default AddPaymentDetailsForm;