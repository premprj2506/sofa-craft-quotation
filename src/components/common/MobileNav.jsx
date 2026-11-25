import {
  HomeIcon,
  RulerIcon,
  CurtainIcon,
  QuotesIcon,
  SettingsIcon,
} from './Icons';

export default function MobileNav({ activeTab, onNavigate, totalQuotesCount = 0 }) {
  const isHome =
    activeTab === 'home' || activeTab === 'form' || activeTab === 'summary';
  const isQuotes =
    activeTab === 'quotes' || activeTab === 'view' || activeTab === 'viewCurtain';

  return (
    <nav className="mobile-bottom-nav no-print" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`mob-nav-item ${isHome ? 'active' : ''}`}
        onClick={() => onNavigate('home')}
      >
        <HomeIcon size={19} />
        <span>હોમ</span>
      </button>

      <button
        type="button"
        className={`mob-nav-item ${activeTab === 'material' ? 'teal-active' : ''}`}
        onClick={() => onNavigate('material')}
      >
        <RulerIcon size={19} />
        <span>મટિરિયલ</span>
      </button>

      <button
        type="button"
        className={`mob-nav-item ${activeTab === 'curtains' ? 'curtain-active' : ''}`}
        onClick={() => onNavigate('curtains')}
      >
        <CurtainIcon size={19} />
        <span>પડદા</span>
      </button>

      <button
        type="button"
        className={`mob-nav-item ${isQuotes ? 'active' : ''}`}
        onClick={() => onNavigate('quotes')}
      >
        <div className="mob-icon-wrap">
          <QuotesIcon size={19} />
          {totalQuotesCount > 0 && (
            <span className="mob-badge">{totalQuotesCount}</span>
          )}
        </div>
        <span>કોટેશન</span>
      </button>

      <button
        type="button"
        className={`mob-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onNavigate('settings')}
      >
        <SettingsIcon size={19} />
        <span>સેટિંગ્સ</span>
      </button>
    </nav>
  );
}
