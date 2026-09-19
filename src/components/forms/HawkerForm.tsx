'use client';

import React, { useState, useEffect } from 'react';
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

  // Load selected hawker data
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

  // Keyboard shortcut handler (Alt+S, Alt+U, Alt+D, Alt+F, Alt+C, Alt+E, Esc)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          handleSave();
        } else if (key === 'u') {
          e.preventDefault();
          handleSave();
        } else if (key === 'd') {
          e.preventDefault();
          handleDelete();
        } else if (key === 'f') {
          e.preventDefault();
          setIsFindOpen(true);
        } else if (key === 'c') {
          e.preventDefault();
          handleCancel();
        } else if (key === 'e') {
          e.preventDefault();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, name, address, city, phone, mobile, selectedHawkerId, allottedRegions]);

  if (!isOpen) return null;

  const toggleRegion = (regionId: number) => {
    if (allottedRegions.includes(regionId)) {
      setAllottedRegions(allottedRegions.filter(id => id !== regionId));
    } else {
      setAllottedRegions([...allottedRegions, regionId]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setStatus('Error: Hawker Name cannot be empty');
      setTimeout(() => setStatus(''), 3000);
      return;
    }
    const payload = {
      hawker_id: selectedHawkerId || undefined,
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      phone: phone.trim(),
      mobile: mobile.trim(),
      region_id: allottedRegions[0] || 1,
      allottedRegions
    };

    try {
      const res = await fetch('/api/hawkers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.hawker?.hawker_id && !selectedHawkerId) {
        setSelectedHawkerId(data.hawker.hawker_id);
      }
      if (onSaveHawker) {
        onSaveHawker(data.hawker || payload, allottedRegions);
      }
      setStatus(`Hawker "${name.trim()}" saved successfully in Supabase!`);
    } catch (err: any) {
      setStatus(`Error saving hawker: ${err.message}`);
    }
    setTimeout(() => setStatus(''), 3000);
  };

  const handleDelete = async () => {
    if (!selectedHawkerId) {
      setStatus('Please find and select a hawker first to delete.');
      setTimeout(() => setStatus(''), 3000);
      return;
    }
    if (window.confirm(`Are you sure you want to delete Hawker "${name}"?`)) {
      try {
        const res = await fetch(`/api/hawkers?id=${selectedHawkerId}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setStatus(`Hawker "${name}" deleted.`);
        handleCancel();
      } catch (err: any) {
        setStatus(`Error deleting hawker: ${err.message}`);
      }
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleCancel = () => {
    setSelectedHawkerId(null);
    setName('');
    setAddress('');
    setCity('');
    setPhone('');
    setMobile('');
    setAllottedRegions([]);
    setStatus('');
  };

  const filteredHawkers = hawkers.filter(h => 
    (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.hawker_id.toString().includes(searchQuery) ||
    (h.phone || '').includes(searchQuery) ||
    (h.mobile || '').includes(searchQuery)
  );

  return (
    <div className="w-[660px] bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl font-tahoma flex flex-col relative select-none">
      {/* Titlebar */}
      <div className="bg-linear-to-r from-[#0A246A] via-[#3A6EA5] to-[#A6CAF0] text-white px-2 py-1 flex items-center justify-between font-bold text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🗞️</span>
          <span className="tracking-wide">Hawker Master</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-5 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">_</button>
          <button className="w-5 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">□</button>
          <button onClick={onClose} className="w-5 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="p-4 space-y-3 bg-[#ECE9D8] text-xs">
        <h2 className="text-center font-black text-[#800000] text-lg tracking-wider">
          HAWKER DETAIL
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
          {/* Left Inputs */}
          <div className="md:col-span-2 space-y-2 bg-white p-3 border border-[#808080] shadow-inner">
            <div className="flex items-center gap-2">
              <label className="w-16 font-bold text-[#800000] shrink-0">Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#7F9DB9] bg-white font-bold text-blue-900 shadow-inner outline-none"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-16 font-bold text-[#800000] shrink-0">Address</label>
              <input 
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#7F9DB9] bg-white text-black shadow-inner outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-16 font-bold text-[#800000] shrink-0">City</label>
              <input 
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#7F9DB9] bg-white text-black shadow-inner outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-16 font-bold text-[#800000] shrink-0">Phone</label>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#7F9DB9] bg-white shadow-inner font-mono outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="w-16 font-bold text-[#800000] shrink-0">Mobile</label>
              <input 
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="flex-1 px-2 py-0.5 border border-[#7F9DB9] bg-white shadow-inner font-mono outline-none"
              />
            </div>
          </div>

          {/* Right Region Allotment Checklist */}
          <div className="border border-[#808080] bg-white shadow-inner flex flex-col h-[175px]">
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
                      className="cursor-pointer"
                    />
                    <span className="truncate">{reg.region_name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {status && (
          <div className={`p-1.5 font-bold text-center text-xs ${status.startsWith('Error') ? 'bg-red-100 text-red-800 border border-red-400' : 'bg-emerald-100 text-emerald-800 border border-emerald-400'}`}>
            {status}
          </div>
        )}

        {/* Slanted Parallelogram Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-[#808080]">
          <button 
            onClick={handleSave}
            className="px-4 py-1 bg-linear-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] text-black font-bold text-xs transform -skew-x-12 shadow-xs cursor-pointer"
          >
            <span className="transform skew-x-12 flex items-center gap-1">
              💾 <u>S</u>ave
            </span>
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-1 bg-linear-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] text-black font-bold text-xs transform -skew-x-12 shadow-xs cursor-pointer"
          >
            <span className="transform skew-x-12 flex items-center gap-1">
              ↩ <u>U</u>pdate
            </span>
          </button>
          <button 
            onClick={handleDelete}
            className="px-4 py-1 bg-linear-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] text-black font-bold text-xs transform -skew-x-12 shadow-xs cursor-pointer"
          >
            <span className="transform skew-x-12 flex items-center gap-1">
              🗑 <u>D</u>el
            </span>
          </button>
          <button 
            onClick={() => setIsFindOpen(true)}
            className="px-4 py-1 bg-linear-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] text-black font-bold text-xs transform -skew-x-12 shadow-xs cursor-pointer"
          >
            <span className="transform skew-x-12 flex items-center gap-1">
              🔍 <u>F</u>ind
            </span>
          </button>
          <button 
            onClick={handleCancel}
            className="px-4 py-1 bg-linear-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] text-black font-bold text-xs transform -skew-x-12 shadow-xs cursor-pointer"
          >
            <span className="transform skew-x-12 flex items-center gap-1">
              ✖ <u>C</u>ancel
            </span>
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-1 bg-linear-to-b from-[#E6F4FE] via-[#C8E8FA] to-[#9FD6F4] hover:from-[#F0F8FF] hover:to-[#BCE4FA] active:from-[#89C7ED] active:to-[#D5EBFB] border border-[#006699] text-black font-bold text-xs transform -skew-x-12 shadow-xs cursor-pointer"
          >
            <span className="transform skew-x-12 flex items-center gap-1">
              🛑 <u>E</u>xit
            </span>
          </button>
        </div>
      </div>

      {/* Find Hawker Modal Dialog */}
      {isFindOpen && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl p-3 w-full max-w-md space-y-2 text-xs">
            <div className="bg-[#0A246A] text-white px-2 py-1 font-bold flex justify-between items-center">
              <span>Find Hawker ({filteredHawkers.length} Found)</span>
              <button onClick={() => setIsFindOpen(false)} className="text-white hover:text-red-300 font-bold cursor-pointer">✕</button>
            </div>
            <input 
              type="text"
              placeholder="Search by Hawker Name, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 border border-slate-400 bg-white text-black font-bold outline-none"
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
                  className="w-full text-left px-2 py-1 border-b hover:bg-blue-100 flex justify-between items-center cursor-pointer"
                >
                  <span className="font-bold text-slate-800">{h.name}</span>
                  <span className="text-slate-500 font-mono text-[10px]">#{h.hawker_id}</span>
                </button>
              ))}
              {filteredHawkers.length === 0 && (
                <div className="p-3 text-center text-slate-500">No hawkers found matching &quot;{searchQuery}&quot;</div>
              )}
            </div>
            <div className="flex justify-end">
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
