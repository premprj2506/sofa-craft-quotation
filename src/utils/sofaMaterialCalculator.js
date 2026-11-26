import { num } from './formatters.js';

export const INCHES_PER_METER = 39;
export const PANO_WIDTH_INCHES = 54;
export const BETHAK_ALLOWANCE_INCHES = 5;
export const LOUNGER_BETHAK_ALLOWANCE_INCHES = 12;
export const TEKO_ALLOWANCE_NORMAL = 12;
export const TEKO_ALLOWANCE_12MM = 17;
export const HANDLE_METERS_EACH = 1;
export const DEFAULT_CORNER_FEET = 2.5;

// Sofa Cover Constants
export const COVER_BETHAK_SIMPLE_ALLOWANCE = 15;
export const COVER_BETHAK_SPONGE_ALLOWANCE = 20;
export const COVER_TEKO_ALLOWANCE = 6;
export const COVER_LOUNGER_SIMPLE_ALLOWANCE = 18;
export const COVER_LOUNGER_SPONGE_ALLOWANCE = 20;
export const COVER_DEFAULT_HANDLE_INCHES = 33;
export const COVER_HANDLE_ALLOWANCE = 6;

export function round2(val) {
  return Math.round(num(val) * 100) / 100;
}

/**
 * Generates preset sofa sections when user enters Total Feet + Shape.
 * Supports: 'single_straight' | 'straight' | 'l_shape' | 'c_shape' | 'l_lounger'
 */
export function generatePresetSections(totalFeet, shape) {
  const total = Math.max(0, num(totalFeet));

  if (shape === 'single_straight') {
    const handleCount = 2;
    const seatFt = round2(Math.max(0, total - handleCount));
    return {
      sections: [
        { id: 'p1', type: 'straight', label: 'સીધો સિંગલ સોફો', seatFt },
      ],
      handleCount,
    };
  }

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

  if (shape === 'l_lounger') {
    // Only 1 handle on the L-sofa side; no handle on lounger side
    const handleCount = 1;
    const cornerFt = DEFAULT_CORNER_FEET;
    const remaining = Math.max(0, total - handleCount - cornerFt);
    // For 16 ft: remaining = 12.5 -> mainFt = 7, loungerFt = 5.5
    const mainFt = round2(Math.ceil(remaining / 2));
    const loungerFt = round2(Math.max(0, remaining - mainFt));
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
          type: 'lounger',
          label: 'લોન્જર',
          seatFt: loungerFt,
        },
      ],
      handleCount,
    };
  }

  // 'c_shape'
  const handleCount = 2;
  const cornerFt = DEFAULT_CORNER_FEET;
  const remaining = Math.max(0, total - handleCount - cornerFt * 2);
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
 * Optimally partitions pieces across 2 parallel lanes in a 54" pano
 * to minimize max(sum(lane1), sum(lane2)).
 */
