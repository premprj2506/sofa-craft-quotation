import { REUPHOLSTERY_ITEMS } from '../constants/services.js';
import { num, roundToCustomFeet, fmt } from './formatters.js';

export function calcReupholsteryMaterialCost(formData) {
  const fd = formData || {};
  return REUPHOLSTERY_ITEMS.reduce((sum, item) => {
    return sum + num(fd[item.key + '_rate']) * num(fd[item.key + '_qty']);
  }, 0);
}

function parseDimInches(val) {
  if (val === undefined || val === null || val === '') return 0;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? 0 : parsed;
}

export function calcBedCost(fd) {
  const pricingMode = fd?.pricingMode || 'none';
  if (pricingMode === 'flat') {
    return num(fd?.flatPrice);
  }
  if (pricingMode === 'sqft') {
    const h = parseDimInches(fd?.height);
    const w = parseDimInches(fd?.width);
    const rate = num(fd?.ratePerSqft);
    if (!h || !w || !rate) return 0;
    return roundToCustomFeet((h * w) / 144) * rate;
  }
  return 0;
}

export function calcSubtotal({ selectedService, formData, coverType }) {
  const fd = formData || {};
  const s = selectedService;

  if (s === 'structure' || s === 'upholstery') {
    return num(fd.feet) * num(fd.rate);
  }

  if (s === 'reupholstery') {
    const matCost = calcReupholsteryMaterialCost(fd);
    const labour = num(fd.labour);
    return Number(matCost) + Number(labour);
  }

  if (s === 'bed') {
    return calcBedCost(fd);
  }

  if (s === 'cover') {
    const kapad = num(fd.kapad_rate) * num(fd.kapad_meter);
    const stanzo = coverType === 'sponge' ? num(fd.stanzo_rate) * num(fd.stanzo_meter) : 0;
    const fevicol = coverType === 'sponge' ? num(fd.fevicol_rate) * num(fd.fevicol_qty) : 0;
    return kapad + stanzo + fevicol + num(fd.labour);
  }

  if (s === 'mattress') {
    const w = num(fd.width);
    const h = num(fd.height);
    const rate = num(fd.rate);
    if (!w || !h || !rate) return 0;
    return roundToCustomFeet((w * h) / 144) * rate;
  }

  return 0;
}

export function calcTotals({ subtotal, commission = 0, gst = 0, discount = 0 }) {
  const sub = num(subtotal);
  const commPct = num(commission);
  const commissionAmt = (sub * commPct) / 100;
  const afterComm = sub + commissionAmt;
  const disc = num(discount);
  const afterDisc = Math.max(0, afterComm - disc);
  const gstPct = num(gst);
  const gstAmt = (afterDisc * gstPct) / 100;
  const grand = afterDisc + gstAmt;

  return {
    sub,
    commission: commissionAmt,
    afterComm,
    disc,
    afterDisc,
    gstAmt,
    grand,
  };
}

export function calcBreakdown({ selectedService, formData, coverType, bedType }) {
  const fd = formData || {};
  const s = selectedService;
  const items = [];

  if (s === 'structure' || s === 'upholstery') {
    items.push({
      label: 'Size (કદ)',
      value: `${num(fd.feet)} ft × ₹${num(fd.rate)}/ft`,
      amount: num(fd.feet) * num(fd.rate),
    });
  }

  if (s === 'reupholstery') {
    REUPHOLSTERY_ITEMS.forEach((item) => {
      const r = num(fd[item.key + '_rate']);
      const q = num(fd[item.key + '_qty']);
      if (r || q) {
        items.push({
          label: item.label,
          value: `${q} ${item.unit} × ₹${r}`,
          amount: r * q,
        });
      }
    });
    items.push({
      label: 'Labour (મજૂરી)',
      value: 'flat rate',
      amount: num(fd.labour),
    });
  }

  if (s === 'cover') {
    const km = num(fd.kapad_meter);
    const kr = num(fd.kapad_rate);
    if (km || kr) {
      items.push({
        label: 'Kapad (કાપડ)',
        value: `${km} m × ₹${kr}`,
        amount: km * kr,
      });
    }
    if (coverType === 'sponge') {
      const sm = num(fd.stanzo_meter);
      const sr = num(fd.stanzo_rate);
      if (sm || sr) {
        items.push({
          label: 'Stanzo (પેડિંગ)',
          value: `${sm} m × ₹${sr}`,
          amount: sm * sr,
        });
      }
      const fq = num(fd.fevicol_qty);
      const fr = num(fd.fevicol_rate);
      if (fq || fr) {
        items.push({
          label: 'Fevicol (ફેવિકોલ)',
          value: `${fq} liter × ₹${fr}`,
          amount: fq * fr,
        });
      }
    }
    items.push({
      label: 'Labour (મજૂરી)',
      value: 'flat rate',
      amount: num(fd.labour),
    });
  }

  if (s === 'bed') {
    const pricingMode = fd.pricingMode || 'none';
    const label = bedType === 'bed' ? 'Bed (બેડ)' : 'Bed Back (બેડ બેક)';
    const cost = calcBedCost(fd);
    items.push({
      label,
      value: `H: ${fd.height || '—'} × W: ${fd.width || '—'}`,
      amount: pricingMode === 'flat' ? cost : null,
      info: pricingMode === 'none',
    });

    if (pricingMode === 'sqft') {
      const h = parseDimInches(fd.height);
      const w = parseDimInches(fd.width);
      const sqft = h && w ? roundToCustomFeet((h * w) / 144) : 0;
      items.push({
        label: 'Bed Pricing (ચો.ફૂટ દર)',
        value: `${sqft} ft × ₹${num(fd.ratePerSqft)}/ft`,
        amount: cost,
      });
    }
  }

  if (s === 'mattress') {
    const w = num(fd.width);
    const h = num(fd.height);
    const rate = num(fd.rate);
    const rawFeet = w && h ? (w * h) / 144 : 0;
    const rounded = rawFeet ? roundToCustomFeet(rawFeet) : 0;

    items.push({
      label: 'Dimensions (માપ)',
      value: `${w}" × ${h}"`,
      amount: null,
      info: true,
    });
    items.push({
      label: 'Calculated Feet (ગણેલ ફૂટ)',
      value: `(${w}×${h})÷144=${fmt(rawFeet)} → rounded: ${rounded} ft`,
      amount: null,
      info: true,
    });
    items.push({
      label: 'Rate (દર)',
      value: `₹${rate}/ft`,
      amount: null,
      info: true,
    });
    items.push({
      label: 'Final Cost (કુલ ખર્ચ)',
      value: `${rounded} ft × ₹${rate}`,
      amount: rounded * rate,
    });
  }

  return items;
}
