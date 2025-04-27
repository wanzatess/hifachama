import React, { useState } from 'react';
import axios from 'axios';

const AddPaymentDetailsForm = ({ chamaId }) => {
  const [paybillNumber, setPaybillNumber] = useState('');
  const [tillNumber, setTillNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if at least one field is filled
    if (!paybillNumber && !tillNumber && !phoneNumber) {
      setErrorMessage('At least one field (Paybill, Till, or Phone number) must be provided.');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(`https://hifachama-backend.onrender.com/api/chamas/${chamaId}/add-payment-details/`, {
        paybill_number: paybillNumber,
        till_number: tillNumber,
        phone_number: phoneNumber,
      });

      alert('Payment details added successfully!');
      setIsSubmitting(false);
    } catch (err) {
      setErrorMessage('Failed to add payment details');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-details-form">
      <h3>Add Payment Details</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>PayBill Number</label>
          <input
            type="text"
            value={paybillNumber}
            onChange={(e) => setPaybillNumber(e.target.value)}
          />
        </div>
        <div>
          <label>Till Number</label>
          <input
            type="text"
            value={tillNumber}
            onChange={(e) => setTillNumber(e.target.value)}
          />
        </div>
        <div>
          <label>Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Add Details'}
          </button>
        </div>
      </form>
      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
};

export default AddPaymentDetailsForm;
