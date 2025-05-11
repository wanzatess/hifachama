import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext';

export const useMeetings = () => {
  const { chamaData } = useContext(ChamaContext);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    if (!chamaData?.id) return;

    const fetchMeetings = async () => {
      const { data } = await supabase.from('HIFACHAMA_meeting').select('*').eq('chama_id', chamaData.id);
      setMeetings(data || []);
    };

    fetchMeetings();

    const channel = supabase.channel('realtime:HIFACHAMA_meeting');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_meeting' }, (payload) => {
      if (payload.new?.chama_id !== chamaData.id) return;
      setMeetings((prev) => {
        switch (payload.eventType) {
          case 'INSERT':
            return [...prev, payload.new];
          case 'UPDATE':
            return prev.map((item) => (item.id === payload.new.id ? payload.new : item));
          case 'DELETE':
            return prev.filter((item) => item.id !== payload.old.id);
          default:
            return prev;
        }
      });
    });

    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, [chamaData?.id]);

  return { meetings };
};