import { getWorkshop } from '@/config/workshops';
import { notFound } from 'next/navigation';
import RegisterClient from './RegisterClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const ws = await getWorkshop(params.workshopId);
  if (!ws) return {};
  return { title: `Register – ${ws.shortTitle} | SLCR` };
}

export default async function RegisterPage({ params }) {
  const ws = await getWorkshop(params.workshopId);
  if (!ws) notFound();
  return <RegisterClient workshop={ws} />;
}
