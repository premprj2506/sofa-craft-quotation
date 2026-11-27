import { useMemo, useState } from 'react';
import Header from './components/common/Header';
import MobileNav from './components/common/MobileNav';
import Toast from './components/common/Toast';
import CustomerForm from './components/common/CustomerForm';
import MobileStickyBar from './components/common/MobileStickyBar';
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
import { extractSavedCustomers } from './utils/customers';
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
  getMattressCompanies,
  getMattressCompany,
  getMattressWarrantyObj,
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
  const [mattressCompany, setMattressCompany] = useState(null);
  const [mattressThickness, setMattressThickness] = useState(null);
  const [mattressWarranty, setMattressWarranty] = useState(null);

  // Global adjustments
  const [commission, setCommission] = useState(0);
  const [gst, setGst] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [status, setStatus] = useState('pending');

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
  const savedCustomers = useMemo(
    () => extractSavedCustomers(quotations, curtainQuotations),
    [quotations, curtainQuotations]
  );

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
    setAdvance(0);
    setStatus('pending');
    setMattressCompany(null);
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
    setMattressCompany(
      id === 'mattress' ? getMattressCompanies(settings)[0]?.id || null : null
    );
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
    if (key === 'status') {
      setStatus(value || 'pending');
      return;
    }
    const val = value === '' ? '' : Number(value);
    if (key === 'commission') setCommission(isNaN(val) ? 0 : val);
    if (key === 'gst') setGst(isNaN(val) ? 0 : val);
    if (key === 'discount') setDiscount(isNaN(val) ? 0 : val);
    if (key === 'advance') setAdvance(isNaN(val) ? 0 : val);
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

  const resolveMattressMeta = () => {
    if (selectedService !== 'mattress') {
      return {
        mattressCompany: null,
        mattressCompanyName: '',
        mattressWarrantyLabel: '',
      };
    }
    const comp = getMattressCompany(mattressCompany, settings);
    const war = getMattressWarrantyObj(comp.id, mattressWarranty, settings);
    return {
      mattressCompany: comp.id,
      mattressCompanyName: comp.name,
      mattressWarrantyLabel: war?.label || mattressWarranty || '',
    };
  };

  // Add current active service to cartItems & go to home to pick another service
  const handleAddAnotherService = () => {
    const itemBreakdown = calcBreakdown({
      selectedService,
      formData,
      coverType,
      bedType,
    });
    const mattMeta = resolveMattressMeta();
    const itemLabel =
      selectedService === 'mattress' && mattMeta.mattressCompanyName
        ? `ગાદલા (${mattMeta.mattressCompanyName} · ${mattMeta.mattressWarrantyLabel})`
        : activeServiceObj?.label || selectedService;
    const newItem = {
      id: generateId(),
      serviceType: selectedService,
      serviceLabel: itemLabel,
      formData: { ...formData },
      coverType,
      bedType,
      mattressCompany: mattMeta.mattressCompany,
      mattressCompanyName: mattMeta.mattressCompanyName,
      mattressThickness,
      mattressWarranty,
      mattressWarrantyLabel: mattMeta.mattressWarrantyLabel,
      breakdown: itemBreakdown,
      subtotal: activeSubtotal,
    };
    setCartItems((prev) => [...prev, newItem]);
    setSelectedService(null);
    setFormData({});
    setMattressCompany(null);
    setMattressThickness(null);
    setMattressWarranty(null);
    setMattressStep(1);
    showToast(`${itemLabel} કોટેશનમાં ઉમેરાયું! હવે બીજી સેવા પસંદ કરો.`);
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
    const allEntries = [
      ...cartItems,
      ...(selectedService ? [{ serviceType: selectedService }] : []),
    ];
    const hasCurtains = allEntries.some((item) => item.serviceType === 'curtains');
    const hasSofa = allEntries.some((item) => item.serviceType !== 'curtains');
    const count = allEntries.length;
    const prefix =
      hasCurtains && hasSofa ? 'સોફા + પડદા સંયુક્ત બિલ' : 'મિશ્ર કોટેશન';
    return {
      serviceType: 'multi',
      serviceLabel: `${prefix} (${count} સેવાઓ)`,
    };
  };

  const handleSaveQuotation = () => {
    const { serviceType, serviceLabel } = getCombinedServiceMeta();
    const combinedBreakdown = getCombinedBreakdown();
    const mattMeta = resolveMattressMeta();

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
      mattressCompany: mattMeta.mattressCompany,
      mattressCompanyName: mattMeta.mattressCompanyName,
      mattressThickness,
      mattressWarranty,
      mattressWarrantyLabel: mattMeta.mattressWarrantyLabel,
      cartItems:
        cartItems.length > 0
          ? [
              ...cartItems,
              ...(selectedService
                ? [
                    {
                      id: generateId(),
                      serviceType: selectedService,
                      serviceLabel:
                        selectedService === 'mattress' && mattMeta.mattressCompanyName
                          ? `ગાદલા (${mattMeta.mattressCompanyName} · ${mattMeta.mattressWarrantyLabel})`
                          : activeServiceObj?.label || selectedService,
                      formData: { ...formData },
                      coverType,
                      bedType,
                      mattressCompany: mattMeta.mattressCompany,
                      mattressCompanyName: mattMeta.mattressCompanyName,
                      mattressThickness,
                      mattressWarranty,
                      mattressWarrantyLabel: mattMeta.mattressWarrantyLabel,
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
      advance: Math.max(0, Number(advance) || 0),
      status: status || 'pending',
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
    setAdvance(quote.advance || 0);
    setStatus(quote.status || 'pending');
    setEditingQuoteId(isEditMode ? quote.id : null);

    let nextPage = 'form';
    if (quote.serviceType === 'multi' && Array.isArray(quote.cartItems) && quote.cartItems.length > 0) {
      const lastSofaIdx = quote.cartItems.reduce(
        (acc, item, idx) => (item.serviceType !== 'curtains' ? idx : acc),
        -1
      );
      if (lastSofaIdx >= 0) {
        const lastSofa = quote.cartItems[lastSofaIdx];
        setCartItems(quote.cartItems.filter((_, idx) => idx !== lastSofaIdx));
        setSelectedService(lastSofa.serviceType);
        setFormData({ ...(lastSofa.formData || {}) });
        setCoverType(lastSofa.coverType || 'simple');
        setBedType(lastSofa.bedType || 'bed');
        setMattressCompany(
          lastSofa.mattressCompany || getMattressCompanies(settings)[0]?.id || null
        );
        setMattressThickness(lastSofa.mattressThickness || null);
        setMattressWarranty(lastSofa.mattressWarranty || null);
        setMattressStep(lastSofa.serviceType === 'mattress' ? 3 : 1);
      } else {
        setCartItems([...quote.cartItems]);
        setSelectedService(null);
        setFormData({});
        nextPage = 'summary';
      }
    } else {
      setCartItems([]);
      setSelectedService(quote.serviceType);
      setFormData({ ...(quote.formData || {}) });
      setCoverType(quote.coverType || 'simple');
      setBedType(quote.bedType || 'bed');
      setMattressCompany(
        quote.mattressCompany || getMattressCompanies(settings)[0]?.id || null
      );
      setMattressThickness(quote.mattressThickness || null);
      setMattressWarranty(quote.mattressWarranty || null);
      setMattressStep(quote.serviceType === 'mattress' ? 3 : 1);
    }

    showToast(
      isEditMode
        ? 'કોટેશન સુધારવા માટે લોડ થયું'
        : 'કોટેશનની નકલ લોડ થઈ'
    );
    setPage(nextPage);
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

  const handleUpdateSofaQuoteMeta = (id, patch) => {
    let nextView = null;
    const updated = quotations.map((q) => {
      if (q.id !== id) return q;
      nextView = { ...q, ...patch };
      return nextView;
    });
    setQuotations(updated);
    saveSofaQuotations(updated);
    if (nextView && viewQuote?.id === id) {
      setViewQuote(nextView);
    }
    showToast('કોટેશન અપડેટ થયું!');
  };

  const handleUpdateCurtainQuoteMeta = (id, patch) => {
    let nextView = null;
    const updated = curtainQuotations.map((q) => {
      if (q.id !== id) return q;
      nextView = { ...q, ...patch };
      return nextView;
    });
    setCurtainQuotations(updated);
    saveCurtainQuotations(updated);
    if (nextView && viewCurtainQuote?.id === id) {
      setViewCurtainQuote(nextView);
    }
    showToast('પડદા કોટેશન અપડેટ થયું!');
  };

  const handleAddCurtainToMainQuote = (curtainCartItem, curtainCustomer) => {
    if (!customerName && curtainCustomer?.name) {
      setCustomerName(curtainCustomer.name);
    }
    if (!customerPhone && curtainCustomer?.phone) {
      setCustomerPhone(curtainCustomer.phone);
    }
    if (curtainCustomer?.date) {
      setQuotationDate(curtainCustomer.date);
    }
    if ((!advance || Number(advance) === 0) && curtainCustomer?.advance) {
      setAdvance(Number(curtainCustomer.advance) || 0);
    }
    if (status === 'pending' && curtainCustomer?.status) {
      setStatus(curtainCustomer.status);
    }
    const hasOtherServices = cartItems.length > 0 || Boolean(selectedService);
    setCartItems((prev) => [...prev, curtainCartItem]);
    if (hasOtherServices) {
      showToast(`${curtainCartItem.serviceLabel} સંયુક્ત બિલમાં ઉમેરાયું!`);
      setPage('summary');
    } else {
      showToast(
        'પડદા કોટેશનમાં ઉમેરાયા! હવે સોફા સેવા પસંદ કરો અથવા Preview જુઓ.'
      );
      setPage('home');
    }
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

  const handleTransferMaterialToQuote = (
    targetService,
    kapadMeters,
    targetCoverType = 'simple'
  ) => {
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
      setCoverType(targetCoverType);
      const defaults = getServiceDefaultsFromSettings(
        'cover',
        settings,
        targetCoverType
      );
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
  const hasStickyMobileBar =
    (page === 'form' && showStickySidebar) ||
    page === 'curtains' ||
    page === 'material';

  return (
    <div className="app">
      <Header
        activeTab={page}
        onNavigate={handleNavigate}
        totalQuotesCount={totalQuotesCount}
        shopName={settings.shopName || 'સોફા એસ્ટિમેટ'}
      />

      <main className={`main ${hasStickyMobileBar ? 'has-mobile-sticky-bar' : ''}`}>
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
            onAddToMainQuote={handleAddCurtainToMainQuote}
            savedCustomers={savedCustomers}
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
            settings={settings}
            showToast={showToast}
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
                mattressCompany={mattressCompany}
                setMattressCompany={setMattressCompany}
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
                      mattressCompany={mattressCompany}
                      setMattressCompany={setMattressCompany}
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
                    savedCustomers={savedCustomers}
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
                    advance={advance}
                    status={status}
                    onChangeAdjustment={handleChangeAdjustment}
                  />
                </div>

                {/* Sticky Live Totals & Multi-Service Cart */}
                <aside id="sofa-summary-side" className="workspace-side">
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
                      advance={advance}
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
            {showStickySidebar && (
              <MobileStickyBar
                label="કુલ રકમ"
                value={`₹ ${fmt(liveTotals.grand)}`}
                subText={
                  Number(advance) > 0
                    ? `બાકી: ₹ ${fmt(Math.max(0, liveTotals.grand - Number(advance)))}`
                    : cartItems.length > 0
                    ? `${cartItems.length + 1} સેવાઓ`
                    : undefined
                }
                actionLabel="Preview →"
                onAction={() => setPage('summary')}
                targetSideId="sofa-summary-side"
                variant="accent"
              />
            )}
          </div>
        )}

        {/* Summary / Preview Screen */}
        {page === 'summary' && (() => {
          const mattMeta = resolveMattressMeta();
          return (
            <QuotationPreview
              customerName={customerName}
              customerPhone={customerPhone}
              quotationDate={quotationDate}
              service={activeServiceObj}
              serviceLabel={combinedMeta.serviceLabel}
              mattressCompany={mattMeta.mattressCompany}
              mattressCompanyName={mattMeta.mattressCompanyName}
              mattressThickness={mattressThickness}
              mattressWarranty={mattressWarranty}
              mattressWarrantyLabel={mattMeta.mattressWarrantyLabel}
              breakdown={getCombinedBreakdown()}
              totals={liveTotals}
              commission={commission}
              gst={gst}
              discount={discount}
              advance={advance}
              status={status}
              isEditing={Boolean(editingQuoteId)}
              settings={settings}
              onSave={handleSaveQuotation}
              onEdit={() => setPage(selectedService ? 'form' : 'home')}
              onPrint={() => window.print()}
              showToast={showToast}
            />
          );
        })()}

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
            key={viewQuote?.id || 'view'}
            quote={viewQuote}
            settings={settings}
            onBack={() => setPage('quotes')}
            onEdit={(q) => loadSofaQuoteIntoEditor(q, true)}
            onDuplicate={(q) => loadSofaQuoteIntoEditor(q, false)}
            onDelete={handleDeleteQuotation}
            onUpdateQuoteMeta={handleUpdateSofaQuoteMeta}
            showToast={showToast}
          />
        )}

        {/* View Curtain Quotation Detail Screen */}
        {page === 'viewCurtain' && (
          <CurtainDetail
            key={viewCurtainQuote?.id || 'view-curtain'}
            quote={viewCurtainQuote}
            settings={settings}
            onBack={() => setPage('quotes')}
            onEdit={(q) => handleEditCurtainQuote(q, true)}
            onDuplicate={(q) => handleEditCurtainQuote(q, false)}
            onDelete={handleDeleteCurtainQuote}
            onUpdateQuoteMeta={handleUpdateCurtainQuoteMeta}
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
