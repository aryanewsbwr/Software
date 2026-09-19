'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ReceiptAllotmentFormProps {
  onClose: () => void;
}

export default function ReceiptAllotmentForm({ onClose }: ReceiptAllotmentFormProps) {
  const [collectorName, setCollectorName] = useState('');
  const [allotments, setAllotments] = useState<any[]>([
    { sno: 1, from: '1001', to: '1100', allotDate: '01/08/2026', recDate: '15/08/2026' },
    { sno: 2, from: '1101', to: '1200', allotDate: '16/08/2026', recDate: '' }
  ]);
  const [msg, setMsg] = useState('');

  const handleSave = () => {
    setMsg('Receipt book allotment saved successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="relative w-[540px] h-[400px] bg-white border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl flex flex-col font-tahoma select-none overflow-hidden">
      
      {/* Title Bar matching screenshot_12.jpg */}
      <div className="bg-[#ECE9D8] border-b border-[#808080] px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <img src="/legacy_images/paper.ico" alt="ico" className="w-4 h-4" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="font-bold text-xs text-[#808080]">Receipt Allotment</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-5 h-4 bg-[#ECE9D8] border border-[#808080] text-[10px] font-bold flex items-center justify-center hover:bg-white cursor-pointer">_</button>
          <button className="w-5 h-4 bg-[#ECE9D8] border border-[#808080] text-[10px] font-bold flex items-center justify-center hover:bg-white cursor-pointer">□</button>
          <button onClick={onClose} className="w-5 h-4 bg-[#ECE9D8] border border-[#808080] text-[10px] font-bold flex items-center justify-center hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* Main Body matching screenshot_12.jpg */}
      <div className="flex-1 bg-white p-4 flex flex-col justify-between">
        
        {/* Top Controls: Name Input + Action Buttons on the right */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 pt-1">
            <label className="font-bold text-[#800000] text-xs shrink-0">Name</label>
            <input 
              type="text" 
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
              placeholder=""
              className="flex-1 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white font-bold text-black outline-none text-xs"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            <button 
              onClick={handleSave}
              className="px-4 py-1 bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] hover:from-[#B2EBF2] hover:to-[#80DEEA] border border-[#00838F] shadow-sm transform -skew-x-6 cursor-pointer flex items-center gap-1 text-xs font-bold text-black"
            >
              <span className="transform skew-x-6">💾 <u>S</u>ave</span>
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-1 bg-gradient-to-b from-[#E0F7FA] to-[#B2EBF2] hover:from-[#B2EBF2] hover:to-[#80DEEA] border border-[#00838F] shadow-sm transform -skew-x-6 cursor-pointer flex items-center gap-1 text-xs font-bold text-black"
            >
              <span className="transform skew-x-6 text-red-800">🛑 E<u>x</u>it</span>
            </button>
          </div>
        </div>

        {/* Grid matching screenshot_12.jpg */}
        <div className="flex-1 bg-[#808080] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white mt-3 flex flex-col overflow-hidden">
          <div className="bg-[#E0E0E0] text-black text-xs font-bold grid grid-cols-5 border-b border-[#808080] py-1 text-center">
            <span className="border-r border-[#808080]">SNO</span>
            <span className="border-r border-[#808080]">Receipt From</span>
            <span className="border-r border-[#808080]">Receipt To</span>
            <span className="border-r border-[#808080]">Allot.Date</span>
            <span>Rec.Date</span>
          </div>

          <div className="flex-1 bg-[#808080] overflow-auto text-xs font-mono text-white">
            {allotments.map((a, idx) => (
              <div key={idx} className="grid grid-cols-5 border-b border-slate-600 text-center py-1 text-xs hover:bg-blue-600 cursor-pointer">
                <span className="border-r border-slate-600">{a.sno}</span>
                <span className="border-r border-slate-600 font-bold">{a.from}</span>
                <span className="border-r border-slate-600 font-bold">{a.to}</span>
                <span className="border-r border-slate-600">{a.allotDate}</span>
                <span>{a.recDate || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {msg && (
          <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-50 py-0.5 border border-emerald-300 mt-2">
            {msg}
          </div>
        )}

      </div>

    </div>
  );
}
