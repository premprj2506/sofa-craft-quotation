import { num } from './formatters.js';

export const INCHES_PER_METER = 39;
export const PANO_WIDTH_INCHES = 54;
export const BETHAK_ALLOWANCE_INCHES = 5;
export const TEKO_ALLOWANCE_NORMAL = 12;
export const TEKO_ALLOWANCE_12MM = 17;
export const HANDLE_METERS_EACH = 1;
export const DEFAULT_CORNER_FEET = 2.5;

export function round2(val) {
  return Math.round(num(val) * 100) / 100;
}

/**
 * Generates preset sofa sections when user enters Total Feet + Shape.
 * Supports: 'straight' | 'l_shape' | 'c_shape'
 */
export function generatePresetSections(totalFeet, shape) {
  const total = Math.max(0, num(totalFeet));

  if (shape === 'straight') {
    const handleCount = 4;
    const remaining = Math.max(0, total - handleCount);
    const s1 = round2(remaining / 2);
    const s2 = round2(remaining - s1);
    return {
      sections: [
        { id: 'p1', type: 'straight', label: 'સોફો ૧ (સીધો)', seatFt: s1 },
        { id: 'p2', type: 'straight', label: 'સોફો ૨ (સીધો)', seatFt: s2 },
      ],
      handleCount,
    };
  }

  if (shape === 'l_shape') {
    const handleCount = 2;
    const cornerFt = DEFAULT_CORNER_FEET;
    const remaining = Math.max(0, total - handleCount - cornerFt);
    // For 16 ft: remaining = 11.5 -> mainFt = 6, straightFt = 5.5
    const mainFt = round2(Math.ceil(remaining) / 2);
    const straightFt = round2(Math.max(0, remaining - mainFt));
    return {
      sections: [
        {
          id: 'p1',
          type: 'l_corner',
          label: 'L-આકાર સોફો',
          mainFt,
          cornerFt,
        },
        {
          id: 'p2',
          type: 'straight',
          label: 'સીધો સોફો',
          seatFt: straightFt,
        },
      ],
      handleCount,
    };
  }

  // 'c_shape'
  const handleCount = 2;
  const cornerFt = DEFAULT_CORNER_FEET;
  const remaining = Math.max(0, total - handleCount - cornerFt * 2);
  // For 23 ft: remaining = 16 -> sideFt = 6, midFt = 4, sideFt = 6
  const sideFt = round2(Math.round(remaining * 0.375 * 2) / 2);
  const midFt = round2(Math.max(0, remaining - sideFt * 2));

  return {
    sections: [
      {
        id: 'p1',
        type: 'l_corner',
        label: 'ડાબી બાજુ L-સોફો',
        mainFt: sideFt,
        cornerFt,
      },
      {
        id: 'p2',
        type: 'straight',
        label: 'વચ્ચે સીધો સોફો',
        seatFt: midFt,
      },
      {
        id: 'p3',
        type: 'l_corner',
        label: 'જમણી બાજુ L-સોફો',
        mainFt: sideFt,
        cornerFt,
      },
    ],
    handleCount,
  };
}

/**
 * Optimally partitions Teko pieces across 2 parallel lanes in a 54" pano
 * to minimize max(sum(lane1), sum(lane2)).
 */
export function packTekoIntoTwoLanes(pieces) {
  if (!pieces || pieces.length === 0) {
    return {
      lane1: [],
      lane2: [],
      lane1Sum: 0,
      lane2Sum: 0,
      maxInches: 0,
      meters: 0,
    };
  }

  if (pieces.length === 1) {
    const sum = pieces[0].totalInches;
    return {
      lane1: [pieces[0]],
      lane2: [],
      lane1Sum: sum,
      lane2Sum: 0,
      maxInches: sum,
      meters: round2(sum / INCHES_PER_METER),
    };
  }

  let bestLane1Mask = 1;
  let bestMax = Infinity;

  if (pieces.length <= 18) {
    // Exact 2-way partition search (fix bit 0 in lane 1 to cut search space in half)
    const n = pieces.length;
    const totalSubsets = 1 << n;
    for (let mask = 1; mask < totalSubsets; mask += 2) {
      let s1 = 0;
      let s2 = 0;
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) s1 += pieces[i].totalInches;
        else s2 += pieces[i].totalInches;
      }
      const m = Math.max(s1, s2);
      if (m < bestMax) {
        bestMax = m;
        bestLane1Mask = mask;
      }
    }

    const lane1 = [];
    const lane2 = [];
    let lane1Sum = 0;
    let lane2Sum = 0;

    pieces.forEach((p, idx) => {
      if (bestLane1Mask & (1 << idx)) {
        lane1.push(p);
        lane1Sum += p.totalInches;
      } else {
        lane2.push(p);
        lane2Sum += p.totalInches;
      }
    });

    const maxInches = Math.max(lane1Sum, lane2Sum);
    return {
      lane1,
      lane2,
      lane1Sum: round2(lane1Sum),
      lane2Sum: round2(lane2Sum),
      maxInches: round2(maxInches),
      meters: round2(maxInches / INCHES_PER_METER),
    };
  }

  // Greedy LPT fallback for large arrays (>18 pieces)
  const sorted = [...pieces].sort((a, b) => b.totalInches - a.totalInches);
  const lane1 = [];
  const lane2 = [];
  let lane1Sum = 0;
  let lane2Sum = 0;

  sorted.forEach((p) => {
    if (lane1Sum <= lane2Sum) {
      lane1.push(p);
      lane1Sum += p.totalInches;
    } else {
      lane2.push(p);
      lane2Sum += p.totalInches;
    }
  });

  const maxInches = Math.max(lane1Sum, lane2Sum);
  return {
    lane1,
    lane2,
    lane1Sum: round2(lane1Sum),
    lane2Sum: round2(lane2Sum),
    maxInches: round2(maxInches),
    meters: round2(maxInches / INCHES_PER_METER),
  };
}

