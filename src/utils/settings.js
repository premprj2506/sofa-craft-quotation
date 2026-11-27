import {
  DEFAULTS,
  MATTRESS_RATES,
  DEFAULT_MATTRESS_COMPANIES,
} from '../constants/services.js';
import { CURTAIN_CONFIG } from '../constants/curtainConfig.js';

const SETTINGS_KEY = 'sofa_app_settings_v1';

function buildDefaultCurtainRates() {
  const out = {};
  Object.keys(CURTAIN_CONFIG).forEach((typeKey) => {
    out[typeKey] = {};
    CURTAIN_CONFIG[typeKey].fields.forEach((f) => {
      out[typeKey][f.key] = f.def;
    });
  });
  return out;
}

function mergeCurtainRates(savedCurtains) {
  const defaults = buildDefaultCurtainRates();
  if (!savedCurtains || typeof savedCurtains !== 'object') return defaults;
  Object.keys(defaults).forEach((typeKey) => {
    if (savedCurtains[typeKey] && typeof savedCurtains[typeKey] === 'object') {
      defaults[typeKey] = {
        ...defaults[typeKey],
        ...savedCurtains[typeKey],
      };
    }
  });
  return defaults;
}

function cloneDefaultCompanies() {
  return DEFAULT_MATTRESS_COMPANIES.map((c) => ({
    ...c,
    warranties: c.warranties.map((w) => ({ ...w })),
  }));
}

function normalizeMattressCompanies(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return cloneDefaultCompanies();
  }
  const normalized = list
    .filter((c) => c && typeof c === 'object')
    .map((c, cIdx) => {
      const warranties =
        Array.isArray(c.warranties) && c.warranties.length > 0
          ? c.warranties.map((w, wIdx) => ({
              id: String(w?.id || `war_${cIdx}_${wIdx}`),
              label: String(w?.label ?? `${10 + wIdx * 5} વર્ષ`),
              rate4: Math.max(0, Number(w?.rate4) || 0),
              rate6: Math.max(0, Number(w?.rate6) || 0),
            }))
          : [
              { id: '10year', label: '10 વર્ષ (10-Year)', rate4: 240, rate6: 310 },
              { id: '15year', label: '15 વર્ષ (15-Year)', rate4: 290, rate6: 360 },
            ];
      return {
        id: String(c.id || `comp_${cIdx}`),
        name: String(c.name ?? `કંપની ${cIdx + 1}`),
        warranties,
      };
    });
  return normalized.length > 0 ? normalized : cloneDefaultCompanies();
}

