export const VITE_SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL as string;
export const VITE_SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

export const supabaseUrl = VITE_SUPABASE_URL;
export const projectUrl = VITE_SUPABASE_URL;
export const url = VITE_SUPABASE_URL;

export const supabaseAnonKey = VITE_SUPABASE_ANON_KEY;
export const anonKey = VITE_SUPABASE_ANON_KEY;
export const publicAnonKey = VITE_SUPABASE_ANON_KEY;

export default {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  supabaseUrl,
  projectUrl,
  url,
  supabaseAnonKey,
  anonKey,
  publicAnonKey,
};
