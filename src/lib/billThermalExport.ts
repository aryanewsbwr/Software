import { BillRecord, BillPrintMode, BOY_LOGO_B64 } from './bill4in1Export';
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
 * In Detail mode: Shows exact lines with days, rates, pure paper amounts, and explicit Delivery Charge row.
 */
export function renderSingleThermalBillHtml(b: BillRecord, printMode: BillPrintMode = 'simple'): string {
  const displayHindi = cleanOrTransliterateHindi(b.customer_hindi || '', b.customer_name);
  const items = b.items || [];
  const totalDelivery = b.delivery_charge || 0;

  let itemsRowsHtml = '';

  if (printMode === 'simple') {
    // Consolidate publication items and merge delivery into publication amount (Simple Bill requirement)
    const pubConsolidatedMap = new Map<string, {
      pub_name: string;
      totalQty: number;
      totalAmount: number;
    }>();

    const hasItemDelivery = items.some(it => (it.delivery_amount || 0) > 0);

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

    itemsRowsHtml = displayItems.length > 0
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
  } else {
    // Detail Mode: Each item shown separately with days, rate, and pure paper amount
    itemsRowsHtml = items.length > 0
      ? items.map(it => {
          const qtyOrDays = it.days !== undefined && it.days > 0 ? it.days : (it.qty || 1);
          const rateStr = it.rate !== null && it.rate !== undefined && Number(it.rate) > 0
            ? `@${Number(it.rate).toFixed(2)}`
            : '';
          return `
            <div class="receipt-row">
              <span class="col-item">${it.pub_name} (${qtyOrDays}d ${rateStr})</span>
              <span class="col-val">${formatMoney(roundToFoxProRule(it.amount))}</span>
            </div>
          `;
        }).join('')
      : `
          <div class="receipt-row">
            <span class="col-item">Newspaper / Monthly</span>
            <span class="col-val">${formatMoney(roundToFoxProRule(b.paper_amount || 0))}</span>
          </div>
        `;
  }

  const paperAmount = roundToFoxProRule(b.paper_amount || 0);
  const deliveryCharge = roundToFoxProRule(b.delivery_charge || 0);
  const monthBillAmount = roundToFoxProRule(paperAmount + deliveryCharge);
  const previousDue = roundToFoxProRule(b.previous_due || 0);
  const netPayable = roundToFoxProRule(b.net_payable || (monthBillAmount + previousDue));

  return `
    <div class="thermal-receipt">
      <div class="thermal-header" style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; margin-bottom: 2px;">
        <div class="thermal-logo-box" style="width: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
          <img src="${BOY_LOGO_B64}" alt="logo" style="height: 54px; width: auto; object-fit: contain; display: block; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" />
        </div>
        <div style="flex: 1; text-align: center;">
          <div class="agency-title">ARYAN NEWS AGENCY</div>
          <div class="agency-sub">5 Old Bus stand Beawar</div>
          <div class="agency-sub">Ph: 9462558949, 9829058949</div>
        </div>
      </div>

      <div class="divider">================================</div>

      <div class="receipt-row">
        <span>Bill No: <b>${b.bill_no || b.customer_id}</b></span>
        <span>Month: <b>${b.month} ${b.year}</b></span>
      </div>

      <div class="receipt-row" style="margin-top: 2px;">
        <span>Ac.no.: <b>${b.customer_id}</b></span>
      </div>

      <div class="divider">--------------------------------</div>

      <div class="cust-info">
        <div class="cust-name">${b.customer_name}</div>
        ${displayHindi && displayHindi !== b.customer_name ? `<div class="cust-hindi">${displayHindi}</div>` : ''}
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

      ${printMode === 'detail' && deliveryCharge > 0 ? `
        <div class="receipt-row">
          <span>Paper Total:</span>
          <span>₹ ${formatMoney(paperAmount)}</span>
        </div>
        <div class="receipt-row">
          <span>Delivery Charge:</span>
          <span>₹ ${formatMoney(deliveryCharge)}</span>
        </div>
      ` : ''}

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
        <div style="display: flex; justify-content: center; align-items: center; padding: 4px 0;">
          <img src="/bill_qr_code.jpeg" alt="QR Code" style="width: 100px; height: 100px; object-fit: contain;" />
        </div>
      </div>
    </div>
  `;
}

/**
 * Full HTML page for printing 58mm continuous roll or PDF export
 */
