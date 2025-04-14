import { MemberRotation, RotationAnalytics, MemberManager } from '../../components/Merrygoround';
import '../../styles/Dashboard.css';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

const MerryGoRoundDashboard = () => {
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [missedContributions, setMissedContributions] = useState([]);

  // Fetch initial data
  const fetchData = async () => {
    const { data: membersData } = await supabase.from('HIFACHAMA_customuser').select('*');
    const { data: transactionsData } = await supabase.from('HIFACHAMA_transaction')
      .select('*')
      .eq('transaction_type', 'contribution');  // Assuming 'transaction_type' is how contributions are tracked

    const missedContributionsData = transactionsData.filter(transaction => !transaction.paid);  // Example: filter unpaid contributions

    setMembers(membersData || []);
    setContributions(transactionsData || []);
    setMissedContributions(missedContributionsData || []);
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

    return () => {
      supabase.removeChannel(memberSub);
      supabase.removeChannel(transactionSub);
    };
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Merry-go-round Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
        <div className="dashboard-card">
          <MemberManager members={members} setMembers={setMembers} />
        </div>
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
        <div className="dashboard-card">
          <RotationAnalytics 
            members={members}
            contributions={contributions}
            missedContributions={missedContributions}
          />
        </div>
      </div>
    </div>
  );
};

export default MerryGoRoundDashboard;
