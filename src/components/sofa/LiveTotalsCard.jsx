import { fmt } from '../../utils/formatters';

export default function LiveTotalsCard({ totals, commission = 0, gst = 0 }) {
  const t = totals || {};

  return (
    <div className="totals-card">
      <div className="form-section-title">Live Total (કુલ રકમ)</div>
      <div className="total-row">
        <span>Subtotal</span>
        <span>₹ {fmt(t.sub)}</span>
      </div>
      <div className="total-row">
        <span>Commission ({commission}%)</span>
        <span>₹ {fmt(t.commission)}</span>
      </div>
      <div className="total-row">
        <span>Discount</span>
        <span>- ₹ {fmt(t.disc)}</span>
      </div>
      <div className="total-row">
        <span>GST ({gst}%)</span>
        <span>₹ {fmt(t.gstAmt)}</span>
      </div>
      <div className="total-row grand">
        <span>Grand Total</span>
        <span>₹ {fmt(t.grand)}</span>
      </div>
    </div>
  );
}
