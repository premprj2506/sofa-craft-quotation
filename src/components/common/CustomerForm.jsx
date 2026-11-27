import CustomerNameField from './CustomerNameField';

export default function CustomerForm({
  customerName,
  customerPhone,
  quotationDate,
  savedCustomers = [],
  onChange,
}) {
  return (
    <div className="form-card">
      <div className="form-section-title">ગ્રાહક ની વિગતો (Customer Details)</div>
      <div className="form-row three customer-grid" style={{ marginBottom: 0 }}>
        <div className="form-group customer-name-col">
          <label>ગ્રાહકનું નામ (Customer Name)</label>
          <CustomerNameField
            value={customerName}
            phoneValue={customerPhone}
            savedCustomers={savedCustomers}
            placeholder="e.g. રમેશભાઈ પટેલ"
            onChangeName={(val) => onChange('customerName', val)}
            onChangePhone={(val) => onChange('customerPhone', val)}
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
