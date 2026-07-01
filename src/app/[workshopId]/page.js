import Link from 'next/link';
import { notFound } from 'next/navigation';
import { workshops, getWorkshop } from '@/config/workshops';
import { Calendar, MapPin, Building2, Lock, ClipboardList, Award, ArrowLeft } from 'lucide-react';

export const dynamicParams = false;

export async function generateStaticParams() {
  return workshops.map((ws) => ({ workshopId: ws.id }));
}

export async function generateMetadata({ params }) {
  const ws = getWorkshop(params.workshopId);
  if (!ws) return {};
  return { title: `${ws.shortTitle} | SLCR IIT BHU` };
}

export default function WorkshopPage({ params }) {
  const ws = getWorkshop(params.workshopId);
  if (!ws) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-slcr-blue hover:underline mb-4"
      >
        <ArrowLeft size={13} /> All Workshops
      </Link>

      {/* Header card */}
      <div className="card mb-4">
        <div className="bg-slcr-blue px-4 py-5 text-white">
          <p className="text-xs text-blue-300 mb-1">{ws.organizer}</p>
          <h2 className="text-lg sm:text-2xl font-bold mb-3 leading-snug">{ws.title}</h2>

          <div className="space-y-1.5 text-xs text-blue-200">
            <div className="flex items-start gap-1.5">
              <Calendar size={12} className="mt-0.5 text-slcr-gold shrink-0" />
              <span>{ws.displayDate}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 text-slcr-gold shrink-0" />
              <span>{ws.venue}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Building2 size={12} className="mt-0.5 text-slcr-gold shrink-0" />
              <span>{ws.organizer}</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-gray-100 flex flex-wrap gap-1">
          {ws.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-slcr-blue px-2 py-0.5 rounded border border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="card p-4 sm:p-5 mb-4">
        <h3 className="section-title">About This Workshop</h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{ws.description}</p>
      </div>

      {/* Registration */}
      <div className="card p-4 sm:p-5 mb-4">
        <h3 className="section-title">Registration</h3>
        {ws.registrationOpen ? (
          <div>
            <p className="text-xs text-green-700 font-semibold mb-1">Registration is open!</p>
            <p className="text-xs text-gray-500 mb-3">
              Deadline: <span className="font-medium text-gray-700">{ws.registrationDeadline}</span>
            </p>
            <Link href={`/${ws.id}/register/`} className="btn-primary inline-flex items-center gap-1.5">
              Register Now
            </Link>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="bg-red-50 rounded-full p-2 shrink-0">
              <Lock size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-600 mb-0.5">Registration Closed</p>
              <p className="text-xs text-gray-500">
                The deadline was{' '}
                <span className="font-medium text-gray-700">{ws.registrationDeadline}</span>.
              </p>
              {ws.feedbackOpen && (
                <p className="text-xs text-gray-500 mt-1">
                  Already registered?{' '}
                  <Link href={`/${ws.id}/feedback/`} className="text-slcr-blue underline font-medium">
                    Submit feedback &amp; get your certificate
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback & Certificate */}
      {ws.feedbackOpen && (
        <div className="card p-4 sm:p-5 border-l-4 border-slcr-gold">
          <div className="flex items-start gap-3">
            <Award size={24} className="text-slcr-gold shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slcr-blue mb-1">
                Feedback &amp; Certificate
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Registered participants can submit feedback and download their Certificate of Participation.
              </p>
              <Link
                href={`/${ws.id}/feedback/`}
                className="btn-gold inline-flex items-center gap-1.5"
              >
                <ClipboardList size={13} /> Submit Feedback &amp; Get Certificate
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
