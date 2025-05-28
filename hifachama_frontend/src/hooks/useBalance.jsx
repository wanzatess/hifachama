import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext';

export const useBalance = () => {
  const { chamaData } = useContext(ChamaContext);
  const [balance, setBalance] = useState(null);

  const refreshBalance = async () => {
    if (!chamaData?.id) return;

    try {
      // Fetch transactions joined with members filtered by chama_id
      const { data, error } = await supabase
        .from('HIFACHAMA_transaction')
        .select(`
          transaction_type,
          amount,
          member_id,
          HIFACHAMA_chamamember!inner(chama_id)
        `)
        .eq('HIFACHAMA_chamamember.chama_id', chamaData.id);

      if (error) throw new Error(error.message);

      // Calculate rotational and investment totals
      const rotational_total = data
        .filter(t => t.transaction_type === 'rotational')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const investment_total = data
        .filter(t => t.transaction_type === 'investment')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setBalance({
        rotational_balance: rotational_total,
        investment_balance: investment_total,
      });
    } catch (err) {
      console.error('Error refreshing balance:', err.message);
      setBalance(null);
    }
  };

  useEffect(() => {
    if (!chamaData?.id) return;
    refreshBalance();

    // Optional: add real-time updates here if you want
  }, [chamaData?.id]);

  return { balance, refreshBalance };
};
