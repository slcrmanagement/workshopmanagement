'use client';

import { useEffect, useState } from 'react';
import { Users, MessageSquareText, Loader2, AlertCircle, Download, ArrowLeft, Calendar } from 'lucide-react';
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
  const [workshopId, setWorkshopId] = useState(null);
  const [tab, setTab] = useState(TABS.REGISTRATIONS);
  const [registrations, setRegistrations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <h2 className="section-title">Admin — Select a Workshop</h2>
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
