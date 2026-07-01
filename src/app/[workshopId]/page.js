import Link from 'next/link';
import { notFound } from 'next/navigation';
import { workshops, getWorkshop } from '@/config/workshops';
import {
  Calendar,
  MapPin,
  Building2,
  Tag,
  Lock,
  ClipboardList,
  Award,
  ArrowLeft,
} from 'lucide-react';

export async function generateStaticParams() {
  return workshops.map((ws) => ({ workshopId: ws.id }));
}

export async function generateMetadata({ params }) {
  const ws = getWorkshop(params.workshopId);
  if (!ws) return {};
  return { title: `${ws.title} | SLCR IIT BHU` };
}

export default function WorkshopPage({ params }) {
  const ws = getWorkshop(params.workshopId);
  if (!ws) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slcr-blue hover:underline mb-6"
      >
        <ArrowLeft size={15} /> All Workshops
      </Link>

      {/* Header card */}
      <div className="card mb-6 overflow-hidden">
        <div className="bg-slcr-blue px-8 py-8 text-white">
          <p className="text-blue-200 text-sm font-medium mb-1">{ws.organizerFull}</p>
          <h2 className="text-3xl font-bold mb-4">{ws.title}</h2>

          <div className="grid sm:grid-cols-2 gap-3 text-sm text-blue-100">
            <div className="flex items-start gap-2">
              <Calendar size={15} className="mt-0.5 text-slcr-gold shrink-0" />
              <span>{ws.displayDate}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 text-slcr-gold shrink-0" />
              <span>{ws.venue}</span>
            </div>
            <div className="flex items-start gap-2">
              <Building2 size={15} className="mt-0.5 text-slcr-gold shrink-0" />
              <span>{ws.organizer}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="px-8 py-4 border-t border-gray-100 flex flex-wrap gap-2">
          {ws.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-slcr-blue px-3 py-1 rounded-full border border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="card p-8 mb-6">
        <h3 className="section-title">About This Workshop</h3>
        <p className="text-gray-600 leading-relaxed">{ws.description}</p>
      </div>

      {/* Registration status */}
      <div className="card p-8 mb-6">
        <h3 className="section-title">Registration</h3>
        {ws.registrationOpen ? (
          <RegistrationOpenPanel ws={ws} />
        ) : (
          <RegistrationClosedPanel ws={ws} />
        )}
      </div>

      {/* Feedback & Certificate */}
      {ws.feedbackOpen && (
        <div className="card p-8 mb-6 border-l-4 border-slcr-gold">
          <div className="flex items-start gap-4">
            <Award size={36} className="text-slcr-gold shrink-0 mt-1" />
            <div>
              <h3 className="section-title mb-1">Feedback &amp; Certificate</h3>
              <p className="text-gray-500 text-sm mb-4">
                Registered participants can submit their feedback and download their Certificate of
                Participation.
              </p>
              <Link href={`/${ws.id}/feedback/`} className="btn-gold inline-flex items-center gap-2 text-sm">
                <ClipboardList size={15} /> Submit Feedback &amp; Get Certificate
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegistrationClosedPanel({ ws }) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-red-50 rounded-full p-3 shrink-0">
        <Lock size={24} className="text-red-500" />
      </div>
      <div>
        <p className="font-semibold text-red-600 text-lg mb-1">Registration Closed</p>
        <p className="text-gray-500 text-sm">
          The registration deadline for this workshop was{' '}
          <span className="font-medium text-gray-700">{ws.registrationDeadline}</span>. We are no
          longer accepting new registrations.
        </p>
        {ws.feedbackOpen && (
          <p className="text-sm text-gray-500 mt-2">
            If you are already registered, you can still{' '}
            <Link href={`/${ws.id}/feedback/`} className="text-slcr-blue underline font-medium">
              submit feedback and get your certificate
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}

function RegistrationOpenPanel({ ws }) {
  return (
    <div>
      <p className="text-green-700 font-semibold mb-2">Registration is open!</p>
      <p className="text-gray-500 text-sm mb-4">
        Deadline: <span className="font-medium text-gray-700">{ws.registrationDeadline}</span>
      </p>
      <Link href={`/${ws.id}/register/`} className="btn-primary inline-flex items-center gap-2 text-sm">
        Register Now
      </Link>
    </div>
  );
}
