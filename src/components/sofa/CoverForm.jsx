import { num, fmt } from '../../utils/formatters';

export default function CoverForm({
  coverType,
  setCoverType,
  formData,
  onChangeField,
}) {
  const fd = formData || {};
  const ct = coverType;

  const kapadAmt = num(fd.kapad_rate) * num(fd.kapad_meter);
  const stanzoAmt = ct === 'sponge' ? num(fd.stanzo_rate) * num(fd.stanzo_meter) : 0;
  const fevicolAmt = ct === 'sponge' ? num(fd.fevicol_rate) * num(fd.fevicol_qty) : 0;
  const labour = num(fd.labour);
  const matCost = kapadAmt + stanzoAmt + fevicolAmt;
  const total = matCost + labour;

  return (
    <div className="form-card">
      <div className="form-section-title">Cover Type (કવરનો પ્રકાર)</div>
      <div className="tab-group">
        <button
          type="button"
          className={`tab ${ct === 'simple' ? 'active' : ''}`}
          onClick={() => setCoverType('simple')}
        >
          સાદા કવર (Simple Cover)
        </button>
        <button
          type="button"
          className={`tab ${ct === 'sponge' ? 'active' : ''}`}
          onClick={() => setCoverType('sponge')}
        >
          સ્પંચવાળા કવર (Sponge Cover)
        </button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>કાપડનો દર (₹/મીટર)</label>
          <input
            type="number"
            min="0"
            value={fd.kapad_rate !== undefined ? fd.kapad_rate : 450}
            placeholder="450"
            onChange={(e) => onChangeField('kapad_rate', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>કાપડ મીટર (Meter)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={fd.kapad_meter !== undefined ? fd.kapad_meter : ''}
            placeholder="0"
            onChange={(e) => onChangeField('kapad_meter', e.target.value)}
          />
        </div>
      </div>

      {ct === 'sponge' && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>Stanzo (પેડિંગ) દર (₹/મીટર)</label>
              <input
                type="number"
                min="0"
                value={fd.stanzo_rate !== undefined ? fd.stanzo_rate : 260}
                placeholder="260"
                onChange={(e) => onChangeField('stanzo_rate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Stanzo (પેડિંગ) મીટર (Meter)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={fd.stanzo_meter !== undefined ? fd.stanzo_meter : ''}
                placeholder="0"
                onChange={(e) => onChangeField('stanzo_meter', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fevicol (ફેવિકોલ) દર (₹/લિટર)</label>
              <input
                type="number"
                min="0"
                value={fd.fevicol_rate !== undefined ? fd.fevicol_rate : 350}
                placeholder="350"
                onChange={(e) => onChangeField('fevicol_rate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Fevicol (ફેવિકોલ) લિટર (Liter)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={fd.fevicol_qty !== undefined ? fd.fevicol_qty : ''}
                placeholder="0"
                onChange={(e) => onChangeField('fevicol_qty', e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Labour (મજૂરી) (₹)</label>
          <input
            type="number"
            min="0"
            value={fd.labour !== undefined ? fd.labour : 1000}
            placeholder="1000"
            onChange={(e) => onChangeField('labour', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Total (કુલ ખર્ચ)</label>
          <div className="calc-result">₹ {fmt(total)}</div>
        </div>
      </div>

      <div
        style={{
          padding: '10px 14px',
          background: 'var(--accent-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(193,127,58,.15)',
          fontSize: '13px',
          color: 'var(--accent)',
          marginTop: '6px',
        }}
      >
        માલસામાન : ₹{fmt(matCost)} + મજૂરી : ₹{fmt(labour)} = <strong>₹{fmt(total)}</strong>
      </div>
    </div>
  );
}
