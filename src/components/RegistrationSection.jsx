'use client';

import Link from 'next/link';
import { Lock, UserCheck } from 'lucide-react';
import { isRegistrationOpen } from '@/lib/workshopUtils';

/**
 * Client component — computes registration open/closed from the CURRENT
 * date at runtime, not at build time.
 */
export default function RegistrationSection({ workshop: ws }) {
  const open = isRegistrationOpen(ws.registrationDeadline);

  if (open) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-green-50 rounded-full p-1.5 shrink-0">
            <UserCheck size={16} className="text-green-600" />
          </div>
          <p className="text-sm font-semibold text-green-700">Registration is Open!</p>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Deadline:{' '}
          <span className="font-medium text-gray-700">{ws.registrationDeadline}</span>
        </p>
        <Link
          href={`/${ws.id}/register/`}
          className="btn-primary inline-flex items-center gap-1.5"
        >
          Register Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="bg-red-50 rounded-full p-2 shrink-0">
        <Lock size={16} className="text-red-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-600 mb-0.5">Registration Closed</p>
        <p className="text-xs text-gray-500">
          The registration deadline was{' '}
          <span className="font-medium text-gray-700">{ws.registrationDeadline}</span>.
        </p>
        {ws.feedbackOpen && (
          <p className="text-xs text-gray-500 mt-1">
            Already registered?{' '}
            <Link
              href={`/${ws.id}/feedback/`}
              className="text-slcr-blue underline font-medium"
            >
              Submit feedback &amp; get your certificate
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
