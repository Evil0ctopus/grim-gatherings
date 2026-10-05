import { createSupabaseHandler } from '../../../server/supabase-api.js';

const handler = createSupabaseHandler({
  url: Deno.env.get('SUPABASE_URL') || '',
  anonKey: Deno.env.get('SUPABASE_ANON_KEY') || '',
  serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  origins: (Deno.env.get('GG_ALLOWED_ORIGINS') || '').split(',').map(value => value.trim()).filter(Boolean),
  siteUrl: Deno.env.get('GG_SITE_URL') || '',
  registration: Deno.env.get('GG_REGISTRATION') !== 'closed',
});

Deno.serve(handler);