export function generateThermal58mmFullHtml(
  bills: BillRecord[],
  title: string = '58mm Thermal Bill Print',
  printMode: BillPrintMode = 'simple'
): string {
  const receiptsHtml = bills.map((b) => renderSingleThermalBillHtml(b, printMode)).join('\n<div class="page-break"></div>\n');

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

    /* Thermal receipt container for 58mm (48mm printable area max, 44-46mm safe zone) */
    .receipts-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .thermal-receipt {
      width: 48mm;
      max-width: 48mm;
      min-width: 48mm;
      background: #fff;
      padding: 2mm 1.5mm;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      border: 1px dashed #cbd5e1;
      box-sizing: border-box;
      page-break-inside: avoid;
      font-weight: 700;
      color: #000000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .thermal-header {
      text-align: center;
      margin-bottom: 3px;
    }

    .agency-title {
      font-size: 12.5px;
      font-weight: 900;
      letter-spacing: -0.2px;
      color: #000;
    }

    .agency-sub {
      font-size: 8.5px;
      font-weight: 700;
      color: #000;
    }

    .receipt-title {
      font-size: 9.5px;
      font-weight: 900;
      margin-top: 2px;
      letter-spacing: 0.5px;
    }

    .divider {
      text-align: center;
      font-weight: 900;
      font-size: 8.5px;
      letter-spacing: -0.5px;
      margin: 1.5px 0;
      overflow: hidden;
      white-space: nowrap;
      color: #000;
    }

    .divider-dotted {
      text-align: center;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin: 1px 0;
      overflow: hidden;
      white-space: nowrap;
      color: #000;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 9.5px;
      margin: 1px 0;
      font-weight: 700;
    }

    .cust-info {
      margin: 2px 0;
    }

    .cust-name {
      font-size: 10.5px;
      font-weight: 900;
      text-transform: uppercase;
      color: #000;
    }

    .cust-hindi {
      font-size: 10.5px;
      font-weight: 900;
      color: #000;
    }

    .cust-detail {
      font-size: 9px;
      font-weight: 700;
      color: #000;
      word-break: break-word;
    }

    .receipt-table-header {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      font-weight: 900;
      margin-top: 2px;
      color: #000;
    }

    .receipt-items {
      margin: 1.5px 0;
    }

    .col-item {
      font-size: 9px;
      font-weight: 700;
      max-width: 65%;
      word-break: break-word;
      color: #000;
    }

    .col-val {
      font-size: 9px;
      font-weight: 900;
      text-align: right;
      color: #000;
      white-space: nowrap;
    }

    .font-bold {
      font-weight: 900;
    }

    .total-row {
      font-size: 11px;
      font-weight: 900;
      margin: 2.5px 0;
      color: #000;
    }

    .total-amount {
      font-size: 12px;
      font-weight: 900;
      color: #000;
      white-space: nowrap;
    }

    .thermal-footer {
      text-align: center;
      font-size: 8.5px;
      font-weight: 700;
      margin-top: 4px;
      line-height: 1.3;
      color: #000;
    }

    .cut-line {
      font-size: 7.5px;
      color: #000;
      margin-top: 4px;
    }

    /* Print Specific Media Query */
    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 48mm !important;
        max-width: 48mm !important;
      }

      .no-print, .print-toolbar {
        display: none !important;
      }

      html, body {
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .receipts-container {
        gap: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 48mm !important;
      }

      .thermal-receipt {
        box-shadow: none !important;
        border: none !important;
        padding: 1mm 1mm !important;
        width: 48mm !important;
        max-width: 48mm !important;
        min-width: 48mm !important;
        box-sizing: border-box !important;
        min-height: 0 !important;
        height: auto !important;
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
        size: 58mm auto;
        margin: 0mm;
      }
    }
  </style>
</head>
<body>

  <!-- Non-printable top action toolbar -->
  <div class="print-toolbar no-print">
    <div>
      <div style="font-weight: bold; font-size: 13px;">🧾 58mm Thermal Bill Print (203 DPI)</div>
      <div style="font-size: 11px; opacity: 0.8;">${printMode === 'detail' ? 'Detail Bill Format' : 'Simple Bill Format'} • Total ${bills.length} Bill${bills.length > 1 ? 's' : ''}</div>
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
export function printBillsThermal58mm(
  bills: BillRecord[],
  title: string = 'Aryan News Agency - 58mm Thermal Bills',
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
