import { ORDER_STATUSES, getStatusMeta } from '../../constants/orderStatus';
import CollapsibleCard from '../common/CollapsibleCard';

export default function AdjustmentsForm({
  commission,
  gst,
  discount,
  advance,
  status = 'pending',
  onChangeAdjustment,
}) {
  const statusLabel = getStatusMeta(status).label;
  const parts = [statusLabel];
  if (Number(gst) > 0) parts.push(`GST ${gst}%`);
  if (Number(advance) > 0) parts.push(`બાનું ₹${Number(advance).toLocaleString('en-IN')}`);

  return (
    <CollapsibleCard
      title="કમિશન · જીએસટી · બાનું · સ્ટેટસ"
      summary={parts.join(' · ')}
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
            value={commission !== undefined ? commission : 0}
            onChange={(e) => onChangeAdjustment('commission', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>જીએસટી (%)</label>
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
          <label>ડિસ્કાઉન્ટ (₹)</label>
          <input
            type="number"
            min="0"
            value={discount !== undefined ? discount : 0}
            onChange={(e) => onChangeAdjustment('discount', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row mobile-stack" style={{ marginBottom: 0, alignItems: 'end' }}>
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
                style={{ padding: '7px 10px', fontSize: '12px' }}
                onClick={() => onChangeAdjustment('status', st.id)}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleCard>
  );
}
