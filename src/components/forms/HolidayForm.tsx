'use client';

import React, { useState } from 'react';
import { Holiday, Publication } from '@/lib/types';

interface HolidayFormProps {
  onClose: () => void;
  holidays?: Holiday[];
  publications?: Publication[];
}

export default function HolidayForm({ onClose, holidays = [], publications = [] }: HolidayFormProps) {
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split('T')[0]);
  const [publicaId, setPublicaId] = useState<number>(4);
  const [remark, setRemark] = useState('Holi Festival (होली अवकाश)');
  const [msg, setMsg] = useState('');

  const handleSave = () => {
    setMsg('Holiday declared for publication on selected date!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="relative w-[680px] h-[480px] vb-window flex flex-col shadow-2xl overflow-hidden font-tahoma">
      {/* Title Bar */}
      <div className="vb-titlebar-xp select-none">
        <div className="flex items-center gap-1.5">
          <img src="/legacy_images/paper.ico" alt="ico" className="w-3.5 h-3.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span>Holiday Master (अवकाश प्रबंधन)</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="vb-win-btn">_</button>
          <button className="vb-win-btn">□</button>
          <button onClick={onClose} className="vb-win-btn vb-win-btn-close">✕</button>
        </div>
      </div>

      {/* Main Body */}
      <div 
        className="flex-1 relative p-4 flex flex-col justify-between bg-cover bg-center"
        style={{ backgroundImage: "url('/legacy_images/Holiday.jpg'), linear-gradient(135deg, #E6F0FA 0%, #FFFFFF 100%)" }}
      >
        {/* Header */}
        <div className="text-center pt-0.5">
          <h1 className="text-xl font-black text-[#8B0000] tracking-wider uppercase drop-shadow-xs">
            PUBLICATION HOLIDAY MASTER
          </h1>
          <span className="text-xs font-bold text-slate-700">
            Holidays automatically zero out billing & supply for the paper on this date.
          </span>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-12 gap-y-2 gap-x-2 text-xs font-bold text-black items-center max-w-[560px] mx-auto w-full pt-2">
          
          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Holiday Date</label>
          <input 
            type="date" 
            value={holidayDate} 
            onChange={(e) => setHolidayDate(e.target.value)}
            className="col-span-8 vb-input font-bold"
          />

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Publication</label>
          <select 
            value={publicaId} 
            onChange={(e) => setPublicaId(Number(e.target.value))}
            className="col-span-8 vb-input bg-white font-bold"
          >
            {publications.map(p => (
              <option key={p.publica_id} value={p.publica_id}>{p.public_name}</option>
            ))}
          </select>

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Holiday Reason / Remark</label>
          <input 
            type="text" 
            value={remark} 
            onChange={(e) => setRemark(e.target.value)}
            className="col-span-8 vb-input font-bold"
          />
        </div>

        {/* Message Banner */}
        {msg && (
          <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-100 py-0.5 border border-emerald-400">
            {msg}
          </div>
        )}

        {/* Action Buttons matching screenshot_07.jpg */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-300/80">
          <button onClick={handleSave} className="vb-action-btn">
            <span>💾 Save</span>
          </button>
          <button onClick={handleSave} className="vb-action-btn">
            <span>🔄 Update</span>
          </button>
          <button onClick={() => setMsg('Holiday removed.')} className="vb-action-btn">
            <span>🗑️ Del</span>
          </button>
          <button onClick={() => setMsg('Showing recent holidays')} className="vb-action-btn bg-yellow-50">
            <span>🔍 Find ({holidays.length})</span>
          </button>
          <button onClick={onClose} className="vb-action-btn text-red-700">
            <span>🛑 Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
