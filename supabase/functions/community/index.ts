import { createSupabaseHandler } from '../../../server/supabase-api.js';

const handler = createSupabaseHandler({
  url: Deno.env.get('SUPABASE_URL') || '',
  anonKey: Deno.env.get('SUPABASE_ANON_KEY') || '',
  serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  origins: (Deno.env.get('GG_ALLOWED_ORIGINS') || '').split(',').map(value => value.trim()).filter(Boolean),
  siteUrl: Deno.env.get('GG_SITE_URL') || '',
  registration: Deno.env.get('GG_REGISTRATION') !== 'closed',
  paypal: {
    enabled: Deno.env.get('GG_PAYPAL_ENABLED') === 'true',
    environment: Deno.env.get('GG_PAYPAL_ENVIRONMENT') || 'sandbox',
    clientId: Deno.env.get('GG_PAYPAL_CLIENT_ID') || '',
    clientSecret: Deno.env.get('GG_PAYPAL_CLIENT_SECRET') || '',
    merchantId: Deno.env.get('GG_PAYPAL_MERCHANT_ID') || '',
    webhookId: Deno.env.get('GG_PAYPAL_WEBHOOK_ID') || '',
    supportEmail: Deno.env.get('GG_SUPPORT_EMAIL') || '',
    liveApproved: Deno.env.get('GG_PAYPAL_LIVE_APPROVED') === 'true',
  },
});

Deno.serve(handler);
