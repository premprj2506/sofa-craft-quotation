import { useState } from 'react';
import { CURTAIN_CONFIG } from '../../constants/curtainConfig';
import { num, fmtCurtain } from '../../utils/formatters';
import { generateId } from '../../utils/id';
import {
  loadCurtainQuotations,
  saveCurtainQuotations,
} from '../../utils/storage';
import { exportCurtainPDF } from '../../utils/pdfExport';
import {
  buildCurtainWhatsAppMessage,
  shareOnWhatsApp,
} from '../../utils/whatsappShare';
import { ORDER_STATUSES, getStatusMeta } from '../../constants/orderStatus';
import CurtainList from './CurtainList';
import CustomerNameField from '../common/CustomerNameField';
import CollapsibleCard from '../common/CollapsibleCard';
import MobileStickyBar from '../common/MobileStickyBar';
import {
  ArrowLeftIcon,
  CurtainIcon,
  QuotesIcon,
  CheckIcon,
  PrintIcon,
  WhatsAppIcon,
  PlusIcon,
  EditIcon,
  CartPlusIcon,
  ArrowVerticalIcon,
  ArrowHorizontalIcon,
} from '../common/Icons';

function buildInitialDynamicMap(initialQuote, settings) {
  const init = {};
  const curtainDefaults = settings?.rates?.curtains || {};
  Object.keys(CURTAIN_CONFIG).forEach((k) => {
    init[k] = {};
    CURTAIN_CONFIG[k].fields.forEach((f) => {
      init[k][f.key] =
        curtainDefaults[k]?.[f.key] !== undefined
          ? curtainDefaults[k][f.key]
          : f.def;
    });
  });
  if (initialQuote?.dynamicValues && initialQuote?.type) {
    init[initialQuote.type] = {
      ...init[initialQuote.type],
      ...initialQuote.dynamicValues,
    };
  }
  return init;
}

