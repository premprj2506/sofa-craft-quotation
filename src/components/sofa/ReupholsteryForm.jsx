import { REUPHOLSTERY_ITEMS } from '../../constants/services';
import { num, fmt } from '../../utils/formatters';
import { calcReupholsteryMaterialCost } from '../../utils/calculations';

export default function ReupholsteryForm({ formData, onChangeField }) {
  const fd = formData || {};
  const matCost = calcReupholsteryMaterialCost(fd);
  const labour = num(fd.labour);
  const total = Number(matCost) + Number(labour);

  return (
    <div className="form-card">
      <div className="form-section-title">Materials & Costs (સામગ્રી અને ખર્ચ)</div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Item
        </div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Rate (₹)
        </div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Qty / Unit
        </div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'right' }}>
          Amount
        </div>
      </div>

      {REUPHOLSTERY_ITEMS.map((item) => {
        const rate = num(fd[`${item.key}_rate`]);
        const qty = num(fd[`${item.key}_qty`]);
        const itemTotal = rate * qty;

        return (
          <div key={item.key} className="item-row">
            <div className="item-label">
              {item.label}
              <br />
              <small style={{ color: 'var(--text3)', fontSize: '11px' }}>
                per {item.unit}
              </small>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="number"
                min="0"
                value={fd[`${item.key}_rate`] !== undefined ? fd[`${item.key}_rate`] : ''}
                placeholder="0"
                onChange={(e) => onChangeField(`${item.key}_rate`, e.target.value)}
                style={{ padding: '8px 10px' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="number"
                min="0"
                step="0.1"
                value={fd[`${item.key}_qty`] !== undefined ? fd[`${item.key}_qty`] : ''}
                placeholder="0"
                onChange={(e) => onChangeField(`${item.key}_qty`, e.target.value)}
                style={{ padding: '8px 10px' }}
              />
            </div>
            <div
              className="calc-result"
              style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right' }}
            >
              ₹ {fmt(itemTotal)}
            </div>
          </div>
        );
      })}

      <div style={{ borderTop: '1px dashed var(--border2)', margin: '14px 0' }} />

      <div className="labour-highlight">
        <div className="labour-row">
          <div className="item-label" style={{ color: 'var(--accent)', fontWeight: 600, padding: 0 }}>
            Labour (મજૂરી)
            <div style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text3)', marginTop: '2px' }}>
              flat rate (default: 0)
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '11px' }}>Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={fd.labour !== undefined ? fd.labour : 0}
              placeholder="0"
              onChange={(e) => onChangeField('labour', e.target.value)}
              style={{ padding: '8px 10px' }}
            />
          </div>
          <div
            className="calc-result"
            style={{ padding: '8px 10px', fontSize: '13px', textAlign: 'right' }}
          >
            ₹ {fmt(labour)}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '12px',
          padding: '12px 14px',
          background: 'var(--accent-bg)',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(193,127,58,.15)',
          fontSize: '13px',
          color: 'var(--accent)',
        }}
      >
        માલસામાન : ₹{fmt(matCost)} + મજૂરી : ₹{fmt(labour)} = <strong>₹{fmt(total)}</strong>
      </div>
    </div>
  );
}
