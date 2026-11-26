import { useState } from 'react';
import { fmt, num } from '../../utils/formatters';
import { ORDER_STATUSES, getStatusMeta } from '../../constants/orderStatus';
import { exportSofaPDF } from '../../utils/pdfExport';
import {
  buildSofaWhatsAppMessage,
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

export default function QuotationDetail({
  quote,
  settings,
  onBack,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateQuoteMeta,
  showToast,
}) {
  const [draftAdvance, setDraftAdvance] = useState(() =>
    quote?.advance > 0 ? String(quote.advance) : ''
  );

  if (!quote) {
    return (
      <div className="empty-state">
        <p>Quotation not found.</p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeftIcon size={17} />
          <span>Back to All Quotations</span>
        </button>
      </div>
    );
  }

  const t = quote.totals || {};
  const isMatt = quote.serviceType === 'mattress';
  const adv = Math.max(0, num(quote.advance));
  const balance = Math.max(0, num(t.grand) - adv);
  const statusMeta = getStatusMeta(quote.status);

  const handleDelete = () => {
    if (window.confirm('આ કોટેશન ખરેખર ડિલીટ કરવું છે? (Are you sure you want to delete this quotation?)')) {
      onDelete(quote.id);
    }
  };

  const handleDownloadPDF = () => {
    exportSofaPDF(quote, showToast, settings);
  };

  const handleWhatsApp = () => {
    const message = buildSofaWhatsAppMessage(quote, settings);
    shareOnWhatsApp({
      phone: quote.customerPhone,
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
        <h2 className="form-title">કોટેશન વિગત (Quotation Details)</h2>
      </div>

      <div className="print-container">
        <div className="form-card">
          <div className="quote-view-header">
            <div className="logo-text">{settings?.shopName || 'Sofa Craft'}</div>
            <div className="sub">
              {settings?.shopTagline || 'Professional Quotation'} · #{quote.id}
            </div>
            {(settings?.shopPhone || settings?.shopAddress) && (
              <div className="sub" style={{ marginTop: '4px' }}>
                {[settings.shopPhone, settings.shopAddress].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>

          <div className="quote-meta-grid">
            <div className="meta-item">
              <div className="label">ગ્રાહક (Customer)</div>
              <div className="value">{quote.customerName || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">ફોન નંબર (Phone)</div>
              <div className="value">{quote.customerPhone || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">તારીખ (Date)</div>
              <div className="value">{quote.date}</div>
            </div>
            <div className="meta-item">
              <div className="label">સેવા (Service)</div>
              <div className="value">
                {quote.serviceLabel || quote.serviceType}
              </div>
            </div>
            <div className="meta-item">
              <div className="label">સ્ટેટસ (Status)</div>
              <div className="value">
                <span className={`status-pill status-${statusMeta.id}`}>
                  {statusMeta.label}
                </span>
              </div>
            </div>
            {isMatt && (
              <>
                <div className="meta-item">
                  <div className="label">ગાદલાની જાડાઈ</div>
                  <div className="value">
                    {quote.mattressThickness === '4inch' ? '4 Inch' : '6 Inch'}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="label">વોરંટી (Warranty)</div>
                  <div className="value">
                    {quote.mattressWarranty === '10year' ? '10-Year' : '15-Year'}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="form-section-title">વિગતવાર ખર્ચ (Breakdown)</div>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>વિગત (Item)</th>
                <th>માપ / વિગત (Details)</th>
                <th>રકમ (Amount)</th>
              </tr>
            </thead>
            <tbody>
              {quote.breakdown && quote.breakdown.length > 0 ? (
                quote.breakdown.map((item, idx) =>
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
                    style={{ textAlign: 'center', color: 'var(--text3)', padding: '12px' }}
                  >
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="form-section-title" style={{ marginTop: '20px' }}>
            કુલ રકમ (Totals)
          </div>
          <div className="total-row">
            <span>પેટા-કુલ (Subtotal)</span>
            <span>₹ {fmt(t.sub)}</span>
          </div>
          <div className="total-row">
            <span>+ કમિશન (Commission {quote.commission || 0}%)</span>
            <span>₹ {fmt(t.commission)}</span>
          </div>
          <div className="total-row">
            <span>− ડિસ્કાઉન્ટ (Discount)</span>
            <span>- ₹ {fmt(t.disc || t.discount || 0)}</span>
          </div>
          <div className="total-row">
            <span>+ જીએસટી (GST {quote.gst || 0}%)</span>
            <span>₹ {fmt(t.gstAmt)}</span>
          </div>
          <div className="total-row grand">
            <span>કુલ રકમ (Grand Total)</span>
            <span>₹ {fmt(t.grand)}</span>
          </div>
          {adv > 0 && (
            <>
              <div className="total-row">
                <span>એડવાન્સ / બાનું (Advance)</span>
                <span>- ₹ {fmt(adv)}</span>
              </div>
              <div className="total-row balance-due">
                <span>બાકી રકમ (Balance Due)</span>
                <span>₹ {fmt(balance)}</span>
              </div>
            </>
          )}

          {settings?.quoteNote && (
            <div className="quote-footer-note">{settings.quoteNote}</div>
          )}
        </div>
      </div>

      {onUpdateQuoteMeta && (
        <div className="form-card quick-status-card no-print">
          <div className="form-section-title">
            ઓર્ડર સ્ટેટસ અને બાનું અપડેટ (Quick Update)
          </div>
          <div className="quick-status-grid">
            <div>
              <div className="input-label">સ્ટેટસ બદલો</div>
              <div className="status-pills-row">
                {ORDER_STATUSES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    className={`status-choice-btn ${statusMeta.id === st.id ? `active status-${st.id}` : ''}`}
                    onClick={() => onUpdateQuoteMeta(quote.id, { status: st.id })}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="input-label" htmlFor="sofa-detail-advance">
                એડવાન્સ / બાનું (₹)
              </label>
              <div className="quick-advance-row">
                <input
                  id="sofa-detail-advance"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={draftAdvance}
                  onChange={(e) => setDraftAdvance(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '9px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
                  onClick={() =>
                    onUpdateQuoteMeta(quote.id, {
                      advance: Math.max(0, num(draftAdvance)),
                    })
                  }
                >
                  બાનું સેવ કરો
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="actions no-print">
        <button type="button" className="btn btn-primary" onClick={handleDownloadPDF}>
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
