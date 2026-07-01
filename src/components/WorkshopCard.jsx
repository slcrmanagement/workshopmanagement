'use client';

import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, UserCheck, Lock } from 'lucide-react';
import { isRegistrationOpen } from '@/lib/workshopUtils';

export default function WorkshopCard({ workshop: ws }) {
  const regOpen = isRegistrationOpen(ws.registrationDeadline);

  return (
    <div className="card border border-gray-100">
      <div className="h-1.5 bg-slcr-blue" />

      <div className="p-3 sm:p-5">
        {/* Status badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {regOpen ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              <UserCheck size={11} /> Registration Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              <Lock size={11} /> Registration Closed
            </span>
          )}
          {ws.feedbackOpen && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Feedback &amp; Certificate
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

        <Link href={`/${ws.id}/`} className="btn-primary inline-flex items-center gap-1.5">
          View Details <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
