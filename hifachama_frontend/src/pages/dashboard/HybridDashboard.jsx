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
  const [meetings, setMeetings] = useState([]);
  const [loans, setLoans] = useState([]);
  const [userData, setUserData] = useState(null);
  const [chamaData, setChamaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserAndPaymentDetails = async () => {
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token) {
      console.error("❌ No auth token found");
      setError("Please log in to access the dashboard.");
      setIsLoading(false);
      return;
    }
    try {
      console.log("🔍 Fetching user data with token:", token.slice(0, 10) + "...");
      const { data: user } = await axios.get(
        'http://127.0.0.1:8080/api/users/me/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("👤 User data fetched:", user);
      setUserData(user);

      console.log("🔎 Inspecting chama_id and chama_name:", {
        chama_id: user?.chama_id,
        chama_name: user?.chama_name
      });
      if (!user?.chama_id) {
        console.warn("⚠️ No chama associated with user. chama_id:", user?.chama_id);
        setError("No chama found. Please join or create a chama.");
        setIsLoading(false);
        return;
      }

      const chama = {
        id: user.chama_id,
        name: user.chama_name || 'Unnamed Chama'
      };
      console.log("🏛️ Chama data set:", chama);
      setChamaData(chama);

      console.log("🔍 Fetching payment details for chama:", chama.id);
      try {
        const { data: paymentData } = await axios.get(
          `http://127.0.0.1:8080/api/chamas/${chama.id}/add-payment-details/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("💳 Payment details fetched:", paymentData);
        setPaymentDetails(paymentData);
      } catch (err) {
        console.warn("⚠️ No payment details found:", err.response?.data || err.message);
        setPaymentDetails(null);
      }
    } catch (err) {
      console.error("❌ Error fetching user data:", err.response?.data || err.message);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshContributions = async () => {
    if (!chamaData?.id || !userData?.id) {
      console.log("⏳ Skipping refresh: chamaData or userData missing");
      return;
    }

    try {
      console.log("🔍 Refreshing contributions for chama:", chamaData.id);
      const { data: memberData } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id, chama_id')
        .eq('user_id', userData.id)
        .single();
      if (!memberData) {
        console.error("❌ No member data found");
        return;
      }
      const chamaId = memberData.chama_id;

      const { data: chamaMembers } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id')
        .eq('chama_id', chamaId);
      const memberIds = chamaMembers ? chamaMembers.map(m => m.id) : [];

      const { data: transactions } = await supabase
        .from('HIFACHAMA_transaction')
        .select('*, HIFACHAMA_chamamember!inner(user_id, HIFACHAMA_customuser!inner(username))')
        .in('member_id', memberIds)
        .eq('category', 'contribution');

      const formattedTransactions = transactions.map(t => ({
        ...t,
        username: t.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
      }));

      console.log("💰 Refreshed contributions:", formattedTransactions);
      setContributions(formattedTransactions || []);
    } catch (err) {
      console.error("❌ Error refreshing contributions:", err);
    }
  };

  useEffect(() => {
    fetchUserAndPaymentDetails();
  }, []);

  // Supabase real-time listener setup
  useEffect(() => {
    if (!userData || !chamaData?.id) {
      console.log("⏳ Skipping Supabase setup: userData or chamaData missing");
      return;
    }

    const chamaId = chamaData.id;
    console.log("✅ Initializing live data sync for chama:", chamaId);

    let activeChannels = [];

    const setupRealtime = async () => {
      try {
        console.log("🔍 Fetching initial Supabase data...");

        // Fetch user's member ID and chama members
        const { data: memberData, error: memberError } = await supabase
          .from('HIFACHAMA_chamamember')
          .select('id, chama_id')
          .eq('user_id', userData.id)
          .single();
        if (memberError || !memberData) {
          console.error("❌ Error fetching member data:", memberError);
          setError("Failed to load member data.");
          return;
        }
        const memberId = memberData.id;
        const chamaId = memberData.chama_id;

        // Fetch all member IDs for the chama
        const { data: chamaMembers, error: membersError } = await supabase
          .from('HIFACHAMA_chamamember')
          .select('id')
          .eq('chama_id', chamaId);
        if (membersError) {
          console.error("❌ Error fetching chama members:", membersError);
          setError("Failed to load chama members.");
          return;
        }
        const memberIds = chamaMembers.map(m => m.id);

        // Fetch initial data
        const [
          { data: users },
          { data: transactions },
          { data: meetings },
          { data: loans },
          { data: paymentDetails }
        ] = await Promise.all([
          supabase
            .from('HIFACHAMA_customuser')
            .select('*, HIFACHAMA_chamamember!inner(chama_id)')
            .eq('HIFACHAMA_chamamember.chama_id', chamaId),
          supabase
            .from('HIFACHAMA_transaction')
            .select('*, HIFACHAMA_chamamember!inner(user_id, HIFACHAMA_customuser!inner(username))')
            .in('member_id', memberIds)
            .eq('category', 'contribution'),
          supabase.from('HIFACHAMA_meeting').select('*').eq('chama_id', chamaId),
          supabase.from('HIFACHAMA_loan').select('*').eq('chama_id', chamaId),
          supabase.from('HIFACHAMA_paymentdetails').select('*').eq('chama_id', chamaId).single(),
        ]);

        // Map transactions to include username directly
        const formattedTransactions = transactions.map(t => ({
          ...t,
          username: t.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
        }));

        console.log("👥 Members fetched:", users);
        console.log("💰 Contributions fetched:", formattedTransactions);
        console.log("📅 Meetings fetched:", meetings);
        console.log("💸 Loans fetched:", loans);
        console.log("💳 Payment details fetched:", paymentDetails);

        setMembers(users || []);
        setContributions(formattedTransactions || []);
        setMeetings(meetings || []);
        setLoans(loans || []);
        setPaymentDetails(paymentDetails || null);
      } catch (err) {
        console.error('❌ Error fetching initial data:', err);
        setError(`Failed to load real-time data: ${err.message}`);
      }
    };

    setupRealtime();

    const channels = [
      { table: 'HIFACHAMA_customuser', setter: setMembers, filterByChama: true },
      { table: 'HIFACHAMA_chamamember', setter: setMembers, isMembershipTable: true },
      {
        table: 'HIFACHAMA_transaction',
        setter: setContributions,
        filterByMembers: true,
        filterByCategory: 'contribution'
      },
      { table: 'HIFACHAMA_meeting', setter: setMeetings, filterByChama: true },
      { table: 'HIFACHAMA_loan', setter: setLoans, filterByChama: true },
      { table: 'HIFACHAMA_paymentdetails', setter: setPaymentDetails, filterByChama: true },
    ];

    activeChannels = channels.map(({ table, setter, filterByChama, filterByMembers, isMembershipTable, filterByCategory }) => {
      const channel = supabase.channel(`realtime:${table}`);

      channel.on('postgres_changes', { event: '*', schema: 'public', table }, async (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        console.log(`🔁 ${eventType} on ${table}:`, payload);

        if (isMembershipTable) {
          const { data: updatedMembers } = await supabase
            .from('HIFACHAMA_customuser')
            .select('*, HIFACHAMA_chamamember!inner(chama_id)')
            .eq('HIFACHAMA_chamamember.chama_id', chamaId);
          console.log("👥 Updated members after HIFACHAMA_chamamember change:", updatedMembers);
          setMembers(updatedMembers || []);
          return;
        }

        if (filterByMembers) {
          const { data: chamaMembers } = await supabase
            .from('HIFACHAMA_chamamember')
            .select('id')
            .eq('chama_id', chamaId);
          const memberIds = chamaMembers ? chamaMembers.map(m => m.id) : [];

          if (!newRow || !memberIds.includes(newRow.member) || (filterByCategory && newRow.category !== filterByCategory)) {
            return;
          }

          const { data: memberData } = await supabase
            .from('HIFACHAMA_chamamember')
            .select('HIFACHAMA_customuser!inner(username)')
            .eq('id', newRow.member)
            .single();
          newRow.username = memberData?.HIFACHAMA_customuser?.username || 'Unknown';
        }

        if (filterByChama && newRow?.chama_id !== chamaId) {
          return;
        }

        setter((prev) => {
          switch (eventType) {
            case 'INSERT':
              return [...prev, newRow];
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
        console.log("📦 chamaData in Dashboard:", chamaData);
        console.log("📦 chamaId passed to MemberList:", chamaData?.id);
      
        if (error) {
          return (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.href = '/join-chama'}>
                Join or Create a Chama
              </button>
              <button onClick={fetchUserAndPaymentDetails} style={{ marginLeft: '10px' }}>
                Retry
              </button>
            </div>
          );
        }
      
        if (!chamaData) {
          return <p>⏳ Loading chama data...</p>;
        }
      
        return (
          <div className="dashboard-content">
            <div className="dashboard-header">
              <div>Welcome, {userData?.username || userData?.email}</div>
              <div>{chamaData?.name}</div>
            </div>
      
            <div className="dashboard-card">
              <MemberList chamaId={chamaData?.id} members={members} title="Member Directory" />
            </div>
      
            {userData?.role === 'Chairperson' && (
              <div className="dashboard-card" style={{ marginTop: '20px' }}>
                <h3>Manage Payment Details</h3>
                <AddPaymentDetailsForm
                  chamaId={chamaData?.id}
                  initialData={paymentDetails}
                  onSuccess={(updatedData) => setPaymentDetails(updatedData)}
                />
              </div>
            )}
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
                onSuccess={refreshContributions}
              />
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
                withdrawals={[]}
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
                onSuccess={() => setRefreshLoans(prev => !prev)}
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
      <Sidebar
        setActiveSection={setActiveSection}
        activeSection={activeSection}
        paymentDetails={paymentDetails}
        role={userData?.role}
        chamaType={chamaData?.type}
        chamaName={chamaData?.name}
        balance={0}
      />
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