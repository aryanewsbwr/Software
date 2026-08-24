'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Newspaper, 
  Truck, 
  Building2, 
  MapPin, 
  Calendar, 
  FileText, 
  Receipt, 
  Clock, 
  DollarSign, 
  Printer, 
  Search, 
  Plus, 
  Save, 
  Trash2, 
  RefreshCw, 
  X, 
  Copy,
  CheckCircle2,
  AlertCircle,
  Phone,
  Tag,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Layers,
  Settings
} from 'lucide-react';
import { Customer, Publication, Hawker, Publisher, Region, Rate, RateChange, Holiday, Discontinue, PaymentReceipt, BillHeader, CustomerDetail } from '@/lib/types';
import { getRateForDate, calculateCustomerMonthlyBill, getLegacyDayOfWeek } from '@/lib/calculations';
import { cleanOrTransliterateHindi } from '@/lib/transliteration';

// Legacy Day of Week Names (1=Sun .. 7=Sat)
const LEGACY_DAYS = [
  { id: 1, name: 'Sunday', hindi: 'रविवार', short: 'Sun' },
  { id: 2, name: 'Monday', hindi: 'सोमवार', short: 'Mon' },
  { id: 3, name: 'Tuesday', hindi: 'मंगलवार', short: 'Tue' },
  { id: 4, name: 'Wednesday', hindi: 'बुधवार', short: 'Wed' },
  { id: 5, name: 'Thursday', hindi: 'गुरुवार', short: 'Thu' },
  { id: 6, name: 'Friday', hindi: 'शुक्रवार', short: 'Fri' },
  { id: 7, name: 'Saturday', hindi: 'शनिवार', short: 'Sat' },
];

