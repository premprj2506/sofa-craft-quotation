export function num(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

export function roundToCustomFeet(value) {
  const val = num(value);
  const floor = Math.floor(val);
  const decimal = val - floor;
  if (decimal === 0) return floor;
  if (decimal <= 0.5) return floor + 0.5;
  return floor + 1;
}

export function fmt(n) {
  return (Math.round(num(n) * 100) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtRaw(n) {
  return (Math.round(num(n) * 100) / 100).toString();
}

export function fmtCurtain(n) {
  if (isNaN(n)) n = 0;
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
