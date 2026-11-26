import { fmt, num } from '../../utils/formatters';

export default function LiveTotalsCard({
  totals,
  commission = 0,
  gst = 0,
  advance = 0,
}) {
  const t = totals || {};
  const adv = num(advance);
  const balance = Math.max(0, num(t.grand) - adv);

  return (
    <div className="totals-card">
      <div className="form-section-title">કુલ રકમ (Live Total)</div>
      <div className="total-row">
        <span>પેટા-કુલ (Subtotal)</span>
        <span>₹ {fmt(t.sub)}</span>
      </div>
      <div className="total-row">
        <span>+ કમિશન ({commission}%)</span>
        <span>₹ {fmt(t.commission)}</span>
      </div>
      <div className="total-row">
        <span>− ડિસ્કાઉન્ટ (Discount)</span>
        <span>- ₹ {fmt(t.disc)}</span>
      </div>
      <div className="total-row">
        <span>+ જીએસટી (GST {gst}%)</span>
        <span>₹ {fmt(t.gstAmt)}</span>
      </div>
      <div className="total-row grand">
        <span>કુલ રકમ (Grand Total)</span>
        <span>₹ {fmt(t.grand)}</span>
      </div>
      {adv > 0 && (
        <>
          <div className="total-row" style={{ marginTop: '6px' }}>
            <span>એડવાન્સ / બાનું (Advance)</span>
            <span>- ₹ {fmt(adv)}</span>
          </div>
          <div className="total-row balance-due">
            <span>બાકી રકમ (Balance Due)</span>
            <span>₹ {fmt(balance)}</span>
          </div>
        </>
      )}
    </div>
  );
}
