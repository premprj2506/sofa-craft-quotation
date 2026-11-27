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

// 4-Inch Foam Sheet Constants
export const DEFAULT_SEAT_DEPTH_INCHES = 24;
export const DEFAULT_LOUNGER_CORNER_LEN_INCHES = 18;
export const DEFAULT_LOUNGER_CORNER_WIDTH_INCHES = 30;
export const FOAM4_SHEETS = [
  { id: '4x6', label: '4 × 6', sqft: 24 },
  { id: '5x6', label: '5 × 6', sqft: 30 },
  { id: '6x6', label: '6 × 6', sqft: 36 },
];

// 2-Inch Teko Sheet Constants (3 x 6 = 18 sq.ft)
export const DEFAULT_TEKO_HEIGHT_INCHES = 15;
export const FOAM2_SHEET_SQFT = 18;
export const FOAM2_L_SUBTRACT_INCHES = 2;

// 1-Inch Sheet & 15mm Stanzo Constants
export const FOAM1_SHEET_SQFT = 18;
export const FOAM1_BETHAK_WIDTH_INCHES = 36;
export const FOAM1_TEKO_WIDTH_DEFAULT = 22;
export const FOAM1_HANDLE_SHEETS_EACH = 0.5;
export const STANZO_ALLOWANCE_INCHES = 10;

// Fevicol Constants (1 liter per 5 total sofa feet step)
export const FEVICOL_STEP_FEET = 5;

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
 * Calculates 4-inch foam (sponge) area in sq.ft and optimal sheet recommendations (4x6, 5x6, 6x6).
 * - Straight: seatFt * (seatDepthInches / 12)
 * - L-Corner: mainFt * (seatDepthInches / 12)  [corner excluded]
 * - Lounger: (seatIn - cornerLenIn) * seatDepthInches / 144 + (cornerLenIn * cornerWidthIn) / 144
 */
export function calculateFoam4Inch(sections, options = {}) {
  const seatDepthInches = Math.max(
    0,
    num(
      options.seatDepthInches !== undefined && options.seatDepthInches !== ''
        ? options.seatDepthInches
        : DEFAULT_SEAT_DEPTH_INCHES
    )
  );
  const loungerCornerLenInches = Math.max(
    0,
    num(
      options.loungerCornerLenInches !== undefined &&
        options.loungerCornerLenInches !== ''
        ? options.loungerCornerLenInches
        : DEFAULT_LOUNGER_CORNER_LEN_INCHES
    )
  );
  const loungerCornerWidthInches = Math.max(
    0,
    num(
      options.loungerCornerWidthInches !== undefined &&
        options.loungerCornerWidthInches !== ''
        ? options.loungerCornerWidthInches
        : DEFAULT_LOUNGER_CORNER_WIDTH_INCHES
    )
  );

  const seatDepthFt = round2(seatDepthInches / 12);
  const items = [];

  (sections || []).forEach((sec, idx) => {
    const label = sec.label || `સોફો ${idx + 1}`;
    if (sec.type === 'l_corner') {
      const mainFt = Math.max(0, num(sec.mainFt));
      if (mainFt > 0) {
        const sqft = round2(mainFt * seatDepthFt);
        items.push({
          id: `${sec.id}-f4`,
          label: `${label} (${mainFt}' × ${seatDepthFt}')`,
          lengthFt: mainFt,
          widthFt: seatDepthFt,
          sqft,
        });
      }
      return;
    }

    if (sec.type === 'lounger') {
      const seatFt = Math.max(0, num(sec.seatFt));
      if (seatFt > 0) {
        const seatIn = round2(seatFt * 12);
        const cornerIn = Math.min(seatIn, loungerCornerLenInches);
        const backIn = Math.max(0, round2(seatIn - cornerIn));
        const backSqft = round2((backIn * seatDepthInches) / 144);
        const cornerSqft = round2(
          (cornerIn * loungerCornerWidthInches) / 144
        );
        const totalSectionSqft = round2(backSqft + cornerSqft);

        items.push({
          id: `${sec.id}-f4`,
          label: `${label} (${seatFt}')`,
          isLounger: true,
          backIn,
          cornerIn,
          backDetail: `${round2(backIn / 12)}' × ${seatDepthFt}' = ${backSqft} ft`,
          cornerDetail: `${round2(cornerIn / 12)}' × ${round2(
            loungerCornerWidthInches / 12
          )}' = ${cornerSqft} ft`,
          backSqft,
          cornerSqft,
          sqft: totalSectionSqft,
        });
      }
      return;
    }

    const seatFt = Math.max(0, num(sec.seatFt));
    if (seatFt > 0) {
      const sqft = round2(seatFt * seatDepthFt);
      items.push({
        id: `${sec.id}-f4`,
        label: `${label} (${seatFt}' × ${seatDepthFt}')`,
        lengthFt: seatFt,
        widthFt: seatDepthFt,
        sqft,
      });
    }
  });

  const totalSqft = round2(items.reduce((sum, it) => sum + it.sqft, 0));

  const sheetOptions = FOAM4_SHEETS.map((sh) => {
    const sheetsNeeded = totalSqft > 0 ? Math.ceil(totalSqft / sh.sqft) : 0;
    const totalSheetSqft = sheetsNeeded * sh.sqft;
    const wasteSqft = round2(Math.max(0, totalSheetSqft - totalSqft));
    return {
      ...sh,
      sheetsNeeded,
      totalSheetSqft,
      wasteSqft,
    };
  });

  const recommendedSheet =
    totalSqft > 0
      ? [...sheetOptions].sort(
          (a, b) =>
            a.wasteSqft - b.wasteSqft ||
            a.sheetsNeeded - b.sheetsNeeded ||
            a.sqft - b.sqft
        )[0]
      : sheetOptions[0];

  return {
    seatDepthInches,
    seatDepthFt,
    loungerCornerLenInches,
    loungerCornerWidthInches,
    items,
    totalSqft,
    sheetOptions,
    recommendedSheet,
  };
}

