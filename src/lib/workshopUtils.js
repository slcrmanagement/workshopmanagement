/**
 * Returns true if the current date is on or before the registration deadline.
 * Deadline is treated as inclusive (end of that calendar day).
 *
 * @param {string} deadlineStr  e.g. '2026-06-20'
 */
export function isRegistrationOpen(deadlineStr) {
  if (!deadlineStr) return false;
  const [year, month, day] = deadlineStr.split('-').map(Number);
  const endOfDeadline = new Date(year, month - 1, day, 23, 59, 59, 999);
  return Date.now() <= endOfDeadline.getTime();
}
