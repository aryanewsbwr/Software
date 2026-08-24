'use client';

import React, { useState } from 'react';
import { Hawker } from '@/lib/types';

interface HawkerFormProps {
  onClose: () => void;
  hawkers?: Hawker[];
}

export default function HawkerForm({ onClose, hawkers = [] }: HawkerFormProps) {
  const [selectedHawker, setSelectedHawker] = useState<Hawker>(hawkers[0] || {
    hawker_id: 1,
    name: 'MOHAN JI',
    hindi_name: 'मोहन जी',
    phone: '9829012345',
    address: 'Old City, Beawar'
  });

  const [isFindOpen, setIsFindOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState('');

  const handleSave = () => {
    setMsg('Hawker profile saved successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  const filtered = hawkers.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.hawker_id.toString().includes(searchTerm)
  );

  return (
    <div className="relative w-[680px] h-[480px] vb-window flex flex-col shadow-2xl overflow-hidden font-tahoma">
      {/* Title Bar */}
      <div className="vb-titlebar-xp select-none">
        <div className="flex items-center gap-1.5">
          <img src="/legacy_images/paper.ico" alt="ico" className="w-3.5 h-3.5" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span>Hawker Master (हॉकर विवरण) - ID #{selectedHawker.hawker_id}</span>
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
        style={{ backgroundImage: "url('/legacy_images/Hawker.jpg'), linear-gradient(135deg, #E6F0FA 0%, #FFFFFF 100%)" }}
      >
        {/* Header */}
        <div className="text-center pt-0.5">
          <h1 className="text-xl font-black text-[#8B0000] tracking-wider uppercase drop-shadow-xs">
            HAWKER MASTER (हॉकर मास्टर)
          </h1>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-12 gap-y-2 gap-x-2 text-xs font-bold text-black items-center max-w-[560px] mx-auto w-full pt-1">
          
          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Hawker ID</label>
          <input 
            type="text" 
            value={selectedHawker.hawker_id} 
            readOnly
            className="col-span-8 vb-input font-bold bg-slate-100 font-mono"
          />

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Hawker Name</label>
          <input 
            type="text" 
            value={selectedHawker.name || ''} 
            onChange={(e) => setSelectedHawker({ ...selectedHawker, name: e.target.value })}
            className="col-span-8 vb-input font-bold"
          />

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Hindi Name</label>
          <input 
            type="text" 
            value={selectedHawker.hindi_name || ''} 
            onChange={(e) => setSelectedHawker({ ...selectedHawker, hindi_name: e.target.value })}
            className="col-span-8 vb-input font-hindi font-bold"
          />

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Phone Number</label>
          <input 
            type="text" 
            value={selectedHawker.phone || ''} 
            onChange={(e) => setSelectedHawker({ ...selectedHawker, phone: e.target.value })}
            className="col-span-8 vb-input font-bold"
          />

          <label className="col-span-4 text-right pr-2 text-[#8B0000]">Address</label>
          <input 
            type="text" 
            value={selectedHawker.address || ''} 
            onChange={(e) => setSelectedHawker({ ...selectedHawker, address: e.target.value })}
            className="col-span-8 vb-input"
          />
        </div>

        {/* Message Banner */}
        {msg && (
          <div className="text-center text-xs font-bold text-emerald-800 bg-emerald-100 py-0.5 border border-emerald-400">
            {msg}
          </div>
        )}

        {/* Action Buttons matching screenshot_04.jpg */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-300/80">
          <button onClick={handleSave} className="vb-action-btn">
            <span>💾 Save</span>
          </button>
          <button onClick={handleSave} className="vb-action-btn">
            <span>🔄 Update</span>
          </button>
          <button onClick={() => setMsg('Hawker record removed.')} className="vb-action-btn">
            <span>🗑️ Del</span>
          </button>
          <button onClick={() => setIsFindOpen(true)} className="vb-action-btn bg-yellow-50">
            <span>🔍 Find ({hawkers.length})</span>
          </button>
          <button onClick={() => setSelectedHawker(hawkers[0])} className="vb-action-btn">
            <span>❌ Cancel</span>
          </button>
          <button onClick={onClose} className="vb-action-btn text-red-700">
            <span>🛑 Exit</span>
          </button>
        </div>
      </div>

      {/* Find Hawker Modal */}
      {isFindOpen && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-[500px] h-[360px] bg-[#ECE9D8] vb-window flex flex-col">
            <div className="vb-titlebar-xp">
              <span>Find Hawker (1,560 Records)</span>
              <button onClick={() => setIsFindOpen(false)} className="vb-win-btn vb-win-btn-close">✕</button>
            </div>
            <div className="p-2 flex-1 flex flex-col gap-2 overflow-hidden text-xs">
              <input 
                type="text" 
                placeholder="Search hawker name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="vb-input w-full"
              />
              <div className="flex-1 bg-white vb-grid overflow-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#ECE9D8]">
                    <tr>
                      <th className="p-1">ID</th>
                      <th className="p-1">Hawker Name</th>
                      <th className="p-1">Hindi Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 50).map(h => (
                      <tr 
                        key={h.hawker_id}
                        onClick={() => { setSelectedHawker(h); setIsFindOpen(false); }}
                        className="cursor-pointer hover:bg-[#316AC5] hover:text-white border-b"
                      >
                        <td className="p-1 font-mono">#{h.hawker_id}</td>
                        <td className="p-1 font-bold">{h.name}</td>
                        <td className="p-1 font-hindi">{h.hindi_name || '-'}</td>
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
