export const VITE_SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL as string;
export const VITE_SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

export const supabaseUrl = VITE_SUPABASE_URL;
export const projectUrl = VITE_SUPABASE_URL;
export const url = VITE_SUPABASE_URL;

export const supabaseAnonKey = VITE_SUPABASE_ANON_KEY;
export const anonKey = VITE_SUPABASE_ANON_KEY;
export const publicAnonKey = VITE_SUPABASE_ANON_KEY;

// Derive the Supabase project ref (first label of the hostname)
const _projectId = (() => {
  try {
    const host = new URL(VITE_SUPABASE_URL).hostname; // e.g. abcd1234.supabase.co
    const ref = host.split('.')[0];
    return ref || VITE_SUPABASE_URL;
  } catch {
    return VITE_SUPABASE_URL;
  }
})();

export const projectId = _projectId;
export const projectRef = _projectId;
export const ref = _projectId;

export default {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  supabaseUrl,
  projectUrl,
  url,
  supabaseAnonKey,
  anonKey,
  publicAnonKey,
  projectId,
  projectRef,
  ref,
};
