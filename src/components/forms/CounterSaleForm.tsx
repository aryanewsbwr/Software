'use client';

import React, { useState } from 'react';
import { ShoppingCart, Plus, Save, Trash2, X, Printer, Calendar, DollarSign } from 'lucide-react';
import { Publication } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  publications: Publication[];
}

interface SaleItem {
  id: number;
  publica_id: number;
  pub_name: string;
  qty: number;
  rate: number;
  total: number;
}

export default function CounterSaleForm({ isOpen, onClose, publications }: Props) {
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('Walk-in Counter Customer (काउंटर ग्राहक)');
  const [items, setItems] = useState<SaleItem[]>([
    { id: 1, publica_id: 1, pub_name: 'Dainik Bhaskar', qty: 2, rate: 5.0, total: 10.0 },
    { id: 2, publica_id: 2, pub_name: 'Rajasthan Patrika', qty: 1, rate: 5.0, total: 5.0 }
  ]);

  const [selectedPubId, setSelectedPubId] = useState<number>(publications[0]?.publica_id || 1);
  const [inputQty, setInputQty] = useState<number>(1);
  const [inputRate, setInputRate] = useState<number>(5.0);
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    const pub = publications.find(p => p.publica_id === Number(selectedPubId));
    if (!pub) return;
    const newItem: SaleItem = {
      id: items.length + 1,
      publica_id: pub.publica_id,
      pub_name: pub.public_name,
      qty: Number(inputQty),
      rate: Number(inputRate),
      total: Number(inputQty) * Number(inputRate)
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(it => it.id !== id));
  };

  const grandTotal = items.reduce((sum, it) => sum + it.total, 0);

  const handleCompleteSale = () => {
    setStatus(`Counter cash sale of ₹${grandTotal.toFixed(2)} recorded successfully.`);
    setTimeout(() => {
      setStatus('');
      setItems([]);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl font-tahoma flex flex-col max-h-[90vh]">
        {/* Titlebar */}
        <div className="bg-linear-to-r from-[#0A246A] to-[#A6CAF0] text-white px-3 py-1 flex items-center justify-between font-bold text-xs select-none">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-yellow-300" />
            <span>Counter & Walk-in Cash Sale Entry (काउंटर नकद खुदरा बिक्री)</span>
          </div>
          <button onClick={onClose} className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white">✕</button>
        </div>

        <div className="p-4 flex-1 overflow-auto space-y-4 text-xs bg-white">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sale Date (बिक्री दिनांक):</label>
              <input 
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-2 py-1 border border-slate-400 bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Customer / Description:</label>
              <input 
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2 py-1 border border-slate-400 bg-white"
              />
            </div>
          </div>

          {/* Add Item Form */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xs flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block font-bold text-slate-700 mb-1">Select Publication (अखबार):</label>
              <select 
                value={selectedPubId}
                onChange={(e) => setSelectedPubId(Number(e.target.value))}
                className="w-full px-2 py-1 border border-slate-400 bg-white font-bold text-blue-900"
              >
                {publications.map(p => (
                  <option key={p.publica_id} value={p.publica_id}>{p.public_name}</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block font-bold text-slate-700 mb-1">Qty (संख्या):</label>
              <input 
                type="number"
                min="1"
                value={inputQty}
                onChange={(e) => setInputQty(Number(e.target.value))}
                className="w-full px-2 py-1 border border-slate-400 bg-white font-bold text-center"
              />
            </div>
            <div className="w-28">
              <label className="block font-bold text-slate-700 mb-1">Rate (₹):</label>
              <input 
                type="number"
                step="0.5"
                value={inputRate}
                onChange={(e) => setInputRate(Number(e.target.value))}
                className="w-full px-2 py-1 border border-slate-400 bg-white font-bold text-center"
              />
            </div>
            <button 
              type="button"
              onClick={handleAddItem}
              className="px-4 py-1.5 bg-blue-700 text-white font-bold border border-black shadow-xs hover:bg-blue-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Item
            </button>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 overflow-auto max-h-56">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#ECE9D8] text-slate-800 font-bold border-b sticky top-0">
                <tr>
                  <th className="p-2 border-r">S.No</th>
                  <th className="p-2 border-r">Publication Name</th>
                  <th className="p-2 border-r text-center">Qty</th>
                  <th className="p-2 border-r text-right">Rate</th>
                  <th className="p-2 border-r text-right">Total (₹)</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.id} className="border-b hover:bg-amber-50">
                    <td className="p-2 border-r font-mono">{idx + 1}</td>
                    <td className="p-2 border-r font-bold text-slate-800">{it.pub_name}</td>
                    <td className="p-2 border-r text-center font-bold font-mono text-blue-900">{it.qty}</td>
                    <td className="p-2 border-r text-right font-mono">₹{it.rate.toFixed(2)}</td>
                    <td className="p-2 border-r text-right font-mono font-bold text-emerald-800">₹{it.total.toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => handleRemoveItem(it.id)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grand Total */}
          <div className="flex justify-end p-3 bg-slate-100 border border-slate-300 rounded-xs">
            <div className="text-right">
              <span className="text-xs text-slate-600 font-bold mr-2">Grand Total (कुल नकद):</span>
              <span className="text-lg font-black text-emerald-800 font-mono">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {status && (
            <div className="bg-emerald-100 text-emerald-800 p-2 border border-emerald-400 rounded-xs font-bold text-center">
              {status}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#ECE9D8] border-t border-[#808080] px-4 py-2 flex items-center justify-between">
          <button 
            onClick={() => window.print()}
            className="px-3 py-1 bg-[#ECE9D8] border border-black shadow-xs hover:bg-slate-200 font-bold text-xs flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" /> Print Cash Memo (प्रिंट)
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCompleteSale}
              disabled={items.length === 0}
              className="px-4 py-1 bg-emerald-700 text-white font-bold border border-black shadow-xs hover:bg-emerald-800 disabled:opacity-50 flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" /> Complete Cash Sale (बिक्री सुरक्षित करें)
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-1 bg-[#ECE9D8] border border-black shadow-xs hover:bg-slate-200 font-bold text-xs"
            >
              Close (बंद करें)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
