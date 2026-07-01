import Link from 'next/link';
import { workshops } from '@/config/workshops';
import { Calendar, MapPin, Tag, ArrowRight, UserCheck, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-12 pt-4">
        <h2 className="text-4xl font-bold text-slcr-blue mb-3">Workshop Portal</h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Register for upcoming workshops, submit feedback, and download your participation
          certificate — all in one place.
        </p>
        <div className="w-24 h-1 bg-slcr-gold mx-auto mt-4 rounded-full" />
      </div>

      {/* Workshop cards */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {workshops.map((ws) => (
          <WorkshopCard key={ws.id} workshop={ws} />
        ))}
      </div>

      {workshops.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No workshops available at the moment. Check back soon.</p>
        </div>
      )}
    </div>
  );
}

function WorkshopCard({ workshop: ws }) {
  return (
    <div className="card border border-gray-100">
      {/* Blue top stripe */}
      <div className="h-2 bg-slcr-blue" />

      <div className="p-6">
        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {ws.registrationOpen ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
              <UserCheck size={12} /> Registration Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-full">
              <Lock size={12} /> Registration Closed
            </span>
          )}
          {ws.feedbackOpen && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              Feedback &amp; Certificate Available
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slcr-blue mb-3">{ws.title}</h3>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-start gap-2">
            <Calendar size={15} className="mt-0.5 shrink-0 text-slcr-gold" />
            <span>{ws.displayDate}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 shrink-0 text-slcr-gold" />
            <span>{ws.venue}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-3 mb-5">{ws.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-5">
          {ws.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-slcr-blue px-2 py-0.5 rounded-full border border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/${ws.id}/`}
          className="inline-flex items-center gap-2 btn-primary text-sm"
        >
          View Workshop <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
