import React from 'react';
import { usePaymentDetails } from '../../hooks/usePaymentDetails'; // Adjust path

const PaymentDetailsDisplay = () => {
  const { paymentDetails } = usePaymentDetails();

  if (!paymentDetails) return <p>Loading payment details...</p>;

  return (
    <div className="dashboard-card payment-details-card">
      <h3 style={{ marginBottom: '1rem' }}>💳 Payment Details</h3>

      {paymentDetails.till_number && (
        <p><strong>Till Number:</strong> {paymentDetails.till_number}</p>
      )}
      {paymentDetails.paybill_number && (
        <p><strong>Paybill Number:</strong> {paymentDetails.paybill_number}</p>
      )}
      {paymentDetails.bank_account && (
        <p><strong>Bank Account:</strong> {paymentDetails.bank_account}</p>
      )}
      {paymentDetails.phone_number && (
        <p><strong>Phone Number:</strong> {paymentDetails.phone_number}</p>
      )}

      {!paymentDetails.till_number &&
        !paymentDetails.paybill_number &&
        !paymentDetails.bank_account &&
        !paymentDetails.phone_number && (
          <p>No payment details have been added yet.</p>
        )}
    </div>
  );
};

export default PaymentDetailsDisplay;