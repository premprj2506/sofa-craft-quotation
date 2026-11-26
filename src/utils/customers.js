/**
 * Extract deduplicated saved customers from Sofa and Curtain quotations,
 * preferring records with a phone number and most recent ID.
 */
export function extractSavedCustomers(
  sofaQuotations = [],
  curtainQuotations = []
) {
  const byKey = new Map();

  const register = (rawName, rawPhone, date, id) => {
    const name = String(rawName || '').trim();
    if (!name || name === 'Unknown' || name === 'નામ વગર') return;
    const phone = String(rawPhone || '').trim();
    const key = name.toLowerCase();
    const sortScore = Number(id) || 0;
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, { name, phone, key, lastDate: date || '', sortScore });
      return;
    }

    const shouldReplace =
      (!existing.phone && phone) ||
      (Boolean(existing.phone) === Boolean(phone) &&
        sortScore >= existing.sortScore);

    if (shouldReplace) {
      byKey.set(key, {
        name,
        phone: phone || existing.phone,
        key,
        lastDate: date || existing.lastDate,
        sortScore: Math.max(sortScore, existing.sortScore),
      });
    }
  };

  (sofaQuotations || []).forEach((q) => {
    register(q.customerName, q.customerPhone, q.date, q.id);
  });

  (curtainQuotations || []).forEach((q) => {
    register(q.customer?.name, q.customer?.phone, q.customer?.date, q.id);
  });

  return Array.from(byKey.values()).sort((a, b) => b.sortScore - a.sortScore);
}

export function findExactCustomerByName(nameInput, savedCustomers = []) {
  const key = String(nameInput || '').trim().toLowerCase();
  if (!key) return null;
  return savedCustomers.find((c) => c.key === key && c.phone) || null;
}

export function filterCustomerSuggestions(
  nameInput,
  savedCustomers = [],
  limit = 6
) {
  const query = String(nameInput || '').trim().toLowerCase();
  const list = query
    ? savedCustomers.filter(
        (c) =>
          c.key.includes(query) ||
          (c.phone && c.phone.toLowerCase().includes(query))
      )
    : savedCustomers;
  return list.slice(0, limit);
}
