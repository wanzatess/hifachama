import React, { useState, useContext } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import { ChamaContext } from '../../context/ChamaContext';
import { useMembers } from '../../hooks/useMembers';
import { toast } from 'react-toastify';
import '../../pages/Dashboards/Dashboard.css';

const CreateRotationForm = ({ chamaId, userData }) => {
  const { chamaData, isLoading: chamaLoading, error: chamaError } = useContext(ChamaContext);
  const { members, loading: membersLoading, error: membersError } = useMembers();
  const [frequency, setFrequency] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [memberId, setMemberId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!userData) {
    return <div className="error-message">Error: User data is missing.</div>;
  }

  const isChairperson = userData?.role?.toLowerCase().trim() === 'chairperson';

  if (!isChairperson) {
    return <div className="error-message">Access denied. Only chairpersons can create rotation schedules.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setIsSubmitting(true);

    if (!chamaId || !chamaData?.id) {
      toast.error('Chama data is missing. Please reload the page.');
      setIsSubmitting(false);
      return;
    }

    if (!memberId) {
      toast.error('Please select a member by name for the rotation.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication token missing. Please log in.');
        setIsSubmitting(false);
        return;
      }

      const selectedMember = members.find(m => m.id === memberId);
      const payload = {
        frequency,
        start_date: startDate || undefined,
        member_id: memberId,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chamas/${chamaId}/create-rotation/`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage(
        response.data.message || 
        `Rotation schedule created successfully for ${selectedMember?.username || 'selected member'}!`
      );
      setStartDate('');
      setFrequency('weekly');
      setMemberId('');
      toast.success('Rotation created successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create rotation.';
      toast.error(errorMessage);
      console.error('Error creating rotation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (chamaLoading || membersLoading) {
    return <p>Loading rotation form...</p>;
  }

  if (chamaError) {
    return <p className="error-message">{chamaError}</p>;
  }

  if (membersError) {
    return <p className="error-message">{membersError}</p>;
  }

  if (!chamaData?.id) {
    return <p className="error-message">Chama ID is required.</p>;
  }

  return (
    <div className="create-rotation-form">
      <h4>Create Rotation Schedule</h4>

      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="frequency">Rotation Frequency</label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date (optional)</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="memberId">Select Member by Name</label>
          <select
            id="memberId"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
            disabled={isSubmitting || !members.length}
          >
            {members.length > 0 ? (
              <>
                <option value="">Select a member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.username || 'Unnamed Member'}
                  </option>
                ))}
              </>
            ) : (
              <option value="" disabled>No members available</option>
            )}
          </select>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || !members.length}
        >
          {isSubmitting ? 'Creating...' : 'Create Schedule'}
        </button>
      </form>
    </div>
  );
};

export default CreateRotationForm;