/**
 * Calculates 2-inch foam (teko sheet 3x6 = 18 sq.ft) in sq.ft and sheets needed.
 * - Straight: exact seatFt * 12
 * - L-Corner: (mainFt * 12 - 2) and (cornerFt * 12 - 2)
 * - Lounger: (seatFt * 12 - loungerCornerLenInches)
 */
export function calculateFoam2Inch(sections, options = {}) {
  const tekoHeightInches = Math.max(
    0,
    num(
      options.tekoHeightInches !== undefined && options.tekoHeightInches !== ''
        ? options.tekoHeightInches
        : DEFAULT_TEKO_HEIGHT_INCHES
    )
  );
  const loungerCornerLenInches = Math.max(
    0,
    num(
      options.loungerCornerLenInches !== undefined &&
        options.loungerCornerLenInches !== ''
        ? options.loungerCornerLenInches
        : DEFAULT_LOUNGER_CORNER_LEN_INCHES
    )
  );

  const items = [];

  (sections || []).forEach((sec, idx) => {
    const label = sec.label || `સોફો ${idx + 1}`;
    if (sec.type === 'l_corner') {
      const mainFt = Math.max(0, num(sec.mainFt));
      const cornerFt = Math.max(0, num(sec.cornerFt));
      if (mainFt > 0) {
        const cutIn = Math.max(
          0,
          round2(mainFt * 12 - FOAM2_L_SUBTRACT_INCHES)
        );
        const sqft = round2((cutIn * tekoHeightInches) / 144);
        items.push({
          id: `${sec.id}-f2m`,
          label: `${label} - મોટો ભાગ`,
          cutInches: cutIn,
          tekoHeightInches,
          cutLabel: `${cutIn}" × ${tekoHeightInches}"`,
          sqft,
        });
      }
      if (cornerFt > 0) {
        const cutIn = Math.max(
          0,
          round2(cornerFt * 12 - FOAM2_L_SUBTRACT_INCHES)
        );
        const sqft = round2((cutIn * tekoHeightInches) / 144);
        items.push({
          id: `${sec.id}-f2c`,
          label: `${label} - ખૂણિયો`,
          cutInches: cutIn,
          tekoHeightInches,
          cutLabel: `${cutIn}" × ${tekoHeightInches}"`,
          sqft,
        });
      }
      return;
    }

    if (sec.type === 'lounger') {
      const seatFt = Math.max(0, num(sec.seatFt));
      if (seatFt > 0) {
        const cutIn = Math.max(
          0,
          round2(seatFt * 12 - loungerCornerLenInches)
        );
        const sqft = round2((cutIn * tekoHeightInches) / 144);
        items.push({
          id: `${sec.id}-f2l`,
          label: `${label} (ખૂણા વગર)`,
          cutInches: cutIn,
          tekoHeightInches,
          cutLabel: `${cutIn}" × ${tekoHeightInches}"`,
          sqft,
        });
      }
      return;
    }

    const seatFt = Math.max(0, num(sec.seatFt));
    if (seatFt > 0) {
      const cutIn = round2(seatFt * 12);
      const sqft = round2((cutIn * tekoHeightInches) / 144);
      items.push({
        id: `${sec.id}-f2s`,
        label,
        cutInches: cutIn,
        tekoHeightInches,
        cutLabel: `${cutIn}" × ${tekoHeightInches}"`,
        sqft,
      });
    }
  });

  const totalLengthInches = round2(
    items.reduce((sum, it) => sum + it.cutInches, 0)
  );
  const totalSqft = round2((totalLengthInches * tekoHeightInches) / 144);
  const exactSheets = round2(totalSqft / FOAM2_SHEET_SQFT);
  const sheetsNeeded =
    totalSqft > 0 ? Math.ceil(totalSqft / FOAM2_SHEET_SQFT) : 0;
  const totalSheetSqft = sheetsNeeded * FOAM2_SHEET_SQFT;
  const wasteSqft = round2(Math.max(0, totalSheetSqft - totalSqft));

  return {
    tekoHeightInches,
    sheetSqft: FOAM2_SHEET_SQFT,
    items,
    totalLengthInches,
    totalSqft,
    exactSheets,
    sheetsNeeded,
    totalSheetSqft,
    wasteSqft,
  };
}

