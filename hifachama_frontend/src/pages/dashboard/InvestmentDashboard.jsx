import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { 
  MemberManager, 
  SavingsTracker, 
  InvestmentTracker, 
  LoanManager,
  MeetingManager,
  ExpenseTracker,
  FinancialReports,
  NotificationCenter,
  AssetRegister
} from '../../components/Investment';
import ContributionForm from "../../components/ContributionForm";
import ContributionHistory from '../../components/ContributionHistory';
import WithdrawalForm from "../../components/WithdrawalForm";
import { useParams } from 'react-router-dom';
import axios from 'axios';

const InvestmentDashboard = () => {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [expenses, setExpenses] = useState([]);
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
          'https://hifachama-backend.onrender.com/api/users/me/',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(userResponse.data);

        // Fetch Supabase data
        const { data: users } = await supabase.from('HIFACHAMA_customuser').select('*');
        const { data: trans } = await supabase.from('HIFACHAMA_transaction').select('*');
        const { data: invest } = await supabase.from('HIFACHAMA_investment').select('*');
        const { data: loan } = await supabase.from('HIFACHAMA_loan').select('*');
        const { data: expense } = await supabase.from('HIFACHAMA_expense').select('*');

        setMembers(users || []);
        setTransactions(trans || []);
        setContributions(trans.filter(t => t.transaction_type === 'contribution') || []);
        setInvestments(invest || []);
        setLoans(loan || []);
        setExpenses(expense || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscriptions
    const membersSub = supabase.channel('realtime:members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_customuser' }, () => fetchData())
      .subscribe();

    const transSub = supabase.channel('realtime:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_transaction' }, () => fetchData())
      .subscribe();

    const investSub = supabase.channel('realtime:investments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_investment' }, () => fetchData())
      .subscribe();

    const loanSub = supabase.channel('realtime:loans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_loan' }, () => fetchData())
      .subscribe();

    const expenseSub = supabase.channel('realtime:expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_expense' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(membersSub);
      supabase.removeChannel(transSub);
      supabase.removeChannel(investSub);
      supabase.removeChannel(loanSub);
      supabase.removeChannel(expenseSub);
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
        {chamaData?.name || 'Investment Chama'} Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <MemberManager members={members} setMembers={setMembers} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <SavingsTracker 
            contributions={contributions} 
            setContributions={setContributions} 
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <InvestmentTracker 
            investments={investments} 
            setInvestments={setInvestments} 
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <LoanManager 
            loans={loans} 
            setLoans={setLoans} 
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <MeetingManager />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <ExpenseTracker 
            expenses={expenses} 
            setExpenses={setExpenses} 
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <FinancialReports 
            contributions={contributions}
            expenses={expenses}
            investments={investments}
            loans={loans}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <NotificationCenter />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <AssetRegister />
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
          <ContributionHistory 
            contributions={contributions} 
            setContributions={setContributions} 
          />
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

export default InvestmentDashboard;