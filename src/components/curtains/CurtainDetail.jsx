import { fmtCurtain } from '../../utils/formatters';
import { exportCurtainPDF } from '../../utils/pdfExport';
import {
  buildCurtainWhatsAppMessage,
  shareOnWhatsApp,
} from '../../utils/whatsappShare';
import {
  ArrowLeftIcon,
  DownloadIcon,
  PrintIcon,
  TrashIcon,
  WhatsAppIcon,
  EditIcon,
  CopyIcon,
} from '../common/Icons';

export default function CurtainDetail({
  quote,
  settings,
  onBack,
  onEdit,
  onDuplicate,
  onDelete,
  showToast,
}) {
  if (!quote) {
    return (
      <div className="empty-state">
        <p>પડદા કોટેશન મળ્યું નથી.</p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeftIcon size={17} />
          <span>પાછા જાઓ</span>
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('આ પડદા કોટેશન ખરેખર ડિલીટ કરવું છે?')) {
      onDelete(quote.id);
    }
  };

  const handleWhatsApp = () => {
    const message = buildCurtainWhatsAppMessage(quote, settings);
    shareOnWhatsApp({
      phone: quote.customer?.phone,
      message,
      showToast,
    });
  };

  return (
    <div>
      <div className="form-header no-print">
        <button type="button" className="back-btn" onClick={onBack} title="પાછા જાઓ">
          <ArrowLeftIcon size={18} />
        </button>
        <h2 className="form-title">પડદા કોટેશન વિગત</h2>
      </div>

      <div className="print-container">
        <div className="form-card">
          <div className="quote-view-header">
            <div className="logo-text" style={{ color: 'var(--curtain-maroon)' }}>
              {settings?.shopName || 'Sofa Craft'}
            </div>
            <div className="sub">પડદા એસ્ટિમેટ · #{quote.id}</div>
          </div>

          <div className="quote-meta-grid">
            <div className="meta-item">
              <div className="label">Customer (ગ્રાહક)</div>
              <div className="value">{quote.customer?.name || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">Phone (ફોન)</div>
              <div className="value">{quote.customer?.phone || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">Date (તારીખ)</div>
              <div className="value">{quote.customer?.date || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">પડદાનો પ્રકાર</div>
              <div className="value">{quote.typeName}</div>
            </div>
            {quote.measurements && (
              <>
                <div className="meta-item">
                  <div className="label">ઊંચાઈ × પહોળાઈ</div>
                  <div className="value">
                    {quote.measurements.height || 0}" × {quote.measurements.width || 0}"
                  </div>
                </div>
                <div className="meta-item">
                  <div className="label">ચપટી (Fullness)</div>
                  <div className="value">{quote.measurements.fullness || '—'}</div>
                </div>
              </>
            )}
          </div>

          <div className="form-section-title">વિગતવાર ખર્ચ (Breakdown)</div>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>વિગત</th>
                <th>માપ</th>
                <th>રકમ</th>
              </tr>
            </thead>
            <tbody>
              {(quote.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.label}</td>
                  <td style={{ color: 'var(--text2)', fontSize: '12px' }}>—</td>
                  <td>{fmtCurtain(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="form-section-title" style={{ marginTop: '20px' }}>
            Totals (કુલ રકમ)
          </div>
          <div className="total-row">
            <span>Subtotal</span>
            <span>{fmtCurtain(quote.subtotal)}</span>
          </div>
          <div className="total-row">
            <span>+ કમિશન</span>
            <span>{fmtCurtain(quote.commissionAmt)}</span>
          </div>
          <div className="total-row">
            <span>+ GST</span>
            <span>{fmtCurtain(quote.gstAmt)}</span>
          </div>
          <div className="total-row">
            <span>− ડિસ્કાઉન્ટ</span>
            <span>{fmtCurtain(quote.discount)}</span>
          </div>
          <div className="total-row grand curtain">
            <span>Grand Total</span>
            <span>{fmtCurtain(quote.grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="actions no-print">
        <button
          type="button"
          className="btn btn-maroon"
          onClick={() => exportCurtainPDF(quote, showToast, settings)}
        >
          <DownloadIcon size={17} />
          <span>Download PDF</span>
        </button>
        <button type="button" className="btn btn-whatsapp" onClick={handleWhatsApp}>
          <WhatsAppIcon size={17} />
          <span>WhatsApp</span>
        </button>
        <button type="button" className="btn btn-success" onClick={() => window.print()}>
          <PrintIcon size={17} />
          <span>Print</span>
        </button>
        {onEdit && (
          <button type="button" className="btn btn-secondary" onClick={() => onEdit(quote)}>
            <EditIcon size={17} />
            <span>Edit (સુધારો)</span>
          </button>
        )}
        {onDuplicate && (
          <button type="button" className="btn btn-secondary" onClick={() => onDuplicate(quote)}>
            <CopyIcon size={17} />
            <span>નકલ (Duplicate)</span>
          </button>
        )}
        <button type="button" className="btn btn-danger" onClick={handleDelete}>
          <TrashIcon size={17} />
          <span>Delete</span>
        </button>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ArrowLeftIcon size={17} />
          <span>Back</span>
        </button>
      </div>
    </div>
  );
}
