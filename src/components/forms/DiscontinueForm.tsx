'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Save, Trash2, X, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Customer, Publication } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';

interface DiscontinueFormProps {
  onClose: () => void;
  publications?: Publication[];
}

export default function DiscontinueForm({ onClose, publications = [] }: DiscontinueFormProps) {
  const [custId, setCustId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedPub, setSelectedPub] = useState<string>('all');
  const [holdType, setHoldType] = useState<'Temporary' | 'Permanent'>('Temporary');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState('');
  const [discontinueList, setDiscontinueList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Load existing vacation holds from Supabase
  const loadDiscontinues = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('discontinue')
        .select('*')
        .order('discontinue_id', { ascending: false })
        .limit(100);

      if (!error && data) {
        setDiscontinueList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscontinues();
  }, []);

  // Fetch Customer Name when Customer ID changes
  const handleLookupCustomer = async (idStr: string) => {
    setCustId(idStr);
    if (!idStr || isNaN(parseInt(idStr, 10))) {
      setCustomerName('');
      return;
    }
    const { data } = await supabase
      .from('customer')
      .select('customer_id, name_eng, name_hindi')
      .eq('customer_id', parseInt(idStr, 10))
      .single();

    if (data) {
      setCustomerName(`${data.name_eng} (${data.name_hindi || ''})`);
    } else {
      setCustomerName('Customer not found');
    }
  };

  // Save Vacation Hold
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custId || !customerName || customerName === 'Customer not found') {
      setMsg('Please enter a valid Customer ID');
      return;
    }

    setIsLoading(true);
    setMsg('Saving vacation hold...');

    try {
      const payload = {
        customer_id: parseInt(custId, 10),
        publica_id: selectedPub === 'all' ? 0 : parseInt(selectedPub, 10),
        temp_perma: holdType,
        temp_from: fromDate || null,
        temp_to: holdType === 'Temporary' ? (toDate || null) : null,
        entry_date: new Date().toISOString().split('T')[0],
        financial_year: '2026-2027'
      };

      const { error } = await supabase.from('discontinue').insert([payload]);
      if (error) throw error;

      setMsg('Vacation hold / discontinue saved successfully!');
      setCustId('');
      setCustomerName('');
      setToDate('');
      loadDiscontinues();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Vacation Hold
  const handleDelete = async (discId: number) => {
    if (!confirm('Are you sure you want to cancel this vacation hold?')) return;
    try {
      await supabase.from('discontinue').delete().eq('discontinue_id', discId);
      loadDiscontinues();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-[820px] h-[550px] vb-window flex flex-col shadow-2xl overflow-hidden font-tahoma">
      {/* Title Bar */}
      <div className="vb-titlebar-xp select-none">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Customer Vacation Hold / Temporary Stop (अखबार बंद / छुट्टी प्रविष्टि)</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="vb-win-btn">_</button>
          <button className="vb-win-btn">□</button>
          <button onClick={onClose} className="vb-win-btn vb-win-btn-close">✕</button>
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 p-3 bg-[#ECE9D8] flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="text-center pb-1">
          <h1 className="text-base font-black text-[#8B0000] tracking-wider uppercase">
            VACATION HOLD & TEMPORARY NEWSPAPER DISCONTINUE ENTRY
          </h1>
          <p className="text-[11px] text-slate-700 font-bold">
            Accounting Rule: Suspends daily delivery & billing during hold dates. Resumes automatically after To Date.
          </p>
        </div>

        {/* Entry Box */}
        <form onSubmit={handleSave} className="bg-white p-3 vb-box-inset my-1 space-y-2 text-xs">
          <div className="grid grid-cols-4 gap-3 items-center">
            
            <div>
              <label className="block font-bold text-[#8B0000] mb-0.5">Customer ID:</label>
              <input 
                type="number" 
                value={custId}
                onChange={(e) => handleLookupCustomer(e.target.value)}
                placeholder="Enter ID (e.g. 5040)"
                required
                className="vb-input w-full font-bold font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-0.5">Customer Name:</label>
              <input 
                type="text" 
                value={customerName}
                readOnly
                placeholder="Customer Name will auto-populate"
                className="vb-input w-full bg-slate-100 font-bold text-blue-900"
              />
            </div>

            <div>
              <label className="block font-bold text-[#8B0000] mb-0.5">Hold Type:</label>
              <select 
                value={holdType}
                onChange={(e: any) => setHoldType(e.target.value)}
                className="vb-input w-full bg-white font-bold"
              >
                <option value="Temporary">Temporary (अस्थाई छुट्टी)</option>
                <option value="Permanent">Permanent Stop (स्थाई बंद)</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-4 gap-3 items-center pt-1">
            
            <div>
              <label className="block font-bold text-slate-700 mb-0.5">Publication:</label>
              <select 
                value={selectedPub}
                onChange={(e) => setSelectedPub(e.target.value)}
                className="vb-input w-full bg-white"
              >
                <option value="all">All Papers (सभी अखबार/पत्रिका)</option>
                {publications.map(p => (
                  <option key={p.publica_id} value={p.publica_id}>{p.public_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-0.5">From Date (प्रारंभ दिनांक):</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
                className="vb-input w-full font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-0.5">To Date (समाप्ति दिनांक):</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={holdType === 'Permanent'}
                required={holdType === 'Temporary'}
                className="vb-input w-full font-bold disabled:bg-slate-100"
              />
            </div>

            <div className="flex items-end">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full vb-btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Hold</span>
              </button>
            </div>

          </div>

          {msg && (
            <div className={`p-1 text-[11px] font-bold border ${msg.includes('Error') ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
              {msg}
            </div>
          )}
        </form>

        {/* Existing Vacation Holds Table */}
        <div className="flex-1 bg-white vb-grid overflow-auto my-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#ECE9D8]">
              <tr>
                <th className="p-1.5 border text-left">Hold ID</th>
                <th className="p-1.5 border text-left">Cust ID</th>
                <th className="p-1.5 border text-left">Hold Type</th>
                <th className="p-1.5 border text-left">From Date</th>
                <th className="p-1.5 border text-left">To Date</th>
                <th className="p-1.5 border text-left">Status</th>
                <th className="p-1.5 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {discontinueList.map((d, idx) => (
                <tr key={idx} className="border-b hover:bg-blue-50 text-[11px]">
                  <td className="p-1 border-r font-mono font-bold text-center">#{d.discontinue_id || d.sno}</td>
                  <td className="p-1 border-r font-mono font-bold text-blue-900">#{d.customer_id}</td>
                  <td className="p-1 border-r font-bold">{d.temp_perma || 'Temporary'}</td>
                  <td className="p-1 border-r font-mono text-slate-700">{d.temp_from || '-'}</td>
                  <td className="p-1 border-r font-mono text-slate-700">{d.temp_to || 'Permanent'}</td>
                  <td className="p-1 border-r">
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-xs text-[9px] font-bold">
                      ACTIVE HOLD
                    </span>
                  </td>
                  <td className="p-1 text-center">
                    <button 
                      onClick={() => handleDelete(d.discontinue_id)}
                      className="px-1.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded-xs text-[10px] font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {discontinueList.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    No active vacation holds found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-[#ECE9D8] pt-2 border-t border-slate-300 flex items-center justify-between text-xs font-bold">
          <span>Total Vacation Records: <strong>{discontinueList.length}</strong></span>
          <button onClick={onClose} className="vb-btn flex items-center gap-1 bg-white hover:bg-red-50 text-red-800 cursor-pointer px-3 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
            <span>Close</span>
          </button>
        </div>

      </div>
    </div>
  );
}
