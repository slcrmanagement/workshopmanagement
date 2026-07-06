'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  MessageSquareText,
  Loader2,
  AlertCircle,
  Download,
  ArrowLeft,
  Calendar,
  Plus,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { DEFAULT_REGISTRATION_FIELDS, DEFAULT_FEEDBACK_QUESTIONS } from '@/config/formDefaults';

const TABS = {
  REGISTRATIONS: 'registrations',
  FEEDBACK: 'feedback',
};

// Columns/rows are derived from the workshop's own field config, so each
// workshop's admin tables match whatever form it actually used.
// Attendee/Registered At are system fields (set by admin/server, not part of the form).
function registrationColumns(ws) {
  const fields = ws.registrationFields ?? DEFAULT_REGISTRATION_FIELDS;
  return ['#', ...fields.map((f) => f.label), 'Attendee', 'Registered At'];
}

function registrationWrapCols(ws) {
  const fields = ws.registrationFields ?? DEFAULT_REGISTRATION_FIELDS;
  return fields.flatMap((f, i) => (f.type === 'textarea' ? [i + 1] : []));
}

function registrationRow(ws) {
  const fields = ws.registrationFields ?? DEFAULT_REGISTRATION_FIELDS;
  return (r) => [
    r.id,
    ...fields.map((f) => r[f.key]),
    r.attendee ? 'Yes' : 'No',
    r.registeredAt ? new Date(r.registeredAt).toLocaleString() : '',
  ];
}

const FEEDBACK_SYSTEM_COLUMNS = ['Reg. ID', 'Name', 'Feedback Done', 'Certificate Downloaded', 'Submitted At'];

function feedbackColumns(ws) {
  const questions = ws.feedbackQuestions ?? DEFAULT_FEEDBACK_QUESTIONS;
  return [...FEEDBACK_SYSTEM_COLUMNS, ...questions.map((q) => q.label)];
}

function feedbackWrapCols(ws) {
  const questions = ws.feedbackQuestions ?? DEFAULT_FEEDBACK_QUESTIONS;
  return questions.flatMap((q, i) => (q.type === 'textarea' ? [i + FEEDBACK_SYSTEM_COLUMNS.length] : []));
}

function feedbackRow(ws) {
  const questions = ws.feedbackQuestions ?? DEFAULT_FEEDBACK_QUESTIONS;
  return (f) => [
    f.registrationId,
    f.name,
    f.feedbackDone ? 'Yes' : 'No',
    f.certificateDownloaded ? 'Yes' : 'No',
    f.submittedAt ? new Date(f.submittedAt).toLocaleString() : '',
    ...questions.map((q) => f.responses?.[q.key]),
  ];
}

