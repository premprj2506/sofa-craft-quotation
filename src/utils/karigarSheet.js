import { num } from './formatters.js';

function formatLanePieces(pieces = []) {
  if (!pieces.length) return 'ખાલી';
  const joined = pieces
    .map((p) => `${p.label} ${p.totalInches}"`)
    .join(' + ');
  if (joined.length <= 34) return joined;
  return `${pieces.length} ટુકડા`;
}

/**
 * Builds a clean, karigar-friendly cutting sheet payload (no pricing or formula noise)
 * shared by both WhatsApp sharing and PDF generation.
 */
export function buildKarigarSheetData({
  purpose,
  sections = [],
  handleCount = 0,
  totalSofaFeet = 0,
  kapad,
  coverKapad,
  foam4,
  foam2,
  foam1,
  stanzo,
  fevicol,
  tekoModeLabel = '',
  settings = {},
}) {
  const shopName = settings?.shopName || 'Sofa Craft';
  const isCover = purpose === 'sofa_cover';
  const count = isCover ? coverKapad.handleCount : num(handleCount);

  const parts = (sections || []).map((sec, idx) => {
    if (sec.type === 'l_corner') {
      return `${idx + 1}. ${sec.label}: ${sec.mainFt} + ${sec.cornerFt} ફૂટ (L)`;
    }
    if (sec.type === 'lounger') {
      return `${idx + 1}. ${sec.label}: ${sec.seatFt} ફૂટ (લોન્જર)`;
    }
    return `${idx + 1}. ${sec.label}: ${sec.seatFt} ફૂટ (સીધો)`;
  });

  const compactParts = (sections || [])
    .map((sec) => {
      if (sec.type === 'l_corner') return `${sec.mainFt}+${sec.cornerFt}' L`;
      if (sec.type === 'lounger') return `${sec.seatFt}' લોન્જર`;
      return `${sec.seatFt}' સીધો`;
    })
    .join(', ');

  let workTitle = 'આખો સોફો (54" પનો)';
  let caseLabel = tekoModeLabel || 'સાદો ટેકો (+12")';
  const cuttingGroups = [];

  if (!isCover) {
    cuttingGroups.push({
      title: 'અ) બેઠક કટિંગ',
      totalMeters: `${kapad.bethakMeters.toFixed(2)} m`,
      rows: kapad.bethakItems.map((item) => ({
        label: item.label,
        detail: `${item.totalInches}" કટ`,
        meters: `${item.meters.toFixed(2)} m`,
      })),
    });

    cuttingGroups.push({
      title: 'બ) ટેકો કટિંગ (2-લાઈન)',
      totalMeters: `${kapad.tekoMeters.toFixed(2)} m`,
      rows: [
        {
          label: 'લાઈન - ૧',
          detail: `${formatLanePieces(kapad.tekoPacked.lane1)} (${kapad.tekoPacked.lane1Sum}")`,
          meters: '',
        },
        {
          label: 'લાઈન - ૨',
          detail: `${formatLanePieces(kapad.tekoPacked.lane2)} (${kapad.tekoPacked.lane2Sum}")`,
          meters: '',
        },
      ],
    });

    cuttingGroups.push({
      title: 'ક) હેન્ડલ',
      totalMeters: `${kapad.handleMeters.toFixed(2)} m`,
      rows: [
        {
          label: `${kapad.handleCount} નંગ હેન્ડલ`,
          detail: kapad.handleCount > 0 ? 'દરેક 1 મીટર' : '—',
          meters: `${kapad.handleMeters.toFixed(2)} m`,
        },
      ],
    });
  } else {
    const coverLabel =
      coverKapad.coverSubType === 'sponge' ? 'સ્પંચવાળા' : 'સાદા';
    workTitle = `સોફા ના કવર (${coverLabel})`;

    if (coverKapad.activeCase === 'case1_regular24') {
      caseLabel = 'રેગ્યુલર બેઠક (24" સુધી)';
      cuttingGroups.push({
        title: 'અ) બેઠક કવર (2-લાઈન)',
        totalMeters: `${coverKapad.bethakMeters.toFixed(2)} m`,
        rows: [
          {
            label: 'લાઈન-૧ / લાઈન-૨',
            detail: `${coverKapad.bethakPacked.lane1Sum}" | ${coverKapad.bethakPacked.lane2Sum}"`,
            meters: `${coverKapad.bethakMeters.toFixed(2)} m`,
          },
        ],
      });
      cuttingGroups.push({
        title: 'બ) ટેકો કવર (2-લાઈન)',
        totalMeters: `${coverKapad.tekoMeters.toFixed(2)} m`,
        rows: [
          {
            label: 'લાઈન-૧ / લાઈન-૨',
            detail: `${coverKapad.tekoPacked.lane1Sum}" | ${coverKapad.tekoPacked.lane2Sum}"`,
            meters: `${coverKapad.tekoMeters.toFixed(2)} m`,
          },
        ],
      });
    } else if (coverKapad.activeCase === 'case2_wide28') {
      caseLabel = 'મોટી બેઠક (25"-28")';
      cuttingGroups.push({
        title: 'અ+બ) બેઠક અને ટેકો (સામસામે)',
        totalMeters: `${coverKapad.pairedMeters.toFixed(2)} m`,
        rows: [
          { label: 'લાઈન-૧ (બેઠક)', detail: `${coverKapad.bethakSum}" કટ`, meters: '' },
          { label: 'લાઈન-૨ (ટેકો)', detail: `${coverKapad.tekoSum}" કટ`, meters: '' },
        ],
      });
    } else {
      caseLabel = 'લોન્જર + સીધો/L ભાગ';
      cuttingGroups.push({
        title: 'અ) સીધો / L ભાગ (સામસામે)',
        totalMeters: `${coverKapad.pairedMeters.toFixed(2)} m`,
        rows: [
          { label: 'લાઈન-૧ (બેઠક)', detail: `${coverKapad.bethakSum}" કટ`, meters: '' },
          { label: 'લાઈન-૨ (ટેકો)', detail: `${coverKapad.tekoSum}" કટ`, meters: '' },
        ],
      });
      cuttingGroups.push({
        title: 'બ) લોન્જર (ખૂણામાંથી ટેકો)',
        totalMeters: `${coverKapad.loungerMeters.toFixed(2)} m`,
        rows: coverKapad.loungerItems.map((item) => ({
          label: item.label,
          detail: `${item.totalInches}" કટ`,
          meters: `${item.meters.toFixed(2)} m`,
        })),
      });
    }

    cuttingGroups.push({
      title: `ક) હેન્ડલ (${coverKapad.handleCount} નંગ)`,
      totalMeters: `${coverKapad.handleMeters.toFixed(2)} m`,
      rows:
        coverKapad.handleCount > 0
          ? [
              {
                label: `${coverKapad.handleCutInches}" પ્રતિ હેન્ડલ`,
                detail: `લાઈન: ${coverKapad.handlePacked.lane1Sum}" | ${coverKapad.handlePacked.lane2Sum}"`,
                meters: `${coverKapad.handleMeters.toFixed(2)} m`,
              },
            ]
          : [{ label: 'હેન્ડલ', detail: '0 નંગ', meters: '0.00 m' }],
    });
  }

  const totalMeters = isCover ? coverKapad.totalMeters : kapad.totalMeters;
  const foamSummary =
    !isCover && foam4 && foam4.totalSqft > 0
      ? `${foam4.totalSqft.toFixed(2)} ફૂટ (${foam4.recommendedSheet.label} · ${foam4.recommendedSheet.sheetsNeeded} શીટ)`
      : '';
  const foam2Summary =
    !isCover && foam2 && foam2.totalSqft > 0
      ? `${foam2.sheetsNeeded} શીટ (${foam2.totalSqft.toFixed(2)} ફૂટ · 3×6 · ઊંચાઈ ${foam2.tekoHeightInches}")`
      : '';
  const foam1Summary =
    !isCover && foam1 && foam1.totalSheets > 0
      ? `${foam1.totalSheets} સીટ (બેઠક + ${foam1.isLining ? '0 ટેકો' : 'ટેકો'} + ${foam1.handleCount} હેન્ડલ)`
      : '';
  const stanzoSummary =
    !isCover && stanzo && stanzo.active && stanzo.meters > 0
      ? `${stanzo.meters.toFixed(2)} મીટર (લાઈન ${stanzo.packed.lane1Sum}" | ${stanzo.packed.lane2Sum}")`
      : '';
  const fevicolSummary =
    !isCover && fevicol && fevicol.liters > 0
      ? `${fevicol.liters} લિટર (${fevicol.totalFeet}' મુજબ)`
      : '';

  return {
    shopName,
    isCover,
    workTitle,
    caseLabel,
    sizeLine: `${totalSofaFeet} ફૂટ · હેન્ડલ: ${count} નંગ`,
    parts,
    compactParts: compactParts || `${totalSofaFeet}'`,
    cuttingGroups,
    foamSummary,
    foam2Summary,
    foam1Summary,
    stanzoSummary,
    fevicolSummary,
    totalMetersLabel: isCover ? 'કુલ કવર કાપડ' : 'કુલ જરૂરી કાપડ',
    totalMetersText: `${totalMeters.toFixed(2)} મીટર`,
  };
}
