import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton Supabase client to prevent multiple GoTrueClient instances
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient && projectId && projectId !== 'your-project-id') {
    console.log('🔗 Creating singleton Supabase client for project:', projectId);
    console.log('📊 Supabase URL will be:', `https://${projectId}.supabase.co`);
    supabaseClient = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      }
    );
    console.log('✅ Supabase client created successfully');
  } else if (supabaseClient) {
    console.log('♻️ Returning existing Supabase client');
  } else {
    console.log('❌ Cannot create Supabase client - missing projectId or invalid config');
    console.log('📊 projectId:', projectId, 'hasAnonKey:', !!publicAnonKey);
  }
  return supabaseClient;
};

// Export a default instance for convenience
export const supabase = getSupabaseClient();