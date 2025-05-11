import { createContext, useContext } from 'react';
import { supabase } from '../utils/supabaseClient'; // Adjust path

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children, chamaId, userData }) => (
  <SupabaseContext.Provider value={{ supabase, chamaId, userData }}>
    {children}
  </SupabaseContext.Provider>
);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error('useSupabase must be used within a SupabaseProvider');
  return context;
};