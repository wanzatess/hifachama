import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext';
import { toast } from 'react-toastify';

export const useContributions = () => {
  const { chamaData, userData } = useContext(ChamaContext);
  const [contributions, setContributions] = useState([]);

  const refreshContributions = async () => {
    if (!chamaData?.id || !userData?.id) return;

    try {
      const { data: memberData } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id, chama_id')
        .eq('user_id', userData.id)
        .single();
      if (!memberData) return;

      const { data: chamaMembers } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id')
        .eq('chama_id', memberData.chama_id);
      const memberIds = chamaMembers?.map((m) => m.id) || [];

      const { data: transactions } = await supabase
        .from('HIFACHAMA_transaction')
        .select('*, HIFACHAMA_chamamember!inner(user_id, HIFACHAMA_customuser!inner(username))')
        .in('member_id', memberIds)
        .eq('category', 'contribution');

      const formattedTransactions = transactions.map((t) => ({
        ...t,
        username: t.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown',
      }));
      setContributions(formattedTransactions || []);
    } catch (err) {
      console.error('Error refreshing contributions:', err);
      toast.error('Failed to refresh contributions.');
    }
  };

  useEffect(() => {
    if (!chamaData?.id || !userData?.id) return;

    refreshContributions();

    const channel = supabase.channel('realtime:HIFACHAMA_transaction');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_transaction' }, async (payload) => {
      const { new: newRow, eventType, old: oldRow } = payload;
      if (newRow?.category !== 'contribution' || newRow?.chama_id !== chamaData.id) return;

      const { data: memberData } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('HIFACHAMA_customuser!inner(username)')
        .eq('id', newRow.member_id)
        .single();

      const formatted = {
        ...newRow,
        username: memberData?.HIFACHAMA_customuser?.username || 'Unknown',
      };

      setContributions((prev) => {
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

  return { contributions, refreshContributions };
};