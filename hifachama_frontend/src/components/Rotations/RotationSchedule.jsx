import React, { useEffect, useContext, useState } from 'react';
import { useMembers } from '../../hooks/useMembers';
import { useContributions } from '../../hooks/useContributions';
import { useRotations } from '../../hooks/useRotations';
import { ChamaContext } from '../../context/ChamaContext';
import '../../pages/Dashboards/Dashboard.css';
import { toast } from 'react-toastify';

const RotationSchedule = () => {
  const { chamaData } = useContext(ChamaContext);
  const { members } = useMembers();
  const { contributions } = useContributions();
  const { rotation, upcomingRotations, nextInLineUser, noRotationMessage } = useRotations();
  const [countdown, setCountdown] = useState('');

  const calculateRotationalTotal = () => {
    return contributions
      .filter(c => c.transaction_type === 'rotational')
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
      .toFixed(2);
  };

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
    const interval = setInterval(calculateCountdown, 3600000);
    return () => clearInterval(interval);
  }, [rotation]);

  const currentMember = members.find(m => m.id === rotation?.member_id);

  const formatPayoutAmount = (amount) => {
    try {
      return Number(amount).toFixed(2);
    } catch {
      return '0.00';
    }
  };

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
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="dashboard-card">
      <h3 className="card-title">Rotation Schedule</h3>
      <div className="meeting-blocks">
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

        <div className="meeting-block">
          <h4 className="meeting-title">Upcoming Rotations</h4>
          {Array.isArray(upcomingRotations) && upcomingRotations.length > 0 ? (
            <>
              <p><strong>Next in Line:</strong> {nextInLineUser || 'Unknown'}</p>
              <ol className="member-list">
                {upcomingRotations.map((rot, index) => {
                  const member =  member = members.find(m => m.id === rot.member_id);
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