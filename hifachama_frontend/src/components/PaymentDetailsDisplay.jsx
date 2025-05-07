import React from 'react';

const PaymentDetailsDisplay = ({ details }) => {
  if (!details) return <p>Loading payment details...</p>;

  return (
    <div className="dashboard-card payment-details-card">
      <h3 style={{ marginBottom: '1rem' }}>💳 Payment Details</h3>

      {details.till_number && (
        <p><strong>Till Number:</strong> {details.till_number}</p>
      )}
      {details.paybill_number && (
        <p><strong>Paybill Number:</strong> {details.paybill_number}</p>
      )}
      {details.bank_account && (
        <p><strong>Bank Account:</strong> {details.bank_account}</p>
      )}
      {details.phone_number && (
        <p><strong>Phone Number:</strong> {details.phone_number}</p>
      )}

      {/* Optional fallback if all fields are empty */}
      {!details.till_number &&
        !details.paybill_number &&
        !details.bank_account &&
        !details.phone_number && (
          <p>No payment details have been added yet.</p>
        )}
    </div>
  );
};

export default PaymentDetailsDisplay;
