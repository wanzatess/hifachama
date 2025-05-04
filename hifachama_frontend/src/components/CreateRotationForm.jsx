import React, { useState } from 'react';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';
import '../styles/Dashboard.css';
import { toast } from 'react-toastify';

const CreateRotationForm = ({ chamaId, onSuccess }) => {
  const [frequency, setFrequency] = useState('weekly');
  const [startDate, setStartDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `http://127.0.0.1:8080/api/chamas/${chamaId}/create-rotation/`,
        { frequency, start_date: startDate || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      onSuccess();
    } catch (err) {
      console.error('Error creating rotation:', err);
      toast.error(err.response?.data?.error || 'Failed to create rotation.');
    }
  };

  return (
    <div className="create-rotation-form">
      <h4>Create Rotation Schedule</h4>
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