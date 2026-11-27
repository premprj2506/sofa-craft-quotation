import { fmt, fmtCurtain, num } from './formatters.js';
import { getStatusMeta } from '../constants/orderStatus.js';
import { buildKarigarSheetData } from './karigarSheet.js';
import { formatMattressWarrantyLabel } from './settings.js';

function cleanWhatsAppPhone(rawPhone) {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return '91' + digits;
  return digits;
}

export function buildSofaWhatsAppMessage(quote, settings) {
  const shopName = settings?.shopName || 'Sofa Craft';
  const shopPhone = settings?.shopPhone ? `\n📞 ${settings.shopPhone}` : '';
  const t = quote.totals || {};

  const lines = [
    `*${shopName}* — કોટેશન`,
    `📅 તારીખ: ${quote.date || '—'}`,
    `👤 ગ્રાહક: ${quote.customerName || '—'}`,
    `🛠️ સેવા: ${quote.serviceLabel || quote.serviceType || '—'}`,
  ];

  if (quote.serviceType === 'mattress') {
    const comp = quote.mattressCompanyName ? `${quote.mattressCompanyName} · ` : '';
    const thk = quote.mattressThickness === '4inch' ? '4 Inch' : '6 Inch';
    const war =
      quote.mattressWarrantyLabel ||
      formatMattressWarrantyLabel(quote.mattressWarranty, quote.mattressCompany, settings);
    lines.push(`🛏️ ગાદલું: ${comp}${thk} | વોરંટી: ${war}`);
  }

  lines.push('', '*વિગતવાર ખર્ચ:*');
  (quote.breakdown || []).forEach((item) => {
    if (item.header) {
      lines.push(`\n▸ *${item.label}*`);
      return;
    }
    const amt = item.amount != null ? ` = ₹${fmt(item.amount)}` : '';
    lines.push(`• ${item.label}: ${item.value}${amt}`);
  });

  lines.push('');
  lines.push(`પેટા-કુલ (Subtotal): ₹${fmt(t.sub)}`);
  if (Number(quote.commission) > 0) {
    lines.push(`કમિશન (${quote.commission}%): ₹${fmt(t.commission)}`);
  }
  if (Number(t.disc || quote.discount) > 0) {
    lines.push(`ડિસ્કાઉન્ટ: -₹${fmt(t.disc || quote.discount)}`);
  }
  if (Number(quote.gst) > 0) {
    lines.push(`જીએસટી (GST ${quote.gst}%): ₹${fmt(t.gstAmt)}`);
  }
  lines.push(`*કુલ રકમ (Grand Total): ₹${fmt(t.grand)}*`);
  const adv = num(quote.advance);
  if (adv > 0) {
    const balance = Math.max(0, num(t.grand) - adv);
    lines.push(`💵 એડવાન્સ / બાનું: ₹${fmt(adv)}`);
    lines.push(`📌 *બાકી રકમ (Balance): ₹${fmt(balance)}*`);
  }
  if (quote.status && quote.status !== 'pending') {
    lines.push(`📋 સ્ટેટસ: ${getStatusMeta(quote.status).label}`);
  }

  if (settings?.quoteNote) {
    lines.push('', `_${settings.quoteNote}_`);
  }
  if (shopPhone) {
    lines.push(shopPhone);
  }

  return lines.join('\n');
}

