import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { getAuthToken } from '../../utils/auth';

/**
 * Handles approval or rejection of a withdrawal request.
 * Withdrawals are stored in the transaction table and categorized by 'withdrawal'.
 *
 * @param {string|number} transactionId - ID of the withdrawal transaction.
 * @param {'approve'|'reject'} action - The action to take.
 * @param {Object} options - Additional options for approval.
 * @param {string|number} options.chamaId - ID of the chama.
 */
const handleWithdrawalAction = async (transactionId, action, { chamaId } = {}) => {
  console.log("📤 handleWithdrawalAction called with:", { transactionId, action, chamaId });

  // Validate inputs
  if (!transactionId || !action) {
    console.error("❌ Missing required parameters:", { transactionId, action });
    toast.error("Transaction ID and action are required.");
    return null;
  }

  if (action === 'approve' && (!penaltyType || penaltyValue === undefined || !chamaId)) {
    console.error("❌ Missing approval parameters:", {chamaId });
    toast.error("chama ID is required for approval.");
    return null;
  }

  const token = getAuthToken();
  if (!token) {
    console.error("❌ No auth token found");
    toast.error('You must be logged in to perform this action.');
    return null;
  }

  const requestPayload = action === 'approve' ? {
    action,
    chama_id: chamaId,
  } : { action };

  console.log("📤 Sending API request to /api/transactions/", transactionId, "/approve/ with payload:", requestPayload);

  try {
    const response = await api.post(`/api/transactions/${transactionId}/approve/`, requestPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ API response:", response.data);
    toast.success(`Withdrawal ${action}ed successfully.`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || `Failed to ${action} withdrawal. Please try again.`;
    console.error("❌ Withdrawal action error:", error.response?.data || error.message);
    toast.error(errorMessage);
    return null;
  }
};

export default handleWithdrawalAction;