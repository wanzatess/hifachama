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
import LoanRequestForm from '../../components/LoanRequestForm';
import LoanList from '../../components/LoanList';
import AddPaymentDetailsForm from '../../components/AddPaymentDetailsForm';
import Sidebar from '../../components/Sidebar';
import MeetingSchedule from '../../components/MeetingSchedule';
import '../../styles/Dashboard.css';

const HybridDashboard = () => {
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

  // Supabase data fetch
  useEffect(() => {
    if (!chamaData?.id) return;
    console.log("🟢 Setting up subscriptions for chama_id:", chamaData.id);

    const chamaId = chamaData.id;

    const fetchAllData = async () => {
      try {
        const [
          { data: m, error: mErr },
          { data: t, error: tErr },
          { data: mt, error: mtErr },
          { data: l, error: lErr },
        ] = await Promise.all([
          supabase.from('HIFACHAMA_customuser').select('*').eq('chama_id', chamaId),
          supabase.from('HIFACHAMA_transaction').select('*').eq('chama_id', chamaId),
          supabase.from('HIFACHAMA_meeting').select('*').eq('chama_id', chamaId),
          supabase.from('HIFACHAMA_loan').select('*').eq('chama_id', chamaId),
        ]);

        if (mErr || tErr || mtErr || lErr) {
          console.error('🛑 Supabase errors:', { mErr, tErr, mtErr, lErr });
        }

        setMembers(m || []);
        setContributions(t || []);
        setMeetings(mt || []);
        setLoans(l || []);
      } catch (error) {
        console.error('❌ Error fetching Supabase data:', error);
      }
    };

    fetchAllData();

    // Subscribe to realtime changes per table
    const channels = [
      {
        table: 'HIFACHAMA_customuser',
        callback: async () => {
          console.log('📡 Realtime update: users');
          const { data } = await supabase.from('HIFACHAMA_customuser').select('*').eq('chama_id', chamaId);
          setMembers(data || []);
        },
      },
      {
        table: 'HIFACHAMA_transaction',
        callback: async () => {
          console.log('📡 Realtime update: transactions');
          const { data } = await supabase.from('HIFACHAMA_transaction').select('*').eq('chama_id', chamaId);
          setContributions(data || []);
        },
      },
      {
        table: 'HIFACHAMA_meeting',
        callback: async () => {
          console.log('📡 Realtime update: meetings');
          const { data } = await supabase.from('HIFACHAMA_meeting').select('*').eq('chama_id', chamaId);
          setMeetings(data || []);
        },
      },
      {
        table: 'HIFACHAMA_loan',
        callback: async () => {
          console.log('📡 Realtime update: loans');
          const { data } = await supabase.from('HIFACHAMA_loan').select('*').eq('chama_id', chamaId);
          setLoans(data || []);
        },
      },
    ];

    const subscriptions = channels.map(({ table, callback }) => {
      const channel = supabase.channel(`realtime:${table}`);

      channel.on('postgres_changes', { event: '*', schema: 'public', table }, async (payload) => {
        console.log(`🔥 Received payload for ${table}:`, payload);
        const { eventType, new: newRow, old: oldRow } = payload;

        switch (eventType) {
          case 'INSERT':
            if (table === 'HIFACHAMA_transaction') {
              setContributions((prev) => [newRow, ...prev]);
            } else if (table === 'HIFACHAMA_loan') {
              setLoans((prev) => [newRow, ...prev]);
            } else if (table === 'HIFACHAMA_customuser') {
              setMembers((prev) => [newRow, ...prev]);
            } else if (table === 'HIFACHAMA_meeting') {
              setMeetings((prev) => [newRow, ...prev]);
            }
            break;
          case 'UPDATE':
            if (table === 'HIFACHAMA_transaction') {
              setContributions((prev) => prev.map((item) => (item.id === newRow.id ? newRow : item)));
            } else if (table === 'HIFACHAMA_loan') {
              setLoans((prev) => prev.map((item) => (item.id === newRow.id ? newRow : item)));
            } else if (table === 'HIFACHAMA_customuser') {
              setMembers((prev) => prev.map((item) => (item.id === newRow.id ? newRow : item)));
            } else if (table === 'HIFACHAMA_meeting') {
              setMeetings((prev) => prev.map((item) => (item.id === newRow.id ? newRow : item)));
            }
            break;
          case 'DELETE':
            if (table === 'HIFACHAMA_transaction') {
              setContributions((prev) => prev.filter((item) => item.id !== oldRow.id));
            } else if (table === 'HIFACHAMA_loan') {
              setLoans((prev) => prev.filter((item) => item.id !== oldRow.id));
            } else if (table === 'HIFACHAMA_customuser') {
              setMembers((prev) => prev.filter((item) => item.id !== oldRow.id));
            } else if (table === 'HIFACHAMA_meeting') {
              setMeetings((prev) => prev.filter((item) => item.id !== oldRow.id));
            }
            break;
          default:
            break;
        }
      });

      channel.subscribe((status) => {
        console.log(`📡 Channel status for ${table}:`, status);
      });

      return channel;
    });

    return () => {
      subscriptions.forEach((sub) => supabase.removeChannel(sub));
    };
  }, [chamaData?.id]);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        if (chamaData?.id) {
          const { data: paymentDetails } = await axios.get(
            `https://hifachama-backend.onrender.com/api/payment-details/${chamaData.id}`
          );
          setPaymentDetails(paymentDetails);
        }
      } catch (err) {
        console.error('Error fetching payment details:', err);
      }
    };

    fetchPaymentDetails();
  }, [chamaData?.id]);

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
              <ContributionForm />
            </div>
          </div>
        );
      case 'withdrawals':
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
              <WithdrawalForm />
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
              <LoanRequestForm />
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
