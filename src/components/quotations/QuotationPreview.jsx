import { fmt } from '../../utils/formatters';
import {
  buildSofaWhatsAppMessage,
  shareOnWhatsApp,
} from '../../utils/whatsappShare';
import {
  ArrowLeftIcon,
  CheckIcon,
  PrintIcon,
  ServiceIcon,
  WhatsAppIcon,
} from '../common/Icons';

export default function QuotationPreview({
  customerName,
  customerPhone,
  quotationDate,
  service,
  serviceLabel,
  mattressThickness,
  mattressWarranty,
  breakdown,
  totals,
  commission,
  gst,
  discount,
  isEditing,
  settings,
  onSave,
  onEdit,
  onPrint,
  showToast,
}) {
  const isMatt = service?.id === 'mattress';
  const resolvedLabel = serviceLabel || service?.label || '';

  const handleWhatsApp = () => {
    const mockQuote = {
      customerName,
      customerPhone,
      date: quotationDate,
      serviceType: service?.id || 'multi',
      serviceLabel: resolvedLabel,
      mattressThickness,
      mattressWarranty,
      commission,
      gst,
      discount,
      breakdown,
      totals,
    };
    const msg = buildSofaWhatsAppMessage(mockQuote, settings);
    shareOnWhatsApp({ phone: customerPhone, message: msg, showToast });
  };

  return (
    <div>
      <div className="form-header no-print">
        <button
          type="button"
          className="back-btn"
          onClick={onEdit}
          title="ફરી સુધારો"
        >
          <ArrowLeftIcon size={18} />
        </button>
        <div>
          <h2 className="form-title">Quotation Preview (કોટેશન પ્રિવ્યૂ)</h2>
        </div>
      </div>

      <div className="print-container">
        <div className="form-card">
          <div className="quote-view-header">
            <div className="logo-text">{settings?.shopName || 'Sofa Craft'}</div>
            <div className="sub">
              {settings?.shopTagline || 'Professional Quotation'}
            </div>
            {(settings?.shopPhone || settings?.shopAddress) && (
              <div className="sub" style={{ marginTop: '4px' }}>
                {[settings.shopPhone, settings.shopAddress].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>

          <div className="quote-meta-grid">
            <div className="meta-item">
              <div className="label">Customer (ગ્રાહક)</div>
              <div className="value">{customerName || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">Phone (ફોન)</div>
              <div className="value">{customerPhone || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">Date (તારીખ)</div>
              <div className="value">{quotationDate}</div>
            </div>
            <div className="meta-item">
              <div className="label">Service (સેવા)</div>
              <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {service && <ServiceIcon id={service.id} size={16} />}
                <span>{resolvedLabel}</span>
              </div>
            </div>
            {isMatt && (
              <>
                <div className="meta-item">
                  <div className="label">Mattress (જાડાઈ)</div>
                  <div className="value">
                    {mattressThickness === '4inch' ? '4 Inch' : '6 Inch'}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="label">Warranty (વોરંટી)</div>
                  <div className="value">
                    {mattressWarranty === '10year' ? '10-Year' : '15-Year'}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="form-section-title">Breakdown (વિગતવાર ખર્ચ)</div>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Details</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {breakdown && breakdown.length > 0 ? (
                breakdown.map((item, idx) =>
                  item.header ? (
                    <tr key={idx} className="breakdown-group-row">
                      <td colSpan="3">{item.label}</td>
                    </tr>
                  ) : (
                    <tr
                      key={idx}
                      style={item.info ? { background: 'var(--surface2)' } : undefined}
                    >
                      <td style={item.info ? { color: 'var(--text3)' } : undefined}>
                        {item.label}
                      </td>
                      <td style={{ color: 'var(--text2)', fontSize: '12px' }}>
                        {item.value}
                      </td>
                      <td>{item.amount != null ? '₹ ' + fmt(item.amount) : ''}</td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{ textAlign: 'center', color: 'var(--text3)', padding: '16px' }}
                  >
                    No items entered
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="form-section-title" style={{ marginTop: '20px' }}>
            Totals (કુલ ગણતરી)
          </div>
          <div className="total-row">
            <span>Subtotal</span>
            <span>₹ {fmt(totals.sub)}</span>
          </div>
          <div className="total-row">
            <span>Commission ({commission}%)</span>
            <span>₹ {fmt(totals.commission)}</span>
          </div>
          <div className="total-row">
            <span>Discount</span>
            <span>- ₹ {fmt(totals.disc)}</span>
          </div>
          <div className="total-row">
            <span>GST ({gst}%)</span>
            <span>₹ {fmt(totals.gstAmt)}</span>
          </div>
          <div className="total-row grand">
            <span>Grand Total</span>
            <span>₹ {fmt(totals.grand)}</span>
          </div>

          {settings?.quoteNote && (
            <div className="quote-footer-note">{settings.quoteNote}</div>
          )}
        </div>
      </div>

      <div className="actions no-print">
        <button type="button" className="btn btn-primary" onClick={onSave}>
          <CheckIcon size={17} />
          <span>{isEditing ? 'Update Quotation (અપડેટ કરો)' : 'Save Quotation (સેવ કરો)'}</span>
        </button>
        <button type="button" className="btn btn-whatsapp" onClick={handleWhatsApp}>
          <WhatsAppIcon size={17} />
          <span>WhatsApp</span>
        </button>
        <button type="button" className="btn btn-success" onClick={onPrint}>
          <PrintIcon size={17} />
          <span>Print (પ્રિન્ટ)</span>
        </button>
        <button type="button" className="btn btn-secondary" onClick={onEdit}>
          <ArrowLeftIcon size={17} />
          <span>Edit (ફરી સુધારો)</span>
        </button>
      </div>
    </div>
  );
}
