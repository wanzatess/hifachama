import React from 'react';

const MemberList = ({ chamaId, members, title }) => {
  if (!chamaId || !members) return <p>Loading members...</p>;

  return (
    <div className="member-directory-card">
      <div className="card-header">
        <span className="card-icon">👥</span>
        <h3 className="card-title">{title || 'Member Directory'}</h3>
      </div>

      <div className="recent-activity">
        <h4 className="activity-title">Current Members</h4>

        {members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <table className="member-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, index) => (
                <tr key={m.id}>
                  <td>{index + 1}</td>
                  <td>{m.username}</td>
                  <td>{m.role || 'N/A'}</td>
                  <td>{m.phone_number || 'N/A'}</td>
                  <td>{m.email || 'N/A'}</td>
                  <td>{m.joined_at || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MemberList;