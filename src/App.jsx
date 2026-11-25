import { useState } from 'react';
import Header from './components/common/Header';
import MobileNav from './components/common/MobileNav';
import Toast from './components/common/Toast';
import CustomerForm from './components/common/CustomerForm';
import SettingsPage from './components/common/SettingsPage';
import {
  ServiceIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CartPlusIcon,
} from './components/common/Icons';
import ServiceGrid from './components/sofa/ServiceGrid';
import StandardServiceForm from './components/sofa/StandardServiceForm';
import ReupholsteryForm from './components/sofa/ReupholsteryForm';
import BedForm from './components/sofa/BedForm';
import CoverForm from './components/sofa/CoverForm';
import MattressWizard from './components/sofa/MattressWizard';
import AdjustmentsForm from './components/sofa/AdjustmentsForm';
import LiveTotalsCard from './components/sofa/LiveTotalsCard';
import QuotationPreview from './components/quotations/QuotationPreview';
import QuotationsList from './components/quotations/QuotationsList';
import QuotationDetail from './components/quotations/QuotationDetail';
import CurtainCalculator from './components/curtains/CurtainCalculator';
import CurtainDetail from './components/curtains/CurtainDetail';
import MaterialCalculator from './components/sofa/MaterialCalculator';

import { SERVICES } from './constants/services';
import {
  calcSubtotal,
  calcTotals,
  calcBreakdown,
} from './utils/calculations';
import { fmt } from './utils/formatters';
import { generateId } from './utils/id';
import {
  loadSofaQuotations,
  saveSofaQuotations,
  loadCurtainQuotations,
  saveCurtainQuotations,
} from './utils/storage';
import {
  loadSettings,
  saveSettings,
  getServiceDefaultsFromSettings,
} from './utils/settings';

