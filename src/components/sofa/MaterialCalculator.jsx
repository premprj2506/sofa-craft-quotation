import { useState } from 'react';
import {
  generatePresetSections,
  calculateAllMaterials,
  INCHES_PER_METER,
  COVER_DEFAULT_HANDLE_INCHES,
  COVER_HANDLE_ALLOWANCE,
  DEFAULT_SEAT_DEPTH_INCHES,
  DEFAULT_LOUNGER_CORNER_LEN_INCHES,
  DEFAULT_LOUNGER_CORNER_WIDTH_INCHES,
  DEFAULT_TEKO_HEIGHT_INCHES,
  FOAM1_TEKO_WIDTH_DEFAULT,
} from '../../utils/sofaMaterialCalculator';
import { generateId } from '../../utils/id';
import { num } from '../../utils/formatters';
import {
  buildKarigarWhatsAppMessage,
  shareOnWhatsApp,
} from '../../utils/whatsappShare';
import { exportKarigarPDF } from '../../utils/pdfExport';
import SofaLayoutDiagram from './SofaLayoutDiagram';
import MobileStickyBar from '../common/MobileStickyBar';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  RulerIcon,
  SofaIcon,
  PlusIcon,
  RestoreIcon,
  PrintIcon,
  WhatsAppIcon,
} from '../common/Icons';

const TEKO_MODES = [
  { id: 'normal', label: 'સાદો ટેકો (+12")' },
  { id: 'bhag', label: 'ભાગ વાળો ટેકો (+12")' },
  { id: 'lining12mm', label: '12mm લાઇનિંગ (+17")' },
];

const SHAPES = [
  { id: 'single_straight', label: 'સીધો સિંગલ સોફો', desc: '૧ સીધો + ૨ હેન્ડલ' },
  { id: 'straight', label: 'સીધા બે સોફા', desc: '૨ સીધા + ૪ હેન્ડલ' },
  { id: 'l_shape', label: 'L-આકાર સોફો', desc: 'L-સોફો + સીધો + ૨ હેન્ડલ' },
  { id: 'l_lounger', label: 'L-આકાર લોન્જર વાળો', desc: 'L-સોફો + લોન્જર + ૧ હેન્ડલ' },
  { id: 'c_shape', label: 'C-આકાર સોફો', desc: 'ડાબી L + વચ્ચે + જમણી L' },
];

