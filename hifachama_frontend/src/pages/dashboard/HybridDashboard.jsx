import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../utils/auth';
import { supabase } from '../../utils/supabaseClient';
import MemberList from '../../components/MemberList';
import ContributionDisplay from '../../components/ContributionDisplay';
import RotationSchedule from '../../components/RotationSchedule';
import CreateRotationForm from '../../components/CreateRotationForm';
import ContributionReports from '../../components/ContributionReports';
import LoanReports from '../../components/LoanReports';
import ContributionForm from '../../components/ContributionForm';
import WithdrawalForm from '../../components/WithdrawalForm';
import WithdrawalTable from '../../components/WithdrawalTable';
import LoanRequestForm from '../../components/LoanRequestForm';
import LoanList from '../../components/LoanList';
import LoanApprovalForm from '../../components/LoanApprovalForm';
import AddPaymentDetailsForm from '../../components/AddPaymentDetailsForm';
import PaymentDetailsDisplay from '../../components/PaymentDetailsDisplay';
import Sidebar from '../../components/Sidebar';
import MeetingDisplay from '../../components/MeetingDisplay';
import MeetingScheduleForm from '../../components/MeetingScheduleForm';
import MeetingMinutesUpload from '../../components/MeetingMinutesUpload';
import '../../styles/Dashboard.css';
import { toast } from 'react-toastify';

