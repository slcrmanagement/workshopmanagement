'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import CertificatePreview from '@/components/CertificatePreview';

const STEPS = { EMAIL: 'email', FEEDBACK: 'feedback', CERTIFICATE: 'certificate' };

// Questions Q3–Q8 with their exact options
const RADIO_QUESTIONS = [
  {
    key: 'expectations',
    label: 'To what extent did the workshop meet your expectations?',
    options: [
      'Exceeded Expectations',
      'Met Expectations',
      'Partially Met Expectations',
      'Did Not Meet Expectations',
    ],
  },
  {
    key: 'overallQuality',
    label: 'How would you rate the overall quality of the workshop?',
    options: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
  },
  {
    key: 'contentRelevance',
    label: 'How relevant was the workshop content to your professional or academic needs?',
    options: ['Highly Relevant', 'Relevant', 'Somewhat Relevant', 'Not Relevant'],
  },
  {
    key: 'resourcePerson',
    label: 'How would you rate the knowledge and delivery of the resource person(s)?',
    options: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
  },
  {
    key: 'sessionEffectiveness',
    label: 'How effective were the presentations, discussions, and practical sessions?',
    options: ['Highly Effective', 'Effective', 'Moderately Effective', 'Not Effective'],
  },
  {
    key: 'arrangements',
    label: 'How would you rate the workshop arrangements, including venue, time management, and coordination?',
    options: ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement'],
  },
];

