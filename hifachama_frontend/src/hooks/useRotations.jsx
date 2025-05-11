import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext';

export const useRotations = () => {
  const { chamaData } = useContext(ChamaContext);
  const [rotations, setRotations] = useState([]);

  useEffect(() => {
    if (!chamaData?.id) return;

    const fetchRotations = async () => {
      const { data } = await supabase.from('HIFACHAMA_rotation').select('*').eq('chama_id', chamaData.id);
      setRotations(data || []);
    };

    fetchRotations();

    const channel = supabase.channel('realtime:HIFACHAMA_rotation');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_rotation' }, (payload) => {
      if (payload.new?.chama_id !== chamaData.id) return;
      setRotations((prev) => {
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

  return { rotations };
};