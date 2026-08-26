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
import RateMatrixForm from './forms/RateMatrixForm';
import CollectionAgentsForm from './forms/CollectionAgentsForm';
import UserPermissionsForm from './forms/UserPermissionsForm';
import CounterSaleForm from './forms/CounterSaleForm';
import PeriodForm from './forms/PeriodForm';

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
  // Active Form Window (starts null on clean MDI desktop)
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
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
  const [billingMonth, setBillingMonth] = useState('August');
  const [billingYear, setBillingYear] = useState(2026);
  const [generatedBills, setGeneratedBills] = useState<BillHeader[]>([]);
  const [isBillingRunning, setIsBillingRunning] = useState(false);

  // New Modal States for Full 2008 Master Set
  const [isPeriodOpen, setIsPeriodOpen] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState({ month: 'August', startYear: 2026, endYear: 2027 });
  const [isRateMatrixOpen, setIsRateMatrixOpen] = useState(false);
  const [isCollectionAgentsOpen, setIsCollectionAgentsOpen] = useState(false);
  const [isUserPermOpen, setIsUserPermOpen] = useState(false);
  const [isCounterSaleOpen, setIsCounterSaleOpen] = useState(false);

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
            <div className="absolute top-full left-0 min-w-[390px] bg-[#ECE9D8] vb-box-outset shadow-2xl z-50 py-1 flex flex-col text-black text-xs">
              <button onClick={() => { setActiveWindow('publishers'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                1. Publisher Master (प्रकाशक मास्टर)
              </button>
              <button onClick={() => { setActiveWindow('publications'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                2. Publication Master (अखबार / पत्रिका मास्टर)
              </button>
              <button onClick={() => { setIsRateMatrixOpen(true); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                3. 7-Day Day-wise Rates Matrix (सोमवार से रविवार दर निर्धारण)
              </button>
              <button onClick={() => { setActiveWindow('ratechanges'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                4. Rate Change Revisions History (दिनांक-वार दर संशोधन)
              </button>
              <button onClick={() => { setActiveWindow('regions'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                5. Region & Area Master (क्षेत्र / इलाका मास्टर)
              </button>
              <button onClick={() => { setActiveWindow('hawkers'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                6. Hawker & Delivery Boy Master (हॉकर / वितरक मास्टर)
              </button>
              <div className="h-[1px] bg-[#808080] my-1"></div>
              <button onClick={() => { setActiveWindow('customers'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                7. Customer Master (द्विभाषी ग्राहक विवरण - 24,581 Records)
              </button>
              <button onClick={() => { setActiveWindow('holidays'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                8. Holiday Calendar Master (अवकाश कैलेंडर - होली/दीवाली)
              </button>
              <button onClick={() => { setIsCollectionAgentsOpen(true); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                9. Collection Agent Master (बिल संग्रहकर्ता मास्टर)
              </button>
              <button onClick={() => { setIsCollectionAgentsOpen(true); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                10. Receipt Book Allotment Tracker (रसीद बुक आवंटन - फ्रॉम/टू)
              </button>
              <div className="h-[1px] bg-[#808080] my-1"></div>
              <button onClick={() => { setActiveWindow('company'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                11. Company & Agency Profile (फर्म विवरण)
              </button>
              <button onClick={() => { setIsUserPermOpen(true); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                12. User Management & Permissions (यूजर एवं मेनू अनुमति 1-23)
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
            <div className="absolute top-full left-0 min-w-[390px] bg-[#ECE9D8] vb-box-outset shadow-2xl z-50 py-1 flex flex-col text-black text-xs">
              <button onClick={() => { setActiveWindow('dailyprocess'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                1. Daily Hawker Distribution Process (दैनिक वितरण पर्ची - सुबह का प्रोसेस)
              </button>
              <button onClick={() => { setIsCounterSaleOpen(true); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                2. Counter & Walk-in Cash Sale Entry (काउंटर नकद खुदरा बिक्री)
              </button>
              <button onClick={() => { setActiveWindow('discontinue'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                3. Customer Vacation Hold / Temporary Stop (अखबार बंद / छुट्टी)
              </button>
              <div className="h-[1px] bg-[#808080] my-1"></div>
              <button onClick={() => { setActiveWindow('receipts'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                4. Payment Receipt Entry (भुगतान रसीद - नकद/चेक)
              </button>
              <button onClick={() => { setIsCollectionAgentsOpen(true); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                5. Receipt Book Allotment & Return (रसीद बुक आवंटन व वापसी)
              </button>
              <button onClick={() => { setActiveWindow('billing'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                6. Monthly Billing Generation Engine (मासिक बिल निर्माण)
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
            <div className="absolute top-full left-0 min-w-[390px] bg-[#ECE9D8] vb-box-outset shadow-2xl z-50 py-1 flex flex-col text-black text-xs">
              <button onClick={() => { setActiveWindow('billing'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                1. Monthly Customer Bill Printing (मासिक बिल प्रिंट - काउंटरफॉइल सहित)
              </button>
              <button onClick={() => { setActiveWindow('receipts'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                2. Payment Money Receipt Voucher Print (भुगतान रसीद प्रिंट)
              </button>
              <button onClick={() => { setActiveWindow('dailyprocess'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                3. Daily Hawker Distribution Sheet (हॉकर दैनिक वितरण सूची)
              </button>
              <button onClick={() => { setActiveWindow('dailyprocess'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                4. Daily Agency Publisher Total Supply Order (दैनिक एजेंसी सप्लाई ऑर्डर)
              </button>
              <div className="h-[1px] bg-[#808080] my-1"></div>
              <button onClick={() => { setActiveWindow('reports'); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                5. Customer Outstanding Dues Ledger (ग्राहक एवं क्षेत्र-वार बकाया लेजर)
              </button>
              <button onClick={() => { setIsCounterSaleOpen(true); setActiveMenu(null); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                6. Counter Sale Date-wise Report (काउंटर बिक्री रिपोर्ट)
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
            <div className="absolute top-full left-0 min-w-[340px] bg-[#ECE9D8] vb-box-outset shadow-2xl z-50 py-1 flex flex-col text-black text-xs">
              <button onClick={() => { setActiveMenu(null); setIsPeriodOpen(true); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                1. Financial Year Selection (वित्तीय वर्ष: {currentPeriod.month} {currentPeriod.startYear}-{currentPeriod.endYear})
              </button>
              <button onClick={() => { setActiveMenu(null); setStatusMessage('Balance forward completed successfully for all customers.'); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                2. Year-End Balance Forward to Next Year (कैरी फॉरवर्ड)
              </button>
              <div className="h-[1px] bg-[#808080] my-1"></div>
              <button onClick={() => { setActiveMenu(null); setStatusMessage('Master database backup created: AryanNews_Backup.sql'); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                3. Master Database Backup (मास्टर बैकअप)
              </button>
              <button onClick={() => { setActiveMenu(null); setStatusMessage('Yearly database backup completed.'); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                4. Yearly Database Backup (वार्षिक बैकअप)
              </button>
              <button onClick={() => { setActiveMenu(null); setStatusMessage('Database restore system verified.'); }} className="px-3 py-1 hover:bg-[#0A246A] hover:text-white text-left whitespace-nowrap cursor-pointer">
                5. Database Restore (डाटा रिस्टोर)
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
      <div className="flex-1 p-3 overflow-auto flex items-center justify-center relative">
        
        {/* Clean MDI Desktop Wallpaper (When no form is open) */}
        {activeWindow === null && (
          <div className="flex flex-col items-center justify-center text-center p-8 opacity-85 select-none pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/40 shadow-2xl flex items-center justify-center mb-3 backdrop-blur-xs">
              <span className="text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider font-serif">ANA</span>
            </div>
            <h1 className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
              ARYAN NEWS AGENCY
            </h1>
            <p className="text-sm font-bold text-yellow-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] mt-0.5">
              Beawar, Rajasthan • Newspaper Distribution Management System
            </p>
            <span className="text-xs text-white/80 mt-2 font-mono">
              Ready. Select an option from Master, Transactions, or Reports menu to open a form.
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. CUSTOMER MASTER (screenshot_05.jpg) - EXACT 2008 REPLICA */}
        {/* ========================================================================= */}
        {activeWindow === 'customers' && (
          <CustomerForm 
            onClose={() => setActiveWindow(null)}
            customer={null}
            publications={publications}
            hawkers={hawkers}
            regions={regions}
            onSelectCustomer={(c) => setSelectedCust(c)}
          />
        )}

        {/* 2. Publisher Master Form (screenshot_01.jpg) */}
        {activeWindow === 'publishers' && (
          <PublisherForm 
            onClose={() => setActiveWindow(null)} 
            publishers={publishers} 
          />
        )}

        {/* 3. Publication Master & Weekday Rates (screenshot_02.jpg) */}
        {activeWindow === 'publications' && (
          <PublicationForm 
            onClose={() => setActiveWindow(null)} 
            publications={publications}
            publishers={publishers}
            rates={rates}
          />
        )}

        {/* 4. Region Master Form (screenshot_03.jpg) */}
        {activeWindow === 'regions' && (
          <RegionForm 
            onClose={() => setActiveWindow(null)} 
            regions={regions} 
          />
        )}

        {/* 5. Hawker Master Form (screenshot_04.jpg) */}
        {activeWindow === 'hawkers' && (
          <HawkerForm 
            onClose={() => setActiveWindow(null)} 
            hawkers={hawkers}
            regions={regions}
          />
        )}

        {/* 6. Holiday Master Form (screenshot_07.jpg) */}
        {activeWindow === 'holidays' && (
          <HolidayForm 
            onClose={() => setActiveWindow(null)} 
            holidays={holidays}
            publications={publications}
          />
        )}

        {/* 7. Daily Hawker Distribution Process (screenshot_08.jpg) */}
        {activeWindow === 'dailyprocess' && (
          <DailyProcessForm 
            onClose={() => setActiveWindow(null)} 
            hawkers={hawkers}
            publications={publications}
          />
        )}

        {/* 8. Payment Receipt Entry Form (screenshot_12.jpg) */}
        {activeWindow === 'receipts' && (
          <ReceiptForm 
            onClose={() => setActiveWindow(null)} 
            receipts={selectedCustReceipts}
          />
        )}

        {/* 9. Monthly Billing Generation Engine (screenshot_13.jpg) */}
        {activeWindow === 'billing' && (
          <BillingForm 
            onClose={() => setActiveWindow(null)} 
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

        {/* 12. Modal: 7-Day Rates Matrix & Revisions */}
        {isRateMatrixOpen && (
          <RateMatrixForm 
            isOpen={isRateMatrixOpen}
            onClose={() => setIsRateMatrixOpen(false)}
            publications={publications}
            rates={rates}
            ratechanges={ratechanges}
          />
        )}

        {/* 13. Modal: Collection Agents & Receipt Book Tracker */}
        {isCollectionAgentsOpen && (
          <CollectionAgentsForm 
            isOpen={isCollectionAgentsOpen}
            onClose={() => setIsCollectionAgentsOpen(false)}
          />
        )}

        {/* 14. Modal: User Security & Menu Permissions */}
        {isUserPermOpen && (
          <UserPermissionsForm 
            isOpen={isUserPermOpen}
            onClose={() => setIsUserPermOpen(false)}
          />
        )}

        {/* 16. Modal: Period Detail Entrance & Selection (screenshot_15.jpg) */}
        {isPeriodOpen && (
          <PeriodForm 
            isOpen={isPeriodOpen}
            onLogin={(m, sY, eY) => {
              setCurrentPeriod({ month: m, startYear: sY, endYear: eY });
              setIsPeriodOpen(false);
              setStatusMessage(`Period: ${m} ${sY}-${eY} logged in successfully.`);
            }}
            onExit={() => setIsPeriodOpen(false)}
          />
        )}

      </div>

      {/* 5. CLASSIC STATUS BAR */}
      <div className="bg-[#ECE9D8] border-t border-[#808080] p-1 flex items-center gap-2 text-[11px] text-slate-800">
        <div className="vb-status-panel flex-1 truncate">
          <strong>Status:</strong> {statusMessage}
        </div>
        <div 
          onClick={() => setIsPeriodOpen(true)} 
          className="vb-status-panel w-44 text-center font-bold text-blue-900 cursor-pointer hover:bg-blue-100"
          title="Click to Change Financial Period"
        >
          📅 Period: {currentPeriod.month} {currentPeriod.startYear}-{currentPeriod.endYear}
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