export default function MaterialCalculator({
  onBackToHome,
  onTransferToQuote,
  settings,
  showToast,
}) {
  // Purpose: 'full_sofa' (આખો સોફો બનાવવા) | 'sofa_cover' (સોફા ના કવર માટે)
  const [purpose, setPurpose] = useState('full_sofa');
  const [mode, setMode] = useState('total'); // 'total' | 'manual'
  const [totalFeet, setTotalFeet] = useState(16);
  const [shape, setShape] = useState('straight');

  // Full Sofa options (Teko + 4" Foam depth & lounger corner)
  const [tekoMode, setTekoMode] = useState('normal');
  const [seatDepthInches, setSeatDepthInches] = useState(
    DEFAULT_SEAT_DEPTH_INCHES
  );
  const [loungerCornerLenInches, setLoungerCornerLenInches] = useState(
    DEFAULT_LOUNGER_CORNER_LEN_INCHES
  );
  const [loungerCornerWidthInches, setLoungerCornerWidthInches] = useState(
    DEFAULT_LOUNGER_CORNER_WIDTH_INCHES
  );
  const [tekoHeightInches, setTekoHeightInches] = useState(
    DEFAULT_TEKO_HEIGHT_INCHES
  );
  const [foam1TekoWidthInches, setFoam1TekoWidthInches] = useState(
    FOAM1_TEKO_WIDTH_DEFAULT
  );

  // Sofa Cover options
  const [coverSubType, setCoverSubType] = useState('simple'); // 'simple' | 'sponge'
  const [coverSeatCase, setCoverSeatCase] = useState('regular24'); // 'regular24' | 'wide28'
  const [handleInches, setHandleInches] = useState(COVER_DEFAULT_HANDLE_INCHES);

  const initialPreset = generatePresetSections(16, 'straight');
  const [sections, setSections] = useState(initialPreset.sections);
  const [handleCount, setHandleCount] = useState(initialPreset.handleCount);

  const handleTotalFeetChange = (val) => {
    const parsed = val === '' ? '' : Number(val);
    setTotalFeet(parsed);
    if (parsed !== '' && !isNaN(parsed)) {
      const preset = generatePresetSections(parsed, shape);
      setSections(preset.sections);
      setHandleCount(preset.handleCount);
    }
  };

  const handleShapeChange = (newShape) => {
    setShape(newShape);
    const defaultFeet =
      newShape === 'c_shape' ? 23 : newShape === 'single_straight' ? 10 : 16;
    const feet = num(totalFeet) || defaultFeet;
    if (!totalFeet) setTotalFeet(feet);
    const preset = generatePresetSections(feet, newShape);
    setSections(preset.sections);
    setHandleCount(preset.handleCount);
  };

  const applyQuickExample = (feet, targetShape) => {
    setMode('total');
    setTotalFeet(feet);
    setShape(targetShape);
    const preset = generatePresetSections(feet, targetShape);
    setSections(preset.sections);
    setHandleCount(preset.handleCount);
  };

  const handleSectionUpdate = (id, key, val) => {
    const parsed = val === '' ? '' : Number(val);
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== id) return sec;
        if (key === 'type') {
          if (val === 'l_corner') {
            return {
              id: sec.id,
              type: 'l_corner',
              label: sec.label,
              mainFt: sec.seatFt || 6,
              cornerFt: 2.5,
            };
          }
          if (val === 'lounger') {
            return {
              id: sec.id,
              type: 'lounger',
              label: sec.label,
              seatFt: sec.mainFt || sec.seatFt || 5.5,
            };
          }
          return {
            id: sec.id,
            type: 'straight',
            label: sec.label,
            seatFt: sec.mainFt || sec.seatFt || 6,
          };
        }
        return {
          ...sec,
          [key]: key === 'label' ? val : isNaN(parsed) ? 0 : parsed,
        };
      })
    );
  };

  const handleManualCountChange = (countVal) => {
    const targetCount = Math.max(0, Math.min(12, parseInt(countVal, 10) || 0));
    setSections((prev) => {
      if (targetCount === prev.length) return prev;
      if (targetCount < prev.length) return prev.slice(0, targetCount);
      const added = [];
      for (let i = prev.length; i < targetCount; i++) {
        added.push({
          id: `${generateId()}-${i}`,
          type: 'straight',
          label: `સોફો ${i + 1}`,
          seatFt: 6,
        });
      }
      return [...prev, ...added];
    });
  };

  const addManualSection = (type) => {
    const nextIdx = sections.length + 1;
    let newSec;
    if (type === 'l_corner') {
      newSec = {
        id: `${generateId()}-${nextIdx}`,
        type: 'l_corner',
        label: `L-સોફો ${nextIdx}`,
        mainFt: 6,
        cornerFt: 2.5,
      };
    } else if (type === 'lounger') {
      newSec = {
        id: `${generateId()}-${nextIdx}`,
        type: 'lounger',
        label: `લોન્જર ${nextIdx}`,
        seatFt: 5.5,
      };
    } else {
      newSec = {
        id: `${generateId()}-${nextIdx}`,
        type: 'straight',
        label: `સોફો ${nextIdx}`,
        seatFt: 6,
      };
    }
    setSections((prev) => [...prev, newSec]);
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const result = calculateAllMaterials(sections, handleCount, {
    tekoMode,
    coverSubType,
    coverSeatCase,
    handleInches,
    seatDepthInches,
    loungerCornerLenInches,
    loungerCornerWidthInches,
    tekoHeightInches,
    foam1TekoWidthInches,
  });

  const { kapad, coverKapad, foam4, foam2, foam1, stanzo, fevicol, totalSofaFeet } = result;
  const { tekoPacked } = kapad;
  const hasLounger = sections.some((s) => s.type === 'lounger');

  const tekoModeLabel =
    TEKO_MODES.find((t) => t.id === tekoMode)?.label || '';

  const buildKarigarParams = () => ({
    purpose,
    sections,
    handleCount: num(handleCount),
    totalSofaFeet,
    kapad,
    coverKapad,
    foam4,
    foam2,
    foam1,
    stanzo,
    fevicol,
    tekoModeLabel,
    settings,
  });

  const handleKarigarWhatsApp = () => {
    const message = buildKarigarWhatsAppMessage(buildKarigarParams());
    shareOnWhatsApp({ phone: '', message, showToast });
  };

  const handleKarigarPDF = () => {
    exportKarigarPDF(buildKarigarParams(), showToast);
  };

  return (
    <div>
      {/* Print-Only Header for Karigar Cutting Sheet */}
      <div className="print-only-header">
        <h2>{settings?.shopName || 'Sofa Craft'} — કારીગર કટિંગ શીટ</h2>
        <p>
          કામ:{' '}
          {purpose === 'sofa_cover'
            ? `સોફા ના કવર (${coverSubType === 'sponge' ? 'સ્પંચવાળા' : 'સાદા'})`
            : 'આખો સોફો (54" પનો)'}{' '}
          · કુલ માપ: {totalSofaFeet} ફૂટ · હેન્ડલ: {num(handleCount)} નંગ
        </p>
      </div>
      <div className="form-header no-print">
        <button
          type="button"
          className="back-btn"
          onClick={onBackToHome}
          title="પાછા જાઓ"
        >
          <ArrowLeftIcon size={18} />
        </button>
        <div>
          <h2 className="form-title">સોફા મટિરિયલ કેલ્ક્યુલેટર</h2>
        </div>
        <span className="form-badge teal">
          <RulerIcon size={14} />
          <span>54" પનો · 1m = 39"</span>
        </span>
      </div>

      {/* Top Purpose Selector: Full Sofa vs Sofa Cover */}
      <div className="form-card no-print">
        <div className="form-section-title">તમે શેનું કાપડ ગણવા માંગો છો?</div>
        <div className="tab-group" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`tab ${purpose === 'full_sofa' ? 'active' : ''}`}
            onClick={() => setPurpose('full_sofa')}
          >
            આખો સોફો બનાવવા માટે
          </button>
          <button
            type="button"
            className={`tab ${purpose === 'sofa_cover' ? 'active' : ''}`}
            onClick={() => setPurpose('sofa_cover')}
          >
            સોફા ના કવર માટે (સાદા / સ્પંચવાળા)
          </button>
        </div>
      </div>

      <div className="workspace-grid">
        {/* Left Column: Controls & Dimensions */}
        <div className="workspace-main">
          <div className="form-card no-print">
            <div className="form-section-title">માપ દાખલ કરવાની રીત પસંદ કરો</div>
            <div className="tab-group" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`tab ${mode === 'total' ? 'active' : ''}`}
                onClick={() => setMode('total')}
              >
                કુલ ફૂટ પ્રમાણે (આકાર મુજબ)
              </button>
              <button
                type="button"
                className={`tab ${mode === 'manual' ? 'active' : ''}`}
                onClick={() => setMode('manual')}
              >
                મેન્યુઅલ માપ (એક-એક સોફા)
              </button>
            </div>
          </div>

          {mode === 'total' && (
            <div className="form-card no-print">
              <div className="form-section-title">૧. કુલ ફૂટ અને સોફાનો આકાર</div>
              <div className="form-row">
                <div className="form-group">
                  <label>કુલ સોફા ફૂટ (Total Feet)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={totalFeet}
                    placeholder="દા.ત. 16 અથવા 23"
                    onChange={(e) => handleTotalFeetChange(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>ગણેલ કુલ ફૂટ (સોફા + હેન્ડલ)</label>
                  <div className="calc-result">{totalSofaFeet} ફૂટ</div>
                </div>
              </div>

              <div className="shape-selector-grid">
                {SHAPES.map((s) => (
                  <div
                    key={s.id}
                    className={`shape-option ${shape === s.id ? 'selected' : ''}`}
                    onClick={() => handleShapeChange(s.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleShapeChange(s.id);
                    }}
                  >
                    <div className="shape-icon-svg">
                      <SofaIcon size={22} />
                    </div>
                    <div className="shape-title">{s.label}</div>
                    <div className="shape-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'manual' && (
            <div className="form-card no-print">
              <div className="form-section-title">૧. સોફાની સંખ્યા અને પ્રકાર</div>
              <div className="form-row" style={{ alignItems: 'end' }}>
                <div className="form-group">
                  <label>કેટલા સોફા / ભાગ છે? (સંખ્યા)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={sections.length}
                    onChange={(e) => handleManualCountChange(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '9px 12px', fontSize: '13px' }}
                    onClick={() => addManualSection('straight')}
                  >
                    <PlusIcon size={15} />
                    <span>સીધો</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '9px 12px', fontSize: '13px' }}
                    onClick={() => addManualSection('l_corner')}
                  >
                    <PlusIcon size={15} />
                    <span>L-આકાર</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '9px 12px', fontSize: '13px' }}
                    onClick={() => addManualSection('lounger')}
                  >
                    <PlusIcon size={15} />
                    <span>લોન્જર</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="form-card no-print">
            <div className="form-section-title">
              ૨. દરેક ભાગનું માપ અને હેન્ડલ
            </div>

            <div className="sections-list">
              {sections.map((sec, idx) => (
                <div key={sec.id} className="section-editor-card">
                  <div className="sec-editor-head">
                    <span className="sec-num">ભાગ {idx + 1}</span>
                    <input
                      type="text"
                      className="sec-name-input"
                      value={sec.label}
                      onChange={(e) =>
                        handleSectionUpdate(sec.id, 'label', e.target.value)
                      }
                    />
                    <div className="tab-group" style={{ margin: 0 }}>
                      <button
                        type="button"
                        className={`tab ${sec.type === 'straight' ? 'active' : ''}`}
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleSectionUpdate(sec.id, 'type', 'straight')}
                      >
                        સીધો
                      </button>
                      <button
                        type="button"
                        className={`tab ${sec.type === 'l_corner' ? 'active' : ''}`}
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleSectionUpdate(sec.id, 'type', 'l_corner')}
                      >
                        L-આકાર
                      </button>
                      <button
                        type="button"
                        className={`tab ${sec.type === 'lounger' ? 'active' : ''}`}
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleSectionUpdate(sec.id, 'type', 'lounger')}
                      >
                        લોન્જર
                      </button>
                    </div>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon-del"
                        onClick={() => removeSection(sec.id)}
                        title="આ ભાગ દૂર કરો"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {sec.type === 'l_corner' ? (
                    <div className="form-row" style={{ marginBottom: 0 }}>
                      <div className="form-group">
                        <label>મોટો ભાગ (ફૂટ)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={sec.mainFt}
                          onChange={(e) =>
                            handleSectionUpdate(sec.id, 'mainFt', e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>ખૂણિયો (ફૂટ · સામાન્ય 2.5)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={sec.cornerFt}
                          onChange={(e) =>
                            handleSectionUpdate(sec.id, 'cornerFt', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="form-row single" style={{ marginBottom: 0 }}>
                      <div className="form-group">
                        <label>
                          {sec.type === 'lounger'
                            ? 'લોન્જર લંબાઈ (ફૂટ · દા.ત. 5.5)'
                            : 'બેઠક / સીટ લંબાઈ (ફૂટ)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={sec.seatFt}
                          onChange={(e) =>
                            handleSectionUpdate(sec.id, 'seatFt', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="form-row" style={{ marginTop: '14px', marginBottom: 0 }}>
              <div className="form-group">
                <label>
                  {purpose === 'full_sofa'
                    ? 'કુલ હેન્ડલ (નંગ · 1 હેન્ડલ = 1 મીટર)'
                    : 'કુલ હેન્ડલ (નંગ · પનામાંથી 2 થાય)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={handleCount}
                  onChange={(e) =>
                    setHandleCount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </div>
              <div className="form-group">
                <label>કુલ સોફા માપ</label>
                <div className="calc-result">{totalSofaFeet} ફૂટ</div>
              </div>
            </div>

            {/* Full Sofa Teko & 4" Foam Options vs Sofa Cover Options */}
            {purpose === 'full_sofa' ? (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="sub-label">
                    ટેકાની ડિઝાઇન (વધારો નક્કી કરવા માટે):
                  </label>
                  <div className="tab-group" style={{ marginBottom: 0 }}>
                    {TEKO_MODES.map((tm) => (
                      <button
                        key={tm.id}
                        type="button"
                        className={`tab ${tekoMode === tm.id ? 'active' : ''}`}
                        onClick={() => setTekoMode(tm.id)}
                      >
                        {tm.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom: 0 }}>
                  <div className="form-group">
                    <label>
                      4" સ્પંચ · બેઠક પહોળાઈ (ઇંચ · {foam4.seatDepthFt}')
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={seatDepthInches}
                      onChange={(e) =>
                        setSeatDepthInches(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      2" ટેકો સીટ · ઊંચાઈ (ઇંચ · ડિફોલ્ટ {DEFAULT_TEKO_HEIGHT_INCHES}")
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={tekoHeightInches}
                      onChange={(e) =>
                        setTekoHeightInches(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>

                {tekoMode !== 'lining12mm' && (
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group">
                      <label>
                        1" ટેકો પટ્ટો પહોળાઈ (ઇંચ · ડિફોલ્ટ {FOAM1_TEKO_WIDTH_DEFAULT}")
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={foam1TekoWidthInches}
                        onChange={(e) =>
                          setFoam1TekoWidthInches(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>1" બેઠક પહોળાઈ (ફિક્સ)</label>
                      <div className="calc-result">36" (પૂરી સીટ)</div>
                    </div>
                  </div>
                )}

                {hasLounger && (
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group">
                      <label>
                        લોન્જર ખૂણા લંબાઈ (ઇંચ · ડિફોલ્ટ {DEFAULT_LOUNGER_CORNER_LEN_INCHES}")
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={loungerCornerLenInches}
                        onChange={(e) =>
                          setLoungerCornerLenInches(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        લોન્જર ખૂણા પહોળાઈ (ઇંચ · ડિફોલ્ટ {DEFAULT_LOUNGER_CORNER_WIDTH_INCHES}")
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={loungerCornerWidthInches}
                        onChange={(e) =>
                          setLoungerCornerWidthInches(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="sub-label">સોફા કવરનો પ્રકાર પસંદ કરો:</label>
                  <div className="tab-group" style={{ marginBottom: 0 }}>
                    <button
                      type="button"
                      className={`tab ${coverSubType === 'simple' ? 'active' : ''}`}
                      onClick={() => setCoverSubType('simple')}
                    >
                      સાદા કવર (સ્પંચ વગર · +15")
                    </button>
                    <button
                      type="button"
                      className={`tab ${coverSubType === 'sponge' ? 'active' : ''}`}
                      onClick={() => setCoverSubType('sponge')}
                    >
                      સ્પંચવાળા કવર (+20")
                    </button>
                  </div>
                </div>

                {!hasLounger ? (
                  <div>
                    <label className="sub-label">બેઠકની સાઈઝ (પહોળાઈ) પસંદ કરો:</label>
                    <div className="tab-group" style={{ marginBottom: 0 }}>
                      <button
                        type="button"
                        className={`tab ${coverSeatCase === 'regular24' ? 'active' : ''}`}
                        onClick={() => setCoverSeatCase('regular24')}
                      >
                        રેગ્યુલર 24" સુધી (Case 1)
                      </button>
                      <button
                        type="button"
                        className={`tab ${coverSeatCase === 'wide28' ? 'active' : ''}`}
                        onClick={() => setCoverSeatCase('wide28')}
                      >
                        મોટી બેઠક 25"–28" (Case 2)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="info-box teal" style={{ marginBottom: 0 }}>
                    <strong>Case 3 (લોન્જર કવર લોજિક):</strong> L/સીધા ભાગમાં બેઠક અને ટેકો
                    સામસામે, અને લોન્જરમાં આખી બેઠક (+{coverSubType === 'sponge' ? 20 : 18}")
                    સાથે ખૂણામાંથી ટેકો ગણાયો છે.
                  </div>
                )}

                <div className="form-row" style={{ marginBottom: 0 }}>
                  <div className="form-group">
                    <label>
                      હેન્ડલ લંબાઈ (ઇંચ · ડિફોલ્ટ {COVER_DEFAULT_HANDLE_INCHES}")
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={handleInches}
                      onChange={(e) =>
                        setHandleInches(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>હેન્ડલ કટ માપ (+{COVER_HANDLE_ALLOWANCE}" વધારો)</label>
                    <div className="calc-result">
                      {coverKapad.handleCutInches}" પ્રતિ હેન્ડલ
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SofaLayoutDiagram
            mode={mode}
            shape={shape}
            sections={sections}
            handleCount={num(handleCount)}
          />
        </div>

        {/* Right Column: Sticky Summary */}
        <aside id="material-summary-side" className="workspace-side">
          <div className="sticky-panel">
            {purpose === 'full_sofa' ? (
              <div className="totals-card">
                <div className="form-section-title">
                  આખા સોફાનું કાપડ (1m = {INCHES_PER_METER}")
                </div>

                <div className="mat-sub-block">
                  <div className="mat-sub-header">
                    <span>
                      અ) બેઠક ({hasLounger ? '+5" · લોન્જર +12"' : '+5" વધારો'})
                    </span>
                    <strong>{kapad.bethakMeters.toFixed(2)} m</strong>
                  </div>
                  {kapad.bethakItems.map((item) => (
                    <div key={item.id} className="mat-line-detail">
                      <span>{item.label}</span>
                      <span className="mat-formula">
                        {item.totalInches}" ÷ 39 = <strong>{item.meters.toFixed(2)} m</strong>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mat-sub-block">
                  <div className="mat-sub-header">
                    <span>બ) ટેકો (54" પનો · +{kapad.tekoAllowance}")</span>
                    <strong>{kapad.tekoMeters.toFixed(2)} m</strong>
                  </div>

                  <div className="lanes-grid">
                    <div
                      className={`lane-box ${
                        tekoPacked.lane1Sum >= tekoPacked.lane2Sum ? 'lane-winner' : ''
                      }`}
                    >
                      <div className="lane-title">
                        લાઈન - ૧
                        {tekoPacked.lane1Sum >= tekoPacked.lane2Sum && (
                          <span className="lane-badge">વધુ</span>
                        )}
                      </div>
                      {tekoPacked.lane1.length > 0 ? (
                        tekoPacked.lane1.map((p) => (
                          <div key={p.id} className="lane-piece">
                            <span>{p.label}</span>
                            <span>{p.totalInches}"</span>
                          </div>
                        ))
                      ) : (
                        <div className="lane-empty">ખાલી</div>
                      )}
                      <div className="lane-total">{tekoPacked.lane1Sum}"</div>
                    </div>

                    <div
                      className={`lane-box ${
                        tekoPacked.lane2Sum > tekoPacked.lane1Sum ? 'lane-winner' : ''
                      }`}
                    >
                      <div className="lane-title">
                        લાઈન - ૨
                        {tekoPacked.lane2Sum > tekoPacked.lane1Sum && (
                          <span className="lane-badge">વધુ</span>
                        )}
                      </div>
                      {tekoPacked.lane2.length > 0 ? (
                        tekoPacked.lane2.map((p) => (
                          <div key={p.id} className="lane-piece">
                            <span>{p.label}</span>
                            <span>{p.totalInches}"</span>
                          </div>
                        ))
                      ) : (
                        <div className="lane-empty">ખાલી</div>
                      )}
                      <div className="lane-total">{tekoPacked.lane2Sum}"</div>
                    </div>
                  </div>

                  <div className="mat-line-detail" style={{ marginTop: '8px' }}>
                    <span>મોટી લાઈન:</span>
                    <span className="mat-formula">
                      {tekoPacked.maxInches}" ÷ 39 ={' '}
                      <strong>{kapad.tekoMeters.toFixed(2)} m</strong>
                    </span>
                  </div>
                </div>

                <div className="mat-sub-block">
                  <div className="mat-sub-header">
                    <span>ક) હેન્ડલ ({kapad.handleCount} × 1m)</span>
                    <strong>{kapad.handleMeters.toFixed(2)} m</strong>
                  </div>
                </div>

                <div className="total-row grand" style={{ marginTop: '12px' }}>
                  <span>કુલ કાપડ</span>
                  <span>{kapad.totalMeters.toFixed(2)} મીટર</span>
                </div>

                {/* 4-Inch Foam Sheet Breakdown */}
                <div className="foam-summary-box">
                  <div className="mat-sub-header" style={{ marginBottom: '6px' }}>
                    <span>ઘ) 4 ઇંચ સ્પંચ (પહોળાઈ {foam4.seatDepthInches}")</span>
                    <strong>{foam4.totalSqft.toFixed(2)} ફૂટ</strong>
                  </div>

                  {foam4.items.map((item) =>
                    item.isLounger ? (
                      <div key={item.id} className="foam-lounger-block">
                        <div className="mat-line-detail">
                          <span>{item.label}</span>
                          <strong>{item.sqft.toFixed(2)} ft</strong>
                        </div>
                        <div className="foam-sub-split">
                          <span>• પાછળ: {item.backDetail}</span>
                          <span>• ખૂણો: {item.cornerDetail}</span>
                        </div>
                      </div>
                    ) : (
                      <div key={item.id} className="mat-line-detail">
                        <span>{item.label}</span>
                        <strong>{item.sqft.toFixed(2)} ft</strong>
                      </div>
                    )
                  )}

                  {foam4.totalSqft > 0 && (
                    <div className="foam-sheets-grid">
                      {foam4.sheetOptions.map((sh) => {
                        const isBest = sh.id === foam4.recommendedSheet?.id;
                        return (
                          <div
                            key={sh.id}
                            className={`foam-sheet-chip ${isBest ? 'best' : ''}`}
                          >
                            <div className="fsc-top">
                              <span>{sh.label}</span>
                              {isBest && <span className="fsc-badge">શ્રેષ્ઠ</span>}
                            </div>
                            <div className="fsc-qty">
                              {sh.sheetsNeeded} શીટ ({sh.totalSheetSqft}')
                            </div>
                            <div className="fsc-waste">બચત: {sh.wasteSqft}'</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2-Inch Teko Sheet (3x6 = 18 sq.ft) Breakdown */}
                <div className="foam-summary-box">
                  <div className="mat-sub-header" style={{ marginBottom: '6px' }}>
                    <span>
                      ચ) 2" ટેકો સીટ (3×6 · ઊંચાઈ {foam2.tekoHeightInches}")
                    </span>
                    <strong>{foam2.sheetsNeeded} શીટ</strong>
                  </div>

                  {foam2.items.map((item) => (
                    <div key={item.id} className="mat-line-detail">
                      <span>{item.label}</span>
                      <span className="mat-formula">
                        {item.cutLabel} = <strong>{item.sqft.toFixed(2)} ft</strong>
                      </span>
                    </div>
                  ))}

                  {foam2.totalSqft > 0 && (
                    <div className="foam2-summary-strip">
                      <span>
                        કુલ: <strong>{foam2.totalSqft.toFixed(2)} ફૂટ</strong> ÷ 18 ={' '}
                        {foam2.exactSheets} → <strong>{foam2.sheetsNeeded} શીટ (નંગ)</strong>
                      </span>
                      <span className="fsc-waste">બચત: {foam2.wasteSqft}'</span>
                    </div>
                  )}
                </div>

                {/* 1-Inch Sheet (3x6, rounded to whole/half) Breakdown */}
                <div className="foam-summary-box">
                  <div className="mat-sub-header" style={{ marginBottom: '6px' }}>
                    <span>છ) 1" ની સીટ (3×6 · આખી / અડધી)</span>
                    <strong>{foam1.totalSheets} સીટ</strong>
                  </div>

                  <div className="mat-line-detail">
                    <span>બેઠક ({foam1.bethakWidthInches}" ફિક્સ · {foam1.bethakTotalInches}")</span>
                    <strong>{foam1.bethakSheetsRaw.toFixed(2)} સીટ</strong>
                  </div>
                  <div className="mat-line-detail">
                    <span>
                      {foam1.isLining
                        ? 'ટેકો (લાઈનીંગ → સ્ટેન્ઝો)'
                        : `ટેકો (${foam1.tekoWidthInches}" પટ્ટો · ${foam1.tekoTotalInches}")`}
                    </span>
                    <strong>{foam1.tekoSheetsRaw.toFixed(2)} સીટ</strong>
                  </div>
                  <div className="mat-line-detail">
                    <span>હેન્ડલ ({foam1.handleCount} × 0.5 સીટ)</span>
                    <strong>{foam1.handleSheetsRaw.toFixed(2)} સીટ</strong>
                  </div>

                  <div className="foam2-summary-strip">
                    <span>
                      કુલ: {foam1.rawTotalSheets.toFixed(2)} →{' '}
                      <strong>{foam1.totalSheets} સીટ</strong>
                    </span>
                    <span className="fsc-waste">આખી / અડધી રાઉન્ડ</span>
                  </div>
                </div>

                {/* 15mm Stanzo (active when tekoMode === 'lining12mm') */}
                {stanzo.active && (
                  <div className="foam-summary-box">
                    <div className="mat-sub-header" style={{ marginBottom: '6px' }}>
                      <span>જ) 15mm સ્ટેન્ઝો (54" પનો · +{stanzo.allowance}")</span>
                      <strong>{stanzo.meters.toFixed(2)} m</strong>
                    </div>

                    <div className="lanes-grid">
                      <div
                        className={`lane-box ${
                          stanzo.packed.lane1Sum >= stanzo.packed.lane2Sum
                            ? 'lane-winner'
                            : ''
                        }`}
                      >
                        <div className="lane-title">
                          લાઈન - ૧
                          {stanzo.packed.lane1Sum >= stanzo.packed.lane2Sum && (
                            <span className="lane-badge">વધુ</span>
                          )}
                        </div>
                        {stanzo.packed.lane1.length > 0 ? (
                          stanzo.packed.lane1.map((p) => (
                            <div key={p.id} className="lane-piece">
                              <span>{p.label}</span>
                              <span>{p.totalInches}"</span>
                            </div>
                          ))
                        ) : (
                          <div className="lane-empty">ખાલી</div>
                        )}
                        <div className="lane-total">{stanzo.packed.lane1Sum}"</div>
                      </div>

                      <div
                        className={`lane-box ${
                          stanzo.packed.lane2Sum > stanzo.packed.lane1Sum
                            ? 'lane-winner'
                            : ''
                        }`}
                      >
                        <div className="lane-title">
                          લાઈન - ૨
                          {stanzo.packed.lane2Sum > stanzo.packed.lane1Sum && (
                            <span className="lane-badge">વધુ</span>
                          )}
                        </div>
                        {stanzo.packed.lane2.length > 0 ? (
                          stanzo.packed.lane2.map((p) => (
                            <div key={p.id} className="lane-piece">
                              <span>{p.label}</span>
                              <span>{p.totalInches}"</span>
                            </div>
                          ))
                        ) : (
                          <div className="lane-empty">ખાલી</div>
                        )}
                        <div className="lane-total">{stanzo.packed.lane2Sum}"</div>
                      </div>
                    </div>

                    <div className="mat-line-detail" style={{ marginTop: '8px' }}>
                      <span>મોટી લાઈન:</span>
                      <span className="mat-formula">
                        {stanzo.packed.maxInches}" ÷ 39 ={' '}
                        <strong>{stanzo.meters.toFixed(2)} m</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Fevicol (1 liter per 5 total sofa feet) */}
                <div className="mat-group-card">
                  <div className="mat-group-title">
                    <span>ઝ) ફેવિકોલ (દર {fevicol.stepFeet} ફૂટે 1 લિ.)</span>
                    <strong>{fevicol.liters} લિટર</strong>
                  </div>
                  <div className="mat-line-detail">
                    <span>કુલ સોફા માપ: {fevicol.totalFeet} ફૂટ</span>
                    <span className="mat-formula">
                      {fevicol.totalFeet} ÷ {fevicol.stepFeet} →{' '}
                      <strong>{fevicol.liters} લિટર</strong>
                    </span>
                  </div>
                </div>

                <div className="side-actions no-print">
                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={() =>
                      onTransferToQuote('reupholstery', kapad.totalMeters, undefined, {
                        sponge4Sqft: foam4.totalSqft,
                        sponge2Qty: foam2.sheetsNeeded,
                        sponge1Qty: foam1.totalSheets,
                        stanzoMeters: stanzo.active ? stanzo.meters : 0,
                        fevicolQty: fevicol.liters,
                      })
                    }
                  >
                    <span>જૂના સોફા કોટેશનમાં ઉમેરો</span>
                    <ArrowRightIcon size={17} />
                  </button>
                  <div className="karigar-btn-row">
                    <button
                      type="button"
                      className="btn btn-whatsapp"
                      onClick={handleKarigarWhatsApp}
                    >
                      <WhatsAppIcon size={16} />
                      <span>કારીગર શીટ</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleKarigarPDF}
                    >
                      <PrintIcon size={16} />
                      <span>શીટ PDF</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={() => applyQuickExample(16, 'straight')}
                  >
                    <RestoreIcon size={16} />
                    <span>રિસેટ કરો</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Sofa Cover Breakdown Panel */
              <div className="totals-card">
                <div className="form-section-title">
                  સોફા કવર કાપડ ({coverSubType === 'sponge' ? 'સ્પંચવાળા' : 'સાદા'})
                </div>

                {coverKapad.activeCase === 'case1_regular24' && (
                  <>
                    <div className="mat-sub-block">
                      <div className="mat-sub-header">
                        <span>અ) બેઠક (2-લાઈન · +{coverKapad.bethakAllowance}")</span>
                        <strong>{coverKapad.bethakMeters.toFixed(2)} m</strong>
                      </div>
                      <div className="mat-line-detail">
                        <span>લાઈન-૧: {coverKapad.bethakPacked.lane1Sum}" | લાઈન-૨: {coverKapad.bethakPacked.lane2Sum}"</span>
                        <span className="mat-formula">
                          {coverKapad.bethakPacked.maxInches}" ÷ 39 ={' '}
                          <strong>{coverKapad.bethakMeters.toFixed(2)} m</strong>
                        </span>
                      </div>
                    </div>

                    <div className="mat-sub-block">
                      <div className="mat-sub-header">
                        <span>બ) ટેકો (2-લાઈન · +{coverKapad.tekoAllowance}")</span>
                        <strong>{coverKapad.tekoMeters.toFixed(2)} m</strong>
                      </div>
                      <div className="mat-line-detail">
                        <span>લાઈન-૧: {coverKapad.tekoPacked.lane1Sum}" | લાઈન-૨: {coverKapad.tekoPacked.lane2Sum}"</span>
                        <span className="mat-formula">
                          {coverKapad.tekoPacked.maxInches}" ÷ 39 ={' '}
                          <strong>{coverKapad.tekoMeters.toFixed(2)} m</strong>
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {coverKapad.activeCase === 'case2_wide28' && (
                  <div className="mat-sub-block">
                    <div className="mat-sub-header">
                      <span>અ+બ) મોટી બેઠક (બેઠક + ટેકો સામસામે)</span>
                      <strong>{coverKapad.pairedMeters.toFixed(2)} m</strong>
                    </div>
                    <div className="mat-line-detail">
                      <span>લાઈન-૧ (બેઠક +{coverKapad.bethakAllowance}")</span>
                      <strong>{coverKapad.bethakSum}"</strong>
                    </div>
                    <div className="mat-line-detail">
                      <span>લાઈન-૨ (ટેકો +{coverKapad.tekoAllowance}")</span>
                      <strong>{coverKapad.tekoSum}"</strong>
                    </div>
                    <div className="mat-line-detail">
                      <span>મોટી લાઈન:</span>
                      <span className="mat-formula">
                        {coverKapad.pairedMaxInches}" ÷ 39 ={' '}
                        <strong>{coverKapad.pairedMeters.toFixed(2)} m</strong>
                      </span>
                    </div>
                  </div>
                )}

                {coverKapad.activeCase === 'case3_lounger' && (
                  <>
                    <div className="mat-sub-block">
                      <div className="mat-sub-header">
                        <span>અ) L/સીધો ભાગ (બેઠક + ટેકો સામસામે)</span>
                        <strong>{coverKapad.pairedMeters.toFixed(2)} m</strong>
                      </div>
                      <div className="mat-line-detail">
                        <span>લાઈન-૧ (બેઠક +{coverKapad.bethakAllowance}")</span>
                        <strong>{coverKapad.bethakSum}"</strong>
                      </div>
                      <div className="mat-line-detail">
                        <span>લાઈન-૨ (ટેકો +{coverKapad.tekoAllowance}")</span>
                        <strong>{coverKapad.tekoSum}"</strong>
                      </div>
                      <div className="mat-line-detail">
                        <span>મોટી લાઈન:</span>
                        <span className="mat-formula">
                          {coverKapad.pairedMaxInches}" ÷ 39 ={' '}
                          <strong>{coverKapad.pairedMeters.toFixed(2)} m</strong>
                        </span>
                      </div>
                    </div>

                    <div className="mat-sub-block">
                      <div className="mat-sub-header">
                        <span>બ) લોન્જર (+{coverKapad.loungerAllowance}" · ખૂણામાંથી ટેકો)</span>
                        <strong>{coverKapad.loungerMeters.toFixed(2)} m</strong>
                      </div>
                      {coverKapad.loungerItems.map((item) => (
                        <div key={item.id} className="mat-line-detail">
                          <span>{item.label}</span>
                          <span className="mat-formula">
                            {item.totalInches}" ÷ 39 = <strong>{item.meters.toFixed(2)} m</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Handles for Cover */}
                <div className="mat-sub-block">
                  <div className="mat-sub-header">
                    <span>
                      ક) હેન્ડલ ({coverKapad.handleCount} નંગ · {coverKapad.handleCutInches}"/નંગ)
                    </span>
                    <strong>{coverKapad.handleMeters.toFixed(2)} m</strong>
                  </div>
                  {coverKapad.handleCount > 0 && (
                    <div className="mat-line-detail">
                      <span>લાઈન-૧: {coverKapad.handlePacked.lane1Sum}" | લાઈન-૨: {coverKapad.handlePacked.lane2Sum}"</span>
                      <span className="mat-formula">
                        {coverKapad.handlePacked.maxInches}" ÷ 39 ={' '}
                        <strong>{coverKapad.handleMeters.toFixed(2)} m</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="total-row grand" style={{ marginTop: '12px' }}>
                  <span>કુલ કવર કાપડ</span>
                  <span>{coverKapad.totalMeters.toFixed(2)} મીટર</span>
                </div>

                <div className="side-actions no-print">
                  <button
                    type="button"
                    className="btn btn-success btn-full"
                    onClick={() =>
                      onTransferToQuote('cover', coverKapad.totalMeters, coverSubType)
                    }
                  >
                    <span>
                      સોફા કવર કોટેશનમાં ઉમેરો ({coverSubType === 'sponge' ? 'સ્પંચવાળા' : 'સાદા'})
                    </span>
                    <ArrowRightIcon size={17} />
                  </button>
                  <div className="karigar-btn-row">
                    <button
                      type="button"
                      className="btn btn-whatsapp"
                      onClick={handleKarigarWhatsApp}
                    >
                      <WhatsAppIcon size={16} />
                      <span>કારીગર શીટ</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleKarigarPDF}
                    >
                      <PrintIcon size={16} />
                      <span>શીટ PDF</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-full"
                    onClick={() => applyQuickExample(16, 'straight')}
                  >
                    <RestoreIcon size={16} />
                    <span>રિસેટ કરો</span>
                  </button>
                </div>
              </div>
            )}

            <div className="info-box amber no-print">
              <strong>આગામી મટિરિયલ્સ:</strong> માદરપાટ, રેકરોન અને સ્ટેપલર પિન
              આગળના તબક્કામાં ઉમેરાશે.
            </div>
          </div>
        </aside>
      </div>

      <MobileStickyBar
        label={purpose === 'sofa_cover' ? 'કુલ કવર કાપડ' : 'કુલ કાપડ'}
        value={`${(purpose === 'sofa_cover'
          ? coverKapad.totalMeters
          : kapad.totalMeters
        ).toFixed(2)} મીટર`}
        subText={
          purpose === 'full_sofa'
            ? `4": ${foam4.totalSqft}' · 2": ${foam2.sheetsNeeded} · 1": ${foam1.totalSheets}${
                stanzo.active ? ` · સ્ટેન્ઝો: ${stanzo.meters.toFixed(2)}m` : ''
              } · ફેવિ: ${fevicol.liters}L`
            : `${totalSofaFeet} ફૂટ · ${num(handleCount)} હેન્ડલ`
        }
        actionLabel={
          purpose === 'sofa_cover' ? 'કવર કોટેશન →' : 'સોફા કોટેશન →'
        }
        onAction={() =>
          purpose === 'sofa_cover'
            ? onTransferToQuote('cover', coverKapad.totalMeters, coverSubType)
            : onTransferToQuote('reupholstery', kapad.totalMeters, undefined, {
                sponge4Sqft: foam4.totalSqft,
                sponge2Qty: foam2.sheetsNeeded,
                sponge1Qty: foam1.totalSheets,
                stanzoMeters: stanzo.active ? stanzo.meters : 0,
                fevicolQty: fevicol.liters,
              })
        }
        targetSideId="material-summary-side"
        variant="teal"
      />
    </div>
  );
}
