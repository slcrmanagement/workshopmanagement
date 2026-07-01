import { workshops, getWorkshop } from '@/config/workshops';
import { notFound } from 'next/navigation';
import FeedbackClient from './FeedbackClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  return workshops.map((ws) => ({ workshopId: ws.id }));
}

export async function generateMetadata({ params }) {
  const ws = getWorkshop(params.workshopId);
  if (!ws) return {};
  return { title: `Feedback & Certificate – ${ws.shortTitle} | SLCR` };
}

export default function FeedbackPage({ params }) {
  const ws = getWorkshop(params.workshopId);
  if (!ws) notFound();

  return <FeedbackClient workshop={ws} />;
}
