/**
 * Provisions a new admin-only Supabase user: email only, no password.
 * The user sets their own password on first login at /administration/login.
 *
 * There is no public sign-up — this script is the only way a new admin
 * account gets created.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/add-admin-user.js someone@example.com
 *
 * (export both vars from .env.local in your shell first, e.g.:
 *   export $(grep -v '^#' .env.local | xargs) )
 */

const { createClient } = require('@supabase/supabase-js');

const email = process.argv[2];

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: node scripts/add-admin-user.js <email>');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    app_metadata: { password_set: false },
  });

  if (error) {
    console.error(`✗ Could not create user: ${error.message}`);
    process.exit(1);
  }

  console.log(`✓ Admin user provisioned: ${email} (id: ${data.user.id})`);
  console.log('  They can now log in at /administration/login to set their password.');
}

main();
