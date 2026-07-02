import { workshops } from '@/config/workshops';
import AdminClient from './AdminClient';

export const metadata = { title: 'Admin | SLCR Workshop Portal' };
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return <AdminClient workshops={workshops} />;
}
