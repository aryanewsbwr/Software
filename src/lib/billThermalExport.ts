import { BillRecord, BillPrintMode, BOY_LOGO_B64 } from './bill4in1Export';
import { cleanOrTransliterateHindi } from './transliteration';
import { roundToFoxProRule } from './billingEngine';
import { generateDynamicUpiQrSvg } from './upiQrHelper';

function formatMoney(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return '0.00';
  return Number(n).toFixed(2);
}

function formatShortMonthYear(m: string | undefined, y: string | number | undefined): string {
  const shortMap: Record<string, string> = {
    'january': 'Jan', 'february': 'Feb', 'march': 'Mar', 'april': 'Apr',
    'may': 'May', 'june': 'Jun', 'july': 'Jul', 'august': 'Aug',
    'september': 'Sep', 'sept': 'Sep', 'october': 'Oct', 'november': 'Nov', 'december': 'Dec'
  };
  const cleanM = (m || '').trim().toLowerCase();
  const sM = shortMap[cleanM] || (m ? m.slice(0, 3) : '');
  return `${sM} ${y || ''}`.trim();
}

function computeNextMonthBillDate(m: string | undefined, y: string | number | undefined): string {
  const mLow = (m || '').toLowerCase().slice(0, 3);
  const mList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const mIdx = mList.indexOf(mLow);
  const baseYear = Number(y) || 2026;
  if (mIdx >= 0) {
    const nextM = (mIdx + 1) % 12;
    const nextYr = nextM === 0 ? baseYear + 1 : baseYear;
    return `01-${String(nextM + 1).padStart(2, '0')}-${nextYr}`;
  }
  return `01-10-${baseYear}`;
}

function cleanPhone(p: string | undefined | null): string {
  if (!p || p === '---') return '';
  const digits = String(p).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return String(p).trim();
}

/**
 * Renders HTML for a single modern professional Thermal Bill receipt
 * Exactly matching the layout, typography, borders, and QR payment card shown in the reference bill.
 */
