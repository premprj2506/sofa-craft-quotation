import { fmt, fmtCurtain, num } from './formatters.js';
import { getStatusMeta } from '../constants/orderStatus.js';

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
    const thk = quote.mattressThickness === '4inch' ? '4 Inch' : '6 Inch';
    const war = quote.mattressWarranty === '10year' ? '10-Year' : '15-Year';
    lines.push(`🛏️ ગાદલું: ${thk} | વોરંટી: ${war}`);
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

export function buildKarigarWhatsAppMessage({
  purpose,
  sections,
  handleCount,
  totalSofaFeet,
  kapad,
  coverKapad,
  settings,
}) {
  const shopName = settings?.shopName || 'Sofa Craft';
  const isCover = purpose === 'sofa_cover';
  const lines = [
    `*${shopName}* — કારીગર કટિંગ શીટ`,
    `🛠️ કામ: ${
      isCover
        ? `સોફા ના કવર (${coverKapad.coverSubType === 'sponge' ? 'સ્પંચવાળા' : 'સાદા'})`
        : 'આખો સોફો (54" પનો)'
    }`,
    `📏 કુલ માપ: ${totalSofaFeet} ફૂટ (હેન્ડલ: ${handleCount} નંગ)`,
    '',
    '*સોફાના ભાગો:*',
  ];

  (sections || []).forEach((sec, idx) => {
    if (sec.type === 'l_corner') {
      lines.push(`• ${idx + 1}. ${sec.label}: ${sec.mainFt} + ${sec.cornerFt} ફૂટ (L-આકાર)`);
    } else if (sec.type === 'lounger') {
      lines.push(`• ${idx + 1}. ${sec.label}: ${sec.seatFt} ફૂટ (લોન્જર)`);
    } else {
      lines.push(`• ${idx + 1}. ${sec.label}: ${sec.seatFt} ફૂટ (સીધો)`);
    }
  });

  lines.push('');

  if (!isCover) {
    lines.push('*કાપડ કટિંગ વિગત (1m = 39"):*');
    lines.push(`અ) બેઠક કુલ: *${kapad.bethakMeters.toFixed(2)} મીટર*`);
    kapad.bethakItems.forEach((item) => {
      lines.push(`  • ${item.label}: ${item.totalInches}" (${item.meters.toFixed(2)} m)`);
    });

    lines.push(`બ) ટેકો (2-લાઈન · +${kapad.tekoAllowance}"): *${kapad.tekoMeters.toFixed(2)} મીટર*`);
    const l1 = kapad.tekoPacked.lane1.map((p) => `${p.label} ${p.totalInches}"`).join(' + ') || 'ખાલી';
    const l2 = kapad.tekoPacked.lane2.map((p) => `${p.label} ${p.totalInches}"`).join(' + ') || 'ખાલી';
    lines.push(`  • લાઈન-૧: ${l1} = ${kapad.tekoPacked.lane1Sum}"`);
    lines.push(`  • લાઈન-૨: ${l2} = ${kapad.tekoPacked.lane2Sum}"`);
    lines.push(`ક) હેન્ડલ (${kapad.handleCount} × 1m): *${kapad.handleMeters.toFixed(2)} મીટર*`);
    lines.push('', `*કુલ જરૂરી કાપડ: ${kapad.totalMeters.toFixed(2)} મીટર*`);
  } else {
    lines.push('*કવર કાપડ કટિંગ વિગત (1m = 39"):*');
    if (coverKapad.activeCase === 'case1_regular24') {
      lines.push(`• કેસ: રેગ્યુલર બેઠક (24" સુધી)`);
      lines.push(`• બેઠક (+${coverKapad.bethakAllowance}"): લાઈન-૧ ${coverKapad.bethakPacked.lane1Sum}" | લાઈન-૨ ${coverKapad.bethakPacked.lane2Sum}" → *${coverKapad.bethakMeters.toFixed(2)} m*`);
      lines.push(`• ટેકો (+${coverKapad.tekoAllowance}"): લાઈન-૧ ${coverKapad.tekoPacked.lane1Sum}" | લાઈન-૨ ${coverKapad.tekoPacked.lane2Sum}" → *${coverKapad.tekoMeters.toFixed(2)} m*`);
    } else if (coverKapad.activeCase === 'case2_wide28') {
      lines.push(`• કેસ: મોટી બેઠક (25"–28")`);
      lines.push(`• લાઈન-૧ (બેઠક +${coverKapad.bethakAllowance}"): ${coverKapad.bethakSum}"`);
      lines.push(`• લાઈન-૨ (ટેકો +${coverKapad.tekoAllowance}"): ${coverKapad.tekoSum}"`);
      lines.push(`• બેઠક + ટેકો કુલ: *${coverKapad.pairedMeters.toFixed(2)} m*`);
    } else {
      lines.push(`• કેસ: લોન્જર વાળો સોફો`);
      lines.push(`• L/સીધો ભાગ (બેઠક ${coverKapad.bethakSum}" vs ટેકો ${coverKapad.tekoSum}"): *${coverKapad.pairedMeters.toFixed(2)} m*`);
      lines.push(`• લોન્જર (+${coverKapad.loungerAllowance}" · ખૂણામાંથી ટેકો): *${coverKapad.loungerMeters.toFixed(2)} m*`);
    }
    if (coverKapad.handleCount > 0) {
      lines.push(`• હેન્ડલ (${coverKapad.handleCount} નંગ · ${coverKapad.handleCutInches}"/નંગ): લાઈન-૧ ${coverKapad.handlePacked.lane1Sum}" | લાઈન-૨ ${coverKapad.handlePacked.lane2Sum}" → *${coverKapad.handleMeters.toFixed(2)} m*`);
    } else {
      lines.push(`• હેન્ડલ: 0 નંગ`);
    }
    lines.push('', `*કુલ કવર કાપડ: ${coverKapad.totalMeters.toFixed(2)} મીટર*`);
  }

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
