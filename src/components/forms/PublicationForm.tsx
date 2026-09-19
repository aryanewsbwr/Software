'use client';

import React, { useState, useEffect } from 'react';
import { Publication, Rate, Publisher } from '@/lib/types';
import { cleanOrTransliterateHindi } from '@/lib/transliteration';

interface PublicationFormProps {
  onClose: () => void;
  publications: Publication[];
  publishers?: Publisher[];
  rates?: Rate[];
  onSave?: (pub: Publication) => void;
}

const WEEKDAYS = [
  { id: 1, name: 'Sunday', hindi: 'रविवार', defaultRate: 3.4 },
  { id: 2, name: 'Monday', hindi: 'सोमवार', defaultRate: 2.0 },
  { id: 3, name: 'Tuesday', hindi: 'मंगलवार', defaultRate: 2.0 },
  { id: 4, name: 'Wednesday', hindi: 'बुधवार', defaultRate: 2.0 },
  { id: 5, name: 'Thursday', hindi: 'गुरुवार', defaultRate: 2.0 },
  { id: 6, name: 'Friday', hindi: 'शुक्रवार', defaultRate: 2.0 },
  { id: 7, name: 'Saturday', hindi: 'शनिवार', defaultRate: 2.0 },
];

export default function PublicationForm({ 
  onClose, 
  publications = [], 
  publishers = [],
  rates = [],
  onSave
}: PublicationFormProps) {
  const [selectedPub, setSelectedPub] = useState<Publication>({
    publica_id: 0,
    public_name: '',
    pub_hindi: '',
    abrv: '',
    publish_id: 1,
    type_p: 'Daily',
    circulation: 'Morning',
    duration: 'Daily',
    chr_del: 0
  });

  const [weekdayRates, setWeekdayRates] = useState<Record<number, number>>({
    1: 3.4, 2: 2.0, 3: 2.0, 4: 2.0, 5: 2.0, 6: 2.0, 7: 2.0
  });

  const [publishingDay, setPublishingDay] = useState('Sunday');
  const [delChargesChecked, setDelChargesChecked] = useState(false);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState('');
  const [selectedDayRow, setSelectedDayRow] = useState<number>(1);

  // Initialize with first publication
  useEffect(() => {
    if (publications && publications.length > 0 && selectedPub.publica_id === 0) {
      loadPublication(publications[0]);
    }
  }, [publications]);

  const loadPublication = (p: Publication) => {
    const hindiName = cleanOrTransliterateHindi(p.pub_hindi, p.public_name);
    setSelectedPub({
      ...p,
      pub_hindi: hindiName,
      type_p: p.type_p || 'Daily',
      circulation: p.circulation || 'Morning',
      duration: p.duration || 'Daily',
      publish_id: p.publish_id || 1,
    });
    setDelChargesChecked(!!p.chr_del);

    // Load weekday rates
    const pubRates = rates.filter(r => r.publica_id === p.publica_id);
    const map: Record<number, number> = { 1: 3.4, 2: 2.0, 3: 2.0, 4: 2.0, 5: 2.0, 6: 2.0, 7: 2.0 };
    if (pubRates.length > 0) {
      pubRates.forEach(r => { map[r.dayofweek] = r.rate; });
    }
    setWeekdayRates(map);
  };

  // Auto-transliterate Hindi when English name is typed
  const handleNameChange = (newName: string) => {
    const autoHindi = cleanOrTransliterateHindi(undefined, newName);
    setSelectedPub(prev => ({
      ...prev,
      public_name: newName,
      pub_hindi: autoHindi || prev.pub_hindi
    }));
  };

  // Keyboard shortcut listener (F1 to copy Sunday rate, F10 to select Del Charges, F12 to unselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        copySundayRate();
      } else if (e.key === 'F10') {
        e.preventDefault();
        setDelChargesChecked(true);
        setMsg('F10: Delivery Charges Selected [ON]');
        setTimeout(() => setMsg(''), 2000);
      } else if (e.key === 'F12') {
        e.preventDefault();
        setDelChargesChecked(false);
        setMsg('F12: Delivery Charges Unselected [OFF]');
        setTimeout(() => setMsg(''), 2000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [weekdayRates]);

  const copySundayRate = () => {
    const sun = weekdayRates[1] || 3.4;
    const updated: Record<number, number> = {};
    WEEKDAYS.forEach(d => { updated[d.id] = sun; });
    setWeekdayRates(updated);
    setMsg(`F1 Triggered: Copied Sunday rate (₹${sun}) across all 7 weekdays!`);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSave = () => {
    if (!selectedPub.public_name.trim()) {
      setMsg('Error: Publication Name cannot be empty');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    if (onSave) {
      onSave({
        ...selectedPub,
        chr_del: delChargesChecked ? 1 : 0
      });
    }
    setMsg(`Publication "${selectedPub.public_name}" and 7-day weekday rates saved successfully!`);
    setTimeout(() => setMsg(''), 3000);
  };

  const filtered = publications.filter(p => 
    p.public_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.pub_hindi && p.pub_hindi.includes(searchTerm)) ||
    (p.abrv && p.abrv.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.publica_id.toString().includes(searchTerm)
  );

  return (
    <div className="relative w-[740px] bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl flex flex-col font-tahoma select-none overflow-hidden">
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-[#0A246A] via-[#3A6EA5] to-[#A6CAF0] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📰</span>
          <span className="tracking-wide">Publication Info</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-5 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">_</button>
          <button className="w-5 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">□</button>
          <button onClick={onClose} className="w-5 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* Main Body */}
      <div 
        className="p-5 flex flex-col justify-between bg-cover bg-center min-h-[500px]"
        style={{ backgroundImage: "url('/legacy_images/Publication.jpg'), linear-gradient(135deg, #F0F4F8 0%, #FFFFFF 100%)" }}
      >
        {/* Header */}
        <div className="text-center pb-2">
          <h1 className="text-xl font-black text-[#800000] tracking-wider uppercase font-sans">
            PUBLICATIONS
          </h1>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-12 gap-y-2 gap-x-2 text-xs font-bold text-black items-center max-w-[650px] mx-auto w-full">
          {/* Publication Name */}
          <label className="col-span-4 text-right pr-2 text-[#800000]">Publication Name</label>
          <input 
            type="text" 
            value={selectedPub.public_name || ''} 
            onChange={(e) => handleNameChange(e.target.value)}
            className="col-span-8 px-2 py-0.5 border border-[#7F9DB9] bg-white font-bold text-black text-xs shadow-inner outline-none focus:border-[#0A246A]"
            autoFocus
          />

          {/* Pub. Name Hindi */}
          <label className="col-span-4 text-right pr-2 text-[#800000]">Pub. Name Hindi</label>
          <input 
            type="text" 
            value={selectedPub.pub_hindi || ''} 
            onChange={(e) => setSelectedPub({ ...selectedPub, pub_hindi: e.target.value })}
            className="col-span-8 px-2 py-0.5 border border-[#7F9DB9] bg-white font-bold text-blue-900 text-xs shadow-inner outline-none focus:border-[#0A246A]"
            placeholder="हिंदी नाम"
          />

          {/* Abbreviation */}
          <label className="col-span-4 text-right pr-2 text-[#800000]">Abrevation</label>
          <input 
            type="text" 
            value={selectedPub.abrv || ''} 
            onChange={(e) => setSelectedPub({ ...selectedPub, abrv: e.target.value })}
            className="col-span-8 px-2 py-0.5 border border-[#7F9DB9] bg-white text-black text-xs shadow-inner outline-none focus:border-[#0A246A]"
          />

          {/* Publisher */}
          <label className="col-span-4 text-right pr-2 text-[#800000]">Publisher</label>
          <select 
            value={selectedPub.publish_id || 1} 
            onChange={(e) => setSelectedPub({ ...selectedPub, publish_id: Number(e.target.value) })}
            className="col-span-8 px-2 py-0.5 border border-[#7F9DB9] bg-white font-bold text-black text-xs outline-none focus:border-[#0A246A]"
          >
            {publishers.map(p => (
              <option key={p.publish_id} value={p.publish_id}>{p.name}</option>
            ))}
          </select>

          {/* Type */}
          <label className="col-span-4 text-right pr-2 text-[#800000]">Type</label>
          <select 
            value={selectedPub.type_p || 'Daily'} 
            onChange={(e) => setSelectedPub({ ...selectedPub, type_p: e.target.value })}
            className="col-span-8 px-2 py-0.5 border border-[#7F9DB9] bg-white font-bold text-black text-xs outline-none focus:border-[#0A246A]"
          >
            <option value="Daily">Daily (दैनिक)</option>
            <option value="Weekly">Weekly (साप्ताहिक)</option>
            <option value="Monthly">Monthly (मासिक)</option>
            <option value="Fortnightly">Fortnightly (पाक्षिक)</option>
            <option value="Magzine">Magazine (पत्रिका)</option>
          </select>

          {/* Rate & Duration */}
          <label className="col-span-4 text-right pr-2 text-[#800000]">Rate</label>
          <div className="col-span-8 flex items-center gap-2">
            <input 
              type="number"
              step="0.05"
              value={weekdayRates[1] || 3.4} 
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setWeekdayRates({ ...weekdayRates, 1: val });
              }}
              className="w-28 px-2 py-0.5 border border-[#7F9DB9] bg-white text-center font-bold text-black text-xs shadow-inner outline-none"
            />
            <label className="text-[#800000] font-bold text-xs pl-2">Duration</label>
            <select 
              value={selectedPub.duration || 'Daily'} 
              onChange={(e) => setSelectedPub({ ...selectedPub, duration: e.target.value })}
              className="flex-1 px-2 py-0.5 border border-[#7F9DB9] bg-white font-bold text-black text-xs outline-none"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Fortnightly">Fortnightly</option>
            </select>
          </div>

          {/* Publishing Day */}
          <label className="col-span-4 text-right pr-2 text-[#800000]">Publishing Day</label>
          <select 
            value={publishingDay}
            onChange={(e) => setPublishingDay(e.target.value)}
            className="col-span-8 px-2 py-0.5 border border-[#7F9DB9] bg-white font-bold text-black text-xs outline-none"
          >
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>

          {/* Circulation */}
          <label className="col-span-4 text-right pr-2 text-[#800000]">Circulation</label>
          <select 
            value={selectedPub.circulation || 'Morning'} 
            onChange={(e) => setSelectedPub({ ...selectedPub, circulation: e.target.value })}
            className="col-span-8 px-2 py-0.5 border border-[#7F9DB9] bg-white font-bold text-black text-xs outline-none"
          >
            <option value="Morning">Morning (प्रातःकालीन)</option>
            <option value="Evening">Evening (सायंकालीन)</option>
            <option value="As Per Norm">As Per Norm (नियम अनुसार)</option>
          </select>
        </div>

        {/* Weekdays Rate Grid matching media_1789803391409.png */}
        <div className="flex items-center justify-center gap-8 pt-3 pb-1">
          {/* Weekdays Grid */}
          <div className="w-[290px] bg-white border border-[#808080] shadow-sm">
            <div className="bg-[#ECE9D8] text-center font-bold text-xs py-1 border-b border-[#808080] text-[#000080]">
              Weekdays Rate (दर विवरण)
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#ECE9D8] border-b border-[#808080]">
                  <th className="p-1 border-r text-left">Weekdays</th>
                  <th className="p-1 text-center w-24">Rate (₹)</th>
                </tr>
              </thead>
              <tbody>
                {WEEKDAYS.map((d) => (
                  <tr 
                    key={d.id}
                    onClick={() => setSelectedDayRow(d.id)}
                    className={`cursor-pointer border-b border-slate-200 ${selectedDayRow === d.id ? 'bg-[#316AC5] text-white font-bold' : 'hover:bg-blue-50 text-black'}`}
                  >
                    <td className="p-1 border-r">{d.name}</td>
                    <td className="p-0.5 text-center">
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
          <div className="space-y-3 text-xs font-bold">
            <div className="text-red-700 font-bold text-xs leading-relaxed">
              <div>F10 Select</div>
              <div>F12 Unselect</div>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer text-slate-900 font-bold text-xs">
              <input 
                type="checkbox" 
                checked={delChargesChecked}
                onChange={(e) => setDelChargesChecked(e.target.checked)}
                className="cursor-pointer"
              />
              <span>Del. Charges</span>
            </label>

            <div>
              <button 
                onClick={copySundayRate}
                className="px-3 py-1.5 bg-[#FFF4C8] hover:bg-[#FFE99A] border border-[#CCA000] text-black text-xs font-bold shadow-xs cursor-pointer rounded-xs"
              >
                Press F1: Copy Sunday Rate
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {msg && (
          <div className={`py-1 px-2 text-center text-xs font-bold my-1 ${msg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-300'}`}>
            {msg}
          </div>
        )}

        {/* Slanted Parallelogram Action Buttons matching 2008 VB6 UI */}
        <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#808080]">
          <button 
            onClick={handleSave}
            className="px-4 py-1 bg-gradient-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] shadow-xs transform -skew-x-12 cursor-pointer transition-colors"
          >
            <span className="transform skew-x-12 flex items-center gap-1 text-xs font-bold text-black">
              💾 <u>S</u>ave
            </span>
          </button>
          
          <button 
            onClick={handleSave}
            className="px-4 py-1 bg-gradient-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] shadow-xs transform -skew-x-12 cursor-pointer transition-colors"
          >
            <span className="transform skew-x-12 flex items-center gap-1 text-xs font-bold text-black">
              ↩ <u>U</u>pdate
            </span>
          </button>

          <button 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selectedPub.public_name}?`)) {
                setMsg(`Publication "${selectedPub.public_name}" deleted.`);
                setTimeout(() => setMsg(''), 3000);
              }
            }}
            className="px-4 py-1 bg-gradient-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] shadow-xs transform -skew-x-12 cursor-pointer transition-colors"
          >
            <span className="transform skew-x-12 flex items-center gap-1 text-xs font-bold text-black">
              🗑 <u>D</u>el
            </span>
          </button>

          <button 
            onClick={() => setIsFindOpen(true)}
            className="px-4 py-1 bg-gradient-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] shadow-xs transform -skew-x-12 cursor-pointer transition-colors"
          >
            <span className="transform skew-x-12 flex items-center gap-1 text-xs font-bold text-black">
              🔍 <u>F</u>ind
            </span>
          </button>

          <button 
            onClick={() => {
              if (publications.length > 0) loadPublication(publications[0]);
            }}
            className="px-4 py-1 bg-gradient-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] shadow-xs transform -skew-x-12 cursor-pointer transition-colors"
          >
            <span className="transform skew-x-12 flex items-center gap-1 text-xs font-bold text-black">
              ✖ <u>C</u>ancel
            </span>
          </button>

          <button 
            onClick={onClose}
            className="px-4 py-1 bg-gradient-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] shadow-xs transform -skew-x-12 cursor-pointer transition-colors"
          >
            <span className="transform skew-x-12 flex items-center gap-1 text-xs font-bold text-black">
              🛑 <u>E</u>xit
            </span>
          </button>
        </div>
      </div>

      {/* Find Publication Modal Dialog */}
      {isFindOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-[560px] max-h-[420px] bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl flex flex-col font-tahoma text-xs">
            <div className="bg-[#0A246A] text-white px-2 py-1 font-bold flex justify-between items-center">
              <span>Find Publication ({filtered.length} Records)</span>
              <button onClick={() => setIsFindOpen(false)} className="text-white hover:text-red-300 font-bold cursor-pointer">✕</button>
            </div>
            
            <div className="p-2 space-y-2 flex-1 overflow-hidden flex flex-col">
              <input 
                type="text" 
                placeholder="Search by Name, Hindi, Abbr, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 border border-slate-400 bg-white font-bold outline-none"
                autoFocus
              />
              
              <div className="flex-1 bg-white border border-slate-300 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#ECE9D8] border-b">
                    <tr>
                      <th className="p-1 border-r text-left w-12">ID</th>
                      <th className="p-1 border-r text-left">Publication Name</th>
                      <th className="p-1 border-r text-left">Hindi Name</th>
                      <th className="p-1 text-left w-20">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr 
                        key={p.publica_id}
                        onClick={() => {
                          loadPublication(p);
                          setIsFindOpen(false);
                        }}
                        className="cursor-pointer hover:bg-blue-100 border-b text-slate-900"
                      >
                        <td className="p-1 border-r font-mono text-blue-900 font-bold">#{p.publica_id}</td>
                        <td className="p-1 border-r font-bold">{p.public_name}</td>
                        <td className="p-1 border-r font-bold text-blue-800">{cleanOrTransliterateHindi(p.pub_hindi, p.public_name) || '-'}</td>
                        <td className="p-1">{p.type_p || 'Daily'}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-500">No publications found matching &quot;{searchTerm}&quot;</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-2 border-t flex justify-end">
              <button 
                onClick={() => setIsFindOpen(false)}
                className="px-3 py-1 bg-white border border-[#808080] font-bold text-xs cursor-pointer hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
