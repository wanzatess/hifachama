import React from 'react';
import { useMembers } from '../../hooks/useMembers'; // Adjust path
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path
import './MemberList.css';

const MemberList = ({ title }) => {
  const { chamaData, isLoading: contextLoading, error: contextError } = React.useContext(ChamaContext);
  const { members } = useMembers();

  if (contextLoading) return <p className="loading-text">Loading members...</p>;
  if (contextError) return <p className="error-text">{contextError}</p>;
  if (!chamaData?.id) return <p className="error-text">Chama ID is required.</p>;

  return (
    <div className="dashboard-card member-directory-card">
      <div className="card-header">
        <span className="card-icon">👥</span>
        <h3 className="card-title">{title || 'Member Directory'}</h3>
      </div>

      <div className="member-list-container">
        <h4 className="section-title">Current Members</h4>

        {members.length === 0 ? (
          <p className="no-members">No members found.</p>
        ) : (
          <div className="table-container">
            <table className="member-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, index) => (
                  <tr key={m.id}>
                    <td>{index + 1}</td>
                    <td>{m.username || 'N/A'}</td>
                    <td>{m.role || 'Member'}</td>
                    <td>{m.phone_number || 'N/A'}</td>
                    <td>{m.email || 'N/A'}</td>
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

export default MemberList;