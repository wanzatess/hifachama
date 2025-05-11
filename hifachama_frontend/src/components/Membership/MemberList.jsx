import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Adjust path as needed
import './MemberList.css';

const MemberList = ({ chamaId, title }) => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial members data
  const fetchMembers = async () => {
    if (!chamaId) {
      setError('Chama ID is required.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data: users, error } = await supabase
        .from('HIFACHAMA_customuser')
        .select('*, HIFACHAMA_chamamember!inner(chama_id)')
        .eq('HIFACHAMA_chamamember.chama_id', chamaId);

      if (error) throw error;

      setMembers(users || []);
      setError(null);
    } catch (err) {
      setError('Failed to load members: ' + err.message);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!chamaId) return;

    fetchMembers(); // Fetch initial data

    const channel = supabase.channel(`realtime:HIFACHAMA_customuser`);
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'HIFACHAMA_customuser' },
      async () => {
        await fetchMembers(); // Re-fetch members on any change
      }
    );

    channel.subscribe((status) => {
      console.log(`📡 Subscribed to HIFACHAMA_customuser: ${status}`);
    });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
      console.log('📴 Unsubscribed from HIFACHAMA_customuser');
    };
  }, [chamaId]);

  // Handle subscription for HIFACHAMA_chamamember changes
  useEffect(() => {
    if (!chamaId) return;

    const channel = supabase.channel(`realtime:HIFACHAMA_chamamember`);
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'HIFACHAMA_chamamember' },
      async () => {
        await fetchMembers(); // Re-fetch members on membership changes
      }
    );

    channel.subscribe((status) => {
      console.log(`📡 Subscribed to HIFACHAMA_chamamember: ${status}`);
    });

    return () => {
      supabase.removeChannel(channel);
      console.log('📴 Unsubscribed from HIFACHAMA_chamamember');
    };
  }, [chamaId]);

  if (isLoading) return <p className="loading-text">Loading members...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!chamaId) return <p className="error-text">Chama ID is required.</p>;

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