function csvCell(value) {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(filename, columns, rows, rowFn) {
  const lines = [columns, ...rows.map(rowFn)].map((line) => line.map(csvCell).join(','));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminClient({ workshops }) {
  const router = useRouter();
  const [workshopId, setWorkshopId] = useState(null);
  const [tab, setTab] = useState(TABS.REGISTRATIONS);
  const [registrations, setRegistrations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!workshopId) return;
    setLoading(true);
    setError('');

    fetch(`/api/admin?workshopId=${encodeURIComponent(workshopId)}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setRegistrations(data.registrations ?? []);
        setFeedback(data.feedback ?? []);
      })
      .catch(() => setError('Could not load data.'))
      .finally(() => setLoading(false));
  }, [workshopId]);

  if (!workshopId) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="section-title mb-0">Admin — Select a Workshop</h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} /> Add Workshop
            </button>
          )}
        </div>

        {showAddForm && (
          <AddWorkshopForm
            onCancel={() => setShowAddForm(false)}
            onCreated={() => {
              setShowAddForm(false);
              router.refresh();
            }}
          />
        )}

        <WorkshopPicker
          workshops={workshops}
          onSelect={(id) => {
            setTab(TABS.REGISTRATIONS);
            setWorkshopId(id);
          }}
        />
      </div>
    );
  }

  const ws = workshops.find((w) => w.id === workshopId);

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => setWorkshopId(null)}
        className="inline-flex items-center gap-1 text-xs text-slcr-blue hover:underline mb-4"
      >
        <ArrowLeft size={13} /> All Workshops
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="section-title mb-0">{ws?.shortTitle ?? workshopId}</h2>
        <FeedbackToggle ws={ws} onToggled={() => router.refresh()} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-gray-200">
        <div className="flex gap-1">
          <TabButton
            active={tab === TABS.REGISTRATIONS}
            onClick={() => setTab(TABS.REGISTRATIONS)}
            icon={<Users size={14} />}
            label="Registration Data"
            count={registrations.length}
          />
          <TabButton
            active={tab === TABS.FEEDBACK}
            onClick={() => setTab(TABS.FEEDBACK)}
            icon={<MessageSquareText size={14} />}
            label="Feedback Data"
            count={feedback.length}
          />
        </div>

        {!loading && !error && (
          <button
            onClick={() =>
              tab === TABS.REGISTRATIONS
                ? downloadCsv(`registrations-${workshopId}.csv`, registrationColumns(ws), registrations, registrationRow(ws))
                : downloadCsv(`feedback-${workshopId}.csv`, feedbackColumns(ws), feedback, feedbackRow(ws))
            }
            disabled={(tab === TABS.REGISTRATIONS ? registrations : feedback).length === 0}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slcr-blue hover:underline mb-2 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
          >
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && tab === TABS.REGISTRATIONS && (
        <RegistrationsTable ws={ws} rows={registrations} />
      )}

      {!loading && !error && tab === TABS.FEEDBACK && (
        <FeedbackTable ws={ws} rows={feedback} />
      )}
    </div>
  );
}

function WorkshopPicker({ workshops, onSelect }) {
  if (workshops.length === 0) {
    return (
      <div className="card p-6 text-center text-xs sm:text-sm text-gray-500">
        No workshops configured yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {workshops.map((ws) => (
        <button
          key={ws.id}
          onClick={() => onSelect(ws.id)}
          className="card p-4 text-left hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Calendar size={12} />
            {ws.displayDate}
          </div>
          <h3 className="font-bold text-slcr-blue text-sm sm:text-base">{ws.shortTitle}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ws.venue}</p>
        </button>
      ))}
    </div>
  );
}

function FieldEditor({ label, fields, setFields, defaults }) {
  const addRow = () =>
    setFields([...fields, { key: '', label: '', type: 'text', required: false, options: '' }]);
  const removeRow = (i) => setFields(fields.filter((_, idx) => idx !== i));
  const updateRow = (i, patch) =>
    setFields(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const resetToDefaults = () =>
    setFields(defaults.map((f) => ({ ...f, options: (f.options || []).join(', ') })));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="label mb-0">{label}</span>
        <button type="button" onClick={resetToDefaults} className="text-xs text-slcr-blue hover:underline">
          Use defaults
        </button>
      </div>
      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={i} className="flex flex-wrap gap-1.5 items-center bg-gray-50 rounded-lg p-2">
            <input
              className="input flex-1 min-w-[90px] text-xs py-1.5"
              placeholder="key (e.g. name)"
              value={f.key}
              onChange={(e) => updateRow(i, { key: e.target.value })}
            />
            <input
              className="input flex-[2] min-w-[160px] text-xs py-1.5"
              placeholder="Label / Question"
              value={f.label}
              onChange={(e) => updateRow(i, { label: e.target.value })}
            />
            <select
              className="input w-24 text-xs py-1.5"
              value={f.type}
              onChange={(e) => updateRow(i, { type: e.target.value })}
            >
              <option value="text">text</option>
              <option value="email">email</option>
              <option value="tel">tel</option>
              <option value="textarea">textarea</option>
              <option value="select">select</option>
              <option value="radio">radio</option>
            </select>
            <input
              className="input flex-1 min-w-[160px] text-xs py-1.5 disabled:opacity-40"
              placeholder="options, comma separated"
              value={f.options}
              onChange={(e) => updateRow(i, { options: e.target.value })}
              disabled={!['select', 'radio'].includes(f.type)}
            />
            <label className="flex items-center gap-1 text-[10px] text-gray-600 shrink-0">
              <input
                type="checkbox"
                checked={f.required}
                onChange={(e) => updateRow(i, { required: e.target.checked })}
              />
              required
            </label>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="shrink-0 text-red-400 hover:text-red-600 p-1"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-xs text-slcr-blue hover:underline flex items-center gap-1"
      >
        <Plus size={12} /> Add question
      </button>
    </div>
  );
}

function AddWorkshopForm({ onCancel, onCreated }) {
  const [values, setValues] = useState({
    id: '',
    title: '',
    shortTitle: '',
    date: '',
    displayDate: '',
    registrationDeadline: '',
    venue: '',
    organizer: '',
    organizerFull: '',
    description: '',
    tags: '',
    feedbackOpen: false,
    registrationEndpoint: '',
    feedbackEndpoint: '',
    certificateTemplatePdf: '',
  });
  const [registrationFields, setRegistrationFields] = useState(
    DEFAULT_REGISTRATION_FIELDS.map((f) => ({ ...f, options: (f.options || []).join(', ') }))
  );
  const [feedbackQuestions, setFeedbackQuestions] = useState(
    DEFAULT_FEEDBACK_QUESTIONS.map((f) => ({ ...f, options: (f.options || []).join(', ') }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const toPayloadFields = (fields) =>
    fields
      .filter((f) => f.key && f.label)
      .map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: !!f.required,
        options: ['select', 'radio'].includes(f.type)
          ? f.options.split(',').map((o) => o.trim()).filter(Boolean)
          : undefined,
      }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
        registrationFields: toPayloadFields(registrationFields),
        feedbackQuestions: toPayloadFields(feedbackQuestions),
      };
      const res = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create workshop');
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const certPlaceholder = `/certificate/${values.id || '<id>'}.pdf`;

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-5 mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">New Workshop</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-xs">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Workshop ID (slug)</label>
          <input
            className="input"
            placeholder="e.g. scalgo-live-2027"
            value={values.id}
            onChange={set('id')}
            required
          />
        </div>
        <div>
          <label className="label">Short Title</label>
          <input className="input" value={values.shortTitle} onChange={set('shortTitle')} required />
        </div>
      </div>

      <div>
        <label className="label">Title</label>
        <input className="input" value={values.title} onChange={set('title')} required />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={values.date} onChange={set('date')} required />
        </div>
        <div>
          <label className="label">Display Date</label>
          <input
            className="input"
            placeholder="e.g. 25 June 2026"
            value={values.displayDate}
            onChange={set('displayDate')}
          />
        </div>
        <div>
          <label className="label">Registration Deadline</label>
          <input
            type="date"
            className="input"
            value={values.registrationDeadline}
            onChange={set('registrationDeadline')}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Venue</label>
        <input className="input" value={values.venue} onChange={set('venue')} required />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Organizer (short)</label>
          <input className="input" value={values.organizer} onChange={set('organizer')} />
        </div>
        <div>
          <label className="label">Organizer (full)</label>
          <input className="input" value={values.organizerFull} onChange={set('organizerFull')} />
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={3} value={values.description} onChange={set('description')} />
      </div>

      <div>
        <label className="label">Tags (comma separated)</label>
        <input className="input" value={values.tags} onChange={set('tags')} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Registration Endpoint (optional)</label>
          <input className="input" value={values.registrationEndpoint} onChange={set('registrationEndpoint')} />
        </div>
        <div>
          <label className="label">Feedback Endpoint (optional)</label>
          <input className="input" value={values.feedbackEndpoint} onChange={set('feedbackEndpoint')} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
        <input
          type="checkbox"
          checked={values.feedbackOpen}
          onChange={(e) => setValues((v) => ({ ...v, feedbackOpen: e.target.checked }))}
        />
        Feedback &amp; certificate open (enable once the workshop has taken place)
      </label>

      <div>
        <label className="label">Certificate PDF path</label>
        <input
          className="input"
          placeholder={certPlaceholder}
          value={values.certificateTemplatePdf}
          onChange={set('certificateTemplatePdf')}
        />
        <p className="text-[11px] text-gray-400 mt-1">
          Certificates are added manually — place the PDF at{' '}
          <code>public{values.certificateTemplatePdf || certPlaceholder}</code> yourself; this field
          just records the path.
        </p>
      </div>

      <FieldEditor
        label="Registration Questions"
        fields={registrationFields}
        setFields={setRegistrationFields}
        defaults={DEFAULT_REGISTRATION_FIELDS}
      />

      <FieldEditor
        label="Feedback Questions"
        fields={feedbackQuestions}
        setFields={setFeedbackQuestions}
        defaults={DEFAULT_FEEDBACK_QUESTIONS}
      />

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm rounded-lg font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-1.5">
          {submitting && <Loader2 size={14} className="animate-spin" />} Create Workshop
        </button>
      </div>
    </form>
  );
}

function FeedbackToggle({ ws, onToggled }) {
  const [updating, setUpdating] = useState(false);

  if (!ws) return null;
  const active = !!ws.feedbackOpen;

  const handleToggle = async () => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/workshops', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ws.id, feedbackOpen: !active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update feedback status');
      }
      onToggled();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={updating}
      className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
        active
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
      }`}
    >
      {updating ? (
        <Loader2 size={15} className="animate-spin" />
      ) : active ? (
        <ToggleRight size={15} />
      ) : (
        <ToggleLeft size={15} />
      )}
      {active ? 'Feedback Active — Deactivate' : 'Activate Feedback'}
    </button>
  );
}

function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors ${
        active
          ? 'border-slcr-blue text-slcr-blue'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
      <span
        className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
          active ? 'bg-slcr-blue text-white' : 'bg-gray-200 text-gray-600'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function Table({ columns, rows, getRow, wrapCols = [], emptyLabel }) {
  if (rows.length === 0) {
    return (
      <div className="card p-6 text-center text-xs sm:text-sm text-gray-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto overflow-y-auto max-h-[70vh]">
      <table className="min-w-full text-xs sm:text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slcr-blue text-white">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              {getRow(row, i).map((cell, j) =>
                wrapCols.includes(j) ? (
                  <td key={j} className="px-3 py-2 text-gray-700 min-w-[200px] max-w-xs align-top">
                    <div className="max-h-24 overflow-y-auto whitespace-pre-wrap pr-1">{cell}</div>
                  </td>
                ) : (
                  <td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    {cell}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegistrationsTable({ ws, rows }) {
  return (
    <Table
      columns={registrationColumns(ws)}
      rows={rows}
      wrapCols={registrationWrapCols(ws)}
      emptyLabel="No registrations yet."
      getRow={registrationRow(ws)}
    />
  );
}

function FeedbackTable({ ws, rows }) {
  return (
    <Table
      columns={feedbackColumns(ws)}
      rows={rows}
      wrapCols={feedbackWrapCols(ws)}
      emptyLabel="No feedback submitted yet."
      getRow={feedbackRow(ws)}
    />
  );
}
