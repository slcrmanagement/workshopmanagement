import { workshops, getWorkshop } from '@/config/workshops';
import { notFound } from 'next/navigation';
import RegisterClient from './RegisterClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  return workshops.map((ws) => ({ workshopId: ws.id }));
}

export async function generateMetadata({ params }) {
  const ws = getWorkshop(params.workshopId);
  if (!ws) return {};
  return { title: `Register – ${ws.shortTitle} | SLCR` };
}

export default function RegisterPage({ params }) {
  const ws = getWorkshop(params.workshopId);
  if (!ws) notFound();
  return <RegisterClient workshop={ws} />;
}
