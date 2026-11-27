import { generateId } from './id.js';

const SOFA_STORAGE_KEY = 'sofa_quotations_v3';
const CURTAIN_STORAGE_KEY = 'curtainQuotations';
const MAX_BACKUP_BYTES = 10 * 1024 * 1024; // 10 MB safety limit
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Recursively strips prototype-pollution keys from untrusted JSON payloads.
 */
export function sanitizeParsedJson(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeParsedJson(item));
  }
  if (value && typeof value === 'object') {
    const clean = {};
    Object.keys(value).forEach((key) => {
      if (!FORBIDDEN_KEYS.has(key)) {
        clean[key] = sanitizeParsedJson(value[key]);
      }
    });
    return clean;
  }
  return value;
}

export function loadSofaQuotations() {
  try {
    const raw = localStorage.getItem(SOFA_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item === 'object')
      : [];
  } catch (e) {
    console.error('Failed to load sofa quotations:', e);
    return [];
  }
}

export function saveSofaQuotations(list) {
  try {
    localStorage.setItem(
      SOFA_STORAGE_KEY,
      JSON.stringify(Array.isArray(list) ? list : [])
    );
    return true;
  } catch (e) {
    console.error('Failed to save sofa quotations:', e);
    return false;
  }
}

export function loadCurtainQuotations() {
  try {
    const raw = localStorage.getItem(CURTAIN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item === 'object')
      : [];
  } catch (e) {
    console.error('Failed to load curtain quotations:', e);
    return [];
  }
}

export function saveCurtainQuotations(list) {
  try {
    localStorage.setItem(
      CURTAIN_STORAGE_KEY,
      JSON.stringify(Array.isArray(list) ? list : [])
    );
    return true;
  } catch (e) {
    console.error('Failed to save curtain quotations:', e);
    return false;
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
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function normalizeImportedQuotes(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((q) => q && typeof q === 'object' && !Array.isArray(q))
    .map((q) => ({
      ...q,
      id: q.id !== undefined && q.id !== null && String(q.id).trim() !== '' ? q.id : generateId(),
    }));
}

export function parseBackupFile(jsonText) {
  if (typeof jsonText !== 'string' || jsonText.length > MAX_BACKUP_BYTES) {
    throw new Error('Backup file is too large or invalid');
  }
  const rawParsed = JSON.parse(jsonText);
  if (!rawParsed || typeof rawParsed !== 'object' || Array.isArray(rawParsed)) {
    throw new Error('Invalid backup format');
  }
  const parsed = sanitizeParsedJson(rawParsed);
  if (!Array.isArray(parsed.sofaQuotations) && !Array.isArray(parsed.curtainQuotations)) {
    throw new Error('No quotations found in backup file');
  }
  return {
    sofaQuotations: normalizeImportedQuotes(parsed.sofaQuotations),
    curtainQuotations: normalizeImportedQuotes(parsed.curtainQuotations),
    settings:
      parsed.settings && typeof parsed.settings === 'object' && !Array.isArray(parsed.settings)
        ? parsed.settings
        : null,
  };
}