/**
 * Calculates 1-inch foam sheets (3x6 = 36"x72" = 18 sq.ft), rounded to nearest 0.5 sheet (આખી/અડધી):
 * - Bethak (compulsory): full 36" width * seat length (L-corner main only)
 * - Teko (when simple or bhag; 0 when lining12mm): 22" width (editable) * teko length
 * - Handles (compulsory): 0.5 sheet per handle
 */
export function calculateFoam1Inch(sections, handleCount, options = {}) {
  const tekoMode = options.tekoMode || 'normal';
  const isLining = tekoMode === 'lining12mm';
  const tekoWidthInches = Math.max(
    0,
    num(
      options.foam1TekoWidthInches !== undefined &&
        options.foam1TekoWidthInches !== ''
        ? options.foam1TekoWidthInches
        : FOAM1_TEKO_WIDTH_DEFAULT
    )
  );
  const loungerCornerLenInches = Math.max(
    0,
    num(
      options.loungerCornerLenInches !== undefined &&
        options.loungerCornerLenInches !== ''
        ? options.loungerCornerLenInches
        : DEFAULT_LOUNGER_CORNER_LEN_INCHES
    )
  );

  let bethakTotalInches = 0;
  let tekoTotalInches = 0;

  (sections || []).forEach((sec) => {
    if (sec.type === 'l_corner') {
      const mainFt = Math.max(0, num(sec.mainFt));
      const cornerFt = Math.max(0, num(sec.cornerFt));
      if (mainFt > 0) {
        bethakTotalInches += round2(mainFt * 12);
        if (!isLining) tekoTotalInches += round2(mainFt * 12);
      }
      if (cornerFt > 0 && !isLining) {
        tekoTotalInches += round2(cornerFt * 12);
      }
      return;
    }

    if (sec.type === 'lounger') {
      const seatFt = Math.max(0, num(sec.seatFt));
      if (seatFt > 0) {
        const seatIn = round2(seatFt * 12);
        bethakTotalInches += seatIn;
        if (!isLining) {
          tekoTotalInches += Math.max(0, round2(seatIn - loungerCornerLenInches));
        }
      }
      return;
    }

    const seatFt = Math.max(0, num(sec.seatFt));
    if (seatFt > 0) {
      const seatIn = round2(seatFt * 12);
      bethakTotalInches += seatIn;
      if (!isLining) tekoTotalInches += seatIn;
    }
  });

  bethakTotalInches = round2(bethakTotalInches);
  tekoTotalInches = round2(tekoTotalInches);

  const bethakSqft = round2(
    (bethakTotalInches * FOAM1_BETHAK_WIDTH_INCHES) / 144
  );
  const bethakSheetsRaw = round2(bethakSqft / FOAM1_SHEET_SQFT);

  const tekoSqft = isLining
    ? 0
    : round2((tekoTotalInches * tekoWidthInches) / 144);
  const tekoSheetsRaw = isLining ? 0 : round2(tekoSqft / FOAM1_SHEET_SQFT);

  const handles = Math.max(0, num(handleCount));
  const handleSheetsRaw = round2(handles * FOAM1_HANDLE_SHEETS_EACH);

  const rawTotalSheets = round2(
    bethakSheetsRaw + tekoSheetsRaw + handleSheetsRaw
  );
  const totalSheets =
    rawTotalSheets > 0
      ? Math.ceil(rawTotalSheets * 2 - 1e-9) / 2
      : 0;

  return {
    isLining,
    bethakWidthInches: FOAM1_BETHAK_WIDTH_INCHES,
    tekoWidthInches,
    bethakTotalInches,
    tekoTotalInches,
    bethakSqft,
    tekoSqft,
    bethakSheetsRaw,
    tekoSheetsRaw,
    handleCount: handles,
    handleSheetsRaw,
    rawTotalSheets,
    totalSheets,
  };
}

