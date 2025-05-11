import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

export const usePaymentDetails = () => {
  const { chamaData } = useContext(ChamaContext);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    if (!chamaData?.id) return;

    const fetchPaymentDetails = async () => {
      try {
        const token = getAuthToken();
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/chamas/${chamaData.id}/add-payment-details/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPaymentDetails(data);
      } catch (err) {
        console.warn('No payment details found:', err);
        setPaymentDetails(null);
      }
    };

    fetchPaymentDetails();

    const channel = supabase.channel('realtime:HIFACHAMA_paymentdetails');
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'HIFACHAMA_paymentdetails' }, (payload) => {
      if (payload.new?.chama_id !== chamaData.id) return;
      setPaymentDetails(payload.eventType === 'DELETE' ? null : payload.new);
    });

    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, [chamaData?.id]);

  return { paymentDetails, setPaymentDetails };
};