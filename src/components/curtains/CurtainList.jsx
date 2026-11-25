import { fmtCurtain } from '../../utils/formatters';
import { exportCurtainPDF } from '../../utils/pdfExport';
import {
  ArrowLeftIcon,
  CurtainIcon,
  DownloadIcon,
  TrashIcon,
} from '../common/Icons';

export default function CurtainList({
  quotations,
  onBack,
  onDelete,
  showToast,
}) {
  const handleDelete = (id) => {
    if (window.confirm('આ પડદા કોટેશન ડિલીટ કરવું છે? (Delete this curtain quote?)')) {
      onDelete(id);
    }
  };

  const handlePrint = (q) => {
    exportCurtainPDF(q, showToast);
  };

  return (
    <div>
      <div className="form-header no-print">
        <button type="button" className="back-btn" onClick={onBack} title="પાછા જાઓ">
          <ArrowLeftIcon size={18} />
        </button>
        <h2 className="form-title">સેવ કરેલા પડદા કોટેશન</h2>
      </div>

      <div className="quote-list">
        {quotations && quotations.length > 0 ? (
          quotations.map((q) => (
            <div key={q.id} className="quote-item curtain-row">
              <div className="quote-avatar curtain">
                <CurtainIcon size={20} />
              </div>
              <div className="quote-info">
                <div className="quote-name">
                  {q.customer?.name || 'નામ વગર (Unnamed)'}
                  {q.customer?.phone && (
                    <span className="quote-phone-pill">{q.customer.phone}</span>
                  )}
                </div>
                <div className="quote-meta">
                  <span className="quote-badge maroon">{q.typeName}</span>
                  <span>{q.customer?.date || 'No date'}</span>
                  {q.measurements && (
                    <span>
                      · {q.measurements.height}" × {q.measurements.width}"
                    </span>
                  )}
                </div>
              </div>
              <div className="quote-right-col">
                <div className="quote-total curtain">
                  {fmtCurtain(q.grandTotal)}
                </div>
                <div className="quote-inline-actions no-print">
                  <button
                    type="button"
                    className="btn-mini"
                    onClick={() => handlePrint(q)}
                  >
                    <DownloadIcon size={14} />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    className="btn-mini danger"
                    onClick={() => handleDelete(q.id)}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon-circle">
              <CurtainIcon size={32} />
            </div>
            <p>હજુ સુધી કોઈ પડદા કોટેશન સેવ થયું નથી.</p>
            <button
              type="button"
              className="btn btn-maroon"
              style={{ marginTop: '16px' }}
              onClick={onBack}
            >
              નવું પડદા કોટેશન બનાવો
            </button>
          </div>
        )}
      </div>

      <div className="actions no-print" style={{ marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeftIcon size={17} />
          <span>કેલ્ક્યુલેટર પર પાછા જાઓ</span>
        </button>
      </div>
    </div>
  );
}
