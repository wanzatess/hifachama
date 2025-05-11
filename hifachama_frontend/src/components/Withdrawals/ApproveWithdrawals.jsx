import api from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import { getAuthToken } from '../../utils/auth';

const handleWithdrawalAction = async (transactionId, action, { chamaId }) => {
  if (!transactionId || !action) {
    toast.error("Transaction ID and action are required.");
    return null;
  }

  if (action === 'approve' && !chamaId) {
    toast.error("Chama ID is required for approval.");
    return null;
  }

  const token = getAuthToken();
  if (!token) {
    toast.error('You must be logged in to perform this action.');
    return null;
  }

  const requestPayload = action === 'approve' ? {
    action,
    chama_id: chamaId,
  } : { action };

  try {
    const response = await api.post(`/api/transactions/${transactionId}/approve/`, requestPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    toast.success(`Withdrawal ${action}ed successfully.`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || `Failed to ${action} withdrawal. Please try again.`;
    toast.error(errorMessage);
    return null;
  }
};

export default handleWithdrawalAction;