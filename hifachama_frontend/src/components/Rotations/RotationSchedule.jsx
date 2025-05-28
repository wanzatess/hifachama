import React, { useContext } from 'react';
import { useRotations } from '../../hooks/useRotations';
import { ChamaContext } from '../../context/ChamaContext';
import '../../pages/Dashboards/Dashboard.css';

const RotationSchedule = () => {
  const { chamaData, isLoading: chamaLoading, error: chamaError } = useContext(ChamaContext);
  const { rotations, currentRotation, loading, error } = useRotations();

  console.log('RotationSchedule - Rotations:', rotations, 'Current:', currentRotation);

  if (chamaLoading || loading) {
    return <p className="loading-text">Loading rotation schedule...</p>;
  }

  if (chamaError || error) {
    return <p className="error-text">{chamaError || error}</p>;
  }

  if (!chamaData?.id) {
    return <p className="error-text">Chama ID is required.</p>;
  }

  return (
    <div className="dashboard-card rotation-schedule-card">
      <div className="card-header">
        <span className="card-icon">🔄</span>
        <h3 className="card-title">Rotation Schedule</h3>
      </div>

      <div className="rotation-details">
        <h4 className="section-title">Current Rotation</h4>
        {currentRotation ? (
          <div className="current-rotation">
            <p><strong>Member:</strong> {currentRotation.username}</p>
            <p><strong>Date:</strong> {new Date(currentRotation.cycle_date).toLocaleDateString()}</p>
            <p><strong>Frequency:</strong> {currentRotation.frequency.charAt(0).toUpperCase() + currentRotation.frequency.slice(1)}</p>
            <p><strong>Payout Amount:</strong> KSh {parseFloat(currentRotation.payout_amount || 0).toFixed(2)}</p>
            <p><strong>Status:</strong> {currentRotation.status.charAt(0).toUpperCase() + currentRotation.status.slice(1)}</p>
          </div>
        ) : (
          <p className="no-data">No current rotation available.</p>
        )}
      </div>

      <div className="upcoming-rotations">
        <h4 className="section-title">Upcoming Rotations</h4>
        {rotations.length === 0 ? (
          <p className="no-data">No upcoming rotations scheduled.</p>
        ) : (
          <div className="table-container">
            <table className="rotation-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Date</th>
                  <th>Frequency</th>
                  <th>Payout Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rotations.map((rotation, index) => (
                  <tr key={rotation.id}>
                    <td>{index + 1}</td>
                    <td>{rotation.username}</td>
                    <td>{new Date(rotation.cycle_date).toLocaleDateString()}</td>
                    <td>{rotation.frequency.charAt(0).toUpperCase() + rotation.frequency.slice(1)}</td>
                    <td>KSh {parseFloat(rotation.payout_amount || 0).toFixed(2)}</td>
                    <td>{rotation.status.charAt(0).toUpperCase() + rotation.status.slice(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RotationSchedule;