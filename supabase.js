// ==================== SUPABASE CONFIG ====================
const supabaseUrl = "https://tmnpgbezdvghvvpqnpln.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtbnBnYmV6ZHZnaHZ2cHFucGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NzAwNTcsImV4cCI6MjA4NTU0NjA1N30.h4mWNOiRleiA0y1KTn6cwU-IO0D-NGfEYO2iswF-gDs";

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
