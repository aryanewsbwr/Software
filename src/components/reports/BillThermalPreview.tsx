import React, { useState } from 'react';
import { Printer, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { BillRecord, BillPrintMode, BOY_LOGO_B64 } from '@/lib/bill4in1Export';
import { cleanOrTransliterateHindi } from '@/lib/transliteration';
import { roundToFoxProRule } from '@/lib/billingEngine';
import { generateDynamicUpiQrSvg } from '@/lib/upiQrHelper';
import { printBillsThermal58mm } from '@/lib/billThermalExport';

interface BillThermalPreviewProps {
  bills: BillRecord[];
  title?: string;
  zoomLevel?: number;
  initialPrintMode?: BillPrintMode;
}

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

export const BillThermalPreview: React.FC<BillThermalPreviewProps> = ({
  bills = [],
  title = 'Aryan News Agency - Monthly Bills',
  zoomLevel = 100,
  initialPrintMode = 'simple'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [printMode, setPrintMode] = useState<BillPrintMode>(initialPrintMode);
  const [scale, setScale] = useState(1);

  if (!bills || bills.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs">
        No bills available to display in Preview.
      </div>
    );
  }

  const currentBill = bills[currentIndex] || bills[0];

  const handlePrintAll = () => {
    printBillsThermal58mm(bills, title, printMode);
  };

  const handlePrintCurrent = () => {
    printBillsThermal58mm([currentBill], `Bill_${currentBill.customer_id}`, printMode);
  };

  const renderBill = (b: BillRecord, idx: number) => {
    let displayHindi = cleanOrTransliterateHindi(b.customer_hindi || '', b.customer_name);
    const cleanEngName = (b.customer_name || '').replace(/\s+crd\b/i, '').trim();

    if (displayHindi) {
      displayHindi = displayHindi.replace(/\s+सीआरडी\b/i, '').replace(/\s+CRD\b/i, '').trim();
    }

    const items = b.items || [];
    const totalDelivery = b.delivery_charge || 0;

    let itemsElements: React.ReactNode = null;

    if (printMode === 'simple') {
      const pubConsolidatedMap = new Map<string, {
        pub_name: string;
        totalQty: number;
        totalAmount: number;
      }>();

      const hasItemDelivery = items.some(it => (it.delivery_amount || 0) > 0);

      items.forEach((it, pIdx) => {
        const pubHindiOrClean = cleanOrTransliterateHindi('', it.pub_name) || it.pub_name.trim();
        const pubKey = pubHindiOrClean.toLowerCase();
        const qty = Number(it.days !== undefined && it.days > 0 ? it.days : (it.qty || 1));
        
        let itemDelivery = 0;
        if (hasItemDelivery) {
          itemDelivery = it.delivery_amount || 0;
        } else if (totalDelivery > 0 && pIdx === 0) {
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

      itemsElements = displayItems.length > 0 ? (
        displayItems.map((it, pIdx) => (
          <div key={pIdx} className="flex justify-between items-center text-[12px] font-semibold text-black">
            <span className="flex-[2] text-left">{it.pub_name}</span>
            <span className="flex-1 text-center font-bold">{it.totalQty}</span>
            <span className="flex-1 text-right font-bold">{formatMoney(it.totalAmount)}</span>
          </div>
        ))
      ) : (
        <div className="flex justify-between items-center text-[12px] font-semibold text-black">
          <span className="flex-[2] text-left">समाचार पत्र / मासिक</span>
          <span className="flex-1 text-center font-bold">30</span>
          <span className="flex-1 text-right font-bold">{formatMoney(monthBillAmount)}</span>
        </div>
      );
    } else {
      itemsElements = items.length > 0 ? (
        items.map((it, pIdx) => {
          const qtyOrDays = it.days !== undefined && it.days > 0 ? it.days : (it.qty || 1);
          const pubHindiOrClean = cleanOrTransliterateHindi('', it.pub_name) || it.pub_name;
          return (
            <div key={pIdx} className="flex justify-between items-center text-[12px] font-semibold text-black">
              <span className="flex-[2] text-left">{pubHindiOrClean}</span>
              <span className="flex-1 text-center font-bold">{qtyOrDays}</span>
              <span className="flex-1 text-right font-bold">{formatMoney(roundToFoxProRule(it.amount))}</span>
            </div>
          );
        })
      ) : (
        <div className="flex justify-between items-center text-[12px] font-semibold text-black">
          <span className="flex-[2] text-left">समाचार पत्र / मासिक</span>
          <span className="flex-1 text-center font-bold">30</span>
          <span className="flex-1 text-right font-bold">{formatMoney(roundToFoxProRule(b.paper_amount || 0))}</span>
        </div>
      );
    }

    const paperAmount = roundToFoxProRule(b.paper_amount || 0);
    const deliveryCharge = roundToFoxProRule(b.delivery_charge || 0);
    const monthBillAmount = roundToFoxProRule(paperAmount + deliveryCharge);
    const previousDue = roundToFoxProRule(b.previous_due || 0);
    const netPayable = roundToFoxProRule(b.net_payable || (monthBillAmount + previousDue));

    const monthYearDisplay = formatShortMonthYear(b.month, b.year);
    const formattedPhone = cleanPhone(b.phone);

    return (
      <div 
        key={`${b.customer_id}-${idx}`}
        className="w-[360px] max-w-[360px] bg-white border border-slate-300 shadow-2xl p-6 font-sans text-[12px] leading-tight select-text text-black mb-8 rounded-sm text-center"
        style={{
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        }}
      >
        {/* Agency Header (Centered without logo) */}
        <div className="flex flex-col items-center justify-center mb-2.5 text-center">
          <div className="font-black text-[15px] tracking-tight text-black uppercase leading-tight whitespace-nowrap">
            ARYAN NEWS AGENCY
          </div>
          <div className="font-bold text-[13px] text-slate-900 mt-0.5 leading-tight">
            आर्यन न्यूज़ एजेंसी
          </div>
          <div className="text-[9.5px] text-slate-800 mt-1 leading-snug">
            5(1), Old Bus Stand, Beawar (Raj.) 305901
          </div>
          <div className="text-[9.5px] text-slate-800 leading-snug">
            WhatsApp: 9462558949 | Ph: 9829058949
          </div>
          <div className="text-[9.5px] text-slate-800 leading-snug">
            www.aryannewsagency.com
          </div>
        </div>

        {/* Solid Top Rule */}
        <div className="w-full h-[1.8px] bg-black my-2.5"></div>

        {/* Pill Badge */}
        <div className="flex justify-center mb-2.5">
          <div className="px-3.5 py-1 border-[1.2px] border-black rounded-full font-bold text-[11px] text-black bg-white">
            MONTHLY BILL / मासिक बिल
          </div>
        </div>

        {/* Meta Info Grid */}
        <div className="flex flex-col gap-1 text-[11.5px] mb-2.5">
          <div className="flex justify-between items-center">
            <div className="text-left"><span className="text-slate-700">Bill No:</span> <span className="font-extrabold text-black">{b.bill_no || b.customer_id}</span></div>
            <div className="text-right"><span className="text-slate-700">Month:</span> <span className="font-extrabold text-black">{monthYearDisplay}</span></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-left"><span className="text-slate-700">A/c No:</span> <span className="font-extrabold text-black">{b.customer_id}</span></div>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="w-full border-t border-dashed border-zinc-500 my-2.5"></div>

        {/* Customer Section */}
        <div className="text-left mb-2.5">
          <div className="font-black text-[13.5px] uppercase tracking-tight text-black">
            {cleanEngName}
          </div>
          {displayHindi && displayHindi !== cleanEngName && (
            <div className="font-bold text-[12.5px] text-slate-900 mt-0.5">
              {displayHindi}
            </div>
          )}
          <div className="flex justify-between items-center text-[10.5px] font-semibold text-slate-700 mt-1">
            <span>Region: {b.region_name || b.region_id}{b.priority ? ` | Pr: ${b.priority}` : ''}</span>
            {formattedPhone && <span>Mob: {formattedPhone}</span>}
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="w-full border-t border-dashed border-zinc-500 my-2.5"></div>

        {/* Items Header */}
        <div className="flex justify-between items-center text-[11.5px] font-extrabold text-black">
          <span className="flex-[2] text-left">विवरण / Particular</span>
          <span className="flex-1 text-center">Days</span>
          <span className="flex-1 text-right">Amount ₹</span>
        </div>

        <div className="w-full border-t border-dashed border-zinc-400 my-2"></div>

        {/* Line Items */}
        <div className="flex flex-col gap-1.5 my-1">
          {itemsElements}
        </div>

        {/* Dashed Divider */}
        <div className="w-full border-t border-dashed border-zinc-500 my-2.5"></div>

        {/* Summary Breakdown */}
        <div className="flex flex-col gap-1 text-[11.5px] mb-3">
          <div className="flex justify-between items-center font-semibold text-zinc-900">
            <span>Current Month / इस माह</span>
            <span className="font-bold">₹ {formatMoney(monthBillAmount)}</span>
          </div>
          <div className="flex justify-between items-center font-semibold text-zinc-900">
            <span>Previous Due / पिछला बकाया</span>
            <span className="font-bold">₹ {formatMoney(previousDue)}</span>
          </div>
        </div>

        {/* Total Banner Box */}
        <div className="border-[1.4px] border-black rounded-md px-3 py-1.5 flex justify-between items-center mb-3 bg-white">
          <span className="font-black text-[13px] text-black">TOTAL / कुल देय</span>
          <span className="font-black text-[15.5px] text-black">₹ {formatMoney(netPayable)}</span>
        </div>

        {/* QR Payment Section */}
        <div className="flex flex-col items-center justify-center mb-2.5">
          <div 
            className="w-28 h-28 flex items-center justify-center bg-white p-1 mb-1.5"
            dangerouslySetInnerHTML={{
              __html: generateDynamicUpiQrSvg(
                netPayable,
                b.bill_no || b.customer_id,
                `${b.month || ''} ${b.year || ''}`.trim(),
                110,
                0
              )
            }}
          />
          <div className="font-extrabold text-[11px] text-black">
            Scan &amp; Pay ₹{Math.round(netPayable)} via any UPI app
          </div>
          <div className="font-medium text-[10px] text-slate-800 mt-0.5">
            किसी भी UPI ऐप से स्कैन कर भुगतान करें
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="w-full border-t border-dashed border-zinc-500 my-2.5"></div>

        {/* Footer Policy Notice */}
        <div className="flex flex-col items-center gap-0.5 text-[10px] text-slate-700 leading-normal">
          <div className="font-medium">कृपया बिल की राशि 5 तारीख तक जमा करें।</div>
          <div className="font-medium text-slate-800">Queries: WhatsApp 9462558949</div>
          <div className="font-black text-[11px] text-black mt-1">धन्यवाद!</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* 58MM / SLIP TOOLBAR */}
      <div className="w-full max-w-2xl bg-slate-800 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs mb-3 rounded-t-sm shadow-md print:hidden">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Bill {currentIndex + 1} of {bills.length}</span>
          <button 
            disabled={currentIndex <= 0}
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            className="p-1 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-30 cursor-pointer"
            title="Previous Bill"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            disabled={currentIndex >= bills.length - 1}
            onClick={() => setCurrentIndex(prev => Math.min(bills.length - 1, prev + 1))}
            className="p-1 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-30 cursor-pointer"
            title="Next Bill"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector: Simple vs Detail */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 px-1 py-0.5 rounded border border-slate-700">
            <button
              onClick={() => setPrintMode('simple')}
              className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer ${
                printMode === 'simple' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setPrintMode('detail')}
              className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer ${
                printMode === 'detail' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Detail
            </button>
          </div>

          <button
            onClick={handlePrintCurrent}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded flex items-center gap-1 cursor-pointer"
            title="Print Current Bill Only"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Current</span>
          </button>

          <button
            onClick={handlePrintAll}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1 cursor-pointer"
            title="Print / Save All Bills"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print All ({bills.length})</span>
          </button>
        </div>
      </div>

      {/* Interactive Bill Preview Frame */}
      <div 
        className="w-full flex justify-center py-4 bg-slate-100 overflow-x-auto rounded-b-sm border border-slate-300"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center'
        }}
      >
        {renderBill(currentBill, currentIndex)}
      </div>
    </div>
  );
};
