import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhzjaepghimzvdjyokcw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoemphZXBnaGltenZkanlva2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjIxMDcsImV4cCI6MjA1ODM5ODEwN30.-N53uixRsUrfwzq7rcmwtpZf4YxhaR327Ift3Ymu_Z4';

// ✅ FIRST: Create the supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ THEN: Assign it to window
window.supabase = supabase;
