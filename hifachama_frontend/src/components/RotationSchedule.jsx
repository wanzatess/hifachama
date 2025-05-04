import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { getAuthToken } from '../utils/auth';
import CreateRotationForm from './CreateRotationForm';
import '../styles/Dashboard.css';
import { toast } from 'react-toastify';

const RotationSchedule = ({ members, contributions, chamaId, role }) => {
  const [rotation, setRotation] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [noRotationMessage, setNoRotationMessage] = useState('');
  const [upcomingRotations, setUpcomingRotations] = useState([]);
  const [nextInLineUser, setNextInLineUser] = useState('');

  console.log('🔍 RotationSchedule props:', { chamaId, role });
  console.log('🔍 RotationSchedule state:', { rotation, noRotationMessage });

  const calculateRotationalTotal = () => {
    return contributions
      .filter(c => c.transaction_type === 'rotational')
      .reduce((sum, c) => sum + (c.amount || 0), 0);
  };

  const fetchRotation = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://127.0.0.1:8080/api/chamas/${chamaId}/next-rotation/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.message) {
        setNoRotationMessage(response.data.message);
        setRotation(null);
      } else {
        setRotation(response.data);
        setNoRotationMessage('');
      }
    } catch (err) {
      console.error('❌ Error fetching rotation:', err);
      setNoRotationMessage('Failed to load rotation data.');
      toast.error('Failed to load rotation data.');
    }
  };

  const fetchUpcomingRotations = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://127.0.0.1:8080/api/chamas/${chamaId}/upcoming-rotations/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.upcoming_rotations) {
        setUpcomingRotations(response.data.upcoming_rotations);
        setNextInLineUser(response.data.next_in_line || '');
      } else {
        setUpcomingRotations([]);
        setNextInLineUser('');
      }
    } catch (err) {
      console.error('❌ Error fetching upcoming rotations:', err);
      toast.error('Failed to load upcoming rotation data.');
    }
  };

  useEffect(() => {
    if (chamaId) {
      fetchRotation();
      fetchUpcomingRotations();
    } else {
      console.warn('⚠️ chamaId is missing');
    }
  }, [chamaId]);

  useEffect(() => {
    const calculateCountdown = () => {
      if (!rotation?.cycle_date) return;
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
    const interval = setInterval(calculateCountdown, 3600000); // hourly
    return () => clearInterval(interval);
  }, [rotation]);

  const currentMember = members.find(m => m.id === rotation?.member_id);

  const formatPayoutAmount = (amount) => {
    try {
      return Number(amount).toFixed(2);
    } catch (error) {
      console.error('❌ Error formatting payout_amount:', error, { amount, type: typeof amount });
      return '0.00';
    }
  };

  return (
    <div>
      <div className="card-header">
        <span className="card-icon">🔄</span>
        <h3 className="card-title">Current Rotation</h3>
      </div>

      <div className="rotation-status">
        <h4>Current Pool:</h4>
        <p className="pool-amount">KES {calculateRotationalTotal().toFixed(2)}</p>
      </div>

      <div className="rotation-status">
        <h4>Next Payout:</h4>
        {noRotationMessage ? (
          <>
            <p>{noRotationMessage}</p>
            {role === 'Chairperson' ? (
              <CreateRotationForm chamaId={chamaId} onSuccess={() => {
                fetchRotation();
                fetchUpcomingRotations();
              }} />
            ) : (
              <p>Waiting for chairperson to create rotation schedule.</p>
            )}
          </>
        ) : rotation ? (
          <>
            <p>Member: {currentMember?.username || 'Unknown'}</p>
            <p>Amount: KES {formatPayoutAmount(rotation.payout_amount)}</p>
            <p>
              Date: {new Date(rotation.cycle_date).toLocaleString('en-KE', {
                timeZone: 'Africa/Nairobi',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p>Countdown: {countdown}</p>
            <p className="payout-instruction">
              Note: Request your payout in the "Withdrawals" section when due.
            </p>
          </>
        ) : (
          <p>Loading rotation data...</p>
        )}
      </div>

      <div className="recent-activity">
        <h4 className="activity-title">Rotation Order</h4>
        <ol className="member-list">
          {members.map((member, index) => (
            <li key={member.id} className={member.id === rotation?.member_id ? 'highlight' : ''}>
              {index + 1}. {member.username}
            </li>
          ))}
        </ol>
      </div>

      <div className="recent-activity">
        <h4 className="activity-title">Upcoming Rotations</h4>
        {upcomingRotations.length > 0 ? (
          <>
            <p>🎯 Next in line: <strong>{nextInLineUser}</strong></p>
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
          <p>No upcoming rotations</p>
        )}
      </div>
    </div>
  );
};

export default RotationSchedule;