export function renderSingleThermalBillHtml(b: BillRecord, printMode: BillPrintMode = 'simple'): string {
  let displayHindi = cleanOrTransliterateHindi(b.customer_hindi || '', b.customer_name);
  const cleanEngName = (b.customer_name || '').replace(/\s+crd\b/i, '').trim();

  // If Hindi contains "CRD" or suffix, clean it up cleanly
  if (displayHindi) {
    displayHindi = displayHindi.replace(/\s+सीआरडी\b/i, '').replace(/\s+CRD\b/i, '').trim();
  }

  const items = b.items || [];
  const totalDelivery = b.delivery_charge || 0;

  let itemsRowsHtml = '';

  if (printMode === 'simple') {
    const pubConsolidatedMap = new Map<string, {
      pub_name: string;
      totalQty: number;
      totalAmount: number;
    }>();

    const hasItemDelivery = items.some(it => (it.delivery_amount || 0) > 0);

    items.forEach((it, idx) => {
      const pubHindiOrClean = cleanOrTransliterateHindi('', it.pub_name) || it.pub_name.trim();
      const pubKey = pubHindiOrClean.toLowerCase();
      const qty = Number(it.days !== undefined && it.days > 0 ? it.days : (it.qty || 1));
      
      let itemDelivery = 0;
      if (hasItemDelivery) {
        itemDelivery = it.delivery_amount || 0;
      } else if (totalDelivery > 0 && idx === 0) {
        itemDelivery = totalDelivery;
      }
      const itemAmt = roundToFoxProRule(it.amount + itemDelivery);

      const existing = pubConsolidatedMap.get(pubKey);
      if (existing) {
        existing.totalQty += qty;
        existing.totalAmount = roundToFoxProRule(existing.totalAmount + itemAmt);
      } else {
        pubConsolidatedMap.set(pubKey, {
          pub_name: pubHindiOrClean,
          totalQty: qty,
          totalAmount: itemAmt
        });
      }
    });

    const displayItems = Array.from(pubConsolidatedMap.values());
    const monthBillAmount = roundToFoxProRule((b.paper_amount || 0) + (b.delivery_charge || 0));

    itemsRowsHtml = displayItems.length > 0
      ? displayItems.map(it => `
          <div class="line-item-row">
            <span class="col-part">${it.pub_name}</span>
            <span class="col-days">${it.totalQty}</span>
            <span class="col-amt">${formatMoney(it.totalAmount)}</span>
          </div>
        `).join('')
      : `
          <div class="line-item-row">
            <span class="col-part">समाचार पत्र / मासिक</span>
            <span class="col-days">30</span>
            <span class="col-amt">${formatMoney(monthBillAmount)}</span>
          </div>
        `;
  } else {
    itemsRowsHtml = items.length > 0
      ? items.map(it => {
          const qtyOrDays = it.days !== undefined && it.days > 0 ? it.days : (it.qty || 1);
          const pubHindiOrClean = cleanOrTransliterateHindi('', it.pub_name) || it.pub_name;
          return `
            <div class="line-item-row">
              <span class="col-part">${pubHindiOrClean}</span>
              <span class="col-days">${qtyOrDays}</span>
              <span class="col-amt">${formatMoney(roundToFoxProRule(it.amount))}</span>
            </div>
          `;
        }).join('')
      : `
          <div class="line-item-row">
            <span class="col-part">समाचार पत्र / मासिक</span>
            <span class="col-days">30</span>
            <span class="col-amt">${formatMoney(roundToFoxProRule(b.paper_amount || 0))}</span>
          </div>
        `;
  }

  const paperAmount = roundToFoxProRule(b.paper_amount || 0);
  const deliveryCharge = roundToFoxProRule(b.delivery_charge || 0);
  const monthBillAmount = roundToFoxProRule(paperAmount + deliveryCharge);
  const previousDue = roundToFoxProRule(b.previous_due || 0);
  const netPayable = roundToFoxProRule(b.net_payable || (monthBillAmount + previousDue));

  const monthYearDisplay = formatShortMonthYear(b.month, b.year);
  const formattedPhone = cleanPhone(b.phone);

  const rawQrSvg = generateDynamicUpiQrSvg(netPayable, b.bill_no || b.customer_id, `${b.month || ''} ${b.year || ''}`.trim(), 180, 0);

  return `
    <div class="bill-card">
      
      <!-- Agency Header -->
      <div class="agency-header">
        <div class="agency-logo-wrap">
          <img src="${BOY_LOGO_B64}" alt="Aryan News Agency" class="agency-logo-img" />
        </div>
        <div class="agency-details">
          <div class="agency-name-en">ARYAN NEWS AGENCY</div>
          <div class="agency-name-hi">आर्यन न्यूज़ एजेंसी</div>
          <div class="agency-address">5(1), Old Bus Stand, Beawar (Raj.) 305901</div>
          <div class="agency-contact">WhatsApp: 9462558949</div>
          <div class="agency-contact">Ph: 9829058949</div>
          <div class="agency-web">www.aryannewsagency.com</div>
        </div>
      </div>

      <!-- Solid Top Rule -->
      <div class="solid-rule-thick"></div>

      <!-- Pill Badge: MONTHLY BILL / मासिक बिल -->
      <div class="pill-badge-container">
        <div class="pill-badge">MONTHLY BILL / मासिक बिल</div>
      </div>

      <!-- Meta Info Grid (Bill No, Month, A/c No) -->
      <div class="meta-grid">
        <div class="meta-row">
          <div class="meta-cell"><span class="meta-label">Bill No:</span> <span class="meta-val">${b.bill_no || b.customer_id}</span></div>
          <div class="meta-cell text-right"><span class="meta-label">Month:</span> <span class="meta-val">${monthYearDisplay}</span></div>
        </div>
        <div class="meta-row">
          <div class="meta-cell"><span class="meta-label">A/c No:</span> <span class="meta-val">${b.customer_id}</span></div>
        </div>
      </div>

      <!-- Dashed Divider -->
      <div class="dashed-divider"></div>

      <!-- Customer Details Section -->
      <div class="customer-section">
        <div class="customer-name-en">${cleanEngName}</div>
        ${displayHindi && displayHindi !== cleanEngName ? `<div class="customer-name-hi">${displayHindi}</div>` : ''}
        <div class="customer-sub-row">
          <span>Region: ${b.region_name || b.region_id}${b.priority ? ` &nbsp;|&nbsp; Pr: ${b.priority}` : ''}</span>
          ${formattedPhone ? `<span>Mob: ${formattedPhone}</span>` : ''}
        </div>
      </div>

      <!-- Dashed Divider -->
      <div class="dashed-divider"></div>

      <!-- Particulars Table Header -->
      <div class="items-header-row">
        <span class="col-part">विवरण / Particular</span>
        <span class="col-days">Days</span>
        <span class="col-amt">Amount ₹</span>
      </div>

      <!-- Dashed Divider -->
      <div class="dashed-divider" style="margin-top: 3px; margin-bottom: 5px;"></div>

      <!-- Publication Line Items -->
      <div class="items-container">
        ${itemsRowsHtml}
      </div>

      <!-- Dashed Divider -->
      <div class="dashed-divider"></div>

      <!-- Summary Breakdown (Current Month / Previous Due) -->
      <div class="summary-section">
        <div class="summary-row">
          <span class="summary-label">Current Month / इस माह</span>
          <span class="summary-value">₹ ${formatMoney(monthBillAmount)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Previous Due / पिछला बकाया</span>
          <span class="summary-value">₹ ${formatMoney(previousDue)}</span>
        </div>
      </div>

      <!-- Boxed TOTAL / कुल देय Banner -->
      <div class="total-banner-box">
        <div class="total-label-left">TOTAL / कुल देय</div>
        <div class="total-amount-right">₹ ${formatMoney(netPayable)}</div>
      </div>

      <!-- Dynamic UPI QR Payment Section -->
      <div class="qr-payment-section">
        <div class="qr-code-wrapper">
          ${rawQrSvg}
        </div>
        <div class="qr-title-en">Scan &amp; Pay ₹${Math.round(netPayable)} via any UPI app</div>
        <div class="qr-subtitle-hi">किसी भी UPI ऐप से स्कैन कर भुगतान करें</div>
      </div>

      <!-- Dashed Divider -->
      <div class="dashed-divider"></div>

      <!-- Footer Policy & Thank You Notice -->
      <div class="footer-notice">
        <div class="footer-due-line">कृपया बिल की राशि 5 तारीख तक जमा करें।</div>
        <div class="footer-query-line">Queries: reply on WhatsApp 94625 58949</div>
        <div class="footer-thanks-line">धन्यवाद!</div>
      </div>

    </div>
  `;
}

