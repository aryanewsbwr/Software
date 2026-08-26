'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Save, Trash2, X, Search, RefreshCw } from 'lucide-react';
import { Hawker, Region } from '@/lib/types';

interface Props {
  isOpen?: boolean;
  onClose: () => void;
  hawkers?: Hawker[];
  regions?: Region[];
  onSaveHawker?: (hawker: Partial<Hawker>, allottedRegions: number[]) => void;
}

export default function HawkerForm({ isOpen = true, onClose, hawkers = [], regions = [], onSaveHawker }: Props) {
  const [selectedHawkerId, setSelectedHawkerId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [mobile, setMobile] = useState('');
  const [allottedRegions, setAllottedRegions] = useState<number[]>([]);
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');

  // Load selected hawker
  useEffect(() => {
    if (!selectedHawkerId) return;
    const h = hawkers.find(hk => hk.hawker_id === selectedHawkerId);
    if (h) {
      setName(h.name || '');
      setAddress(h.address || '');
      setCity(h.city || '');
      setPhone(h.phone || '');
      setMobile(h.mobile || '');
      setAllottedRegions(h.region_id ? [h.region_id] : []);
    }
  }, [selectedHawkerId, hawkers]);

  if (!isOpen) return null;

  const toggleRegion = (regionId: number) => {
    if (allottedRegions.includes(regionId)) {
      setAllottedRegions(allottedRegions.filter(id => id !== regionId));
    } else {
      setAllottedRegions([...allottedRegions, regionId]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setStatus('Error: Hawker Name cannot be empty');
      return;
    }
    if (onSaveHawker) {
      onSaveHawker({
        hawker_id: selectedHawkerId || undefined,
        name,
        address,
        city,
        phone,
        mobile,
        region_id: allottedRegions[0] || 1
      }, allottedRegions);
    }
    setStatus(`Hawker "${name}" saved successfully with ${allottedRegions.length} allotted region(s).`);
    setTimeout(() => setStatus(''), 3000);
  };

  const handleNew = () => {
    setSelectedHawkerId(null);
    setName('');
    setAddress('');
    setCity('');
    setPhone('');
    setMobile('');
    setAllottedRegions([]);
  };

  const filteredHawkers = hawkers.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.hawker_id.toString().includes(searchQuery)
  );

  return (
    <div className="w-full max-w-2xl bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl font-tahoma flex flex-col relative select-none">
      {/* Titlebar */}
      <div className="bg-linear-to-r from-[#0A246A] to-[#A6CAF0] text-white px-2 py-0.5 flex items-center justify-between font-bold text-xs">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-yellow-300" />
          <span>Hawker Master</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">_</button>
          <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">□</button>
          <button onClick={onClose} className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* Main Form Body matching screenshot_04.jpg */}
      <div className="p-4 space-y-4 text-xs">
        <h2 className="text-center font-black text-maroon-800 text-lg tracking-wider text-[#800000]">
          HAWKER DETAIL
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Left Inputs */}
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-3">
              <label className="w-20 font-bold text-[#800000]">Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#808080] bg-white font-bold text-blue-900 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-20 font-bold text-[#800000]">Address</label>
              <input 
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#808080] bg-white shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-20 font-bold text-[#800000]">City</label>
              <input 
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#808080] bg-white shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-20 font-bold text-[#800000]">Phone</label>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#808080] bg-white shadow-inner font-mono"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-20 font-bold text-[#800000]">Mobile</label>
              <input 
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#808080] bg-white shadow-inner font-mono"
              />
            </div>
          </div>

          {/* Right Region Allotment Checklist matching screenshot_04.jpg */}
          <div className="border border-[#808080] bg-white shadow-inner flex flex-col h-44">
            <div className="bg-[#ECE9D8] border-b border-[#808080] px-2 py-1 font-bold text-[11px] text-slate-800 flex justify-between items-center">
              <span>Region Allotment</span>
              <span className="text-[10px] text-blue-800">({allottedRegions.length} checked)</span>
            </div>
            <div className="p-1 overflow-auto flex-1 space-y-1">
              {regions.map((reg) => {
                const isChecked = allottedRegions.includes(reg.region_id);
                return (
                  <label 
                    key={reg.region_id}
                    className={`flex items-center gap-2 px-1.5 py-0.5 text-[11px] cursor-pointer select-none rounded-xs ${isChecked ? 'bg-blue-100 font-bold text-blue-900' : 'hover:bg-slate-100 text-slate-800'}`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRegion(reg.region_id)}
                      className="rounded-xs"
                    />
                    <span className="truncate">{reg.region_name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {status && (
          <div className="p-1.5 bg-emerald-100 text-emerald-800 border border-emerald-400 font-bold text-center text-xs">
            {status}
          </div>
        )}

        {/* Bottom Action Slanted Buttons matching screenshot_04.jpg */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-[#808080]">
          <button 
            onClick={handleSave}
            className="px-4 py-1 bg-[#D4F0FF] hover:bg-[#BCE5FF] border border-[#006699] text-black font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            💾 <u>S</u>ave
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-1 bg-[#D4F0FF] hover:bg-[#BCE5FF] border border-[#006699] text-black font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            ↪ <u>U</u>pdate
          </button>
          <button 
            onClick={handleNew}
            className="px-4 py-1 bg-[#D4F0FF] hover:bg-[#BCE5FF] border border-[#006699] text-black font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            🗑 <u>D</u>el
          </button>
          <button 
            onClick={() => setIsFindOpen(true)}
            className="px-4 py-1 bg-[#D4F0FF] hover:bg-[#BCE5FF] border border-[#006699] text-black font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            🔍 <u>F</u>ind
          </button>
          <button 
            onClick={handleNew}
            className="px-4 py-1 bg-[#D4F0FF] hover:bg-[#BCE5FF] border border-[#006699] text-black font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            ✖ <u>C</u>ancel
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-1 bg-[#D4F0FF] hover:bg-[#BCE5FF] border border-[#006699] text-black font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
          >
            🛑 <u>E</u>xit
          </button>
        </div>
      </div>

      {/* Find Hawker Modal Dialog */}
      {isFindOpen && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ECE9D8] border-2 border-white shadow-2xl p-3 w-full max-w-md space-y-2 text-xs">
            <div className="bg-[#0A246A] text-white px-2 py-1 font-bold flex justify-between items-center">
              <span>Find Hawker</span>
              <button onClick={() => setIsFindOpen(false)} className="text-white hover:text-red-300 font-bold">✕</button>
            </div>
            <input 
              type="text"
              placeholder="Search by Hawker Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 border border-slate-400 bg-white"
              autoFocus
            />
            <div className="max-h-48 overflow-auto border border-slate-300 bg-white">
              {filteredHawkers.map(h => (
                <button
                  key={h.hawker_id}
                  onClick={() => {
                    setSelectedHawkerId(h.hawker_id);
                    setIsFindOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 border-b hover:bg-blue-100 flex justify-between items-center"
                >
                  <span className="font-bold">{h.name}</span>
                  <span className="text-slate-500 font-mono text-[10px]">#{h.hawker_id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
