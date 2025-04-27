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
import AddPaymentDetailsForm from '../../components/AddPaymentDetailsForm';
import Sidebar from '../../components/Sidebar';
import '../../styles/Dashboard.css';

const HybridDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [paymentDetails, setPaymentDetails] = useState(null);
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

  // Fetch Supabase data only when chamaData is loaded
  useEffect(() => {
    if (!chamaData?.id) return;

    const fetchData = async () => {
      try {
        const chamaId = chamaData.id;
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
          console.error("🛑 Supabase errors:", { mErr, tErr, mtErr, lErr });
        }

        setMembers(m || []);
        setContributions(t || []);
        setMeetings(mt || []);
        setLoans(l || []);
      } catch (error) {
        console.error("❌ Error fetching Supabase data:", error);
      }
    };

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
                <a href={`#`} onClick={() => setActiveSection('paymentDetails')}>
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
              {meetings.length > 0 ? (
                meetings.map((meeting, index) => (
                  <div key={index} className="meeting-card">
                    <p><strong>Title:</strong> {meeting.title}</p>
                    <p><strong>Date:</strong> {meeting.date}</p>
                    <p><strong>Status:</strong> {meeting.status}</p>
                  </div>
                ))
              ) : (
                <p>No upcoming meetings</p>
              )}
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
              <ReportDisplay members={members} contributions={contributions} loans={loans} />
            </div>
          </div>
        );
        case 'loans':
          return (
            <div className="dashboard-content">
              <div className="dashboard-card">
                {/* Display Loans info here */}
                <h2>Loans</h2>
                <ul>
                  {loans.map((loan) => (
                    <li key={loan.id}>
                      Loan to {loan.member_name} - Amount: {loan.amount} - Status: {loan.status}
                    </li>
                  ))}
                </ul>
              </div>
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
        paymentDetails={paymentDetails}
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
