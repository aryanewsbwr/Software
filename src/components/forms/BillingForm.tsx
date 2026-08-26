'use client';

import React, { useState, useEffect } from 'react';
import { Customer, Publication, Rate, Holiday, Discontinue } from '@/lib/types';
import { Printer, RefreshCw, X, Search, FileText } from 'lucide-react';

interface BillingFormProps {
  onClose: () => void;
  customers?: Customer[];
  publications?: Publication[];
  rates?: Rate[];
  holidays?: Holiday[];
  discontinues?: Discontinue[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BillingForm({
  onClose,
  customers = [],
  publications = [],
  rates = [],
  holidays = [],
  discontinues = []
}: BillingFormProps) {
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState(2026);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [regions, setRegions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [msg, setMsg] = useState('');
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<any | null>(null);

  // Load regions
  useEffect(() => {
    fetch('/data/regions.json')
      .then(r => r.json())
      .then(d => setRegions(d || []))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMsg('Calculating date-effective monthly bills from customer subscriptions...');

    try {
      const res = await fetch(`/api/billing?month=${month}&year=${year}&region_id=${selectedRegion}`);
      const data = await res.json();
      setBills(data.bills || []);
      setMsg(`Successfully calculated ${data.total_bills || 0} customer bills for ${month} ${year}! Total: ₹${(data.grand_total || 0).toFixed(2)}`);
    } catch (err: any) {
      setMsg(`Error calculating bills: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial calculation
  useEffect(() => {
    handleGenerate();
  }, [month, year, selectedRegion]);

  const filteredBills = bills.filter(b => 
    !searchQuery || 
    b.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.customer_id?.toString().includes(searchQuery) ||
    b.region_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBillingAmount = filteredBills.reduce((acc, b) => acc + (b.total_payable || 0), 0);

  return (
    <div className="relative w-[820px] h-[580px] vb-window flex flex-col shadow-2xl overflow-hidden font-tahoma">
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
      <div className="flex-1 p-3 bg-[#ECE9D8] flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="text-center pb-1">
          <h1 className="text-lg font-black text-[#8B0000] tracking-wider uppercase">
            MONTHLY CUSTOMER BILL CALCULATION & PRINTING
          </h1>
          <p className="text-[11px] text-slate-700 font-bold">
            Accounting Rule: Selling rate is calculated date-by-date (1=Sun..7=Sat) minus vacation holds.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-2 vb-box-inset flex items-center justify-between gap-3 text-xs font-bold my-1">
          <div className="flex items-center gap-2">
            <label className="text-[#8B0000]">Region:</label>
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="vb-input bg-white text-xs max-w-[140px]"
            >
              <option value="all">All Regions (सभी क्षेत्र)</option>
              {regions.map(r => (
                <option key={r.region_id} value={r.region_id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[#8B0000]">Billing Month:</label>
            <select 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="vb-input bg-white text-xs"
            >
              {MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[#8B0000]">Year:</label>
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value, 10) || 2026)}
              className="vb-input w-20 text-center font-bold"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="vb-btn bg-yellow-100 hover:bg-yellow-200 text-slate-900 font-bold flex items-center gap-1 shadow-xs cursor-pointer px-3 py-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Calculating...' : 'Generate Monthly Bills'}</span>
          </button>
        </div>

        {/* Search Bar & Message Banner */}
        <div className="flex items-center justify-between gap-2 px-1 py-0.5">
          {msg && (
            <div className="text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 border border-emerald-400 truncate flex-1">
              {msg}
            </div>
          )}
          <div className="flex items-center gap-1 bg-white px-2 py-0.5 border border-slate-400 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search customer / ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none text-xs w-44"
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="flex-1 bg-white vb-grid overflow-auto my-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#ECE9D8]">
              <tr>
                <th className="p-1.5 border text-left">Bill No</th>
                <th className="p-1.5 border text-left">Customer Name</th>
                <th className="p-1.5 border text-left">Region</th>
                <th className="p-1.5 border text-right">Previous Due</th>
                <th className="p-1.5 border text-right">Current Papers</th>
                <th className="p-1.5 border text-right">Delivery</th>
                <th className="p-1.5 border text-right">Total Payable</th>
                <th className="p-1.5 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((b, idx) => (
                <tr key={idx} className="border-b hover:bg-blue-50 text-[11px]">
                  <td className="p-1 border-r font-mono text-center font-bold">#{b.bill_no}</td>
                  <td className="p-1 border-r font-bold text-blue-900">
                    {b.customer_name} <span className="text-slate-500 font-normal">({b.customer_hindi})</span>
                  </td>
                  <td className="p-1 border-r text-slate-600">{b.region_name}</td>
                  <td className="p-1 border-r text-right font-mono text-slate-700">₹{b.previous_due.toFixed(2)}</td>
                  <td className="p-1 border-r text-right font-mono font-bold text-slate-800">₹{b.current_papers.toFixed(2)}</td>
                  <td className="p-1 border-r text-right font-mono text-slate-600">₹{b.delivery.toFixed(2)}</td>
                  <td className="p-1 border-r text-right font-mono font-bold text-blue-900 bg-blue-50/50">
                    ₹{b.total_payable.toFixed(2)}
                  </td>
                  <td className="p-1 text-center">
                    <button 
                      onClick={() => setSelectedBillForPrint(b)}
                      className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 border border-blue-400 text-blue-900 font-bold rounded-xs text-[10px] cursor-pointer"
                    >
                      Print Slip
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && !isGenerating && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    No customer bills found for {month} {year}. Click [Generate Monthly Bills] above to calculate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-[#ECE9D8] pt-2 border-t border-slate-300 flex items-center justify-between text-xs font-bold">
          <div className="text-slate-800">
            Total Calculated Bills: <strong className="text-indigo-900">{filteredBills.length}</strong> | Total Billing Amount: <strong className="text-blue-900 font-mono text-sm">₹{totalBillingAmount.toFixed(2)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()} 
              disabled={filteredBills.length === 0}
              className="vb-btn flex items-center gap-1 bg-white hover:bg-slate-100"
            >
              <Printer className="w-3.5 h-3.5 text-purple-700" />
              <span>Print All Bills</span>
            </button>
            <button onClick={onClose} className="vb-btn flex items-center gap-1 bg-white hover:bg-red-50 text-red-800">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              <span>Close</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bill Slip Print Modal */}
      {selectedBillForPrint && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border-2 border-black p-4 text-xs font-mono shadow-2xl space-y-2">
            <div className="text-center border-b pb-2">
              <h2 className="font-black text-sm uppercase">ARYAN NEWS AGENCY</h2>
              <p className="text-[10px]">Beawar, Rajasthan • Phone: 01462-25XXXX</p>
              <p className="text-[11px] font-bold mt-1">MONTHLY NEWSPAPER BILL - {selectedBillForPrint.month} {selectedBillForPrint.year}</p>
            </div>

            <div className="space-y-0.5 text-[11px]">
              <div><strong>Bill No:</strong> #{selectedBillForPrint.bill_no}</div>
              <div><strong>Cust ID:</strong> #{selectedBillForPrint.customer_id}</div>
              <div><strong>Customer:</strong> {selectedBillForPrint.customer_name}</div>
              <div><strong>Region:</strong> {selectedBillForPrint.region_name}</div>
            </div>

            <div className="border-t border-b py-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Previous Due (बकाया):</span>
                <span>₹{selectedBillForPrint.previous_due.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Papers (चालू माह):</span>
                <span>₹{selectedBillForPrint.current_papers.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span>₹{selectedBillForPrint.delivery.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-1">
                <span>Total Payable (कुल देय):</span>
                <span>₹{selectedBillForPrint.total_payable.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 print:hidden">
              <button 
                onClick={() => window.print()}
                className="px-3 py-1 bg-[#0A246A] text-white font-bold text-xs"
              >
                Print
              </button>
              <button 
                onClick={() => setSelectedBillForPrint(null)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-black font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
