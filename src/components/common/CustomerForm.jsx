export default function CustomerForm({
  customerName,
  customerPhone,
  quotationDate,
  onChange,
}) {
  return (
    <div className="form-card">
      <div className="form-section-title">ગ્રાહક ની વિગતો (Customer Details)</div>
      <div className="form-row three">
        <div className="form-group">
          <label>ગ્રાહકનું નામ (Customer Name)</label>
          <input
            type="text"
            value={customerName || ''}
            placeholder="e.g. રમેશભાઈ પટેલ"
            onChange={(e) => onChange('customerName', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>ફોન નંબર (Phone Number)</label>
          <input
            type="text"
            value={customerPhone || ''}
            placeholder="e.g. 9876543210"
            onChange={(e) => onChange('customerPhone', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>ક્વોટેશન તારીખ (Date)</label>
          <input
            type="date"
            value={quotationDate || ''}
            onChange={(e) => onChange('quotationDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