export const DEFAULT_SETTINGS = {
  shopName: 'Sofa Craft',
  shopTagline: 'સોફા અને પડદા કોટેશન સિસ્ટમ',
  shopPhone: '',
  shopAddress: '',
  quoteNote: 'આ કોટેશન અંદાજિત છે. કામ શરૂ કરતા પહેલા માપ અને ડિઝાઇન કન્ફર્મ કરવામાં આવશે.',
  rates: {
    structureRate: DEFAULTS.structure.rate,
    upholsteryRate: DEFAULTS.upholstery.rate,
    coverKapadRate: DEFAULTS.cover_simple.kapad_rate,
    coverStanzoRate: DEFAULTS.cover_sponge.stanzo_rate,
    coverFevicolRate: DEFAULTS.cover_sponge.fevicol_rate,
    coverLabour: DEFAULTS.cover_simple.labour,
    reupholstery: {
      sponge4_rate: DEFAULTS.reupholstery.sponge4_rate,
      sponge2_rate: DEFAULTS.reupholstery.sponge2_rate,
      sponge1_rate: DEFAULTS.reupholstery.sponge1_rate,
      stanzo_rate: DEFAULTS.reupholstery.stanzo_rate,
      fevicol_rate: DEFAULTS.reupholstery.fevicol_rate,
      madarpate_rate: DEFAULTS.reupholstery.madarpate_rate,
      kapad_rate: DEFAULTS.reupholstery.kapad_rate,
      recron_rate: DEFAULTS.reupholstery.recron_rate,
      stapler_rate: DEFAULTS.reupholstery.stapler_rate,
    },
    mattress: {
      '4inch_10year': MATTRESS_RATES['4inch']['10year'],
      '4inch_15year': MATTRESS_RATES['4inch']['15year'],
      '6inch_10year': MATTRESS_RATES['6inch']['10year'],
      '6inch_15year': MATTRESS_RATES['6inch']['15year'],
    },
    mattressCompanies: cloneDefaultCompanies(),
    curtains: buildDefaultCurtainRates(),
  },
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const parsed = JSON.parse(raw);

    let companies;
    if (
      Array.isArray(parsed.rates?.mattressCompanies) &&
      parsed.rates.mattressCompanies.length > 0
    ) {
      companies = normalizeMattressCompanies(parsed.rates.mattressCompanies);
    } else {
      companies = cloneDefaultCompanies();
      // Preserve any legacy customized mattress rates on Kurlon if user edited them before companies existed
      if (parsed.rates?.mattress) {
        const legacy = parsed.rates.mattress;
        const kurlon = companies.find((c) => c.id === 'kurlon');
        if (kurlon) {
          const w10 = kurlon.warranties.find((w) => w.id === '10year');
          const w15 = kurlon.warranties.find((w) => w.id === '15year');
          if (w10) {
            if (legacy['4inch_10year'] != null) w10.rate4 = Number(legacy['4inch_10year']) || w10.rate4;
            if (legacy['6inch_10year'] != null) w10.rate6 = Number(legacy['6inch_10year']) || w10.rate6;
          }
          if (w15) {
            if (legacy['4inch_15year'] != null) w15.rate4 = Number(legacy['4inch_15year']) || w15.rate4;
            if (legacy['6inch_15year'] != null) w15.rate6 = Number(legacy['6inch_15year']) || w15.rate6;
          }
        }
      }
    }

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      rates: {
        ...DEFAULT_SETTINGS.rates,
        ...(parsed.rates || {}),
        reupholstery: {
          ...DEFAULT_SETTINGS.rates.reupholstery,
          ...(parsed.rates?.reupholstery || {}),
        },
        mattress: {
          ...DEFAULT_SETTINGS.rates.mattress,
          ...(parsed.rates?.mattress || {}),
        },
        mattressCompanies: companies,
        curtains: mergeCurtainRates(parsed.rates?.curtains),
      },
    };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getServiceDefaultsFromSettings(serviceId, settings, coverType = 'simple') {
  const s = settings || DEFAULT_SETTINGS;
  const r = s.rates || DEFAULT_SETTINGS.rates;

  if (serviceId === 'structure') {
    return { rate: r.structureRate, feet: '' };
  }
  if (serviceId === 'upholstery') {
    return { rate: r.upholsteryRate, feet: '' };
  }
  if (serviceId === 'reupholstery') {
    return {
      ...DEFAULTS.reupholstery,
      ...r.reupholstery,
    };
  }
  if (serviceId === 'cover') {
    if (coverType === 'sponge') {
      return {
        ...DEFAULTS.cover_sponge,
        kapad_rate: r.coverKapadRate,
        stanzo_rate: r.coverStanzoRate,
        fevicol_rate: r.coverFevicolRate,
        labour: r.coverLabour,
      };
    }
    return {
      ...DEFAULTS.cover_simple,
      kapad_rate: r.coverKapadRate,
      labour: r.coverLabour,
    };
  }
  return {};
}

export function getMattressCompanies(settings) {
  const s = settings || DEFAULT_SETTINGS;
  return normalizeMattressCompanies(s.rates?.mattressCompanies);
}

export function getMattressCompany(companyIdOrName, settings) {
  const companies = getMattressCompanies(settings);
  if (!companyIdOrName) return companies[0];
  const target = String(companyIdOrName).trim().toLowerCase();
  return (
    companies.find(
      (c) => c.id.toLowerCase() === target || c.name.trim().toLowerCase() === target
    ) || companies[0]
  );
}

export function getMattressWarrantyObj(companyIdOrName, warrantyIdOrLabel, settings) {
  const company = getMattressCompany(companyIdOrName, settings);
  if (!warrantyIdOrLabel) return company.warranties[0];
  const target = String(warrantyIdOrLabel).trim().toLowerCase();
  return (
    company.warranties.find(
      (w) => w.id.toLowerCase() === target || w.label.trim().toLowerCase() === target
    ) || company.warranties[0]
  );
}

export function getMattressRateFromSettings(
  thickness,
  warranty,
  settings,
  companyId
) {
  const s = settings || DEFAULT_SETTINGS;
  const companies = getMattressCompanies(s);
  if (companies.length > 0) {
    const comp = companyId ? getMattressCompany(companyId, s) : companies[0];
    const warObj = comp.warranties.find(
      (w) => w.id === warranty || w.label === warranty
    );
    if (warObj) {
      return thickness === '4inch' ? warObj.rate4 : warObj.rate6;
    }
  }
  const key = `${thickness}_${warranty}`;
  return (
    s.rates?.mattress?.[key] ??
    MATTRESS_RATES[thickness]?.[warranty] ??
    240
  );
}

export function formatMattressWarrantyLabel(warrantyIdOrLabel, companyId, settings) {
  if (!warrantyIdOrLabel) return '—';
  if (companyId) {
    const comp = getMattressCompany(companyId, settings);
    const match = comp.warranties.find(
      (w) => w.id === warrantyIdOrLabel || w.label === warrantyIdOrLabel
    );
    if (match) return match.label;
  }
  if (warrantyIdOrLabel === '10year') return '10-Year';
  if (warrantyIdOrLabel === '15year') return '15-Year';
  return String(warrantyIdOrLabel);
}
