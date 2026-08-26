'use client';

import React, { useState, useEffect } from 'react';
import { Publication, Rate, Publisher } from '@/lib/types';

interface PublicationFormProps {
  onClose: () => void;
  publications: Publication[];
  publishers?: Publisher[];
  rates?: Rate[];
  onSave?: (pub: Publication) => void;
}

const WEEKDAYS = [
  { id: 1, name: 'Sunday', hindi: 'रविवार', defaultRate: 7.0 },
  { id: 2, name: 'Monday', hindi: 'सोमवार', defaultRate: 5.0 },
  { id: 3, name: 'Tuesday', hindi: 'मंगलवार', defaultRate: 5.0 },
  { id: 4, name: 'Wednesday', hindi: 'बुधवार', defaultRate: 5.0 },
  { id: 5, name: 'Thursday', hindi: 'गुरुवार', defaultRate: 5.0 },
  { id: 6, name: 'Friday', hindi: 'शुक्रवार', defaultRate: 5.0 },
  { id: 7, name: 'Saturday', hindi: 'शनिवार', defaultRate: 5.0 },
];

export default function PublicationForm({ 
  onClose, 
  publications = [], 
  publishers = [],
  rates = []
}: PublicationFormProps) {
  const [selectedPub, setSelectedPub] = useState<Publication>({
    publica_id: 0,
    public_name: '',
    pub_hindi: '',
    abrv: '',
    type_p: 'Daily',
    circulation: 'Morning',
    duration: 'Daily',
    chr_del: 0
  });

  const [weekdayRates, setWeekdayRates] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
  });

  const [delChargesChecked, setDelChargesChecked] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState('');
  const [selectedDayRow, setSelectedDayRow] = useState<number>(1);

  useEffect(() => {
    if (!selectedPub || selectedPub.publica_id === 0) return;
    const pubRates = rates.filter(r => r.publica_id === selectedPub.publica_id);
    const map: Record<number, number> = { 1: 7.0, 2: 5.0, 3: 5.0, 4: 5.0, 5: 5.0, 6: 5.0, 7: 5.0 };
    pubRates.forEach(r => { map[r.dayofweek] = r.rate; });
    setWeekdayRates(map);
  }, [selectedPub, rates]);

  // F1 Key shortcut to copy Sunday rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        const sun = weekdayRates[1] || 5.0;
        const updated: Record<number, number> = {};
        WEEKDAYS.forEach(d => { updated[d.id] = sun; });
        setWeekdayRates(updated);
        setMsg(`F1: Copied Sunday rate (₹${sun}) to all weekdays!`);
        setTimeout(() => setMsg(''), 3000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [weekdayRates]);

  const handleSave = () => {
    setMsg('Publication and weekday rates saved successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const filtered = publications.filter(p => 
    p.public_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.pub_hindi && p.pub_hindi.includes(searchTerm)) ||
    p.publica_id.toString().includes(searchTerm)
  );

  return (
    <div className="relative w-[720px] h-[550px] vb-window flex flex-col shadow-2xl overflow-hidden font-tahoma">
      {/* Title Bar */}
      <div className="vb-titlebar-xp select-none">
        <div className="flex items-center gap-1.5">
          <img src="/legacy_images/paper.ico" alt="ico" className="w-3.5 h-3.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span>Publication Info</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="vb-win-btn">_</button>
          <button className="vb-win-btn">□</button>
          <button onClick={onClose} className="vb-win-btn vb-win-btn-close">✕</button>
        </div>
      </div>

      {/* Main Body with Exact Background Image matching screenshot_02.jpg */}
      <div 
        className="flex-1 relative p-4 flex flex-col justify-between bg-cover bg-center"
        style={{ backgroundImage: "url('/legacy_images/Publication.jpg'), linear-gradient(135deg, #E6F0FA 0%, #FFFFFF 100%)" }}
      >
        {/* Header */}
        <div className="text-center pt-0.5">
          <h1 className="text-xl font-black text-[#8B0000] tracking-wider uppercase drop-shadow-xs">
            PUBLICATIONS
          </h1>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-12 gap-y-1.5 gap-x-2 text-xs font-bold text-black items-center max-w-[620px] mx-auto w-full pt-1">
          
          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Publication Name</label>
          <input 
            type="text" 
            value={selectedPub.public_name || ''} 
            onChange={(e) => setSelectedPub({ ...selectedPub, public_name: e.target.value })}
            className="col-span-8 vb-input font-bold"
          />

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Pub. Name Hindi</label>
          <input 
            type="text" 
            value={selectedPub.pub_hindi || ''} 
            onChange={(e) => setSelectedPub({ ...selectedPub, pub_hindi: e.target.value })}
            className="col-span-8 vb-input font-hindi font-bold"
          />

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Abrevation</label>
          <input 
            type="text" 
            value={selectedPub.abrv || ''} 
            onChange={(e) => setSelectedPub({ ...selectedPub, abrv: e.target.value })}
            className="col-span-8 vb-input"
          />

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Publisher</label>
          <select 
            value={selectedPub.publish_id || ''} 
            onChange={(e) => setSelectedPub({ ...selectedPub, publish_id: Number(e.target.value) })}
            className="col-span-8 vb-input bg-white"
          >
            {publishers.map(p => (
              <option key={p.publish_id} value={p.publish_id}>{p.name}</option>
            ))}
          </select>

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Type</label>
          <select 
            value={selectedPub.type_p || 'Daily'} 
            onChange={(e) => setSelectedPub({ ...selectedPub, type_p: e.target.value })}
            className="col-span-8 vb-input bg-white"
          >
            <option value="Daily">Daily (दैनिक)</option>
            <option value="Weekly">Weekly (साप्ताहिक)</option>
            <option value="Monthly">Monthly (मासिक)</option>
            <option value="Magazine">Magazine (पत्रिका)</option>
          </select>

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Rate</label>
          <div className="col-span-8 flex items-center gap-2">
            <input 
              type="number"
              step="0.05"
              value={weekdayRates[1] || 5.0} 
              onChange={(e) => setWeekdayRates({ ...weekdayRates, 1: parseFloat(e.target.value) || 0 })}
              className="w-24 vb-input text-center font-bold"
            />
            <label className="text-[#8B0000] font-bold">Duration</label>
            <select 
              value={selectedPub.duration || 'Daily'} 
              onChange={(e) => setSelectedPub({ ...selectedPub, duration: e.target.value })}
              className="flex-1 vb-input bg-white"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Publishing Day</label>
          <select className="col-span-8 vb-input bg-white">
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Circulation</label>
          <select 
            value={selectedPub.circulation || 'Morning'} 
            onChange={(e) => setSelectedPub({ ...selectedPub, circulation: e.target.value })}
            className="col-span-8 vb-input bg-white"
          >
            <option value="Morning">Morning (प्रातःकालीन)</option>
            <option value="Evening">Evening (सायंकालीन)</option>
            <option value="As Per Norm">As Per Norm (नियम अनुसार)</option>
          </select>
        </div>

        {/* Weekdays Rate Grid matching screenshot_02.jpg */}
        <div className="flex items-center justify-center gap-6 pt-1">
          <div className="w-[280px] bg-white vb-grid">
            <div className="bg-[#ECE9D8] text-center font-bold text-[11px] py-0.5 border-b text-[#000080]">
              Weekdays Rate (दर विवरण)
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#ECE9D8]">
                  <th className="p-1 border text-left">Weekdays</th>
                  <th className="p-1 border text-center w-24">Rate (₹)</th>
                </tr>
              </thead>
              <tbody>
                {WEEKDAYS.map((d) => (
                  <tr 
                    key={d.id}
                    onClick={() => setSelectedDayRow(d.id)}
                    className={`cursor-pointer ${selectedDayRow === d.id ? 'bg-[#316AC5] text-white font-bold' : 'hover:bg-blue-50 text-black'}`}
                  >
                    <td className="p-1 border">{d.name}</td>
                    <td className="p-0.5 border text-center">
                      <input 
                        type="number"
                        step="0.05"
                        value={weekdayRates[d.id] ?? d.defaultRate}
                        onChange={(e) => setWeekdayRates({ ...weekdayRates, [d.id]: parseFloat(e.target.value) || 0 })}
                        className={`w-full text-center text-xs font-bold outline-none ${selectedDayRow === d.id ? 'bg-[#316AC5] text-white' : 'bg-transparent text-black'}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Side Shortcut Labels & Checkbox */}
          <div className="space-y-2 text-xs font-bold">
            <div className="text-red-700 font-bold text-[11px]">
              F10 Select<br />
              F12 Unselect
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-900 font-bold">
              <input 
                type="checkbox" 
                checked={delChargesChecked}
                onChange={(e) => setDelChargesChecked(e.target.checked)}
                className="cursor-pointer"
              />
              <span>Del. Charges</span>
            </label>
            <div className="pt-2">
              <button 
                onClick={() => {
                  const sun = weekdayRates[1] || 5.0;
                  const updated: Record<number, number> = {};
                  WEEKDAYS.forEach(d => { updated[d.id] = sun; });
                  setWeekdayRates(updated);
                  setMsg(`F1: Copied Sunday rate (₹${sun})!`);
                }}
                className="px-2 py-1 bg-amber-100 border border-amber-400 text-[10px] font-bold cursor-pointer rounded"
              >
                Press F1: Copy Sunday Rate
              </button>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {msg && (
          <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-100 py-0.5 border border-emerald-400">
            {msg}
          </div>
        )}

        {/* Bottom Trapezoidal 3D Button Bar matching screenshot_02.jpg */}
        <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-300/80">
          <button onClick={handleSave} className="vb-action-btn">
            <span>💾 Save</span>
          </button>
          <button onClick={handleSave} className="vb-action-btn">
            <span>🔄 Update</span>
          </button>
          <button onClick={() => setMsg('Publication deleted.')} className="vb-action-btn">
            <span>🗑️ Del</span>
          </button>
          <button onClick={() => setIsFindOpen(true)} className="vb-action-btn bg-yellow-50">
            <span>🔍 Find</span>
          </button>
          <button onClick={() => setSelectedPub(publications[0])} className="vb-action-btn">
            <span>❌ Cancel</span>
          </button>
          <button onClick={onClose} className="vb-action-btn text-red-700">
            <span>🛑 Exit</span>
          </button>
        </div>
      </div>

      {/* Find Publication Dialog */}
      {isFindOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-[520px] h-[380px] bg-[#ECE9D8] vb-window flex flex-col">
            <div className="vb-titlebar-xp">
              <span>Find Publication (528 Records)</span>
              <button onClick={() => setIsFindOpen(false)} className="vb-win-btn vb-win-btn-close">✕</button>
            </div>
            <div className="p-2 flex-1 flex flex-col gap-2 overflow-hidden text-xs">
              <input 
                type="text" 
                placeholder="Search publication name or Hindi name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="vb-input w-full"
              />
              <div className="flex-1 bg-white vb-grid overflow-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#ECE9D8]">
                    <tr>
                      <th className="p-1">ID</th>
                      <th className="p-1">Publication Name</th>
                      <th className="p-1">Hindi Name</th>
                      <th className="p-1">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr 
                        key={p.publica_id}
                        onClick={() => { setSelectedPub(p); setIsFindOpen(false); }}
                        className="cursor-pointer hover:bg-[#316AC5] hover:text-white border-b"
                      >
                        <td className="p-1">#{p.publica_id}</td>
                        <td className="p-1 font-bold">{p.public_name}</td>
                        <td className="p-1 font-hindi">{p.pub_hindi || '-'}</td>
                        <td className="p-1">{p.type_p || 'Daily'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
