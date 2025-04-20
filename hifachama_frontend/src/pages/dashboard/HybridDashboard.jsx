import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import {
  MemberList,
  ContributionDisplay,
  RotationSchedule,
  ReportDisplay,
} from '../../components/Hybrid';
import ContributionForm from '../../components/ContributionForm';
import WithdrawalForm from '../../components/WithdrawalForm';
import Sidebar from '../../components/Sidebar';
import '../../styles/Dashboard.css';

const HybridDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loans, setLoans] = useState([]);
  const [userData, setUserData] = useState(null);
  const [chamaData, setChamaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { data: user } = await axios.get(
          'https://hifachama-backend.onrender.com/api/users/me/',
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchData = async () => {
    const [{ data: m }, { data: t }, { data: mt }, { data: l }] = await Promise.all([
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

  const renderContent = () => {
    switch(activeSection) {
      case 'overview':
        return (
          <>
            <div className="dashboard-header">
              <div>Welcome, {userData?.username || userData?.email}</div>
              <div>{chamaData?.name || 'Loading Chama…'}</div>
            </div>
            <div className="dashboard-card">
              <MemberList members={members} title="Member Directory" />
            </div>
          </>
        );
      case 'contributions':
        return (
          <>
            <div className="dashboard-card">
              <ContributionDisplay contributions={contributions} />
            </div>
            <div className="dashboard-card">
              <ContributionForm />
            </div>
          </>
        );
      case 'withdrawals':
        return (
          <div className="dashboard-card">
            <WithdrawalForm />
          </div>
        );
      case 'rotation':
        return (
          <div className="dashboard-card">
            <RotationSchedule members={members} contributions={contributions} />
          </div>
        );
      case 'reports':
        return (
          <div className="dashboard-card">
            <ReportDisplay members={members} contributions={contributions} loans={loans} />
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        role={userData?.role}
        chamaType={chamaData?.type}
        chamaName={chamaData?.name}
        balance={chamaData?.balance}
        setActiveSection={setActiveSection}
        activeSection={activeSection}
      />
      <main className="dashboard-main-container">
        {renderContent()}
      </main>
    </div>
  );
};

export default HybridDashboard;