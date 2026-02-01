// ==================== SUPABASE CONFIG ====================
const supabaseUrl = "https://mrizwvsvkgislsejajji.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yaXp3dnN2a2dpc2xzZWphamppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Njg3MDcsImV4cCI6MjA4NTU0NDcwN30.K6-WvJetOQp6ypjTS9IwA2AHO2PbrI0dkUGOhLIFtZc";

const supabaseEnabled =
  typeof supabaseUrl !== 'undefined' &&
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your_');

function initSupabase() {
  if (!supabaseEnabled) return null;
  if (typeof supabase === 'undefined') return null;
  
  return supabase.createClient(supabaseUrl, supabaseAnonKey);
}
