import { fmt, fmtCurtain } from './formatters.js';

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
  lines.push(`Subtotal: ₹${fmt(t.sub)}`);
  if (Number(quote.commission) > 0) {
    lines.push(`Commission (${quote.commission}%): ₹${fmt(t.commission)}`);
  }
  if (Number(t.disc || quote.discount) > 0) {
    lines.push(`Discount: -₹${fmt(t.disc || quote.discount)}`);
  }
  if (Number(quote.gst) > 0) {
    lines.push(`GST (${quote.gst}%): ₹${fmt(t.gstAmt)}`);
  }
  lines.push(`*કુલ રકમ (Grand Total): ₹${fmt(t.grand)}*`);

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
  const lines = [
    `*${shopName}* — પડદા કોટેશન`,
    `📅 તારીખ: ${quote.customer?.date || '—'}`,
    `👤 ગ્રાહક: ${quote.customer?.name || '—'}`,
    `🪟 પ્રકાર: ${quote.typeName || 'Curtains'}`,
  ];

  if (quote.measurements) {
    lines.push(
      `📏 માપ: ઊંચાઈ ${quote.measurements.height || 0}" × પહોળાઈ ${quote.measurements.width || 0}"`
    );
  }

  lines.push('', '*વિગતવાર ખર્ચ:*');
  (quote.items || []).forEach((item) => {
    lines.push(`• ${item.label}: ${fmtCurtain(item.value)}`);
  });

  lines.push('');
  lines.push(`Subtotal: ${fmtCurtain(quote.subtotal)}`);
  if (Number(quote.commissionAmt) > 0) {
    lines.push(`+ કમિશન: ${fmtCurtain(quote.commissionAmt)}`);
  }
  if (Number(quote.gstAmt) > 0) {
    lines.push(`+ GST: ${fmtCurtain(quote.gstAmt)}`);
  }
  if (Number(quote.discount) > 0) {
    lines.push(`− ડિસ્કાઉન્ટ: ${fmtCurtain(quote.discount)}`);
  }
  lines.push(`*કુલ રકમ (Grand Total): ${fmtCurtain(quote.grandTotal)}*`);

  if (settings?.shopPhone) {
    lines.push(`\n📞 ${settings.shopPhone}`);
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
