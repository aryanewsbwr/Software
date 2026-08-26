'use client';

import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Search, Download, Filter, FileText } from 'lucide-react';
import { Customer } from '@/lib/types';

interface ReportsFormProps {
  onClose: () => void;
}

export default function ReportsForm({ onClose }: ReportsFormProps) {
  const [reportType, setReportType] = useState<'all' | 'due_only' | 'advance_only'>('due_only');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [regions, setRegions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Load Regions
  useEffect(() => {
    fetch('/data/regions.json')
      .then(r => r.json())
      .then(d => setRegions(d || []))
      .catch(() => {});
  }, []);

  // Fetch Customers with live balances
  const fetchLedger = () => {
    setIsLoading(true);
    fetch(`/api/customers?region_id=${selectedRegion}&search=${encodeURIComponent(search)}&page=1&limit=500`)
      .then(r => r.json())
      .then(data => {
        let list = data.customers || [];
        if (reportType === 'due_only') {
          list = list.filter((c: any) => (c.due_amount || c.dueamount || 0) > 0);
        } else if (reportType === 'advance_only') {
          list = list.filter((c: any) => (c.due_amount || c.dueamount || 0) < 0);
        }
        setCustomers(list);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLedger();
  }, [reportType, selectedRegion]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLedger();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Calculations
  const totalDue = customers
    .filter(c => (c.due_amount || (c as any).dueamount || 0) > 0)
    .reduce((sum, c) => sum + (c.due_amount || (c as any).dueamount || 0), 0);

  const totalAdvance = customers
    .filter(c => (c.due_amount || (c as any).dueamount || 0) < 0)
    .reduce((sum, c) => sum + Math.abs(c.due_amount || (c as any).dueamount || 0), 0);

  const netOutstanding = totalDue - totalAdvance;

  return (
    <div className="relative w-[880px] h-[580px] vb-window flex flex-col shadow-2xl overflow-hidden font-tahoma">
      {/* Title Bar */}
      <div className="vb-titlebar-xp select-none">
        <div className="flex items-center gap-1.5">
          <img src="/legacy_images/paper.ico" alt="ico" className="w-3.5 h-3.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span>Customer Outstanding Dues Ledger & Regional Report (ग्राहक बकाया लेजर)</span>
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
          <h1 className="text-base font-black text-[#8B0000] tracking-wider uppercase">
            CUSTOMER OUTSTANDING DUES & ADVANCE LEDGER REPORT
          </h1>
          <p className="text-[11px] text-slate-700 font-bold">
            Real-time balance tracking across 24,581 customer accounts and 120 delivery regions
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-2 vb-box-inset flex items-center justify-between gap-2 text-xs font-bold my-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-[#8B0000]">Filter Balance:</label>
            <select 
              value={reportType}
              onChange={(e: any) => setReportType(e.target.value)}
              className="vb-input bg-white text-xs"
            >
              <option value="due_only">Outstanding Dues Only (केवल बकाया वाले)</option>
              <option value="advance_only">Advance Credit Only (केवल जमा/एडवांस वाले)</option>
              <option value="all">All Customer Accounts (सभी खाते)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
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

          <div className="flex items-center gap-1 bg-white px-2 py-0.5 border border-slate-400 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search Name / ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-xs w-36"
            />
          </div>

          <button 
            onClick={fetchLedger}
            disabled={isLoading}
            className="vb-btn bg-yellow-100 hover:bg-yellow-200 text-slate-900 font-bold flex items-center gap-1 shadow-xs cursor-pointer px-3 py-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Ledger Summary Cards */}
        <div className="grid grid-cols-3 gap-2 my-1">
          <div className="bg-red-50 border border-red-300 p-1.5 text-center">
            <span className="text-[10px] text-red-700 font-bold uppercase block">Total Due Receivable</span>
            <span className="text-sm font-black font-mono text-red-900">₹{totalDue.toFixed(2)}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-300 p-1.5 text-center">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Total Advance Payable</span>
            <span className="text-sm font-black font-mono text-emerald-900">₹{totalAdvance.toFixed(2)}</span>
          </div>
          <div className="bg-blue-50 border border-blue-300 p-1.5 text-center">
            <span className="text-[10px] text-blue-700 font-bold uppercase block">Net Agency Outstanding</span>
            <span className="text-sm font-black font-mono text-blue-900">₹{netOutstanding.toFixed(2)}</span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="flex-1 bg-white vb-grid overflow-auto my-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#ECE9D8]">
              <tr>
                <th className="p-1.5 border text-left">Cust ID</th>
                <th className="p-1.5 border text-left">Customer Name (English)</th>
                <th className="p-1.5 border text-left">नाम (हिंदी)</th>
                <th className="p-1.5 border text-left">Priority</th>
                <th className="p-1.5 border text-left">Phone</th>
                <th className="p-1.5 border text-right">Due / Advance Amount</th>
                <th className="p-1.5 border text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any, idx) => {
                const bal = c.due_amount ?? c.dueamount ?? 0;
                return (
                  <tr key={idx} className="border-b hover:bg-blue-50 text-[11px]">
                    <td className="p-1 border-r font-mono font-bold text-center">#{c.customer_id}</td>
                    <td className="p-1 border-r font-bold text-blue-900">{c.name_eng}</td>
                    <td className="p-1 border-r text-slate-700 font-hindi">{c.name_hindi || '-'}</td>
                    <td className="p-1 border-r font-mono text-center">{c.priority || '-'}</td>
                    <td className="p-1 border-r font-mono">{c.phone || '-'}</td>
                    <td className={`p-1 border-r text-right font-mono font-bold ${bal > 0 ? 'text-red-700' : bal < 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                      ₹{Math.abs(bal).toFixed(2)} {bal < 0 ? 'Cr (Adv)' : bal > 0 ? 'Dr (Due)' : ''}
                    </td>
                    <td className="p-1 text-center">
                      <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-bold ${bal > 0 ? 'bg-red-100 text-red-800' : bal < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {bal > 0 ? 'OUTSTANDING' : bal < 0 ? 'ADVANCE' : 'NIL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    No customer accounts found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-[#ECE9D8] pt-2 border-t border-slate-300 flex items-center justify-between text-xs font-bold">
          <span>Showing <strong>{customers.length}</strong> Accounts</span>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()} 
              disabled={customers.length === 0}
              className="vb-btn flex items-center gap-1 bg-white hover:bg-slate-100 cursor-pointer px-3 py-1"
            >
              <Printer className="w-3.5 h-3.5 text-purple-700" />
              <span>Print Ledger</span>
            </button>
            <button onClick={onClose} className="vb-btn flex items-center gap-1 bg-white hover:bg-red-50 text-red-800 cursor-pointer px-3 py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              <span>Close</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
