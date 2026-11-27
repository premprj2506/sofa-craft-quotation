import { Fragment, useState } from 'react';
import { fmtCurtain, num } from '../../utils/formatters';
import { ORDER_STATUSES, getStatusMeta } from '../../constants/orderStatus';
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
  ArrowVerticalIcon,
  ArrowHorizontalIcon,
} from '../common/Icons';

export default function CurtainDetail({
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
        <p>પડદા કોટેશન મળ્યું નથી.</p>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeftIcon size={17} />
          <span>પાછા જાઓ</span>
        </button>
      </div>
    );
  }

  const isMulti = Array.isArray(quote.windows) && quote.windows.length > 0;
  const adv = Math.max(0, num(quote.advance));
  const balance = Math.max(0, num(quote.grandTotal) - adv);
  const statusMeta = getStatusMeta(quote.status);

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
              <div className="label">ગ્રાહક (Customer)</div>
              <div className="value">{quote.customer?.name || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">ફોન નંબર (Phone)</div>
              <div className="value">{quote.customer?.phone || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">તારીખ (Date)</div>
              <div className="value">{quote.customer?.date || '—'}</div>
            </div>
            <div className="meta-item">
              <div className="label">પડદાનો પ્રકાર</div>
              <div className="value">{quote.typeName}</div>
            </div>
            <div className="meta-item">
              <div className="label">સ્ટેટસ (Status)</div>
              <div className="value">
                <span className={`status-pill status-${statusMeta.id}`}>
                  {statusMeta.label}
                </span>
              </div>
            </div>
            {!isMulti && quote.measurements && (
              <>
                <div className="meta-item">
                  <div className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowVerticalIcon size={12} /> ઊંચાઈ × <ArrowHorizontalIcon size={12} /> લંબાઈ / પહોળાઈ
                  </div>
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
              {isMulti ? (
                quote.windows.map((win, wIdx) => (
                  <Fragment key={win.id || wIdx}>
                    <tr className="breakdown-group-row">
                      <td colSpan="3" style={{ color: 'var(--curtain-maroon)', background: '#fbf0f2' }}>
                        {wIdx + 1}. {win.roomName || `બારી ${wIdx + 1}`} — {win.typeName} (
                        {win.measurements?.height || 0}" × {win.measurements?.width || 0}") ·{' '}
                        {fmtCurtain(win.subtotal)}
                      </td>
                    </tr>
                    {(win.items || []).map((item, iIdx) => (
                      <tr key={`row-${wIdx}-${iIdx}`}>
                        <td>{item.label}</td>
                        <td style={{ color: 'var(--text2)', fontSize: '12px' }}>—</td>
                        <td>{fmtCurtain(item.value)}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))
              ) : (
                (quote.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.label}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '12px' }}>—</td>
                    <td>{fmtCurtain(item.value)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="form-section-title" style={{ marginTop: '20px' }}>
            કુલ રકમ (Totals)
          </div>
          <div className="total-row">
            <span>પેટા-કુલ (Subtotal)</span>
            <span>{fmtCurtain(quote.subtotal)}</span>
          </div>
          <div className="total-row">
            <span>+ કમિશન (Commission)</span>
            <span>{fmtCurtain(quote.commissionAmt)}</span>
          </div>
          <div className="total-row">
            <span>+ જીએસટી (GST)</span>
            <span>{fmtCurtain(quote.gstAmt)}</span>
          </div>
          <div className="total-row">
            <span>− ડિસ્કાઉન્ટ (Discount)</span>
            <span>{fmtCurtain(quote.discount)}</span>
          </div>
          <div className="total-row grand curtain">
            <span>કુલ રકમ (Grand Total)</span>
            <span>{fmtCurtain(quote.grandTotal)}</span>
          </div>
          {adv > 0 && (
            <>
              <div className="total-row">
                <span>એડવાન્સ / બાનું (Advance)</span>
                <span>- {fmtCurtain(adv)}</span>
              </div>
              <div className="total-row balance-due">
                <span>બાકી રકમ (Balance Due)</span>
                <span>{fmtCurtain(balance)}</span>
              </div>
            </>
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
              <label className="input-label" htmlFor="curtain-detail-advance">
                એડવાન્સ / બાનું (₹)
              </label>
              <div className="quick-advance-row">
                <input
                  id="curtain-detail-advance"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={draftAdvance}
                  onChange={(e) => setDraftAdvance(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-maroon"
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
