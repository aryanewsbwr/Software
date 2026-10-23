import React, { useState } from 'react';
import { Printer, ChevronLeft, ChevronRight, Download, FileText, Check } from 'lucide-react';
import { BillRecord, BillPrintMode, BOY_LOGO_B64 } from '@/lib/bill4in1Export';
import { printBillsThermal58mm } from '@/lib/billThermalExport';
import { cleanOrTransliterateHindi } from '@/lib/transliteration';
import { roundToFoxProRule } from '@/lib/billingEngine';

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

export const BillThermalPreview: React.FC<BillThermalPreviewProps> = ({
  bills,
  title = 'Region Wise Bill Printing (58mm Thermal)',
  zoomLevel = 100,
  initialPrintMode = 'simple',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [printMode, setPrintMode] = useState<BillPrintMode>(initialPrintMode);

  if (!bills || bills.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-sans">
        No bills found for the selected region.
      </div>
    );
  }

  const currentBill = bills[currentIndex] || bills[0];

  const handlePrint = () => {
    printBillsThermal58mm(bills, title, printMode);
  };

  const handlePrintCurrent = () => {
    printBillsThermal58mm([currentBill], `Bill_${currentBill.customer_id}`, printMode);
  };

  const renderReceiptCard = (b: BillRecord, idx: number) => {
    const displayHindi = cleanOrTransliterateHindi(b.customer_hindi || '', b.customer_name);
    const items = b.items || [];
    const totalDelivery = b.delivery_charge || 0;

    let itemsElements: React.ReactNode = null;

    if (printMode === 'simple') {
      // Consolidate publication items for simple display
      const pubConsolidatedMap = new Map<string, {
        pub_name: string;
        totalQty: number;
        totalAmount: number;
      }>();

      const hasItemDelivery = items.some(it => (it.delivery_amount || 0) > 0);

      items.forEach((it, itemIdx) => {
        const cleanPub = it.pub_name.trim();
        const pubKey = cleanPub.toLowerCase();
        const qty = Number(it.days !== undefined && it.days > 0 ? it.days : (it.qty || 1));
        
        let itemDelivery = 0;
        if (hasItemDelivery) {
          itemDelivery = it.delivery_amount || 0;
        } else if (totalDelivery > 0 && itemIdx === 0) {
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

      itemsElements = displayItems.length > 0 ? (
        displayItems.map((it, pIdx) => (
          <div key={pIdx} className="flex justify-between items-baseline text-[10.5px]">
            <span className="max-w-[70%] break-words">
              {it.pub_name} ({it.totalQty}d)
            </span>
            <span className="font-bold">
              {formatMoney(it.totalAmount)}
            </span>
          </div>
        ))
      ) : (
        <div className="flex justify-between items-baseline text-[10.5px]">
          <span>Newspaper / Monthly</span>
          <span className="font-bold">{formatMoney(roundToFoxProRule((b.paper_amount || 0) + (b.delivery_charge || 0)))}</span>
        </div>
      );
    } else {
      // Detail Mode: Each item with days, rate, pure paper amount
      itemsElements = items.length > 0 ? (
        items.map((it, pIdx) => {
          const qtyOrDays = it.days !== undefined && it.days > 0 ? it.days : (it.qty || 1);
          const rateStr = it.rate !== null && it.rate !== undefined && Number(it.rate) > 0
            ? `@${Number(it.rate).toFixed(2)}`
            : '';
          return (
            <div key={pIdx} className="flex justify-between items-baseline text-[10.5px]">
              <span className="max-w-[70%] break-words">
                {it.pub_name} ({qtyOrDays}d {rateStr})
              </span>
              <span className="font-bold">
                {formatMoney(roundToFoxProRule(it.amount))}
              </span>
            </div>
          );
        })
      ) : (
        <div className="flex justify-between items-baseline text-[10.5px]">
          <span>Newspaper / Monthly</span>
          <span className="font-bold">{formatMoney(roundToFoxProRule(b.paper_amount || 0))}</span>
        </div>
      );
    }

    const paperAmount = roundToFoxProRule(b.paper_amount || 0);
    const deliveryCharge = roundToFoxProRule(b.delivery_charge || 0);
    const monthBillAmount = roundToFoxProRule(paperAmount + deliveryCharge);
    const previousDue = roundToFoxProRule(b.previous_due || 0);
    const netPayable = roundToFoxProRule(b.net_payable || (monthBillAmount + previousDue));

    return (
      <div 
        key={`${b.customer_id}-${idx}`}
        className="w-[260px] bg-white border border-slate-400 shadow-xl p-3 font-mono text-[11px] leading-tight select-text text-black mb-6"
        style={{
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* Receipt Header */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 shrink-0 flex justify-center">
            <img src={BOY_LOGO_B64} alt="logo" className="h-8 w-auto object-contain" />
          </div>
          <div className="text-center space-y-0.5 flex-1">
            <div className="font-black text-sm tracking-tight text-slate-950 uppercase">
              ARYAN NEWS AGENCY
            </div>
            <div className="text-[9.5px] text-slate-800">
              5 Old Bus stand Beawar
            </div>
            <div className="text-[9.5px] text-slate-800">
              Ph: 9462558949, 9829058949
            </div>
          </div>
        </div>

        <div className="text-center font-bold tracking-tighter text-[10px] my-1 text-slate-700">
          ================================
        </div>

        {/* Bill Metadata: Bill No of each bill, Month instead of Period */}
        <div className="flex justify-between items-baseline text-[10px]">
          <span>Bill No: <b className="font-bold">{b.bill_no || b.customer_id}</b></span>
          <span>Month: <b className="font-bold">{b.month} {b.year}</b></span>
        </div>

        {/* Customer Account Number / ID */}
        <div className="text-[10px] mt-0.5">
          <span>Ac.no.: <b className="font-bold">{b.customer_id}</b></span>
        </div>

        <div className="text-center text-[10px] my-1 text-slate-600">
          --------------------------------
        </div>

        {/* Customer Info (Customer Address removed as requested) */}
        <div className="space-y-0.5">
          <div className="font-black text-[12px] uppercase text-blue-950">
            {b.customer_name}
          </div>
          {displayHindi && displayHindi !== b.customer_name && (
            <div className="font-bold text-[11px] text-slate-900">
              {displayHindi}
            </div>
          )}
          <div className="text-[9.5px] text-slate-700">
            Region: {b.region_name || b.region_id} {b.priority ? `| Pr: ${b.priority}` : ''}
          </div>
          {b.phone && (
            <div className="text-[9.5px] text-slate-700">
              Mob: {b.phone}
            </div>
          )}
        </div>

        <div className="text-center text-[10px] my-1 text-slate-600">
          --------------------------------
        </div>

        {/* Table Header */}
        <div className="flex justify-between text-[10px] font-bold text-slate-900 pb-0.5">
          <span>PARTICULAR</span>
          <span>AMOUNT (₹)</span>
        </div>
        <div className="text-center text-[9px] text-slate-500 mb-1">
          - - - - - - - - - - - - - - - -
        </div>

        {/* Publications List */}
        <div className="space-y-1 mb-1">
          {itemsElements}
        </div>

        <div className="text-center text-[10px] my-1 text-slate-600">
          --------------------------------
        </div>

        {/* Calculation summary */}
        <div className="space-y-0.5 text-[10.5px]">
          {printMode === 'detail' && deliveryCharge > 0 && (
            <>
              <div className="flex justify-between text-slate-800">
                <span>Paper Total:</span>
                <span>₹ {formatMoney(paperAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-800">
                <span>Delivery Charge:</span>
                <span>₹ {formatMoney(deliveryCharge)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between font-bold">
            <span>Current Month Amt:</span>
            <span>₹ {formatMoney(monthBillAmount)}</span>
          </div>

          {previousDue > 0 && (
            <div className="flex justify-between text-slate-800">
              <span>Previous Balance/Due:</span>
              <span>₹ {formatMoney(previousDue)}</span>
            </div>
          )}

          {(b.advance || 0) > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Advance Paid:</span>
              <span>- ₹ {formatMoney(b.advance)}</span>
            </div>
          )}
        </div>

        <div className="text-center font-bold tracking-tighter text-[10px] my-1 text-slate-700">
          ================================
        </div>

        {/* Net Payable */}
        <div className="flex justify-between items-baseline py-0.5 font-black text-xs text-slate-950">
          <span>TOTAL PAYABLE:</span>
          <span className="text-sm font-black text-blue-950">
            ₹ {formatMoney(netPayable)}
          </span>
        </div>

        <div className="text-center font-bold tracking-tighter text-[10px] my-1 text-slate-700">
          ================================
        </div>

        {/* Footer Note with QR Code replacing previous texts */}
        <div className="flex flex-col items-center justify-center pt-2 pb-1">
          <img 
            src="/bill_qr_code.jpeg" 
            alt="Payment QR" 
            className="w-28 h-28 object-contain rounded-sm"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* 58MM TOOLBAR */}
      <div className="w-full max-w-2xl bg-slate-800 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs mb-3 rounded-t-sm shadow-md print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-amber-300">58mm Thermal (203 DPI):</span>
          <span className="text-slate-300">
            {bills.length} Bills in Selected Region
          </span>
        </div>

        {/* Navigation & View Controls */}
        <div className="flex items-center gap-2">
          {/* Format Toggle: Simple vs Detail */}
          <div className="flex items-center bg-slate-900 p-0.5 border border-slate-700 rounded text-[11px]">
            <button
              type="button"
              onClick={() => setPrintMode('simple')}
              className={`px-2 py-0.5 font-bold cursor-pointer rounded transition-colors ${
                printMode === 'simple'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Simple: Delivery charge is merged into publication prices"
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('detail')}
              className={`px-2 py-0.5 font-bold cursor-pointer rounded transition-colors ${
                printMode === 'detail'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Detail: Separate rate per line & separate delivery charge row"
            >
              Detail
            </button>
          </div>

          <button
            onClick={() => setViewMode(v => v === 'single' ? 'all' : 'single')}
            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-medium border border-slate-600 cursor-pointer"
          >
            {viewMode === 'single' ? 'View All Continuous' : 'View Single Receipt'}
          </button>

          {viewMode === 'single' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded cursor-pointer"
                title="Previous Bill"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs px-1">
                {currentIndex + 1} / {bills.length}
              </span>
              <button
                onClick={() => setCurrentIndex(i => Math.min(bills.length - 1, i + 1))}
                disabled={currentIndex >= bills.length - 1}
                className="p-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded cursor-pointer"
                title="Next Bill"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Print Buttons */}
          {viewMode === 'single' && (
            <button
              onClick={handlePrintCurrent}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-600 hover:bg-slate-500 rounded text-[11px] font-bold cursor-pointer"
              title="Print Only This Customer Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print This</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold cursor-pointer shadow-sm"
            title="Print All 58mm Thermal Bills / Save as 58mm PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print All (58mm)</span>
          </button>
        </div>
      </div>

      {/* RENDER RECEIPTS */}
      <div 
        className="flex flex-col items-center p-4 bg-slate-300 rounded shadow-inner min-h-[500px] w-full max-w-2xl overflow-y-auto"
        style={{ zoom: `${zoomLevel}%` }}
      >
        {viewMode === 'single' ? (
          renderReceiptCard(currentBill, currentIndex)
        ) : (
          bills.map((b, idx) => renderReceiptCard(b, idx))
        )}
      </div>
    </div>
  );
};
