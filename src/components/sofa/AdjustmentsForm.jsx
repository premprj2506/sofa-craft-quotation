export default function AdjustmentsForm({
  commission,
  gst,
  discount,
  onChangeAdjustment,
}) {
  return (
    <div className="form-card no-print">
      <div className="form-section-title">Adjustments (સમાયોજનો)</div>
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
    </div>
  );
}