/**
 * Calculates 15mm Stanzo (54" pano, 2-lane packing, +10" per teko piece)
 * used only when tekoMode === 'lining12mm'.
 */
export function calculateStanzo(sections, options = {}) {
  const active = options.tekoMode === 'lining12mm';
  if (!active) {
    return {
      active: false,
      allowance: STANZO_ALLOWANCE_INCHES,
      pieces: [],
      packed: packIntoTwoLanes([]),
      meters: 0,
    };
  }

  const loungerCornerLenInches = Math.max(
    0,
    num(
      options.loungerCornerLenInches !== undefined &&
        options.loungerCornerLenInches !== ''
        ? options.loungerCornerLenInches
        : DEFAULT_LOUNGER_CORNER_LEN_INCHES
    )
  );

  const pieces = [];
  (sections || []).forEach((sec, idx) => {
    const label = sec.label || `સોફો ${idx + 1}`;
    if (sec.type === 'l_corner') {
      const mainFt = Math.max(0, num(sec.mainFt));
      const cornerFt = Math.max(0, num(sec.cornerFt));
      if (mainFt > 0) {
        const baseIn = round2(mainFt * 12);
        pieces.push({
          id: `${sec.id}-sm`,
          label: `${label} - મોટો ભાગ (${mainFt}')`,
          baseInches: baseIn,
          allowance: STANZO_ALLOWANCE_INCHES,
          totalInches: round2(baseIn + STANZO_ALLOWANCE_INCHES),
        });
      }
      if (cornerFt > 0) {
        const cornerIn = round2(cornerFt * 12);
        pieces.push({
          id: `${sec.id}-sc`,
          label: `${label} - ખૂણિયો (${cornerFt}')`,
          baseInches: cornerIn,
          allowance: STANZO_ALLOWANCE_INCHES,
          totalInches: round2(cornerIn + STANZO_ALLOWANCE_INCHES),
        });
      }
      return;
    }

    if (sec.type === 'lounger') {
      const seatFt = Math.max(0, num(sec.seatFt));
      if (seatFt > 0) {
        const baseIn = Math.max(
          0,
          round2(seatFt * 12 - loungerCornerLenInches)
        );
        pieces.push({
          id: `${sec.id}-sl`,
          label: `${label} (ખૂણા વગર)`,
          baseInches: baseIn,
          allowance: STANZO_ALLOWANCE_INCHES,
          totalInches: round2(baseIn + STANZO_ALLOWANCE_INCHES),
        });
      }
      return;
    }

    const seatFt = Math.max(0, num(sec.seatFt));
    if (seatFt > 0) {
      const baseIn = round2(seatFt * 12);
      pieces.push({
        id: `${sec.id}-ss`,
        label: `${label} (${seatFt}')`,
        baseInches: baseIn,
        allowance: STANZO_ALLOWANCE_INCHES,
        totalInches: round2(baseIn + STANZO_ALLOWANCE_INCHES),
      });
    }
  });

  const packed = packIntoTwoLanes(pieces);
  return {
    active: true,
    allowance: STANZO_ALLOWANCE_INCHES,
    pieces,
    packed,
    meters: packed.meters,
  };
}

/**
 * Calculates Fevicol quantity in liters based on total sofa feet (1 liter per 5 feet step).
 */
export function calculateFevicol(totalSofaFeet) {
  const totalFeet = Math.max(0, num(totalSofaFeet));
  const liters =
    totalFeet > 0 ? Math.ceil(totalFeet / FEVICOL_STEP_FEET - 1e-9) : 0;

  return {
    totalFeet,
    stepFeet: FEVICOL_STEP_FEET,
    liters,
  };
}

/**
 * Main extensible material calculation entry point.
 */
export function calculateAllMaterials(sections, handleCount, options = {}) {
  const kapad = calculateKapad(sections, handleCount, options);
  const coverKapad = calculateCoverKapad(sections, handleCount, options);
  const foam4 = calculateFoam4Inch(sections, options);
  const foam2 = calculateFoam2Inch(sections, options);
  const foam1 = calculateFoam1Inch(sections, handleCount, options);
  const stanzo = calculateStanzo(sections, options);
  const totalSofaFeet = calculateTotalSofaFeet(sections, handleCount);
  const fevicol = calculateFevicol(totalSofaFeet);

  return {
    totalSofaFeet,
    kapad,
    coverKapad,
    foam4,
    foam2,
    foam1,
    stanzo,
    fevicol,
  };
}
