import { useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, getMattressCompanies } from '../../utils/settings';
import { REUPHOLSTERY_ITEMS } from '../../constants/services';
import { CURTAIN_CONFIG } from '../../constants/curtainConfig';
import { generateId } from '../../utils/id';
import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  PlusIcon,
  RestoreIcon,
  TrashIcon,
} from './Icons';

function prepareDraft(src) {
  const cloned = structuredClone(src || DEFAULT_SETTINGS);
  cloned.rates = cloned.rates || structuredClone(DEFAULT_SETTINGS.rates);
  cloned.rates.mattressCompanies = getMattressCompanies(cloned);
  cloned.rates.curtains = cloned.rates.curtains || structuredClone(DEFAULT_SETTINGS.rates.curtains);
  return cloned;
}

function sanitizeForSave(draft) {
  const cleanedCompanies = getMattressCompanies(draft).map((c, cIdx) => ({
    ...c,
    name: String(c.name || '').trim() || `કંપની ${cIdx + 1}`,
    warranties: c.warranties.map((w, wIdx) => ({
      ...w,
      label: String(w.label || '').trim() || `વોરંટી ${wIdx + 1}`,
      rate4: Math.max(0, Number(w.rate4) || 0),
      rate6: Math.max(0, Number(w.rate6) || 0),
    })),
  }));

  const cleanedReup = {};
  REUPHOLSTERY_ITEMS.forEach((item) => {
    cleanedReup[`${item.key}_rate`] = Math.max(
      0,
      Number(draft.rates?.reupholstery?.[`${item.key}_rate`]) || 0
    );
  });

  const cleanedCurtains = {};
  Object.keys(CURTAIN_CONFIG).forEach((typeKey) => {
    cleanedCurtains[typeKey] = {};
    CURTAIN_CONFIG[typeKey].fields.forEach((f) => {
      const raw = draft.rates?.curtains?.[typeKey]?.[f.key];
      cleanedCurtains[typeKey][f.key] = Math.max(
        0,
        raw === '' || raw === undefined ? 0 : Number(raw) || 0
      );
    });
  });

  return {
    ...draft,
    shopName: String(draft.shopName || '').trim() || 'Sofa Craft',
    rates: {
      ...draft.rates,
      structureRate: Math.max(0, Number(draft.rates?.structureRate) || 0),
      upholsteryRate: Math.max(0, Number(draft.rates?.upholsteryRate) || 0),
      coverKapadRate: Math.max(0, Number(draft.rates?.coverKapadRate) || 0),
      coverLabour: Math.max(0, Number(draft.rates?.coverLabour) || 0),
      coverStanzoRate: Math.max(0, Number(draft.rates?.coverStanzoRate) || 0),
      coverFevicolRate: Math.max(0, Number(draft.rates?.coverFevicolRate) || 0),
      reupholstery: cleanedReup,
      mattressCompanies: cleanedCompanies,
      curtains: cleanedCurtains,
    },
  };
}

