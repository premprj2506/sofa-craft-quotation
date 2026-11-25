import { calcBedCost } from '../../utils/calculations';
import { fmt, roundToCustomFeet } from '../../utils/formatters';

export default function BedForm({ bedType, setBedType, formData, onChangeField }) {
  const fd = formData || {};
  const pricingMode = fd.pricingMode || 'none';
  const cost = calcBedCost(fd);

  const hNum = parseFloat(fd.height) || 0;
  const wNum = parseFloat(fd.width) || 0;
  const sqft = hNum && wNum ? roundToCustomFeet((hNum * wNum) / 144) : 0;

  return (
    <div className="form-card">
      <div className="form-section-title">Bed Type & Dimensions (બેડ ના માપ)</div>
      <div className="tab-group">
        <button
          type="button"
          className={`tab ${bedType === 'bed' ? 'active' : ''}`}
          onClick={() => setBedType('bed')}
        >
          Bed (બેડ)
        </button>
        <button
          type="button"
          className={`tab ${bedType === 'bedback' ? 'active' : ''}`}
          onClick={() => setBedType('bedback')}
        >
          Bed Back (બેડ બેક)
        </button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Height (ઊંચાઈ · ઇંચમાં)</label>
          <input
            type="text"
            value={fd.height || ''}
            placeholder="e.g. 36"
            onChange={(e) => onChangeField('height', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Width (પહોળાઈ · ઇંચમાં)</label>
          <input
            type="text"
            value={fd.width || ''}
            placeholder="e.g. 60"
            onChange={(e) => onChangeField('width', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: '6px', marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text2)',
            marginBottom: '8px',
          }}
        >
          કિંમત ગણતરી વિકલ્પ (Optional Pricing):
        </label>
        <div className="tab-group" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`tab ${pricingMode === 'none' ? 'active' : ''}`}
            onClick={() => onChangeField('pricingMode', 'none')}
          >
            માત્ર માપ (કિંમત વગર)
          </button>
          <button
            type="button"
            className={`tab ${pricingMode === 'flat' ? 'active' : ''}`}
            onClick={() => onChangeField('pricingMode', 'flat')}
          >
            ફિક્સ કિંમત (₹)
          </button>
          <button
            type="button"
            className={`tab ${pricingMode === 'sqft' ? 'active' : ''}`}
            onClick={() => onChangeField('pricingMode', 'sqft')}
          >
            ચો.ફૂટ મુજબ (₹/ft)
          </button>
        </div>
      </div>

      {pricingMode === 'none' && (
        <div className="info-box teal" style={{ marginBottom: 0 }}>
          Dimensions recorded — માત્ર માપ સેવ થશે (ખર્ચ ₹0 રહેશે).
        </div>
      )}

      {pricingMode === 'flat' && (
        <div className="form-row">
          <div className="form-group">
            <label>ફિક્સ રકમ (₹)</label>
            <input
              type="number"
              min="0"
              value={fd.flatPrice !== undefined ? fd.flatPrice : ''}
              placeholder="e.g. 8500"
              onChange={(e) => onChangeField('flatPrice', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>કુલ ટોટલ</label>
            <div className="calc-result">₹ {fmt(cost)}</div>
          </div>
        </div>
      )}

      {pricingMode === 'sqft' && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>દર પ્રતિ ચો.ફૂટ (₹/ft)</label>
              <input
                type="number"
                min="0"
                value={fd.ratePerSqft !== undefined ? fd.ratePerSqft : ''}
                placeholder="e.g. 350"
                onChange={(e) => onChangeField('ratePerSqft', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>કુલ ટોટલ ({sqft} ફૂટ)</label>
              <div className="calc-result">₹ {fmt(cost)}</div>
            </div>
          </div>
          {hNum > 0 && wNum > 0 && (
            <div className="info-box amber" style={{ marginBottom: 0 }}>
              ({hNum}" × {wNum}") ÷ 144 → રાઉન્ડ ફૂટ: <strong>{sqft} ft</strong> × ₹{fd.ratePerSqft || 0} = <strong>₹ {fmt(cost)}</strong>
            </div>
          )}
        </>
      )}
    </div>
  );
}
