import { fmt, fmtCurtain, num } from './formatters.js';

/**
 * Renders a structured quotation onto high-DPI HTML5 Canvas pages so that
 * Gujarati Unicode characters, English text, and ₹ symbols render crisply in jsPDF.
 */
function renderInvoiceToPDF({
  title,
  subtitle,
  shopPhone,
  shopAddress,
  metaRows,
  tableHeaders,
  rows,
  totalLines,
  grandTotalLabel,
  grandTotalValue,
  accentHex,
  footerNote,
  fileName,
  showToast,
}) {
  const jsPDF = window.jspdf ? window.jspdf.jsPDF : null;
  if (!jsPDF) {
    if (showToast) {
      showToast('PDF લાઇબ્રેરી ઉપલબ્ધ નથી — પ્રિન્ટ પ્રિવ્યૂ ખૂલી રહ્યું છે.');
    }
    window.print();
    return;
  }

  try {
    // A4 at 150 DPI equivalent: 1240 x 1754 px
    const W = 1240;
    const H = 1754;
    const MARGIN_X = 80;
    const CONTENT_W = W - MARGIN_X * 2;
    const FONT_SANS = '"Noto Sans Gujarati", "DM Sans", sans-serif';
    const FONT_SERIF = '"Noto Serif Gujarati", "DM Serif Display", serif';

    const pages = [];
    let canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    let ctx = canvas.getContext('2d');

    const initPage = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      // Top accent bar
      ctx.fillStyle = accentHex;
      ctx.fillRect(0, 0, W, 14);
    };

    const nextPage = () => {
      pages.push(canvas);
      canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      ctx = canvas.getContext('2d');
      initPage();
      return 80;
    };

    initPage();
    let y = 74;

    // Header Title
    ctx.fillStyle = accentHex;
    ctx.font = `700 44px ${FONT_SERIF}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, y);
    y += 34;

    ctx.fillStyle = '#6b6760';
    ctx.font = `500 20px ${FONT_SANS}`;
    ctx.fillText(subtitle, W / 2, y);

    if (shopPhone || shopAddress) {
      y += 28;
      ctx.fillStyle = '#8a857e';
      ctx.font = `400 18px ${FONT_SANS}`;
      const contactLine = [shopPhone, shopAddress].filter(Boolean).join('  ·  ');
      ctx.fillText(contactLine, W / 2, y);
    }

    y += 28;
    ctx.strokeStyle = '#e8e5de';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MARGIN_X, y);
    ctx.lineTo(W - MARGIN_X, y);
    ctx.stroke();
    y += 40;

    // Metadata box
    ctx.textAlign = 'left';
    const colW = CONTENT_W / 2;
    for (let i = 0; i < metaRows.length; i += 2) {
      const left = metaRows[i];
      const right = metaRows[i + 1];

      if (left) {
        ctx.fillStyle = '#8a857e';
        ctx.font = `500 17px ${FONT_SANS}`;
        ctx.fillText(left.label, MARGIN_X, y);
        ctx.fillStyle = '#1a1917';
        ctx.font = `600 22px ${FONT_SANS}`;
        ctx.fillText(String(left.value || '—').slice(0, 42), MARGIN_X, y + 28);
      }

      if (right) {
        ctx.fillStyle = '#8a857e';
        ctx.font = `500 17px ${FONT_SANS}`;
        ctx.fillText(right.label, MARGIN_X + colW + 20, y);
        ctx.fillStyle = '#1a1917';
        ctx.font = `600 22px ${FONT_SANS}`;
        ctx.fillText(
          String(right.value || '—').slice(0, 42),
          MARGIN_X + colW + 20,
          y + 28
        );
      }

      y += 66;
    }

    y += 12;

    // Table Header
    const drawTableHeader = (curY) => {
      ctx.fillStyle = '#f5f4f0';
      ctx.fillRect(MARGIN_X, curY, CONTENT_W, 46);
      ctx.fillStyle = '#6b6760';
      ctx.font = `600 18px ${FONT_SANS}`;
      ctx.textAlign = 'left';
      ctx.fillText(tableHeaders[0], MARGIN_X + 16, curY + 30);
      ctx.fillText(tableHeaders[1], MARGIN_X + 430, curY + 30);
      ctx.textAlign = 'right';
      ctx.fillText(tableHeaders[2], W - MARGIN_X - 16, curY + 30);
      return curY + 56;
    };

    y = drawTableHeader(y);

    // Table Rows
    rows.forEach((row) => {
      if (y > H - 260) {
        y = nextPage();
        y = drawTableHeader(y);
      }

      if (row.header) {
        ctx.fillStyle = '#fdf6ec';
        ctx.fillRect(MARGIN_X, y - 4, CONTENT_W, 40);
        ctx.fillStyle = accentHex;
        ctx.font = `700 20px ${FONT_SANS}`;
        ctx.textAlign = 'left';
        ctx.fillText(String(row.label || ''), MARGIN_X + 16, y + 24);
        y += 46;
        return;
      }

      ctx.fillStyle = row.info ? '#8a857e' : '#1a1917';
      ctx.font = `${row.info ? '400' : '500'} 20px ${FONT_SANS}`;
      ctx.textAlign = 'left';
      ctx.fillText(String(row.label || '').slice(0, 34), MARGIN_X + 16, y + 24);

      ctx.fillStyle = '#6b6760';
      ctx.font = `400 19px ${FONT_SANS}`;
      ctx.fillText(String(row.details || '').slice(0, 42), MARGIN_X + 430, y + 24);

      ctx.fillStyle = '#1a1917';
      ctx.font = `600 20px ${FONT_SANS}`;
      ctx.textAlign = 'right';
      ctx.fillText(row.amount || '', W - MARGIN_X - 16, y + 24);

      ctx.strokeStyle = '#efede8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(MARGIN_X, y + 40);
      ctx.lineTo(W - MARGIN_X, y + 40);
      ctx.stroke();

      y += 46;
    });

    if (y > H - 300) {
      y = nextPage();
    }

    y += 24;

    // Totals block
    const totalsBoxX = W - MARGIN_X - 500;
    const totalsBoxW = 500;

    totalLines.forEach(([label, val]) => {
      ctx.fillStyle = '#6b6760';
      ctx.font = `500 21px ${FONT_SANS}`;
      ctx.textAlign = 'left';
      ctx.fillText(label, totalsBoxX, y);

      ctx.fillStyle = '#1a1917';
      ctx.font = `600 21px ${FONT_SANS}`;
      ctx.textAlign = 'right';
      ctx.fillText(val, W - MARGIN_X, y);

      ctx.strokeStyle = '#e8e5de';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(totalsBoxX, y + 14);
      ctx.lineTo(W - MARGIN_X, y + 14);
      ctx.stroke();
      y += 42;
    });

    // Grand Total Bar
    y += 6;
    ctx.fillStyle = '#fdf6ec';
    ctx.fillRect(totalsBoxX - 20, y - 28, totalsBoxW + 20, 62);
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 2;
    ctx.strokeRect(totalsBoxX - 20, y - 28, totalsBoxW + 20, 62);

    ctx.fillStyle = '#1a1917';
    ctx.font = `700 23px ${FONT_SERIF}`;
    ctx.textAlign = 'left';
    ctx.fillText(grandTotalLabel, totalsBoxX - 4, y + 12);

    ctx.fillStyle = accentHex;
    ctx.font = `700 27px ${FONT_SERIF}`;
    ctx.textAlign = 'right';
    ctx.fillText(grandTotalValue, W - MARGIN_X - 10, y + 12);

    // Footer Note
    if (footerNote) {
      ctx.fillStyle = '#8a857e';
      ctx.font = `400 17px ${FONT_SANS}`;
      ctx.textAlign = 'center';
      ctx.fillText(footerNote.slice(0, 95), W / 2, H - 64);
    }

    pages.push(canvas);

    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    pages.forEach((pgCanvas, idx) => {
      if (idx > 0) doc.addPage();
      const imgData = pgCanvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
    });

    doc.save(fileName);
    if (showToast) showToast('PDF ડાઉનલોડ થઈ ગયું!');
  } catch (err) {
    console.error('PDF export error:', err);
    if (showToast) showToast('PDF બનવામાં ભૂલ આવી — પ્રિન્ટ ખૂલી રહ્યું છે.');
    window.print();
  }
}

export function exportSofaPDF(quote, showToast, settings) {
  const t = quote.totals || {};
  const shopName = settings?.shopName || 'Sofa Craft';
  const shopTagline = settings?.shopTagline || 'સોફા અને પડદા કોટેશન સિસ્ટમ';

  const metaRows = [
    { label: 'ગ્રાહક (Customer)', value: quote.customerName || '—' },
    { label: 'તારીખ (Date)', value: quote.date || '—' },
    { label: 'ફોન નંબર (Phone)', value: quote.customerPhone || '—' },
    { label: 'સેવા (Service)', value: quote.serviceLabel || quote.serviceType || '—' },
  ];

  if (quote.serviceType === 'mattress') {
    metaRows.push(
      {
        label: 'ગાદલાની જાડાઈ',
        value: quote.mattressThickness === '4inch' ? '4 Inch' : '6 Inch',
      },
      {
        label: 'વોરંટી',
        value: quote.mattressWarranty === '10year' ? '10-Year' : '15-Year',
      }
    );
  }

  const rows = (quote.breakdown || []).map((item) => ({
    label: item.label,
    details: item.value,
    amount: item.amount != null ? `₹ ${fmt(item.amount)}` : '',
    info: item.info,
    header: item.header,
  }));

  const totalLines = [
    ['પેટા-કુલ (Subtotal)', `₹ ${fmt(t.sub)}`],
    [`+ કમિશન (Commission ${quote.commission || 0}%)`, `₹ ${fmt(t.commission)}`],
    ['− ડિસ્કાઉન્ટ (Discount)', `- ₹ ${fmt(t.disc || quote.discount || 0)}`],
    [`+ જીએસટી (GST ${quote.gst || 0}%)`, `₹ ${fmt(t.gstAmt)}`],
  ];

  const adv = num(quote.advance);
  let sofaFinalLabel = 'કુલ રકમ (Grand Total)';
  let sofaFinalValue = `₹ ${fmt(t.grand)}`;
  if (adv > 0) {
    const balance = Math.max(0, num(t.grand) - adv);
    totalLines.push(
      ['કુલ રકમ (Grand Total)', `₹ ${fmt(t.grand)}`],
      ['એડવાન્સ / બાનું (Advance)', `- ₹ ${fmt(adv)}`]
    );
    sofaFinalLabel = 'બાકી રકમ (Balance Due)';
    sofaFinalValue = `₹ ${fmt(balance)}`;
  }

  const custSanitized = (quote.customerName || 'customer').replace(/\s+/g, '_');

  renderInvoiceToPDF({
    title: shopName,
    subtitle: `${shopTagline} · #${quote.id || ''}`,
    shopPhone: settings?.shopPhone,
    shopAddress: settings?.shopAddress,
    metaRows,
    tableHeaders: ['વિગત (Item)', 'માપ / વિગત (Details)', 'રકમ (Amount)'],
    rows,
    totalLines,
    grandTotalLabel: sofaFinalLabel,
    grandTotalValue: sofaFinalValue,
    accentHex: '#c17f3a',
    footerNote: settings?.quoteNote || 'આ કોમ્પ્યુટર દ્વારા જનરેટ કરેલ કોટેશન છે.',
    fileName: `quotation_${custSanitized}_${quote.id || Date.now()}.pdf`,
    showToast,
  });
}