export default function SettingsPage({ settings, onSave, onBack }) {
  const [draft, setDraft] = useState(() => prepareDraft(settings));
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'sofa' | 'mattress' | 'curtains'
  const [curtainSubTab, setCurtainSubTab] = useState('eyelet');

  const initialNormalized = useMemo(
    () => JSON.stringify(sanitizeForSave(prepareDraft(settings))),
    [settings]
  );
  const hasChanges = useMemo(
    () => JSON.stringify(sanitizeForSave(draft)) !== initialNormalized,
    [draft, initialNormalized]
  );

  const parseNumInput = (val) => (val === '' ? '' : Number(val));

  const updateShop = (key, val) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
  };

  const updateRate = (key, val) => {
    setDraft((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [key]: parseNumInput(val),
      },
    }));
  };

  const updateReupRate = (key, val) => {
    setDraft((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        reupholstery: {
          ...prev.rates.reupholstery,
          [key]: parseNumInput(val),
        },
      },
    }));
  };

  const updateCurtainRate = (typeKey, fieldKey, val) => {
    setDraft((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        curtains: {
          ...(prev.rates.curtains || {}),
          [typeKey]: {
            ...(prev.rates.curtains?.[typeKey] || {}),
            [fieldKey]: parseNumInput(val),
          },
        },
      },
    }));
  };

  const updateMattressCompanies = (updater) => {
    setDraft((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        mattressCompanies: updater(getMattressCompanies(prev)),
      },
    }));
  };

  const handleCompanyNameChange = (companyId, name) => {
    updateMattressCompanies((list) =>
      list.map((c) => (c.id === companyId ? { ...c, name } : c))
    );
  };

  const handleAddCompany = () => {
    const newId = `comp_${generateId()}`;
    updateMattressCompanies((list) => [
      ...list,
      {
        id: newId,
        name: `નવી કંપની ${list.length + 1}`,
        warranties: [
          { id: `w_${generateId()}_1`, label: '10 વર્ષ', rate4: 240, rate6: 310 },
          { id: `w_${generateId()}_2`, label: '15 વર્ષ', rate4: 290, rate6: 360 },
        ],
      },
    ]);
  };

  const handleDuplicateCompany = (comp) => {
    const newId = `comp_${generateId()}`;
    updateMattressCompanies((list) => [
      ...list,
      {
        id: newId,
        name: `${comp.name} (નકલ)`,
        warranties: comp.warranties.map((w, idx) => ({
          ...w,
          id: `w_${generateId()}_${idx}`,
        })),
      },
    ]);
  };

  const handleRemoveCompany = (comp) => {
    if (window.confirm(`"${comp.name}" કંપની દૂર કરવી છે?`)) {
      updateMattressCompanies((list) =>
        list.length > 1 ? list.filter((c) => c.id !== comp.id) : list
      );
    }
  };

  const handleWarrantyChange = (companyId, warId, field, value) => {
    updateMattressCompanies((list) =>
      list.map((c) => {
        if (c.id !== companyId) return c;
        return {
          ...c,
          warranties: c.warranties.map((w) => {
            if (w.id !== warId) return w;
            if (field === 'label') return { ...w, label: value };
            return { ...w, [field]: parseNumInput(value) };
          }),
        };
      })
    );
  };

  const handleAddWarranty = (companyId) => {
    updateMattressCompanies((list) =>
      list.map((c) => {
        if (c.id !== companyId) return c;
        return {
          ...c,
          warranties: [
            ...c.warranties,
            {
              id: `w_${generateId()}`,
              label: `${10 + c.warranties.length * 5} વર્ષ`,
              rate4: 250,
              rate6: 320,
            },
          ],
        };
      })
    );
  };

  const handleRemoveWarranty = (companyId, warId) => {
    updateMattressCompanies((list) =>
      list.map((c) => {
        if (c.id !== companyId || c.warranties.length <= 1) return c;
        return {
          ...c,
          warranties: c.warranties.filter((w) => w.id !== warId),
        };
      })
    );
  };

  const handleSaveClick = () => {
    onSave(sanitizeForSave(draft));
  };

  const handleDiscardChanges = () => {
    setDraft(prepareDraft(settings));
  };

  const handleReset = () => {
    if (window.confirm('બધા દરો અને સેટિંગ્સ ડિફોલ્ટ પર રિસેટ કરવા છે?')) {
      setDraft(prepareDraft(DEFAULT_SETTINGS));
    }
  };

  const companies = getMattressCompanies(draft);
  const activeCurtainCfg = CURTAIN_CONFIG[curtainSubTab];

  return (
    <div className={hasChanges ? 'settings-has-dirty' : ''}>
      <div className="form-header no-print">
        <button type="button" className="back-btn" onClick={onBack} title="પાછા જાઓ">
          <ArrowLeftIcon size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="form-title">એડમીન સેટિંગ્સ અને ડિફોલ્ટ દરો</h2>
        </div>
        <span className={`settings-status-pill ${hasChanges ? 'dirty' : 'saved'}`}>
          {hasChanges ? '● ફેરફાર સેવ બાકી' : '✓ બધા દરો સેવ છે'}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="form-card settings-nav-card">
        <div className="tab-group" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`tab ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            દુકાનની વિગત
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'sofa' ? 'active' : ''}`}
            onClick={() => setActiveTab('sofa')}
          >
            સોફા અને કવર દરો
          </button>
          <button
            type="button"
            className={`tab purple ${activeTab === 'mattress' ? 'active' : ''}`}
            onClick={() => setActiveTab('mattress')}
          >
            ગાદલા કંપની ({companies.length})
          </button>
          <button
            type="button"
            className={`tab maroon ${activeTab === 'curtains' ? 'active' : ''}`}
            onClick={() => setActiveTab('curtains')}
          >
            પડદા દરો
          </button>
        </div>
      </div>

      {/* Tab 1: Shop Details + Live Header Preview */}
      {activeTab === 'shop' && (
        <>
          <div className="form-card">
            <div className="form-section-title">દુકાન / બિલ હેડર વિગતો</div>
            <div className="form-row">
              <div className="form-group">
                <label>દુકાનનું નામ (Shop Name)</label>
                <input
                  type="text"
                  value={draft.shopName || ''}
                  onChange={(e) => updateShop('shopName', e.target.value)}
                  placeholder="e.g. Sofa Craft"
                />
              </div>
              <div className="form-group">
                <label>ટેગલાઇન (Tagline)</label>
                <input
                  type="text"
                  value={draft.shopTagline || ''}
                  onChange={(e) => updateShop('shopTagline', e.target.value)}
                  placeholder="e.g. સોફા અને પડદા કોટેશન સિસ્ટમ"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ફોન નંબર (બિલ પર બતાવવા માટે)</label>
                <input
                  type="text"
                  value={draft.shopPhone || ''}
                  onChange={(e) => updateShop('shopPhone', e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="form-group">
                <label>સરનામું / શહેર (Address)</label>
                <input
                  type="text"
                  value={draft.shopAddress || ''}
                  onChange={(e) => updateShop('shopAddress', e.target.value)}
                  placeholder="e.g. અમદાવાદ"
                />
              </div>
            </div>

            <div className="form-row single" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label>બિલ નીચેની નોંધ (Terms / Footer Note)</label>
                <input
                  type="text"
                  value={draft.quoteNote || ''}
                  onChange={(e) => updateShop('quoteNote', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-section-title">બિલ અને PDF હેડર પ્રિવ્યૂ</div>
            <div className="quote-view-header" style={{ padding: '12px 0 14px', marginBottom: 0, borderBottom: 'none' }}>
              <div className="logo-text">{draft.shopName || 'Sofa Craft'}</div>
              <div className="sub">
                {draft.shopTagline || 'સોફા અને પડદા કોટેશન સિસ્ટમ'}
              </div>
              {(draft.shopPhone || draft.shopAddress) && (
                <div className="sub" style={{ marginTop: '4px' }}>
                  {[draft.shopPhone, draft.shopAddress].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Sofa, Cover & Reupholstery Rates */}
      {activeTab === 'sofa' && (
        <>
          <div className="form-card">
            <div className="form-section-title">નવા સોફા ડિફોલ્ટ દરો (₹ / ફૂટ)</div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label>સ્ટ્રક્ચર સાથે (₹/ft)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.rates.structureRate}
                  onChange={(e) => updateRate('structureRate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>માલસામાન સાથે (₹/ft)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.rates.upholsteryRate}
                  onChange={(e) => updateRate('upholsteryRate', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-section-title">સોફા કવર ડિફોલ્ટ દરો (₹)</div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label>કાપડ દર (₹ / મીટર)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.rates.coverKapadRate}
                  onChange={(e) => updateRate('coverKapadRate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>કવર મજૂરી (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.rates.coverLabour}
                  onChange={(e) => updateRate('coverLabour', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Stanzo પેડિંગ દર (₹ / મીટર)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.rates.coverStanzoRate}
                  onChange={(e) => updateRate('coverStanzoRate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Fevicol દર (₹ / લિટર)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.rates.coverFevicolRate}
                  onChange={(e) => updateRate('coverFevicolRate', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-section-title">
              જૂના સોફા મઢવા માટે મટિરિયલ દરો (₹)
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              {REUPHOLSTERY_ITEMS.map((item) => (
                <div key={item.key} className="form-group">
                  <label>
                    {item.label} ({item.unit})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={draft.rates.reupholstery[`${item.key}_rate`] ?? ''}
                    onChange={(e) =>
                      updateReupRate(`${item.key}_rate`, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tab 3: Mattress Companies, Custom Warranties & Rates */}
      {activeTab === 'mattress' && (
        <div className="form-card">
          <div className="mattress-settings-head">
            <div>
              <div className="form-section-title" style={{ marginBottom: '2px', borderBottom: 'none', paddingBottom: 0 }}>
                ગાદલા કંપનીઓ, વોરંટી અને દરો (₹ / ફૂટ)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>
                દરેક કંપનીનું નામ, વોરંટી વર્ષ અને 4"/6" ના દરો અહીંથી અપડેટ કરો
              </div>
            </div>
            <button
              type="button"
              className="btn btn-purple"
              style={{ padding: '7px 13px', minHeight: '36px', fontSize: '12.5px' }}
              onClick={handleAddCompany}
            >
              <PlusIcon size={15} />
              <span>નવી કંપની ઉમેરો</span>
            </button>
          </div>

          <div className="mattress-companies-list">
            {companies.map((comp, cIdx) => (
              <div key={comp.id} className="mattress-company-box">
                <div className="mattress-company-top">
                  <span className="sec-num" style={{ background: 'var(--purple)' }}>
                    #{cIdx + 1}
                  </span>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <label>કંપનીનું નામ (Company Name)</label>
                    <input
                      type="text"
                      value={comp.name}
                      placeholder="દા.ત. Sleepwell"
                      onChange={(e) =>
                        handleCompanyNameChange(comp.id, e.target.value)
                      }
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignSelf: 'end', marginBottom: '2px' }}>
                    <button
                      type="button"
                      className="btn-mini"
                      style={{ minHeight: '34px' }}
                      onClick={() => handleDuplicateCompany(comp)}
                      title="આ કંપનીની નકલ બનાવો"
                    >
                      <CopyIcon size={13} />
                      <span>નકલ</span>
                    </button>
                    {companies.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon-del"
                        style={{ width: '34px', height: '34px' }}
                        onClick={() => handleRemoveCompany(comp)}
                        title="કંપની દૂર કરો"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mattress-war-headers">
                  <span>વોરંટી (નામ / વર્ષ)</span>
                  <span>4 Inch (₹/ft)</span>
                  <span>6 Inch (₹/ft)</span>
                  <span />
                </div>

                {comp.warranties.map((w) => (
                  <div key={w.id} className="mattress-war-row">
                    <div className="form-group mwar-label" style={{ margin: 0 }}>
                      <span className="mobile-field-tag">વોરંટી</span>
                      <input
                        type="text"
                        value={w.label}
                        placeholder="દા.ત. 10 વર્ષ"
                        onChange={(e) =>
                          handleWarrantyChange(comp.id, w.id, 'label', e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group mwar-r4" style={{ margin: 0 }}>
                      <span className="mobile-field-tag">4 Inch (₹/ft)</span>
                      <input
                        type="number"
                        min="0"
                        value={w.rate4}
                        onChange={(e) =>
                          handleWarrantyChange(comp.id, w.id, 'rate4', e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group mwar-r6" style={{ margin: 0 }}>
                      <span className="mobile-field-tag">6 Inch (₹/ft)</span>
                      <input
                        type="number"
                        min="0"
                        value={w.rate6}
                        onChange={(e) =>
                          handleWarrantyChange(comp.id, w.id, 'rate6', e.target.value)
                        }
                      />
                    </div>
                    <div className="mwar-del">
                      {comp.warranties.length > 1 && (
                        <button
                          type="button"
                          className="btn-icon-del"
                          onClick={() => handleRemoveWarranty(comp.id, w.id)}
                          title="વોરંટી દૂર કરો"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-mini"
                  style={{ marginTop: '8px' }}
                  onClick={() => handleAddWarranty(comp.id)}
                >
                  <PlusIcon size={13} />
                  <span>વોરંટી ઉમેરો</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Curtain Default Rates */}
      {activeTab === 'curtains' && (
        <div className="form-card">
          <div className="form-section-title">પડદા ડિફોલ્ટ દરો (₹)</div>
          <div className="tab-group">
            {Object.keys(CURTAIN_CONFIG).map((key) => (
              <button
                key={key}
                type="button"
                className={`tab maroon ${curtainSubTab === key ? 'active' : ''}`}
                onClick={() => setCurtainSubTab(key)}
              >
                {CURTAIN_CONFIG[key].name}
              </button>
            ))}
          </div>

          <div className="form-row" style={{ marginBottom: 0 }}>
            {activeCurtainCfg.fields.map((f) => {
              const curVal =
                draft.rates?.curtains?.[curtainSubTab]?.[f.key] !== undefined
                  ? draft.rates.curtains[curtainSubTab][f.key]
                  : f.def;
              return (
                <div key={f.key} className="form-group">
                  <label>{f.label}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={curVal}
                    onChange={(e) =>
                      updateCurtainRate(curtainSubTab, f.key, e.target.value)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="actions no-print">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSaveClick}
        >
          <CheckIcon size={17} />
          <span>સેટિંગ્સ સેવ કરો</span>
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
        >
          <RestoreIcon size={17} />
          <span>ડિફોલ્ટ રિસેટ કરો</span>
        </button>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <span>પાછા જાઓ</span>
        </button>
      </div>

      {/* Floating Unsaved Changes Save Bar */}
      {hasChanges && (
        <div className="settings-sticky-bar no-print">
          <span className="ssb-text">● ફેરફારો સેવ કરવા બાકી છે</span>
          <div className="ssb-actions">
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '7px 12px', minHeight: '36px', fontSize: '12.5px' }}
              onClick={handleDiscardChanges}
            >
              રદ કરો
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '7px 14px', minHeight: '36px', fontSize: '12.5px' }}
              onClick={handleSaveClick}
            >
              <CheckIcon size={15} />
              <span>સેવ કરો</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