/**
 * Full HTML page for printing continuous roll or exporting PDF
 */
export function generateThermal58mmFullHtml(
  bills: BillRecord[],
  title: string = 'Aryan News Agency - Monthly Bills',
  printMode: BillPrintMode = 'simple'
): string {
  const receiptsHtml = bills.map((b) => renderSingleThermalBillHtml(b, printMode)).join('\n<div class="page-break"></div>\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @charset "utf-8";

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans Devanagari", sans-serif;
      color: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 0;
    }

    /* Print toolbar */
    .print-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      max-width: 440px;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 16px;
      margin-bottom: 18px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-action {
      font-family: inherit;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: background-color 0.15s ease;
    }

    .btn-print {
      background: #2563eb;
      color: #fff;
    }
    .btn-print:hover { background: #1d4ed8; }

    .btn-close {
      background: #475569;
      color: #fff;
      margin-left: 8px;
    }
    .btn-close:hover { background: #334155; }

    .receipts-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    /* Main Bill Card: Optimized for standard 58mm & 80mm thermal printers with high contrast & crisp alignment */
    .bill-card {
      width: 80mm;
      max-width: 80mm;
      background: #ffffff;
      padding: 4mm 3mm;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      border: 1px solid #e2e8f0;
      box-sizing: border-box;
      page-break-inside: avoid;
      color: #000000;
      text-align: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Header Section */
    .agency-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      margin-bottom: 8px;
      text-align: left;
    }

    .agency-logo-wrap {
      width: 58px;
      height: 64px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .agency-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .agency-logo-img {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
      display: block;
    }

    .agency-name-en {
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.3px;
      color: #000;
      line-height: 1.15;
    }

    .agency-name-hi {
      font-size: 12.5px;
      font-weight: 800;
      color: #000;
      margin-top: 1px;
      line-height: 1.15;
    }

    .agency-address {
      font-size: 9px;
      font-weight: 700;
      color: #000;
      margin-top: 2px;
      line-height: 1.25;
    }

    .agency-contact {
      font-size: 9px;
      font-weight: 700;
      color: #000;
      margin-top: 1px;
      line-height: 1.25;
    }

    .agency-web {
      font-size: 9px;
      font-weight: 700;
      color: #000;
      margin-top: 1px;
      line-height: 1.25;
    }

    .solid-rule-thick {
      width: 100%;
      height: 1.8px;
      background: #000000;
      margin: 10px 0 12px 0;
    }

    /* Pill Badge */
    .pill-badge-container {
      display: flex;
      justify-content: center;
      margin-bottom: 10px;
    }

    .pill-badge {
      display: inline-block;
      padding: 3.5px 14px;
      border: 1.2px solid #000000;
      border-radius: 9999px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: #000;
      background: #ffffff;
    }

    /* Meta Grid */
    .meta-grid {
      display: flex;
      flex-direction: column;
      gap: 3.5px;
      margin-bottom: 10px;
      font-size: 11px;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meta-cell {
      flex: 1;
      text-align: left;
    }

    .text-right {
      text-align: right;
    }

    .meta-label {
      font-weight: 700;
      color: #000;
    }

    .meta-val {
      font-weight: 900;
      color: #000;
    }

    /* Dashed Divider */
    .dashed-divider {
      width: 100%;
      border-top: 1.2px dashed #000000;
      margin: 8px 0;
    }

    /* Customer Section */
    .customer-section {
      text-align: left;
      margin-bottom: 8px;
    }

    .customer-name-en {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.3px;
      color: #000;
      text-transform: uppercase;
      line-height: 1.2;
    }

    .customer-name-hi {
      font-size: 12.5px;
      font-weight: 800;
      color: #000;
      margin-top: 2px;
      line-height: 1.2;
    }

    .customer-sub-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      font-weight: 700;
      color: #000;
      margin-top: 3px;
    }

    /* Items Table */
    .items-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 800;
      color: #000;
    }

    .items-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .line-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
      color: #000;
    }

    .col-part {
      flex: 2;
      text-align: left;
    }

    .col-days {
      flex: 1;
      text-align: center;
    }

    .col-amt {
      flex: 1;
      text-align: right;
      font-weight: 700;
    }

    /* Summary Section */
    .summary-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 11px;
      margin-bottom: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #222;
    }

    .summary-label {
      text-align: left;
    }

    .summary-value {
      text-align: right;
      font-weight: 700;
      color: #000;
    }

    /* Total Banner Box */
    .total-banner-box {
      border: 1.4px solid #000000;
      border-radius: 6px;
      padding: 6.5px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      background: #ffffff;
    }

    .total-label-left {
      font-size: 12.5px;
      font-weight: 900;
      color: #000;
      letter-spacing: 0.3px;
    }

    .total-amount-right {
      font-size: 14.5px;
      font-weight: 900;
      color: #000;
    }

    /* QR Payment Section */
    .qr-payment-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 12px;
    }

    .qr-code-wrapper {
      width: 145px;
      height: 145px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .qr-code-wrapper svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .qr-title-en {
      font-size: 11px;
      font-weight: 800;
      color: #000;
      line-height: 1.3;
    }

    .qr-subtitle-hi {
      font-size: 10px;
      font-weight: 600;
      color: #333;
      margin-top: 1.5px;
      line-height: 1.3;
    }

    /* Footer Notice */
    .footer-notice {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2.5px;
      font-size: 9.5px;
      color: #000;
      line-height: 1.4;
    }

    .footer-due-line {
      font-weight: 800;
      color: #000;
    }

    .footer-query-line {
      font-weight: 700;
      color: #000;
    }

    .footer-thanks-line {
      font-weight: 900;
      font-size: 11px;
      color: #000;
      margin-top: 2px;
    }

    /* Print Rules */
    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        display: block !important;
      }

      .no-print, .print-toolbar {
        display: none !important;
      }

      .receipts-container {
        gap: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        width: 100% !important;
      }

      .bill-card {
        box-shadow: none !important;
        border: none !important;
        padding: 2mm 1.5mm !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 72mm !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: always;
        break-after: page;
      }

      .page-break {
        page-break-after: always;
        break-after: page;
        height: 0;
        margin: 0;
        padding: 0;
      }

      @page {
        size: auto;
        margin: 0mm;
      }
    }
  </style>
</head>
<body>

  <!-- Top Action Toolbar -->
  <div class="print-toolbar no-print">
    <div>
      <div style="font-weight: bold; font-size: 13px;">🧾 Aryan News Agency - Bill Print</div>
      <div style="font-size: 11px; opacity: 0.85;">Total ${bills.length} Bill${bills.length > 1 ? 's' : ''}</div>
    </div>
    <div>
      <button class="btn-action btn-print" onclick="window.print()">Print / Save PDF</button>
      <button class="btn-action btn-close" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="receipts-container">
    ${receiptsHtml}
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>

</body>
</html>`;
}

/**
 * Triggers printing of thermal bills in new professional format
 */
export function printBillsThermal58mm(
  bills: BillRecord[],
  title: string = 'Aryan News Agency - Monthly Bills',
  printMode: BillPrintMode = 'simple'
): void {
  if (!bills || bills.length === 0) {
    alert('No bills available to print.');
    return;
  }

  const html = generateThermal58mmFullHtml(bills, title, printMode);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '96mm';
    iframe.style.height = '150mm';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }, 500);
    }
  }
}
