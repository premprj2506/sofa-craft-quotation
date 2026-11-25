import { DEFAULTS, MATTRESS_RATES } from '../constants/services.js';

const SETTINGS_KEY = 'sofa_app_settings_v1';

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
  },
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    const parsed = JSON.parse(raw);
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

export function getMattressRateFromSettings(thickness, warranty, settings) {
  const s = settings || DEFAULT_SETTINGS;
  const key = `${thickness}_${warranty}`;
  return (
    s.rates?.mattress?.[key] ??
    MATTRESS_RATES[thickness]?.[warranty] ??
    240
  );
}
