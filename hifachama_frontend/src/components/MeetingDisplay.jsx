import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import '../styles/Dashboard.css';

const MeetingDisplay = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch meeting data and filter future meetings
  const fetchMeetingData = async () => {
    try {
      const response = await api.get('/api/meetings/');
      const currentDate = new Date('2025-05-07'); // Current date as per context
      const futureMeetings = (response.data || []).filter((meeting) => {
        const meetingDate = new Date(meeting.date);
        return meetingDate >= currentDate;
      });
      setMeetings(futureMeetings);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch meeting details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingData();
  }, []);

  // Helper function to format date
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

  // Handle loading state
  if (loading) {
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

  // Handle error state
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

  // Handle empty state
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