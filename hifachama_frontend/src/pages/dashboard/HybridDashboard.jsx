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
import { FaUsers, FaMoneyBill, FaHandHoldingUsd, FaChartLine } from 'react-icons/fa';

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

  const totalContributions = contributions.reduce((sum, contrib) => sum + (contrib.amount || 0), 0);
  const totalLoans = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const availableBalance = totalContributions - totalLoans;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {chamaData?.name || 'Hybrid Chama'} Dashboard
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <SummaryCard
          icon={<FaMoneyBill className="text-white text-2xl" />}
          title="Total Contributions"
          amount={totalContributions}
          bgColor="bg-blue-500"
        />
        <SummaryCard
          icon={<FaHandHoldingUsd className="text-white text-2xl" />}
          title="Total Loans"
          amount={totalLoans}
          bgColor="bg-green-500"
        />
        <SummaryCard
          icon={<FaUsers className="text-white text-2xl" />}
          title="Total Members"
          amount={members.length}
          bgColor="bg-purple-500"
          isCount
        />
        <SummaryCard
          icon={<FaChartLine className="text-white text-2xl" />}
          title="Available Balance"
          amount={availableBalance}
          bgColor="bg-orange-500"
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contributions.slice(0, 5).map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{transaction.member_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">KES {transaction.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Member Management">
          <MemberManager members={members} setMembers={setMembers} />
        </DashboardCard>
        
        <DashboardCard title="Contribution Form">
          {userData && chamaData && <ContributionForm chamaId={chamaData.id} userId={userData.id} />}
        </DashboardCard>

        <DashboardCard title="Withdrawal Form">
          {userData && chamaData && <WithdrawalForm chamaId={chamaData.id} userId={userData.id} />}
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Contribution History">
          <ContributionHistory />
        </DashboardCard>

        <DashboardCard title="Member Rotation">
          <MemberRotation members={members} contributions={contributions} />
        </DashboardCard>
      </div>

      <DashboardCard title="Reports">
        <HybridReports members={members} contributions={contributions} loans={loans} />
      </DashboardCard>
    </div>
  );
};

const SummaryCard = ({ icon, title, amount, bgColor, isCount = false }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-2xl font-bold">
        {isCount ? amount : `KES ${amount?.toLocaleString() || '0'}`}
      </p>
    </div>
  );
};

const DashboardCard = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      {children}
    </div>
  );
};

export default HybridDashboard;