'use client';

import React, { useState } from 'react';
import { Customer, PaymentReceipt } from '@/lib/types';
import { cleanOrTransliterateHindi } from '@/lib/transliteration';

interface ReceiptFormProps {
  onClose: () => void;
  receipts?: PaymentReceipt[];
}

export default function ReceiptForm({ onClose, receipts = [] }: ReceiptFormProps) {
  const [receiptNo, setReceiptNo] = useState('18383');
  const [manualNo, setManualNo] = useState('4512');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<Customer | null>({
    customer_id: 1,
    name_eng: 'Ambuja VIP Guest House',
    name_hindi: 'अंबुजा वीआईपी गेस्ट हाउस',
    dueamount: 206.0,
    cbal: -991.0,
    priority: 455,
    region_id: 1,
    delivery: 20.0,
    discount: 0.0,
    security_deposit: 0.0
  });

  const [billAmt, setBillAmt] = useState<number>(450.0);
  const [dueAmt, setDueAmt] = useState<number>(206.0);
  const [lessAmt, setLessAmt] = useState<number>(0.0);
  const [rAmt, setRAmt] = useState<number>(656.0);
  const [payMode, setPayMode] = useState<'Cash' | 'Cheque'>('Cash');
  const [chequeNo, setChequeNo] = useState('');
  const [msg, setMsg] = useState('');

  const calculatedBalance = dueAmt + billAmt - lessAmt - rAmt;

  const handleSave = () => {
    setMsg('Payment receipt saved and customer balance adjusted!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="relative w-[720px] h-[540px] vb-window flex flex-col shadow-2xl overflow-hidden font-tahoma">
      {/* Title Bar */}
      <div className="vb-titlebar-xp select-none">
        <div className="flex items-center gap-1.5">
          <img src="/legacy_images/paper.ico" alt="ico" className="w-3.5 h-3.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span>Payment Receipt Entry (भुगतान रसीद प्रविष्टि) - Recp #{receiptNo}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="vb-win-btn">_</button>
          <button className="vb-win-btn">□</button>
          <button onClick={onClose} className="vb-win-btn vb-win-btn-close">✕</button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-4 bg-[#ECE9D8] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="text-center pt-0.5 pb-2 border-b border-slate-300">
          <h1 className="text-xl font-black text-[#8B0000] tracking-wider uppercase drop-shadow-xs">
            CUSTOMER PAYMENT RECEIPT
          </h1>
        </div>

        {/* Input Fields Form Grid matching screenshot_12.jpg */}
        <div className="grid grid-cols-12 gap-y-2 gap-x-2 text-xs font-bold text-black items-center max-w-[620px] mx-auto w-full pt-1">
          
          <label className="col-span-3 text-right pr-2 text-[#8B0000]">Receipt No.</label>
          <input 
            type="text" 
            value={receiptNo} 
            onChange={(e) => setReceiptNo(e.target.value)}
            className="col-span-3 vb-input font-bold font-mono"
          />

          <label className="col-span-3 text-right pr-2 text-[#8B0000]">Manual Rep. No.</label>
          <input 
            type="text" 
            value={manualNo} 
            onChange={(e) => setManualNo(e.target.value)}
            className="col-span-3 vb-input font-bold font-mono"
          />

          <label className="col-span-3 text-right pr-2 text-[#8B0000]">Receipt Date</label>
          <input 
            type="date" 
            value={receiptDate} 
            onChange={(e) => setReceiptDate(e.target.value)}
            className="col-span-9 vb-input font-bold"
          />

          <label className="col-span-3 text-right pr-2 text-[#8B0000]">Customer Name</label>
          <div className="col-span-9 flex items-center gap-2">
            <input 
              type="text" 
              value={selectedCust ? `${selectedCust.name_eng} (#${selectedCust.customer_id})` : ''} 
              readOnly
              className="flex-1 vb-input font-bold bg-white"
            />
            <button 
              onClick={() => setMsg('Select customer from customer master')}
              className="px-2 py-0.5 bg-blue-100 border border-blue-400 font-bold text-[10px]"
            >
              Change
            </button>
          </div>

          <label className="col-span-3 text-right pr-2 text-[#8B0000]">Previous Due</label>
          <input 
            type="number" 
            step="0.5"
            value={dueAmt} 
            onChange={(e) => setDueAmt(parseFloat(e.target.value) || 0)}
            className="col-span-3 vb-input font-mono font-bold"
          />

          <label className="col-span-3 text-right pr-2 text-[#8B0000]">Bill Amount</label>
          <input 
            type="number" 
            step="0.5"
            value={billAmt} 
            onChange={(e) => setBillAmt(parseFloat(e.target.value) || 0)}
            className="col-span-3 vb-input font-mono font-bold"
          />

          <label className="col-span-3 text-right pr-2 text-[#8B0000]">Less / Discount</label>
          <input 
            type="number" 
            step="0.5"
            value={lessAmt} 
            onChange={(e) => setLessAmt(parseFloat(e.target.value) || 0)}
            className="col-span-3 vb-input font-mono font-bold text-amber-700"
          />

          <label className="col-span-3 text-right pr-2 text-[#8B0000]">Amount Received</label>
          <input 
            type="number" 
            step="0.5"
            value={rAmt} 
            onChange={(e) => setRAmt(parseFloat(e.target.value) || 0)}
            className="col-span-3 vb-input font-mono font-bold text-emerald-800 text-sm"
          />

          <label className="col-span-3 text-right pr-2 text-[#8B0000]">Payment Mode</label>
          <select 
            value={payMode} 
            onChange={(e) => setPayMode(e.target.value as any)}
            className="col-span-3 vb-input bg-white font-bold"
          >
            <option value="Cash">Cash (नकद)</option>
            <option value="Cheque">Cheque (चेक)</option>
          </select>

          <label className="col-span-3 text-right pr-2 text-[#8B0000]">New Balance</label>
          <input 
            type="text" 
            value={`₹${calculatedBalance.toFixed(2)}`} 
            readOnly
            className={`col-span-3 vb-input font-mono font-bold bg-slate-100 ${calculatedBalance > 0 ? 'text-red-700' : 'text-emerald-700'}`}
          />
        </div>

        {/* Message Banner */}
        {msg && (
          <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-100 py-1 border border-emerald-400">
            {msg}
          </div>
        )}

        {/* Bottom Trapezoidal 3D Buttons matching screenshot_12.jpg */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-300">
          <button onClick={handleSave} className="vb-action-btn">
            <span>💾 Save Receipt</span>
          </button>
          <button onClick={() => window.print()} className="vb-action-btn bg-yellow-50">
            <span>🖨️ Print Receipt</span>
          </button>
          <button onClick={() => setRAmt(0)} className="vb-action-btn">
            <span>❌ Cancel</span>
          </button>
          <button onClick={onClose} className="vb-action-btn text-red-700">
            <span>🛑 Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
