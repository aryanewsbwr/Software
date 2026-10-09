'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Customer, Region } from '@/lib/types';

interface ReceiptFormProps {
  onClose: () => void;
}

interface AllotmentInfo {
  sno: number;
  collector_name: string;
  receipt_from: number;
  receipt_to: number;
  allot_date: string;
  rec_date?: string | null;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December', 'Sept', 'Aug', 'Dues'
];

export default function ReceiptForm({ onClose }: ReceiptFormProps) {
  const now = new Date();
  const defDateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  // Top Customer & Collection States
  const [priorityId, setPriorityId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [regionName, setRegionName] = useState('');
  
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allRegions, setAllRegions] = useState<Region[]>([]);
  const [filteredCustomerSuggestions, setFilteredCustomerSuggestions] = useState<Customer[]>([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [highlightedCustomerIndex, setHighlightedCustomerIndex] = useState(0);

  // Collection Agent & Active Range
  const [collectionAgentName, setCollectionAgentName] = useState('dukan');
  const [collectors, setCollectors] = useState<{ collect_id: number; name: string }[]>([]);
  const [allotments, setAllotments] = useState<AllotmentInfo[]>([]);
  const [activeBookRange, setActiveBookRange] = useState('');

  // Middle Grids States
  const [customerBills, setCustomerBills] = useState<any[]>([]);
  const [customerReceipts, setCustomerReceipts] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | number | null>(null);

  // Control Section States
  const [receiptNo, setReceiptNo] = useState<number>(1196605);
  const [receiptDate, setReceiptDate] = useState(defDateStr);
  const [billNo, setBillNo] = useState('');
  const [year, setYear] = useState('2026');
  const [month, setMonth] = useState('Sept');
  
  const [billAmt, setBillAmt] = useState<number>(0);
  const [manualRcpAmt, setManualRcpAmt] = useState<number>(0);
  const [lessAmt, setLessAmt] = useState<number>(0);
  const [revAmt, setRevAmt] = useState<number>(0);
  const [manualRecpNo, setManualRecpNo] = useState('');
  const [manualRecpDate, setManualRecpDate] = useState(defDateStr);
  
  const [totalCustomerDue, setTotalCustomerDue] = useState<number>(0);
  const [narration, setNarration] = useState('');
  
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Cheque'>('Cash');
  const [chequeNo, setChequeNo] = useState('');
  const [chequeDate, setChequeDate] = useState('');

  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for keyboard shortcuts & Enter navigation
  const customerInputRef = useRef<HTMLInputElement>(null);
  const customerIdRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const billNoRef = useRef<HTMLInputElement>(null);
  const billAmtRef = useRef<HTMLInputElement>(null);
  const manualRcpAmtRef = useRef<HTMLInputElement>(null);
  const lessAmtRef = useRef<HTMLInputElement>(null);
  const revAmtRef = useRef<HTMLInputElement>(null);
  const manualRecpNoRef = useRef<HTMLInputElement>(null);
  const manualRecpDateRef = useRef<HTMLInputElement>(null);
  const chequeNoRef = useRef<HTMLInputElement>(null);
  const chequeDateRef = useRef<HTMLInputElement>(null);
  const applyBtnRef = useRef<HTMLButtonElement>(null);

  // 1. Initial Load: Next Receipt Number, Customers, Regions, Collectors & Allotments
  useEffect(() => {
    // Focus customer search box immediately on mount
    if (customerInputRef.current) {
      customerInputRef.current.focus();
    }

    // Load next receipt number
    supabase
      .from('receipt20262027')
      .select('recp_no, receipt_no, id, Receipt_id', { count: 'exact' })
      .order('id', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const highestNo = Number(data[0].recp_no || data[0].receipt_no || data[0].Receipt_id || data[0].id) || 1196604;
          setReceiptNo(highestNo + 1);
        } else {
          setReceiptNo(1196605);
        }
      });

    // Load Collectors Master
    supabase
      .from('collect')
      .select('*')
      .order('Collect_id', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const list = data.map((c: any) => ({
            collect_id: c.Collect_id || c.collect_id || c.id,
            name: c.name || c.collector_name || `Collector #${c.Collect_id}`
          }));
          setCollectors(list);
        }
      });

    // Load Regions Master
    supabase
      .from('region')
      .select('*')
      .order('region_id', { ascending: true })
      .then(({ data }) => {
        if (data) setAllRegions(data);
      });

    // Load All Customers Master for instant typeahead search
    supabase
      .from('customer')
      .select('*')
      .order('priority', { ascending: true })
      .then(({ data }) => {
        if (data) setAllCustomers(data);
      });

    // Load Receipt Allotments for Active Range Display
    fetch('/api/receipt-allotment')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.all_allotments) {
          setAllotments(data.all_allotments);
          updateActiveBookRange('dukan', data.all_allotments);
        }
      })
      .catch(err => console.warn('Could not load allotments:', err));
  }, []);

  // Update active book range badge for selected collector
  const updateActiveBookRange = (cName: string, allotsList: AllotmentInfo[] = allotments) => {
    const matched = allotsList.filter(a => (a.collector_name || '').toLowerCase() === cName.toLowerCase());
    if (matched && matched.length > 0) {
      // Find latest or active book
      const active = matched.find(a => !a.rec_date || a.rec_date === '-') || matched[0];
      setActiveBookRange(`${active.receipt_from} - ${active.receipt_to}`);
    } else {
      setActiveBookRange('');
    }
  };

  const handleCollectorChange = (name: string) => {
    setCollectionAgentName(name);
    updateActiveBookRange(name);
  };

  // Close customer dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Customer Typeahead Filter
  const handleCustomerSearchChange = (query: string) => {
    setCustomerSearchQuery(query);
    if (!query.trim()) {
      setFilteredCustomerSuggestions([]);
      setIsCustomerDropdownOpen(false);
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = allCustomers.filter(c => 
      (c.name_eng || '').toLowerCase().includes(q) ||
      (c.name_hindi || '').toLowerCase().includes(q) ||
      String(c.customer_id).includes(q) ||
      String(c.priority).includes(q)
    ).slice(0, 15);

    setFilteredCustomerSuggestions(matches);
    setHighlightedCustomerIndex(0);
    setIsCustomerDropdownOpen(matches.length > 0);
  };

  // 3. Load Customer Details & Unpaid Bills & Previous Receipts
  const handleSelectCustomer = async (cust: Customer) => {
    setIsCustomerDropdownOpen(false);
    setCustomerSearchQuery(cust.name_eng || cust.name_hindi || '');
    setCustomerName(cust.name_eng || cust.name_hindi || '');
    setCustomerId(String(cust.customer_id));
    setPriorityId(cust.priority?.toString() || '');

    // Format address with phone
    const addrParts = [cust.add1, cust.add2, cust.hindi_add].filter(Boolean).join(' ').trim();
    const phonePart = cust.phone ? `    ${cust.phone}` : '';
    setCustomerAddress(addrParts ? `${addrParts}${phonePart}` : '---');

    // Region lookup
    if (cust.region_id && allRegions.length > 0) {
      const reg = allRegions.find(r => r.region_id === cust.region_id);
      setRegionName(reg ? (reg.region_name || reg.hindi_name || `SR${cust.region_id}`) : `SR${cust.region_id}`);
    } else {
      setRegionName(cust.region_id ? `SR${cust.region_id}` : 'SR2');
    }

    const due = Number(cust.due_amount ?? cust.dueamount ?? cust.cbal ?? 0);
    setTotalCustomerDue(due);

    // Fetch Bills & Receipts
    setIsLoadingHistory(true);
    try {
      // 1. Fetch Bills (billno20262027 or billno20252026)
      let bList: any[] = [];
      const { data: b26 } = await supabase
        .from('billno20262027')
        .select('*')
        .eq('customer_id', cust.customer_id)
        .order('bill_id', { ascending: true });

      if (b26 && b26.length > 0) {
        bList = b26;
      } else {
        const { data: b25 } = await supabase
          .from('billno20252026')
          .select('*')
          .eq('Customer_id', cust.customer_id)
          .order('Bill_id', { ascending: true });
        if (b25) bList = b25;
      }

      setCustomerBills(bList || []);

      // 2. Fetch Receipts (receipt20262027 or receipt20252026)
      let rList: any[] = [];
      const { data: r26 } = await supabase
        .from('receipt20262027')
        .select('*')
        .eq('customer_id', cust.customer_id)
        .order('id', { ascending: true });

      if (r26 && r26.length > 0) {
        rList = r26;
      } else {
        const { data: r25 } = await supabase
          .from('receipt20252026')
          .select('*')
          .eq('customer_id', cust.customer_id)
          .order('Receipt_id', { ascending: true });
        if (r25) rList = r25;
      }

      setCustomerReceipts(rList || []);

      // 3. Auto-select the latest/unpaid bill into Control Section
      if (bList && bList.length > 0) {
        const latestBill = bList[bList.length - 1];
        const bId = latestBill.bill_no || latestBill.bill_id || latestBill.Bill_id;
        setSelectedBillId(bId);
        setBillNo(String(bId));
        setMonth(latestBill.month || latestBill.Month || 'Sept');
        setYear(String(latestBill.year || latestBill.Year || '2026'));
        const amt = Number(latestBill.paper_amount || latestBill.balance || latestBill.Balance || latestBill.Bill_Amt || 150);
        setBillAmt(amt);
        setRevAmt(amt);
        setManualRcpAmt(amt);
      } else {
        setBillNo('');
        setBillAmt(due > 0 ? due : 0);
        setRevAmt(due > 0 ? due : 0);
        setManualRcpAmt(due > 0 ? due : 0);
      }

      // Automatically move focus to Mal. Recp. No for quick typing!
      setTimeout(() => {
        if (manualRecpNoRef.current) {
          manualRecpNoRef.current.focus();
        }
      }, 50);

    } catch (err) {
      console.error('Error fetching customer bills/receipts:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Lookup customer by ID directly
  const handleLookupCustomerId = (idStr: string) => {
    setCustomerId(idStr);
    const cid = parseInt(idStr, 10);
    if (!isNaN(cid) && allCustomers.length > 0) {
      const match = allCustomers.find(c => c.customer_id === cid);
      if (match) {
        handleSelectCustomer(match);
      }
    }
  };

  // 4. Select Bill from Left Grid
  const handleSelectBill = (b: any) => {
    const bId = b.bill_no?.toString() || b.bill_id?.toString() || b.Bill_id?.toString() || '';
    setSelectedBillId(bId);
    setBillNo(bId);
    setMonth(b.month || b.Month || 'Sept');
    setYear(String(b.year || b.Year || '2026'));
    const amt = Number(b.paper_amount || b.balance || b.Balance || b.Bill_Amt || 0);
    setBillAmt(amt);
    setRevAmt(amt);
    setManualRcpAmt(amt);
    if (manualRecpNoRef.current) manualRecpNoRef.current.focus();
  };

  // 5. Grid Totals Calculation (Footer)
  const totalBillsSum = useMemo(() => {
    return customerBills.reduce((acc, b) => acc + Number(b.paper_amount || b.balance || b.Balance || b.Bill_Amt || 0), 0);
  }, [customerBills]);

  const totalReceiptsReceivedSum = useMemo(() => {
    return customerReceipts.reduce((acc, r) => acc + Number(r.r_amt || r.mal_recp_amt || r.R_amt || 0), 0);
  }, [customerReceipts]);

  // Balance Calculations
  const calculatedRemainingBal = Math.max(0, Math.round((totalCustomerDue - revAmt - lessAmt) * 100) / 100);

  // 6. Save / Apply Receipt & Advance to Next Entry Instantly
  const handleApply = async () => {
    if (!customerId || !customerName) {
      setMsg({ text: 'Please select a customer first.', isError: true });
      if (customerInputRef.current) customerInputRef.current.focus();
      return;
    }
    if (revAmt <= 0 && lessAmt <= 0) {
      setMsg({ text: 'Please enter a valid Received Amount (Rev.Amt).', isError: true });
      if (revAmtRef.current) revAmtRef.current.focus();
      return;
    }

    setIsSaving(true);
    setMsg(null);

    try {
      const cid = parseInt(customerId, 10);
      const appliedReceiptNo = receiptNo;
      const appliedManualNo = manualRecpNo;
      const receiptData = {
        recp_no: appliedReceiptNo,
        recp_date: receiptDate || defDateStr,
        customer_id: cid,
        bill_no: billNo ? parseInt(billNo, 10) : null,
        bill_amt: billAmt || totalCustomerDue,
        less_amt: lessAmt,
        mal_recp_amt: revAmt,
        r_amt: revAmt,
        mal_rep_no: appliedManualNo || null,
        mal_recp_dt: manualRecpDate || receiptDate || defDateStr,
        month: month || 'Sept',
        year: year || '2026',
        cash_chq: paymentMode,
        cheque_no: paymentMode === 'Cheque' ? chequeNo : null,
        cheque_date: paymentMode === 'Cheque' ? chequeDate : null,
        balance: calculatedRemainingBal,
        remarks: narration || (collectionAgentName ? `Agent: ${collectionAgentName}` : '')
      };

      // 1. Insert into receipt20262027 (fallback to receipt20252026 if necessary)
      const { error: insertErr } = await supabase.from('receipt20262027').insert([receiptData]);
      if (insertErr) {
        await supabase.from('receipt20252026').insert([{
          Receipt_no: appliedReceiptNo,
          customer_id: cid,
          Bill_id: billNo ? parseInt(billNo, 10) : null,
          Bill_amt: billAmt || totalCustomerDue,
          Less_amt: lessAmt,
          R_amt: revAmt,
          Manual_rep_no: appliedManualNo || null,
          Bill_date: receiptDate,
          Month: month,
          Year: year,
          Cash_chq: paymentMode,
          Balance: calculatedRemainingBal
        }]);
      }

      // 2. Adjust Customer Due Balance in Supabase Customer Table
      await supabase
        .from('customer')
        .update({ 
          due_amount: calculatedRemainingBal,
          cbal: calculatedRemainingBal
        })
        .eq('customer_id', cid);

      // 3. Immediately append the newly saved receipt to the Right Grid
      const newReceiptGridRow = {
        receipt_no: appliedReceiptNo,
        recp_no: appliedReceiptNo,
        bill_id: billNo,
        bill_no: billNo,
        month: month,
        manual_rep_no: appliedManualNo,
        mal_rep_no: appliedManualNo,
        mal_recp_dt: manualRecpDate || receiptDate,
        bill_date: receiptDate,
        bill_amt: billAmt || revAmt,
        less_amt: lessAmt,
        balance: calculatedRemainingBal,
        r_amt: revAmt,
        cash_chq: paymentMode
      };
      setCustomerReceipts(prev => [...prev, newReceiptGridRow]);

      // 4. Update customer master in local state
      setAllCustomers(prev => prev.map(c => c.customer_id === cid ? { ...c, due_amount: calculatedRemainingBal, cbal: calculatedRemainingBal } : c));
      setTotalCustomerDue(calculatedRemainingBal);

      setMsg({ 
        text: `Receipt #${appliedReceiptNo} applied successfully! Balance: ₹${calculatedRemainingBal.toFixed(2)}` 
      });

      // 5. Increment System Receipt No & Manual Receipt No for the next entry
      setReceiptNo(prev => prev + 1);
      const nextManualNo = parseInt(appliedManualNo, 10);
      if (!isNaN(nextManualNo) && nextManualNo > 0) {
        setManualRecpNo(String(nextManualNo + 1));
      }

      // Reset customer search box and refocus for the next customer entry!
      setCustomerSearchQuery('');
      setTimeout(() => {
        if (customerInputRef.current) {
          customerInputRef.current.focus();
        }
      }, 80);

    } catch (err: any) {
      console.error('Error saving receipt:', err);
      setMsg({ text: `Error saving receipt: ${err.message || 'Database error'}`, isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard Shortcuts: F1=Cash, F2=Cheque, Alt+A / Alt+S -> Apply, Alt+U -> Update, Alt+E / Esc -> Exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setPaymentMode('Cash');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setPaymentMode('Cheque');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.altKey) {
        const k = e.key.toLowerCase();
        if (k === 'a' || k === 's') {
          e.preventDefault();
          handleApply();
        } else if (k === 'u') {
          e.preventDefault();
          handleApply();
        } else if (k === 'e') {
          e.preventDefault();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customerId, customerName, revAmt, lessAmt, totalCustomerDue, receiptNo, receiptDate, billNo, month, year, paymentMode, manualRecpNo, narration]);

  return (
    <div className="relative w-full max-w-[920px] max-h-[calc(100vh-40px)] bg-[#C0DCF8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl flex flex-col font-tahoma select-none overflow-hidden my-auto shrink-0">
      
      {/* 1. Classic Windows Title Bar matching RecieptEntryRecording.mp4 */}
      <div className="bg-gradient-to-r from-[#0A246A] to-[#A6CAF0] text-white px-2 py-0.5 flex items-center justify-between font-bold text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <img 
            src="/legacy_images/paper.ico" 
            alt="ico" 
            className="w-4 h-4" 
            onError={(e) => (e.currentTarget.style.display = 'none')} 
          />
          <span className="tracking-wide text-xs">Payment Recipt</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">_</button>
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">□</button>
          <button onClick={onClose} className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* 2. Main Window Interior */}
      <div className="flex-1 p-2.5 flex flex-col justify-between overflow-y-auto min-h-0 bg-[#D4E8FA] gap-1.5">
        
        {/* TOP CUSTOMER HEADER SECTION */}
        <div className="space-y-1 text-xs bg-[#D4E8FA]">
          
          {/* Row 1: Pr., Id, Collection Agent & Active Range */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Pr. & Id */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <label className="font-bold text-[#000080]">Pr.</label>
                <input 
                  type="text" 
                  value={priorityId}
                  readOnly
                  className="w-16 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-slate-800 text-center outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-1">
                <label className="font-bold text-[#000080]">Id</label>
                <input 
                  ref={customerIdRef}
                  type="number" 
                  value={customerId}
                  onChange={(e) => handleLookupCustomerId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (customerInputRef.current) customerInputRef.current.focus();
                    }
                  }}
                  placeholder=""
                  className="w-20 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-blue-900 outline-none text-center text-xs"
                />
              </div>
            </div>

            {/* Collection Dropdown & Active Range Badge (Matching Video: dukan [2401 - 2700]) */}
            <div className="flex items-center gap-2">
              <label className="font-bold text-[#000080]">Collection</label>
              <select 
                value={collectionAgentName}
                onChange={(e) => handleCollectorChange(e.target.value)}
                className="w-36 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-bold text-slate-800 outline-none text-xs cursor-pointer"
              >
                {collectors.length > 0 ? (
                  collectors.map((c) => (
                    <option key={c.collect_id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="dukan">dukan</option>
                    <option value="Salam">Salam</option>
                    <option value="Nemi Nath Ji">Nemi Nath Ji</option>
                    <option value="Swapnil">Swapnil</option>
                    <option value="Jagdish">Jagdish</option>
                    <option value="bharat">bharat</option>
                  </>
                )}
              </select>

              {/* Active Book Range Box */}
              <input 
                type="text"
                value={activeBookRange || '2401 - 2700'}
                readOnly
                className="w-28 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-slate-800 text-center text-xs"
              />
            </div>

          </div>

          {/* Row 2: Customer Name Autocomplete Search & Month / Region */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Customer Search Autocomplete Input */}
            <div className="flex items-center gap-2 flex-1 relative" ref={dropdownRef}>
              <label className="font-bold text-[#000080] shrink-0">Customer</label>
              
              <div className="relative flex-1">
                <input 
                  ref={customerInputRef}
                  type="text" 
                  value={customerSearchQuery}
                  onChange={(e) => handleCustomerSearchChange(e.target.value)}
                  onFocus={() => {
                    if (customerSearchQuery.trim()) setIsCustomerDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (isCustomerDropdownOpen && filteredCustomerSuggestions.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setHighlightedCustomerIndex(prev => (prev + 1) % filteredCustomerSuggestions.length);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setHighlightedCustomerIndex(prev => (prev - 1 + filteredCustomerSuggestions.length) % filteredCustomerSuggestions.length);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSelectCustomer(filteredCustomerSuggestions[highlightedCustomerIndex]);
                      }
                    } else if (e.key === 'Enter') {
                      if (manualRecpNoRef.current) manualRecpNoRef.current.focus();
                    }
                  }}
                  placeholder="Type Customer Name to search (e.g. Rajeev, Prabha, Dinesh, Tara)..."
                  className="w-full px-2 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-bold text-blue-950 outline-none text-xs"
                />

                {/* Autocomplete Dropdown Popup Menu */}
                {isCustomerDropdownOpen && filteredCustomerSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-0.5 bg-white border-2 border-[#0A246A] shadow-2xl max-h-56 overflow-y-auto z-50 text-xs font-tahoma">
                    {filteredCustomerSuggestions.map((cust, idx) => {
                      const isHighlighted = idx === highlightedCustomerIndex;
                      return (
                        <div 
                          key={cust.customer_id}
                          onClick={() => handleSelectCustomer(cust)}
                          onMouseEnter={() => setHighlightedCustomerIndex(idx)}
                          className={`px-2.5 py-1.5 cursor-pointer font-bold border-b border-slate-100 flex items-center justify-between text-xs ${
                            isHighlighted ? 'bg-[#0A246A] text-white' : 'hover:bg-blue-50 text-slate-900'
                          }`}
                        >
                          <span className="truncate">{cust.name_eng || cust.name_hindi}</span>
                          <span className="text-[10px] opacity-75 font-mono ml-2 shrink-0">
                            Pr: {cust.priority || '-'} | ID: #{cust.customer_id}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Month & Region (Matching Video: Month: - Sept   Region: > SR2) */}
            <div className="flex items-center gap-3 shrink-0 font-bold text-xs text-[#000080]">
              <div>
                Month : - <span className="text-[#800000] font-black">{month}</span>
              </div>
              <div>
                Region : &gt; <span className="text-black font-mono">{regionName || 'SR2'}</span>
              </div>
            </div>

          </div>

          {/* Row 3: Address & Phone */}
          <div className="flex items-center gap-2">
            <label className="font-bold text-[#000080] shrink-0">Address :</label>
            <span className="font-bold text-slate-800 text-xs truncate">
              {customerAddress || '---'}
            </span>
          </div>

        </div>

        {/* MIDDLE TWO-PANEL GRIDS matching RecieptEntryRecording.mp4 */}
        <div className="flex gap-2 flex-1 my-0.5 overflow-hidden" style={{ minHeight: '190px', maxHeight: '250px' }}>
          
          {/* Left Grid: Bills History (28% width) with Footer Total */}
          <div className="w-[28%] bg-[#808080] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white flex flex-col overflow-hidden">
            <div className="bg-[#0080FF] text-white text-[11px] font-bold grid grid-cols-4 border-b border-black text-center py-0.5">
              <span className="border-r border-black">Bill No</span>
              <span className="border-r border-black">Year</span>
              <span className="border-r border-black">Month</span>
              <span>Bill Amt.</span>
            </div>
            <div className="flex-1 bg-[#808080] overflow-y-auto text-xs font-mono text-white">
              {customerBills.length > 0 ? (
                customerBills.map((b, idx) => {
                  const bId = b.bill_no || b.bill_id || b.Bill_id;
                  const isSelected = selectedBillId === String(bId);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectBill(b)}
                      className={`grid grid-cols-4 border-b border-slate-600 text-center py-0.5 cursor-pointer text-[10px] transition-colors ${
                        isSelected ? 'bg-blue-800 text-yellow-300 font-bold ring-1 ring-yellow-400' : 'hover:bg-blue-600'
                      }`}
                      title="Click to select this bill"
                    >
                      <span className="border-r border-slate-600">{bId}</span>
                      <span className="border-r border-slate-600">{b.year || b.Year || '2026'}</span>
                      <span className="border-r border-slate-600">{(b.month || b.Month || '').slice(0, 4)}</span>
                      <span className="font-bold">{b.paper_amount || b.balance || b.Balance || b.Bill_Amt || 0}</span>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-300 italic text-[10px]">
                  {isLoadingHistory ? 'Loading bills...' : 'No pending bills'}
                </div>
              )}
            </div>

            {/* Left Grid Footer: Total Bills Sum in Red Text (Matching Video: 1055) */}
            <div className="bg-[#808080] border-t border-slate-600 px-2 py-0.5 flex justify-end items-center font-mono font-bold text-red-300 text-xs">
              <span>{totalBillsSum > 0 ? totalBillsSum : 0}</span>
            </div>
          </div>

          {/* Right Grid: Receipts History (72% width) with Footer Total */}
          <div className="flex-1 bg-[#808080] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white flex flex-col overflow-hidden">
            <div className="bg-[#0080FF] text-white text-[10px] font-bold grid grid-cols-11 border-b border-black text-center py-0.5">
              <span className="border-r border-black">Rep. Id</span>
              <span className="border-r border-black">Bill No</span>
              <span className="border-r border-black">Month</span>
              <span className="border-r border-black">Ml.No.</span>
              <span className="border-r border-black">Ml.Date</span>
              <span className="border-r border-black">Rp Amt.</span>
              <span className="border-r border-black">L.Amt.</span>
              <span className="border-r border-black">Bal.</span>
              <span className="border-r border-black">Rep.Date</span>
              <span className="border-r border-black">R Amt.</span>
              <span>Cash/Chq</span>
            </div>
            <div className="flex-1 bg-[#808080] overflow-y-auto text-xs font-mono text-white">
              {customerReceipts.length > 0 ? (
                customerReceipts.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-11 border-b border-slate-600 text-center py-0.5 hover:bg-blue-600 text-[10px]">
                    <span className="border-r border-slate-600">{r.receipt_no || r.recp_no || r.Receipt_id || r.id}</span>
                    <span className="border-r border-slate-600">{r.bill_no || r.bill_id || r.Bill_id || '-'}</span>
                    <span className="border-r border-slate-600">{(r.month || r.Month || '').slice(0, 4)}</span>
                    <span className="border-r border-slate-600">{r.manual_rep_no || r.mal_rep_no || r.Manual_rep_no || '-'}</span>
                    <span className="border-r border-slate-600">{r.mal_recp_dt || r.recp_date || r.bill_date || '-'}</span>
                    <span className="border-r border-slate-600">{r.bill_amt || r.Bill_amt || 0}</span>
                    <span className="border-r border-slate-600">{r.less_amt || r.Less_amt || 0}</span>
                    <span className="border-r border-slate-600">{r.balance || r.Balance || 0}</span>
                    <span className="border-r border-slate-600">{r.recp_date || r.bill_date || r.Bill_date || '-'}</span>
                    <span className="border-r border-slate-600 font-bold text-yellow-300">{r.r_amt || r.mal_recp_amt || r.R_amt || 0}</span>
                    <span>{r.cash_chq || r.Cash_chq || 'Cash'}</span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-300 italic text-[10px]">
                  {isLoadingHistory ? 'Loading receipts...' : 'No previous receipts'}
                </div>
              )}
            </div>

            {/* Right Grid Footer: Total Received & Total Due (Matching Video: 905, 1055) */}
            <div className="bg-[#808080] border-t border-slate-600 px-4 py-0.5 flex justify-between items-center font-mono font-bold text-red-300 text-xs">
              <span>Total Received: {totalReceiptsReceivedSum}</span>
              <span>Total Due: {totalBillsSum}</span>
            </div>
          </div>

        </div>

        {/* BOTTOM CONTROL SECTION matching RecieptEntryRecording.mp4 */}
        <div className="border border-[#0080C0] bg-[#D4E8FA] p-2 space-y-1.5 relative text-xs">
          
          {/* Box Title */}
          <div className="absolute -top-2.5 left-3 bg-[#D4E8FA] px-1 font-bold text-[#800000] text-xs">
            Control Section
          </div>

          {/* Control Row 1 */}
          <div className="grid grid-cols-12 gap-2 items-center pt-1">
            <label className="col-span-2 font-bold text-[#000080]">Recp. No</label>
            <input 
              type="text" 
              value={receiptNo}
              readOnly
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Recp Date</label>
            <input 
              type="text" 
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Bill No</label>
            <input 
              ref={billNoRef}
              type="text" 
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (billAmtRef.current) billAmtRef.current.focus();
                }
              }}
              placeholder=""
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Year</label>
            <input 
              type="text" 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="col-span-1 px-1 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center text-xs"
            />
          </div>

          {/* Control Row 2 */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-1 font-bold text-[#000080]">Month</label>
            <select 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="col-span-2 px-1 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-bold text-xs"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Bill Amt</label>
            <input 
              ref={billAmtRef}
              type="number" 
              value={billAmt}
              onChange={(e) => setBillAmt(parseFloat(e.target.value) || 0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (manualRcpAmtRef.current) manualRcpAmtRef.current.focus();
                }
              }}
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-right text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Ml. Rcp. At.</label>
            <input 
              ref={manualRcpAmtRef}
              type="number" 
              value={manualRcpAmt}
              onChange={(e) => setManualRcpAmt(parseFloat(e.target.value) || 0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (lessAmtRef.current) lessAmtRef.current.focus();
                }
              }}
              className="col-span-1 px-1 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-center text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Ls. Amt</label>
            <input 
              ref={lessAmtRef}
              type="number" 
              value={lessAmt}
              onChange={(e) => setLessAmt(parseFloat(e.target.value) || 0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (revAmtRef.current) revAmtRef.current.focus();
                }
              }}
              className="col-span-1 px-1 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-center text-red-700 font-bold text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Rev.Amt</label>
            <input 
              ref={revAmtRef}
              type="number" 
              value={revAmt}
              onChange={(e) => setRevAmt(parseFloat(e.target.value) || 0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (manualRecpNoRef.current) manualRecpNoRef.current.focus();
                }
              }}
              className="col-span-1 px-1 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center text-blue-900 text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right text-xs">Bal.</label>
          </div>

          {/* Control Row 3 */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-2 font-bold text-[#000080] truncate">Mal. Recp. No</label>
            <input 
              ref={manualRecpNoRef}
              type="text" 
              value={manualRecpNo}
              onChange={(e) => setManualRecpNo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (manualRecpDateRef.current) manualRecpDateRef.current.focus();
                }
              }}
              placeholder=""
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center text-xs"
            />

            <label className="col-span-2 font-bold text-[#000080] text-right truncate">Mal. Recp. Dt.</label>
            <input 
              ref={manualRecpDateRef}
              type="text" 
              value={manualRecpDate}
              onChange={(e) => setManualRecpDate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (paymentMode === 'Cheque') {
                    if (chequeNoRef.current) chequeNoRef.current.focus();
                  } else {
                    handleApply();
                  }
                }
              }}
              placeholder="DD/MM/YYYY"
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-center text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Total Amt</label>
            <input 
              type="text" 
              value={`${revAmt}`}
              readOnly
              className="col-span-1 px-1.5 py-0.5 bg-[#FFFFCC] border border-[#808080] font-mono font-black text-center text-black text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Total Dues</label>
            <input 
              type="text" 
              value={`${calculatedRemainingBal}`}
              readOnly
              className="col-span-1 px-1.5 py-0.5 bg-[#FFCCCC] border border-[#808080] font-mono font-black text-center text-red-900 text-xs"
            />
          </div>

          {/* Control Row 4: Shortcuts, Narration, Mode, Cheque, Action Buttons (Matching Video) */}
          <div className="flex items-center justify-between pt-1 flex-wrap gap-2 border-t border-slate-300">
            
            {/* Shortcuts & Narration & Payment Mode */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-[#800000] shrink-0">F1 - Cash &nbsp; F2 - Cheque</span>

              {/* Narration Field */}
              <div className="flex items-center gap-1">
                <label className="font-bold text-[#000080] text-xs shrink-0">Narration</label>
                <input 
                  type="text" 
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder=""
                  className="w-32 px-1 py-0.5 bg-white border border-[#808080] font-mono text-xs"
                />
              </div>
              
              <label className="flex items-center gap-1 font-bold text-[#000080] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={paymentMode === 'Cash'}
                  onChange={() => setPaymentMode('Cash')}
                />
                <span>Cash</span>
              </label>

              <label className="flex items-center gap-1 font-bold text-[#000080] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={paymentMode === 'Cheque'}
                  onChange={() => {
                    setPaymentMode('Cheque');
                    setTimeout(() => {
                      if (chequeNoRef.current) chequeNoRef.current.focus();
                    }, 50);
                  }}
                />
                <span>Cheque</span>
              </label>

              {paymentMode === 'Cheque' && (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#000080]">Cheque No</span>
                  <input 
                    ref={chequeNoRef}
                    type="text" 
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (chequeDateRef.current) chequeDateRef.current.focus();
                      }
                    }}
                    placeholder="Chq #"
                    className="w-20 px-1 py-0.5 bg-white border border-[#808080] font-mono font-bold text-xs"
                  />
                  <span className="font-bold text-[#000080]">Cheque Date</span>
                  <input 
                    ref={chequeDateRef}
                    type="text" 
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApply();
                      }
                    }}
                    placeholder="//"
                    className="w-16 px-1 py-0.5 bg-white border border-[#808080] font-mono text-center text-xs"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons matching RecieptEntryRecording.mp4 */}
            <div className="flex items-center gap-2">
              <button 
                ref={applyBtnRef}
                onClick={handleApply}
                disabled={isSaving}
                className="px-4 py-1 bg-white hover:bg-blue-50 border border-[#808080] text-xs font-bold text-black cursor-pointer shadow-xs disabled:opacity-50 min-w-[70px]"
              >
                <u>A</u>pply
              </button>
              <button 
                onClick={handleApply}
                disabled={isSaving}
                className="px-4 py-1 bg-white hover:bg-blue-50 border border-[#808080] text-xs font-bold text-black cursor-pointer shadow-xs disabled:opacity-50 min-w-[70px]"
              >
                <u>U</u>pdate
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-1 bg-white hover:bg-red-50 border border-[#808080] text-xs font-bold text-black cursor-pointer shadow-xs min-w-[70px]"
              >
                <u>E</u>xit
              </button>
            </div>

          </div>

          {msg && (
            <div className={`p-1 font-bold text-[11px] text-center border ${
              msg.isError 
                ? 'bg-rose-100 border-rose-400 text-rose-900' 
                : 'bg-emerald-100 border-emerald-400 text-emerald-900'
            }`}>
              {msg.text}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}


