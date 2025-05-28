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
        // Fetch the current member's record by user_id and chama_id
        const { data: memberData, error: memberError } = await supabase
          .from('HIFACHAMA_chamamember')
          .select('id')
          .eq('user_id', userData.id)
          .eq('chama_id', chamaData.id)
          .single();

        if (memberError) throw memberError;

        setMemberId(memberData?.id);

        // Fetch all members of the chama with embedded user details
        const { data: users, error: usersError } = await supabase
          .from('HIFACHAMA_chamamember')
          .select(`
            id,
            chama_id,
            HIFACHAMA_customuser: user_id (
              id,
              email,
              username,
              first_name,
              phone_number
            )
          `)
          .eq('chama_id', chamaData.id);

        if (usersError) throw usersError;

        // Flatten user data to a simple array - FIXED property name
        const formattedMembers = users.map((entry) => ({
          ...entry.HIFACHAMA_customuser,  // Corrected from entry.user
          memberId: entry.id,
        }));

        setMembers(formattedMembers || []);
      } catch (err) {
        console.error('Error fetching members:', err);
      }
    };

    fetchMembers();

    // Setup real-time updates on the chama member table
    const channel = supabase.channel('realtime:HIFACHAMA_chamamember');
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'HIFACHAMA_chamamember',
      },
      fetchMembers
    );
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chamaData?.id, userData?.id]);

  return { members, memberId };
};
