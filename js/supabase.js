/**
 * ==========================================================================
 * SUPABASE CLIENT CONFIGURATION & INITIALIZATION
 * ==========================================================================
 */

const SUPABASE_URL = 'https://hqgdunnknppwidhqgoft.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cRs8hENTFXzoImQ1Nly64g_FcobsI6x';

const supabaseClient = (typeof window !== 'undefined' && window.supabase && SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
  ? window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    )
  : null;

// Expose globally
if (typeof window !== 'undefined') {
  window.supabaseClient = supabaseClient;
}
