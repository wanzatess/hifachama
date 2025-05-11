import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext';

export const useMembers = () => {
  const { chamaData, userData } = useContext(ChamaContext);
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState(null);

  useEffect(() => {
    if (!chamaData?.id || !userData?.id) return;

    const fetchMembers = async () => {
      try {
        const { data: memberData } = await supabase
          .from('HIFACHAMA_chamamember')
          .select('id, chama_id')
          .eq('user_id', userData.id)
          .single();
        setMemberId(memberData?.id);

        const { data: users } = await supabase
          .from('HIFACHAMA_customuser')
          .select('*, HIFACHAMA_chamamember!inner(chama_id)')
          .eq('HIFACHAMA_chamamember.chama_id', chamaData.id);
        setMembers(users || []);
      } catch (err) {
        console.error('Error fetching members:', err);
      }
    };

    fetchMembers();

    const channel = supabase.channel('realtime:HIFACHAMA_chamamember');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_chamamember' }, async (payload) => {
      const { data: updatedMembers } = await supabase
        .from('HIFACHAMA_customuser')
        .select('*, HIFACHAMA_chamamember!inner(chama_id)')
        .eq('HIFACHAMA_chamamember.chama_id', chamaData.id);
      setMembers(updatedMembers || []);
    });

    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, [chamaData?.id, userData?.id]);

  return { members, memberId };
};