/**
 * Calculates total Kapad (fabric) meters and detailed Gujarati breakdown
 * from normalized sofa sections, handle count, and teko options.
 */
export function calculateKapad(sections, handleCount, options = {}) {
  const tekoMode = options.tekoMode || 'normal'; // 'normal' | 'bhag' | 'lining12mm'
  const tekoAllowance =
    tekoMode === 'lining12mm' ? TEKO_ALLOWANCE_12MM : TEKO_ALLOWANCE_NORMAL;

  const bethakItems = [];
  const tekoPieces = [];

  (sections || []).forEach((sec, idx) => {
    const label = sec.label || `સોફો ${idx + 1}`;
    if (sec.type === 'l_corner') {
      const mainFt = Math.max(0, num(sec.mainFt));
      const cornerFt = Math.max(0, num(sec.cornerFt));
      if (mainFt > 0) {
        const baseIn = round2(mainFt * 12);
        const cutIn = round2(baseIn + BETHAK_ALLOWANCE_INCHES);
        const meters = round2(cutIn / INCHES_PER_METER);
        bethakItems.push({
          id: `${sec.id}-b`,
          label: `${label} (${mainFt} ફૂટ)`,
          baseInches: baseIn,
          allowance: BETHAK_ALLOWANCE_INCHES,
          totalInches: cutIn,
          meters,
        });
        tekoPieces.push({
          id: `${sec.id}-tm`,
          label: `${label} - મોટો ભાગ (${mainFt} ફૂટ)`,
          baseInches: baseIn,
          allowance: tekoAllowance,
          totalInches: round2(baseIn + tekoAllowance),
        });
      }
      if (cornerFt > 0) {
        const cornerIn = round2(cornerFt * 12);
        tekoPieces.push({
          id: `${sec.id}-tc`,
          label: `${label} - ખૂણિયો (${cornerFt} ફૂટ)`,
          baseInches: cornerIn,
          allowance: tekoAllowance,
          totalInches: round2(cornerIn + tekoAllowance),
        });
      }
    } else {
      const seatFt = Math.max(0, num(sec.seatFt));
      if (seatFt > 0) {
        const baseIn = round2(seatFt * 12);
        const cutIn = round2(baseIn + BETHAK_ALLOWANCE_INCHES);
        const meters = round2(cutIn / INCHES_PER_METER);
        bethakItems.push({
          id: `${sec.id}-b`,
          label: `${label} (${seatFt} ફૂટ)`,
          baseInches: baseIn,
          allowance: BETHAK_ALLOWANCE_INCHES,
          totalInches: cutIn,
          meters,
        });
        tekoPieces.push({
          id: `${sec.id}-t`,
          label: `${label} (${seatFt} ફૂટ)`,
          baseInches: baseIn,
          allowance: tekoAllowance,
          totalInches: round2(baseIn + tekoAllowance),
        });
      }
    }
  });

  const totalBethakInches = bethakItems.reduce(
    (sum, item) => sum + item.totalInches,
    0
  );
  const bethakMeters = round2(totalBethakInches / INCHES_PER_METER);
  const tekoPacked = packTekoIntoTwoLanes(tekoPieces);
  const handles = Math.max(0, num(handleCount));
  const handleMeters = round2(handles * HANDLE_METERS_EACH);
  const totalMeters = round2(bethakMeters + tekoPacked.meters + handleMeters);

  return {
    bethakItems,
    bethakMeters,
    tekoPieces,
    tekoPacked,
    tekoAllowance,
    tekoMeters: tekoPacked.meters,
    handleCount: handles,
    handleMeters,
    totalMeters,
  };
}

/**
 * Calculates total sofa feet (sum of all seats, corners, and handles).
 */
export function calculateTotalSofaFeet(sections, handleCount) {
  const sectionFeet = (sections || []).reduce((sum, sec) => {
    if (sec.type === 'l_corner') {
      return sum + Math.max(0, num(sec.mainFt)) + Math.max(0, num(sec.cornerFt));
    }
    return sum + Math.max(0, num(sec.seatFt));
  }, 0);
  return round2(sectionFeet + Math.max(0, num(handleCount)));
}

/**
 * Main extensible material calculation entry point.
 * Future materials (sponge4, sponge2, stanzo, fevicol, madarpate, recron, stapler)
 * can be added cleanly right here.
 */
export function calculateAllMaterials(sections, handleCount, options = {}) {
  const kapad = calculateKapad(sections, handleCount, options);
  const totalSofaFeet = calculateTotalSofaFeet(sections, handleCount);

  return {
    totalSofaFeet,
    kapad,
  };
}
