# સોફા અને પડદા એસ્ટિમેટ (Sofa & Curtain Quotation App)

A modern, responsive React + Vite application converted from the HTML/vanilla JS `sofa-quotation-app-main` project. It features an elegant UI built with DM Sans, DM Serif Display, Noto Sans Gujarati, real-time live calculation cards, PDF exports, and print layouts.

---

## 📁 Project Architecture & Folder Structure

```text
my-sofa-website/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx             # Top bar with logo, title, and tab navigation
│   │   │   ├── Toast.jsx              # Toast feedback notification
│   │   │   └── CustomerForm.jsx       # Customer name, phone, quotation date
│   │   ├── sofa/
│   │   │   ├── ServiceGrid.jsx         # 7 Service selection cards
│   │   │   ├── StandardServiceForm.jsx # Structure & Upholstery forms
│   │   │   ├── ReupholsteryForm.jsx    # 9 Raw materials + Labour calculator
│   │   │   ├── BedForm.jsx             # Bed & Bed Back dimensions
│   │   │   ├── CoverForm.jsx           # Simple vs Sponge covers (with Fevicol)
│   │   │   ├── MattressWizard.jsx      # 3-Step Wizard: Thickness, Warranty, Dimensions
│   │   │   ├── AdjustmentsForm.jsx     # Commission %, GST %, Discount ₹
│   │   │   └── LiveTotalsCard.jsx      # Real-time subtotal, GST, commission, grand total
│   │   ├── curtains/
│   │   │   ├── CurtainCalculator.jsx   # Eyelet, Arabian, Flat Pleat calculator
│   │   │   └── CurtainList.jsx         # Saved curtain quotes with print/delete
│   │   └── quotations/
│   │       ├── QuotationPreview.jsx    # Pre-save quotation review
│   │       ├── QuotationsList.jsx      # All saved sofa quotations with search filter
│   │       └── QuotationDetail.jsx     # Detailed view with PDF download & Print
│   ├── constants/
│   │   ├── services.js                 # Services list, default rates, reupholstery items
│   │   └── curtainConfig.js            # Curtain types, hardware/fabric rates, formulas
│   ├── utils/
│   │   ├── calculations.js             # Pricing math, breakdowns, subtotal, totals
│   │   ├── formatters.js               # Indian currency formatting (₹), custom rounding
│   │   ├── id.js                       # Unique ID generator
│   │   ├── pdfExport.js                # jsPDF exports for both sofa and curtain quotes
│   │   └── storage.js                  # LocalStorage persistence helpers
│   ├── styles/
│   │   ├── main.css                    # Design tokens, typography, cards, responsive CSS
│   │   └── print.css                   # Clean print media stylesheet (@media print)
│   ├── App.jsx                         # Main coordinator application component
│   ├── index.css                       # Root CSS imports
│   └── main.jsx                        # React 19 entry point
├── index.html                          # HTML template with Google Fonts & jsPDF CDN
├── package.json
└── vite.config.js
```

---

## ✨ Features

1. **7 Complete Services**:
   - **સ્ટ્રક્ચર સાથે મઢવા માટે (Structure fabrication)**: Rate per foot with default ₹1950.
   - **માલસામાન સાથે મઢવા માટે (New fabric & foam fitting)**: Rate per foot with default ₹1250.
   - **જૂના સોફા મઢવા માટે (Reupholstery & restore old sofas)**: Detailed input for 9 materials (4" sponge, 2" seat, 1" seat, Stanzo 15mm, Fevicol, Madarpate, Kapad, Recron, Stapler pins) and flat labour.
   - **બેડ મઢવા માટે (Beds & Headboards)**: Bed / Bed Back tabs with dimension inputs.
   - **સોફા ના કવર માટે (Sofa Covers)**: Simple cover vs Sponge cover (with Stanzo padding and Fevicol).
   - **ગાદલા માટે (4" & 6" Mattress)**: 3-step wizard with 10-year / 15-year warranty rates and custom `roundToCustomFeet` formula `(w * h) / 144`.
   - **પડદા બનાવવા માટે (Curtain Estimation)**: Seamlessly integrated with 3 styles (Eyelet, Arabian, Flat Pleat) calculating hardware, fabric pano width, pleat fullness, meters, sewing, and installation.
2. **Real-time Live Calculations**:
   - Subtotal updates instantly on every keystroke.
   - Live adjustments for Commission (%), GST (%), and Discount (₹).
3. **Quotation Management**:
   - Save quotations to LocalStorage (`sofa_quotations_v3` & `curtainQuotations`).
   - Search through saved quotes by customer name or service.
   - Full quotation detail view.
   - Direct PDF download using `jsPDF`.
   - Browser print dialog with dedicated print layout (`@media print`).
4. **Gujarati + English Bilingual UI**:
   - High readability with `Noto Sans Gujarati`, `Noto Serif Gujarati`, `DM Sans`, and `DM Serif Display`.

---

## 🚀 Running the Project

```bash
cd my-sofa-website

# Start local dev server
npm run dev

# Run lint checks
npm run lint

# Build for production
npm run build
```
