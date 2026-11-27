import { useState } from 'react';

export default function CollapsibleCard({
  title,
  summary = '',
  defaultOpenMobile = false,
  className = '',
  children,
}) {
  const [isOpen, setIsOpen] = useState(
    () =>
      defaultOpenMobile ||
      (typeof window !== 'undefined' && window.innerWidth > 650)
  );

  return (
    <div className={`form-card ${className}`.trim()}>
      <button
        type="button"
        className="collapsible-header"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="collapsible-title">{title}</span>
        <span className="collapsible-right">
          {!isOpen && summary && (
            <span className="collapsible-summary">{summary}</span>
          )}
          <span className="collapsible-chevron" aria-hidden="true">
            {isOpen ? '▲' : '▼'}
          </span>
        </span>
      </button>

      <div className={`collapsible-body ${isOpen ? '' : 'is-collapsed'}`}>
        {children}
      </div>
    </div>
  );
}