export function buildCurtainWhatsAppMessage(quote, settings) {
  const shopName = settings?.shopName || 'Sofa Craft';
  const isMulti = Array.isArray(quote.windows) && quote.windows.length > 0;

  const lines = [
    `*${shopName}* — પડદા કોટેશન`,
    `📅 તારીખ: ${quote.customer?.date || '—'}`,
    `👤 ગ્રાહક: ${quote.customer?.name || '—'}`,
    `🪟 પ્રકાર: ${quote.typeName || 'Curtains'}`,
  ];

  if (isMulti) {
    lines.push('', `*બારી / રૂમ મુજબ વિગત (${quote.windows.length} પડદા):*`);
    quote.windows.forEach((win, idx) => {
      lines.push(
        `\n▸ *${idx + 1}. ${win.roomName || `બારી ${idx + 1}`}* — ${win.typeName} (${win.measurements?.height || 0}" × ${win.measurements?.width || 0}")`
      );
      (win.items || []).forEach((item) => {
        lines.push(`  • ${item.label}: ${fmtCurtain(item.value)}`);
      });
      lines.push(`  *પેટા-કુલ: ${fmtCurtain(win.subtotal)}*`);
    });
  } else {
    if (quote.measurements) {
      lines.push(
        `📏 માપ: ઊંચાઈ ${quote.measurements.height || 0}" × પહોળાઈ ${quote.measurements.width || 0}"`
      );
    }

    lines.push('', '*વિગતવાર ખર્ચ:*');
    (quote.items || []).forEach((item) => {
      lines.push(`• ${item.label}: ${fmtCurtain(item.value)}`);
    });
  }

  lines.push('');
  lines.push(`પેટા-કુલ (Subtotal): ${fmtCurtain(quote.subtotal)}`);
  if (Number(quote.commissionAmt) > 0) {
    lines.push(`+ કમિશન: ${fmtCurtain(quote.commissionAmt)}`);
  }
  if (Number(quote.gstAmt) > 0) {
    lines.push(`+ જીએસટી (GST): ${fmtCurtain(quote.gstAmt)}`);
  }
  if (Number(quote.discount) > 0) {
    lines.push(`− ડિસ્કાઉન્ટ: ${fmtCurtain(quote.discount)}`);
  }
  lines.push(`*કુલ રકમ (Grand Total): ${fmtCurtain(quote.grandTotal)}*`);
  const adv = num(quote.advance);
  if (adv > 0) {
    const balance = Math.max(0, num(quote.grandTotal) - adv);
    lines.push(`💵 એડવાન્સ / બાનું: ${fmtCurtain(adv)}`);
    lines.push(`📌 *બાકી રકમ (Balance): ${fmtCurtain(balance)}*`);
  }
  if (quote.status && quote.status !== 'pending') {
    lines.push(`📋 સ્ટેટસ: ${getStatusMeta(quote.status).label}`);
  }

  if (settings?.shopPhone) {
    lines.push(`\n📞 ${settings.shopPhone}`);
  }

  return lines.join('\n');
}

export function buildKarigarWhatsAppMessage(params) {
  const sheet = buildKarigarSheetData(params);
  const lines = [
    `*${sheet.shopName}* — કારીગર કટિંગ શીટ`,
    `🛠️ કામ: ${sheet.workTitle}`,
    `📏 માપ: ${sheet.sizeLine}`,
    `📐 પ્રકાર: ${sheet.caseLabel}`,
    '',
    '*સોફાના ભાગ:*',
    ...sheet.parts.map((p) => `• ${p}`),
    '',
    '*કટિંગ માપ:*',
  ];

  sheet.cuttingGroups.forEach((grp) => {
    lines.push(`▸ *${grp.title}* — *${grp.totalMeters}*`);
    grp.rows.forEach((row) => {
      const mText = row.meters && grp.rows.length > 1 ? ` (${row.meters})` : '';
      lines.push(`  • ${row.label}: ${row.detail}${mText}`);
    });
  });

  if (sheet.foamSummary) {
    lines.push(`▸ *ઘ) 4" સ્પંચ શીટ* — *${sheet.foamSummary}*`);
  }
  if (sheet.foam2Summary) {
    lines.push(`▸ *ચ) 2" ટેકો સીટ* — *${sheet.foam2Summary}*`);
  }
  if (sheet.foam1Summary) {
    lines.push(`▸ *છ) 1" ની સીટ (3×6)* — *${sheet.foam1Summary}*`);
  }
  if (sheet.stanzoSummary) {
    lines.push(`▸ *જ) 15mm સ્ટેન્ઝો* — *${sheet.stanzoSummary}*`);
  }
  if (sheet.fevicolSummary) {
    lines.push(`▸ *ઝ) ફેવિકોલ* — *${sheet.fevicolSummary}*`);
  }

  lines.push('', `✅ *${sheet.totalMetersLabel}: ${sheet.totalMetersText}*`);
  return lines.join('\n');
}

export function shareOnWhatsApp({ phone, message, showToast }) {
  const cleanPhone = cleanWhatsAppPhone(phone);
  const encoded = encodeURIComponent(message);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(url, '_blank', 'noopener,noreferrer');
  if (showToast) showToast('WhatsApp ખુલી રહ્યું છે...');
}
