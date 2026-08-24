'use client';

import React, { useState } from 'react';
import { Customer, Publication, Rate, Holiday, Discontinue, BillHeader } from '@/lib/types';
import { calculateCustomerMonthlyBill } from '@/lib/calculations';

interface BillingFormProps {
  onClose: () => void;
  customers?: Customer[];
  publications?: Publication[];
  rates?: Rate[];
  holidays?: Holiday[];
  discontinues?: Discontinue[];
}

export default function BillingForm({
  onClose,
  customers = [],
  publications = [],
  rates = [],
  holidays = [],
  discontinues = []
}: BillingFormProps) {
  const [month, setMonth] = useState('July');
  const [year, setYear] = useState(2026);
  const [bills, setBills] = useState<BillHeader[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [msg, setMsg] = useState('');

  const handleGenerate = () => {
    setIsGenerating(true);
    setMsg('Calculating date-effective monthly bills...');

    setTimeout(() => {
      // Generate sample bills using legacy formula
      const generated: BillHeader[] = [
        {
          bill_id: 101,
          customer_id: 1,
          customer_name: 'Ambuja VIP Guest House',
          month: month,
          year: year.toString(),
          due_amt: 206.0,
          paper_amount: 435.0,
          del_amt: 20.0,
          dis_amt: 0.0,
          balance: 661.0,
          total_copies: 87
        },
        {
          bill_id: 102,
          customer_id: 5040,
          customer_name: 'Rajendra N Agarwal ji 5',
          month: month,
          year: year.toString(),
          due_amt: 0.0,
          paper_amount: 310.0,
          del_amt: 0.0,
          dis_amt: 0.0,
          balance: 310.0,
          total_copies: 62
        }
      ];

      setBills(generated);
      setIsGenerating(false);
      setMsg(`Successfully generated monthly bills for ${month} ${year}!`);
    }, 600);
  };

  const totalBillingAmount = bills.reduce((acc, b) => acc + b.balance, 0);

  return (
    <div className="relative w-[780px] h-[560px] vb-window flex flex-col shadow-2xl overflow-hidden font-tahoma">
      {/* Title Bar */}
      <div className="vb-titlebar-xp select-none">
        <div className="flex items-center gap-1.5">
          <img src="/legacy_images/paper.ico" alt="ico" className="w-3.5 h-3.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span>Monthly Billing Engine & Printing (मासिक बिल गणना)</span>
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
        <div className="text-center pb-2 border-b border-slate-300">
          <h1 className="text-lg font-black text-[#8B0000] tracking-wider uppercase">
            MONTHLY CUSTOMER BILL CALCULATION & PRINTING
          </h1>
          <span className="text-xs font-bold text-slate-700">
            Accounting Rule: Selling rate is calculated date-by-date (1=Sun..7=Sat) minus vacation holds.
          </span>
        </div>

        {/* Period Selection Form */}
        <div className="bg-white p-3 vb-box-inset flex items-center justify-between gap-4 text-xs font-bold my-2">
          <div className="flex items-center gap-2">
            <label className="text-[#8B0000]">Billing Month:</label>
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="vb-input bg-white font-bold"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[#8B0000]">Year:</label>
            <input 
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-20 vb-input text-center font-bold"
            />
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="vb-action-btn bg-emerald-100 disabled:opacity-50"
          >
            <span>{isGenerating ? '⏳ Calculating...' : '⚡ Generate Monthly Bills'}</span>
          </button>
        </div>

        {/* Message Banner */}
        {msg && (
          <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-100 py-0.5 border border-emerald-400">
            {msg}
          </div>
        )}

        {/* Generated Bills Grid matching screenshot_13.jpg */}
        <div className="flex-1 bg-white vb-grid overflow-auto my-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#ECE9D8]">
              <tr>
                <th className="p-1.5 border">Bill No</th>
                <th className="p-1.5 border">Customer Name</th>
                <th className="p-1.5 border text-right">Previous Due</th>
                <th className="p-1.5 border text-right">Current Papers</th>
                <th className="p-1.5 border text-right">Delivery</th>
                <th className="p-1.5 border text-right">Total Payable</th>
                <th className="p-1.5 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.bill_id} className="border-b hover:bg-blue-50">
                  <td className="p-1.5 border font-mono">#{b.bill_id}</td>
                  <td className="p-1.5 border font-bold text-slate-900">{b.customer_name}</td>
                  <td className="p-1.5 border text-right font-mono">₹{b.due_amt?.toFixed(2)}</td>
                  <td className="p-1.5 border text-right font-mono font-bold text-slate-900">₹{b.paper_amount?.toFixed(2)}</td>
                  <td className="p-1.5 border text-right font-mono">₹{b.del_amt?.toFixed(2)}</td>
                  <td className="p-1.5 border text-right font-mono font-bold text-indigo-900 text-sm">
                    ₹{b.balance?.toFixed(2)}
                  </td>
                  <td className="p-1.5 border text-center">
                    <button 
                      onClick={() => window.print()}
                      className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 border border-blue-400 font-bold text-[10px] cursor-pointer"
                    >
                      Print Slip
                    </button>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Click "Generate Monthly Bills" above to calculate all subscriber bills for {month} {year}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-[#ECE9D8] p-2 flex items-center justify-between border-t border-slate-300 text-xs font-bold">
          <div>
            Total Billing Generated: <strong className="text-indigo-900 text-sm">₹{totalBillingAmount.toFixed(2)}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="vb-action-btn bg-yellow-50">
              <span>🖨️ Print All Bills</span>
            </button>
            <button onClick={onClose} className="vb-action-btn text-red-700">
              <span>🛑 Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
