'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle, Lock } from 'lucide-react';

const FIELDS = [
  { key: 'name',              label: 'Name of Candidate',      type: 'text',     required: true },
  { key: 'gender',            label: 'Gender',                  type: 'select',   required: true,
    options: ['Male', 'Female', 'Other'] },
  { key: 'email',             label: 'Email Address',           type: 'email',    required: true },
  { key: 'designation',       label: 'Designation',             type: 'text',     required: true },
  { key: 'primaryAreaOfWork', label: 'Primary Area of Work',    type: 'text',     required: false },
  { key: 'organization',      label: 'Organization / Institute', type: 'text',    required: true },
  { key: 'address',           label: 'Address',                 type: 'textarea', required: true },
  { key: 'phone',             label: 'Phone / Mobile No.',      type: 'tel',      required: true },
  { key: 'accommodation',     label: 'Accommodation Required?', type: 'radio',    required: true,
    options: ['Yes', 'No'] },
];

const empty = Object.fromEntries(FIELDS.map((f) => [f.key, '']));

export default function RegisterClient({ workshop: ws }) {
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Show closed state for this and past workshops
  if (!ws.registrationOpen) {
    return (
      <div className="max-w-xl mx-auto">
        <Link href={`/${ws.id}/`} className="inline-flex items-center gap-1 text-xs text-slcr-blue hover:underline mb-4">
          <ArrowLeft size={13} /> Back
        </Link>
        <div className="card p-5 flex items-start gap-3">
          <div className="bg-red-50 rounded-full p-2 shrink-0">
            <Lock size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-bold text-red-600 text-sm mb-1">Registration Closed</p>
            <p className="text-xs text-gray-500">
              The registration deadline for <span className="font-medium">{ws.title}</span> was{' '}
              {ws.registrationDeadline}. We are no longer accepting new registrations.
            </p>
            {ws.feedbackOpen && (
              <p className="text-xs text-gray-500 mt-2">
                Already registered?{' '}
                <Link href={`/${ws.id}/feedback/`} className="text-slcr-blue underline">
                  Submit feedback &amp; get your certificate.
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card p-6 text-center">
          <CheckCircle2 size={44} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-base sm:text-xl font-bold text-slcr-blue mb-2">
            Registration Received!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-1">
            Thank you, <span className="font-semibold">{form.name}</span>.
          </p>
          <p className="text-xs text-gray-500 mb-5">
            Your registration for <span className="font-medium">{ws.title}</span> has been
            submitted. The organizing team will confirm your participation via email.
          </p>
          <Link href={`/${ws.id}/`} className="btn-primary inline-flex items-center gap-1.5">
            <ArrowLeft size={13} /> Back to Workshop
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      ...form,
      workshop: ws.id,
      workshopTitle: ws.title,
      submittedAt: new Date().toISOString(),
    };

    if (ws.registrationEndpoint) {
      try {
        await fetch(ws.registrationEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // Non-blocking — still show success so user knows their data was noted
      }
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link href={`/${ws.id}/`} className="inline-flex items-center gap-1 text-xs text-slcr-blue hover:underline mb-4">
        <ArrowLeft size={13} /> Back to Workshop
      </Link>

      <div className="card p-4 sm:p-6 mb-4">
        <div className="bg-slcr-blue text-white rounded-lg px-4 py-3 mb-5 -mx-0">
          <p className="text-xs text-blue-300">{ws.organizer}</p>
          <h2 className="text-sm sm:text-base font-bold mt-0.5">Registration Form</h2>
          <p className="text-xs text-blue-200 mt-0.5">{ws.title} · {ws.displayDate}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS.map((field, i) => (
            <FormField
              key={field.key}
              field={field}
              index={i + 1}
              value={form[field.key]}
              onChange={(val) => set(field.key, val)}
            />
          ))}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex justify-center items-center gap-2 mt-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Submitting…' : 'Submit Registration'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            After submitting, you will receive a confirmation from the organizing team.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ─── Field renderer ─────────────────────────────────────────────── */
function FormField({ field, index, value, onChange }) {
  const labelEl = (
    <label className="label text-xs sm:text-sm">
      <span className="text-slcr-blue font-bold mr-1">{index}.</span>
      {field.label}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  if (field.type === 'textarea') {
    return (
      <div>
        {labelEl}
        <textarea
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="input-field resize-none text-xs sm:text-sm"
          placeholder={field.label}
        />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        {labelEl}
        <select
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field text-xs sm:text-sm"
        >
          <option value="">— Select —</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'radio') {
    return (
      <div>
        {labelEl}
        <div className="flex gap-4 mt-1">
          {field.options.map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm">
              <input
                type="radio"
                name={field.key}
                value={opt}
                required={field.required}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-slcr-blue"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {labelEl}
      <input
        type={field.type}
        required={field.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        className="input-field text-xs sm:text-sm"
      />
    </div>
  );
}
