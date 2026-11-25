const SOFA_STORAGE_KEY = 'sofa_quotations_v3';
const CURTAIN_STORAGE_KEY = 'curtainQuotations';

export function loadSofaQuotations() {
  try {
    const raw = localStorage.getItem(SOFA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load sofa quotations:', e);
    return [];
  }
}

export function saveSofaQuotations(list) {
  try {
    localStorage.setItem(SOFA_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save sofa quotations:', e);
  }
}

export function loadCurtainQuotations() {
  try {
    const raw = localStorage.getItem(CURTAIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load curtain quotations:', e);
    return [];
  }
}

export function saveCurtainQuotations(list) {
  try {
    localStorage.setItem(CURTAIN_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save curtain quotations:', e);
  }
}

export function exportBackupData({ sofaQuotations, curtainQuotations, settings }) {
  const payload = {
    app: 'sofa-curtain-craft',
    version: 1,
    exportedAt: new Date().toISOString(),
    sofaQuotations: sofaQuotations || [],
    curtainQuotations: curtainQuotations || [],
    settings: settings || null,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `sofa-craft-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackupFile(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup format');
  }
  if (!Array.isArray(parsed.sofaQuotations) && !Array.isArray(parsed.curtainQuotations)) {
    throw new Error('No quotations found in backup file');
  }
  return {
    sofaQuotations: Array.isArray(parsed.sofaQuotations) ? parsed.sofaQuotations : [],
    curtainQuotations: Array.isArray(parsed.curtainQuotations) ? parsed.curtainQuotations : [],
    settings: parsed.settings || null,
  };
}
