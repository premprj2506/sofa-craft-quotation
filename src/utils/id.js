let lastId = 0;

/**
 * Generates a collision-free, monotonically increasing string ID
 * compatible with numeric descending sorting (`Number(b.id) - Number(a.id)`).
 */
export function generateId() {
  const now = Date.now();
  lastId = now > lastId ? now : lastId + 1;
  return String(lastId);
}
