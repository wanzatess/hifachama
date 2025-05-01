import React, { useEffect, useState } from 'react';

const MemberList = ({ chamaId }) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!chamaId) return;

    console.log("🔁 Fetching members for chamaId:", chamaId);

    const fetchMembers = async () => {
      try {
        const res = await fetch(`https://hifachama-backend.onrender.com/api/chama-members/?chama_id=${chamaId}`);
        const data = await res.json();
        setMembers(data);
        console.log("📦 Members fetched:", data);
      } catch (err) {
        console.error("❌ Failed to fetch members:", err);
      }
    };

    fetchMembers();
  }, [chamaId]);

  if (!chamaId) return <p>Loading members...</p>;

  return (
    <div className="member-directory-card">
      <div className="card-header">
        <span className="card-icon">👥</span>
        <h3 className="card-title">Member Directory</h3>
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
                  <td>{m.user.username}</td>
                  <td>{m.role}</td>
                  <td>{m.user.phone_number || 'N/A'}</td>
                  <td>{m.user.email || 'N/A'}</td>
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