const HybridDashboard = () => {
  console.log("🔵 HybridDashboard component loaded");
  const [activeSection, setActiveSection] = useState('overview');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loans, setLoans] = useState([]);
  const [rotations, setRotations] = useState([]);
  const [userData, setUserData] = useState(null);
  const [chamaData, setChamaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingSection, setPendingSection] = useState(null);
  const [memberId, setMemberId] = useState(null);

  const sensitiveSections = {
    'payment-details': 'Chairperson',
    'approve-withdrawal': 'Treasurer',
    'schedule-meeting': 'Secretary',
    'approve-loan': 'Chairperson'
  };

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
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/users/me/`;
    console.log("🔍 Fetching user data from:", apiUrl);
    console.log("🔑 Auth Token:", token);
    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = response.data;

    // Check for HTML response
    if (typeof user === 'string' && user.includes('<!doctype html>')) {
      console.error("❌ Received HTML instead of JSON:", user.slice(0, 100));
      throw new Error("Invalid response from API. Expected JSON, received HTML. Check backend URL or endpoint.");
    }

    // Validate user data
    if (!user || typeof user !== 'object' || !user.id) {
      console.error("❌ Invalid user data:", user);
      throw new Error("Invalid user data received from API");
    }
      console.log("👤 User data fetched:", user);
      console.log("🔎 User role:", user.role);
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
          `${import.meta.env.VITE_API_URL}/api/chamas/${chama.id}/add-payment-details/`,
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

  const refreshWithdrawals = async () => {
    if (!chamaData?.id || !userData?.id) {
      console.log("⏳ Skipping withdrawal refresh: chamaData or userData missing");
      return;
    }

    try {
      console.log("🔍 Refreshing withdrawals for chama:", chamaData.id);
      const { data: memberData } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id, chama_id')
        .eq('user_id', userData.id)
        .single();
      if (!memberData) {
        console.error("❌ No member data found");
        setMemberId(null);
        return;
      }
      setMemberId(memberData.id);
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
        .eq('category', 'withdrawal');

      const formattedWithdrawals = transactions.map(t => ({
        ...t,
        username: t.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
      }));

      console.log("💸 Refreshed withdrawals:", formattedWithdrawals);
      setWithdrawals(formattedWithdrawals || []);
    } catch (err) {
      console.error("❌ Error refreshing withdrawals:", err);
      toast.error("Failed to refresh withdrawals.");
    }
  };

  const refreshBalance = async () => {
    if (!chamaData?.id) {
      console.log("⏳ Skipping balance refresh: chamaData missing");
      return;
    }
    try {
      console.log("🔍 Fetching balance for chama:", chamaData.id);
      const { data: balanceData, error } = await supabase
        .from('HIFACHAMA_balance')
        .select('*')
        .eq('chama_id', chamaData.id);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!balanceData || balanceData.length === 0) {
        console.warn("⚠️ No balance data found for chama:", chamaData.id);
        setBalance(null);
        return;
      }

      if (balanceData.length > 1) {
        console.warn("⚠️ Multiple balance records found for chama:", chamaData.id, balanceData);
        // Use the first record, but this indicates a data issue
      }

      const balance = balanceData[0];
      console.log("💰 Refreshed balance:", balance);
      setBalance(balance);
    } catch (err) {
      console.error("❌ Error refreshing balance:", err.message);
      setBalance(null);
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
      toast.error("Failed to refresh contributions.");
    }
  };

  const refreshLoans = async () => {
    if (!chamaData?.id || !userData?.id) {
      console.log("⏳ Skipping loan refresh: chamaData or userData missing");
      return;
    }

    try {
      console.log("🔍 Refreshing loans for chama:", chamaData.id);
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

      const { data: loans } = await supabase
        .from('HIFACHAMA_loan')
        .select('*, HIFACHAMA_chamamember!inner(user_id, HIFACHAMA_customuser!inner(username))')
        .in('member_id', memberIds);

      const formattedLoans = loans.map(loan => ({
        ...loan,
        member_name: loan.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
      }));

      console.log("💸 Refreshed loans:", formattedLoans);
      setLoans(formattedLoans || []);
    } catch (err) {
      console.error("❌ Error refreshing loans:", err);
      toast.error("Failed to refresh loans.");
    }
  };

  useEffect(() => {
    fetchUserAndPaymentDetails();
  }, []);

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
        setMemberId(memberData.id);
        const chamaId = memberData.chama_id;

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

        const [
          { data: users },
          { data: transactions },
          { data: meetings },
          { data: loans },
          { data: paymentDetails },
          { data: balanceData },
          { data: rotationData }
        ] = await Promise.all([
          supabase
            .from('HIFACHAMA_customuser')
            .select('*, HIFACHAMA_chamamember!inner(chama_id)')
            .eq('HIFACHAMA_chamamember.chama_id', chamaId),
          supabase
            .from('HIFACHAMA_transaction')
            .select('*, HIFACHAMA_chamamember!inner(user_id, HIFACHAMA_customuser!inner(username))')
            .in('member_id', memberIds),
          supabase.from('HIFACHAMA_meeting').select('*').eq('chama_id', chamaId),
          supabase
            .from('HIFACHAMA_loan')
            .select('*, HIFACHAMA_chamamember!inner(user_id, HIFACHAMA_customuser!inner(username))')
            .in('member_id', memberIds),
          supabase.from('HIFACHAMA_paymentdetails').select('*').eq('chama_id', chamaId).single(),
          supabase.from('HIFACHAMA_balance').select('*').eq('chama_id', chamaId),
          supabase.from('HIFACHAMA_rotation').select('*').eq('chama_id', chamaId),
        ]);

        const formattedContributions = transactions
          .filter(t => t.category === 'contribution')
          .map(t => ({
            ...t,
            username: t.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
          }));
        const formattedWithdrawals = transactions
          .filter(t => t.category === 'withdrawal')
          .map(t => ({
            ...t,
            username: t.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
          }));
        const formattedLoans = loans.map(loan => ({
          ...loan,
          member_name: loan.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
        }));

        console.log("👥 Members fetched:", users);
        console.log("💰 Contributions fetched:", formattedContributions);
        console.log("💸 Withdrawals fetched:", formattedWithdrawals);
        console.log("📅 Meetings fetched:", meetings);
        console.log("💸 Loans fetched:", formattedLoans);
        console.log("💳 Payment details fetched:", paymentDetails);
        console.log("💰 Balance fetched:", balanceData);
        console.log("🔄 Rotations fetched:", rotationData);

        setMembers(users || []);
        setContributions(formattedContributions || []);
        setWithdrawals(formattedWithdrawals || []);
        setMeetings(meetings || []);
        setLoans(formattedLoans || []);
        setBalance(balanceData?.[0] || null);
        setPaymentDetails(paymentDetails || null);
        setRotations(rotationData || []);
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
        setter: (data) => {
          const formatted = {
            ...data,
            username: data.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
          };
          if (data.category === 'contribution') {
            setContributions(prev => {
              switch (data.eventType) {
                case 'INSERT': return [...prev, formatted];
                case 'UPDATE': return prev.map(item => item.id === formatted.id ? formatted : item);
                case 'DELETE': return prev.filter(item => item.id !== data.old.id);
                default: return prev;
              }
            });
          } else if (data.category === 'withdrawal') {
            setWithdrawals(prev => {
              switch (data.eventType) {
                case 'INSERT': return [...prev, formatted];
                case 'UPDATE': return prev.map(item => item.id === formatted.id ? formatted : item);
                case 'DELETE': return prev.filter(item => item.id !== data.old.id);
                default: return prev;
              }
            });
          }
        },
        filterByMembers: true,
      },
      { table: 'HIFACHAMA_meeting', setter: setMeetings, filterByChama: true },
      {
        table: 'HIFACHAMA_loan',
        setter: (data) => {
          const formatted = {
            ...data,
            member_name: data.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown'
          };
          setLoans(prev => {
            switch (data.eventType) {
              case 'INSERT': return [...prev, formatted];
              case 'UPDATE': return prev.map(item => item.id === formatted.id ? formatted : item);
              case 'DELETE': return prev.filter(item => item.id !== data.old.id);
              default: return prev;
            }
          });
        },
        filterByMembers: true
      },
      { table: 'HIFACHAMA_paymentdetails', setter: setPaymentDetails, filterByChama: true },
      { table: 'HIFACHAMA_balance', setter: (data) => setBalance(data.eventType === 'DELETE' ? null : data), filterByChama: true },
      { table: 'HIFACHAMA_rotation', setter: setRotations, filterByChama: true },
    ];

    activeChannels = channels.map(({ table, setter, filterByChama, filterByMembers, isMembershipTable }) => {
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

          if (!newRow || !memberIds.includes(newRow.member_id)) {
            return;
          }

          const { data: memberData } = await supabase
            .from('HIFACHAMA_chamamember')
            .select('HIFACHAMA_customuser!inner(username)')
            .eq('id', newRow.member_id)
            .single();
          newRow.HIFACHAMA_chamamember = {
            HIFACHAMA_customuser: { username: memberData?.HIFACHAMA_customuser?.username || 'Unknown' }
          };
        }

        if (filterByChama && newRow?.chama_id !== chamaId) {
          return;
        }

        setter({ ...newRow, eventType, old: oldRow });
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

  const handleSendOTP = async (section) => {
    const token = getAuthToken();
    try {
      await axios.post(
        '${import.meta.env.VITE_API_URL}/api/otp/send/',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingSection(section);
      setShowOTPModal(true);
      toast.success("OTP sent to your email.");
    } catch (err) {
      toast.error("Failed to send OTP: " + (err.response?.data?.error || err.message));
    }
  };

  const handleVerifyOTP = async () => {
    const token = getAuthToken();
    try {
      await axios.post(
        '${import.meta.env.VITE_API_URL}/api/otp/verify/',
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("OTP verified!");
      setShowOTPModal(false);
      setOtp('');
      setActiveSection(pendingSection);
      setPendingSection(null);
    } catch (err) {
      toast.error("Invalid OTP: " + (err.response?.data?.error || err.message));
    }
  };

  const handleSetActiveSection = (section) => {
    if (sensitiveSections[section]) {
      const requiredRole = sensitiveSections[section];
      if (userData?.role === requiredRole) {
        handleSendOTP(section);
      } else {
        setActiveSection(section);
      }
    } else {
      setActiveSection(section);
    }
  };

  const handleWithdrawalAction = async (transactionId, action) => {
    try {
      const token = getAuthToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/transactions/${transactionId}/approve/`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Withdrawal ${action}ed successfully!`);
      await Promise.all([refreshWithdrawals(), refreshBalance()]);
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
          {paymentDetails?.paybill && <div>PayBill: {paymentDetails.paybill}</div>}
          {paymentDetails?.tillNumber && <div>Till Number: {paymentDetails.tillNumber}</div>}
          {paymentDetails?.phoneNumber && <div>Phone: {paymentDetails.phoneNumber}</div>}
        </div>
        {(() => {
          switch (activeSection) {
            case 'overview':
              return (
                <div className="dashboard-card">
                  <MemberList chamaId={chamaData?.id} members={members} title="Member Directory" />
                  <div style={{ marginurbi: '1.5rem' }}>
                    <PaymentDetailsDisplay details={paymentDetails} />
                  </div>
                </div>
              );
            case 'payment-details':
              if (userData?.role !== 'Chairperson') {
                return <p>Access restricted to Chairpersons.</p>;
              }
              return (
                <div className="dashboard-card">
                  <h3>Manage Payment Details</h3>
                  <AddPaymentDetailsForm
                    chamaId={chamaData?.id}
                    initialData={paymentDetails}
                    onSuccess={(updatedData) => setPaymentDetails(updatedData)}
                  />
                </div>
              );
            case 'contributions':
              return (
                <>
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
                </>
              );
            case 'withdrawals':
              return (
                <>
                  <div className="dashboard-card">
                    <WithdrawalForm
                      chamaId={chamaData?.id}
                      userId={userData?.id}
                      balance={balance}
                      memberId={memberId}
                    />
                  </div>
                  <div className="dashboard-card">
                    <h3>Pending Withdrawals</h3>
                    <WithdrawalTable
                      withdrawals={withdrawals.filter(w => w.member_id === userData?.id)}
                      balance={balance}
                      role={userData?.role}
                    />
                  </div>
                </>
              );
            case 'approve-withdrawal':
              if (userData?.role !== 'Treasurer') {
                return <p>Access restricted to Treasurers.</p>;
              }
              return (
                <div className="dashboard-card">
                  <h3>Approve Withdrawals</h3>
                  <handleWithdrawalAction chamaId={chamaData?.id} />
                </div>
              );
            case 'meetings':
              return (
                <div className="dashboard-card">
                  <h3>Upcoming Meetings</h3>
                  <MeetingDisplay />
                </div>
              );
            case 'schedule-meeting':
              if (userData?.role !== 'Secretary') {
                return <p>Access restricted to Secretaries.</p>;
              }
              return (
                <div className="dashboard-card">
                  <h3>Schedule a Meeting</h3>
                  <MeetingScheduleForm chamaId={chamaData?.id} />
                </div>
              );
            case 'loans':
              return (
                <>
                  <div className="dashboard-card">
                    <LoanRequestForm
                      chamaId={chamaData?.id}
                      userId={userData?.id}
                      onSuccess={refreshLoans}
                    />
                  </div>
                  <div className="dashboard-card">
                    <LoanList
                      loans={loans}
                      userData={userData}
                      chamaId={chamaData?.id}
                      refreshLoans={refreshLoans}
                    />
                  </div>
                </>
              );
            case 'approve-loan':
              if (userData?.role !== 'Chairperson') {
                return <p>Access restricted to Chairpersons.</p>;
              }
              const pendingLoan = loans?.find(loan => loan.status.toLowerCase() === 'pending');
              return (
                <div className="dashboard-card">
                  <h3>Approve Loan</h3>
                  {pendingLoan ? (
                    <LoanApprovalForm
                      loan={pendingLoan}
                      userData={userData}
                      chamaId={chamaData?.id}
                      onSuccess={refreshLoans}
                    />
                  ) : (
                    <p>No pending loans available to approve.</p>
                  )}
                </div>
              );
            case 'meeting-minutes':
              return (
                <div className="dashboard-card">
                  <h3>Meeting Minutes</h3>
                  <MeetingMinutesUpload
                    chamaId={chamaData?.id}
                    canUpload={userData?.role === 'Secretary'}
                  />
                </div>
              );
            case 'contribution-reports':
              return (
                <div className="dashboard-card">
                  <h3>Contribution Reports</h3>
                  <ContributionReports
                    contributions={contributions}
                    chama={chamaData}
                    balance={balance}
                  />
                </div>
              );
            case 'loan-reports':
              return (
                <div className="dashboard-card">
                  <h3>Loan Reports</h3>
                  <LoanReports
                    loans={loans}
                    chama={chamaData}
                    balance={balance}
                  />
                </div>
              );
            case 'rotation':
              return (
                <div className="dashboard-card">
                  <RotationSchedule
                    members={members}
                    contributions={contributions}
                    chamaId={chamaData?.id}
                    rotations={rotations}
                    role={userData?.role}
                  />
                </div>
              );
            case 'rotation-details':
              return (
                <div className="dashboard-card">
                  <h3>Rotation Details</h3>
                  <CreateRotationForm chamaId={chamaData?.id} />
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
        {showOTPModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Enter OTP</h3>
              <p className="mb-6 text-gray-600">Please check your email for the 6-digit OTP.</p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="border border-gray-300 p-3 w-full mb-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-400 transition"
                  onClick={() => setShowOTPModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
                  onClick={handleVerifyOTP}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        setActiveSection={handleSetActiveSection}
        activeSection={activeSection}
        paymentDetails={paymentDetails}
        role={userData?.role}
        chamaType={chamaData?.type}
        chamaName={chamaData?.name}
      />
      <main className="dashboard-main-container">
        {renderContent()}
      </main>
    </div>
  );
};

export default HybridDashboard;