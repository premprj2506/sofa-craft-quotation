import { SERVICES } from '../../constants/services';
import {
  ServiceIcon,
  ArrowRightIcon,
  RulerIcon,
  QuotesIcon,
} from '../common/Icons';

export default function ServiceGrid({
  onSelectService,
  onNavigate,
  totalQuotesCount = 0,
}) {
  const sofaServices = SERVICES.filter((s) => !s.isCurtains && !s.isMaterial);
  const specializedTools = SERVICES.filter((s) => s.isCurtains || s.isMaterial);

  return (
    <div className="home-container">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-eyebrow">Sofa & Curtain Craft Studio</span>
          <h2 className="page-title">નવું ક્વોટેશન અને એસ્ટિમેટ</h2>
          <p className="hero-creator">Created by Prem Prajapati (નરેશભાઈ)</p>
        </div>

        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSelectService('material')}
          >
            <RulerIcon size={17} />
            <span>મટિરિયલ ગણતરી કરો</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('quotes')}
          >
            <QuotesIcon size={17} />
            <span>સેવ કરેલા ({totalQuotesCount})</span>
          </button>
        </div>
      </section>

      {/* Category 1: Smart Calculators & Curtains */}
      <section className="home-section">
        <div className="section-heading">
          <h3>સ્માર્ટ કેલ્ક્યુલેટર અને પડદા</h3>
          <span>માપ પ્રમાણે ઝડપી ગણતરી</span>
        </div>

        <div className="featured-grid">
          {specializedTools.map((s) => (
            <div
              key={s.id}
              className={`service-card featured ${
                s.isCurtains ? 'curtains' : ''
              } ${s.isMaterial ? 'material' : ''}`}
              onClick={() => onSelectService(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectService(s.id);
              }}
            >
              <div className="featured-top">
                <div className="service-icon">
                  <ServiceIcon id={s.id} size={24} />
                </div>
                <span className="service-sub-pill">{s.sub}</span>
              </div>
              <h3>{s.label}</h3>
              <p>{s.desc}</p>
              <div className="service-footer">
                <span className="service-cta">ખોલો</span>
                <span className="service-arrow">
                  <ArrowRightIcon size={18} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category 2: Sofa, Bed & Mattress Services */}
      <section className="home-section">
        <div className="section-heading">
          <h3>સોફા, બેડ અને ગાદલા કોટેશન</h3>
          <span>ગ્રાહક માટે બિલ / PDF બનાવો</span>
        </div>

        <div className="services-grid">
          {sofaServices.map((s) => (
            <div
              key={s.id}
              className={`service-card ${s.isMattress ? 'mattress' : ''}`}
              onClick={() => onSelectService(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectService(s.id);
              }}
            >
              <div className="featured-top">
                <div className="service-icon">
                  <ServiceIcon id={s.id} size={22} />
                </div>
                <span className="service-sub-pill">{s.sub}</span>
              </div>
              <h3>{s.label}</h3>
              <p>{s.desc}</p>
              <div className="service-footer">
                <span className="service-cta">કોટેશન બનાવો</span>
                <span className="service-arrow">
                  <ArrowRightIcon size={18} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
