import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../../utils/supabaseClient';
import { 
  MemberManager, 
  ContributionTracker, 
  MemberRotation, 
  HybridReports 
} from '../../components/Hybrid';
import ContributionForm from '../../components/ContributionForm';
import ContributionHistory from '../../components/ContributionHistory';
import WithdrawalForm from '../../components/WithdrawalForm';
import { useParams } from 'react-router-dom';

const HybridDashboard = () => {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loans, setLoans] = useState([]);
  const [userData, setUserData] = useState(null);
  const [chamaData, setChamaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const chamaResponse = await axios.get(
          `https://hifachama-backend.onrender.com/api/chamas/${id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setChamaData(chamaResponse.data);

        const userResponse = await axios.get(
          'https://hifachama-backend.onrender.com/api/current_user/',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserData(userResponse.data);

        const { data: membersData } = await supabase.from('HIFACHAMA_customuser').select('*');
        const { data: transactionsData } = await supabase.from('HIFACHAMA_transaction').select('*');
        const { data: meetingsData } = await supabase.from('HIFACHAMA_meeting').select('*');
        const { data: loansData } = await supabase.from('HIFACHAMA_loan').select('*');

        setMembers(membersData || []);
        setContributions(transactionsData || []);
        setMeetings(meetingsData || []);
        setLoans(loansData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const subscriptions = [
      supabase.channel('realtime:members').on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_customuser' }, fetchData),
      supabase.channel('realtime:transactions').on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_transaction' }, fetchData),
      supabase.channel('realtime:meetings').on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_meeting' }, fetchData),
      supabase.channel('realtime:loans').on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_loan' }, fetchData)
    ].map(channel => channel.subscribe());

    return () => subscriptions.forEach(channel => supabase.removeChannel(channel));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4E4528]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {chamaData?.name || 'Hybrid Chama'} Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="Member Management">
            <MemberManager members={members} setMembers={setMembers} />
          </DashboardCard>
          
          <DashboardCard title="Contributions">
            <ContributionTracker 
              members={members} 
              contributions={contributions} 
              setContributions={setContributions} 
            />
          </DashboardCard>

          <DashboardCard title="Contribution Form">
            {userData && chamaData && <ContributionForm chamaId={chamaData.id} userId={userData.id} />}
          </DashboardCard>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="Contribution History">
            <ContributionHistory />
          </DashboardCard>

          <DashboardCard title="Withdrawal Form">
            {userData && chamaData && <WithdrawalForm chamaId={chamaData.id} userId={userData.id} />}
          </DashboardCard>

          <DashboardCard title="Member Rotation">
            <MemberRotation members={members} contributions={contributions} />
          </DashboardCard>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <DashboardCard title="Reports">
          <HybridReports members={members} contributions={contributions} loans={loans} />
        </DashboardCard>
      </div>
    </div>
  );
};

function DashboardCard({ title, children }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4 text-[#4E4528]">{title}</h2>
      {children}
    </div>
  );
}

export default HybridDashboard;