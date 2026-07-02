import { getWorkshop } from '@/config/workshops';
import { notFound } from 'next/navigation';
import FeedbackClient from './FeedbackClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const ws = await getWorkshop(params.workshopId);
  if (!ws) return {};
  return { title: `Feedback & Certificate – ${ws.shortTitle} | SLCR` };
}

export default async function FeedbackPage({ params }) {
  const ws = await getWorkshop(params.workshopId);
  if (!ws) notFound();

  return <FeedbackClient workshop={ws} />;
}
