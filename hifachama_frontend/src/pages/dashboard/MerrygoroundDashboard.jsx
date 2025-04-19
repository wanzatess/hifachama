import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { 
  MemberRotation, 
  RotationAnalytics, 
  MemberManager 
} from '../../components/Merrygoround';
import ContributionForm from "../../components/ContributionForm";
import ContributionHistory from '../../components/ContributionHistory';
import WithdrawalForm from "../../components/WithdrawalForm";
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MerryGoRoundDashboard = () => {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [missedContributions, setMissedContributions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [chamaData, setChamaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch chama data
        const chamaResponse = await axios.get(
          `https://hifachama-backend.onrender.com/api/chamas/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setChamaData(chamaResponse.data);

        // Fetch user data
        const userResponse = await axios.get(
          'https://hifachama-backend.onrender.com/api/current_user/',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(userResponse.data);

        // Fetch Supabase data
        const { data: membersData } = await supabase.from('HIFACHAMA_customuser').select('*');
        const { data: transactionsData } = await supabase.from('HIFACHAMA_transaction').select('*');

        const contributions = transactionsData.filter(t => t.transaction_type === 'contribution');
        const missedContributionsData = contributions.filter(transaction => !transaction.paid);

        setMembers(membersData || []);
        setTransactions(transactionsData || []);
        setMissedContributions(missedContributionsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscriptions
    const memberSub = supabase.channel('realtime:members')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'HIFACHAMA_customuser',
      }, () => fetchData())
      .subscribe();

    const transactionSub = supabase.channel('realtime:transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'HIFACHAMA_transaction',
      }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(memberSub);
      supabase.removeChannel(transactionSub);
    };
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4E4528]"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {chamaData?.name || 'Merry-go-round Chama'} Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <MemberManager members={members} setMembers={setMembers} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <MemberRotation 
            members={members} 
            onUpdateMembers={setMembers}
            contributions={transactions.filter(t => t.transaction_type === 'contribution')}
            setContributions={setTransactions}
            missedContributions={missedContributions}
            setMissedContributions={setMissedContributions}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <RotationAnalytics 
            members={members}
            contributions={transactions.filter(t => t.transaction_type === 'contribution')}
            missedContributions={missedContributions}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          {userData && chamaData && (
            <ContributionForm 
              chamaId={chamaData.id} 
              userId={userData.id} 
            />
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
        <DashboardCard title="Contribution History">
          <ContributionHistory />
        </DashboardCard>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
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