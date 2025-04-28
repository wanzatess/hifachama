import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const MeetingScheduleAndForm = () => {
  // States for fetching meeting details
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for scheduling a new meeting
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Fetch the latest meeting data when the component mounts
  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        const response = await axios.get('https://hifachama-backend.onrender.com/api/meetings/');
        const upcomingMeeting = response.data[0]; // Assuming the latest meeting is the first in the list
        setMeeting(upcomingMeeting);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch meeting details');
        setLoading(false);
      }
    };

    fetchMeetingData();
  }, []);

  // Handle form submission for scheduling a new meeting
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make API request to create a meeting
      const response = await axios.post(
        'https://hifachama-backend.onrender.com/api/meetings/',
        {
          title,
          date,
          location,
          agenda
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem('authToken')}` // Ensure user is authenticated
          }
        }
      );

      // If successful, reset the form and show success message
      setTitle('');
      setDate('');
      setLocation('');
      setAgenda('');
      setSuccess(true);
      setError(null);
      fetchMeetingData();  // Refresh the meeting data after scheduling a new one
    } catch (err) {
      // If there's an error, show the error message
      setError('Failed to schedule meeting');
      setSuccess(false);
    }
  };

  // Function to notify members
  const handleNotifyMembers = async () => {
    try {
      await axios.post('https://hifachama-backend.onrender.com/api/notify-members/', {
        meetingId: meeting.id, // Send meeting ID to notify relevant members
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
          <p>Location: {meeting.location}</p>
          <p>Agenda: {meeting.agenda || 'No agenda set yet'}</p>

          <button className="simple-button" onClick={handleNotifyMembers}>
            Notify Members
          </button>
        </div>
      )}

      {/* Form to Schedule a New Meeting */}
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
    </div>
  );
};
