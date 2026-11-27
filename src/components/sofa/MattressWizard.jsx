import {
  getMattressCompanies,
  getMattressCompany,
  getMattressWarrantyObj,
  getMattressRateFromSettings,
} from '../../utils/settings';
import { num, fmt, fmtRaw, roundToCustomFeet } from '../../utils/formatters';
import {
  MattressIcon,
  BedIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '../common/Icons';

export default function MattressWizard({
  mattressStep,
  setMattressStep,
  mattressCompany,
  setMattressCompany,
  mattressThickness,
  setMattressThickness,
  mattressWarranty,
  setMattressWarranty,
  formData,
  onChangeField,
  onBackToServices,
  settings,
}) {
  const fd = formData || {};
  const companies = getMattressCompanies(settings);
  const selectedCompany = getMattressCompany(mattressCompany, settings);

  const handleSelectCompany = (compId) => {
    if (setMattressCompany) setMattressCompany(compId);
    setMattressWarranty(null);
  };

  const handleSelectThickness = (thk) => {
    setMattressThickness(thk);
    setMattressWarranty(null);
  };

  const handleSelectWarranty = (warId) => {
    setMattressWarranty(warId);
    const rate = getMattressRateFromSettings(
      mattressThickness,
      warId,
      settings,
      selectedCompany.id
    );
    onChangeField('rate', rate);
  };

  const renderStepIndicator = () => (
    <div className="step-indicator no-print">
      <div className={`step-dot ${mattressStep > 1 ? 'done' : mattressStep === 1 ? 'active' : ''}`}>
        {mattressStep > 1 ? <CheckIcon size={14} /> : '1'}
      </div>
      <div className={`step-line ${mattressStep > 1 ? 'done' : ''}`} />
      <div className={`step-dot ${mattressStep > 2 ? 'done' : mattressStep === 2 ? 'active' : ''}`}>
        {mattressStep > 2 ? <CheckIcon size={14} /> : '2'}
      </div>
      <div className={`step-line ${mattressStep > 2 ? 'done' : ''}`} />
      <div className={`step-dot ${mattressStep === 3 ? 'active' : ''}`}>
        3
      </div>
    </div>
  );

  // Step 1: Company + Thickness
  if (mattressStep === 1) {
    return (
      <>
        {renderStepIndicator()}
        <div className="form-card">
          <div className="form-section-title">Step 1 — કંપની અને જાડાઈ પસંદ કરો</div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: 600,
                color: 'var(--text2)',
                marginBottom: '8px',
              }}
            >
              ગાદલાની કંપની પસંદ કરો (Company):
            </label>
            <div className="tab-group" style={{ marginBottom: 0 }}>
              {companies.map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  className={`tab purple ${selectedCompany.id === comp.id ? 'active' : ''}`}
                  onClick={() => handleSelectCompany(comp.id)}
                >
                  {comp.name}
                </button>
              ))}
            </div>
          </div>

          <div className="step-selector">
            <div
              className={`step-option ${mattressThickness === '4inch' ? 'selected' : ''}`}
              onClick={() => handleSelectThickness('4inch')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelectThickness('4inch');
              }}
            >
              <div className="opt-icon-box">
                <MattressIcon size={28} />
              </div>
              <div className="opt-title">4 Inch</div>
              <div className="opt-sub">Standard comfort</div>
            </div>
            <div
              className={`step-option ${mattressThickness === '6inch' ? 'selected' : ''}`}
              onClick={() => handleSelectThickness('6inch')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelectThickness('6inch');
              }}
            >
              <div className="opt-icon-box">
                <BedIcon size={28} />
              </div>
              <div className="opt-title">6 Inch</div>
              <div className="opt-sub">Premium thick</div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBackToServices}
            >
              <ArrowLeftIcon size={17} />
              <span>રદ કરો</span>
            </button>
            {mattressThickness ? (
              <button
                type="button"
                className="btn btn-purple"
                onClick={() => setMattressStep(2)}
              >
                <span>આગળ: વોરંટી</span>
                <ArrowRightIcon size={17} />
              </button>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text3)', alignSelf: 'center' }}>
                આગળ વધવા માટે જાડાઈ પસંદ કરો.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  // Step 2: Warranty
  if (mattressStep === 2) {
    const thkLabel = mattressThickness === '4inch' ? '4 Inch' : '6 Inch';

    return (
      <>
        {renderStepIndicator()}
        <div className="form-card">
          <div className="form-section-title">
            Step 2 — વોરંટી પસંદ કરો ({selectedCompany.name} · {thkLabel})
          </div>
          <div className="step-pills">
            {selectedCompany.warranties.map((w) => {
              const wRate = mattressThickness === '4inch' ? w.rate4 : w.rate6;
              return (
                <button
                  key={w.id}
                  type="button"
                  className={`step-pill ${mattressWarranty === w.id ? 'selected' : ''}`}
                  onClick={() => handleSelectWarranty(w.id)}
                >
                  {w.label} · ₹{wRate}/ft
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setMattressStep(1)}
            >
              <ArrowLeftIcon size={17} />
              <span>પાછળ</span>
            </button>
            {mattressWarranty && (
              <button
                type="button"
                className="btn btn-purple"
                onClick={() => setMattressStep(3)}
              >
                <span>આગળ: માપ દાખલ કરો</span>
                <ArrowRightIcon size={17} />
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // Step 3: Dimensions & Calculation
  const thkLabel = mattressThickness === '4inch' ? '4 Inch' : '6 Inch';
  const warObj = getMattressWarrantyObj(
    selectedCompany.id,
    mattressWarranty,
    settings
  );
  const warLabel = warObj?.label || '10-Year';
  const defaultRate = getMattressRateFromSettings(
    mattressThickness,
    mattressWarranty,
    settings,
    selectedCompany.id
  );
  const currentRate = fd.rate !== undefined && fd.rate !== '' ? fd.rate : defaultRate;

  const w = num(fd.width);
  const h = num(fd.height);
  const rate = num(currentRate);
  const rawFeet = w && h ? (w * h) / 144 : 0;
  const rounded = rawFeet ? roundToCustomFeet(rawFeet) : 0;
  const cost = rounded * rate;

  return (
    <>
      {renderStepIndicator()}
      <div className="form-card">
        <div className="form-section-title">Step 3 — Dimensions & Calculation (ગણતરી)</div>
        <div className="info-box purple">
          <strong>{selectedCompany.name}</strong> · <strong>{thkLabel}</strong> ·{' '}
          <strong>{warLabel}</strong> · Default Rate: ₹{defaultRate}/ft
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>પહોળાઈ (ઇંચ / Width in inches)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={fd.width !== undefined ? fd.width : ''}
              placeholder="e.g. 60"
              onChange={(e) => onChangeField('width', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>લંબાઈ (ઇંચ / Height/Length in inches)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={fd.height !== undefined ? fd.height : ''}
              placeholder="e.g. 72"
              onChange={(e) => onChangeField('height', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row single">
          <div className="form-group">
            <label>દર પ્રતિ ફૂટ (₹/ft)</label>
            <input
              type="number"
              min="0"
              value={fd.rate !== undefined ? fd.rate : defaultRate}
              onChange={(e) => onChangeField('rate', e.target.value)}
            />
          </div>
        </div>

        {w && h ? (
          <div className="info-box amber">
            <strong>Calculation:</strong> ({w} × {h}) ÷ 144 = <strong>{fmtRaw(rawFeet)} ft</strong>
            {' '}→ Rounded: <strong>{rounded} ft</strong>
            {' '}→ Cost: {rounded} × ₹{rate} = <strong>₹{fmt(cost)}</strong>
          </div>
        ) : (
          <div className="info-box teal">
            ગણતરી જોવા માટે ઇંચમાં પહોળાઈ અને લંબાઈ દાખલ કરો.
          </div>
        )}

        <div style={{ marginTop: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setMattressStep(2)}
          >
            <ArrowLeftIcon size={17} />
            <span>વોરંટી / જાડાઈ બદલો</span>
          </button>
        </div>
      </div>
    </>
  );
}
