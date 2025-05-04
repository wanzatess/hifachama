import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { getAuthToken } from '../utils/auth';

export const MeetingSchedule = () => {
  // States for fetching meeting details
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // States for scheduling a new meeting
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch the latest meeting data and user role when the component mounts
  const fetchMeetingData = async () => {
    try {
      const token = getAuthToken();
      const [meetingResponse, userResponse] = await Promise.all([
        api.get('/api/meetings/'),
        api.get('/api/users/me/', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const upcomingMeeting = meetingResponse.data[0]; // Assuming the latest meeting is the first in the list
      setMeeting(upcomingMeeting);
      setUserRole(userResponse.data.role);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch meeting details or user data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingData();
  }, []);

  // Handle form submission for scheduling a new meeting
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/api/meetings/', {
        title,
        date,
        location,
        agenda, // Use agenda field to match backend
        chama: 1 // Replace with dynamic chama ID if needed
      });

      // If successful, reset the form and show success message
      setTitle('');
      setDate('');
      setLocation('');
      setAgenda('');
      setSuccess(true);
      setError(null);
      fetchMeetingData(); // Refresh the meeting data after scheduling a new one
    } catch (err) {
      setError('Failed to schedule meeting');
      setSuccess(false);
    }
  };

  // Function to notify members
  const handleNotifyMembers = async () => {
    try {
      await api.post('/api/notify-members/', {
        meetingId: meeting.id,
      });
      alert('Members notified successfully!');
    } catch (err) {
      alert('Failed to notify members');
    }
  };

  // Render loading state or error if necessary
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="combined-meeting-schedule-form">
      {/* Display Next Meeting Details */}
      {meeting && (
        <div className="simple-card">
          <h3>📅 Next Meeting</h3>
          <p>Date: {new Date(meeting.date).toLocaleDateString()}</p>
          <p>Location: {meeting.location || 'Not specified'}</p>
          <p>Agenda: {meeting.agenda || 'No agenda provided'}</p>

          <button className="simple-button" onClick={handleNotifyMembers}>
            Notify Members
          </button>
        </div>
      )}

      {/* Form to Schedule a New Meeting - Only for Secretary */}
      {userRole === 'Secretary' && (
        <div className="schedule-meeting-form">
          <h2>Schedule a New Meeting</h2>

          {success && <p className="success-message">Meeting scheduled successfully!</p>}
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div>
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Date and Time:</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Location:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Agenda:</label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
              />
            </div>

            <button type="submit">Schedule Meeting</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MeetingSchedule;