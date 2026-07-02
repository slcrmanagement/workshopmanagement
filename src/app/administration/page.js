import { getWorkshops } from '@/config/workshops';
import AdminClient from './AdminClient';

export const metadata = { title: 'Admin | SLCR Workshop Portal' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const workshops = await getWorkshops();
  return <AdminClient workshops={workshops} />;
}
