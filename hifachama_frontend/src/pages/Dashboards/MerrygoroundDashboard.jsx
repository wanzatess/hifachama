import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import ContributionForm from "../../components/Contributions/ContributionForm";
import WithdrawalForm from "../../components/Withdrawals/WithdrawalForm";
import Sidebar from '../../components/Sidebar/Sidebar';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import { toast } from 'react-toastify';
import './Dashboard.css';

const MerryGoRoundDashboard = () => {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('overview');
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [missedContributions, setMissedContributions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [chamaData, setChamaData] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserAndChamaData = async () => {
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token) {
      setError("Please log in to access the dashboard.");
      setIsLoading(false);
      return;
    }
    try {
      const { data: user } = await axios.get(
        '${import.meta.env.VITE_API_URL}/api/users/me/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData(user);

      if (!user?.chama_id) {
        setError("No chama found. Please join or create a chama.");
        setIsLoading(false);
        return;
      }

      const { data: chama } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/chamas/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChamaData(chama);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Error fetching user/chama data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshContributions = async () => {
    if (!chamaData?.id || !userData?.id) return;
    try {
      const { data: memberData } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id, chama_id')
        .eq('user_id', userData.id)
        .single();
      if (!memberData) return;

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
      setContributions(formattedTransactions || []);

      const missedContributionsData = formattedTransactions.filter(t => !t.paid);
      setMissedContributions(missedContributionsData || []);
    } catch (err) {
      console.error("Error refreshing contributions:", err);
      toast.error("Failed to refresh contributions.");
    }
  };

  useEffect(() => {
    fetchUserAndChamaData();
  }, [id]);

  useEffect(() => {
    if (!userData || !chamaData?.id) return;

    const setupRealtime = async () => {
      try {
        const { data: memberData } = await supabase
          .from('HIFACHAMA_chamamember')
          .select('id, chama_id')
          .eq('user_id', userData.id)
          .single();
        if (!memberData) return;

        const chamaId = memberData.chama_id;
        const { data: chamaMembers } = await supabase
          .from('HIFACHAMA_chamamember')
          .select('id')
          .eq('chama_id', chamaId);
        const memberIds = chamaMembers ? chamaMembers.map(m => m.id) : [];

        const [
          { data: users },
          { data: transactions },
          { data: balanceData }
        ] = await Promise.all([
          supabase
            .from('HIFACHAMA_customuser')
            .select('*, HIFACHAMA_chamamember!inner(chama_id)')
            .eq('HIFACHAMA_chamamember.chama_id', chamaId),
          supabase
            .from('HIFACHAMA_transaction')
            .select('*, HIFACHAMA_chamamember!inner(user_id, HIFACHAMA_customuser!inner(username))')
            .in('member_id', memberIds),
          supabase.from('HIFACHAMA_balance').select('*').eq('chama_id', chamaId).single()
        ]);

        const formattedContributions = transactions
          .filter(t => t.category === 'contribution')
          .map(t => ({
            ...t,
            username: t.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
          }));

        const missedContributionsData = formattedContributions.filter(t => !t.paid);

        setMembers(users || []);
        setTransactions(transactions || []);
        setContributions(formattedContributions || []);
        setMissedContributions(missedContributionsData || []);
        setBalance(balanceData || null);
      } catch (err) {
        setError("Failed to load real-time data.");
        console.error("Error fetching initial data:", err);
      }
    };

    setupRealtime();

    const channels = [
      { table: 'HIFACHAMA_customuser', setter: setMembers, filterByChama: true },
      { table: 'HIFACHAMA_chamamember', setter: setMembers, isMembershipTable: true },
      {
        table: 'HIFACHAMA_transaction',
        setter: (data) => {
          const formatted = {
            ...data,
            username: data.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
          };
          setTransactions(prev => {
            switch (data.eventType) {
              case 'INSERT': return [...prev, formatted];
              case 'UPDATE': return prev.map(item => item.id === formatted.id ? formatted : item);
              case 'DELETE': return prev.filter(item => item.id !== data.old.id);
              default: return prev;
            }
          });
          if (data.category === 'contribution') {
            setContributions(prev => {
              switch (data.eventType) {
                case 'INSERT': return [...prev, formatted];
                case 'UPDATE': return prev.map(item => item.id === formatted.id ? formatted : item);
                case 'DELETE': return prev.filter(item => item.id !== data.old.id);
                default: return prev;
              }
            });
            if (!formatted.paid) {
              setMissedContributions(prev => {
                switch (data.eventType) {
                  case 'INSERT': return [...prev, formatted];
                  case 'UPDATE': return prev.map(item => item.id === formatted.id ? formatted : item);
                  case 'DELETE': return prev.filter(item => item.id !== data.old.id);
                  default: return prev;
                }
              });
            }
          }
        },
        filterByMembers: true
      },
      { table: 'HIFACHAMA_balance', setter: setBalance, filterByChama: true }
    ];

    const activeChannels = channels.map(({ table, setter, filterByChama, filterByMembers, isMembershipTable }) => {
      const channel = supabase.channel(`realtime:${table}`);
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, async (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        if (isMembershipTable) {
          const { data: updatedMembers } = await supabase
            .from('HIFACHAMA_customuser')
            .select('*, HIFACHAMA_chamamember!inner(chama_id)')
            .eq('HIFACHAMA_chamamember.chama_id', chamaData.id);
          setMembers(updatedMembers || []);
          return;
        }
        if (filterByMembers) {
          const { data: chamaMembers } = await supabase
            .from('HIFACHAMA_chamamember')
            .select('id')
            .eq('chama_id', chamaData.id);
          const memberIds = chamaMembers ? chamaMembers.map(m => m.id) : [];
          if (!newRow || !memberIds.includes(newRow.member_id)) return;
          const { data: memberData } = await supabase
            .from('HIFACHAMA_chamamember')
            .select('HIFACHAMA_customuser!inner(username)')
            .eq('id', newRow.member_id)
            .single();
          newRow.HIFACHAMA_chamamember = {
            HIFACHAMA_customuser: { username: memberData?.HIFACHAMA_customuser?.username || 'Unknown' }
          };
        }
        if (filterByChama && newRow?.chama_id !== chamaData.id) return;
        setter({ ...newRow, eventType, old: oldRow });
      });
      channel.subscribe();
      return channel;
    });

    return () => {
      activeChannels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userData?.id, chamaData?.id]);

  const handleWithdrawalAction = async (transactionId, action) => {
    try {
      const token = getAuthToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/transactions/${transactionId}/approve/`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Withdrawal ${action}d successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} withdrawal.`);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="dashboard-loading">Loading...</div>;
    }
    if (error) {
      return (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.href = '/join-chama'}>
            Join or Create a Chama
          </button>
          <button onClick={fetchUserAndChamaData} style={{ marginLeft: '10px' }}>
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
        {(() => {
          switch (activeSection) {
            case 'overview':
              return (
                <div className="dashboard-card">
                  <MemberManager members={members} setMembers={setMembers} />
                </div>
              );
            case 'rotations':
              return (
                <div className="dashboard-card">
                  <MemberRotation
                    members={members}
                    onUpdateMembers={setMembers}
                    contributions={contributions}
                    setContributions={setContributions}
                    missedContributions={missedContributions}
                    setMissedContributions={setMissedContributions}
                  />
                </div>
              );
            case 'analytics':
              return (
                <div className="dashboard-card">
                  <RotationAnalytics
                    members={members}
                    contributions={contributions}
                    missedContributions={missedContributions}
                  />
                </div>
              );
            case 'contributions':
              return (
                <>
                  <div className="dashboard-card">
                    <ContributionForm chamaId={chamaData?.id} userId={userData?.id} onSuccess={refreshContributions} />
                  </div>
                  <div className="dashboard-card">
                    <ContributionHistory contributions={contributions} setContributions={setContributions} />
                  </div>
                </>
              );
            case 'withdrawals':
              return (
                <>
                  <div className="dashboard-card">
                    <WithdrawalForm chamaId={chamaData?.id} userId={userData?.id} />
                  </div>
                  <div className="dashboard-card">
                    <h3>Pending Withdrawals</h3>
                    <WithdrawalTable />
                  </div>
                </>
              );
            case 'approve-withdrawal':
              if (userData?.role !== 'Chairperson') {
                return <p>Access restricted to Chairpersons.</p>;
              }
              return (
                <div className="dashboard-card">
                  <h3>Approve Withdrawals</h3>
                  <WithdrawalTable
                    withdrawals={transactions.filter(t => t.category === 'withdrawal')}
                    onAction={handleWithdrawalAction}
                    showActions={true}
                  />
                </div>
              );
            default:
              return (
                <div className="dashboard-card">
                  <p>Invalid section selected.</p>
                </div>
              );
          }
        })()}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        setActiveSection={setActiveSection}
        activeSection={activeSection}
        role={userData?.role}
        chamaType={chamaData?.type}
        chamaName={chamaData?.name}
        balance={balance ? { rotational: balance.rotational_balance } : { rotational: 0 }}
      />
      <main className="dashboard-main-container">
        {renderContent()}
      </main>
    </div>
  );
};

export default MerryGoRoundDashboard;