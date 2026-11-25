import {
  SofaIcon,
  HomeIcon,
  RulerIcon,
  CurtainIcon,
  QuotesIcon,
  SettingsIcon,
} from './Icons';

export default function Header({
  activeTab,
  onNavigate,
  totalQuotesCount = 0,
  shopName = 'સોફા એસ્ટિમેટ',
}) {
  return (
    <header className="header no-print">
      <div className="header-inner">
        <button
          type="button"
          className="header-brand"
          onClick={() => onNavigate('home')}
          title="હોમ પેજ પર જાઓ"
        >
          <div className="header-logo">
            <SofaIcon size={22} />
          </div>
          <div className="header-title-box">
            <h1>{shopName}</h1>
            <span className="header-subtitle">Sofa & Curtain Craft</span>
          </div>
        </button>

        <nav className="header-nav">
          <button
            type="button"
            className={`nav-btn ${
              activeTab === 'home' || activeTab === 'form' || activeTab === 'summary'
                ? 'active'
                : ''
            }`}
            onClick={() => onNavigate('home')}
          >
            <HomeIcon size={16} />
            <span>હોમ</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'material' ? 'teal-active' : ''}`}
            onClick={() => onNavigate('material')}
          >
            <RulerIcon size={16} />
            <span>મટિરિયલ</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'curtains' ? 'curtain-active' : ''}`}
            onClick={() => onNavigate('curtains')}
          >
            <CurtainIcon size={16} />
            <span>પડદા</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${
              activeTab === 'quotes' || activeTab === 'view' || activeTab === 'viewCurtain'
                ? 'active'
                : ''
            }`}
            onClick={() => onNavigate('quotes')}
          >
            <QuotesIcon size={16} />
            <span>કોટેશન</span>
            {totalQuotesCount > 0 && (
              <span className="nav-count-badge">{totalQuotesCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`nav-btn nav-btn-icon ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
            title="સેટિંગ્સ અને દરો"
          >
            <SettingsIcon size={17} />
          </button>
        </nav>
      </div>
    </header>
  );
}
