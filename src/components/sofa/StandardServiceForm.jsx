import { num, fmt } from '../../utils/formatters';

export default function StandardServiceForm({
  selectedService,
  formData,
  onChangeField,
}) {
  const fd = formData || {};
  const defaultRate = selectedService === 'structure' ? 1950 : 1250;
  const currentRate = fd.rate !== undefined && fd.rate !== '' ? fd.rate : defaultRate;
  const total = num(fd.feet) * num(currentRate);

  return (
    <div className="form-card">
      <div className="form-section-title">માપ અને દર (Dimensions & Rate)</div>
      <div className="form-row">
        <div className="form-group">
          <label>સોફાનું કદ (ફૂટ માં / Feet)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={fd.feet !== undefined ? fd.feet : ''}
            placeholder="e.g. 7"
            onChange={(e) => onChangeField('feet', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>
            દર પ્રતિ ફૂટ (₹/ft){' '}
            <span style={{ color: 'var(--text3)', fontSize: '11px' }}>
              default ₹{defaultRate}
            </span>
          </label>
          <input
            type="number"
            min="0"
            value={fd.rate !== undefined ? fd.rate : defaultRate}
            onChange={(e) => onChangeField('rate', e.target.value)}
          />
        </div>
      </div>
      <div className="form-row single">
        <div className="form-group">
          <label>કુલ ટોટલ (Total)</label>
          <div className="calc-result">₹ {fmt(total)}</div>
        </div>
      </div>
    </div>
  );
}
