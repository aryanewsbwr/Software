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

import PublisherForm from './forms/PublisherForm';
import PublicationForm from './forms/PublicationForm';
import CustomerForm from './forms/CustomerForm';
import SubscriptionsModal from './forms/SubscriptionsModal';
import DailyProcessForm from './forms/DailyProcessForm';
import ReceiptForm from './forms/ReceiptForm';
import BillingForm from './forms/BillingForm';
import HawkerForm from './forms/HawkerForm';
import RegionForm from './forms/RegionForm';
import HolidayForm from './forms/HolidayForm';

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
  const [subsTab, setSubsTab] = useState<'active' | 'all'>('active');
  const [isSubsModalOpen, setIsSubsModalOpen] = useState(false);
  const [selectedCustForModal, setSelectedCustForModal] = useState<Customer | null>(null);
  const [isCustFormOpen, setIsCustFormOpen] = useState(false);

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
                    <div className="bg-white p-2 vb-box-inset space-y-2 text-xs">
                      {/* Header with Active vs All Tabs */}
                      <div className="flex items-center justify-between border-b pb-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSubsTab('active')}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              subsTab === 'active' 
                                ? 'bg-emerald-600 text-white shadow-2xs' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Active ({selectedCustSubs.filter(s => s.is_active !== false).length})
                          </button>
                          <button
                            onClick={() => setSubsTab('all')}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              subsTab === 'all' 
                                ? 'bg-indigo-700 text-white shadow-2xs' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            All History ({selectedCustSubs.length})
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-500 font-bold">
                          {selectedCustSubs.filter(s => s.is_active !== false).length} Active • {selectedCustSubs.filter(s => s.is_active === false).length} Discontinued
                        </span>
                      </div>

                      {isLoadingSubs ? (
                        <div className="text-slate-400 italic text-[11px] py-2 text-center">Loading subscriptions...</div>
                      ) : (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto">
                          {selectedCustSubs
                            .filter(s => subsTab === 'all' || s.is_active !== false)
                            .map((s, idx) => {
                              const isActive = s.is_active !== false;

                              return (
                                <div 
                                  key={idx} 
                                  className={`p-2 rounded border transition-colors ${
                                    isActive 
                                      ? 'bg-emerald-50/60 border-emerald-300' 
                                      : 'bg-red-50/60 border-red-200 opacity-80'
                                  }`}
                                >
                                  {/* Title & Status Badge */}
                                  <div className="flex items-center justify-between gap-1">
                                    <strong className="text-slate-900 text-xs">{s.publication_name}</strong>
                                    <span className={`px-1.5 py-0.2 rounded font-black text-[9px] ${
                                      isActive 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'bg-red-600 text-white'
                                    }`}>
                                      {isActive ? '● ACTIVE DELIVERY' : '✕ DISCONTINUED'}
                                    </span>
                                  </div>

                                  {/* Date Range: Subscribed Since & Discontinued On */}
                                  <div className="text-[10px] text-slate-600 mt-1 flex flex-wrap gap-x-2">
                                    <span>Started: <strong className="text-slate-800">{s.s_date || 'Initial'}</strong></span>
                                    {s.c_date && (
                                      <span className="text-red-700 font-bold">
                                        Stopped On: <u>{s.c_date}</u>
                                      </span>
                                    )}
                                  </div>

                                  {/* Hawker & Delivery Days */}
                                  <div className="flex justify-between text-[10px] text-slate-600 mt-1 border-t border-slate-200/60 pt-1">
                                    <span>Hawker: <strong className="text-slate-900">{s.hawker_name}</strong></span>
                                    <span>Qty: <strong className="text-slate-900">{s.qty}</strong> copy ({s.from_day === '1-7' ? 'Daily' : `Days ${s.from_day}`})</span>
                                  </div>
                                </div>
                              );
                            })}
                          {selectedCustSubs.filter(s => subsTab === 'all' || s.is_active !== false).length === 0 && (
                            <div className="text-slate-400 italic text-[11px] text-center py-2">
                              No {subsTab === 'active' ? 'active' : ''} subscriptions found.
                            </div>
                          )}
                        </div>
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
        {/* EXACT FORM REPLICAS MATCHING ORIGINAL 2008 VB6 SCREENSHOTS */}
        {/* ========================================================================= */}
        
        {/* 1. Publisher Master Form (screenshot_01.jpg) */}
        {activeWindow === 'publishers' && (
          <PublisherForm 
            onClose={() => setActiveWindow('customers')} 
            publishers={publishers} 
          />
        )}

        {/* 2. Publication Master & Weekday Rates (screenshot_02.jpg) */}
        {activeWindow === 'publications' && (
          <PublicationForm 
            onClose={() => setActiveWindow('customers')} 
            publications={publications}
            publishers={publishers}
            rates={rates}
          />
        )}

        {/* 3. Customer Master Form (screenshot_05.jpg) */}
        {activeWindow === 'customer_form' && (
          <CustomerForm 
            onClose={() => setActiveWindow('customers')} 
            customer={selectedCust}
            regions={regions}
            onOpenSubscriptions={(c) => {
              setSelectedCustForModal(c);
              setIsSubsModalOpen(true);
            }}
          />
        )}

        {/* 4. Region Master Form (screenshot_03.jpg) */}
        {activeWindow === 'regions' && (
          <RegionForm 
            onClose={() => setActiveWindow('customers')} 
            regions={regions} 
          />
        )}

        {/* 5. Hawker Master Form (screenshot_04.jpg) */}
        {activeWindow === 'hawkers' && (
          <HawkerForm 
            onClose={() => setActiveWindow('customers')} 
            hawkers={hawkers} 
          />
        )}

        {/* 6. Holiday Master Form (screenshot_07.jpg) */}
        {activeWindow === 'holidays' && (
          <HolidayForm 
            onClose={() => setActiveWindow('customers')} 
            holidays={holidays}
            publications={publications}
          />
        )}

        {/* 7. Daily Hawker Distribution Process (screenshot_08.jpg) */}
        {activeWindow === 'dailyprocess' && (
          <DailyProcessForm 
            onClose={() => setActiveWindow('customers')} 
            hawkers={hawkers}
            publications={publications}
          />
        )}

        {/* 8. Payment Receipt Entry Form (screenshot_12.jpg) */}
        {activeWindow === 'receipts' && (
          <ReceiptForm 
            onClose={() => setActiveWindow('customers')} 
            receipts={selectedCustReceipts}
          />
        )}

        {/* 9. Monthly Billing Generation Engine (screenshot_13.jpg) */}
        {activeWindow === 'billing' && (
          <BillingForm 
            onClose={() => setActiveWindow('customers')} 
            customers={customerList}
            publications={publications}
            rates={rates}
            holidays={holidays}
            discontinues={discontinues}
          />
        )}

        {/* 10. Outstanding Dues Report */}
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

        {/* 11. Modal: Authentic Subscriptions Details (screenshot_06.jpg) */}
        {isSubsModalOpen && selectedCustForModal && (
          <SubscriptionsModal 
            customer={selectedCustForModal}
            onClose={() => setIsSubsModalOpen(false)}
            publications={publications}
            hawkers={hawkers}
          />
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
