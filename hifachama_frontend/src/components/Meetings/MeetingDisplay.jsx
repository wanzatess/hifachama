import React, { useContext } from 'react';
import { useMeetings } from '../../hooks/useMeetings'; // Adjust path
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path
import '../../pages/Dashboards/Dashboard.css';

const MeetingDisplay = () => {
  const { isLoading, error } = useContext(ChamaContext);
  const { meetings } = useMeetings();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not Available';
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Not Available';
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <span className="card-icon">📅</span>
          <h3 className="card-title">Upcoming Meetings</h3>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <span className="card-icon">📅</span>
          <h3 className="card-title">Upcoming Meetings</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  if (!meetings || meetings.length === 0) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <span className="card-icon">📅</span>
          <h3 className="card-title">Upcoming Meetings</h3>
        </div>
        <p>No upcoming meetings found.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <span className="card-icon">📅</span>
        <h3 className="card-title">Upcoming Meetings</h3>
      </div>

      <div className="meeting-blocks">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="meeting-block">
            <h4 className="meeting-title">{meeting.title || 'Untitled Meeting'}</h4>
            <p><strong>Date & Time:</strong> {formatDate(meeting.date)}</p>
            <p><strong>Location:</strong> {meeting.location || 'Not Specified'}</p>
            <p><strong>Agenda:</strong> {meeting.agenda || 'No agenda provided'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingDisplay;