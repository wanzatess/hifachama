import React, { useState, useContext } from 'react';
import api from '../../api/axiosConfig';
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path
import '../../pages/Dashboards/Dashboard.css';

const MeetingScheduleForm = () => {
  const { chamaData } = useContext(ChamaContext);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError(null);

    try {
      await api.post('/api/meetings/', {
        title,
        date,
        location,
        agenda,
        chama: chamaData.id
      });

      setTitle('');
      setDate('');
      setLocation('');
      setAgenda('');
      setSuccessMessage('Meeting scheduled successfully!');
    } catch (err) {
      setError('Failed to schedule meeting');
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <span className="card-icon">📅</span>
        <h3 className="card-title">Schedule a New Meeting</h3>
      </div>
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