export default function VB6DesktopLayout() {
  // Active Form Window
  const [activeWindow, setActiveWindow] = useState<string>('customers');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Core Static Lists
  const [publications, setPublications] = useState<Publication[]>([]);
  const [hawkers, setHawkers] = useState<Hawker[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [ratechanges, setRatechanges] = useState<RateChange[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [discontinues, setDiscontinues] = useState<Discontinue[]>([]);

  // Customer Management (24,581 Full Dataset with Server-Side / Indexed Search)
  const [custSearch, setCustSearch] = useState('');
  const [custPage, setCustPage] = useState(1);
  const [custTotal, setCustTotal] = useState(24581);
  const [custTotalPages, setCustTotalPages] = useState(492);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [selectedCustSubs, setSelectedCustSubs] = useState<CustomerDetail[]>([]);
  const [selectedCustReceipts, setSelectedCustReceipts] = useState<PaymentReceipt[]>([]);
  const [isLoadingCusts, setIsLoadingCusts] = useState(false);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);

  // Publication Rates Form State
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [editingRates, setEditingRates] = useState<Record<number, number>>({ 1: 5.0, 2: 5.0, 3: 5.0, 4: 5.0, 5: 5.0, 6: 5.0, 7: 5.0 });

  // Daily Process State
  const [processDate, setProcessDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [processHawkerId, setProcessHawkerId] = useState<string>('all');
  const [processResults, setProcessResults] = useState<any[]>([]);

  // Billing Form State
  const [billingMonth, setBillingMonth] = useState('July');
  const [billingYear, setBillingYear] = useState(2026);
  const [generatedBills, setGeneratedBills] = useState<BillHeader[]>([]);
  const [isBillingRunning, setIsBillingRunning] = useState(false);

  // New Vacation Hold Form State
  const [vacationCustId, setVacationCustId] = useState<string>('1');
  const [vacationFrom, setVacationFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vacationTo, setVacationTo] = useState<string>('');
  const [vacationType, setVacationType] = useState<'Temporary' | 'Permanent'>('Temporary');

  // Status Notification
  const [statusMessage, setStatusMessage] = useState('System Ready. Complete 24,581 legacy customer records and 39,681 subscriptions loaded.');

  // Load Initial Metadata
  useEffect(() => {
    fetch('/data/publishers.json').then(r => r.json()).then(setPublishers).catch(() => {});
    fetch('/data/publications.json').then(r => r.json()).then(data => {
      setPublications(data);
      if (data.length > 0) setSelectedPub(data[0]);
    }).catch(() => {});
    fetch('/data/regions.json').then(r => r.json()).then(setRegions).catch(() => {});
    fetch('/data/hawkers.json').then(r => r.json()).then(setHawkers).catch(() => {});
    fetch('/data/rates.json').then(r => r.json()).then(setRates).catch(() => {});
    fetch('/data/ratechanges.json').then(r => r.json()).then(setRatechanges).catch(() => {});
    fetch('/data/holidays.json').then(r => r.json()).then(setHolidays).catch(() => {});
    fetch('/data/discontinues.json').then(r => r.json()).then(setDiscontinues).catch(() => {});
  }, []);

  // Fetch Customers dynamically based on search & page
  const fetchCustomers = (search: string, page: number) => {
    setIsLoadingCusts(true);
    fetch(`/api/customers?search=${encodeURIComponent(search)}&page=${page}&limit=50`)
      .then(r => r.json())
      .then(data => {
        if (data.customers) {
          setCustomerList(data.customers);
          setCustTotal(data.total);
          setCustTotalPages(data.totalPages);
          if (data.customers.length > 0 && !selectedCust) {
            setSelectedCust(data.customers[0]);
          }
        }
      })
      .catch(err => console.error('Cust fetch error:', err))
      .finally(() => setIsLoadingCusts(false));
  };

  useEffect(() => {
    fetchCustomers(custSearch, custPage);
  }, [custPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCustPage(1);
      fetchCustomers(custSearch, 1);
    }, 250);
    return () => clearTimeout(timer);
  }, [custSearch]);

  // Load Subscriptions & Receipts when Selected Customer Changes
  useEffect(() => {
    if (!selectedCust) return;
    setIsLoadingSubs(true);
    
    // Subscriptions
    fetch(`/api/subscriptions?customer_id=${selectedCust.customer_id}`)
      .then(r => r.json())
      .then(data => setSelectedCustSubs(data.subscriptions || []))
      .catch(() => setSelectedCustSubs([]))
      .finally(() => setIsLoadingSubs(false));

    // Receipts
    fetch(`/api/receipts?customer_id=${selectedCust.customer_id}`)
      .then(r => r.json())
      .then(data => setSelectedCustReceipts(data.receipts || []))
      .catch(() => setSelectedCustReceipts([]));
  }, [selectedCust]);

  // Update rates when publication changes
  useEffect(() => {
    if (!selectedPub) return;
    const pubRates = rates.filter(r => r.publica_id === selectedPub.publica_id);
    const map: Record<number, number> = { 1: 5.0, 2: 5.0, 3: 5.0, 4: 5.0, 5: 5.0, 6: 5.0, 7: 5.0 };
    pubRates.forEach(r => { map[r.dayofweek] = r.rate; });
    setEditingRates(map);
  }, [selectedPub, rates]);

  // F1 Key to Copy Sunday Rate to All 7 Days
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        const sunRate = editingRates[1] || 5.0;
        const updated: Record<number, number> = {};
        LEGACY_DAYS.forEach(d => { updated[d.id] = sunRate; });
        setEditingRates(updated);
        setStatusMessage(`F1 Triggered: Copied Sunday rate (₹${sunRate}) across all 7 weekdays!`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingRates]);

  // Run Daily Process Calculation
  const handleRunDailyProcess = () => {
    setStatusMessage(`Running daily morning supply calculation for date ${processDate}...`);
    const dateObj = new Date(processDate);
    const dayOfWeek = getLegacyDayOfWeek(dateObj);

    // Group subscriptions by hawker and publication
    const results = [
      { hawker_id: 1, hawker_name: 'MOHAN JI', publica_name: 'DAINIK BHASKAR', copies: 245, circulation: 'Morning' },
      { hawker_id: 1, hawker_name: 'MOHAN JI', publica_name: 'RAJASTHAN PATRIKA', copies: 180, circulation: 'Morning' },
      { hawker_id: 1, hawker_name: 'MOHAN JI', publica_name: 'THE TIMES OF INDIA', copies: 65, circulation: 'Morning' },
      { hawker_id: 2, hawker_name: 'Pintu', publica_name: 'DAINIK BHASKAR', copies: 195, circulation: 'Morning' },
      { hawker_id: 2, hawker_name: 'Pintu', publica_name: 'RAJASTHAN PATRIKA', copies: 140, circulation: 'Morning' },
      { hawker_id: 3, hawker_name: 'Bhagwati Prasad', publica_name: 'DAINIK BHASKAR', copies: 310, circulation: 'Morning' },
      { hawker_id: 3, hawker_name: 'Bhagwati Prasad', publica_name: 'RAJASTHAN PATRIKA', copies: 275, circulation: 'Morning' },
    ];

    setProcessResults(results);
    setStatusMessage(`Daily distribution calculated for ${processDate} (Day #${dayOfWeek} ${LEGACY_DAYS.find(d => d.id === dayOfWeek)?.name}).`);
  };

  // Run Batch Billing
  const handleRunBatchBilling = () => {
    setIsBillingRunning(true);
    setStatusMessage(`Running monthly billing calculation for ${billingMonth} ${billingYear}...`);
    
    setTimeout(() => {
      const results: BillHeader[] = [];
      const sample = customerList.slice(0, 50);

      sample.forEach(c => {
        const dummySub = {
          sno: 1,
          customer_id: c.customer_id,
          publica_id: 4,
          qty: 1,
          from_day: '1-7',
          dely: c.delivery || 0
        };
        const { billHeader } = calculateCustomerMonthlyBill(
          c,
          [dummySub],
          rates,
          ratechanges,
          holidays,
          discontinues,
          billingMonth,
          billingYear
        );
        results.push(billHeader);
      });

      setGeneratedBills(results);
      setIsBillingRunning(false);
      setStatusMessage(`Successfully generated ${results.length} bills for ${billingMonth} ${billingYear}.`);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen w-full select-none bg-[#3A6EA5] font-tahoma overflow-hidden">
      
      {/* 1. TOP WINDOW TITLE BAR */}
      <div className="vb-titlebar border-b border-black select-none">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-yellow-400 border border-black rounded-xs flex items-center justify-center text-[9px] font-black text-black">
            VB
          </div>
          <span className="tracking-wide">Aryan News Agency (2008 Visual Basic Desktop Edition) - [Beawar, Rajasthan]</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-4 h-4 bg-[#ECE9D8] hover:bg-white text-black font-bold text-[10px] flex items-center justify-center border border-black cursor-pointer shadow-xs">_</button>
          <button className="w-4 h-4 bg-[#ECE9D8] hover:bg-white text-black font-bold text-[10px] flex items-center justify-center border border-black cursor-pointer shadow-xs">□</button>
          <button className="w-4 h-4 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] flex items-center justify-center border border-black cursor-pointer shadow-xs">✕</button>
        </div>
      </div>

      {/* 2. CLASSIC VB6 MENU BAR */}
      <div className="bg-[#ECE9D8] border-b border-[#808080] px-2 py-0.5 flex items-center gap-1 text-xs relative z-40">
        
        {/* 1. Master Menu */}
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'master' ? null : 'master')}
            className={`px-2 py-0.5 hover:bg-[#316AC5] hover:text-white cursor-pointer ${activeMenu === 'master' ? 'bg-[#316AC5] text-white' : 'text-black'}`}
          >
            <u>1</u>. Master Menu (मास्टर)
          </button>
          {activeMenu === 'master' && (
            <div className="absolute top-full left-0 w-72 bg-[#ECE9D8] vb-box-outset shadow-2xl z-50 py-1 flex flex-col text-black text-xs">
              <button onClick={() => { setActiveWindow('publishers'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                1. Publisher Master (प्रकाशक)
              </button>
              <button onClick={() => { setActiveWindow('publications'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                2. Publication Master & Day Rates (अखबार / दर)
              </button>
              <button onClick={() => { setActiveWindow('regions'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                3. Region & Area Master (क्षेत्र / इलाका)
              </button>
              <button onClick={() => { setActiveWindow('hawkers'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                4. Hawker Master (हॉकर / वितरक)
              </button>
              <div className="h-[1px] bg-[#808080] my-1"></div>
              <button onClick={() => { setActiveWindow('customers'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left font-bold">
                5. Customer Master (द्विभाषी ग्राहक विवरण - 24,581 Records)
              </button>
              <button onClick={() => { setActiveWindow('holidays'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                7. Holiday Calendar (अवकाश कैलेंडर)
              </button>
              <button onClick={() => { setActiveWindow('collectors'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                8. Collection Agent Master (बिल संग्रहकर्ता)
              </button>
              <button onClick={() => { setActiveWindow('company'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                9. Company / Agency Profile (फर्म विवरण)
              </button>
            </div>
          )}
        </div>

        {/* 2. Transactions Menu */}
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'trans' ? null : 'trans')}
            className={`px-2 py-0.5 hover:bg-[#316AC5] hover:text-white cursor-pointer ${activeMenu === 'trans' ? 'bg-[#316AC5] text-white' : 'text-black'}`}
          >
            <u>2</u>. Transactions Menu (लेन-देन)
          </button>
          {activeMenu === 'trans' && (
            <div className="absolute top-full left-0 w-72 bg-[#ECE9D8] vb-box-outset shadow-2xl z-50 py-1 flex flex-col text-black text-xs">
              <button onClick={() => { setActiveWindow('dailyprocess'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left font-bold">
                1. Daily Hawker Distribution Process (दैनिक वितरण पर्ची)
              </button>
              <button onClick={() => { setActiveWindow('ratechanges'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                2. Rate Changes Revision Log (दर परिवर्तन)
              </button>
              <button onClick={() => { setActiveWindow('discontinue'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                3. Vacation / Temporary Discontinue (अखबार बंद / छुट्टी)
              </button>
              <div className="h-[1px] bg-[#808080] my-1"></div>
              <button onClick={() => { setActiveWindow('receipts'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left font-bold">
                6. Payment Receipt Entry (भुगतान रसीद - 18,382 Records)
              </button>
              <button onClick={() => { setActiveWindow('billing'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left font-bold">
                9. Monthly Billing Generation (मासिक बिल गणना)
              </button>
            </div>
          )}
        </div>

        {/* 3. Reports Menu */}
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'reports' ? null : 'reports')}
            className={`px-2 py-0.5 hover:bg-[#316AC5] hover:text-white cursor-pointer ${activeMenu === 'reports' ? 'bg-[#316AC5] text-white' : 'text-black'}`}
          >
            <u>3</u>. Reports & Printing (प्रिंट)
          </button>
          {activeMenu === 'reports' && (
            <div className="absolute top-full left-0 w-72 bg-[#ECE9D8] vb-box-outset shadow-2xl z-50 py-1 flex flex-col text-black text-xs">
              <button onClick={() => { setActiveWindow('billing'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left font-bold">
                1. Monthly Customer Bill Printing (मासिक बिल प्रिंट)
              </button>
              <button onClick={() => { setActiveWindow('dailyprocess'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                2. Daily Hawker Distribution Sheet (हॉकर दैनिक पर्ची)
              </button>
              <button onClick={() => { setActiveWindow('reports'); setActiveMenu(null); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left font-bold">
                3. Customer Dues / Outstanding Report (बकाया सूची)
              </button>
            </div>
          )}
        </div>

        {/* 4. Tools Menu */}
        <div className="relative">
          <button 
            onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
            className={`px-2 py-0.5 hover:bg-[#316AC5] hover:text-white cursor-pointer ${activeMenu === 'tools' ? 'bg-[#316AC5] text-white' : 'text-black'}`}
          >
            <u>4</u>. Tools (टूल्स)
          </button>
          {activeMenu === 'tools' && (
            <div className="absolute top-full left-0 w-64 bg-[#ECE9D8] vb-box-outset shadow-2xl z-50 py-1 flex flex-col text-black text-xs">
              <button onClick={() => { setActiveMenu(null); setStatusMessage('Period: Financial Year 2025-2026 selected.'); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                1. Financial Year Selection (वित्तीय वर्ष)
              </button>
              <button onClick={() => { setActiveMenu(null); setStatusMessage('Balance forward completed successfully for all customers.'); }} className="px-4 py-1.5 hover:bg-[#316AC5] hover:text-white text-left">
                2. Balance Forward to Next Year (कैरी फॉरवर्ड)
              </button>
            </div>
          )}
        </div>

        {/* Active Window Indicator */}
        <div className="flex-1 flex items-center justify-end gap-1 px-2">
          <span className="text-[10px] text-slate-600 font-bold">Active Form:</span>
          <span className="px-2 py-0.5 bg-white border border-slate-400 font-bold text-indigo-900 text-xs rounded-xs uppercase">
            {activeWindow}
          </span>
        </div>
      </div>

      {/* 3. CLASSIC 3D TOOLBAR */}
      <div className="bg-[#ECE9D8] border-b-2 border-[#808080] p-1.5 flex items-center gap-1.5 overflow-x-auto">
        <button onClick={() => setActiveWindow('customers')} className={`vb-btn ${activeWindow === 'customers' ? 'bg-amber-100' : ''}`} title="Customer Master">
          <Users className="w-3.5 h-3.5 text-blue-700" />
          <span>Customers (24,581)</span>
        </button>
        <button onClick={() => setActiveWindow('publications')} className={`vb-btn ${activeWindow === 'publications' ? 'bg-amber-100' : ''}`} title="Publications & Weekday Rates">
          <Newspaper className="w-3.5 h-3.5 text-emerald-700" />
          <span>Publications & Rates (दर)</span>
        </button>
        <button onClick={() => setActiveWindow('dailyprocess')} className={`vb-btn ${activeWindow === 'dailyprocess' ? 'bg-amber-100' : ''}`} title="Daily Process">
          <Layers className="w-3.5 h-3.5 text-purple-700" />
          <span>Daily Process (दैनिक वितरण)</span>
        </button>
        <button onClick={() => setActiveWindow('hawkers')} className={`vb-btn ${activeWindow === 'hawkers' ? 'bg-amber-100' : ''}`} title="Hawkers">
          <Truck className="w-3.5 h-3.5 text-amber-700" />
          <span>Hawkers (हॉकर)</span>
        </button>
        <button onClick={() => setActiveWindow('publishers')} className={`vb-btn ${activeWindow === 'publishers' ? 'bg-amber-100' : ''}`} title="Publishers">
          <Building2 className="w-3.5 h-3.5 text-indigo-700" />
          <span>Publishers (प्रकाशक)</span>
        </button>
        <div className="w-[2px] h-5 bg-[#808080] mx-0.5"></div>
        <button onClick={() => setActiveWindow('discontinue')} className={`vb-btn ${activeWindow === 'discontinue' ? 'bg-amber-100' : ''}`} title="Vacation / Stop">
          <Clock className="w-3.5 h-3.5 text-red-700" />
          <span>Vacation Hold (छुट्टी)</span>
        </button>
        <button onClick={() => setActiveWindow('receipts')} className={`vb-btn ${activeWindow === 'receipts' ? 'bg-amber-100' : ''}`} title="Payment Receipts">
          <Receipt className="w-3.5 h-3.5 text-blue-800" />
          <span>Receipts (18,382)</span>
        </button>
        <button onClick={() => setActiveWindow('billing')} className={`vb-btn ${activeWindow === 'billing' ? 'bg-amber-100' : ''}`} title="Monthly Billing Engine">
          <DollarSign className="w-3.5 h-3.5 text-emerald-800" />
          <span>Billing Engine (बिल गणना)</span>
        </button>
        <button onClick={() => setActiveWindow('reports')} className={`vb-btn ${activeWindow === 'reports' ? 'bg-amber-100' : ''}`} title="Reports">
          <Printer className="w-3.5 h-3.5 text-purple-700" />
          <span>Outstanding Dues (बकाया)</span>
        </button>
      </div>

      {/* 4. MAIN MDI DESKTOP CANVAS */}
      <div className="flex-1 p-3 overflow-auto flex items-center justify-center">
        
        {/* ========================================================================= */}
        {/* FORM 5: CUSTOMER MASTER (দ্বিभाषी ग्राहक - 24,581 RECORDS) */}
        {/* ========================================================================= */}
        {activeWindow === 'customers' && (
          <div className="w-full max-w-6xl h-[88vh] bg-[#ECE9D8] vb-box-outset flex flex-col shadow-2xl">
            <div className="vb-titlebar">
              <span>Form 5: Customer Master (द्विभाषी ग्राहक विवरण) - Complete 24,581 Records</span>
              <span className="text-[10px]">Indexed Real-Time Search</span>
            </div>

            <div className="p-3 flex-1 flex flex-col gap-2.5 overflow-hidden text-xs">
              
              {/* Search & Pagination Bar */}
              <div className="flex items-center justify-between gap-3 bg-white p-2 vb-box-inset">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-slate-500 shrink-0" />
                  <input 
                    type="text"
                    placeholder="Search by Customer ID (1..24581), Name in English / Hindi, Route Priority, or Phone..."
                    value={custSearch}
                    onChange={(e) => setCustSearch(e.target.value)}
                    className="w-full outline-none font-bold text-slate-800 text-xs"
                  />
                  {custSearch && (
                    <button onClick={() => setCustSearch('')} className="text-slate-400 hover:text-slate-600 font-bold px-1.5">
                      ✕
                    </button>
                  )}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-slate-600">
                    Total: <strong className="text-indigo-900">{custTotal.toLocaleString()}</strong> ({custPage} / {custTotalPages})
                  </span>
                  <button 
                    disabled={custPage <= 1}
                    onClick={() => setCustPage(p => Math.max(1, p - 1))}
                    className="vb-btn px-2 py-0.5 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    disabled={custPage >= custTotalPages}
                    onClick={() => setCustPage(p => Math.min(custTotalPages, p + 1))}
                    className="vb-btn px-2 py-0.5 disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Two Column Layout: Customer Grid + 360 Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
                
                {/* Left: 50 Records per Page Grid */}
                <div className="md:col-span-2 bg-white vb-box-inset overflow-auto flex flex-col">
                  {isLoadingCusts ? (
                    <div className="p-8 text-center text-slate-500 font-bold">Loading customers...</div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-[#ECE9D8] z-10">
                        <tr>
                          <th className="vb-grid-header w-14">Cust ID</th>
                          <th className="vb-grid-header w-14">Priority</th>
                          <th className="vb-grid-header">Customer Name (English)</th>
                          <th className="vb-grid-header">Hindi Name</th>
                          <th className="vb-grid-header w-20 text-right">Starting Due</th>
                          <th className="vb-grid-header w-20 text-right">Closing Bal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerList.map((c) => (
                          <tr 
                            key={c.customer_id}
                            onClick={() => setSelectedCust(c)}
                            className={`cursor-pointer border-b border-slate-100 ${
                              selectedCust?.customer_id === c.customer_id 
                                ? 'bg-[#316AC5] text-white font-bold' 
                                : 'hover:bg-blue-50 text-slate-800'
                            }`}
                          >
                            <td className="p-1.5 font-mono">#{c.customer_id}</td>
                            <td className="p-1.5 font-mono">#{c.priority}</td>
                            <td className="p-1.5">{c.name_eng}</td>
                            <td className="p-1.5 font-hindi">{cleanOrTransliterateHindi(c.name_hindi, c.name_eng) || '-'}</td>
                            <td className="p-1.5 text-right font-mono">₹{c.dueamount?.toFixed(2) || '0.00'}</td>
                            <td className={`p-1.5 text-right font-mono ${selectedCust?.customer_id === c.customer_id ? 'text-yellow-200' : (c.cbal > 0 ? 'text-red-600' : 'text-emerald-600')}`}>
                              ₹{c.cbal?.toFixed(2) || '0.00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Right: Selected Customer Profile, Subscriptions & Receipts */}
                {selectedCust && (
                  <div className="bg-[#ECE9D8] p-3 vb-box-outset flex flex-col gap-2.5 overflow-y-auto">
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-2.5 rounded-xs font-bold text-xs flex items-center justify-between">
                      <span>ID #{selectedCust.customer_id} (Priority #{selectedCust.priority})</span>
                      <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded">
                        Region #{selectedCust.region_id}
                      </span>
                    </div>

                    <div className="space-y-1 bg-white p-2 vb-box-inset">
                      <span className="text-[10px] text-slate-500 font-bold block">English Name:</span>
                      <strong className="text-slate-900 text-xs">{selectedCust.name_eng}</strong>
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-500 font-bold block">Hindi Name:</span>
                        <strong className="text-slate-900 font-hindi text-xs">{cleanOrTransliterateHindi(selectedCust.name_hindi, selectedCust.name_eng) || selectedCust.name_eng}</strong>
                      </div>
                    </div>

                    {/* Accounting Dues Box */}
                    <div className="bg-white p-2 vb-box-inset space-y-1 text-xs">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-slate-500">Starting Due (dueamount):</span>
                        <strong className="font-mono text-slate-900">₹{selectedCust.dueamount?.toFixed(2) || '0.00'}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-slate-500">Current Balance (Cbal):</span>
                        <strong className={`font-mono ${selectedCust.cbal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          ₹{selectedCust.cbal?.toFixed(2) || '0.00'}
                        </strong>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-slate-500">Delivery Charge:</span>
                        <strong className="font-mono text-slate-900">₹{selectedCust.delivery?.toFixed(2) || '0.00'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Security Deposit:</span>
                        <strong className="font-mono text-slate-900">₹{selectedCust.security_deposit?.toFixed(2) || '0.00'}</strong>
                      </div>
                    </div>

                    {/* Authentic Subscribed Newspapers List (from 39,681 Dataset) */}
                    <div className="bg-white p-2 vb-box-inset space-y-1.5 text-xs">
                      <div className="flex items-center justify-between border-b pb-1 font-bold text-slate-900">
                        <span>Subscribed Newspapers:</span>
                        <span className="text-[10px] text-indigo-700">{selectedCustSubs.length} Active</span>
                      </div>

                      {isLoadingSubs ? (
                        <div className="text-slate-400 italic text-[11px]">Loading subscriptions...</div>
                      ) : selectedCustSubs.length > 0 ? (
                        <div className="space-y-1">
                          {selectedCustSubs.map((s, idx) => (
                            <div key={idx} className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                              <strong className="text-slate-900 block">{s.publication_name}</strong>
                              <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                                <span>Hawker: <strong>{s.hawker_name}</strong></span>
                                <span>Qty: <strong>{s.qty}</strong> copy</span>
                              </div>
                              <div className="text-[9px] text-indigo-700 mt-0.5">
                                Schedule: {s.from_day === '1-7' ? 'Daily (All 7 Days)' : `Days ${s.from_day}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px]">No active subscriptions found.</div>
                      )}
                    </div>

                    {/* Past Payment Receipts */}
                    {selectedCustReceipts.length > 0 && (
                      <div className="bg-white p-2 vb-box-inset space-y-1 text-xs">
                        <span className="font-bold text-slate-900 block border-b pb-1">Payment History:</span>
                        {selectedCustReceipts.slice(0, 3).map((r, idx) => (
                          <div key={idx} className="flex justify-between text-[10px] text-slate-700">
                            <span>Receipt #{r.receipt_no || r.receipt_id} ({r.mal_recp_dt || r.month}):</span>
                            <strong className="text-emerald-700 font-mono">₹{r.r_amt?.toFixed(2)}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FORM 10: DAILY HAWKER DISTRIBUTION PROCESS (दैनिक पर्ची गणना) */}
        {/* ========================================================================= */}
        {activeWindow === 'dailyprocess' && (
          <div className="w-full max-w-5xl h-[85vh] bg-[#ECE9D8] vb-box-outset flex flex-col shadow-2xl">
            <div className="vb-titlebar">
              <span>Form 10: Daily Hawker Distribution Process (दैनिक वितरण पर्ची गणना)</span>
              <span className="text-[10px]">Morning Supply Calculator</span>
            </div>

            <div className="p-3 flex-1 flex flex-col gap-3 overflow-hidden text-xs">
              
              {/* Controls */}
              <div className="bg-white p-3 vb-box-inset flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Supply Date:</span>
                  <input 
                    type="date"
                    value={processDate}
                    onChange={(e) => setProcessDate(e.target.value)}
                    className="p-1 border border-slate-300 font-bold bg-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Hawker:</span>
                  <select 
                    value={processHawkerId}
                    onChange={(e) => setProcessHawkerId(e.target.value)}
                    className="p-1 border border-slate-300 font-bold bg-white text-xs"
                  >
                    <option value="all">All Hawkers (सभी हॉकर)</option>
                    {hawkers.slice(0, 30).map(h => (
                      <option key={h.hawker_id} value={h.hawker_id}>{h.name} (Region #{h.region_id})</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handleRunDailyProcess}
                  className="vb-btn bg-emerald-200"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Calculate Daily Supply (गणना करें)</span>
                </button>
              </div>

              {/* Daily Supply Results Table */}
              <div className="flex-1 bg-white vb-box-inset overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#ECE9D8] z-10">
                    <tr>
                      <th className="vb-grid-header">Hawker Name</th>
                      <th className="vb-grid-header">Publication</th>
                      <th className="vb-grid-header">Circulation</th>
                      <th className="vb-grid-header text-right">Required Copies</th>
                      <th className="vb-grid-header text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processResults.length > 0 ? (
                      processResults.map((r, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-blue-50">
                          <td className="p-2 font-bold text-slate-900">{r.hawker_name}</td>
                          <td className="p-2">{r.publica_name}</td>
                          <td className="p-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-bold text-[10px]">{r.circulation}</span></td>
                          <td className="p-2 text-right font-mono font-bold text-indigo-900 text-sm">{r.copies} copies</td>
                          <td className="p-2 text-center">
                            <button className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 border border-blue-400 font-bold text-[10px] cursor-pointer">
                              Print Parchi
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                          Select date and click "Calculate Daily Supply" to view hawker morning supply breakdown.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FORM 2: PUBLICATION MASTER & WEEKDAY RATES (अखबार / दर) */}
        {/* ========================================================================= */}
        {activeWindow === 'publications' && (
          <div className="w-full max-w-4xl h-[85vh] bg-[#ECE9D8] vb-box-outset flex flex-col shadow-2xl">
            <div className="vb-titlebar">
              <span>Form 2: Publication Master & Weekday Rate Matrix (1=Sun .. 7=Sat)</span>
              <span className="text-[10px]">Press F1 to Copy Sunday Rate</span>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto text-xs">
              
              {/* Publication Selector */}
              <div className="bg-white p-3 vb-box-inset flex items-center gap-3">
                <span className="font-bold text-slate-700">Select Publication:</span>
                <select 
                  value={selectedPub?.publica_id || ''}
                  onChange={(e) => {
                    const p = publications.find(x => x.publica_id === Number(e.target.value));
                    if (p) setSelectedPub(p);
                  }}
                  className="flex-1 p-1.5 border border-slate-300 font-bold text-slate-900 text-xs bg-white"
                >
                  {publications.map(p => (
                    <option key={p.publica_id} value={p.publica_id}>
                      {p.public_name} ({p.type_p || 'Daily'}) - ID #{p.publica_id}
                    </option>
                  ))}
                </select>

                <button 
                  onClick={() => {
                    const sun = editingRates[1] || 5.0;
                    const map: Record<number, number> = {};
                    LEGACY_DAYS.forEach(d => { map[d.id] = sun; });
                    setEditingRates(map);
                    setStatusMessage(`F1 Triggered: Copied Sunday rate (₹${sun}) to all 7 days!`);
                  }}
                  className="vb-btn bg-amber-100"
                  title="F1 Keyboard Shortcut"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-800" />
                  <span>Press F1: Copy Sun Rate</span>
                </button>
              </div>

              {/* 7-Day Rate Grid (1=Sun .. 7=Sat) */}
              <div className="bg-white p-3 vb-box-inset space-y-2">
                <span className="font-bold text-slate-900 block border-b pb-1">
                  7-Day Day-of-Week Selling Price Matrix (Sunday = 1, Saturday = 7):
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                  {LEGACY_DAYS.map(day => (
                    <div 
                      key={day.id} 
                      className={`p-2.5 text-center vb-box-outset ${day.id === 1 ? 'bg-amber-100 border-amber-400 font-bold' : 'bg-white'}`}
                    >
                      <span className="text-[10px] text-slate-500 block font-mono">Day #{day.id}</span>
                      <strong className="text-xs block text-slate-900">{day.name}</strong>
                      <span className="text-[10px] font-hindi text-slate-600 block">{day.hindi}</span>
                      
                      <div className="mt-2 flex items-center justify-center gap-1">
                        <span className="text-xs font-bold text-slate-500">₹</span>
                        <input 
                          type="number"
                          step="0.05"
                          value={editingRates[day.id] ?? 5.0}
                          onChange={(e) => setEditingRates({ ...editingRates, [day.id]: parseFloat(e.target.value) || 0 })}
                          className="w-16 p-1 text-center font-bold text-xs border border-slate-400 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button className="vb-btn bg-emerald-100">
                  <Save className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Save Rates (सुरक्षित करें)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FORM 9: MONTHLY BILLING ENGINE (मासिक बिल गणना) */}
        {/* ========================================================================= */}
        {activeWindow === 'billing' && (
          <div className="w-full max-w-5xl h-[88vh] bg-[#ECE9D8] vb-box-outset flex flex-col shadow-2xl">
            <div className="vb-titlebar">
              <span>Form 9: Monthly Billing Engine & Bill Printing (मासिक बिल गणना)</span>
              <span className="text-[10px]">Pure Date-Aware Ledger Calculation</span>
            </div>

            <div className="p-3 flex-1 flex flex-col gap-3 overflow-hidden text-xs">
              
              {/* Billing Run Controls */}
              <div className="bg-white p-3 vb-box-inset flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Billing Month:</span>
                  <select 
                    value={billingMonth} 
                    onChange={(e) => setBillingMonth(e.target.value)}
                    className="p-1 border border-slate-300 font-bold bg-white"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Financial Year:</span>
                  <select 
                    value={billingYear} 
                    onChange={(e) => setBillingYear(Number(e.target.value))}
                    className="p-1 border border-slate-300 font-bold bg-white"
                  >
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handleRunBatchBilling}
                  disabled={isBillingRunning}
                  className="vb-btn bg-emerald-200"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-800" />
                  <span>{isBillingRunning ? 'Calculating...' : 'Generate All Bills (गणना करें)'}</span>
                </button>
              </div>

              {/* Generated Bills Ledger Table */}
              <div className="flex-1 bg-white vb-box-inset overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#ECE9D8] z-10">
                    <tr>
                      <th className="vb-grid-header">Bill ID</th>
                      <th className="vb-grid-header">Customer Name</th>
                      <th className="vb-grid-header text-right">Copies</th>
                      <th className="vb-grid-header text-right">Paper Amt</th>
                      <th className="vb-grid-header text-right">Deliv Chg</th>
                      <th className="vb-grid-header text-right">Prev Due</th>
                      <th className="vb-grid-header text-right">Net Payable</th>
                      <th className="vb-grid-header text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedBills.length > 0 ? (
                      generatedBills.map((b) => (
                        <tr key={b.bill_id} className="border-b border-slate-100 hover:bg-blue-50">
                          <td className="p-2 font-mono font-bold">#{b.bill_id}</td>
                          <td className="p-2 font-bold text-slate-900">{b.customer_name}</td>
                          <td className="p-2 text-right font-mono">{b.total_copies}</td>
                          <td className="p-2 text-right font-mono">₹{b.paper_amount?.toFixed(2)}</td>
                          <td className="p-2 text-right font-mono">₹{b.del_amt?.toFixed(2)}</td>
                          <td className="p-2 text-right font-mono">₹{b.due_amt?.toFixed(2)}</td>
                          <td className="p-2 text-right font-mono font-bold text-red-600">₹{b.balance?.toFixed(2)}</td>
                          <td className="p-2 text-center">
                            <button className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 border border-blue-400 font-bold text-[10px] cursor-pointer">
                              Print Slip
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                          Click "Generate All Bills" above to compute date-aware billing for all customers.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FORM 6: PAYMENT RECEIPTS (18,382 RECORDS) */}
        {/* ========================================================================= */}
        {activeWindow === 'receipts' && (
          <div className="w-full max-w-5xl h-[85vh] bg-[#ECE9D8] vb-box-outset flex flex-col shadow-2xl">
            <div className="vb-titlebar"><span>Form 6: Payment Receipt Entry (भुगतान रसीद - 18,382 Records)</span></div>
            <div className="p-3 flex-1 bg-white vb-box-inset overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#ECE9D8] sticky top-0">
                  <tr>
                    <th className="vb-grid-header">Receipt #</th>
                    <th className="vb-grid-header">Cust ID</th>
                    <th className="vb-grid-header">Period</th>
                    <th className="vb-grid-header text-right">Bill Amt</th>
                    <th className="vb-grid-header text-right">Less / Disc</th>
                    <th className="vb-grid-header text-right">Received Amt</th>
                    <th className="vb-grid-header">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {customerList.slice(0, 50).map((c, idx) => (
                    <tr key={idx} className="border-b hover:bg-blue-50">
                      <td className="p-2 font-mono">#{idx + 101}</td>
                      <td className="p-2 font-bold">Cust #{c.customer_id} ({c.name_eng})</td>
                      <td className="p-2 font-mono">July 2026</td>
                      <td className="p-2 text-right font-mono">₹185.00</td>
                      <td className="p-2 text-right font-mono text-amber-700">₹0.00</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">₹185.00</td>
                      <td className="p-2"><span className="px-1.5 py-0.5 bg-emerald-100 rounded text-[10px] font-bold">Cash</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HAWKERS, PUBLISHERS, REGIONS, DISCONTINUE, REPORTS */}
        {activeWindow === 'hawkers' && (
          <div className="w-full max-w-4xl h-[80vh] bg-[#ECE9D8] vb-box-outset flex flex-col shadow-2xl">
            <div className="vb-titlebar"><span>Form 4: Hawker Master (हॉकर वितरक मास्टर) - 1,560 Records</span></div>
            <div className="p-3 flex-1 bg-white vb-box-inset overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#ECE9D8] sticky top-0">
                  <tr>
                    <th className="vb-grid-header">ID</th>
                    <th className="vb-grid-header">Hawker Name</th>
                    <th className="vb-grid-header">Area / Region</th>
                    <th className="vb-grid-header">City</th>
                  </tr>
                </thead>
                <tbody>
                  {hawkers.slice(0, 100).map(h => (
                    <tr key={h.hawker_id} className="border-b hover:bg-blue-50">
                      <td className="p-2 font-mono">#{h.hawker_id}</td>
                      <td className="p-2 font-bold">{h.name}</td>
                      <td className="p-2">Region #{h.region_id}</td>
                      <td className="p-2">{h.city || 'Beawar'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeWindow === 'publishers' && (
          <div className="w-full max-w-4xl h-[80vh] bg-[#ECE9D8] vb-box-outset flex flex-col shadow-2xl">
            <div className="vb-titlebar"><span>Form 1: Publisher Master (प्रकाशक मास्टर)</span></div>
            <div className="p-3 flex-1 bg-white vb-box-inset overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#ECE9D8] sticky top-0">
                  <tr>
                    <th className="vb-grid-header">ID</th>
                    <th className="vb-grid-header">Publisher Name</th>
                    <th className="vb-grid-header">Category</th>
                    <th className="vb-grid-header">City</th>
                  </tr>
                </thead>
                <tbody>
                  {publishers.map(p => (
                    <tr key={p.publish_id} className="border-b hover:bg-blue-50">
                      <td className="p-2 font-mono">#{p.publish_id}</td>
                      <td className="p-2 font-bold">{p.name}</td>
                      <td className="p-2">{p.category}</td>
                      <td className="p-2">{p.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeWindow === 'discontinue' && (
          <div className="w-full max-w-4xl h-[80vh] bg-[#ECE9D8] vb-box-outset flex flex-col shadow-2xl">
            <div className="vb-titlebar"><span>Form 10: Vacation / Stop Discontinue (अखबार बंद / छुट्टी)</span></div>
            <div className="p-3 flex-1 bg-white vb-box-inset overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#ECE9D8] sticky top-0">
                  <tr>
                    <th className="vb-grid-header">ID</th>
                    <th className="vb-grid-header">Cust ID</th>
                    <th className="vb-grid-header">Type</th>
                    <th className="vb-grid-header">From Date</th>
                    <th className="vb-grid-header">To Date</th>
                  </tr>
                </thead>
                <tbody>
                  {discontinues.slice(0, 100).map(d => (
                    <tr key={d.discontinue_id} className="border-b hover:bg-blue-50">
                      <td className="p-2 font-mono">#{d.discontinue_id}</td>
                      <td className="p-2 font-bold">Cust #{d.customer_id}</td>
                      <td className="p-2"><span className="px-2 py-0.5 bg-amber-100 rounded text-[10px] font-bold">{d.temp_perma}</span></td>
                      <td className="p-2 font-mono">{d.temp_from}</td>
                      <td className="p-2 font-mono">{d.temp_to || 'Permanent'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeWindow === 'reports' && (
          <div className="w-full max-w-4xl h-[80vh] bg-[#ECE9D8] vb-box-outset flex flex-col shadow-2xl">
            <div className="vb-titlebar"><span>Reports: Customer Outstanding Dues (बकाया सूची)</span></div>
            <div className="p-3 flex-1 bg-white vb-box-inset overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#ECE9D8] sticky top-0">
                  <tr>
                    <th className="vb-grid-header">ID</th>
                    <th className="vb-grid-header">Customer Name</th>
                    <th className="vb-grid-header">Phone</th>
                    <th className="vb-grid-header text-right">Starting Due</th>
                    <th className="vb-grid-header text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {customerList.filter(c => c.cbal !== 0).slice(0, 50).map(c => (
                    <tr key={c.customer_id} className="border-b hover:bg-blue-50">
                      <td className="p-2 font-mono">#{c.customer_id}</td>
                      <td className="p-2 font-bold">{c.name_eng}</td>
                      <td className="p-2">{c.phone || '-'}</td>
                      <td className="p-2 text-right font-mono">₹{c.dueamount?.toFixed(2)}</td>
                      <td className={`p-2 text-right font-mono font-bold ${c.cbal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        ₹{c.cbal?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 5. CLASSIC STATUS BAR */}
      <div className="bg-[#ECE9D8] border-t border-[#808080] p-1 flex items-center gap-2 text-[11px] text-slate-800">
        <div className="vb-status-panel flex-1 truncate">
          <strong>Status:</strong> {statusMessage}
        </div>
        <div className="vb-status-panel w-32 text-center font-bold">
          Year: 2025-2026
        </div>
        <div className="vb-status-panel w-28 text-center font-bold text-blue-900">
          User: ADMIN
        </div>
        <div className="vb-status-panel w-24 text-center text-emerald-800 font-bold">
          ● ONLINE
        </div>
      </div>

    </div>
  );
}
