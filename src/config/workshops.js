import { readWorkshopsFile } from '@/lib/sourceStorage';

/**
 * Central workshop registry — backed by source/workshops.json.
 *
 * Workshops are managed from the admin panel (Add Workshop / Delete Workshop),
 * which reads and writes that file the same way registrations/feedback do
 * (local filesystem in dev, GitHub Contents API in production).
 *
 * registrationFields / feedbackQuestions are optional per workshop — omit
 * them to fall back to the shared defaults in formDefaults.js.
 */

export async function getWorkshops() {
  const { data } = await readWorkshopsFile();
  return data ?? [];
}

export async function getWorkshop(id) {
  const workshops = await getWorkshops();
  return workshops.find((w) => w.id === id) ?? null;
}
