'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordClient() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // The recovery link puts a token in the URL; the Supabase client exchanges
    // it for a session automatically and fires PASSWORD_RECOVERY.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });

    // Fallback: if a session already exists by the time this mounts, allow
    // the form through rather than waiting indefinitely for the event.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    // If neither the event nor an existing session shows up in time, let the
    // form through anyway — a genuinely expired/invalid link will still be
    // caught by updateUser()'s own error below.
    const timeout = setTimeout(() => setReady(true), 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message || 'Could not update password. The link may have expired.');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/administration/login'), 2000);
  }

  return (
    <div className="max-w-sm mx-auto mt-8 sm:mt-16">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={20} className="text-slcr-blue" />
          <h1 className="section-title mb-0">Reset Password</h1>
        </div>

        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-700">Password updated. Redirecting to login…</p>
          </div>
        ) : !ready ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-6 justify-center">
            <Loader2 size={16} className="animate-spin" /> Verifying reset link…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                required
                autoFocus
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