export function packIntoTwoLanes(pieces) {
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

export const packTekoIntoTwoLanes = packIntoTwoLanes;

/**
 * Calculates total Kapad (fabric) meters for Full Sofa making/reupholstery.
 */
export function calculateKapad(sections, handleCount, options = {}) {
  const tekoMode = options.tekoMode || 'normal';
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
      // 'lounger' bethak uses +12" allowance; 'straight' bethak uses +5"
      const seatFt = Math.max(0, num(sec.seatFt));
      const bethakAllowance =
        sec.type === 'lounger'
          ? LOUNGER_BETHAK_ALLOWANCE_INCHES
          : BETHAK_ALLOWANCE_INCHES;
      if (seatFt > 0) {
        const baseIn = round2(seatFt * 12);
        const cutIn = round2(baseIn + bethakAllowance);
        const meters = round2(cutIn / INCHES_PER_METER);
        bethakItems.push({
          id: `${sec.id}-b`,
          label: `${label} (${seatFt} ફૂટ)`,
          baseInches: baseIn,
          allowance: bethakAllowance,
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
  const tekoPacked = packIntoTwoLanes(tekoPieces);
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
 * Calculates Kapad (fabric) meters specifically for Sofa Covers (Cases 1, 2, and 3).
 */
export function calculateCoverKapad(sections, handleCount, options = {}) {
  const coverSubType = options.coverSubType === 'sponge' ? 'sponge' : 'simple';
  const coverSeatCase = options.coverSeatCase === 'wide28' ? 'wide28' : 'regular24';
  const handleBaseInches = Math.max(
    0,
    num(options.handleInches !== undefined && options.handleInches !== '' ? options.handleInches : COVER_DEFAULT_HANDLE_INCHES)
  );

  const bethakAllowance =
    coverSubType === 'sponge'
      ? COVER_BETHAK_SPONGE_ALLOWANCE
      : COVER_BETHAK_SIMPLE_ALLOWANCE;
  const tekoAllowance = COVER_TEKO_ALLOWANCE;
  const loungerAllowance =
    coverSubType === 'sponge'
      ? COVER_LOUNGER_SPONGE_ALLOWANCE
      : COVER_LOUNGER_SIMPLE_ALLOWANCE;
  const handleCutInches = round2(handleBaseInches + COVER_HANDLE_ALLOWANCE);

  // Handles (always 2-in-pano)
  const handles = Math.max(0, num(handleCount));
  const handlePieces = Array.from({ length: handles }, (_, i) => ({
    id: `h-${i + 1}`,
    label: `હેન્ડલ ${i + 1}`,
    baseInches: handleBaseInches,
    allowance: COVER_HANDLE_ALLOWANCE,
    totalInches: handleCutInches,
  }));
  const handlePacked = packIntoTwoLanes(handlePieces);
  const handleMeters = handlePacked.meters;

  const hasLounger = (sections || []).some((s) => s.type === 'lounger');

  // Collect pieces for non-lounger & lounger sections
  const bethakPieces = [];
  const tekoPieces = [];
  const loungerItems = [];

  (sections || []).forEach((sec, idx) => {
    const label = sec.label || `સોફો ${idx + 1}`;
    if (sec.type === 'lounger') {
      const seatFt = Math.max(0, num(sec.seatFt));
      if (seatFt > 0) {
        const baseIn = round2(seatFt * 12);
        const totalIn = round2(baseIn + loungerAllowance);
        loungerItems.push({
          id: `${sec.id}-lng`,
          label: `${label} (${seatFt} ફૂટ)`,
          baseInches: baseIn,
          allowance: loungerAllowance,
          totalInches: totalIn,
          meters: round2(totalIn / INCHES_PER_METER),
        });
      }
      return;
    }

    if (sec.type === 'l_corner') {
      const mainFt = Math.max(0, num(sec.mainFt));
      const cornerFt = Math.max(0, num(sec.cornerFt));
      if (mainFt > 0) {
        const baseIn = round2(mainFt * 12);
        bethakPieces.push({
          id: `${sec.id}-cb`,
          label: `${label} (${mainFt} ફૂટ)`,
          baseInches: baseIn,
          allowance: bethakAllowance,
          totalInches: round2(baseIn + bethakAllowance),
        });
        tekoPieces.push({
          id: `${sec.id}-ctm`,
          label: `${label} - મોટો ભાગ (${mainFt} ફૂટ)`,
          baseInches: baseIn,
          allowance: tekoAllowance,
          totalInches: round2(baseIn + tekoAllowance),
        });
      }
      if (cornerFt > 0) {
        const cornerIn = round2(cornerFt * 12);
        tekoPieces.push({
          id: `${sec.id}-ctc`,
          label: `${label} - ખૂણિયો (${cornerFt} ફૂટ)`,
          baseInches: cornerIn,
          allowance: tekoAllowance,
          totalInches: round2(cornerIn + tekoAllowance),
        });
      }
      return;
    }

    // 'straight'
    const seatFt = Math.max(0, num(sec.seatFt));
    if (seatFt > 0) {
      const baseIn = round2(seatFt * 12);
      bethakPieces.push({
        id: `${sec.id}-cb`,
        label: `${label} (${seatFt} ફૂટ)`,
        baseInches: baseIn,
        allowance: bethakAllowance,
        totalInches: round2(baseIn + bethakAllowance),
      });
      tekoPieces.push({
        id: `${sec.id}-ct`,
        label: `${label} (${seatFt} ફૂટ)`,
        baseInches: baseIn,
        allowance: tekoAllowance,
        totalInches: round2(baseIn + tekoAllowance),
      });
    }
  });

  // Case 3: Lounger layout
  if (hasLounger) {
    const bethakSum = round2(bethakPieces.reduce((s, p) => s + p.totalInches, 0));
    const tekoSum = round2(tekoPieces.reduce((s, p) => s + p.totalInches, 0));
    const pairedMaxInches = Math.max(bethakSum, tekoSum);
    const pairedMeters = round2(pairedMaxInches / INCHES_PER_METER);

    const totalLoungerInches = loungerItems.reduce((s, p) => s + p.totalInches, 0);
    const loungerMeters = round2(totalLoungerInches / INCHES_PER_METER);

    const totalMeters = round2(pairedMeters + loungerMeters + handleMeters);

    return {
      activeCase: 'case3_lounger',
      coverSubType,
      bethakAllowance,
      tekoAllowance,
      loungerAllowance,
      handleBaseInches,
      handleCutInches,
      bethakPieces,
      tekoPieces,
      bethakSum,
      tekoSum,
      pairedMaxInches,
      pairedMeters,
      loungerItems,
      loungerMeters,
      handleCount: handles,
      handlePacked,
      handleMeters,
      totalMeters,
    };
  }

  // Case 2: Wide Bethak (25"–28") -> Bethak in Lane 1, Teko in Lane 2
  if (coverSeatCase === 'wide28') {
    const bethakSum = round2(bethakPieces.reduce((s, p) => s + p.totalInches, 0));
    const tekoSum = round2(tekoPieces.reduce((s, p) => s + p.totalInches, 0));
    const pairedMaxInches = Math.max(bethakSum, tekoSum);
    const pairedMeters = round2(pairedMaxInches / INCHES_PER_METER);
    const totalMeters = round2(pairedMeters + handleMeters);

    return {
      activeCase: 'case2_wide28',
      coverSubType,
      bethakAllowance,
      tekoAllowance,
      handleBaseInches,
      handleCutInches,
      bethakPieces,
      tekoPieces,
      bethakSum,
      tekoSum,
      pairedMaxInches,
      pairedMeters,
      handleCount: handles,
      handlePacked,
      handleMeters,
      totalMeters,
    };
  }

  // Case 1: Regular Bethak (<= 24") -> Separate 2-in-pano for Bethak, Teko, Handles
  const bethakPacked = packIntoTwoLanes(bethakPieces);
  const tekoPacked = packIntoTwoLanes(tekoPieces);
  const totalMeters = round2(
    bethakPacked.meters + tekoPacked.meters + handleMeters
  );

  return {
    activeCase: 'case1_regular24',
    coverSubType,
    bethakAllowance,
    tekoAllowance,
    handleBaseInches,
    handleCutInches,
    bethakPacked,
    bethakMeters: bethakPacked.meters,
    tekoPacked,
    tekoMeters: tekoPacked.meters,
    handleCount: handles,
    handlePacked,
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
 */
export function calculateAllMaterials(sections, handleCount, options = {}) {
  const kapad = calculateKapad(sections, handleCount, options);
  const coverKapad = calculateCoverKapad(sections, handleCount, options);
  const totalSofaFeet = calculateTotalSofaFeet(sections, handleCount);

  return {
    totalSofaFeet,
    kapad,
    coverKapad,
  };
}
