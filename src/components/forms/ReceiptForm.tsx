'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ReceiptForm({ onClose }: ReceiptFormProps) {
  const now = new Date();
  const defDateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  // Top Section States
  const [priorityId, setPriorityId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [collectionAgentCode, setCollectionAgentCode] = useState('');
  const [collectionAgentName, setCollectionAgentName] = useState('');
  const [collectors, setCollectors] = useState<{ collect_id: number; name: string }[]>([]);
  const [allotments, setAllotments] = useState<AllotmentInfo[]>([]);

  // Middle Grids States
  const [customerBills, setCustomerBills] = useState<any[]>([]);
  const [customerReceipts, setCustomerReceipts] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | number | null>(null);

  // Control Section States
  const [receiptNo, setReceiptNo] = useState<number>(45825);
  const [receiptDate, setReceiptDate] = useState(defDateStr);
  const [billNo, setBillNo] = useState('');
  const [year, setYear] = useState('2026-2027');
  const [month, setMonth] = useState('August');
  
  const [billAmt, setBillAmt] = useState<number>(0);
  const [manualRcpAmt, setManualRcpAmt] = useState<number>(0);
  const [lessAmt, setLessAmt] = useState<number>(0);
  const [revAmt, setRevAmt] = useState<number>(0);
  const [manualRecpNo, setManualRecpNo] = useState('');
  const [manualRecpDate, setManualRecpDate] = useState('');
  const [allotmentMatchNote, setAllotmentMatchNote] = useState<string | null>(null);
  
  const [totalCustomerDue, setTotalCustomerDue] = useState<number>(0);
  
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Cheque'>('Cash');
  const [chequeNo, setChequeNo] = useState('');
  const [chequeDate, setChequeDate] = useState('');

  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const customerInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load: Next Receipt Number, Collectors & Allotments
  useEffect(() => {
    // Load next receipt number
    supabase
      .from('receipt20262027')
      .select('recp_no, receipt_no, id, Receipt_id', { count: 'exact' })
      .order('id', { ascending: false })
      .limit(1)
      .then(({ data, count }) => {
        if (data && data.length > 0) {
          const highestNo = Number(data[0].recp_no || data[0].receipt_no || data[0].Receipt_id || data[0].id) || 45824;
          setReceiptNo(highestNo + 1);
        } else if (count && count > 0) {
          setReceiptNo(45825 + count);
        }
      });

    // Load Collectors from database
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

    // Load Receipt Allotments for Auto-linking
    fetch('/api/receipt-allotment')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.all_allotments) {
          setAllotments(data.all_allotments);
        }
      })
      .catch(err => console.warn('Could not load allotments for receipt linking:', err));
  }, []);

  // 2. Receipt Allotment Auto-Detection Logic:
  // When Manual Receipt No (Mal. Recp. No) is entered, detect which collection agent it was allotted to
  const handleManualRecpNoChange = (val: string) => {
    setManualRecpNo(val);
    const recpNum = parseInt(val, 10);
    if (!isNaN(recpNum) && recpNum > 0 && allotments.length > 0) {
      const match = allotments.find(a => recpNum >= Number(a.receipt_from) && recpNum <= Number(a.receipt_to));
      if (match) {
        setCollectionAgentName(match.collector_name);
        setAllotmentMatchNote(`Allotted to: ${match.collector_name} (Book: ${match.receipt_from}-${match.receipt_to})`);
        
        // Match collect_id if possible
        const cObj = collectors.find(c => c.name.toLowerCase() === match.collector_name.toLowerCase());
        if (cObj) {
          setCollectionAgentCode(String(cObj.collect_id));
        }
      } else {
        setAllotmentMatchNote(null);
      }
    } else {
      setAllotmentMatchNote(null);
    }
  };

  // When collection agent is selected via dropdown
  const handleAgentSelect = (agentName: string) => {
    setCollectionAgentName(agentName);
    const match = collectors.find(c => c.name === agentName);
    if (match) {
      setCollectionAgentCode(String(match.collect_id));
    } else {
      setCollectionAgentCode('');
    }
  };

  // When collection agent code is typed
  const handleAgentCodeChange = (code: string) => {
    setCollectionAgentCode(code);
    const match = collectors.find(c => String(c.collect_id) === code.trim());
    if (match) {
      setCollectionAgentName(match.name);
    }
  };

  // 3. Fetch Customer info when Customer ID is typed
  const handleLookupCustomer = async (idStr: string) => {
    setCustomerId(idStr);
    if (!idStr || isNaN(parseInt(idStr, 10))) {
      setCustomerName('');
      setCustomerAddress('');
      setPriorityId('');
      setCustomerBills([]);
      setCustomerReceipts([]);
      setTotalCustomerDue(0);
      setBillAmt(0);
      setRevAmt(0);
      setLessAmt(0);
      setBillNo('');
      setSelectedBillId(null);
      return;
    }

    const cid = parseInt(idStr, 10);
    setIsLoadingHistory(true);

    try {
      // 1. Fetch Customer Master
      const { data: cust } = await supabase
        .from('customer')
        .select('*')
        .eq('customer_id', cid)
        .single();

      if (cust) {
        setCustomerName(cust.name_eng || cust.name_hindi || `Customer #${cid}`);
        setPriorityId(cust.priority?.toString() || '');
        const addr = [cust.add1, cust.add2, cust.hindi_add].filter(Boolean).join(' ').trim();
        setCustomerAddress(addr || '---');
        const due = Number(cust.due_amount ?? cust.dueamount ?? cust.cbal ?? 0);
        setTotalCustomerDue(due);
        setRevAmt(due > 0 ? due : 0);
        setManualRcpAmt(due > 0 ? due : 0);
      } else {
        setCustomerName('Customer not found');
        setCustomerAddress('');
        setTotalCustomerDue(0);
        setRevAmt(0);
      }

      // 2. Fetch Customer Bills from Supabase (billno20262027 or billno20252026)
      let bList: any[] = [];
      const { data: b26 } = await supabase
        .from('billno20262027')
        .select('*')
        .eq('customer_id', cid)
        .order('bill_id', { ascending: false })
        .limit(20);

      if (b26 && b26.length > 0) {
        bList = b26;
      } else {
        const { data: b25 } = await supabase
          .from('billno20252026')
          .select('*')
          .eq('Customer_id', cid)
          .order('Bill_id', { ascending: false })
          .limit(20);
        if (b25) bList = b25;
      }

      setCustomerBills(bList || []);

      // 3. Fetch Customer Previous Receipts from Supabase (receipt20262027 or receipt20252026)
      let rList: any[] = [];
      const { data: r26 } = await supabase
        .from('receipt20262027')
        .select('*')
        .eq('customer_id', cid)
        .order('id', { ascending: false })
        .limit(30);

      if (r26 && r26.length > 0) {
        rList = r26;
      } else {
        const { data: r25 } = await supabase
          .from('receipt20252026')
          .select('*')
          .eq('customer_id', cid)
          .order('Receipt_id', { ascending: false })
          .limit(30);
        if (r25) rList = r25;
      }

      setCustomerReceipts(rList || []);
    } catch (err) {
      console.error('Error fetching customer history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 4. Select Bill from Left Grid
  const handleSelectBill = (b: any) => {
    const bId = b.bill_no?.toString() || b.bill_id?.toString() || b.Bill_id?.toString() || '';
    setSelectedBillId(bId);
    setBillNo(bId);
    setMonth(b.month || b.Month || 'August');
    setYear(b.year || b.Year || '2026-2027');
    const amt = Number(b.paper_amount || b.balance || b.Balance || b.Bill_Amt || 0);
    setBillAmt(amt);
    setRevAmt(amt);
    setManualRcpAmt(amt);
  };

  // 5. Balance Calculations
  // Total Due displayed in pink box = totalCustomerDue - (revAmt + lessAmt)
  const remainingDue = Math.round((totalCustomerDue - revAmt - lessAmt) * 100) / 100;

  // 6. Keyboard Shortcuts: F1=Cash, F2=Cheque
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setPaymentMode('Cash');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setPaymentMode('Cheque');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 7. Save / Apply Receipt
  const handleApply = async () => {
    if (!customerId || !customerName || customerName === 'Customer not found') {
      setMsg({ text: 'Please enter a valid Customer ID.', isError: true });
      return;
    }
    if (revAmt <= 0 && lessAmt <= 0) {
      setMsg({ text: 'Please enter a valid Received Amount (Rev.Amt).', isError: true });
      return;
    }

    setIsSaving(true);
    setMsg(null);

    try {
      const cid = parseInt(customerId, 10);
      const receiptData = {
        recp_no: receiptNo,
        recp_date: receiptDate || defDateStr,
        customer_id: cid,
        bill_no: billNo ? parseInt(billNo, 10) : null,
        bill_amt: billAmt || totalCustomerDue,
        less_amt: lessAmt,
        mal_recp_amt: revAmt,
        r_amt: revAmt,
        mal_rep_no: manualRecpNo || null,
        mal_recp_dt: manualRecpDate || receiptDate || defDateStr,
        month: month || 'August',
        year: year || '2026-2027',
        cash_chq: paymentMode,
        cheque_no: paymentMode === 'Cheque' ? chequeNo : null,
        cheque_date: paymentMode === 'Cheque' ? chequeDate : null,
        balance: remainingDue,
        remarks: collectionAgentName ? `Agent: ${collectionAgentName}` : ''
      };

      // 1. Insert into receipt20262027 (fallback to receipt20252026 if table doesn't exist)
      const { error: insertErr } = await supabase.from('receipt20262027').insert([receiptData]);
      if (insertErr) {
        // Fallback
        const { error: fErr } = await supabase.from('receipt20252026').insert([{
          Receipt_no: receiptNo,
          customer_id: cid,
          Bill_id: billNo ? parseInt(billNo, 10) : null,
          Bill_amt: billAmt || totalCustomerDue,
          Less_amt: lessAmt,
          R_amt: revAmt,
          Manual_rep_no: manualRecpNo || null,
          Bill_date: receiptDate,
          Month: month,
          Year: year,
          Cash_chq: paymentMode,
          Balance: remainingDue
        }]);
        if (fErr) throw fErr;
      }

      // 2. Adjust Customer Due Balance in Supabase Customer Table
      await supabase
        .from('customer')
        .update({ 
          due_amount: remainingDue,
          cbal: remainingDue
        })
        .eq('customer_id', cid);

      setMsg({ 
        text: `Receipt #${receiptNo} applied successfully! New customer balance: ₹${remainingDue.toFixed(2)}` 
      });
      setReceiptNo(prev => prev + 1);
      
      // Refresh customer data and history
      handleLookupCustomer(customerId);
      
      // Reset inputs for next transaction
      setBillAmt(0);
      setLessAmt(0);
      setManualRecpNo('');
      setManualRecpDate('');
      setChequeNo('');
      setChequeDate('');
      setAllotmentMatchNote(null);
    } catch (err: any) {
      console.error('Error saving receipt:', err);
      setMsg({ text: `Error saving receipt: ${err.message || 'Database error'}`, isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut listener (Alt+A / Alt+S -> Apply, Alt+U -> Update, Alt+E / Esc -> Exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.altKey) {
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
  }, [customerId, revAmt, lessAmt, totalCustomerDue, receiptNo, receiptDate, billNo, month, year, paymentMode, manualRecpNo]);

  return (
    <div className="relative w-full max-w-[900px] max-h-[calc(100vh-50px)] bg-[#C0DCF8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl flex flex-col font-tahoma select-none overflow-hidden my-auto shrink-0">
      
      {/* 1. Classic Windows Title Bar matching media_1791525619799_253c0ddc.png */}
      <div className="bg-gradient-to-r from-[#0A246A] to-[#A6CAF0] text-white px-2 py-0.5 flex items-center justify-between font-bold text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <img 
            src="/legacy_images/paper.ico" 
            alt="ico" 
            className="w-4 h-4" 
            onError={(e) => (e.currentTarget.style.display = 'none')} 
          />
          <span className="tracking-wide">Payment Recipt</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">_</button>
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">□</button>
          <button onClick={onClose} className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* 2. Main Window Interior */}
      <div className="flex-1 p-2.5 flex flex-col justify-between overflow-y-auto min-h-0 bg-[#D4E8FA] gap-2">
        
        {/* TOP CUSTOMER HEADER SECTION */}
        <div className="space-y-1.5 text-xs bg-[#D4E8FA]">
          
          {/* Row 1: Pr., Id, Collection */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Pr. & Id */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <label className="font-bold text-[#000080]">Pr.</label>
                <input 
                  type="text" 
                  value={priorityId}
                  readOnly
                  placeholder=""
                  className="w-16 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-slate-800 text-center outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-1">
                <label className="font-bold text-[#000080]">Id</label>
                <input 
                  ref={customerInputRef}
                  type="number" 
                  value={customerId}
                  onChange={(e) => handleLookupCustomer(e.target.value)}
                  placeholder="ID"
                  className="w-20 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-blue-900 outline-none text-center text-xs"
                  autoFocus
                />
              </div>
            </div>

            {/* Collection Agent Inputs & Allotment Match */}
            <div className="flex items-center gap-2">
              <label className="font-bold text-[#000080]">Collection</label>
              <input 
                type="text" 
                value={collectionAgentCode}
                onChange={(e) => handleAgentCodeChange(e.target.value)}
                placeholder=""
                className="w-24 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-slate-800 outline-none text-xs text-center"
              />
              <select 
                value={collectionAgentName}
                onChange={(e) => handleAgentSelect(e.target.value)}
                className="w-44 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-bold text-slate-800 outline-none text-xs"
              >
                <option value="">-- Select Agent --</option>
                {collectors.length > 0 ? (
                  collectors.map((c) => (
                    <option key={c.collect_id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Salam">Salam</option>
                    <option value="Nemi Nath Ji">Nemi Nath Ji</option>
                    <option value="Swapnil">Swapnil</option>
                    <option value="Jagdish">Jagdish</option>
                    <option value="bharat">bharat</option>
                  </>
                )}
              </select>
            </div>

          </div>

          {/* Row 2: Customer Name & Month */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <label className="font-bold text-[#000080] shrink-0">Customer</label>
              <input 
                type="text" 
                value={customerName}
                readOnly
                placeholder="Enter Customer ID above to load details"
                className="flex-1 px-2 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-bold text-blue-950 outline-none text-xs"
              />
            </div>

            <div className="font-bold text-[#000080] text-sm shrink-0 px-2">
              Month : - <span className="text-[#800000] font-black">{month}</span>
            </div>
          </div>

          {/* Row 3: Address & Allotment Match Hint */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 truncate">
              <label className="font-bold text-[#000080] shrink-0">Address :</label>
              <span className="font-bold text-slate-800 text-xs truncate">
                {customerAddress || '---'}
              </span>
            </div>

            {allotmentMatchNote && (
              <div className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 font-bold shrink-0">
                ✓ {allotmentMatchNote}
              </div>
            )}
          </div>

        </div>

        {/* MIDDLE TWO-PANEL GRIDS matching media_1791525619799_253c0ddc.png */}
        <div className="flex gap-2 flex-1 my-0.5 overflow-hidden" style={{ minHeight: '180px', maxHeight: '240px' }}>
          
          {/* Left Grid: Bills History (28% width) */}
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
                      title="Click to auto-fill bill in control section"
                    >
                      <span className="border-r border-slate-600">#{bId}</span>
                      <span className="border-r border-slate-600">{b.year || b.Year || '2026'}</span>
                      <span className="border-r border-slate-600">{(b.month || b.Month || '').slice(0, 3)}</span>
                      <span className="font-bold">₹{b.paper_amount || b.balance || b.Balance || 0}</span>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-300 italic text-[10px]">
                  {isLoadingHistory ? 'Loading bills...' : 'No pending bills'}
                </div>
              )}
            </div>
          </div>

          {/* Right Grid: Receipts History (72% width) */}
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
                    <span className="border-r border-slate-600">#{r.receipt_no || r.recp_no || r.Receipt_id || r.id}</span>
                    <span className="border-r border-slate-600">{r.bill_no || r.bill_id || r.Bill_id || '-'}</span>
                    <span className="border-r border-slate-600">{(r.month || r.Month || '').slice(0, 3)}</span>
                    <span className="border-r border-slate-600">{r.manual_rep_no || r.mal_rep_no || r.Manual_rep_no || '-'}</span>
                    <span className="border-r border-slate-600">{r.mal_recp_dt || r.recp_date || r.bill_date || '-'}</span>
                    <span className="border-r border-slate-600">₹{r.bill_amt || r.Bill_amt || 0}</span>
                    <span className="border-r border-slate-600">₹{r.less_amt || r.Less_amt || 0}</span>
                    <span className="border-r border-slate-600">₹{r.balance || r.Balance || 0}</span>
                    <span className="border-r border-slate-600">{r.recp_date || r.bill_date || r.Bill_date || '-'}</span>
                    <span className="border-r border-slate-600 font-bold text-yellow-300">₹{r.r_amt || r.mal_recp_amt || r.R_amt || 0}</span>
                    <span>{r.cash_chq || r.Cash_chq || 'Cash'}</span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-300 italic text-[10px]">
                  {isLoadingHistory ? 'Loading receipts...' : 'No previous receipts'}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM CONTROL SECTION matching media_1791525619799_253c0ddc.png */}
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
              type="text" 
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
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
              type="number" 
              value={billAmt}
              onChange={(e) => setBillAmt(parseFloat(e.target.value) || 0)}
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-right text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Ml. Rcp....</label>
            <input 
              type="number" 
              value={manualRcpAmt}
              onChange={(e) => setManualRcpAmt(parseFloat(e.target.value) || 0)}
              className="col-span-1 px-1 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-center text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Ls. Amt</label>
            <input 
              type="number" 
              value={lessAmt}
              onChange={(e) => setLessAmt(parseFloat(e.target.value) || 0)}
              className="col-span-1 px-1 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-center text-red-700 font-bold text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Rev.Amt</label>
            <input 
              type="number" 
              value={revAmt}
              onChange={(e) => setRevAmt(parseFloat(e.target.value) || 0)}
              className="col-span-1 px-1 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center text-blue-900 text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right text-xs">Bal.</label>
          </div>

          {/* Control Row 3 */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-2 font-bold text-[#000080] truncate">Mal. Recp. No</label>
            <input 
              type="text" 
              value={manualRecpNo}
              onChange={(e) => handleManualRecpNoChange(e.target.value)}
              placeholder=""
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center text-xs"
            />

            <label className="col-span-2 font-bold text-[#000080] text-right truncate">Mal. Recp. Dt.</label>
            <input 
              type="text" 
              value={manualRecpDate}
              onChange={(e) => setManualRecpDate(e.target.value)}
              placeholder="//"
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-center text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Total Amt</label>
            <input 
              type="text" 
              value={`₹${revAmt.toFixed(2)}`}
              readOnly
              className="col-span-1 px-1 py-0.5 bg-[#FFFFCC] border border-[#808080] font-mono font-black text-center text-black text-xs"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Total D...</label>
            <input 
              type="text" 
              value={`₹${remainingDue.toFixed(2)}`}
              readOnly
              className="col-span-1 px-1 py-0.5 bg-[#FFCCCC] border border-[#808080] font-mono font-black text-center text-red-900 text-xs"
            />
          </div>

          {/* Control Row 4: Shortcuts, Mode, Cheque, Action Buttons */}
          <div className="flex items-center justify-between pt-1 flex-wrap gap-2 border-t border-slate-300">
            
            {/* Payment Mode */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-xs text-[#800000]">F1 - Cash &nbsp; F2 - Cheque</span>
              
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
                  onChange={() => setPaymentMode('Cheque')}
                />
                <span>Cheque</span>
              </label>

              {paymentMode === 'Cheque' && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#000080]">Cheque No</span>
                  <input 
                    type="text" 
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                    placeholder="Chq #"
                    className="w-20 px-1 py-0.5 bg-white border border-[#808080] font-mono font-bold text-xs"
                  />
                  <span className="font-bold text-[#000080]">Date</span>
                  <input 
                    type="text" 
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                    placeholder="//"
                    className="w-16 px-1 py-0.5 bg-white border border-[#808080] font-mono text-center text-xs"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons matching media_1791525619799_253c0ddc.png */}
            <div className="flex items-center gap-2">
              <button 
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

