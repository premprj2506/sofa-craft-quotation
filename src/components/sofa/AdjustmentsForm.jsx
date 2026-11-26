import { ORDER_STATUSES } from '../../constants/orderStatus';

export default function AdjustmentsForm({
  commission,
  gst,
  discount,
  advance,
  status = 'pending',
  onChangeAdjustment,
}) {
  return (
    <div className="form-card no-print">
      <div className="form-section-title">Adjustments, બાનું અને સ્ટેટસ</div>
      <div className="form-row three">
        <div className="form-group">
          <label>Commission (%) કમિશન</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={commission !== undefined ? commission : 0}
            onChange={(e) => onChangeAdjustment('commission', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>GST (%) જીએસટી</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={gst !== undefined ? gst : 0}
            onChange={(e) => onChangeAdjustment('gst', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Discount (₹) ડિસ્કાઉન્ટ</label>
          <input
            type="number"
            min="0"
            value={discount !== undefined ? discount : 0}
            onChange={(e) => onChangeAdjustment('discount', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: 0, alignItems: 'end' }}>
        <div className="form-group">
          <label>એડવાન્સ / બાનું (₹)</label>
          <input
            type="number"
            min="0"
            value={advance !== undefined ? advance : 0}
            placeholder="0"
            onChange={(e) => onChangeAdjustment('advance', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>ઓર્ડર સ્ટેટસ</label>
          <div className="tab-group" style={{ marginBottom: 0 }}>
            {ORDER_STATUSES.map((st) => (
              <button
                key={st.id}
                type="button"
                className={`tab ${status === st.id ? 'active' : ''}`}
                style={{ padding: '8px 12px', fontSize: '12px' }}
                onClick={() => onChangeAdjustment('status', st.id)}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
