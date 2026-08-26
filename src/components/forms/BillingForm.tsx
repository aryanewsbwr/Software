'use client';

import React, { useState, useEffect } from 'react';
import { Customer, Publication, Rate, Holiday, Discontinue } from '@/lib/types';
import { Printer, RefreshCw, X, Search, FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomerMonthlyBill, BillingLineItem } from '@/lib/billingEngine';

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
  onClose
}: BillingFormProps) {
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState(2026);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [regions, setRegions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [msg, setMsg] = useState('');
  
  // Single Customer Breakup Dialog
  const [breakupCustomer, setBreakupCustomer] = useState<any | null>(null);
  const [breakupLines, setBreakupLines] = useState<BillingLineItem[]>([]);
  const [isLoadingBreakup, setIsLoadingBreakup] = useState(false);

  // Single Customer Print Slip Dialog
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
    setMsg('Calculating date-effective monthly bills...');

    try {
      const query = `/api/billing?month=${month}&year=${year}&region_id=${selectedRegion}&search=${encodeURIComponent(searchQuery)}&page=${page}&limit=50`;
      const res = await fetch(query);
      const data = await res.json();
      setBills(data.bills || []);
      setTotalCustomers(data.total_customers || 0);
      setMsg(`Found ${data.total_customers || 0} customer accounts (${data.bills?.length || 0} on page ${page}).`);
    } catch (err: any) {
      setMsg(`Error calculating bills: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run calculation when filter changes
  useEffect(() => {
    handleGenerate();
  }, [month, year, selectedRegion, page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      handleGenerate();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Open Breakup Modal for single customer
  const handleOpenBreakup = async (bill: any) => {
    setBreakupCustomer(bill);
    setIsLoadingBreakup(true);
    try {
      const res = await fetch(`/api/billing?customer_id=${bill.customer_id}&month=${month}&year=${year}`);
      const data = await res.json();
      setBreakupLines(data.breakup || []);
    } catch (err) {
      console.error('Error fetching breakup:', err);
    } finally {
      setIsLoadingBreakup(false);
    }
  };

  const totalPages = Math.ceil(totalCustomers / 50) || 1;

  return (
    <div className="relative w-[880px] h-[600px] vb-window flex flex-col shadow-2xl overflow-hidden font-tahoma">
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
            Accounting Rule: Day-by-Day Rates (1=Sun..7=Sat) + Rate Change History - Holidays - Vacation Holds
          </p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-2 vb-box-inset flex items-center justify-between gap-2 text-xs font-bold my-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-[#8B0000]">Region:</label>
            <select 
              value={selectedRegion}
              onChange={(e) => { setSelectedRegion(e.target.value); setPage(1); }}
              className="vb-input bg-white text-xs max-w-[140px]"
            >
              <option value="all">All Regions (सभी क्षेत्र)</option>
              {regions.map(r => (
                <option key={r.region_id} value={r.region_id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[#8B0000]">Month:</label>
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

          <div className="flex items-center gap-1.5">
            <label className="text-[#8B0000]">Year:</label>
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value, 10) || 2026)}
              className="vb-input w-16 text-center font-bold"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="vb-btn bg-yellow-100 hover:bg-yellow-200 text-slate-900 font-bold flex items-center gap-1 shadow-xs cursor-pointer px-3 py-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Calculating...' : 'Recalculate'}</span>
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
              placeholder="Search customer / ID / phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none text-xs w-48"
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
                <th className="p-1.5 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b, idx) => (
                <tr key={idx} className="border-b hover:bg-blue-50 text-[11px]">
                  <td className="p-1 border-r font-mono text-center font-bold">#{b.bill_no}</td>
                  <td className="p-1 border-r font-bold text-blue-900">
                    {b.name_eng}
                  </td>
                  <td className="p-1 border-r text-slate-600">{b.region_name}</td>
                  <td className="p-1 border-r text-right font-mono text-slate-700">₹{b.previous_due?.toFixed(2)}</td>
                  <td className="p-1 border-r text-right font-mono font-bold text-slate-800">₹{b.paper_amount?.toFixed(2)}</td>
                  <td className="p-1 border-r text-right font-mono text-slate-600">₹{b.delivery_amount?.toFixed(2)}</td>
                  <td className="p-1 border-r text-right font-mono font-bold text-blue-900 bg-blue-50/50">
                    ₹{b.total_payable?.toFixed(2)}
                  </td>
                  <td className="p-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handleOpenBreakup(b)}
                        className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 border border-amber-400 text-amber-900 font-bold rounded-xs text-[10px] cursor-pointer flex items-center gap-0.5"
                        title="View SQL Itemized Line Breakup"
                      >
                        <Eye className="w-2.5 h-2.5" />
                        <span>Breakup</span>
                      </button>
                      <button 
                        onClick={() => setSelectedBillForPrint(b)}
                        className="px-1.5 py-0.5 bg-blue-100 hover:bg-blue-200 border border-blue-400 text-blue-900 font-bold rounded-xs text-[10px] cursor-pointer"
                      >
                        Slip
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bills.length === 0 && !isGenerating && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    No customer bills found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="bg-[#ECE9D8] pt-2 border-t border-slate-300 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span>Page <strong className="text-blue-900">{page}</strong> of <strong className="text-blue-900">{totalPages}</strong> ({totalCustomers} customers)</span>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isGenerating}
              className="vb-btn px-2 py-0.5 bg-white disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isGenerating}
              className="vb-btn px-2 py-0.5 bg-white disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()} 
              disabled={bills.length === 0}
              className="vb-btn flex items-center gap-1 bg-white hover:bg-slate-100 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-purple-700" />
              <span>Print Page</span>
            </button>
            <button onClick={onClose} className="vb-btn flex items-center gap-1 bg-white hover:bg-red-50 text-red-800 cursor-pointer">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              <span>Close</span>
            </button>
          </div>
        </div>

      </div>

      {/* Breakup Modal (Matching Exact SQL Query Output) */}
      {breakupCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-black border-b-black shadow-2xl p-3 flex flex-col max-h-[85vh]">
            
            <div className="vb-titlebar-xp select-none mb-2">
              <span>Itemized Billing Breakup - Customer #{breakupCustomer.customer_id}: {breakupCustomer.name_eng}</span>
              <button onClick={() => setBreakupCustomer(null)} className="vb-win-btn vb-win-btn-close">✕</button>
            </div>

            <div className="bg-white p-2 vb-box-inset flex-1 overflow-auto">
              {isLoadingBreakup ? (
                <div className="p-8 text-center text-slate-400">Loading itemized breakup...</div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-[#ECE9D8] sticky top-0">
                    <tr>
                      <th className="p-1.5 border text-left">Sort</th>
                      <th className="p-1.5 border text-left">Item Name</th>
                      <th className="p-1.5 border text-right">Rate</th>
                      <th className="p-1.5 border text-center">Qty</th>
                      <th className="p-1.5 border text-center">Days / Copies</th>
                      <th className="p-1.5 border text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakupLines.map((item, idx) => (
                      <tr key={idx} className={`border-b text-[11px] ${item.sort_order === 9 ? 'bg-amber-100 font-bold text-blue-900 border-t-2 border-black' : item.sort_order === 4 ? 'bg-slate-50 italic text-slate-700' : 'hover:bg-blue-50'}`}>
                        <td className="p-1 border-r text-center font-mono">{item.sort_order}</td>
                        <td className="p-1 border-r font-bold">{item.item}</td>
                        <td className="p-1 border-r text-right font-mono">{item.rate !== null ? `₹${item.rate.toFixed(2)}` : '-'}</td>
                        <td className="p-1 border-r text-center font-mono">{item.qty !== null ? item.qty : '-'}</td>
                        <td className="p-1 border-r text-center font-mono font-bold text-indigo-900">{item.days_or_copies !== null ? item.days_or_copies : '-'}</td>
                        <td className="p-1 text-right font-mono font-bold">₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 text-xs font-bold">
              <span>Total Payable: <strong className="text-blue-900 text-sm font-mono">₹{breakupCustomer.total_payable?.toFixed(2)}</strong></span>
              <button 
                onClick={() => setBreakupCustomer(null)}
                className="vb-btn bg-white hover:bg-slate-100 px-4 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

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
              <div><strong>Customer:</strong> {selectedBillForPrint.name_eng}</div>
              <div><strong>Region:</strong> {selectedBillForPrint.region_name}</div>
            </div>

            <div className="border-t border-b py-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Previous Due (बकाया):</span>
                <span>₹{selectedBillForPrint.previous_due?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Papers (चालू माह):</span>
                <span>₹{selectedBillForPrint.paper_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges:</span>
                <span>₹{selectedBillForPrint.delivery_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-1">
                <span>Total Payable (कुल देय):</span>
                <span>₹{selectedBillForPrint.total_payable?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 print:hidden">
              <button 
                onClick={() => window.print()}
                className="px-3 py-1 bg-[#0A246A] text-white font-bold text-xs cursor-pointer"
              >
                Print
              </button>
              <button 
                onClick={() => setSelectedBillForPrint(null)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-black font-bold text-xs cursor-pointer"
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
