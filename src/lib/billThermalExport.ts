import { BillRecord } from './bill4in1Export';
import { cleanOrTransliterateHindi } from './transliteration';
import { roundToFoxProRule } from './billingEngine';

function formatMoney(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return '0.00';
  return Number(n).toFixed(2);
}

/**
 * Renders HTML for a single 58mm (203 dpi) thermal bill receipt.
 * 58mm paper width has ~48mm printable area (approx. 384px at 203dpi or 32-35 characters across in monospace).
 * In Simple mode: Delivery charge is merged into the publication line item / monthly bill amount.
 */
export function renderSingleThermalBillHtml(b: BillRecord): string {
  const displayHindi = cleanOrTransliterateHindi(b.customer_hindi || '', b.customer_name);
  
  // Consolidate publication items and merge delivery into publication amount (Simple Bill requirement)
  const items = b.items || [];
  const pubConsolidatedMap = new Map<string, {
    pub_name: string;
    totalQty: number;
    totalAmount: number;
  }>();

  const hasItemDelivery = items.some(it => (it.delivery_amount || 0) > 0);
  const totalDelivery = b.delivery_charge || 0;

  items.forEach((it, idx) => {
    const cleanPub = it.pub_name.trim();
    const pubKey = cleanPub.toLowerCase();
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
        pub_name: cleanPub,
        totalQty: qty,
        totalAmount: itemAmt
      });
    }
  });

  const displayItems = Array.from(pubConsolidatedMap.values());
  const monthBillAmount = roundToFoxProRule((b.paper_amount || 0) + (b.delivery_charge || 0));
  const previousDue = roundToFoxProRule(b.previous_due || 0);
  const netPayable = roundToFoxProRule(b.net_payable || (monthBillAmount + previousDue));

  const itemsRowsHtml = displayItems.length > 0
    ? displayItems.map(it => `
        <div class="receipt-row">
          <span class="col-item">${it.pub_name} (${it.totalQty}d)</span>
          <span class="col-val">${formatMoney(it.totalAmount)}</span>
        </div>
      `).join('')
    : `
        <div class="receipt-row">
          <span class="col-item">Newspaper / Monthly</span>
          <span class="col-val">${formatMoney(monthBillAmount)}</span>
        </div>
      `;

  return `
    <div class="thermal-receipt">
      <div class="thermal-header">
        <div class="agency-title">ARYAN NEWS AGENCY</div>
        <div class="agency-sub">Main Market, Clock Tower, Beawar</div>
        <div class="agency-sub">Ph: 9887500875, 9414958294</div>
        <div class="receipt-title">*** MONTHLY BILL ***</div>
      </div>

      <div class="divider">================================</div>

      <div class="receipt-row">
        <span>Bill No: <b>${b.bill_no || '-'}</b></span>
        <span>Date: ${b.bill_date || new Date().toLocaleDateString('en-GB')}</span>
      </div>
      <div class="receipt-row">
        <span>Month: <b>${b.month} ${b.year}</b></span>
        <span>ID: <b>${b.customer_id}</b></span>
      </div>

      <div class="divider">--------------------------------</div>

      <div class="cust-info">
        <div class="cust-name">${b.customer_name}</div>
        ${displayHindi && displayHindi !== b.customer_name ? `<div class="cust-hindi">${displayHindi}</div>` : ''}
        ${b.address ? `<div class="cust-detail">${b.address}</div>` : ''}
        <div class="cust-detail">Region: ${b.region_name || b.region_id} ${b.priority ? `| Pr: ${b.priority}` : ''}</div>
        ${b.phone ? `<div class="cust-detail">Mob: ${b.phone}</div>` : ''}
      </div>

      <div class="divider">--------------------------------</div>

      <div class="receipt-table-header">
        <span>PARTICULAR</span>
        <span>AMOUNT (₹)</span>
      </div>
      <div class="divider-dotted">- - - - - - - - - - - - - - - - </div>

      <div class="receipt-items">
        ${itemsRowsHtml}
      </div>

      <div class="divider">--------------------------------</div>

      <div class="receipt-row font-bold">
        <span>Current Month Amt:</span>
        <span>₹ ${formatMoney(monthBillAmount)}</span>
      </div>

      ${previousDue > 0 ? `
        <div class="receipt-row">
          <span>Previous Balance/Due:</span>
          <span>₹ ${formatMoney(previousDue)}</span>
        </div>
      ` : ''}

      ${(b.advance || 0) > 0 ? `
        <div class="receipt-row">
          <span>Advance Paid:</span>
          <span>- ₹ ${formatMoney(b.advance)}</span>
        </div>
      ` : ''}

      <div class="divider">================================</div>

      <div class="receipt-row total-row">
        <span>TOTAL PAYABLE:</span>
        <span class="total-amount">₹ ${formatMoney(netPayable)}</span>
      </div>

      <div class="divider">================================</div>

      <div class="thermal-footer">
        <div>Please pay bill by due date.</div>
        <div>Thank You For Reading!</div>
        <div class="cut-line">- - - - - - - - Cut Here - - - - - - - -</div>
      </div>
    </div>
  `;
}

