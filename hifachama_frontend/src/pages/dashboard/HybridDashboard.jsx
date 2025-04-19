import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import {
  MemberManager,
  ContributionTracker,
  MemberRotation,
  HybridReports,
} from '../../components/Hybrid';
import ContributionForm from '../../components/ContributionForm';
import WithdrawalForm from '../../components/WithdrawalForm';
import '../../styles/Dashboard.css';

const HybridDashboard = () => {
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loans, setLoans] = useState([]);
  const [userData, setUserData] = useState(null);
  const [chamaData, setChamaData] = useState(null);

  // Fetch current user and chama
  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      if (!token) return;
      try {
        const { data: user } = await axios.get(
          'https://hifachama-backend.onrender.com/api/current_user/',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserData(user);
        const chamaId = user?.chama_memberships?.[0]?.chama?.id;
        if (chamaId) {
          const { data: chama } = await axios.get(
            `https://hifachama-backend.onrender.com/api/chamas/${chamaId}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setChamaData(chama);
        }
      } catch (err) {
        console.error('Error fetching user/chama:', err);
      }
    };
    fetchUser();
  }, []);

  // Fetch supabase data
  const fetchData = async () => {
    const [{ data: m }, { data: t }, { data: mt }, { data: l }] =
      await Promise.all([
        supabase.from('HIFACHAMA_customuser').select('*'),
        supabase.from('HIFACHAMA_transaction').select('*'),
        supabase.from('HIFACHAMA_meeting').select('*'),
        supabase.from('HIFACHAMA_loan').select('*'),
      ]);
    setMembers(m || []);
    setContributions(t || []);
    setMeetings(mt || []);
    setLoans(l || []);
  };

  useEffect(() => {
    fetchData();
    const tables = [
      'HIFACHAMA_customuser',
      'HIFACHAMA_transaction',
      'HIFACHAMA_meeting',
      'HIFACHAMA_loan',
    ];
    const channels = tables.map((table) =>
      supabase
        .channel(`realtime:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, fetchData)
        .subscribe()
    );
    return () => channels.forEach((ch) => supabase.removeChannel(ch));
  }, []);

  return (
    <main className="dashboard-content">
      {/* ——— Full‑width Header Banner ——— */}
      <div className="dashboard-header">
        <div>Welcome, {userData?.username || userData?.email || '…'}</div>
        <div>
          {chamaData?.name
            ? `${chamaData.name} (ID: ${chamaData.id})`
            : 'Loading Chama…'}
        </div>
      </div>

      {/* ——— Cards ——— */}
      <div className="dashboard-card">
        <MemberManager members={members} setMembers={setMembers} />
      </div>

      <div className="dashboard-card">
        <ContributionTracker
          members={members}
          contributions={contributions}
          setContributions={setContributions}
        />
      </div>

      {/* Forms now always get rendered so you can see the card itself */}
      <div className="dashboard-card">
        {chamaData && userData ? (
          <ContributionForm chamaId={chamaData.id} userId={userData.id} />
        ) : (
          <p>Loading Contribution Form…</p>
        )}
      </div>

      <div className="dashboard-card">
        {chamaData && userData ? (
          <WithdrawalForm chamaId={chamaData.id} userId={userData.id} />
        ) : (
          <p>Loading Withdrawal Form…</p>
        )}
      </div>

      <div className="dashboard-card">
        <MemberRotation members={members} contributions={contributions} />
      </div>

      <div className="dashboard-card">
        <HybridReports members={members} contributions={contributions} loans={loans} />
      </div>
    </main>
  );
};

export default HybridDashboard;
