import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { getAuthToken } from '../utils/auth';
import '../styles/Dashboard.css';
import { toast } from 'react-toastify';

// Component to display the rotation schedule for a chama
const RotationSchedule = ({ members, contributions, chamaId }) => {
  const [rotation, setRotation] = useState(null); // Current rotation data
  const [countdown, setCountdown] = useState(''); // Countdown to payout
  const [noRotationMessage, setNoRotationMessage] = useState(''); // Message when no rotation exists
  const [upcomingRotations, setUpcomingRotations] = useState([]); // List of upcoming rotations
  const [nextInLineUser, setNextInLineUser] = useState(''); // Next user in line

  // Calculate total rotational contributions
  const calculateRotationalTotal = () => {
    return contributions
      .filter(c => c.transaction_type === 'rotational')
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
      .toFixed(2);
  };

  // Fetch the current rotation from the backend
  const fetchRotation = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chamas/${chamaId}/next-rotation/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('🔍 Next rotation response:', response.data);
      if (response.data.message) {
        setNoRotationMessage(response.data.message);
        setRotation(null);
      } else {
        setRotation(response.data);
        setNoRotationMessage('');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('❌ Error fetching rotation:', errorMessage);
      setNoRotationMessage('Failed to load rotation data.');
      toast.error(`Failed to load rotation data: ${errorMessage}`);
    }
  };

  // Fetch upcoming rotations from the backend
  const fetchUpcomingRotations = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chamas/${chamaId}/upcoming-rotations/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('🔍 Upcoming rotations response:', response.data);
      if (response.data.upcoming_rotations) {
        setUpcomingRotations(response.data.upcoming_rotations);
        setNextInLineUser(response.data.next_in_line || '');
      } else {
        setUpcomingRotations([]);
        setNextInLineUser('');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('❌ Error fetching upcoming rotations:', errorMessage);
      toast.error(`Failed to load upcoming rotation data: ${errorMessage}`);
    }
  };

  // Fetch rotation data on component mount or when chamaId changes
  useEffect(() => {
    if (chamaId) {
      fetchRotation();
      fetchUpcomingRotations();
    } else {
      console.warn('⚠️ chamaId is missing');
      setNoRotationMessage('Invalid chama ID.');
    }
  }, [chamaId]);

  // Update countdown timer for the current rotation
  useEffect(() => {
    const calculateCountdown = () => {
      if (!rotation?.cycle_date) {
        setCountdown('');
        return;
      }
      const now = new Date();
      const cycleDate = new Date(
        new Date(rotation.cycle_date).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })
      );
      const diff = cycleDate - now;
      if (diff <= 0) {
        setCountdown('Payout due!');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setCountdown(`${days}d ${hours}h remaining`);
    };
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 3600000); // Update hourly
    return () => clearInterval(interval);
  }, [rotation]);

  // Find the current member for the rotation
  const currentMember = members.find(m => m.id === rotation?.member_id);

  // Format payout amount to two decimal places
  const formatPayoutAmount = (amount) => {
    try {
      return Number(amount).toFixed(2);
    } catch (error) {
      console.error('❌ Error formatting payout_amount:', error, { amount, type: typeof amount });
      return '0.00';
    }
  };

  // Format date for display
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString('en-KE', {
        timeZone: 'Africa/Nairobi',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('❌ Error formatting date:', error, { date });
      return 'Invalid date';
    }
  };

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Rotation Schedule</h3>
      <div className="meeting-blocks">
        {/* Current Rotation Section */}
        <div className="meeting-block">
          <h4 className="meeting-title">Current Rotation</h4>
          <p><strong>Current Pool:</strong> KES {calculateRotationalTotal()}</p>
          {noRotationMessage ? (
            <p>{noRotationMessage}</p>
          ) : rotation ? (
            <>
              <p><strong>Member:</strong> {currentMember?.username || 'Unknown'}</p>
              <p><strong>Amount:</strong> KES {formatPayoutAmount(rotation.payout_amount)}</p>
              <p><strong>Date:</strong> {formatDate(rotation.cycle_date)}</p>
              <p><strong>Countdown:</strong> {countdown || 'N/A'}</p>
              <p className="payout-instruction">
                Note: Request your payout in the "Withdrawals" section when due.
              </p>
            </>
          ) : (
            <p>Loading rotation data...</p>
          )}
        </div>

        {/* Rotation Order Section */}
        <div className="meeting-block">
          <h4 className="meeting-title">Rotation Order</h4>
          {members.length > 0 ? (
            <ol className="member-list">
              {members.map((member) => (
                <li
                  key={member.id}
                  className={member.id === rotation?.member_id ? 'highlight' : ''}
                >
                  {member.username}
                </li>
              ))}
            </ol>
          ) : (
            <p>No members available.</p>
          )}
        </div>

        {/* Upcoming Rotations Section */}
        <div className="meeting-block">
          <h4 className="meeting-title">Upcoming Rotations</h4>
          {upcomingRotations.length > 0 ? (
            <>
              <p><strong>Next in Line:</strong> {nextInLineUser || 'Unknown'}</p>
              <ol className="member-list">
                {upcomingRotations.map((rot, index) => {
                  const member = members.find(m => m.id === rot.member_id);
                  return (
                    <li key={rot.id}>
                      {index + 1}. {member?.username || 'Unknown'} –{' '}
                      {new Date(rot.cycle_date).toLocaleDateString('en-KE')}
                    </li>
                  );
                })}
              </ol>
            </>
          ) : (
            <p>No upcoming rotations.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RotationSchedule;