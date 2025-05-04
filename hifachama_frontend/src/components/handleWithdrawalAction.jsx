// utils/handleWithdrawalAction.js

import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthToken } from '../utils/auth';

/**
 * Handles approval or rejection of a withdrawal request.
 * Withdrawals are stored in the transaction table and categorized by 'withdrawal'.
 *
 * @param {string|number} transactionId - ID of the withdrawal transaction.
 * @param {'approve'|'reject'} action - The action to take.
 */
const handleWithdrawalAction = async (transactionId, action) => {
  try {
    const token = getAuthToken();
    if (!token) {
      toast.error('You must be logged in to perform this action.');
      return;
    }

    const response = await axios.post(
      `http://127.0.0.1:8080/api/transactions/${transactionId}/approve/`,
      { action }, // e.g. { action: 'approve' } or { action: 'reject' }
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(`Withdrawal ${action}d successfully.`);
    return response.data;
  } catch (error) {
    console.error('❌ Withdrawal action failed:', error);
    toast.error(
      error.response?.data?.error || `Failed to ${action} withdrawal. Please try again.`
    );
    return null;
  }
};

export default handleWithdrawalAction;
