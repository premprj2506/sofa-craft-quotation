export const CURTAIN_CONFIG = {
  eyelet: {
    id: 'eyelet',
    name: 'આઇલેટ પડદા',
    englishName: 'Eyelet Curtains',
    fullness: 2,
    fields: [
      { key: 'pipeRate', label: 'પાઇપ નો દર (₹/ફૂટ)', def: 30 },
      { key: 'socketRate', label: 'શોકેટ જોડી નો ભાવ (₹)', def: 150 },
      { key: 'socketQty', label: 'શોકેટ જોડી સંખ્યા', def: 1 },
      { key: 'beltRate', label: 'બેલ્ટ (₹/ફૂટ)', def: 40 },
      { key: 'panoWidth', label: 'કાપડ નો પનો (ઇંચ)', def: 54 },
      { key: 'fabricRate', label: 'કાપડનો દર (₹/મીટર)', def: 240 },
      { key: 'sewingRate', label: 'સિલાઈ કરવાની મજૂરી (₹/ફૂટ)', def: 60 },
      { key: 'fittingCost', label: 'પડદા લાગવાની મજૂરી (₹)', def: 200 },
    ],
    calc: function (v) {
      const Wft = (v.width || 0) / 12;
      const pipeCost = Wft * (v.pipeRate || 0);
      const socketCost = (v.socketRate || 0) * (v.socketQty || 0);
      const beltFeet = Wft * (v.fullness || 2);
      const beltCost = beltFeet * (v.beltRate || 0);
      const pano = v.panoWidth || 54;
      const panels = Math.ceil(((v.width || 0) * (v.fullness || 2)) / pano);
      const meter = pano > 0 ? (panels * (v.height || 0)) / 39.37 : 0;
      const fabricCost = meter * (v.fabricRate || 0);
      const sewingFeet = Wft * 1.5;
      const sewingCost = sewingFeet * (v.sewingRate || 0);
      const fittingCost = v.fittingCost || 0;
      return [
        { label: 'પાઇપ ખર્ચ', value: pipeCost },
        { label: 'શોકેટ ખર્ચ', value: socketCost },
        { label: 'બેલ્ટ મજૂરી', value: beltCost },
        {
          label: `કાપડ ખર્ચ (${meter.toFixed(2)} મીટર, ${panels} પાટ)`,
          value: fabricCost,
          meter,
          panels,
        },
        { label: 'સિલાઈ મજૂરી', value: sewingCost },
        { label: 'પડદા લાગવાની મજૂરી', value: fittingCost },
      ];
    },
  },
  arabian: {
    id: 'arabian',
    name: 'અરેબિયન પડદા',
    englishName: 'Arabian Curtains',
    fullness: 2,
    fields: [
      { key: 'channelRate', label: 'ચેનલ નો દર (₹/ફૂટ)', def: 200 },
      { key: 'clampRate', label: 'કલેમ્પ નો ભાવ (₹)', def: 50 },
      { key: 'clampQty', label: 'કલેમ્પ સંખ્યા', def: 1 },
      { key: 'beltRate', label: 'બેલ્ટ (₹/ફૂટ)', def: 65 },
      { key: 'panoWidth', label: 'કાપડ નો પનો (ઇંચ)', def: 54 },
      { key: 'fabricRate', label: 'કાપડનો દર (₹/મીટર)', def: 240 },
      { key: 'sewingRate', label: 'સિલાઈ કરવાની મજૂરી (₹/ફૂટ)', def: 60 },
      { key: 'fittingCost', label: 'પડદા લાગવાની મજૂરી (₹)', def: 200 },
    ],
    calc: function (v) {
      const Wft = (v.width || 0) / 12;
      const channelCost = Wft * (v.channelRate || 0);
      const clampCost = (v.clampRate || 0) * (v.clampQty || 0);
      const beltFeet = Wft * (v.fullness || 2);
      const beltCost = beltFeet * (v.beltRate || 0);
      const pano = v.panoWidth || 54;
      const panels = Math.ceil(((v.width || 0) * (v.fullness || 2)) / pano);
      const meter = pano > 0 ? (panels * (v.height || 0)) / 39.37 : 0;
      const fabricCost = meter * (v.fabricRate || 0);
      const sewingFeet = Wft * 1.5;
      const sewingCost = sewingFeet * (v.sewingRate || 0);
      const fittingCost = v.fittingCost || 0;
      return [
        { label: 'ચેનલ ખર્ચ', value: channelCost },
        { label: 'કલેમ્પ ખર્ચ', value: clampCost },
        { label: 'બેલ્ટ મજૂરી', value: beltCost },
        {
          label: `કાપડ ખર્ચ (${meter.toFixed(2)} મીટર, ${panels} પાટ)`,
          value: fabricCost,
          meter,
          panels,
        },
        { label: 'સિલાઈ મજૂરી', value: sewingCost },
        { label: 'પડદા લાગવાની મજૂરી', value: fittingCost },
      ];
    },
  },
  flatPleat: {
    id: 'flatPleat',
    name: 'ચપટીવાળા અરેબિયન પડદા',
    englishName: 'Flat Pleat Arabian Curtains',
    fullness: 2.25,
    fields: [
      { key: 'channelRate', label: 'હેવી ડ્યુટી ચેનલ નો દર (₹/ફૂટ)', def: 220 },
      { key: 'runnerRate', label: 'રનર/કલેમ્પ નો ભાવ (₹)', def: 55 },
      { key: 'runnerQty', label: 'રનર/કલેમ્પ સંખ્યા', def: 1 },
      { key: 'beltRate', label: 'સ્પેશિયલ ફ્લેટ પ્લીટ બેલ્ટ મજૂરી (₹/ફૂટ)', def: 75 },
      { key: 'panoWidth', label: 'કાપડ નો પનો (ઇંચ)', def: 54 },
      { key: 'fabricRate', label: 'કાપડનો દર (₹/મીટર)', def: 240 },
      { key: 'sewingRate', label: 'પ્રીમિયમ સિલાઈ મજૂરી (₹/ફૂટ)', def: 25 },
      { key: 'fittingCost', label: 'ઇન્સ્ટોલેશન મજૂરી (₹)', def: 250 },
    ],
    calc: function (v) {
      const Wft = (v.width || 0) / 12;
      const channelCost = Wft * (v.channelRate || 0);
      const runnerCost = (v.runnerRate || 0) * (v.runnerQty || 0);
      const beltFeet = Wft * (v.fullness || 2.25);
      const beltCost = beltFeet * (v.beltRate || 0);
      const pano = v.panoWidth || 54;
      const panels = Math.ceil(((v.width || 0) * (v.fullness || 2.25)) / pano);
      const meter = pano > 0 ? (panels * (v.height || 0)) / 39.37 : 0;
      const fabricCost = meter * (v.fabricRate || 0);
      const sewingFeet = Wft * 1.5;
      const sewingCost = sewingFeet * (v.sewingRate || 0);
      const fittingCost = v.fittingCost || 0;
      return [
        { label: 'હેવી ડ્યુટી ચેનલ ખર્ચ', value: channelCost },
        { label: 'રનર/કલેમ્પ ખર્ચ', value: runnerCost },
        { label: 'સ્પેશિયલ બેલ્ટ મજૂરી', value: beltCost },
        {
          label: `કાપડ ખર્ચ (${meter.toFixed(2)} મીટર, ${panels} પાટ)`,
          value: fabricCost,
          meter,
          panels,
        },
        { label: 'પ્રીમિયમ સિલાઈ મજૂરી', value: sewingCost },
        { label: 'ઇન્સ્ટોલેશન મજૂરી', value: fittingCost },
      ];
    },
  },
};
