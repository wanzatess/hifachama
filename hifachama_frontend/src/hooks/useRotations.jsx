import { useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { ChamaContext } from '../context/ChamaContext';

export const useRotations = () => {
  const { chamaData } = useContext(ChamaContext);
  const [state, setState] = useState({
    rotations: [],
    currentRotation: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchRotations = async () => {
      if (!chamaData?.id) {
        setState({
          rotations: [],
          currentRotation: null,
          loading: false,
          error: 'Chama ID is required',
        });
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Fetch rotations
        const { data: rotationsData, error: rotationsError } = await supabase
          .from('HIFACHAMA_rotation')
          .select(`
            id,
            chama_id,
            cycle_date,
            frequency,
            status,
            payout_amount,
            completed,
            member_id
          `)
          .eq('chama_id', chamaData.id)
          .order('cycle_date', { ascending: true });

        if (rotationsError) {
          console.error('Supabase rotation fetch error:', rotationsError.message, rotationsError.details, rotationsError.hint);
          throw rotationsError;
        }

        // Extract member_ids to fetch user data
        const memberIds = [...new Set(rotationsData?.map(rot => rot.member_id).filter(id => id) || [])];
        let memberData = [];

        if (memberIds.length > 0) {
          const { data: members, error: memberError } = await supabase
            .from('HIFACHAMA_chamamember')
            .select(`
              id,
              user_id,
              HIFACHAMA_customuser: user_id (
                id,
                username,
                email,
                first_name,
                phone_number
              )
            `)
            .in('id', memberIds)
            .eq('is_active', true);

          if (memberError) {
            console.error('Supabase member fetch error:', memberError.message, memberError.details, memberError.hint);
            throw memberError;
          }
          memberData = members || [];
        }

        // Map usernames or emails to rotations using the joined user data
        const memberMap = new Map(
          memberData.map(m => [
            m.id,
            m.HIFACHAMA_customuser?.username || m.HIFACHAMA_customuser?.email || 'Unknown Member',
          ])
        );

        const validRotations = (rotationsData || []).map(rot => ({
          id: rot.id,
          chama_id: rot.chama_id,
          cycle_date: rot.cycle_date,
          frequency: rot.frequency,
          status: rot.status,
          payout_amount: rot.payout_amount || 0,
          completed: rot.completed,
          member_id: rot.member_id,
          username: rot.member_id ? memberMap.get(rot.member_id) || 'Unknown Member' : 'No Member',
        }));

        console.log('Fetched rotations:', validRotations);

        // Find current rotation (active, not completed, on or before today)
        const today = new Date().toISOString().split('T')[0];
        const currentRotation = validRotations.find(
          rot => rot.cycle_date <= today && !rot.completed && rot.status === 'scheduled'
        );

        // Filter upcoming rotations (future, not completed)
        const upcomingRotations = validRotations.filter(
          rot => rot.cycle_date > today && !rot.completed
        );

        setState({
          rotations: upcomingRotations,
          currentRotation,
          loading: false,
          error: null,
        });

        // Subscribe to real-time updates
        const subscription = supabase
          .channel('rotation-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'HIFACHAMA_rotation',
              filter: `chama_id=eq.${chamaData.id}`,
            },
            () => fetchRotations()
          )
          .subscribe();

        return () => supabase.removeChannel(subscription);
      } catch (err) {
        console.error('Error fetching rotations:', err.message, err.details, err.hint);
        setState({
          rotations: [],
          currentRotation: null,
          loading: false,
          error: `Failed to load rotations: ${err.message}`,
        });
      }
    };

    fetchRotations();
  }, [chamaData?.id]);

  return state;
};
