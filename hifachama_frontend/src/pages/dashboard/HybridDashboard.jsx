import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import MemberList from '../../components/MemberList';
import ContributionDisplay from '../../components/ContributionDisplay';
import RotationSchedule from '../../components/RotationSchedule';
import ReportDisplay from '../../components/ReportDisplay';
import ContributionForm from '../../components/ContributionForm';
import WithdrawalForm from '../../components/WithdrawalForm';
import LoanRequestForm from '../../components/LoanRequestForm';
import LoanList from '../../components/LoanList';
import AddPaymentDetailsForm from '../../components/AddPaymentDetailsForm';
import Sidebar from '../../components/Sidebar';
import MeetingSchedule from '../../components/MeetingSchedule';
import '../../styles/Dashboard.css';

const HybridDashboard = () => {
  console.log("🔵 HybridDashboard component loaded");
  const [activeSection, setActiveSection] = useState('overview');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [refreshContributions, setRefreshContributions] = useState(false);
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
        const chamaId = user?.chamas?.[0]; // Assuming there's only one chama in the array
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

  // Supabase data fetch
  // Supabase real-time listener setup
  useEffect(() => {
    if (!userData || !chamaData?.id) return;

    const chamaId = chamaData.id;
    console.log("✅ Initializing live data sync for chama:", chamaId);

    let activeChannels = [];

    const setupRealtime = async () => {
      try {
        // Initial fetch
        const [{ data: m }, { data: t }, { data: mt }, { data: l }] = await Promise.all([
          supabase.from('HIFACHAMA_customuser').select('*').eq('chama_id', chamaId),
          supabase.from('HIFACHAMA_transaction').select('*').eq('chama_id', chamaId),
          supabase.from('HIFACHAMA_meeting').select('*').eq('chama_id', chamaId),
          supabase.from('HIFACHAMA_loan').select('*').eq('chama_id', chamaId),
        ]);
        console.log("👥 Members fetched:", m);
        setMembers(m || []);
        setContributions(t || []);
        setMeetings(mt || []);
        setLoans(l || []);
      } catch (err) {
        console.error('❌ Error fetching initial data:', err);
      }
    };

    setupRealtime();

    const channels = [
      { table: 'HIFACHAMA_customuser', setter: setMembers },
      { table: 'HIFACHAMA_transaction', setter: setContributions },
      { table: 'HIFACHAMA_meeting', setter: setMeetings },
      { table: 'HIFACHAMA_loan', setter: setLoans },
    ];

    activeChannels = channels.map(({ table, setter }) => {
      const channel = supabase.channel(`realtime:${table}`);

      channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        console.log(`🔁 ${eventType} on ${table}:`, payload);

        setter((prev) => {
          switch (eventType) {
            case 'INSERT':
              return [newRow, ...prev];
            case 'UPDATE':
              return prev.map((item) => (item.id === newRow.id ? newRow : item));
            case 'DELETE':
              return prev.filter((item) => item.id !== oldRow.id);
            default:
              return prev;
          }
        });
      });

      channel.subscribe((status) => {
        console.log(`📡 Subscribed to ${table}:`, status);
      });

      return channel;
    });

    return () => {
      console.log("📴 Cleaning up Supabase channels");
      activeChannels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [userData?.id, chamaData?.id]);



  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="dashboard-content">
            <div className="dashboard-header">
              <div>Welcome, {userData?.username || userData?.email}</div>
              <div>{chamaData?.name}</div>
            </div>
            <div className="dashboard-card">
              <MemberList members={members} title="Member Directory" />
            </div>
            {userData?.role === 'Chairperson' && (
              <div className="dashboard-card">
                <a href="#" onClick={() => setActiveSection('paymentDetails')}>
                  Add Payment Details
                </a>
              </div>
            )}
          </div>
        );
      case 'paymentDetails':
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
              <AddPaymentDetailsForm chamaId={chamaData?.id} />
            </div>
          </div>
        );
      case 'meetings':
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
              <h3>Upcoming Meetings</h3>
              <MeetingSchedule />
            </div>
          </div>
        );
      case 'contributions':
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
              <ContributionDisplay contributions={contributions} />
            </div>
            <div className="dashboard-card">
            <ContributionForm
              chamaId={chamaData?.id}
              userId={userData?.id}
            />

            </div>
          </div>
        );
      case 'withdrawals':
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
              <WithdrawalForm
                chamaId={chamaData?.id}
                userId={userData?.id}
              />
            </div>
          </div>
        );
      case 'rotation':
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
              <RotationSchedule members={members} contributions={contributions} />
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
            <ReportDisplay
                contributions={contributions}
                withdrawals={[]} // You can replace with actual withdrawals data if available
                loans={loans}
                members={members}
                chama={chamaData}
              />
            </div>
          </div>
        );
      case 'loans':
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
            <LoanRequestForm
              chamaId={chamaData?.id}
              userId={userData?.id}
              onSuccess={() => setRefreshLoans(prev => !prev)}  // Optional: Refresh loan list
            />
            </div>
            <div className="dashboard-card">
              <LoanList loans={loans} />
            </div>
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
              <p>Invalid section selected.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar setActiveSection={setActiveSection} activeSection={activeSection} />
      <main className="main-content">
        {isLoading ? (
          <div className="dashboard-loading">Loading...</div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default HybridDashboard;
