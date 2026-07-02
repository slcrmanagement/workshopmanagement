import { getWorkshops } from '@/config/workshops';
import WorkshopCard from '@/components/WorkshopCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const workshops = await getWorkshops();
  return (
    <div>
      <div className="text-center mb-6 pt-2">
        <h2 className="text-xl sm:text-3xl font-bold text-slcr-blue mb-2">Workshop Portal</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto px-2">
          Feedback forms, certificates, and workshop information — all in one place.
        </p>
        <div className="w-16 h-0.5 bg-slcr-gold mx-auto mt-3 rounded-full" />
      </div>

      <div className="space-y-4">
        {workshops.map((ws) => (
          <WorkshopCard key={ws.id} workshop={ws} />
        ))}
        {workshops.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-12">
            No workshops yet. Check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
