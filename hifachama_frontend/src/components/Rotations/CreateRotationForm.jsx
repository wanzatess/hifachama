import React, { useState } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import '../../pages/Dashboards/Dashboard.css';
import { toast } from 'react-toastify';

const CreateRotationForm = ({ chamaId, onSuccess }) => {
  const [frequency, setFrequency] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chamas/${chamaId}/create-rotation/`,
        { frequency, start_date: startDate || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message || 'Rotation schedule created successfully!');
      onSuccess();
    } catch (err) {
      console.error('Error creating rotation:', err);
      toast.error(err.response?.data?.error || 'Failed to create rotation.');
    }
  };

  return (
    <div className="create-rotation-form">
      <h4>Create Rotation Schedule</h4>
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
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="frequency">Rotation Frequency</label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            required
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
          />
        </div>
        <button type="submit" className="submit-button">
          Create Schedule
        </button>
      </form>
    </div>
  );
};

export default CreateRotationForm;