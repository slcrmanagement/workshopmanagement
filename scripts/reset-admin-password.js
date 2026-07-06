/**
 * Resets an admin user back to the "no password set" state, without sending
 * any email. The user then just re-enters their email at
 * /administration/login and gets the same "create your password" step as a
 * first-time login. Their old password stops being usable once they set a
 * new one (set-password always overwrites it).
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/reset-admin-password.js someone@example.com
 *
 * (export both vars from .env.local in your shell first, e.g.:
 *   export $(grep -v '^#' .env.local | xargs) )
 */

const { createClient } = require('@supabase/supabase-js');

const email = process.argv[2];

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: node scripts/reset-admin-password.js <email>');
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
  // generateLink looks the user up by email without sending anything.
  const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email });

  if (error || !data?.user) {
    console.error(`✗ No admin user found for ${email}.`);
    process.exit(1);
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(data.user.id, {
    app_metadata: { password_set: false },
  });

  if (updateError) {
    console.error(`✗ Could not reset password state: ${updateError.message}`);
    process.exit(1);
  }

  console.log(`✓ ${email} will be prompted to create a new password on next login.`);
}

main();
