import { useState } from 'react';
import {
  generatePresetSections,
  calculateAllMaterials,
  INCHES_PER_METER,
} from '../../utils/sofaMaterialCalculator';
import { generateId } from '../../utils/id';
import { num } from '../../utils/formatters';
import SofaLayoutDiagram from './SofaLayoutDiagram';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  RulerIcon,
  SofaIcon,
  PlusIcon,
  RestoreIcon,
} from '../common/Icons';

const TEKO_MODES = [
  { id: 'normal', label: 'સાદો ટેકો (+12")' },
  { id: 'bhag', label: 'ભાગ વાળો ટેકો (+12")' },
  { id: 'lining12mm', label: '12mm લાઇનિંગ (+17")' },
];

const SHAPES = [
  { id: 'straight', label: 'સીધા સોફા', desc: '૨ સીધા + ૪ હેન્ડલ' },
  { id: 'l_shape', label: 'L-આકાર સોફો', desc: 'L-સોફો + સીધો + ૨ હેન્ડલ' },
  { id: 'c_shape', label: 'C-આકાર સોફો', desc: 'ડાબી L + વચ્ચે + જમણી L' },
];

export default function MaterialCalculator({
  onBackToHome,
  onTransferToQuote,
}) {
  const [mode, setMode] = useState('total'); // 'total' | 'manual'
  const [totalFeet, setTotalFeet] = useState(16);
  const [shape, setShape] = useState('straight');
  const [tekoMode, setTekoMode] = useState('normal');

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
    const feet = num(totalFeet) || (newShape === 'c_shape' ? 23 : 16);
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
          return {
            id: sec.id,
            type: 'straight',
            label: sec.label,
            seatFt: sec.mainFt || 6,
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
    const newSec =
      type === 'l_corner'
        ? {
            id: `${generateId()}-${nextIdx}`,
            type: 'l_corner',
            label: `L-સોફો ${nextIdx}`,
            mainFt: 6,
            cornerFt: 2.5,
          }
        : {
            id: `${generateId()}-${nextIdx}`,
            type: 'straight',
            label: `સોફો ${nextIdx}`,
            seatFt: 6,
          };
    setSections((prev) => [...prev, newSec]);
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const result = calculateAllMaterials(sections, handleCount, { tekoMode });
  const { kapad, totalSofaFeet } = result;
  const { tekoPacked } = kapad;

  return (
    <div>
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

      <div className="workspace-grid">
        {/* Left Column: Controls & Dimensions */}
        <div className="workspace-main">
          <div className="form-card no-print">
            <div className="form-section-title">માપ દાખલ કરવાની રીત પસંદ કરો</div>
            <div className="tab-group" style={{ marginBottom: '12px' }}>
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

            <div className="quick-examples-row">
              <span className="quick-ex-label">ઝડપી ઉદાહરણ:</span>
              <button
                type="button"
                className="btn-chip"
                onClick={() => applyQuickExample(16, 'straight')}
              >
                16' સીધા
              </button>
              <button
                type="button"
                className="btn-chip"
                onClick={() => applyQuickExample(16, 'l_shape')}
              >
                16' L-આકાર
              </button>
              <button
                type="button"
                className="btn-chip"
                onClick={() => applyQuickExample(23, 'c_shape')}
              >
                23' C-આકાર
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
                    <span>સીધો સોફો</span>
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

                  {sec.type === 'straight' ? (
                    <div className="form-row single" style={{ marginBottom: 0 }}>
                      <div className="form-group">
                        <label>બેઠક / સીટ લંબાઈ (ફૂટ)</label>
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
                  ) : (
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
                  )}
                </div>
              ))}
            </div>

            <div className="form-row" style={{ marginTop: '14px', marginBottom: 0 }}>
              <div className="form-group">
                <label>કુલ હેન્ડલ (નંગ · 1 હેન્ડલ = 1 મીટર)</label>
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

            <div style={{ marginTop: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text2)',
                  marginBottom: '8px',
                }}
              >
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
          </div>

          <SofaLayoutDiagram
            mode={mode}
            shape={shape}
            sections={sections}
            handleCount={num(handleCount)}
          />
        </div>

        {/* Right Column: Sticky Material Summary */}
        <aside className="workspace-side">
          <div className="sticky-panel">
            <div className="totals-card">
              <div className="form-section-title">
                જરૂરી કાપડ (1m = {INCHES_PER_METER}")
              </div>

              <div className="mat-sub-block">
                <div className="mat-sub-header">
                  <span>અ) બેઠક (+5" વધારો)</span>
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

              <div className="side-actions no-print">
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => onTransferToQuote('reupholstery', kapad.totalMeters)}
                >
                  <span>જૂના સોફા કોટેશનમાં ઉમેરો</span>
                  <ArrowRightIcon size={17} />
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-full"
                  onClick={() => onTransferToQuote('cover', kapad.totalMeters)}
                >
                  <span>સોફા કવર કોટેશનમાં ઉમેરો</span>
                  <ArrowRightIcon size={17} />
                </button>
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

            <div className="info-box amber no-print">
              <strong>આગામી મટિરિયલ્સ:</strong> સ્પંચ (4", 2", 1"), 15mm સ્ટેન્ઝો,
              ફેવિકોલ, માદરપાટ, રેકરોન અને સ્ટેપલર પિન આગળના તબક્કામાં ઉમેરાશે.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