/**
 * Full HTML page for printing 58mm continuous roll or PDF export
 */
export function generateThermal58mmFullHtml(bills: BillRecord[], title: string = '58mm Thermal Bill Print'): string {
  const receiptsHtml = bills.map((b) => renderSingleThermalBillHtml(b)).join('\n<div class="page-break"></div>\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} (58mm Thermal)</title>
  <style>
    @charset "utf-8";

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: #f1f5f9;
      font-family: "Courier New", Courier, monospace, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #000;
      font-size: 11px;
      line-height: 1.25;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
    }

    /* Print toolbar */
    .print-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      max-width: 580px;
      background: #1e293b;
      color: #ffffff;
      padding: 10px 16px;
      margin-bottom: 16px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-action {
      font-family: inherit;
      font-size: 11px;
      font-weight: bold;
      padding: 6px 14px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
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

    /* Thermal receipt container for 58mm (approx. 48mm printable / 185px - 210px) */
    .receipts-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .thermal-receipt {
      width: 58mm;
      max-width: 58mm;
      min-width: 58mm;
      background: #fff;
      padding: 4mm 3mm;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      border: 1px dashed #cbd5e1;
      box-sizing: border-box;
      page-break-inside: avoid;
    }

    .thermal-header {
      text-align: center;
      margin-bottom: 4px;
    }

    .agency-title {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }

    .agency-sub {
      font-size: 9px;
      color: #111;
    }

    .receipt-title {
      font-size: 10px;
      font-weight: bold;
      margin-top: 3px;
      letter-spacing: 1px;
    }

    .divider {
      text-align: center;
      font-weight: bold;
      font-size: 9px;
      letter-spacing: -0.5px;
      margin: 2px 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .divider-dotted {
      text-align: center;
      font-size: 9px;
      letter-spacing: -0.5px;
      margin: 1px 0;
      overflow: hidden;
      white-space: nowrap;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 10px;
      margin: 1.5px 0;
    }

    .cust-info {
      margin: 2px 0;
    }

    .cust-name {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .cust-hindi {
      font-size: 11px;
      font-weight: bold;
    }

    .cust-detail {
      font-size: 9.5px;
      color: #111;
      word-break: break-word;
    }

    .receipt-table-header {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      font-weight: bold;
      margin-top: 2px;
    }

    .receipt-items {
      margin: 2px 0;
    }

    .col-item {
      font-size: 10px;
      max-width: 70%;
      word-break: break-word;
    }

    .col-val {
      font-size: 10px;
      font-weight: bold;
      text-align: right;
    }

    .font-bold {
      font-weight: bold;
    }

    .total-row {
      font-size: 12px;
      font-weight: 900;
      margin: 3px 0;
    }

    .total-amount {
      font-size: 13px;
      font-weight: 900;
    }

    .thermal-footer {
      text-align: center;
      font-size: 9px;
      margin-top: 6px;
      line-height: 1.3;
    }

    .cut-line {
      font-size: 8px;
      color: #666;
      margin-top: 6px;
    }

    /* Print Specific Media Query */
    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 58mm !important;
      }

      .no-print, .print-toolbar {
        display: none !important;
      }

      .receipts-container {
        gap: 0 !important;
      }

      .thermal-receipt {
        box-shadow: none !important;
        border: none !important;
        padding: 2mm 2mm !important;
        width: 58mm !important;
        max-width: 58mm !important;
        page-break-after: always;
      }

      .page-break {
        page-break-after: always;
        height: 0;
      }

      @page {
        size: 58mm auto;
        margin: 0;
      }
    }
  </style>
</head>
<body>

  <!-- Non-printable top action toolbar -->
  <div class="print-toolbar no-print">
    <div>
      <div style="font-weight: bold; font-size: 13px;">🧾 58mm Thermal Bill Print (203 DPI)</div>
      <div style="font-size: 11px; opacity: 0.8;">Simple Bill Format • Total ${bills.length} Bill${bills.length > 1 ? 's' : ''}</div>
    </div>
    <div>
      <button class="btn-action btn-print" onclick="window.print()">Print / Save PDF</button>
      <button class="btn-action btn-close" onclick="window.close()">Close</button>
    </div>
  </div>

  <!-- Thermal receipts continuous roll container -->
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
 * Triggers printing of 58mm thermal bills
 */
export function printBillsThermal58mm(bills: BillRecord[], title: string = 'Aryan News Agency - 58mm Thermal Bills'): void {
  if (!bills || bills.length === 0) {
    alert('No bills available to print.');
    return;
  }

  const html = generateThermal58mmFullHtml(bills, title);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Popup fallback iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '58mm';
    iframe.style.height = '100mm';
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