export default function CurtainCalculator({
  showToast,
  onBackToHome,
  onQuotesChange,
  onAddToMainQuote,
  savedCustomers = [],
  initialQuote = null,
  isEditing = false,
  settings,
  onDoneEditing,
}) {
  // Multi-window support: if editing a multi-window quote, load earlier windows into addedWindows and last window into active editor
  const initialMulti =
    Array.isArray(initialQuote?.windows) && initialQuote.windows.length > 0;
  const initialLastWin = initialMulti
    ? initialQuote.windows[initialQuote.windows.length - 1]
    : null;

  const [addedWindows, setAddedWindows] = useState(() =>
    initialMulti ? initialQuote.windows.slice(0, -1) : []
  );

  const [roomName, setRoomName] = useState(
    () => initialLastWin?.roomName || initialQuote?.roomName || 'બારી ૧'
  );

  const [currentType, setCurrentType] = useState(
    () => initialLastWin?.type || initialQuote?.type || 'eyelet'
  );
  const [viewMode, setViewMode] = useState('calculator'); // 'calculator' | 'list'

  const [customer, setCustomer] = useState(() =>
    initialQuote?.customer
      ? { ...initialQuote.customer }
      : {
          name: '',
          phone: '',
          date: new Date().toISOString().split('T')[0],
        }
  );

  const [measurements, setMeasurements] = useState(() => {
    const m = initialLastWin?.measurements || initialQuote?.measurements;
    return m
      ? { ...m }
      : {
          height: '',
          width: '',
          fullness: CURTAIN_CONFIG.eyelet.fullness,
        };
  });

  const [dynamicValues, setDynamicValues] = useState(() => {
    const base = buildInitialDynamicMap(initialQuote, settings);
    if (initialLastWin?.dynamicValues && initialLastWin?.type) {
      base[initialLastWin.type] = {
        ...base[initialLastWin.type],
        ...initialLastWin.dynamicValues,
      };
    }
    return base;
  });

  const [adjustments, setAdjustments] = useState(() =>
    initialQuote?.adjustments
      ? {
          commission: initialQuote.adjustments.commission || 0,
          gst: initialQuote.adjustments.gst || 0,
          discount: initialQuote.adjustments.discount || 0,
          advance: initialQuote.advance ?? initialQuote.adjustments.advance ?? 0,
          status: initialQuote.status || initialQuote.adjustments.status || 'pending',
        }
      : {
          commission: 0,
          gst: 0,
          discount: initialQuote?.discount || 0,
          advance: initialQuote?.advance || 0,
          status: initialQuote?.status || 'pending',
        }
  );

  const [savedQuotes, setSavedQuotes] = useState(() => loadCurtainQuotations());

  const cfg = CURTAIN_CONFIG[currentType];

  const handleSelectType = (typeKey) => {
    setCurrentType(typeKey);
    setMeasurements((prev) => ({
      ...prev,
      fullness: CURTAIN_CONFIG[typeKey].fullness,
    }));
  };

  const handleDynamicChange = (key, val) => {
    setDynamicValues((prev) => ({
      ...prev,
      [currentType]: {
        ...prev[currentType],
        [key]: val === '' ? '' : Number(val),
      },
    }));
  };

  const gatherValues = () => {
    return {
      height: num(measurements.height),
      width: num(measurements.width),
      fullness: num(measurements.fullness),
      ...(dynamicValues[currentType] || {}),
    };
  };

  const v = gatherValues();
  const activeItems = cfg.calc(v);
  const activeSubtotal = activeItems.reduce((sum, item) => sum + (item.value || 0), 0);

  const hasActiveDimensions =
    num(measurements.height) > 0 || num(measurements.width) > 0;
  const includeActiveInTotal =
    addedWindows.length === 0 || hasActiveDimensions;

  const addedSubtotal = addedWindows.reduce(
    (sum, w) => sum + (w.subtotal || 0),
    0
  );
  const subtotal = addedSubtotal + (includeActiveInTotal ? activeSubtotal : 0);

  const commissionAmt = (subtotal * num(adjustments.commission)) / 100;
  const afterCommission = subtotal + commissionAmt;
  const gstAmt = (afterCommission * num(adjustments.gst)) / 100;
  const afterGst = afterCommission + gstAmt;
  const grandTotal = Math.max(0, afterGst - num(adjustments.discount));

  const handleAddWindow = () => {
    if (!hasActiveDimensions) {
      if (showToast) showToast('પહેલા ઊંચાઈ અને પહોળાઈ દાખલ કરો!');
      return;
    }

    const newWin = {
      id: generateId(),
      roomName: roomName.trim() || `બારી ${addedWindows.length + 1}`,
      type: currentType,
      typeName: cfg.name,
      measurements: { ...measurements },
      dynamicValues: { ...(dynamicValues[currentType] || {}) },
      items: activeItems,
      subtotal: activeSubtotal,
    };

    const nextCount = addedWindows.length + 2;
    setAddedWindows((prev) => [...prev, newWin]);
    setRoomName(`બારી ${nextCount}`);
    setMeasurements((prev) => ({ ...prev, height: '', width: '' }));
    if (showToast) showToast(`"${newWin.roomName}" ઉમેરાઈ! હવે બીજી બારીનું માપ નાખો.`);
  };

  const handleRemoveAddedWindow = (winId) => {
    setAddedWindows((prev) => prev.filter((w) => w.id !== winId));
  };

  const handleEditAddedWindow = (win) => {
    setAddedWindows((prev) => prev.filter((w) => w.id !== win.id));
    setRoomName(win.roomName || 'બારી');
    setCurrentType(win.type || 'eyelet');
    setMeasurements({ ...(win.measurements || { height: '', width: '', fullness: 2 }) });
    if (win.dynamicValues && win.type) {
      setDynamicValues((prev) => ({
        ...prev,
        [win.type]: { ...prev[win.type], ...win.dynamicValues },
      }));
    }
  };

  const buildRecord = (id) => {
    const allWindows = [...addedWindows];
    if (includeActiveInTotal) {
      allWindows.push({
        id: `${id}-active`,
        roomName: roomName.trim() || `બારી ${addedWindows.length + 1}`,
        type: currentType,
        typeName: cfg.name,
        measurements: { ...measurements },
        dynamicValues: { ...(dynamicValues[currentType] || {}) },
        items: activeItems,
        subtotal: activeSubtotal,
      });
    }

    if (allWindows.length <= 1) {
      const only = allWindows[0] || {
        type: currentType,
        typeName: cfg.name,
        roomName,
        measurements: { ...measurements },
        dynamicValues: { ...(dynamicValues[currentType] || {}) },
        items: activeItems,
        subtotal: activeSubtotal,
      };
      return {
        id,
        type: only.type,
        typeName: only.typeName,
        roomName: only.roomName,
        customer: { ...customer },
        measurements: { ...only.measurements },
        dynamicValues: { ...(only.dynamicValues || {}) },
        adjustments: { ...adjustments },
        items: only.items,
        subtotal,
        commissionAmt,
        gstAmt,
        discount: num(adjustments.discount),
        advance: num(adjustments.advance),
        status: adjustments.status || 'pending',
        grandTotal,
      };
    }

    return {
      id,
      type: 'multi',
      typeName: `કુલ ${allWindows.length} બારી / રૂમ પડદા`,
      customer: { ...customer },
      windows: allWindows,
      adjustments: { ...adjustments },
      items: allWindows.flatMap((w) => w.items || []),
      subtotal,
      commissionAmt,
      gstAmt,
      discount: num(adjustments.discount),
      advance: num(adjustments.advance),
      status: adjustments.status || 'pending',
      grandTotal,
    };
  };

  const handleTransferToCombinedQuote = () => {
    if (!onAddToMainQuote) return;
    if (addedWindows.length === 0 && !hasActiveDimensions) {
      if (showToast) showToast('પહેલા પડદાનું માપ દાખલ કરો!');
      return;
    }

    const rec = buildRecord(generateId());
    const breakdown = [];
    if (Array.isArray(rec.windows) && rec.windows.length > 0) {
      rec.windows.forEach((win, idx) => {
        breakdown.push({
          label: `${idx + 1}. ${win.roomName || `બારી ${idx + 1}`} (${win.typeName})`,
          value: `${win.measurements?.height || 0}" × ${win.measurements?.width || 0}"`,
          amount: Math.round(win.subtotal || 0),
        });
      });
    } else {
      (rec.items || []).forEach((it) => {
        breakdown.push({
          label: it.label,
          value: `${rec.typeName} (${rec.measurements?.height || 0}" × ${rec.measurements?.width || 0}")`,
          amount: Math.round(it.value || 0),
        });
      });
    }

    const cartItem = {
      id: generateId(),
      serviceType: 'curtains',
      serviceLabel: rec.typeName || 'પડદા બનાવવા માટે',
      curtainRecord: rec,
      breakdown,
      subtotal: Math.round(rec.subtotal || 0),
    };

    onAddToMainQuote(cartItem, customer);
  };

  const handleSaveQuotation = () => {
    const existingList = loadCurtainQuotations();
    let updated;
    if (isEditing && initialQuote?.id) {
      const updatedRecord = buildRecord(initialQuote.id);
      updated = existingList.map((q) =>
        String(q.id) === String(initialQuote.id) ? updatedRecord : q
      );
      if (showToast) showToast('પડદા કોટેશન અપડેટ થયું!');
    } else {
      const newRecord = buildRecord(generateId());
      updated = [newRecord, ...existingList];
      if (showToast) showToast('પડદા કોટેશન સેવ થયું!');
    }

    setSavedQuotes(updated);
    saveCurtainQuotations(updated);
    if (onQuotesChange) onQuotesChange(updated);
    if (isEditing && onDoneEditing) onDoneEditing();
  };

  const handleDeleteQuotation = (id) => {
    const updated = savedQuotes.filter((q) => q.id !== id);
    setSavedQuotes(updated);
    saveCurtainQuotations(updated);
    if (onQuotesChange) onQuotesChange(updated);
    if (showToast) showToast('કોટેશન ડિલીટ થયું.');
  };

  const handlePrint = () => {
    exportCurtainPDF(buildRecord(initialQuote?.id || generateId()), showToast, settings);
  };

  const handleWhatsApp = () => {
    const rec = buildRecord(initialQuote?.id || generateId());
    const msg = buildCurtainWhatsAppMessage(rec, settings);
    shareOnWhatsApp({ phone: customer.phone, message: msg, showToast });
  };

  if (viewMode === 'list') {
    return (
      <CurtainList
        quotations={savedQuotes}
        onBack={() => setViewMode('calculator')}
        onDelete={handleDeleteQuotation}
        showToast={showToast}
      />
    );
  }

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
          <h2 className="form-title">
            {isEditing ? 'પડદા કોટેશન સુધારો' : 'પડદા એસ્ટિમેટ (Curtain Estimation)'}
          </h2>
        </div>
        <span className="form-badge maroon">
          <CurtainIcon size={14} />
          <span>{cfg.englishName}</span>
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '7px 14px', fontSize: '13px' }}
            onClick={() => setViewMode('list')}
          >
            <QuotesIcon size={16} />
            <span>સેવ કરેલા ({savedQuotes.length})</span>
          </button>
        </div>
      </div>

      <div className="workspace-grid">
        {/* Left Column: Inputs */}
        <div className="workspace-main">
          <div className="form-card">
            <div className="form-section-title">ગ્રાહક ની વિગત</div>
            <div className="form-row three customer-grid" style={{ marginBottom: 0 }}>
              <div className="form-group customer-name-col">
                <label>ગ્રાહકનું નામ</label>
                <CustomerNameField
                  value={customer.name}
                  phoneValue={customer.phone}
                  savedCustomers={savedCustomers}
                  placeholder="e.g. નરેશભાઈ"
                  onChangeName={(val) =>
                    setCustomer((prev) => ({ ...prev, name: val }))
                  }
                  onChangePhone={(val) =>
                    setCustomer((prev) => ({ ...prev, phone: val }))
                  }
                />
              </div>
              <div className="form-group">
                <label>ફોન નંબર</label>
                <input
                  type="text"
                  value={customer.phone}
                  placeholder="e.g. 9876543210"
                  onChange={(e) =>
                    setCustomer((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>તારીખ</label>
                <input
                  type="date"
                  value={customer.date}
                  onChange={(e) =>
                    setCustomer((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-card no-print">
            <div className="form-section-title">પડદા નો પ્રકાર અને રૂમ/બારી</div>
            <div className="tab-group" style={{ marginBottom: '14px' }}>
              {Object.keys(CURTAIN_CONFIG).map((key) => {
                const item = CURTAIN_CONFIG[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`tab maroon ${currentType === key ? 'active' : ''}`}
                    onClick={() => handleSelectType(key)}
                  >
                    {item.name} ({item.englishName})
                  </button>
                );
              })}
            </div>

            <div className="form-row single" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label>રૂમ / બારીનું નામ (દા.ત. હોલ બારી, બેડરૂમ)</label>
                <input
                  type="text"
                  value={roomName}
                  placeholder="દા.ત. હોલ બારી"
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-section-title">માપ અને પ્લીટિંગ ({roomName || 'બારી'})</div>
            <div className="form-row three compact-three" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="dim-label-arrow">
                  <span className="dim-arrow-badge">
                    <ArrowVerticalIcon size={13} />
                  </span>
                  <span>ઊંચાઈ (ઇંચ)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={measurements.height}
                  placeholder="e.g. 84"
                  onChange={(e) =>
                    setMeasurements((prev) => ({ ...prev, height: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="dim-label-arrow">
                  <span className="dim-arrow-badge">
                    <ArrowHorizontalIcon size={13} />
                  </span>
                  <span>લંબાઈ / પહોળાઈ (ઇંચ)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={measurements.width}
                  placeholder="e.g. 60"
                  onChange={(e) =>
                    setMeasurements((prev) => ({ ...prev, width: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>ચપટી / Fullness</label>
                <input
                  type="number"
                  step="0.05"
                  min="1"
                  value={measurements.fullness}
                  onChange={(e) =>
                    setMeasurements((prev) => ({
                      ...prev,
                      fullness: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-section-title">
              દરો અને ખર્ચ ({cfg.name})
            </div>
            <div className="form-row" style={{ marginBottom: 0 }}>
              {cfg.fields.map((f) => {
                const currentVal =
                  dynamicValues[currentType]?.[f.key] !== undefined
                    ? dynamicValues[currentType][f.key]
                    : f.def;
                return (
                  <div key={f.key} className="form-group">
                    <label>{f.label}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={currentVal}
                      onChange={(e) => handleDynamicChange(f.key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <CollapsibleCard
            title="કમિશન · જીએસટી · બાનું · સ્ટેટસ"
            summary={[
              getStatusMeta(adjustments.status).label,
              num(adjustments.gst) > 0 ? `GST ${adjustments.gst}%` : null,
              num(adjustments.advance) > 0
                ? `બાનું ₹${num(adjustments.advance).toLocaleString('en-IN')}`
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            defaultOpenMobile={false}
            className="no-print"
          >
            <div className="form-row three compact-three">
              <div className="form-group">
                <label>કમિશન (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={adjustments.commission}
                  onChange={(e) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      commission: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label>જીએસટી (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={adjustments.gst}
                  onChange={(e) =>
                    setAdjustments((prev) => ({ ...prev, gst: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>ડિસ્કાઉન્ટ (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={adjustments.discount}
                  onChange={(e) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      discount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="form-row mobile-stack" style={{ marginBottom: 0, alignItems: 'end' }}>
              <div className="form-group">
                <label>એડવાન્સ / બાનું (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={adjustments.advance}
                  onChange={(e) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      advance: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label>ઓર્ડર સ્ટેટસ</label>
                <div className="tab-group" style={{ marginBottom: 0 }}>
                  {ORDER_STATUSES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`tab maroon ${adjustments.status === st.id ? 'active' : ''}`}
                      style={{ padding: '7px 10px', fontSize: '12px' }}
                      onClick={() =>
                        setAdjustments((prev) => ({ ...prev, status: st.id }))
                      }
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* Right Column: Sticky Live Summary + Multi-Window List */}
        <aside id="curtain-summary-side" className="workspace-side">
          <div className="sticky-panel">
            {addedWindows.length > 0 && (
              <div className="form-card cart-summary-card">
                <div className="form-section-title">
                  ઉમેરેલા પડદા / બારીઓ ({addedWindows.length})
                </div>
                {addedWindows.map((win) => (
                  <div key={win.id} className="cart-item-pill">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="cart-item-title">
                        {win.roomName} · {win.typeName}
                      </div>
                      <div className="cart-item-amt">
                        {win.measurements?.height || 0}"×{win.measurements?.width || 0}" ·{' '}
                        {fmtCurtain(win.subtotal)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn-mini"
                        onClick={() => handleEditAddedWindow(win)}
                        title="સુધારો"
                      >
                        <EditIcon size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-del"
                        onClick={() => handleRemoveAddedWindow(win.id)}
                        title="દૂર કરો"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {includeActiveInTotal && (
                  <div className="cart-active-row">
                    <span>હાલની બારી ({roomName || 'નવી'}):</span>
                    <strong>{fmtCurtain(activeSubtotal)}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="totals-card">
              <div className="form-section-title">
                વિગતવાર ગણતરી ({roomName || 'હાલની બારી'})
              </div>
              {activeItems.map((item, idx) => (
                <div key={idx} className="total-row">
                  <span>{item.label}</span>
                  <span>{fmtCurtain(item.value)}</span>
                </div>
              ))}

              <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                {addedWindows.length > 0 && (
                  <div className="total-row">
                    <span>અગાઉની બારીઓ ({addedWindows.length})</span>
                    <span>{fmtCurtain(addedSubtotal)}</span>
                  </div>
                )}
                <div className="total-row">
                  <span>પેટા-કુલ (Subtotal)</span>
                  <span>{fmtCurtain(subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>+ કમિશન ({adjustments.commission}%)</span>
                  <span>{fmtCurtain(commissionAmt)}</span>
                </div>
                <div className="total-row">
                  <span>+ જીએસટી (GST {adjustments.gst}%)</span>
                  <span>{fmtCurtain(gstAmt)}</span>
                </div>
                <div className="total-row">
                  <span>− ડિસ્કાઉન્ટ (Discount)</span>
                  <span>{fmtCurtain(num(adjustments.discount))}</span>
                </div>
                <div className="total-row grand curtain">
                  <span>કુલ રકમ (Grand Total)</span>
                  <span>{fmtCurtain(grandTotal)}</span>
                </div>
                {num(adjustments.advance) > 0 && (
                  <>
                    <div className="total-row" style={{ marginTop: '6px' }}>
                      <span>એડવાન્સ / બાનું (Advance)</span>
                      <span>− {fmtCurtain(num(adjustments.advance))}</span>
                    </div>
                    <div className="total-row balance-due">
                      <span>બાકી રકમ (Balance Due)</span>
                      <span>
                        {fmtCurtain(Math.max(0, grandTotal - num(adjustments.advance)))}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="side-actions no-print">
                <button
                  type="button"
                  className="btn btn-outline btn-full"
                  onClick={handleAddWindow}
                >
                  <PlusIcon size={17} />
                  <span>બીજો પડદો / બારી ઉમેરો</span>
                </button>
                {onAddToMainQuote && !isEditing && (
                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={handleTransferToCombinedQuote}
                  >
                    <CartPlusIcon size={17} />
                    <span>મુખ્ય કોટેશનમાં ઉમેરો (Sofa + પડદા)</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-maroon btn-full"
                  onClick={handleSaveQuotation}
                >
                  <CheckIcon size={17} />
                  <span>{isEditing ? 'અપડેટ કરો (Update)' : 'સેવ કરો (Save Quote)'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-whatsapp btn-full"
                  onClick={handleWhatsApp}
                >
                  <WhatsAppIcon size={17} />
                  <span>WhatsApp પર મોકલો</span>
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-full"
                  onClick={handlePrint}
                >
                  <PrintIcon size={17} />
                  <span>PDF ડાઉનલોડ</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <MobileStickyBar
        label="કુલ રકમ"
        value={fmtCurtain(grandTotal)}
        subText={
          num(adjustments.advance) > 0
            ? `બાકી: ${fmtCurtain(Math.max(0, grandTotal - num(adjustments.advance)))}`
            : addedWindows.length > 0
            ? `${addedWindows.length + (includeActiveInTotal ? 1 : 0)} બારી`
            : undefined
        }
        actionLabel={isEditing ? 'અપડેટ કરો' : 'સેવ કરો ✓'}
        onAction={handleSaveQuotation}
        targetSideId="curtain-summary-side"
        variant="maroon"
      />
    </div>
  );
}
