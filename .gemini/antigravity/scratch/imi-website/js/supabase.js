/**
 * I MAKE IMAGE (IMI) - Supabase Auth & Data Client v3.0
 * Redirects directly to unified auth-client logic.
 */

// Load auth-client implementation
if (typeof IMI_AUTH === 'undefined') {
  const script = document.createElement('script');
  const root = window.location.pathname.includes('/pages/') ? '../js/' : 'js/';
  script.src = root + 'auth-client.js';
  document.head.appendChild(script);
}
