import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

export const useWithdrawals = () => {
  const { chamaData, userData } = useContext(ChamaContext);
  const [withdrawals, setWithdrawals] = useState([]);
  const [memberId, setMemberId] = useState(null);

  const refreshWithdrawals = async () => {
    if (!chamaData?.id || !userData?.id) return;

    try {
      const { data: memberData } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id, chama_id')
        .eq('user_id', userData.id)
        .single();
      if (!memberData) return;
      setMemberId(memberData.id);

      const { data: chamaMembers } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id')
        .eq('chama_id', memberData.chama_id);
      const memberIds = chamaMembers?.map((m) => m.id) || [];

      const { data: transactions } = await supabase
        .from('HIFACHAMA_transaction')
        .select('*, HIFACHAMA_chamamember!inner(user_id, HIFACHAMA_customuser!inner(username))')
        .in('member_id', memberIds)
        .eq('category', 'withdrawal');

      const formattedWithdrawals = transactions.map((t) => ({
        ...t,
        username: t.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown',
      }));
      setWithdrawals(formattedWithdrawals || []);
    } catch (err) {
      console.error('Error refreshing withdrawals:', err);
      toast.error('Failed to refresh withdrawals.');
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
      await refreshWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} withdrawal.`);
    }
  };

  useEffect(() => {
    if (!chamaData?.id || !userData?.id) return;

    refreshWithdrawals();

    const channel = supabase.channel('realtime:HIFACHAMA_transaction');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_transaction' }, async (payload) => {
      const { new: newRow, eventType, old: oldRow } = payload;
      if (newRow?.category !== 'withdrawal' || newRow?.chama_id !== chamaData.id) return;

      const { data: memberData } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('HIFACHAMA_customuser!inner(username)')
        .eq('id', newRow.member_id)
        .single();

      const formatted = {
        ...t,
        username: memberData?.HIFACHAMA_customuser?.username || 'Unknown',
      };

      setWithdrawals((prev) => {
        switch (eventType) {
          case 'INSERT':
            return [...prev, formatted];
          case 'UPDATE':
            return prev.map((item) => (item.id === formatted.id ? formatted : item));
          case 'DELETE':
            return prev.filter((item) => item.id !== oldRow.id);
          default:
            return prev;
        }
      });
    });

    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, [chamaData?.id, userData?.id]);

  return { withdrawals, memberId, refreshWithdrawals, handleWithdrawalAction };
};