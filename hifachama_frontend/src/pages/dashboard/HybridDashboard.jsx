import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get(
          'https://hifachama-backend.onrender.com/api/current_user/',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserData(res.data);
        const chamaId = res.data?.chama_memberships?.[0]?.chama?.id;
        if (chamaId) {
          const chamaRes = await axios.get(
            `https://hifachama-backend.onrender.com/api/chamas/${chamaId}/`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setChamaData(chamaRes.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch Supabase data
  const fetchData = async () => {
    const { data: membersData } = await supabase.from('HIFACHAMA_customuser').select('*');
    const { data: transactionsData } = await supabase
      .from('HIFACHAMA_transaction')
      .select('*');
    const { data: meetingsData } = await supabase.from('HIFACHAMA_meeting').select('*');
    const { data: loansData } = await supabase.from('HIFACHAMA_loan').select('*');

    setMembers(membersData || []);
    setContributions(transactionsData || []);
    setMeetings(meetingsData || []);
    setLoans(loansData || []);
  };

  useEffect(() => {
    fetchData();
    const subs = ['HIFACHAMA_customuser', 'HIFACHAMA_transaction', 'HIFACHAMA_meeting', 'HIFACHAMA_loan']
      .map((table) =>
        supabase
          .channel(`realtime:${table}`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, fetchData)
          .subscribe()
      );
    return () => subs.forEach((ch) => supabase.removeChannel(ch));
  }, []);

  return (
    <main className="dashboard-content">
      {/* Full‑width header banner */}
      <div className="dashboard-header">
        <div>
          Welcome, {userData?.username || userData?.email}
        </div>
        <div>
          {chamaData?.name} (ID: {chamaData?.id})
        </div>
      </div>

      {/* Dashboard cards */}
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

      {userData && chamaData && (
        <>
          <div className="dashboard-card">
            <ContributionForm chamaId={chamaData.id} userId={userData.id} />
          </div>
          <div className="dashboard-card">
            <WithdrawalForm chamaId={chamaData.id} userId={userData.id} />
          </div>
        </>
      )}

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
