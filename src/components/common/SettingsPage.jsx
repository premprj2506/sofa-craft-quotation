import { useState } from 'react';
import { DEFAULT_SETTINGS } from '../../utils/settings';
import { REUPHOLSTERY_ITEMS } from '../../constants/services';
import { ArrowLeftIcon, CheckIcon, RestoreIcon } from './Icons';

export default function SettingsPage({ settings, onSave, onBack }) {
  const [draft, setDraft] = useState(() => structuredClone(settings));
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'sofa' | 'mattress'

  const updateShop = (key, val) => {
    setDraft((prev) => ({ ...prev, [key]: val }));
  };

  const updateRate = (key, val) => {
    setDraft((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [key]: val === '' ? 0 : Number(val),
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
          [key]: val === '' ? 0 : Number(val),
        },
      },
    }));
  };

  const updateMattressRate = (key, val) => {
    setDraft((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        mattress: {
          ...prev.rates.mattress,
          [key]: val === '' ? 0 : Number(val),
        },
      },
    }));
  };

  const handleReset = () => {
    if (window.confirm('બધા દરો અને સેટિંગ્સ ડિફોલ્ટ પર રિસેટ કરવા છે?')) {
      setDraft(structuredClone(DEFAULT_SETTINGS));
    }
  };

  return (
    <div>
      <div className="form-header no-print">
        <button type="button" className="back-btn" onClick={onBack} title="પાછા જાઓ">
          <ArrowLeftIcon size={18} />
        </button>
        <div>
          <h2 className="form-title">સેટિંગ્સ અને ડિફોલ્ટ દરો</h2>
        </div>
      </div>

      <div className="form-card">
        <div className="tab-group" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`tab ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => setActiveTab('shop')}
          >
            દુકાનની વિગત (Shop Info)
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'sofa' ? 'active' : ''}`}
            onClick={() => setActiveTab('sofa')}
          >
            સોફા અને મટિરિયલ દરો
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'mattress' ? 'active' : ''}`}
            onClick={() => setActiveTab('mattress')}
          >
            કવર અને ગાદલા દરો
          </button>
        </div>
      </div>

      {activeTab === 'shop' && (
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
      )}

      {activeTab === 'sofa' && (
        <div className="form-card">
          <div className="form-section-title">સોફા ડિફોલ્ટ દરો (₹)</div>
          <div className="form-row">
            <div className="form-group">
              <label>સ્ટ્રક્ચર સાથે (₹ / ફૂટ)</label>
              <input
                type="number"
                min="0"
                value={draft.rates.structureRate}
                onChange={(e) => updateRate('structureRate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>માલસામાન સાથે (₹ / ફૂટ)</label>
              <input
                type="number"
                min="0"
                value={draft.rates.upholsteryRate}
                onChange={(e) => updateRate('upholsteryRate', e.target.value)}
              />
            </div>
          </div>

          <div className="form-section-title" style={{ marginTop: '18px' }}>
            જૂના સોફા મઢવા માટે મટિરિયલ દરો (₹)
          </div>
          <div className="form-row">
            {REUPHOLSTERY_ITEMS.map((item) => (
              <div key={item.key} className="form-group">
                <label>
                  {item.label} ({item.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  value={draft.rates.reupholstery[`${item.key}_rate`] ?? 0}
                  onChange={(e) =>
                    updateReupRate(`${item.key}_rate`, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mattress' && (
        <div className="form-card">
          <div className="form-section-title">સોફા કવર ડિફોલ્ટ દરો (₹)</div>
          <div className="form-row">
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

          <div className="form-section-title" style={{ marginTop: '18px' }}>
            ગાદલા ડિફોલ્ટ દરો (₹ / ફૂટ)
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>4 Inch · 10-Year Warranty (₹/ft)</label>
              <input
                type="number"
                min="0"
                value={draft.rates.mattress['4inch_10year']}
                onChange={(e) =>
                  updateMattressRate('4inch_10year', e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>4 Inch · 15-Year Warranty (₹/ft)</label>
              <input
                type="number"
                min="0"
                value={draft.rates.mattress['4inch_15year']}
                onChange={(e) =>
                  updateMattressRate('4inch_15year', e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>6 Inch · 10-Year Warranty (₹/ft)</label>
              <input
                type="number"
                min="0"
                value={draft.rates.mattress['6inch_10year']}
                onChange={(e) =>
                  updateMattressRate('6inch_10year', e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>6 Inch · 15-Year Warranty (₹/ft)</label>
              <input
                type="number"
                min="0"
                value={draft.rates.mattress['6inch_15year']}
                onChange={(e) =>
                  updateMattressRate('6inch_15year', e.target.value)
                }
              />
            </div>
          </div>
        </div>
      )}

      <div className="actions no-print">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onSave(draft)}
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
          <span>રદ કરો</span>
        </button>
      </div>
    </div>
  );
}
