import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  MemberManager, 
  ContributionTracker, 
  MemberRotation, 
  HybridReports 
} from '../../components/Hybrid';
import '../../styles/Dashboard.css';

const HybridDashboard = () => {
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loans, setLoans] = useState([]);

  // Fetch initial data
  const fetchData = async () => {
    const { data: membersData } = await supabase.from('HIFACHAMA_customuser').select('*');
    const { data: transactionsData } = await supabase.from('HIFACHAMA_transaction').select('*');
    const { data: meetingsData } = await supabase.from('HIFACHAMA_meeting').select('*');
    const { data: loansData } = await supabase.from('HIFACHAMA_loan').select('*');

    setMembers(membersData || []);
    setContributions(transactionsData || []);
    setMeetings(meetingsData || []);
    setLoans(loansData || []);
  };

  useEffect(() => {
    fetchData();

    const memberSub = supabase.channel('realtime:members')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'HIFACHAMA_customuser',
      }, fetchData)
      .subscribe();

    const transactionSub = supabase.channel('realtime:transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'HIFACHAMA_transaction',
      }, fetchData)
      .subscribe();

    const meetingSub = supabase.channel('realtime:meetings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'HIFACHAMA_meeting',
      }, fetchData)
      .subscribe();

    const loanSub = supabase.channel('realtime:loans')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'HIFACHAMA_loan',
      }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(memberSub);
      supabase.removeChannel(transactionSub);
      supabase.removeChannel(meetingSub);
      supabase.removeChannel(loanSub);
    };
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Hybrid Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
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
        <div className="dashboard-card">
          <MemberRotation members={members} contributions={contributions} />
        </div>
        <div className="dashboard-card">
          <HybridReports 
            members={members}
            contributions={contributions}
            loans={loans}
          />
        </div>
      </div>
    </div>
  );
};

export default HybridDashboard;