export function exportCurtainPDF(quote, showToast, settings) {
  const shopName = settings?.shopName || 'Sofa Craft';
  const isMulti = Array.isArray(quote.windows) && quote.windows.length > 0;

  const metaRows = [
    { label: 'ગ્રાહક (Customer)', value: quote.customer?.name || '—' },
    { label: 'તારીખ (Date)', value: quote.customer?.date || '—' },
    { label: 'ફોન નંબર (Phone)', value: quote.customer?.phone || '—' },
    { label: 'પડદા પ્રકાર', value: quote.typeName || 'Curtain Quotation' },
  ];

  let rows = [];
  if (isMulti) {
    quote.windows.forEach((win, idx) => {
      rows.push({
        header: true,
        label: `${idx + 1}. ${win.roomName || `બારી ${idx + 1}`} — ${win.typeName} (${win.measurements?.height || 0}" × ${win.measurements?.width || 0}")`,
        details: '',
        amount: '',
      });
      (win.items || []).forEach((item) => {
        rows.push({
          label: item.label,
          details: '',
          amount: fmtCurtain(item.value),
        });
      });
    });
  } else {
    if (quote.measurements) {
      metaRows.push(
        {
          label: 'ઊંચાઈ × પહોળાઈ',
          value: `${quote.measurements.height || 0}" × ${quote.measurements.width || 0}"`,
        },
        {
          label: 'ચપટી (Fullness)',
          value: String(quote.measurements.fullness || '—'),
        }
      );
    }

    rows = (quote.items || []).map((item) => ({
      label: item.label,
      details: '',
      amount: fmtCurtain(item.value),
    }));
  }

  const totalLines = [
    ['પેટા-કુલ (Subtotal)', fmtCurtain(quote.subtotal)],
    ['+ કમિશન (Commission)', fmtCurtain(quote.commissionAmt)],
    ['+ જીએસટી (GST)', fmtCurtain(quote.gstAmt)],
    ['− ડિસ્કાઉન્ટ (Discount)', fmtCurtain(quote.discount)],
  ];

  const adv = num(quote.advance);
  let curtainFinalLabel = 'કુલ રકમ (Grand Total)';
  let curtainFinalValue = fmtCurtain(quote.grandTotal);
  if (adv > 0) {
    const balance = Math.max(0, num(quote.grandTotal) - adv);
    totalLines.push(
      ['કુલ રકમ (Grand Total)', fmtCurtain(quote.grandTotal)],
      ['એડવાન્સ / બાનું (Advance)', `- ${fmtCurtain(adv)}`]
    );
    curtainFinalLabel = 'બાકી રકમ (Balance Due)';
    curtainFinalValue = fmtCurtain(balance);
  }

  const custSanitized = (quote.customer?.name || 'curtain').replace(/\s+/g, '_');

  renderInvoiceToPDF({
    title: shopName,
    subtitle: `પડદા એસ્ટિમેટ · ${quote.typeName || ''}`,
    shopPhone: settings?.shopPhone,
    shopAddress: settings?.shopAddress,
    metaRows,
    tableHeaders: ['વિગત (Item)', '', 'રકમ (Amount)'],
    rows,
    totalLines,
    grandTotalLabel: curtainFinalLabel,
    grandTotalValue: curtainFinalValue,
    accentHex: '#7a2e3b',
    footerNote: settings?.quoteNote || 'આ કોમ્પ્યુટર દ્વારા જનરેટ કરેલ કોટેશન છે.',
    fileName: `curtain_${custSanitized}_${quote.id || Date.now()}.pdf`,
    showToast,
  });
}
