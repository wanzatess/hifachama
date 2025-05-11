import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext';

export const useBalance = () => {
  const { chamaData } = useContext(ChamaContext);
  const [balance, setBalance] = useState(null);

  const refreshBalance = async () => {
    if (!chamaData?.id) return;

    try {
      const { data: balanceData, error } = await supabase
        .from('HIFACHAMA_balance')
        .select('*')
        .eq('chama_id', chamaData.id);
      if (error) throw new Error(`Supabase error: ${error.message}`);
      setBalance(balanceData?.[0] || null);
    } catch (err) {
      console.error('Error refreshing balance:', err.message);
      setBalance(null);
    }
  };

  useEffect(() => {
    if (!chamaData?.id) return;

    refreshBalance();

    const channel = supabase.channel('realtime:HIFACHAMA_balance');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_balance' }, (payload) => {
      if (payload.new?.chama_id !== chamaData.id) return;
      setBalance(payload.eventType === 'DELETE' ? null : payload.new);
    });

    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, [chamaData?.id]);

  return { balance, refreshBalance };
};