'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

interface ReceiptFormProps {
  onClose: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ReceiptForm({ onClose }: ReceiptFormProps) {
  const now = new Date();
  const defDateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  // Top Section States - Starts 100% EMPTY!
  const [priorityId, setPriorityId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [collectionAgentCode, setCollectionAgentCode] = useState('');
  const [collectionAgentName, setCollectionAgentName] = useState('');
  const [agents, setAgents] = useState<any[]>([]);

  // Middle Grids States
  const [customerBills, setCustomerBills] = useState<any[]>([]);
  const [customerReceipts, setCustomerReceipts] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Control Section States
  const [receiptNo, setReceiptNo] = useState(18383);
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
  
  const [totalAmt, setTotalAmt] = useState<number>(0);
  const [totalDues, setTotalDues] = useState<number>(0);
  
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Cheque'>('Cash');
  const [narration, setNarration] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [chequeDate, setChequeDate] = useState('');

  const [msg, setMsg] = useState('');

  // Load next Receipt Number
  useEffect(() => {
    supabase
      .from('receipt')
      .select('receipt_id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count && count > 0) setReceiptNo(18383 + count);
      })
      .catch(() => {});
  }, []);

  // Fetch Customer info when Customer ID is typed
  const handleLookupCustomer = async (idStr: string) => {
    setCustomerId(idStr);
    if (!idStr || isNaN(parseInt(idStr, 10))) {
      setCustomerName('');
      setCustomerAddress('');
      setPriorityId('');
      setCustomerBills([]);
      setCustomerReceipts([]);
      setTotalDues(0);
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
        setCustomerName(cust.name_eng || '');
        setPriorityId(cust.priority?.toString() || '');
        setCustomerAddress(`${cust.add1 || ''} ${cust.add2 || ''} ${cust.hindi_add || ''}`.trim());
        const due = cust.due_amount ?? cust.dueamount ?? 0;
        setTotalDues(due);
        setTotalAmt(due);
        setRevAmt(due > 0 ? due : 0);
      } else {
        setCustomerName('Customer not found');
        setCustomerAddress('');
      }

      // 2. Fetch Customer Bills from Supabase
      const { data: bList } = await supabase
        .from('bill')
        .select('*')
        .eq('customer_id', cid)
        .order('bill_id', { ascending: false })
        .limit(20);

      setCustomerBills(bList || []);

      // 3. Fetch Customer Previous Receipts from Supabase
      const { data: rList } = await supabase
        .from('receipt')
        .select('*')
        .eq('customer_id', cid)
        .order('receipt_id', { ascending: false })
        .limit(30);

      setCustomerReceipts(rList || []);
    } catch (err) {
      console.error('Error fetching customer history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Select Bill from Left Grid
  const handleSelectBill = (b: any) => {
    setBillNo(b.bill_no?.toString() || b.bill_id?.toString() || '');
    setMonth(b.month || 'August');
    setYear(b.year || '2026-2027');
    const amt = b.paper_amount || b.balance || 0;
    setBillAmt(amt);
    setRevAmt(amt);
    setTotalAmt(amt);
  };

  // Keyboard Shortcuts (F1 for Cash, F2 for Cheque)
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

  // Save / Apply Receipt
  const handleApply = async () => {
    if (!customerId || !customerName || customerName === 'Customer not found') {
      setMsg('Please enter a valid Customer ID.');
      return;
    }
    if (revAmt <= 0 && lessAmt <= 0) {
      setMsg('Please enter a valid Received Amount.');
      return;
    }

    setMsg('Saving payment receipt...');
    try {
      const receiptData = {
        customer_id: parseInt(customerId, 10),
        receipt_no: String(receiptNo),
        manual_rep_no: manualRecpNo,
        bill_date: receiptDate,
        bill_amt: billAmt,
        month: month,
        year: year,
        due_amt: totalDues,
        mal_recp_amt: manualRcpAmt,
        balance: totalDues - revAmt - lessAmt,
        less_amt: lessAmt,
        r_amt: revAmt,
        cash_chq: paymentMode,
        cheque_no: paymentMode === 'Cheque' ? chequeNo : '',
        cheque_date: paymentMode === 'Cheque' ? chequeDate : '',
        narr: narration,
        financial_year: year
      };

      // 1. Insert into Supabase
      const { error } = await supabase.from('receipt').insert([receiptData]);
      if (error) throw error;

      // 2. Adjust Customer Due Balance in Supabase
      const newDue = totalDues - revAmt - lessAmt;
      await supabase
        .from('customer')
        .update({ due_amount: newDue })
        .eq('customer_id', parseInt(customerId, 10));

      setMsg(`Receipt #${receiptNo} applied successfully! Balance updated: ₹${newDue.toFixed(2)}`);
      setReceiptNo(prev => prev + 1);
      handleLookupCustomer(customerId);
      setTimeout(() => setMsg(''), 4000);
    } catch (err: any) {
      setMsg(`Error saving receipt: ${err.message}`);
    }
  };

  const calculatedBalance = Math.round((totalDues - revAmt - lessAmt) * 100) / 100;

  return (
    <div className="relative w-[880px] h-[640px] bg-[#C0DCF8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl flex flex-col font-tahoma select-none overflow-hidden">
      
      {/* Title Bar matching screenshot_13.jpg */}
      <div className="bg-gradient-to-r from-[#0A246A] to-[#A6CAF0] text-white px-2 py-0.5 flex items-center justify-between font-bold text-xs">
        <div className="flex items-center gap-1.5">
          <img 
            src="/legacy_images/paper.ico" 
            alt="ico" 
            className="w-4 h-4" 
            onError={(e) => (e.currentTarget.style.display = 'none')} 
          />
          <span>Payment Recipt</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">_</button>
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">□</button>
          <button onClick={onClose} className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-2 flex flex-col justify-between overflow-hidden bg-[#D4E8FA]">
        
        {/* 1. TOP CUSTOMER HEADER SECTION matching screenshot_13.jpg */}
        <div className="space-y-1 text-xs">
          
          {/* Row 1: Pr., Id, Collection */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Pr. & Id */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <label className="font-black text-[#000080]">Pr.</label>
                <input 
                  type="text" 
                  value={priorityId}
                  readOnly
                  className="w-14 px-1.5 py-0.5 bg-[#E8EEF5] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-slate-800 text-center outline-none"
                />
              </div>

              <div className="flex items-center gap-1">
                <label className="font-black text-[#000080]">Id</label>
                <input 
                  type="number" 
                  value={customerId}
                  onChange={(e) => handleLookupCustomer(e.target.value)}
                  placeholder="ID"
                  className="w-20 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-black text-blue-900 outline-none text-center"
                />
              </div>
            </div>

            {/* Collection */}
            <div className="flex items-center gap-2">
              <label className="font-black text-[#000080]">Collection</label>
              <input 
                type="text" 
                value={collectionAgentCode}
                onChange={(e) => setCollectionAgentCode(e.target.value)}
                className="w-28 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-slate-800 outline-none"
              />
              <select 
                value={collectionAgentName}
                onChange={(e) => setCollectionAgentName(e.target.value)}
                className="w-40 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-bold text-slate-800 outline-none text-xs"
              >
                <option value="">-- Select Agent --</option>
                <option value="Mohan Lal">Mohan Lal</option>
                <option value="Suresh Sharma">Suresh Sharma</option>
                <option value="Dinesh News">Dinesh News</option>
              </select>
            </div>

          </div>

          {/* Row 2: Customer Name & Month */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <label className="font-black text-[#000080] shrink-0">Customer</label>
              <input 
                type="text" 
                value={customerName}
                readOnly
                placeholder="Enter Customer ID above to load details"
                className="flex-1 px-2 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-bold text-blue-950 outline-none text-xs"
              />
            </div>

            <div className="font-black text-[#000080] text-sm shrink-0 px-2">
              Month : - <span className="text-[#800000]">{month}</span>
            </div>
          </div>

          {/* Row 3: Address */}
          <div className="flex items-center gap-2">
            <label className="font-black text-[#000080] shrink-0">Address :</label>
            <span className="font-bold text-slate-800 text-xs truncate">
              {customerAddress || '---'}
            </span>
          </div>

        </div>

        {/* 2. MIDDLE TWO-PANEL GRIDS matching screenshot_13.jpg */}
        <div className="flex gap-2 flex-1 my-1 overflow-hidden" style={{ minHeight: '180px' }}>
          
          {/* Left Grid: Bills History (25% width) */}
          <div className="w-[28%] bg-[#808080] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white flex flex-col overflow-hidden">
            <div className="bg-[#0080FF] text-white text-[11px] font-bold grid grid-cols-4 border-b border-black text-center py-0.5">
              <span className="border-r border-black">Bill No</span>
              <span className="border-r border-black">Year</span>
              <span className="border-r border-black">Month</span>
              <span>Bill Amt.</span>
            </div>
            <div className="flex-1 bg-[#808080] overflow-auto text-xs font-mono text-white">
              {customerBills.map((b, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleSelectBill(b)}
                  className="grid grid-cols-4 border-b border-slate-600 text-center py-0.5 hover:bg-blue-600 cursor-pointer text-[10px]"
                >
                  <span className="border-r border-slate-600">#{b.bill_no || b.bill_id}</span>
                  <span className="border-r border-slate-600">{b.year || '2026'}</span>
                  <span className="border-r border-slate-600">{b.month?.slice(0, 3)}</span>
                  <span className="font-bold">₹{b.paper_amount || b.balance}</span>
                </div>
              ))}
              {customerBills.length === 0 && (
                <div className="p-4 text-center text-slate-300 italic text-[10px]">No pending bills</div>
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
            <div className="flex-1 bg-[#808080] overflow-auto text-xs font-mono text-white">
              {customerReceipts.map((r, idx) => (
                <div key={idx} className="grid grid-cols-11 border-b border-slate-600 text-center py-0.5 hover:bg-blue-600 text-[10px]">
                  <span className="border-r border-slate-600">#{r.receipt_no || r.receipt_id}</span>
                  <span className="border-r border-slate-600">{r.bill_id || '-'}</span>
                  <span className="border-r border-slate-600">{r.month?.slice(0, 3)}</span>
                  <span className="border-r border-slate-600">{r.manual_rep_no || '-'}</span>
                  <span className="border-r border-slate-600">{r.bill_date || '-'}</span>
                  <span className="border-r border-slate-600">₹{r.bill_amt || 0}</span>
                  <span className="border-r border-slate-600">₹{r.less_amt || 0}</span>
                  <span className="border-r border-slate-600">₹{r.balance || 0}</span>
                  <span className="border-r border-slate-600">{r.bill_date || '-'}</span>
                  <span className="border-r border-slate-600 font-bold text-yellow-300">₹{r.r_amt || 0}</span>
                  <span>{r.cash_chq || 'Cash'}</span>
                </div>
              ))}
              {customerReceipts.length === 0 && (
                <div className="p-4 text-center text-slate-300 italic text-[10px]">No previous receipts</div>
              )}
            </div>
          </div>

        </div>

        {/* 3. BOTTOM CONTROL SECTION matching screenshot_13.jpg */}
        <div className="border border-[#0080C0] bg-[#D4E8FA] p-2.5 space-y-2 relative text-xs">
          
          {/* Box Title */}
          <div className="absolute -top-2.5 left-3 bg-[#D4E8FA] px-1 font-bold text-[#800000] text-xs">
            Control Section
          </div>

          {/* Control Row 1 */}
          <div className="grid grid-cols-12 gap-2 items-center pt-1">
            <label className="col-span-1 font-bold text-[#000080]">Recp. No</label>
            <input 
              type="text" 
              value={receiptNo}
              readOnly
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right">Recp Date</label>
            <input 
              type="text" 
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right">Bill No</label>
            <input 
              type="text" 
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right">Year</label>
            <input 
              type="text" 
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center"
            />
          </div>

          {/* Control Row 2 */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-1 font-bold text-[#000080]">Month</label>
            <select 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="col-span-2 px-1 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-bold"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <label className="col-span-1 font-bold text-[#000080] text-right">Bill Amt</label>
            <input 
              type="number" 
              value={billAmt}
              onChange={(e) => setBillAmt(parseFloat(e.target.value) || 0)}
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-right"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Ml. Rcp. At.</label>
            <input 
              type="number" 
              value={manualRcpAmt}
              onChange={(e) => setManualRcpAmt(parseFloat(e.target.value) || 0)}
              className="col-span-1 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-center"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Ls. Amt</label>
            <input 
              type="number" 
              value={lessAmt}
              onChange={(e) => setLessAmt(parseFloat(e.target.value) || 0)}
              className="col-span-1 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-center text-red-700"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Rev.Amt</label>
            <input 
              type="number" 
              value={revAmt}
              onChange={(e) => setRevAmt(parseFloat(e.target.value) || 0)}
              className="col-span-1 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center text-blue-900"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right">Bal.</label>
          </div>

          {/* Control Row 3 */}
          <div className="grid grid-cols-12 gap-2 items-center">
            <label className="col-span-2 font-bold text-[#000080]">Mal. Recp. No</label>
            <input 
              type="text" 
              value={manualRecpNo}
              onChange={(e) => setManualRecpNo(e.target.value)}
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono font-bold text-center"
            />

            <label className="col-span-2 font-bold text-[#000080] text-right">Mal. Recp. Dt.</label>
            <input 
              type="text" 
              value={manualRecpDate}
              onChange={(e) => setManualRecpDate(e.target.value)}
              placeholder="//"
              className="col-span-2 px-1.5 py-0.5 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono text-center"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right">Total Amt</label>
            <input 
              type="text" 
              value={`₹${totalAmt.toFixed(2)}`}
              readOnly
              className="col-span-1 px-1.5 py-0.5 bg-[#FFFFCC] border border-[#808080] font-mono font-black text-center text-black"
            />

            <label className="col-span-1 font-bold text-[#000080] text-right truncate">Total Dues</label>
            <input 
              type="text" 
              value={`₹${calculatedBalance.toFixed(2)}`}
              readOnly
              className="col-span-1 px-1.5 py-0.5 bg-[#FFCCCC] border border-[#808080] font-mono font-black text-center text-red-900"
            />
          </div>

          {/* Control Row 4: Shortcuts, Mode, Cheque, Action Buttons */}
          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            
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
                    className="w-24 px-1 py-0.5 bg-white border border-[#808080] font-mono font-bold"
                  />
                  <span className="font-bold text-[#000080]">Cheque Date</span>
                  <input 
                    type="text" 
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                    placeholder="//"
                    className="w-20 px-1 py-0.5 bg-white border border-[#808080] font-mono text-center"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons matching screenshot_13.jpg */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleApply}
                className="px-4 py-1 bg-white hover:bg-blue-50 border border-[#808080] text-xs font-bold text-black cursor-pointer shadow-xs"
              >
                <u>A</u>pply
              </button>
              <button 
                onClick={handleApply}
                className="px-4 py-1 bg-white hover:bg-blue-50 border border-[#808080] text-xs font-bold text-black cursor-pointer shadow-xs"
              >
                <u>U</u>pdate
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-1 bg-white hover:bg-red-50 border border-[#808080] text-xs font-bold text-black cursor-pointer shadow-xs"
              >
                <u>E</u>xit
              </button>
            </div>

          </div>

          {msg && (
            <div className="p-1 bg-emerald-100 border border-emerald-400 text-emerald-900 font-bold text-[11px] text-center">
              {msg}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
