'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, CheckCircle2, Download, Loader2, AlertCircle } from 'lucide-react';
import CertificatePreview from '@/components/CertificatePreview';

const STEPS = { EMAIL: 'email', FEEDBACK: 'feedback', CERTIFICATE: 'certificate' };

export default function FeedbackClient({ workshop: ws }) {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [participant, setParticipant] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [certIndex, setCertIndex] = useState(1);

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/${ws.id}/`}
        className="inline-flex items-center gap-2 text-sm text-slcr-blue hover:underline mb-6"
      >
        <ArrowLeft size={15} /> Back to Workshop
      </Link>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8 no-print">
        {[
          { key: STEPS.EMAIL, label: '1. Verify Email' },
          { key: STEPS.FEEDBACK, label: '2. Feedback' },
          { key: STEPS.CERTIFICATE, label: '3. Certificate' },
        ].map((s, i) => {
          const done =
            (s.key === STEPS.EMAIL && step !== STEPS.EMAIL) ||
            (s.key === STEPS.FEEDBACK && step === STEPS.CERTIFICATE);
          const active = step === s.key;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                  done
                    ? 'bg-green-500 text-white'
                    : active
                    ? 'bg-slcr-blue text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  active ? 'text-slcr-blue' : done ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-2 w-8" />}
            </div>
          );
        })}
      </div>

      {step === STEPS.EMAIL && (
        <EmailVerifyStep
          ws={ws}
          onVerified={(p, idx) => {
            setParticipant(p);
            setCertIndex(idx + 1);
            setStep(STEPS.FEEDBACK);
          }}
        />
      )}

      {step === STEPS.FEEDBACK && participant && (
        <FeedbackStep
          ws={ws}
          participant={participant}
          onSubmit={(data) => {
            setFeedbackData(data);
            setStep(STEPS.CERTIFICATE);
          }}
        />
      )}

      {step === STEPS.CERTIFICATE && participant && (
        <CertificateStep
          ws={ws}
          participant={participant}
          certIndex={certIndex}
          feedbackData={feedbackData}
        />
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
      // Fetch the registration data (hosted under /data/ in the static site)
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
      const res = await fetch(`${basePath}/data/${ws.dataFile}`);
      if (!res.ok) throw new Error('Could not load registration data.');

      const registrations = await res.json();
      const normalised = email.trim().toLowerCase();
      const found = registrations.find((r) => r.email.trim().toLowerCase() === normalised);
      const idx = registrations.findIndex((r) => r.email.trim().toLowerCase() === normalised);

      if (!found) {
        setError(
          'This email address was not found in our registration records. Please check and try again.'
        );
        setLoading(false);
        return;
      }

      onVerified(found, idx);
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }

    setLoading(false);
  }

  return (
    <div className="card p-8">
      <h2 className="text-2xl font-bold text-slcr-blue mb-2">Verify Your Registration</h2>
      <p className="text-gray-500 text-sm mb-6">
        Enter the email address you used when registering for{' '}
        <span className="font-medium text-gray-700">{ws.title}</span>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Registered Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field"
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Verifying…' : 'Verify & Continue'}
        </button>
      </form>
    </div>
  );
}

/* ─── Step 2: Feedback Form ──────────────────────────────────────── */
const RATING_FIELDS = [
  { key: 'overallRating', label: 'Overall Workshop Experience' },
  { key: 'contentQuality', label: 'Content Quality & Relevance' },
  { key: 'speakerEffectiveness', label: 'Speaker / Presenter Effectiveness' },
  { key: 'venueLogistics', label: 'Venue & Logistics' },
];

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="focus:outline-none"
        >
          <Star
            size={28}
            className={`transition-colors ${
              n <= value ? 'text-slcr-gold fill-slcr-gold' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function FeedbackStep({ ws, participant, onSubmit }) {
  const [ratings, setRatings] = useState({ overallRating: 0, contentQuality: 0, speakerEffectiveness: 0, venueLogistics: 0 });
  const [valuable, setValuable] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [recommend, setRecommend] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const missing = RATING_FIELDS.find((f) => !ratings[f.key]);
    if (missing) {
      setError(`Please rate: ${missing.label}`);
      return;
    }
    setError('');
    setSubmitting(true);

    const payload = {
      workshop: ws.id,
      participantName: participant.name,
      participantEmail: participant.email,
      participantOrg: participant.organization,
      ...ratings,
      mostValuable: valuable,
      suggestions,
      wouldRecommend: recommend,
      additionalComments: comments,
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
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-50 rounded-full px-3 py-1 text-green-700 text-sm font-semibold flex items-center gap-1">
            <CheckCircle2 size={14} /> Verified: {participant.name}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slcr-blue mb-1">Workshop Feedback</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your feedback helps us improve future workshops. All fields marked * are required.
        </p>

        {/* Star ratings */}
        <div className="space-y-5">
          {RATING_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="label">{field.label} *</label>
              <StarRating
                value={ratings[field.key]}
                onChange={(v) => setRatings((prev) => ({ ...prev, [field.key]: v }))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card p-8 space-y-5">
        <div>
          <label className="label">Most valuable aspect of the workshop</label>
          <textarea
            value={valuable}
            onChange={(e) => setValuable(e.target.value)}
            rows={3}
            placeholder="What did you find most useful or impactful?"
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="label">Suggestions for improvement</label>
          <textarea
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            rows={3}
            placeholder="How can we make future workshops better?"
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="label">Would you recommend this workshop to a colleague?</label>
          <div className="flex gap-4 mt-1">
            {['Yes', 'No', 'Maybe'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="recommend"
                  value={opt}
                  checked={recommend === opt}
                  onChange={() => setRecommend(opt)}
                  className="accent-slcr-blue"
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Any other comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder="Anything else you'd like to share…"
            className="input-field resize-none"
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full flex justify-center items-center gap-2"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {submitting ? 'Submitting…' : 'Submit Feedback & Generate Certificate'}
        </button>
      </div>
    </form>
  );
}

/* ─── Step 3: Certificate ────────────────────────────────────────── */
function CertificateStep({ ws, participant, certIndex, feedbackData }) {
  const serialNumber = `${ws.certificate.serialPrefix}-${String(certIndex).padStart(3, '0')}`;

  return (
    <div>
      <div className="card p-6 mb-6 no-print bg-green-50 border border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={28} className="text-green-600 shrink-0" />
          <div>
            <p className="font-bold text-green-800">Feedback submitted — thank you!</p>
            <p className="text-sm text-green-700 mt-0.5">
              Your certificate is ready. Download it below.
            </p>
          </div>
        </div>
      </div>

      <CertificatePreview
        participant={participant}
        cert={ws.certificate}
        certNumber={serialNumber}
      />
    </div>
  );
}
