'use client';

import React, { useState } from 'react';
import { Calendar, Check, LogIn, X } from 'lucide-react';

interface PeriodFormProps {
  isOpen: boolean;
  onLogin: (month: string, startYear: number, endYear: number) => void;
  onExit?: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PeriodForm({ isOpen, onLogin, onExit }: PeriodFormProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  
  // Indian Financial Year calculation (starts April 1st)
  const defaultStartYear = currentMonthIdx < 3 ? currentYear - 1 : currentYear;
  const defaultEndYear = defaultStartYear + 1;
  
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[currentMonthIdx] || 'August');
  const [startYear, setStartYear] = useState<number>(defaultStartYear);
  const [endYear, setEndYear] = useState<number>(defaultEndYear);
  const [selectedDate, setSelectedDate] = useState<number>(now.getDate());

  if (!isOpen) return null;

  // Calendar generation for current month
  const daysInMonth = new Date(startYear, currentMonthIdx + 1, 0).getDate();
  const firstDay = new Date(startYear, currentMonthIdx, 1).getDay();

  const handleYearChange = (start: number) => {
    setStartYear(start);
    setEndYear(start + 1);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedMonth, startYear, endYear);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#3A6EA5]/80 backdrop-blur-xs flex items-center justify-center p-4 select-none font-tahoma">
      <div className="w-full max-w-md bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Title Bar matching screenshot_15.jpg */}
        <div className="bg-gradient-to-r from-[#0A246A] to-[#A6CAF0] text-white px-2 py-0.5 flex items-center justify-between font-bold text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-yellow-300" />
            <span>Period</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">_</button>
            <button className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-white cursor-pointer">□</button>
            <button onClick={onExit} className="w-4 h-4 bg-[#ECE9D8] text-black font-bold text-[10px] flex items-center justify-center border border-black hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
          </div>
        </div>

        {/* Main Body */}
        <form onSubmit={handleLoginSubmit} className="p-4 space-y-4 text-xs">
          
          <div className="text-center space-y-0.5">
            <h2 className="font-black text-lg tracking-wider text-[#800000]">
              Period Detail
            </h2>
            <div className="text-slate-700 font-bold text-[11px]">
              Month : - <span className="text-blue-900">{selectedMonth}</span>
            </div>
          </div>

          <div className="bg-white p-3 border border-[#808080] shadow-inner space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="font-bold text-[#000080] w-28">Month</label>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 px-2 py-1 border border-[#808080] bg-white font-bold text-slate-900"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="font-bold text-[#000080] w-28">Starting Year</label>
              <input 
                type="number"
                value={startYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="flex-1 px-2 py-1 border border-[#808080] bg-white font-mono font-bold text-blue-900 text-center"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="font-bold text-[#000080] w-28">Ending Year</label>
              <input 
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="flex-1 px-2 py-1 border border-[#808080] bg-white font-mono font-bold text-blue-900 text-center"
              />
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="bg-white border border-[#808080] p-2 shadow-inner">
            <div className="text-center font-bold text-blue-900 pb-1 border-b border-slate-200">
              {selectedMonth} {startYear}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-600 pt-1">
              <span className="text-red-600">Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] pt-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <span key={`empty-${i}`} className="text-transparent">.</span>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSel = day === selectedDate;
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`py-0.5 rounded text-center cursor-pointer transition-colors ${
                      isSel ? 'bg-blue-800 text-white font-bold' : 'hover:bg-blue-100 text-slate-800'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons matching screenshot_15.jpg */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button 
              type="submit"
              className="px-6 py-1.5 bg-[#D4F0FF] hover:bg-[#BCE5FF] border border-[#006699] text-black font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              🚀 <u>L</u>ogin
            </button>
            <button 
              type="button"
              onClick={onExit}
              className="px-6 py-1.5 bg-[#D4F0FF] hover:bg-[#BCE5FF] border border-[#006699] text-black font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              🛑 <u>E</u>xit
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
