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
import { BasicAccounting } from '../../components/Hybrid';
import { ContributionForm, WithdrawalForm } from '../../components'; // Import both forms
import '../../styles/Dashboard.css';

const InvestmentDashboard = () => {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [expenses, setExpenses] = useState([]);
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
  };

  useEffect(() => {
    fetchData();

    const membersSub = supabase.channel('realtime:members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_customuser' }, fetchData)
      .subscribe();

    const transSub = supabase.channel('realtime:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_transaction' }, fetchData)
      .subscribe();

    const investSub = supabase.channel('realtime:investments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_investment' }, fetchData)
      .subscribe();

    const loanSub = supabase.channel('realtime:loans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_loan' }, fetchData)
      .subscribe();

    const expenseSub = supabase.channel('realtime:expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_expense' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(membersSub);
      supabase.removeChannel(transSub);
      supabase.removeChannel(investSub);
      supabase.removeChannel(loanSub);
      supabase.removeChannel(expenseSub);
    };
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Investment Chama Dashboard</h1>
      <div className="dashboard-cards-grid">
        <div className="dashboard-card">
          <MemberManager members={members} setMembers={setMembers} />
        </div>
        <div className="dashboard-card">
          <SavingsTracker 
            contributions={contributions} 
            setContributions={setContributions} 
          />
        </div>
        <div className="dashboard-card">
          <InvestmentTracker 
            investments={investments} 
            setInvestments={setInvestments} 
          />
        </div>
        <div className="dashboard-card">
          <LoanManager 
            loans={loans} 
            setLoans={setLoans} 
          />
        </div>
        <div className="dashboard-card">
          <MeetingManager />
        </div>
        <div className="dashboard-card">
          <ExpenseTracker 
            expenses={expenses} 
            setExpenses={setExpenses} 
          />
        </div>
        <div className="dashboard-card">
          <FinancialReports 
            contributions={contributions}
            expenses={expenses}
            investments={investments}
            loans={loans}
          />
        </div>
        <div className="dashboard-card">
          <NotificationCenter />
        </div>
        <div className="dashboard-card">
          <AssetRegister />
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

export default InvestmentDashboard;