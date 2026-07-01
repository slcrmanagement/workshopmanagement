import Link from 'next/link';
import { workshops } from '@/config/workshops';
import { Calendar, MapPin, ArrowRight, UserCheck, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-6 pt-2">
        <h2 className="text-xl sm:text-3xl font-bold text-slcr-blue mb-2">Workshop Portal</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto px-2">
          Feedback forms, certificates, and workshop information — all in one place.
        </p>
        <div className="w-16 h-0.5 bg-slcr-gold mx-auto mt-3 rounded-full" />
      </div>

      {/* Workshop cards */}
      <div className="space-y-4">
        {workshops.map((ws) => (
          <WorkshopCard key={ws.id} workshop={ws} />
        ))}
        {workshops.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-12">
            No workshops yet. Check back soon.
          </p>
        )}
      </div>
    </div>
  );
}

function WorkshopCard({ workshop: ws }) {
  return (
    <div className="card border border-gray-100">
      <div className="h-1.5 bg-slcr-blue" />

      <div className="p-3 sm:p-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {ws.registrationOpen ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              <UserCheck size={11} /> Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              <Lock size={11} /> Closed
            </span>
          )}
          {ws.feedbackOpen && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Feedback & Certificate
            </span>
          )}
        </div>

        <h3 className="text-sm sm:text-lg font-bold text-slcr-blue mb-2">{ws.title}</h3>

        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div className="flex items-start gap-1.5">
            <Calendar size={12} className="mt-0.5 shrink-0 text-slcr-gold" />
            <span>{ws.displayDate}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <MapPin size={12} className="mt-0.5 shrink-0 text-slcr-gold" />
            <span className="line-clamp-2">{ws.venue}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {ws.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-slcr-blue px-1.5 py-0.5 rounded border border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/${ws.id}/`}
          className="btn-primary inline-flex items-center gap-1.5"
        >
          View Details <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
