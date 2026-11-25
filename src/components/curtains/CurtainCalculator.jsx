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
import CurtainList from './CurtainList';
import {
  ArrowLeftIcon,
  CurtainIcon,
  QuotesIcon,
  CheckIcon,
  PrintIcon,
  WhatsAppIcon,
} from '../common/Icons';

export default function CurtainCalculator({
  showToast,
  onBackToHome,
  onQuotesChange,
  initialQuote = null,
  isEditing = false,
  settings,
  onDoneEditing,
}) {
  const [currentType, setCurrentType] = useState(
    () => initialQuote?.type || 'eyelet'
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

  const [measurements, setMeasurements] = useState(() =>
    initialQuote?.measurements
      ? { ...initialQuote.measurements }
      : {
          height: '',
          width: '',
          fullness: CURTAIN_CONFIG.eyelet.fullness,
        }
  );

  const [dynamicValues, setDynamicValues] = useState(() => {
    const init = {};
    Object.keys(CURTAIN_CONFIG).forEach((k) => {
      init[k] = {};
      CURTAIN_CONFIG[k].fields.forEach((f) => {
        init[k][f.key] = f.def;
      });
    });
    if (initialQuote?.dynamicValues && initialQuote?.type) {
      init[initialQuote.type] = {
        ...init[initialQuote.type],
        ...initialQuote.dynamicValues,
      };
    }
    return init;
  });

  const [adjustments, setAdjustments] = useState(() =>
    initialQuote?.adjustments
      ? { ...initialQuote.adjustments }
      : {
          commission: 0,
          gst: 0,
          discount: initialQuote?.discount || 0,
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
  const items = cfg.calc(v);
  const subtotal = items.reduce((sum, item) => sum + (item.value || 0), 0);
  const commissionAmt = (subtotal * num(adjustments.commission)) / 100;
  const afterCommission = subtotal + commissionAmt;
  const gstAmt = (afterCommission * num(adjustments.gst)) / 100;
  const afterGst = afterCommission + gstAmt;
  const grandTotal = Math.max(0, afterGst - num(adjustments.discount));

  const buildRecord = (id) => ({
    id,
    type: currentType,
    typeName: cfg.name,
    customer: { ...customer },
    measurements: { ...measurements },
    dynamicValues: { ...(dynamicValues[currentType] || {}) },
    adjustments: { ...adjustments },
    items,
    subtotal,
    commissionAmt,
    gstAmt,
    discount: num(adjustments.discount),
    grandTotal,
  });

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
          <div className="form-card no-print">
            <div className="form-section-title">પડદા નો પ્રકાર પસંદ કરો</div>
            <div className="tab-group" style={{ marginBottom: 0 }}>
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
          </div>

          <div className="form-card">
            <div className="form-section-title">ગ્રાહક ની વિગત</div>
            <div className="form-row three">
              <div className="form-group">
                <label>ગ્રાહકનું નામ</label>
                <input
                  type="text"
                  value={customer.name}
                  placeholder="e.g. નરેશભાઈ"
                  onChange={(e) =>
                    setCustomer((prev) => ({ ...prev, name: e.target.value }))
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

          <div className="form-card">
            <div className="form-section-title">માપ અને પ્લીટિંગ</div>
            <div className="form-row three">
              <div className="form-group">
                <label>ઊંચાઈ - Height (ઇંચ)</label>
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
                <label>પહોળાઈ - Width (ઇંચ)</label>
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
            <div className="form-row">
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

          <div className="form-card no-print">
            <div className="form-section-title">કમિશન, જીએસટી અને ડિસ્કાઉન્ટ</div>
            <div className="form-row three">
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
          </div>
        </div>

        {/* Right Column: Sticky Live Summary */}
        <aside className="workspace-side">
          <div className="sticky-panel">
            <div className="totals-card">
              <div className="form-section-title">વિગતવાર ગણતરી (Breakdown)</div>
              {items.map((item, idx) => (
                <div key={idx} className="total-row">
                  <span>{item.label}</span>
                  <span>{fmtCurtain(item.value)}</span>
                </div>
              ))}

              <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{fmtCurtain(subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>+ કમિશન ({adjustments.commission}%)</span>
                  <span>{fmtCurtain(commissionAmt)}</span>
                </div>
                <div className="total-row">
                  <span>+ GST ({adjustments.gst}%)</span>
                  <span>{fmtCurtain(gstAmt)}</span>
                </div>
                <div className="total-row">
                  <span>− ડિસ્કાઉન્ટ</span>
                  <span>{fmtCurtain(num(adjustments.discount))}</span>
                </div>
                <div className="total-row grand curtain">
                  <span>કુલ રકમ</span>
                  <span>{fmtCurtain(grandTotal)}</span>
                </div>
              </div>

              <div className="side-actions no-print">
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
    </div>
  );
}
