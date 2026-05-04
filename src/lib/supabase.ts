import { createClient } from '@supabase/supabase-js';

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

// Transform S3 endpoint back to API endpoint if user pasted it
// https://[project].storage.supabase.co/storage/v1/s3 -> https://[project].supabase.co
supabaseUrl = supabaseUrl.replace(/\.storage\.supabase\.co\/storage\/v1\/s3$/, ".supabase.co");

// Remove trailing slashes AND accidental suffixes if user pasted them
supabaseUrl = supabaseUrl
  .replace(/\/+$/, "")
  .replace(/\/storage\/v1$/, "")
  .replace(/\/rest\/v1$/, "")
  .replace(/\/v1$/, "");

if (supabaseUrl.includes('supabase.com/dashboard')) {
  console.error('VITE_SUPABASE_URL is set to a dashboard URL. It must be the API URL (e.g., https://xyz.supabase.co)');
}

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url') {
  console.warn('Supabase credentials missing. App will use mock data until configured.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
