'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const STEPS = {
  EMAIL: 'email',
  PASSWORD: 'password',
  CREATE_PASSWORD: 'create-password',
  FORGOT_SENT: 'forgot-sent',
};

export default function LoginClient() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/administration/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'This email is not registered as an admin.');
        setSubmitting(false);
        return;
      }

      setStep(data.hasPassword ? STEPS.PASSWORD : STEPS.CREATE_PASSWORD);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('Incorrect email or password.');
      setSubmitting(false);
      return;
    }

    router.push('/administration');
    router.refresh();
  }

  async function handleCreatePasswordSubmit(e) {
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

    try {
      const res = await fetch('/api/administration/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Could not set password. Please try again.');
        setSubmitting(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError('Password set, but automatic login failed. Please log in again.');
        setStep(STEPS.PASSWORD);
        setSubmitting(false);
        return;
      }

      router.push('/administration');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setError('');
    setSubmitting(true);

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/administration/reset-password`,
    });

    // Always show the same confirmation, regardless of outcome, so this
    // action can't be used to probe which emails exist.
    setStep(STEPS.FORGOT_SENT);
    setSubmitting(false);
  }

  return (
    <div className="max-w-sm mx-auto mt-8 sm:mt-16">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={20} className="text-slcr-blue" />
          <h1 className="section-title mb-0">Admin Login</h1>
        </div>

        {step === STEPS.FORGOT_SENT ? (
          <div className="text-center py-4">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
            <p className="text-sm text-gray-700 mb-1">Check your inbox</p>
            <p className="text-xs text-gray-500">
              If <span className="font-medium">{email}</span> is a registered admin account,
              a password reset link has been sent.
            </p>
          </div>
        ) : (
          <>
            {step === STEPS.EMAIL && (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <ErrorBox error={error} />
                <SubmitButton submitting={submitting} label="Continue" />
              </form>
            )}

            {step === STEPS.PASSWORD && (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <p className="text-xs text-gray-500">{email}</p>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    required
                    autoFocus
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <ErrorBox error={error} />
                <SubmitButton submitting={submitting} label="Log In" />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={submitting}
                  className="text-xs text-slcr-blue hover:underline w-full text-center"
                >
                  Forgot password?
                </button>
              </form>
            )}

            {step === STEPS.CREATE_PASSWORD && (
              <form onSubmit={handleCreatePasswordSubmit} className="space-y-3">
                <p className="text-xs text-gray-500">
                  First time logging in as <span className="font-medium">{email}</span> — set a password.
                </p>
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
                <ErrorBox error={error} />
                <SubmitButton submitting={submitting} label="Set Password &amp; Continue" />
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
      <AlertCircle size={13} className="shrink-0 mt-0.5" />
      <span>{error}</span>
    </div>
  );
}

function SubmitButton({ submitting, label }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="btn-primary w-full flex justify-center items-center gap-2"
    >
      {submitting && <Loader2 size={14} className="animate-spin" />}
      {label}
    </button>
  );
}
