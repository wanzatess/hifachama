import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { 
  MemberRotation, 
  RotationAnalytics, 
  MemberManager 
} from '../../components/Merrygoround';
import ContributionForm from "../../components/ContributionForm";
import WithdrawalForm from "../../components/WithdrawalForm";
import '../../styles/Dashboard.css';

const MerryGoRoundDashboard = () => {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [missedContributions, setMissedContributions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [chamaData, setChamaData] = useState(null);

  // Fetch user and chama data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(
            'https://hifachama-backend.onrender.com/api/current_user/',
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUserData(response.data);
          
          if (response.data.chama_memberships && response.data.chama_memberships.length > 0) {
            const chamaResponse = await axios.get(
              `https://hifachama-backend.onrender.com/api/chamas/${response.data.chama_memberships[0].chama.id}/`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setChamaData(chamaResponse.data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  const fetchData = async () => {
    const { data: membersData } = await supabase.from('HIFACHAMA_customuser').select('*');
    const { data: transactionsData } = await supabase.from('HIFACHAMA_transaction')
      .select('*');

    const contributions = transactionsData.filter(t => t.transaction_type === 'contribution');
    const missedContributionsData = contributions.filter(transaction => !transaction.paid);

    setMembers(membersData || []);
    setTransactions(transactionsData || []);
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
            contributions={transactions.filter(t => t.transaction_type === 'contribution')}
            setContributions={setTransactions}
            missedContributions={missedContributions}
            setMissedContributions={setMissedContributions}
          />
        </div>
        <div className="dashboard-card">
          <RotationAnalytics 
            members={members}
            contributions={transactions.filter(t => t.transaction_type === 'contribution')}
            missedContributions={missedContributions}
          />
        </div>
        {/* Transaction Forms */}
        <div className="dashboard-card">
          {userData && chamaData && (
            <ContributionForm 
              chamaId={chamaData.id} 
              userId={userData.id} 
            />
          )}
        </div>
        <div className="dashboard-card">
          {userData && chamaData && (
            <WithdrawalForm 
              chamaId={chamaData.id} 
              userId={userData.id} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MerryGoRoundDashboard;