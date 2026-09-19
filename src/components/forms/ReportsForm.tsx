'use client';

import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Search, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';
import { Customer } from '@/lib/types';

interface ReportsFormProps {
  onClose: () => void;
  initialReport?: string;
}

export default function ReportsForm({ onClose, initialReport = 'hawker_qty' }: ReportsFormProps) {
  const [activeReport, setActiveReport] = useState<string>(initialReport);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Data states
  const [hawkers, setHawkers] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedHawker, setSelectedHawker] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load master data
  useEffect(() => {
    fetch('/data/hawkers.json').then(r => r.json()).then(d => setHawkers(d || [])).catch(() => {});
    fetch('/data/publications.json').then(r => r.json()).then(d => setPublications(d || [])).catch(() => {});
    fetch('/data/regions.json').then(r => r.json()).then(d => setRegions(d || [])).catch(() => {});
  }, []);

  // Fetch report data
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/customers?region_id=${selectedRegion}&page=1&limit=200`)
      .then(r => r.json())
      .then(data => {
        setCustomers(data.customers || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedRegion, activeReport]);

  const now = new Date();
  const printDateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${now.toLocaleTimeString()}`;

  // Mock calculation for Hawker Quantity Report
  const hawkerQuantities = hawkers.slice(0, 15).map(h => {
    const bhaskar = Math.floor(150 + (h.hawker_id * 17) % 250);
    const patrika = Math.floor(120 + (h.hawker_id * 23) % 220);
    const navajyoti = Math.floor(40 + (h.hawker_id * 11) % 80);
    const toi = Math.floor(15 + (h.hawker_id * 7) % 40);
    const total = bhaskar + patrika + navajyoti + toi;
    return {
      hawker_id: h.hawker_id,
      name: h.name || `Hawker ${h.hawker_id}`,
      mobile: h.mobile || h.phone || '---',
      bhaskar,
      patrika,
      navajyoti,
      toi,
      total
    };
  });

  const grandTotalCopies = hawkerQuantities.reduce((sum, h) => sum + h.total, 0);

  return (
    <div className="relative w-[960px] h-[680px] bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl flex flex-col font-tahoma select-none overflow-hidden">
      
      {/* Title Bar matching Crystal Reports Viewer */}
      <div className="bg-gradient-to-r from-[#0A246A] to-[#A6CAF0] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
        <div className="flex items-center gap-1.5">
          <img src="/legacy_images/paper.ico" alt="ico" className="w-4 h-4" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span>Crystal Report Viewer - Aryan News Agency</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">_</button>
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">□</button>
          <button onClick={onClose} className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* Classic Crystal Reports Toolbar */}
      <div className="bg-[#ECE9D8] border-b border-[#808080] p-1 flex items-center justify-between text-xs font-bold select-none flex-wrap gap-2">
        
        {/* Navigation & Zoom */}
        <div className="flex items-center gap-2">
          {/* Report Selector Dropdown */}
          <select 
            value={activeReport}
            onChange={(e) => setActiveReport(e.target.value)}
            className="px-2 py-0.5 border border-[#808080] bg-white font-bold text-black outline-none text-xs"
          >
            <option value="hawker_qty">Hawker-wise Newspaper Quantity Report</option>
            <option value="dues_ledger">Customer Outstanding Dues Ledger</option>
            <option value="advance_list">Customer Advance Balance List</option>
            <option value="region_balances">Region-wise Customer Balances</option>
            <option value="daily_distribution">Daily Distribution Sheet</option>
            <option value="supply_order">Daily Supply Order Summary</option>
            <option value="discontinue_list">Customer Discontinue / Vacation List</option>
          </select>

          <div className="h-4 w-[1px] bg-[#808080]"></div>

          {/* Print Button */}
          <button 
            onClick={() => window.print()}
            className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-[#808080] flex items-center gap-1 cursor-pointer"
            title="Print Report"
          >
            <Printer className="w-3.5 h-3.5 text-blue-900" />
            <span>Print</span>
          </button>

          {/* Export Button */}
          <button 
            onClick={() => window.print()}
            className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-[#808080] flex items-center gap-1 cursor-pointer"
            title="Export Report"
          >
            <Download className="w-3.5 h-3.5 text-emerald-800" />
            <span>Export</span>
          </button>

          <div className="h-4 w-[1px] bg-[#808080]"></div>

          {/* Zoom Buttons */}
          <button 
            onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
            className="px-1.5 py-0.5 bg-white hover:bg-slate-100 border border-[#808080] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono">{zoomLevel}%</span>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
            className="px-1.5 py-0.5 bg-white hover:bg-slate-100 border border-[#808080] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-2 text-xs">
          <button className="px-1.5 py-0.5 bg-white border border-[#808080] cursor-pointer disabled:opacity-40">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px]">Page 1 of 1</span>
          <button className="px-1.5 py-0.5 bg-white border border-[#808080] cursor-pointer disabled:opacity-40">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Crystal Reports Grey Canvas Area */}
      <div className="flex-1 bg-[#525659] p-4 overflow-auto flex justify-center items-start">
        
        {/* Printable White Sheet of Paper matching Crystal Reports Page */}
        <div 
          className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-8 font-serif text-black border border-slate-300 transition-all duration-150"
          style={{ 
            width: `${Math.round(800 * (zoomLevel / 100))}px`, 
            minHeight: `${Math.round(1050 * (zoomLevel / 100))}px`,
            fontSize: `${Math.round(12 * (zoomLevel / 100))}px`
          }}
        >
          
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-black space-y-1">
            <h1 className="text-xl font-black tracking-wider uppercase">ARYAN NEWS AGENCY</h1>
            <p className="text-xs text-slate-700 font-sans font-bold">Main Market, Near Clock Tower, Beawar (Raj.) - 305901</p>
            <h2 className="text-sm font-black text-[#000080] underline tracking-wide uppercase pt-1">
              {activeReport === 'hawker_qty' && 'HAWKER-WISE DAILY NEWSPAPER QUANTITY REPORT'}
              {activeReport === 'dues_ledger' && 'CUSTOMER OUTSTANDING DUES LEDGER'}
              {activeReport === 'advance_list' && 'CUSTOMER ADVANCE BALANCE LIST'}
              {activeReport === 'region_balances' && 'REGION-WISE CUSTOMER BALANCES REPORT'}
              {activeReport === 'daily_distribution' && 'DAILY MORNING DISTRIBUTION SHEET'}
              {activeReport === 'supply_order' && 'DAILY PUBLISHER TOTAL SUPPLY ORDER'}
              {activeReport === 'discontinue_list' && 'CUSTOMER TEMPORARY DISCONTINUE / VACATION LIST'}
            </h2>
            <div className="flex justify-between text-[10px] font-sans font-bold text-slate-600 pt-1">
              <span>Date: {printDateStr}</span>
              <span>Period: August 2026-2027</span>
              <span>Page: 1 of 1</span>
            </div>
          </div>

          {/* REPORT CONTENT 1: HAWKER-WISE QUANTITY NEWSPAPER REPORT */}
          {activeReport === 'hawker_qty' && (
            <div className="pt-4 font-sans">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-t border-black bg-slate-100 font-bold text-[11px]">
                    <th className="p-1.5 text-center border-r border-black w-12">S.No</th>
                    <th className="p-1.5 text-left border-r border-black">Hawker / Distributor Name</th>
                    <th className="p-1.5 text-right border-r border-black">D. Bhaskar</th>
                    <th className="p-1.5 text-right border-r border-black">R. Patrika</th>
                    <th className="p-1.5 text-right border-r border-black">Navajyoti</th>
                    <th className="p-1.5 text-right border-r border-black">T.O.I.</th>
                    <th className="p-1.5 text-right font-black">Total Copies</th>
                  </tr>
                </thead>
                <tbody>
                  {hawkerQuantities.map((h, idx) => (
                    <tr key={h.hawker_id} className="border-b border-slate-300 text-[11px]">
                      <td className="p-1 text-center border-r border-slate-300 font-mono">{idx + 1}</td>
                      <td className="p-1 border-r border-slate-300 font-bold text-blue-950">{h.name}</td>
                      <td className="p-1 border-r border-slate-300 text-right font-mono">{h.bhaskar}</td>
                      <td className="p-1 border-r border-slate-300 text-right font-mono">{h.patrika}</td>
                      <td className="p-1 border-r border-slate-300 text-right font-mono">{h.navajyoti}</td>
                      <td className="p-1 border-r border-slate-300 text-right font-mono">{h.toi}</td>
                      <td className="p-1 text-right font-mono font-black text-slate-900 bg-slate-50">{h.total}</td>
                    </tr>
                  ))}
                  {/* Grand Summary Row */}
                  <tr className="border-t-2 border-b-2 border-black font-black text-xs bg-slate-100">
                    <td colSpan={2} className="p-1.5 text-left uppercase border-r border-black">
                      Grand Total Distribution Demand:
                    </td>
                    <td className="p-1.5 text-right font-mono border-r border-black">
                      {hawkerQuantities.reduce((s, h) => s + h.bhaskar, 0)}
                    </td>
                    <td className="p-1.5 text-right font-mono border-r border-black">
                      {hawkerQuantities.reduce((s, h) => s + h.patrika, 0)}
                    </td>
                    <td className="p-1.5 text-right font-mono border-r border-black">
                      {hawkerQuantities.reduce((s, h) => s + h.navajyoti, 0)}
                    </td>
                    <td className="p-1.5 text-right font-mono border-r border-black">
                      {hawkerQuantities.reduce((s, h) => s + h.toi, 0)}
                    </td>
                    <td className="p-1.5 text-right font-mono text-sm text-blue-900">
                      {grandTotalCopies}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT CONTENT 2: CUSTOMER OUTSTANDING DUES LEDGER */}
          {activeReport !== 'hawker_qty' && (
            <div className="pt-4 font-sans">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-t border-black bg-slate-100 font-bold text-[11px]">
                    <th className="p-1.5 text-center border-r border-black w-14">Cust ID</th>
                    <th className="p-1.5 text-left border-r border-black">Customer Name</th>
                    <th className="p-1.5 text-left border-r border-black">Address / Area</th>
                    <th className="p-1.5 text-center border-r border-black w-16">Region</th>
                    <th className="p-1.5 text-right font-black w-24">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 30).map((c) => {
                    const bal = (c as any).due_amount ?? c.dueamount ?? 0;
                    return (
                      <tr key={c.customer_id} className="border-b border-slate-300 text-[11px]">
                        <td className="p-1 text-center border-r border-slate-300 font-mono font-bold">#{c.customer_id}</td>
                        <td className="p-1 border-r border-slate-300 font-bold text-blue-950">{c.name_eng}</td>
                        <td className="p-1 border-r border-slate-300 text-slate-700 truncate max-w-[200px]">{c.add1 || c.add2 || '---'}</td>
                        <td className="p-1 border-r border-slate-300 text-center font-mono">{c.region_id || 1}</td>
                        <td className={`p-1 text-right font-mono font-bold ${bal < 0 ? 'text-emerald-700' : 'text-[#800000]'}`}>
                          ₹{Math.abs(bal).toFixed(2)} {bal < 0 ? 'Cr' : 'Dr'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Signatures matching Crystal Reports */}
          <div className="pt-12 flex justify-between text-xs font-serif font-bold">
            <div className="text-center">
              <div className="w-36 border-t border-black pt-1">Prepared By</div>
            </div>
            <div className="text-center">
              <div className="w-36 border-t border-black pt-1">Checked By</div>
            </div>
            <div className="text-center">
              <div className="w-36 border-t border-black pt-1">For Aryan News Agency</div>
            </div>
          </div>

          <div className="text-center pt-8 text-[10px] text-slate-500 font-sans">
            --- End of Report (Crystal Reports for Windows) ---
          </div>

        </div>

      </div>

    </div>
  );
}
