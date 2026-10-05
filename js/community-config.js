// Set to your HTTPS backend origin when the frontend is hosted on GitHub Pages.
// Empty means same-origin: run the Node service to host both the game and API.
// The deployment helper verifies health before connecting a Supabase function URL.
export const COMMUNITY_API = 'https://yrnfkaatsyenlzdmjbzt.supabase.co/functions/v1/community';
// "node" for the original service, "supabase" for a deployed community Edge Function.
export const COMMUNITY_PROVIDER = 'supabase';
