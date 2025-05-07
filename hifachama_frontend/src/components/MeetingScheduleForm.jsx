import React, { useState } from 'react';
import api from '../api/axiosConfig';
import '../styles/Dashboard.css';

const MeetingScheduleForm = ({ chamaId }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission for scheduling a new meeting
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/api/meetings/', {
        title,
        date,
        location,
        agenda,
        chama: chamaId // Use dynamic chama ID
      });

      // Reset form and show success message
      setTitle('');
      setDate('');
      setLocation('');
      setAgenda('');
      setSuccess(true);
      setError(null);
    } catch (err) {
      setError('Failed to schedule meeting');
      setSuccess(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <span className="card-icon">📅</span>
        <h3 className="card-title">Schedule a New Meeting</h3>
      </div>

      {success && <p className="success-message">Meeting scheduled successfully!</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="schedule-meeting-form">
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Date and Time:</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Agenda:</label>
          <textarea
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            className="form-textarea"
          />
        </div>

        <button type="submit" className="form-button">Schedule Meeting</button>
      </form>
    </div>
  );
};

export default MeetingScheduleForm;