export default function App() {
  const [page, setPage] = useState('home'); // 'home' | 'form' | 'summary' | 'quotes' | 'view' | 'viewCurtain' | 'curtains' | 'material' | 'settings'
  const [selectedService, setSelectedService] = useState(null);

  // Settings state
  const [settings, setSettings] = useState(() => loadSettings());

  // Customer state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quotationDate, setQuotationDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );

  // Active item form data
  const [formData, setFormData] = useState({});
  const [coverType, setCoverType] = useState('simple');
  const [bedType, setBedType] = useState('bed');

  // Multi-service combined quotation cart
  const [cartItems, setCartItems] = useState([]);
  const [editingQuoteId, setEditingQuoteId] = useState(null);

  // Mattress wizard state
  const [mattressStep, setMattressStep] = useState(1);
  const [mattressThickness, setMattressThickness] = useState(null);
  const [mattressWarranty, setMattressWarranty] = useState(null);

  // Global adjustments
  const [commission, setCommission] = useState(0);
  const [gst, setGst] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Quotations and active view/edit state
  const [quotations, setQuotations] = useState(() => loadSofaQuotations());
  const [curtainQuotations, setCurtainQuotations] = useState(() =>
    loadCurtainQuotations()
  );
  const [viewQuote, setViewQuote] = useState(null);
  const [viewCurtainQuote, setViewCurtainQuote] = useState(null);
  const [editingCurtainState, setEditingCurtainState] = useState(null); // { quote, isEditing }

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  const totalQuotesCount = quotations.length + curtainQuotations.length;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  const resetQuoteBuilder = () => {
    setSelectedService(null);
    setFormData({});
    setCustomerName('');
    setCustomerPhone('');
    setQuotationDate(new Date().toISOString().split('T')[0]);
    setCommission(0);
    setGst(0);
    setDiscount(0);
    setMattressThickness(null);
    setMattressWarranty(null);
    setMattressStep(1);
    setCartItems([]);
    setEditingQuoteId(null);
  };

  const handleNavigate = (targetPage) => {
    if (targetPage === 'home') {
      setPage('home');
      resetQuoteBuilder();
    } else if (targetPage === 'curtains') {
      setEditingCurtainState(null);
      setPage('curtains');
    } else {
      setPage(targetPage);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectService = (id, keepCart = false) => {
    if (id === 'curtains') {
      setEditingCurtainState(null);
      setPage('curtains');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (id === 'material') {
      setPage('material');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!keepCart) {
      setCartItems([]);
      setEditingQuoteId(null);
    }

    setSelectedService(id);
    setMattressStep(1);
    setMattressThickness(null);
    setMattressWarranty(null);

    if (id === 'cover') {
      setCoverType('simple');
      setFormData(getServiceDefaultsFromSettings('cover', settings, 'simple'));
    } else if (id === 'bed') {
      setBedType('bed');
      setFormData({ pricingMode: 'none' });
    } else {
      setFormData(getServiceDefaultsFromSettings(id, settings));
    }

    setPage('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeField = (key, value) => {
    if (key === 'pricingMode' || key === 'height' || key === 'width') {
      if (selectedService === 'bed') {
        setFormData((prev) => ({ ...prev, [key]: value }));
        return;
      }
    }
    const parsed = value === '' ? '' : Number(value);
    setFormData((prev) => ({
      ...prev,
      [key]: isNaN(parsed) ? value : parsed,
    }));
  };

  const handleChangeAdjustment = (key, value) => {
    const val = value === '' ? '' : Number(value);
    if (key === 'commission') setCommission(isNaN(val) ? 0 : val);
    if (key === 'gst') setGst(isNaN(val) ? 0 : val);
    if (key === 'discount') setDiscount(isNaN(val) ? 0 : val);
  };

  const handleCoverTypeChange = (type) => {
    setCoverType(type);
    setFormData(getServiceDefaultsFromSettings('cover', settings, type));
  };

  const handleCustomerChange = (field, val) => {
    if (field === 'customerName') setCustomerName(val);
    if (field === 'customerPhone') setCustomerPhone(val);
    if (field === 'quotationDate') setQuotationDate(val);
  };

  const activeServiceObj = SERVICES.find((s) => s.id === selectedService);

  const activeSubtotal = calcSubtotal({ selectedService, formData, coverType });
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const combinedSubtotal = cartSubtotal + activeSubtotal;

  const liveTotals = calcTotals({
    subtotal: combinedSubtotal,
    commission,
    gst,
    discount,
  });

  // Add current active service to cartItems & go to home to pick another service
  const handleAddAnotherService = () => {
    const itemBreakdown = calcBreakdown({
      selectedService,
      formData,
      coverType,
      bedType,
    });
    const newItem = {
      id: generateId(),
      serviceType: selectedService,
      serviceLabel: activeServiceObj?.label || selectedService,
      formData: { ...formData },
      coverType,
      bedType,
      mattressThickness,
      mattressWarranty,
      breakdown: itemBreakdown,
      subtotal: activeSubtotal,
    };
    setCartItems((prev) => [...prev, newItem]);
    setSelectedService(null);
    setFormData({});
    setMattressThickness(null);
    setMattressWarranty(null);
    setMattressStep(1);
    showToast(`${activeServiceObj?.label} કોટેશનમાં ઉમેરાયું! હવે બીજી સેવા પસંદ કરો.`);
    setPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveCartItem = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Build combined breakdown for single or multi-service quote
  const getCombinedBreakdown = () => {
    const activeBreakdown = selectedService
      ? calcBreakdown({ selectedService, formData, coverType, bedType })
      : [];

    if (cartItems.length === 0) {
      return activeBreakdown;
    }

    const allItems = selectedService
      ? [
          ...cartItems,
          {
            id: 'active',
            serviceLabel: activeServiceObj?.label || selectedService,
            breakdown: activeBreakdown,
          },
        ]
      : cartItems;

    const merged = [];
    allItems.forEach((entry, idx) => {
      merged.push({
        header: true,
        label: `${idx + 1}. ${entry.serviceLabel}`,
        value: '',
        amount: null,
      });
      (entry.breakdown || []).forEach((row) => merged.push(row));
    });
    return merged;
  };

  const getCombinedServiceMeta = () => {
    if (cartItems.length === 0) {
      return {
        serviceType: selectedService,
        serviceLabel: activeServiceObj?.label || selectedService,
      };
    }
    const count = cartItems.length + (selectedService ? 1 : 0);
    return {
      serviceType: 'multi',
      serviceLabel: `મિશ્ર કોટેશન (${count} સેવાઓ)`,
    };
  };

  const handleSaveQuotation = () => {
    const { serviceType, serviceLabel } = getCombinedServiceMeta();
    const combinedBreakdown = getCombinedBreakdown();

    const quoteId = editingQuoteId || generateId();
    const quotePayload = {
      id: quoteId,
      customerName: customerName || 'Unknown',
      customerPhone: customerPhone || '',
      date: quotationDate,
      serviceType,
      serviceLabel,
      formData: { ...formData },
      coverType,
      bedType,
      mattressThickness,
      mattressWarranty,
      cartItems:
        cartItems.length > 0
          ? [
              ...cartItems,
              ...(selectedService
                ? [
                    {
                      id: generateId(),
                      serviceType: selectedService,
                      serviceLabel: activeServiceObj?.label || selectedService,
                      formData: { ...formData },
                      coverType,
                      bedType,
                      mattressThickness,
                      mattressWarranty,
                      breakdown: calcBreakdown({
                        selectedService,
                        formData,
                        coverType,
                        bedType,
                      }),
                      subtotal: activeSubtotal,
                    },
                  ]
                : []),
            ]
          : undefined,
      commission,
      gst,
      discount,
      breakdown: combinedBreakdown,
      totals: liveTotals,
    };

    const updated = editingQuoteId
      ? quotations.map((q) => (q.id === editingQuoteId ? quotePayload : q))
      : [quotePayload, ...quotations];

    setQuotations(updated);
    saveSofaQuotations(updated);
    showToast(editingQuoteId ? 'કોટેશન અપડેટ થયું!' : 'કોટેશન સેવ થયું!');
    resetQuoteBuilder();
    setPage('quotes');
  };

  const loadSofaQuoteIntoEditor = (quote, isEditMode) => {
    setCustomerName(quote.customerName === 'Unknown' ? '' : quote.customerName || '');
    setCustomerPhone(quote.customerPhone || '');
    setQuotationDate(
      isEditMode ? quote.date : new Date().toISOString().split('T')[0]
    );
    setCommission(quote.commission || 0);
    setGst(quote.gst || 0);
    setDiscount(quote.discount || 0);
    setEditingQuoteId(isEditMode ? quote.id : null);

    if (quote.serviceType === 'multi' && Array.isArray(quote.cartItems) && quote.cartItems.length > 0) {
      const last = quote.cartItems[quote.cartItems.length - 1];
      setCartItems(quote.cartItems.slice(0, -1));
      setSelectedService(last.serviceType);
      setFormData({ ...(last.formData || {}) });
      setCoverType(last.coverType || 'simple');
      setBedType(last.bedType || 'bed');
      setMattressThickness(last.mattressThickness || null);
      setMattressWarranty(last.mattressWarranty || null);
      setMattressStep(last.serviceType === 'mattress' ? 3 : 1);
    } else {
      setCartItems([]);
      setSelectedService(quote.serviceType);
      setFormData({ ...(quote.formData || {}) });
      setCoverType(quote.coverType || 'simple');
      setBedType(quote.bedType || 'bed');
      setMattressThickness(quote.mattressThickness || null);
      setMattressWarranty(quote.mattressWarranty || null);
      setMattressStep(quote.serviceType === 'mattress' ? 3 : 1);
    }

    showToast(
      isEditMode
        ? 'કોટેશન સુધારવા માટે લોડ થયું'
        : 'કોટેશનની નકલ લોડ થઈ'
    );
    setPage('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuotation = (id) => {
    const updated = quotations.filter((q) => q.id !== id);
    setQuotations(updated);
    saveSofaQuotations(updated);
    showToast('કોટેશન ડિલીટ થયું.');
    setPage('quotes');
  };

  const handleDeleteCurtainQuote = (id) => {
    const updated = curtainQuotations.filter((q) => q.id !== id);
    setCurtainQuotations(updated);
    saveCurtainQuotations(updated);
    showToast('પડદા કોટેશન ડિલીટ થયું.');
    if (page === 'viewCurtain') setPage('quotes');
  };

  const handleViewQuote = (quote) => {
    setViewQuote(quote);
    setPage('view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCurtainQuote = (quote) => {
    setViewCurtainQuote(quote);
    setPage('viewCurtain');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditCurtainQuote = (quote, isEditMode) => {
    setEditingCurtainState({
      quote: isEditMode
        ? quote
        : {
            ...quote,
            customer: {
              ...quote.customer,
              date: new Date().toISOString().split('T')[0],
            },
          },
      isEditing: isEditMode,
    });
    setPage('curtains');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransferMaterialToQuote = (targetService, kapadMeters) => {
    setCartItems([]);
    setEditingQuoteId(null);
    setSelectedService(targetService);
    if (targetService === 'reupholstery') {
      const defaults = getServiceDefaultsFromSettings('reupholstery', settings);
      setFormData({
        ...defaults,
        kapad_qty: kapadMeters,
      });
    } else if (targetService === 'cover') {
      setCoverType('simple');
      const defaults = getServiceDefaultsFromSettings('cover', settings, 'simple');
      setFormData({
        ...defaults,
        kapad_meter: kapadMeters,
      });
    }
    showToast(`કાપડ (${kapadMeters.toFixed(2)} મીટર) કોટેશનમાં ઉમેરાયું!`);
    setPage('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast('સેટિંગ્સ સેવ થઈ ગઈ!');
    setPage('home');
  };

  const handleImportBackup = (backup) => {
    const mergeById = (existing, incoming) => {
      const map = new Map();
      existing.forEach((item) => map.set(String(item.id), item));
      incoming.forEach((item) => map.set(String(item.id), item));
      return Array.from(map.values()).sort(
        (a, b) => Number(b.id || 0) - Number(a.id || 0)
      );
    };

    const mergedSofa = mergeById(quotations, backup.sofaQuotations);
    const mergedCurtain = mergeById(curtainQuotations, backup.curtainQuotations);

    setQuotations(mergedSofa);
    saveSofaQuotations(mergedSofa);

    setCurtainQuotations(mergedCurtain);
    saveCurtainQuotations(mergedCurtain);

    if (backup.settings) {
      setSettings(backup.settings);
      saveSettings(backup.settings);
    }

    showToast(
      `રિસ્ટોર પૂર્ણ: ${mergedSofa.length} સોફા + ${mergedCurtain.length} પડદા કોટેશન!`
    );
  };

  const showStickySidebar =
    selectedService !== 'mattress' || mattressStep === 3;

  const combinedMeta = getCombinedServiceMeta();

  return (
    <div className="app">
      <Header
        activeTab={page}
        onNavigate={handleNavigate}
        totalQuotesCount={totalQuotesCount}
        shopName={settings.shopName || 'સોફા એસ્ટિમેટ'}
      />

      <main className="main">
        {/* Home Screen */}
        {page === 'home' && (
          <>
            {cartItems.length > 0 && (
              <div className="cart-banner no-print">
                <div>
                  <strong>મિશ્ર કોટેશન ચાલુ છે ({cartItems.length} સેવા ઉમેરાયેલી છે)</strong>
                  <div className="cart-banner-sub">
                    બીજી સેવા પસંદ કરો અથવા સીધું પ્રિવ્યૂ જુઓ.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '7px 14px', fontSize: '13px' }}
                    onClick={() => setPage('summary')}
                  >
                    Preview ({cartItems.length}) →
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '7px 12px', fontSize: '13px' }}
                    onClick={() => setCartItems([])}
                  >
                    રદ કરો
                  </button>
                </div>
              </div>
            )}

            <ServiceGrid
              onSelectService={(id) => handleSelectService(id, cartItems.length > 0)}
              onNavigate={handleNavigate}
              totalQuotesCount={totalQuotesCount}
            />
          </>
        )}

        {/* Curtains Calculator View */}
        {page === 'curtains' && (
          <CurtainCalculator
            key={editingCurtainState?.quote?.id || 'new-curtain'}
            showToast={showToast}
            onBackToHome={() =>
              editingCurtainState?.isEditing
                ? handleNavigate('quotes')
                : handleNavigate('home')
            }
            onQuotesChange={setCurtainQuotations}
            initialQuote={editingCurtainState?.quote || null}
            isEditing={Boolean(editingCurtainState?.isEditing)}
            settings={settings}
            onDoneEditing={() => {
              setEditingCurtainState(null);
              setPage('quotes');
            }}
          />
        )}

        {/* Sofa Material Calculator View */}
        {page === 'material' && (
          <MaterialCalculator
            onBackToHome={() => handleNavigate('home')}
            onTransferToQuote={handleTransferMaterialToQuote}
          />
        )}

        {/* Settings View */}
        {page === 'settings' && (
          <SettingsPage
            settings={settings}
            onSave={handleSaveSettings}
            onBack={() => handleNavigate('home')}
          />
        )}

        {/* Form View for Sofa Services */}
        {page === 'form' && activeServiceObj && (
          <div>
            <div className="form-header no-print">
              <button
                type="button"
                className="back-btn"
                onClick={() => handleNavigate('home')}
                title="સેવાઓ પર પાછા જાઓ"
              >
                <ArrowLeftIcon size={18} />
              </button>
              <div>
                <h2 className="form-title">
                  {editingQuoteId ? `સુધારો: ${activeServiceObj.label}` : activeServiceObj.label}
                </h2>
              </div>
              <span
                className={`form-badge ${
                  selectedService === 'mattress' ? 'purple' : ''
                }`}
              >
                <ServiceIcon id={activeServiceObj.id} size={14} />
                <span>{activeServiceObj.sub}</span>
              </span>
            </div>

            {!showStickySidebar ? (
              <MattressWizard
                mattressStep={mattressStep}
                setMattressStep={setMattressStep}
                mattressThickness={mattressThickness}
                setMattressThickness={setMattressThickness}
                mattressWarranty={mattressWarranty}
                setMattressWarranty={setMattressWarranty}
                formData={formData}
                onChangeField={handleChangeField}
                onBackToServices={() => handleNavigate('home')}
                settings={settings}
              />
            ) : (
              <div className="workspace-grid">
                <div className="workspace-main">
                  {selectedService === 'mattress' && (
                    <MattressWizard
                      mattressStep={mattressStep}
                      setMattressStep={setMattressStep}
                      mattressThickness={mattressThickness}
                      setMattressThickness={setMattressThickness}
                      mattressWarranty={mattressWarranty}
                      setMattressWarranty={setMattressWarranty}
                      formData={formData}
                      onChangeField={handleChangeField}
                      onBackToServices={() => handleNavigate('home')}
                      settings={settings}
                    />
                  )}

                  <CustomerForm
                    customerName={customerName}
                    customerPhone={customerPhone}
                    quotationDate={quotationDate}
                    onChange={handleCustomerChange}
                  />

                  {(selectedService === 'structure' ||
                    selectedService === 'upholstery') && (
                    <StandardServiceForm
                      selectedService={selectedService}
                      formData={formData}
                      onChangeField={handleChangeField}
                    />
                  )}

                  {selectedService === 'reupholstery' && (
                    <ReupholsteryForm
                      formData={formData}
                      onChangeField={handleChangeField}
                    />
                  )}

                  {selectedService === 'bed' && (
                    <BedForm
                      bedType={bedType}
                      setBedType={setBedType}
                      formData={formData}
                      onChangeField={handleChangeField}
                    />
                  )}

                  {selectedService === 'cover' && (
                    <CoverForm
                      coverType={coverType}
                      setCoverType={handleCoverTypeChange}
                      formData={formData}
                      onChangeField={handleChangeField}
                    />
                  )}

                  <AdjustmentsForm
                    commission={commission}
                    gst={gst}
                    discount={discount}
                    onChangeAdjustment={handleChangeAdjustment}
                  />
                </div>

                {/* Sticky Live Totals & Multi-Service Cart */}
                <aside className="workspace-side">
                  <div className="sticky-panel">
                    {cartItems.length > 0 && (
                      <div className="form-card cart-summary-card">
                        <div className="form-section-title">
                          ઉમેરેલી સેવાઓ ({cartItems.length})
                        </div>
                        {cartItems.map((item) => (
                          <div key={item.id} className="cart-item-pill">
                            <div>
                              <div className="cart-item-title">{item.serviceLabel}</div>
                              <div className="cart-item-amt">₹ {fmt(item.subtotal)}</div>
                            </div>
                            <button
                              type="button"
                              className="btn-icon-del"
                              onClick={() => handleRemoveCartItem(item.id)}
                              title="દૂર કરો"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <div className="cart-active-row">
                          <span>હાલની સેવા ({activeServiceObj.label}):</span>
                          <strong>₹ {fmt(activeSubtotal)}</strong>
                        </div>
                      </div>
                    )}

                    <LiveTotalsCard
                      totals={liveTotals}
                      commission={commission}
                      gst={gst}
                    />

                    <div className="side-actions no-print">
                      <button
                        type="button"
                        className="btn btn-primary btn-full"
                        onClick={() => setPage('summary')}
                      >
                        <span>Preview Quotation</span>
                        <ArrowRightIcon size={17} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-full"
                        onClick={handleAddAnotherService}
                      >
                        <CartPlusIcon size={17} />
                        <span>+ બીજી સેવા ઉમેરો</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-full"
                        onClick={() => handleNavigate('home')}
                      >
                        Cancel (રદ કરો)
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
        )}

        {/* Summary / Preview Screen */}
        {page === 'summary' && (
          <QuotationPreview
            customerName={customerName}
            customerPhone={customerPhone}
            quotationDate={quotationDate}
            service={activeServiceObj}
            serviceLabel={combinedMeta.serviceLabel}
            mattressThickness={mattressThickness}
            mattressWarranty={mattressWarranty}
            breakdown={getCombinedBreakdown()}
            totals={liveTotals}
            commission={commission}
            gst={gst}
            discount={discount}
            isEditing={Boolean(editingQuoteId)}
            settings={settings}
            onSave={handleSaveQuotation}
            onEdit={() => setPage(selectedService ? 'form' : 'home')}
            onPrint={() => window.print()}
            showToast={showToast}
          />
        )}

        {/* Unified All Quotations Hub */}
        {page === 'quotes' && (
          <QuotationsList
            quotations={quotations}
            curtainQuotations={curtainQuotations}
            settings={settings}
            onViewQuote={handleViewQuote}
            onViewCurtainQuote={handleViewCurtainQuote}
            onDeleteCurtainQuote={handleDeleteCurtainQuote}
            onImportBackup={handleImportBackup}
            onNewQuote={() => handleNavigate('home')}
            showToast={showToast}
          />
        )}

        {/* View Sofa Quotation Detail Screen */}
        {page === 'view' && (
          <QuotationDetail
            quote={viewQuote}
            settings={settings}
            onBack={() => setPage('quotes')}
            onEdit={(q) => loadSofaQuoteIntoEditor(q, true)}
            onDuplicate={(q) => loadSofaQuoteIntoEditor(q, false)}
            onDelete={handleDeleteQuotation}
            showToast={showToast}
          />
        )}

        {/* View Curtain Quotation Detail Screen */}
        {page === 'viewCurtain' && (
          <CurtainDetail
            quote={viewCurtainQuote}
            settings={settings}
            onBack={() => setPage('quotes')}
            onEdit={(q) => handleEditCurtainQuote(q, true)}
            onDuplicate={(q) => handleEditCurtainQuote(q, false)}
            onDelete={handleDeleteCurtainQuote}
            showToast={showToast}
          />
        )}
      </main>

      <MobileNav
        activeTab={page}
        onNavigate={handleNavigate}
        totalQuotesCount={totalQuotesCount}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
