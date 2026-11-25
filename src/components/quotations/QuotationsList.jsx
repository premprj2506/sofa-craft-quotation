import { useRef, useState } from 'react';
import { fmt, fmtCurtain } from '../../utils/formatters';
import { exportCurtainPDF } from '../../utils/pdfExport';
import { exportBackupData, parseBackupFile } from '../../utils/storage';
import {
  SearchIcon,
  PlusIcon,
  QuotesIcon,
  CurtainIcon,
  DownloadIcon,
  TrashIcon,
  UploadIcon,
} from '../common/Icons';

export default function QuotationsList({
  quotations,
  curtainQuotations = [],
  settings,
  onViewQuote,
  onViewCurtainQuote,
  onDeleteCurtainQuote,
  onImportBackup,
  onNewQuote,
  showToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'sofa' | 'curtains'
  const fileInputRef = useRef(null);

  const normalizedSofa = (quotations || []).map((q) => ({
    ...q,
    _kind: 'sofa',
    _name: q.customerName || 'નામ વગર',
    _phone: q.customerPhone || '',
    _date: q.date || '',
    _service: q.serviceLabel || q.serviceType || 'Sofa',
    _amount: q.totals?.grand || 0,
  }));

  const normalizedCurtains = (curtainQuotations || []).map((q) => ({
    ...q,
    _kind: 'curtain',
    _name: q.customer?.name || 'નામ વગર',
    _phone: q.customer?.phone || '',
    _date: q.customer?.date || '',
    _service: q.typeName || 'પડદા',
    _amount: q.grandTotal || 0,
  }));

  const combined = (
    filterType === 'all'
      ? [...normalizedSofa, ...normalizedCurtains]
      : filterType === 'sofa'
      ? [...normalizedSofa]
      : [...normalizedCurtains]
  ).sort((a, b) => Number(b.id || 0) - Number(a.id || 0));

  const filtered = combined.filter((q) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      q._name.toLowerCase().includes(term) ||
      q._phone.toLowerCase().includes(term) ||
      q._service.toLowerCase().includes(term)
    );
  });

  const handleDeleteCurtain = (e, id) => {
    e.stopPropagation();
    if (window.confirm('આ પડદા કોટેશન ડિલીટ કરવું છે?')) {
      onDeleteCurtainQuote(id);
    }
  };

  const handleCurtainPDF = (e, item) => {
    e.stopPropagation();
    exportCurtainPDF(item, showToast, settings);
  };

  const handleExportBackup = () => {
    exportBackupData({
      sofaQuotations: quotations,
      curtainQuotations,
      settings,
    });
    if (showToast) showToast('બેકઅપ ફાઈલ ડાઉનલોડ થઈ!');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backup = parseBackupFile(ev.target.result);
        onImportBackup(backup);
      } catch (err) {
        console.error(err);
        if (showToast) showToast('અમાન્ય બેકઅપ ફાઈલ!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="list-header-row">
        <div>
          <h2 className="page-title">બધા કોટેશન (All Quotations)</h2>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            કુલ {normalizedSofa.length} સોફા અને {normalizedCurtains.length} પડદા કોટેશન સેવ છે
          </p>
        </div>
        <div className="list-top-actions no-print">
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '8px 13px', fontSize: '13px' }}
            onClick={handleExportBackup}
            title="બધો ડેટા JSON માં સેવ કરો"
          >
            <DownloadIcon size={16} />
            <span>બેકઅપ</span>
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '8px 13px', fontSize: '13px' }}
            onClick={() => fileInputRef.current?.click()}
            title="બેકઅપ ફાઈલ રિસ્ટોર કરો"
          >
            <UploadIcon size={16} />
            <span>રિસ્ટોર</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNewQuote}
          >
            <PlusIcon size={17} />
            <span>નવું કોટેશન</span>
          </button>
        </div>
      </div>

      {/* Category Tabs + Search */}
      <div className="quotes-toolbar no-print">
        <div className="tab-group" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            બધા ({normalizedSofa.length + normalizedCurtains.length})
          </button>
          <button
            type="button"
            className={`tab ${filterType === 'sofa' ? 'active' : ''}`}
            onClick={() => setFilterType('sofa')}
          >
            સોફા ({normalizedSofa.length})
          </button>
          <button
            type="button"
            className={`tab maroon ${filterType === 'curtains' ? 'active' : ''}`}
            onClick={() => setFilterType('curtains')}
          >
            પડદા ({normalizedCurtains.length})
          </button>
        </div>

        <div className="search-input-wrap">
          <SearchIcon size={17} className="search-icon-svg" />
          <input
            type="text"
            placeholder="ગ્રાહકનું નામ, ફોન કે સેવા શોધો..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="quote-list">
        {filtered.length > 0 ? (
          filtered.map((q) => {
            const isCurtain = q._kind === 'curtain';
            const avatarChar = (q._name || '?')[0].toUpperCase();

            return (
              <div
                key={`${q._kind}-${q.id}`}
                className={`quote-item ${isCurtain ? 'curtain-clickable' : ''}`}
                onClick={() => {
                  if (isCurtain) onViewCurtainQuote(q);
                  else onViewQuote(q);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (isCurtain) onViewCurtainQuote(q);
                    else onViewQuote(q);
                  }
                }}
              >
                <div className={`quote-avatar ${isCurtain ? 'curtain' : ''}`}>
                  {isCurtain ? <CurtainIcon size={20} /> : avatarChar}
                </div>

                <div className="quote-info">
                  <div className="quote-name">
                    {q._name}
                    {q._phone && (
                      <span className="quote-phone-pill">{q._phone}</span>
                    )}
                  </div>
                  <div className="quote-meta">
                    <span>{q._date || '—'}</span>
                    <span className={`quote-badge ${isCurtain ? 'maroon' : ''}`}>
                      {q._service}
                    </span>
                  </div>
                </div>

                <div className="quote-right-col">
                  <div className={`quote-total ${isCurtain ? 'curtain' : ''}`}>
                    {isCurtain ? fmtCurtain(q._amount) : `₹ ${fmt(q._amount)}`}
                  </div>
                  {isCurtain && (
                    <div className="quote-inline-actions no-print">
                      <button
                        type="button"
                        className="btn-mini"
                        onClick={(e) => handleCurtainPDF(e, q)}
                        title="PDF ડાઉનલોડ"
                      >
                        <DownloadIcon size={14} />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        className="btn-mini danger"
                        onClick={(e) => handleDeleteCurtain(e, q.id)}
                        title="ડિલીટ"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-icon-circle">
              <QuotesIcon size={32} />
            </div>
            <p>
              {searchQuery
                ? 'શોધ પરિણામ મળ્યું નથી (No results found).'
                : 'હજુ સુધી કોઈ કોટેશન સેવ થયેલ નથી.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: '16px' }}
                onClick={onNewQuote}
              >
                <PlusIcon size={17} />
                <span>પ્રથમ કોટેશન બનાવો</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
