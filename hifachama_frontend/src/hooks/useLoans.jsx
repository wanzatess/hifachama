import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext'; // Adjust path
import { toast } from 'react-toastify';

export const useLoans = () => {
  const { chamaData, userData } = useContext(ChamaContext);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshLoans = async () => {
    if (!chamaData?.id || !userData?.id) {
      setError('Missing chama or user data.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch the current user's chama member ID
      const { data: memberData, error: memberError } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id, chama_id')
        .eq('user_id', userData.id)
        .eq('chama_id', chamaData.id)
        .single();

      if (memberError || !memberData) {
        throw new Error('Failed to fetch member data.');
      }

      // Fetch all member IDs for the chama
      const { data: chamaMembers, error: membersError } = await supabase
        .from('HIFACHAMA_chamamember')
        .select('id')
        .eq('chama_id', memberData.chama_id);

      if (membersError) {
        throw new Error('Failed to fetch chama members.');
      }

      const memberIds = chamaMembers?.map((m) => m.id) || [];

      // Fetch loans for the chama's members
      const { data: loansData, error: loansError } = await supabase
        .from('HIFACHAMA_loan')
        .select('*, HIFACHAMA_chamamember!inner(user_id, HIFACHAMA_customuser!inner(username))')
        .in('member_id', memberIds);

      if (loansError) {
        throw new Error('Failed to fetch loans.');
      }

      const formattedLoans = loansData.map((loan) => ({
        ...loan,
        member_name: loan.HIFACHAMA_chamamember?.HIFACHAMA_customuser?.username || 'Unknown',
      }));

      setLoans(formattedLoans || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh loans.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chamaData?.id || !userData?.id) {
      setError('Missing chama or user data.');
      setLoading(false);
      return;
    }

    refreshLoans();

    // Set up real-time subscription
    const channel = supabase.channel('realtime:HIFACHAMA_loan');
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'HIFACHAMA_loan', filter: `chama_id=eq.${chamaData.id}` },
      async (payload) => {
        const { new: newRow, eventType, old: oldRow } = payload;
        if (newRow?.chama_id !== chamaData.id) return;

        try {
          // Fetch member username for the new or updated loan
          const { data: memberData, error: memberError } = await supabase
            .from('HIFACHAMA_chamamember')
            .select('HIFACHAMA_customuser!inner(username)')
            .eq('id', newRow.member_id)
            .single();

          if (memberError) {
            throw new Error('Failed to fetch member data for loan.');
          }

          const formatted = {
            ...newRow,
            member_name: memberData?.HIFACHAMA_customuser?.username || 'Unknown',
          };

          setLoans((prev) => {
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
        } catch (err) {
          toast.error('Failed to process loan update.');
        }
      }
    );

    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, [chamaData?.id, userData?.id]);

  return { loans, loading, error, refreshLoans };
};