export default function FeedbackClient({ workshop: ws }) {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [participant, setParticipant] = useState(null);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href={`/${ws.id}/`}
        className="inline-flex items-center gap-1 text-xs text-slcr-blue hover:underline mb-4"
      >
        <ArrowLeft size={13} /> Back to Workshop
      </Link>

      {/* Step indicator — numbers only on tiny screens, labels on sm+ */}
      <div className="flex items-center mb-5 no-print">
        {[
          { key: STEPS.EMAIL, short: '1', label: 'Verify Email' },
          { key: STEPS.FEEDBACK, short: '2', label: 'Feedback' },
          { key: STEPS.CERTIFICATE, short: '3', label: 'Certificate' },
        ].map((s, i) => {
          const done =
            (s.key === STEPS.EMAIL && step !== STEPS.EMAIL) ||
            (s.key === STEPS.FEEDBACK && step === STEPS.CERTIFICATE);
          const active = step === s.key;
          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                    done
                      ? 'bg-green-500 text-white'
                      : active
                      ? 'bg-slcr-blue text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {done ? <CheckCircle2 size={12} /> : s.short}
                </div>
                <span
                  className={`hidden sm:block text-xs font-medium whitespace-nowrap ${
                    active ? 'text-slcr-blue' : done ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
            </div>
          );
        })}
      </div>

      {step === STEPS.EMAIL && (
        <EmailVerifyStep
          ws={ws}
          onVerified={(p) => {
            setParticipant(p);
            setStep(STEPS.FEEDBACK);
          }}
        />
      )}

      {step === STEPS.FEEDBACK && participant && (
        <FeedbackStep
          ws={ws}
          participant={participant}
          onSubmit={() => setStep(STEPS.CERTIFICATE)}
        />
      )}

      {step === STEPS.CERTIFICATE && participant && (
        <CertificateStep ws={ws} participant={participant} />
      )}
    </div>
  );
}

/* ─── Step 1: Email Verification ─────────────────────────────────── */
function EmailVerifyStep({ ws, onVerified }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workshopId: ws.id, email: email.trim() }),
      });

      if (res.status === 404) {
        setError('Email not found in our records. Please check and try again.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error();

      // Server returns only {id, name} — no personal data ever sent to browser
      const { id, name } = await res.json();
      onVerified({ name, email: email.trim(), id });
    } catch {
      setError('Something went wrong. Please try again later.');
    }

    setLoading(false);
  }

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-base sm:text-xl font-bold text-slcr-blue mb-1">Verify Your Registration</h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-4">
        Enter the email you used when registering for{' '}
        <span className="font-medium text-gray-700">{ws.shortTitle}</span>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label text-xs sm:text-sm">Registered Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field text-sm"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Verifying…' : 'Verify & Continue'}
        </button>
      </form>
    </div>
  );
}

/* ─── Step 2: Feedback Form ──────────────────────────────────────── */
function RadioQuestion({ qIndex, field, value, onChange }) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">
        <span className="text-slcr-blue mr-1">Q{qIndex}.</span>
        {field.label}
      </p>
      <div className="space-y-1.5">
        {field.options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-2 cursor-pointer rounded-lg px-2.5 py-2 transition-colors text-xs sm:text-sm ${
              value === opt
                ? 'bg-blue-50 border border-slcr-blue text-slcr-blue font-medium'
                : 'border border-transparent hover:bg-gray-50 text-gray-700'
            }`}
          >
            <input
              type="radio"
              name={field.key}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="accent-slcr-blue shrink-0"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

function FeedbackStep({ ws, participant, onSubmit }) {
  const initRadios = Object.fromEntries(RADIO_QUESTIONS.map((q) => [q.key, '']));
  const [radios, setRadios] = useState(initRadios);
  const [mostUseful, setMostUseful] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const missing = RADIO_QUESTIONS.find((q) => !radios[q.key]);
    if (missing) {
      setError(`Please answer: "${missing.label}"`);
      return;
    }
    setError('');
    setSubmitting(true);

    const payload = {
      workshop: ws.id,
      name: participant.name,
      email: participant.email,
      ...radios,
      mostUsefulAspect: mostUseful,
      suggestions,
      submittedAt: new Date().toISOString(),
    };

    if (ws.feedbackEndpoint) {
      try {
        await fetch(ws.feedbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // Non-blocking — certificate still generates
      }
    }

    setSubmitting(false);
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Pre-filled info */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
          <span className="text-xs sm:text-sm text-green-700 font-semibold">
            Verified: {participant.name}
          </span>
        </div>

        <h2 className="text-base sm:text-xl font-bold text-slcr-blue mb-1">Workshop Feedback</h2>
        <p className="text-xs text-gray-400 mb-4">
          {ws.title} · {ws.displayDate}
        </p>

        {/* Q1 and Q2 — pre-filled, read-only */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="label text-xs">Q1. Name</label>
            <input
              type="text"
              value={participant.name}
              readOnly
              className="input-field text-xs sm:text-sm bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="label text-xs">Q2. Email Address</label>
            <input
              type="email"
              value={participant.email}
              readOnly
              className="input-field text-xs sm:text-sm bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Q3–Q8: radio questions */}
        <div className="space-y-4">
          {RADIO_QUESTIONS.map((field, i) => (
            <RadioQuestion
              key={field.key}
              qIndex={i + 3}
              field={field}
              value={radios[field.key]}
              onChange={(v) => setRadios((prev) => ({ ...prev, [field.key]: v }))}
            />
          ))}
        </div>
      </div>

      {/* Q9 & Q10 — text answers */}
      <div className="card p-4 sm:p-5 space-y-4">
        <div>
          <label className="label text-xs sm:text-sm">
            Q9. What was the most useful aspect of the workshop?
          </label>
          <textarea
            value={mostUseful}
            onChange={(e) => setMostUseful(e.target.value)}
            rows={3}
            placeholder="Describe what you found most valuable…"
            className="input-field resize-none text-xs sm:text-sm"
          />
        </div>

        <div>
          <label className="label text-xs sm:text-sm">
            Q10. Suggestions for improving future workshops
          </label>
          <textarea
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            rows={3}
            placeholder="Your suggestions…"
            className="input-field resize-none text-xs sm:text-sm"
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
          {submitting ? 'Submitting…' : 'Submit & Generate Certificate'}
        </button>
      </div>
    </form>
  );
}

/* ─── Step 3: Certificate ────────────────────────────────────────── */
function CertificateStep({ ws, participant }) {
  return (
    <div>
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3 mb-4 no-print">
        <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs sm:text-sm font-bold text-green-800">
            Feedback submitted — thank you!
          </p>
          <p className="text-xs text-green-700 mt-0.5">Your certificate is ready below.</p>
        </div>
      </div>

      <CertificatePreview participant={participant} cert={ws.certificate} />
    </div>
  );
}
