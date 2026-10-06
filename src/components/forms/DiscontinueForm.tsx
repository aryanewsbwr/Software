'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Customer, Publication, Hawker } from '@/lib/types';
import { cleanOrTransliterateHindi } from '@/lib/transliteration';

interface DiscontinueFormProps {
  onClose: () => void;
  publications?: Publication[];
  hawkers?: Hawker[];
  initialTab?: 'publication' | 'customer';
}

export default function DiscontinueForm({ 
  onClose, 
  publications = [], 
  hawkers: initialHawkers = [],
  initialTab = 'publication'
}: DiscontinueFormProps) {
  // Tabs: 1st Publication, 2nd Customer
  const [activeTab, setActiveTab] = useState<'publication' | 'customer'>(initialTab);

  // Today's formatted dates
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayDdmmyyyy = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;
  const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // ==========================================
  // TAB 1: PUBLICATION DISCONTINUE STATE
  // ==========================================
  const [pubDisList, setPubDisList] = useState<Publication[]>(publications);
  const [pubSelectedId, setPubSelectedId] = useState<string>('');
  const [pubHoldType, setPubHoldType] = useState<'Temporary' | 'Permanent'>('Temporary');
  const [pubFromDate, setPubFromDate] = useState<string>(todayDdmmyyyy);
  const [pubToDate, setPubToDate] = useState<string>('');
  const [pubRemark, setPubRemark] = useState<string>('Discontinued');
  const [pubMsg, setPubMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isPubSaving, setIsPubSaving] = useState(false);

  // ==========================================
  // TAB 2: CUSTOMER DISCONTINUE STATE
  // ==========================================
  const [entryDate, setEntryDate] = useState<string>(todayDdmmyyyy);
  const [periodStr, setPeriodStr] = useState<string>('2026-2027');

  // Customer Search & Selection
  const [custSearchTerm, setCustSearchTerm] = useState('');
  const [isSearchingCust, setIsSearchingCust] = useState(false);
  const [custSuggestions, setCustSuggestions] = useState<Customer[]>([]);
  const [showCustSuggestions, setShowCustSuggestions] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  // Customer's Subscribed Publications (Accurate to this person, NO NaN!)
  const [customerSubs, setCustomerSubs] = useState<any[]>([]);
  const [selectedPubId, setSelectedPubId] = useState<string>('0'); // '0' = All Papers
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);

  // Hawkers
  const [hawkerList, setHawkerList] = useState<Hawker[]>(initialHawkers);
  const [selectedHawkerId, setSelectedHawkerId] = useState<string>('');

  // Discontinue Type & Dates
  const [holdType, setHoldType] = useState<'Temporary' | 'Permanent'>('Temporary');
  const [fromDate, setFromDate] = useState<string>(todayDdmmyyyy);
  const [toDate, setToDate] = useState<string>('');

  // Status & Feedback
  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Find Modal State
  const [showFindModal, setShowFindModal] = useState(false);
  const [findSearch, setFindSearch] = useState('');
  const [allDiscontinues, setAllDiscontinues] = useState<any[]>([]);
  const [allPubDiscontinues, setAllPubDiscontinues] = useState<any[]>([]);
  const [isLoadingDiscs, setIsLoadingDiscs] = useState(false);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to normalize publication objects
  const normalizeAndSortPubs = (list: any[]) => {
    const cleaned = (list || []).map((p: any) => {
      const pid = Number(p.publica_id ?? p.publication_id ?? p.Publica_id ?? p.id ?? 0);
      const name = String(p.public_name || p.name || p.Public_name || (pid > 0 ? `Publication #${pid}` : '')).trim();
      const hindi = p.pub_hindi || p.Pub_Hindi || '';
      return {
        ...p,
        publica_id: pid,
        public_name: name,
        pub_hindi: hindi ? cleanOrTransliterateHindi(hindi, name) : ''
      };
    }).filter((p: any) => p.publica_id > 0 && p.public_name && !p.public_name.includes('NaN'));

    // Alphabetical sort by Publication Name (A to Z)
    cleaned.sort((a: any, b: any) => a.public_name.localeCompare(b.public_name, undefined, { sensitivity: 'base' }));
    return cleaned;
  };

  // Sync publications (sorted alphabetically, no NaN)
  useEffect(() => {
    if (publications && publications.length > 0) {
      setPubDisList(normalizeAndSortPubs(publications));
    }
    // Also fetch fresh from API or static JSON to ensure complete list
    fetch('/api/publications?with_rates=false')
      .then(r => r.json())
      .then(data => {
        const list = data.publications || (Array.isArray(data) ? data : []);
        if (list.length > 0) {
          setPubDisList(normalizeAndSortPubs(list));
        }
      })
      .catch(() => {
        fetch('/data/publications.json')
          .then(r => r.json())
          .then(list => {
            if (Array.isArray(list) && list.length > 0) {
              setPubDisList(normalizeAndSortPubs(list));
            }
          })
          .catch(() => {});
      });
  }, [publications]);

  // Load Hawkers if not provided
  useEffect(() => {
    if (!initialHawkers || initialHawkers.length === 0) {
      fetch('/api/hawkers')
        .then(r => r.json())
        .then(data => {
          if (data.hawkers) setHawkerList(data.hawkers);
          else if (Array.isArray(data)) setHawkerList(data);
        })
        .catch(() => {});
    }
  }, [initialHawkers]);

  // Global Keyboard shortcuts: F1 (Temporary), F2 (Permanent), Escape (Exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        if (activeTab === 'publication') {
          setPubHoldType('Temporary');
        } else {
          setHoldType('Temporary');
        }
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (activeTab === 'publication') {
          setPubHoldType('Permanent');
        } else {
          setHoldType('Permanent');
        }
      } else if (e.key === 'Escape') {
        if (showFindModal) {
          setShowFindModal(false);
        } else if (showCustSuggestions) {
          setShowCustSuggestions(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFindModal, showCustSuggestions, activeTab, onClose]);

  // Customer search by Name or ID
  const handleCustSearchChange = (val: string) => {
    setCustSearchTerm(val);
    if (!val.trim()) {
      setCustSuggestions([]);
      setShowCustSuggestions(false);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearchingCust(true);
      try {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(val.trim())}&limit=12`);
        if (res.ok) {
          const data = await res.json();
          setCustSuggestions(data.customers || []);
          setShowCustSuggestions(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingCust(false);
      }
    }, 200);
  };

  // Select customer from suggestion list
  const handleSelectCustomer = async (c: Customer) => {
    setSelectedCust(c);
    setCustSearchTerm(`${c.name_eng || ''} (#${c.customer_id})`);
    setShowCustSuggestions(false);
    setMsg(null);

    // Auto-select customer's hawker
    if ((c as any).hawker_id) {
      setSelectedHawkerId(String((c as any).hawker_id));
    }

    // Fetch this customer's actual subscriptions to populate Publication dropdown accurately
    setIsLoadingSubs(true);
    try {
      const res = await fetch(`/api/subscriptions?customer_id=${c.customer_id}`);
      if (res.ok) {
        const data = await res.json();
        const subs = data.subscriptions || data.all_subscriptions || [];
        setCustomerSubs(subs);
        setSelectedPubId('0'); // Default to All Papers

        // If customer has a specific hawker on first active sub, sync that too
        const activeSub = subs.find((s: any) => s.is_active);
        if (activeSub?.hawker_id) {
          setSelectedHawkerId(String(activeSub.hawker_id));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSubs(false);
    }
  };

  // Auto-format continuous 8 digits to DD/MM/YYYY on display
  const formatDateDisplay = (val: string): string => {
    const s = val.trim().replace(/\D/g, '');
    if (s.length === 8) {
      return `${s.slice(0, 2)}/${s.slice(2, 4)}/${s.slice(4, 8)}`;
    }
    return val;
  };

  // Date parsing helper (DD/MM/YYYY, DD-MM-YYYY, DDMMYYYY, or YYYY-MM-DD -> ISO)
  const toIsoDate = (val: string): string => {
    if (!val) return '';
    const s = val.trim();
    if (!s || s === '-' || s === '---') return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    if (/^\d{8}$/.test(s)) {
      const yrFirst = parseInt(s.slice(0, 4), 10);
      if (yrFirst >= 1990 && yrFirst <= 2099) {
        return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
      }
      return `${s.slice(4, 8)}-${s.slice(2, 4)}-${s.slice(0, 2)}`;
    }
    const parts = s.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return '';
  };

  // Save / Submit Discontinue Entry
  const handleSave = async () => {
    if (!selectedCust) {
      setMsg({ text: 'कृपया पहले ग्राहक का नाम खोजें और चुनें (Please search and select a Customer Name).', isError: true });
      return;
    }

    if (!fromDate) {
      setMsg({ text: 'कृपया फ्रॉम डेट (From Date) दर्ज करें.', isError: true });
      return;
    }

    if (holdType === 'Temporary' && !toDate) {
      setMsg({ text: 'अस्थाई छुट्टी के लिए समाप्ति दिनांक (To Date) दर्ज करें.', isError: true });
      return;
    }

    setIsSaving(true);
    setMsg(null);

    try {
      const fromIso = toIsoDate(fromDate);
      const toIso = holdType === 'Temporary' ? toIsoDate(toDate) : fromIso;
      const pubId = parseInt(selectedPubId, 10) || 0;

      const payload = {
        customer_id: selectedCust.customer_id,
        publica_id: pubId,
        temp_perma: holdType === 'Permanent' ? 'Permanent' : 'Temporary',
        temp_from: fromIso,
        temp_to: toIso,
        entry_date: todayIso,
        financial_year: periodStr.replace('-', '')
      };

      const res = await fetch('/api/discontinue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save discontinue record');

      setMsg({
        text: `✓ ${holdType === 'Permanent' ? 'स्थाई बंद (Permanent Stop)' : 'अस्थाई छुट्टी (Temporary Hold)'} सफलतापूर्वक दर्ज हुआ! (Saved for #${selectedCust.customer_id} ${selectedCust.name_eng})`,
        isError: false
      });

      // Refresh customer's subscriptions if permanent
      if (holdType === 'Permanent') {
        const subRes = await fetch(`/api/subscriptions?customer_id=${selectedCust.customer_id}`);
        if (subRes.ok) {
          const subData = await subRes.json();
          setCustomerSubs(subData.subscriptions || []);
        }
      }

    } catch (err: any) {
      setMsg({ text: `त्रुटि (Error): ${err.message}`, isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  // Save Publication Discontinue (Tab 1)
  const handlePubSave = async () => {
    if (!pubSelectedId) {
      setPubMsg({ text: 'कृपया पहले पत्रिका/अखबार (Publication) चुनें.', isError: true });
      return;
    }
    if (!pubFromDate) {
      setPubMsg({ text: 'कृपया फ्रॉम डेट (From Date) दर्ज करें.', isError: true });
      return;
    }
    if (pubHoldType === 'Temporary' && !pubToDate) {
      setPubMsg({ text: 'अस्थाई छुट्टी के लिए समाप्ति दिनांक (To Date) दर्ज करें.', isError: true });
      return;
    }

    setIsPubSaving(true);
    setPubMsg(null);
    try {
      const fromIso = toIsoDate(pubFromDate);
      const toIso = pubHoldType === 'Permanent' ? '2050-03-31' : toIsoDate(pubToDate);
      const pid = parseInt(pubSelectedId, 10);

      const res = await fetch('/api/publicationdis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publica_id: pid,
          from_date: fromIso,
          to_date: toIso,
          dis_type: pubHoldType === 'Permanent' ? 'P' : 'T',
          remark: pubRemark || 'Discontinued'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save publication discontinue');

      const pubName = pubDisList.find(p => p.publica_id === pid)?.public_name || `Pub #${pid}`;
      setPubMsg({
        text: `✓ ${pubName} का ${pubHoldType === 'Permanent' ? 'स्थाई बंद (Permanent Stop)' : 'अस्थाई रोक (Temporary Hold)'} सफलतापूर्वक दर्ज हुआ!`,
        isError: false
      });
    } catch (err: any) {
      setPubMsg({ text: `त्रुटि (Error): ${err.message}`, isError: true });
    } finally {
      setIsPubSaving(false);
    }
  };

  const handlePubCancel = () => {
    setPubSelectedId('');
    setPubHoldType('Temporary');
    setPubFromDate(todayDdmmyyyy);
    setPubToDate('');
    setPubRemark('Discontinued');
    setPubMsg(null);
  };

  // Load Discontinues for Find Dialog
  const handleOpenFind = async () => {
    setShowFindModal(true);
    setIsLoadingDiscs(true);
    try {
      const [cRes, pRes] = await Promise.all([
        fetch('/api/discontinue'),
        fetch('/api/publicationdis')
      ]);
      if (cRes.ok) {
        const data = await cRes.json();
        setAllDiscontinues(data.discontinues || []);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setAllPubDiscontinues(pData.discontinues || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDiscs(false);
    }
  };

  // Cancel / Reset Form
  const handleCancel = () => {
    if (activeTab === 'publication') {
      handlePubCancel();
    } else {
      setCustSearchTerm('');
      setSelectedCust(null);
      setCustomerSubs([]);
      setSelectedPubId('0');
      setHoldType('Temporary');
      setFromDate(todayDdmmyyyy);
      setToDate('');
      setMsg(null);
    }
  };

  // Delete Discontinue Record from Find Modal
  const handleDeleteRecord = async (discId: number, isPub: boolean = false) => {
    if (!confirm(`Are you sure you want to delete this discontinue record #${discId}?`)) return;
    try {
      const url = isPub ? `/api/publicationdis?id=${discId}` : `/api/discontinue?id=${discId}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (isPub) {
          setAllPubDiscontinues(prev => prev.filter(d => d.id !== discId));
        } else {
          setAllDiscontinues(prev => prev.filter(d => (d.discontinue_id || d.Discontinue_id) !== discId));
        }
        alert(`Record #${discId} successfully deleted.`);
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  return (
    <div className="relative w-[590px] bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl flex flex-col font-tahoma select-none overflow-hidden text-xs">
      
      {/* Title Bar matching screenshot_10.jpg */}
      <div className="bg-[#0A246A] text-white px-2 py-1 flex items-center justify-between font-bold">
        <div className="flex items-center gap-1.5">
          <img 
            src="/legacy_images/paper.ico" 
            alt="ico" 
            className="w-4 h-4" 
            onError={(e) => (e.currentTarget.style.display = 'none')} 
          />
          <span className="text-xs tracking-wide">
            {activeTab === 'publication' ? 'Publication Discontinue' : 'Customer Discontinue'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-5 h-4 bg-[#ECE9D8] border border-[#808080] text-black text-[10px] font-bold flex items-center justify-center hover:bg-white cursor-pointer">_</button>
          <button className="w-5 h-4 bg-[#ECE9D8] border border-[#808080] text-black text-[10px] font-bold flex items-center justify-center hover:bg-white cursor-pointer">□</button>
          <button onClick={onClose} className="w-5 h-4 bg-[#ECE9D8] border border-[#808080] text-black text-[10px] font-bold flex items-center justify-center hover:bg-red-600 hover:text-white cursor-pointer">✕</button>
        </div>
      </div>

      {/* VB6 Two Tabs Bar: 1st Publication, 2nd Customer */}
      <div className="flex items-end px-3 pt-2 bg-[#D4D0C8] border-b border-[#808080] gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('publication')}
          className={`px-4 py-1 font-bold text-xs border-t-2 border-l-2 border-r-2 rounded-t-sm cursor-pointer transition-colors ${
            activeTab === 'publication'
              ? 'bg-[#ECE9D8] text-[#800000] border-t-white border-l-white border-r-[#404040] -mb-[1px] pb-1.5 shadow-sm'
              : 'bg-[#C0BCB0] text-slate-700 border-t-[#D4D0C8] border-l-[#D4D0C8] border-r-[#808080] hover:bg-[#D4D0C8]'
          }`}
        >
          📰 1. Publication Discontinue (अखबार रोक)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('customer')}
          className={`px-4 py-1 font-bold text-xs border-t-2 border-l-2 border-r-2 rounded-t-sm cursor-pointer transition-colors ${
            activeTab === 'customer'
              ? 'bg-[#ECE9D8] text-[#000080] border-t-white border-l-white border-r-[#404040] -mb-[1px] pb-1.5 shadow-sm'
              : 'bg-[#C0BCB0] text-slate-700 border-t-[#D4D0C8] border-l-[#D4D0C8] border-r-[#808080] hover:bg-[#D4D0C8]'
          }`}
        >
          👤 2. Customer Discontinue (ग्राहक रोक)
        </button>
      </div>

      {/* Main Body */}
      <div className="p-4 flex flex-col justify-between space-y-3 bg-[#ECE9D8] min-h-[380px]">
        
        {/* ========================================================================= */}
        {/* TAB 1: PUBLICATION DISCONTINUE (Whole Publication Stop)                  */}
        {/* ========================================================================= */}
        {activeTab === 'publication' && (
          <div className="space-y-3">
            <div className="text-center">
              <h1 
                className="text-2xl font-black text-[#800000] tracking-wider uppercase" 
                style={{ fontFamily: 'Georgia, serif' }}
              >
                PUBLICATIONS DISCONTINUE
              </h1>
            </div>

            {/* Date & Period Row */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <label className="font-bold text-[#800000] text-xs">Date</label>
                <div className="border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white px-1 py-0.5 shadow-inner">
                  <input 
                    type="text" 
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-24 text-center font-mono font-bold text-black outline-none bg-transparent"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>

              <div className="font-bold text-black text-xs">
                Period :- <span className="text-[#000080] font-mono">{periodStr}</span>
              </div>
            </div>

            {/* Publication Select */}
            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-[#800000] text-right shrink-0">
                Publication
              </label>
              <div className="flex-1">
                <select 
                  value={pubSelectedId}
                  onChange={(e) => setPubSelectedId(e.target.value)}
                  className="w-full px-2 py-1 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white font-bold text-black outline-none shadow-inner"
                >
                  <option value="">-- कृपया पत्रिका/अखबार चुनें (Select Publication) --</option>
                  {pubDisList.map((p) => (
                    <option key={p.publica_id} value={p.publica_id}>
                      #{p.publica_id} - {p.public_name} {p.pub_hindi ? `(${p.pub_hindi})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Remark / Reason */}
            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-[#800000] text-right shrink-0">
                Remark / कारण
              </label>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={pubRemark}
                  onChange={(e) => setPubRemark(e.target.value)}
                  placeholder="e.g. Strike / Holiday / Discontinued"
                  className="w-full px-2 py-1 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white font-bold text-black outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Temporary / Permanent Group Box */}
            <fieldset className="border border-[#808080] p-3 mx-1 my-1 relative">
              <legend className="px-1.5 font-bold text-[#800000] text-xs">
                Temporary/Permanent (अस्थाई / स्थाई रोक)
              </legend>

              {/* Checkboxes Row */}
              <div className="flex items-center justify-center gap-10 pb-2">
                <label className="flex items-center gap-1.5 font-bold text-black cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={pubHoldType === 'Temporary'}
                    onChange={() => setPubHoldType('Temporary')}
                    className="cursor-pointer"
                  />
                  <span>Temporary (अस्थाई रोक)</span>
                </label>

                <label className="flex items-center gap-1.5 font-bold text-black cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={pubHoldType === 'Permanent'}
                    onChange={() => setPubHoldType('Permanent')}
                    className="cursor-pointer"
                  />
                  <span>Permanent (स्थाई बंद)</span>
                </label>
              </div>

              {/* From & To Dates */}
              <div className="flex items-center justify-center gap-8 pt-1">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-[#800000]">From</label>
                  <div className="border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white px-1.5 py-0.5 shadow-inner">
                    <input 
                      type="text" 
                      value={pubFromDate}
                      onChange={(e) => setPubFromDate(e.target.value)}
                      onBlur={() => setPubFromDate(formatDateDisplay(pubFromDate))}
                      placeholder="DD/MM/YYYY"
                      className="w-24 text-center font-mono font-bold text-black outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="font-bold text-[#800000]">To</label>
                  <div className={`border border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-1.5 py-0.5 shadow-inner ${pubHoldType === 'Permanent' ? 'bg-slate-200 opacity-60' : 'bg-white'}`}>
                    <input 
                      type="text" 
                      value={pubToDate}
                      onChange={(e) => setPubToDate(e.target.value)}
                      onBlur={() => setPubToDate(formatDateDisplay(pubToDate))}
                      disabled={pubHoldType === 'Permanent'}
                      placeholder={pubHoldType === 'Permanent' ? '---' : 'DD/MM/YYYY'}
                      className="w-24 text-center font-mono font-bold text-black outline-none bg-transparent disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Hotkeys Hint */}
              <div className="text-center pt-2.5 font-bold text-[#800000] text-[11px]">
                F1 - Temporary &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; F2 - Permanent
              </div>
            </fieldset>

            {/* Publication Status Msg */}
            {pubMsg && (
              <div className={`text-center py-1 px-2 border font-bold text-xs ${
                pubMsg.isError 
                  ? 'bg-red-100 text-red-900 border-red-300' 
                  : 'bg-emerald-100 text-emerald-900 border-emerald-400'
              }`}>
                {pubMsg.text}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CUSTOMER DISCONTINUE (screenshot_10.jpg)                           */}
        {/* ========================================================================= */}
        {activeTab === 'customer' && (
          <div className="space-y-2.5">
            {/* Header Title matching screenshot_10.jpg */}
            <div className="text-center">
              <h1 
                className="text-2xl font-black text-[#800000] tracking-wider uppercase" 
                style={{ fontFamily: 'Georgia, serif' }}
              >
                CUSTOMER DISCONTINUE INFO
              </h1>
            </div>

            {/* Date & Period Row */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <label className="font-bold text-[#800000] text-xs">Date</label>
                <div className="border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white px-1 py-0.5 shadow-inner">
                  <input 
                    type="text" 
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-24 text-center font-mono font-bold text-black outline-none bg-transparent"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>

              <div className="font-bold text-black text-xs">
                Period :- <span className="text-[#000080] font-mono">{periodStr}</span>
              </div>
            </div>

            {/* Customer Name Search (Search by Name, NOT by ID) */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <label className="w-28 font-bold text-[#800000] text-right shrink-0">
                  Customer Name
                </label>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={custSearchTerm}
                    onChange={(e) => handleCustSearchChange(e.target.value)}
                    onFocus={() => { if (custSuggestions.length > 0) setShowCustSuggestions(true); }}
                    placeholder="ग्राहक का नाम टाइप करके खोजें (Type name to search)..."
                    className="w-full px-2 py-1 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white font-bold text-black outline-none shadow-inner"
                  />
                  {isSearchingCust && (
                    <span className="absolute right-2 top-1 text-[10px] text-slate-500 font-bold">
                      खोज जारी...
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Autocomplete Dropdown */}
              {showCustSuggestions && custSuggestions.length > 0 && (
                <div className="absolute left-30 right-0 top-7 z-50 bg-white border border-[#808080] shadow-xl max-h-48 overflow-y-auto">
                  {custSuggestions.map((c) => (
                    <div 
                      key={c.customer_id}
                      onClick={() => handleSelectCustomer(c)}
                      className="p-1.5 hover:bg-[#0A246A] hover:text-white cursor-pointer border-b border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <strong className="text-blue-900 group-hover:text-white font-mono">#{c.customer_id}</strong>
                        <span className="ml-1 font-bold">{c.name_eng}</span>
                        {c.name_hindi && (
                          <span className="ml-1 text-slate-600 group-hover:text-slate-200">
                            ({cleanOrTransliterateHindi(c.name_hindi, c.name_eng)})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-200">
                        {[c.add1, c.add2].filter(Boolean).join(', ') || 'No Addr'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publication Dropdown - Populated according to the person, NO NaN! */}
            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-[#800000] text-right shrink-0">
                Publication
              </label>
              <div className="flex-1">
                <select 
                  value={selectedPubId}
                  onChange={(e) => setSelectedPubId(e.target.value)}
                  disabled={!selectedCust}
                  className="w-full px-2 py-1 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white font-bold text-black outline-none disabled:bg-slate-100 shadow-inner"
                >
                  {!selectedCust ? (
                    <option value="">-- कृपया पहले ऊपर ग्राहक का नाम चुनें (Select Customer First) --</option>
                  ) : (
                    <>
                      <option value="0">All Papers (सभी अखबार/पत्रिका)</option>
                      {(() => {
                        const sortedSubs = [...customerSubs].sort((a: any, b: any) => {
                          const aName = a.publication_name || (pubDisList.find(p => p.publica_id === (a.publica_id || a.publication_id))?.public_name) || '';
                          const bName = b.publication_name || (pubDisList.find(p => p.publica_id === (b.publica_id || b.publication_id))?.public_name) || '';
                          return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
                        });
                        return sortedSubs.map((sub: any) => {
                          const pId = sub.publica_id || sub.publication_id;
                          const matched = pubDisList.find(p => p.publica_id === pId);
                          const pName = sub.publication_name || matched?.public_name || `Paper #${pId}`;
                          const isClosed = sub.is_active === false || (sub.c_date && sub.c_date !== '' && sub.c_date !== '-');
                          return (
                            <option key={sub.sno || pId} value={pId}>
                              {pName} {sub.qty ? `(Qty: ${sub.qty})` : ''} {isClosed ? '[ALREADY CLOSED]' : '[ACTIVE]'}
                            </option>
                          );
                        });
                      })()}
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Hawker Dropdown */}
            <div className="flex items-center gap-2">
              <label className="w-28 font-bold text-[#800000] text-right shrink-0">
                Hawker
              </label>
              <div className="flex-1">
                <select 
                  value={selectedHawkerId}
                  onChange={(e) => setSelectedHawkerId(e.target.value)}
                  className="w-full px-2 py-1 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white font-bold text-black outline-none shadow-inner"
                >
                  <option value="">-- Select Hawker --</option>
                  {hawkerList.map((h) => (
                    <option key={h.hawker_id} value={h.hawker_id}>
                      #{h.hawker_id} {h.name} {h.hindi_name ? `(${h.hindi_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address & Subscription Details Inset Box matching screenshot_10.jpg */}
            <div className="ml-30 mr-1 p-2 bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white shadow-inner min-h-[52px] text-[11px] text-slate-700">
              {selectedCust ? (
                <div className="space-y-0.5">
                  <div>
                    <strong>Address:</strong> {[selectedCust.add1, selectedCust.add2].filter(Boolean).join(', ') || 'None'}
                  </div>
                  <div>
                    <strong>Active Papers:</strong> {
                      customerSubs.filter(s => s.is_active !== false && (!s.c_date || s.c_date === '-')).length > 0
                        ? customerSubs
                            .filter(s => s.is_active !== false && (!s.c_date || s.c_date === '-'))
                            .map(s => s.publication_name || `Pub #${s.publica_id}`)
                            .join(', ')
                        : <span className="text-red-700 font-bold">No active papers currently delivered</span>
                    }
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 italic">
                  ग्राहक का चयन करने पर पता एवं चालू अखबार यहाँ दिखाई देंगे (Address & active papers will appear here)
                </span>
              )}
            </div>

            {/* Temporary / Permanent Group Box matching screenshot_10.jpg */}
            <fieldset className="border border-[#808080] p-3 mx-1 my-1 relative">
              <legend className="px-1.5 font-bold text-[#800000] text-xs">
                Temporary/Permanent
              </legend>

              {/* Checkboxes Row */}
              <div className="flex items-center justify-center gap-10 pb-2">
                <label className="flex items-center gap-1.5 font-bold text-black cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={holdType === 'Temporary'}
                    onChange={() => setHoldType('Temporary')}
                    className="cursor-pointer"
                  />
                  <span>Temporary (अस्थाई छुट्टी)</span>
                </label>

                <label className="flex items-center gap-1.5 font-bold text-black cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={holdType === 'Permanent'}
                    onChange={() => setHoldType('Permanent')}
                    className="cursor-pointer"
                  />
                  <span>Permanent (स्थाई बंद)</span>
                </label>
              </div>

              {/* From & To Dates */}
              <div className="flex items-center justify-center gap-8 pt-1">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-[#800000]">From</label>
                  <div className="border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white px-1.5 py-0.5 shadow-inner">
                    <input 
                      type="text" 
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      onBlur={() => setFromDate(formatDateDisplay(fromDate))}
                      placeholder="DD/MM/YYYY"
                      className="w-24 text-center font-mono font-bold text-black outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="font-bold text-[#800000]">To</label>
                  <div className={`border border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-1.5 py-0.5 shadow-inner ${holdType === 'Permanent' ? 'bg-slate-200 opacity-60' : 'bg-white'}`}>
                    <input 
                      type="text" 
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      onBlur={() => setToDate(formatDateDisplay(toDate))}
                      disabled={holdType === 'Permanent'}
                      placeholder={holdType === 'Permanent' ? '---' : 'DD/MM/YYYY'}
                      className="w-24 text-center font-mono font-bold text-black outline-none bg-transparent disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Hotkeys Hint matching screenshot_10.jpg */}
              <div className="text-center pt-2.5 font-bold text-[#800000] text-[11px]">
                F1 - Temporary &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; F2 - Permanent
              </div>
            </fieldset>

            {/* Customer Status Msg */}
            {msg && (
              <div className={`text-center py-1 px-2 border font-bold text-xs ${
                msg.isError 
                  ? 'bg-red-100 text-red-900 border-red-300' 
                  : 'bg-emerald-100 text-emerald-900 border-emerald-400'
              }`}>
                {msg.text}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons matching VB6 (Save, Update, Delete, Find, Cancel, Exit) */}
        <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#808080]">
          <button 
            type="button"
            onClick={activeTab === 'publication' ? handlePubSave : handleSave}
            disabled={activeTab === 'publication' ? isPubSaving : isSaving}
            className="flex-1 py-1 px-2 bg-[#ECE9D8] hover:bg-[#F5F4EA] active:bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white text-xs font-bold text-black shadow-xs cursor-pointer text-center"
          >
            <u>S</u>ave
          </button>

          <button 
            type="button"
            onClick={activeTab === 'publication' ? handlePubSave : handleSave}
            disabled={activeTab === 'publication' ? isPubSaving : isSaving}
            className="flex-1 py-1 px-2 bg-[#ECE9D8] hover:bg-[#F5F4EA] active:bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white text-xs font-bold text-black shadow-xs cursor-pointer text-center"
          >
            <u>U</u>pdate
          </button>

          <button 
            type="button"
            onClick={() => handleOpenFind()}
            className="flex-1 py-1 px-2 bg-[#ECE9D8] hover:bg-[#F5F4EA] active:bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white text-xs font-bold text-black shadow-xs cursor-pointer text-center"
          >
            <u>D</u>elete
          </button>

          <button 
            type="button"
            onClick={handleOpenFind}
            className="flex-1 py-1 px-2 bg-[#ECE9D8] hover:bg-[#F5F4EA] active:bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white text-xs font-bold text-black shadow-xs cursor-pointer text-center"
          >
            <u>F</u>ind
          </button>

          <button 
            type="button"
            onClick={handleCancel}
            className="flex-1 py-1 px-2 bg-[#ECE9D8] hover:bg-[#F5F4EA] active:bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white text-xs font-bold text-black shadow-xs cursor-pointer text-center"
          >
            <u>C</u>ancel
          </button>

          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-1 px-2 bg-[#ECE9D8] hover:bg-[#F5F4EA] active:bg-[#D4D0C8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white text-xs font-bold text-black shadow-xs cursor-pointer text-center"
          >
            <u>E</u>xit
          </button>
        </div>

      </div>

      {/* Find Modal Dialog (Search / Delete Discontinue Entries for Current Tab) */}
      {showFindModal && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3 z-50">
          <div className="bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] shadow-2xl w-full h-[450px] flex flex-col font-tahoma text-xs">
            
            {/* Modal Title Bar */}
            <div className="bg-[#0A246A] text-white px-2 py-1 flex items-center justify-between font-bold">
              <span>
                {activeTab === 'publication' ? 'Find Publication Discontinues (अखबार रोक सूची)' : 'Find Customer Discontinues (ग्राहक रोक सूची)'}
              </span>
              <button 
                onClick={() => setShowFindModal(false)}
                className="w-4 h-4 bg-[#ECE9D8] text-black text-[10px] font-bold flex items-center justify-center hover:bg-red-600 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-2 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <label className="font-bold text-[#800000]">Search:</label>
                <input 
                  type="text" 
                  value={findSearch}
                  onChange={(e) => setFindSearch(e.target.value)}
                  placeholder={activeTab === 'publication' ? 'Filter by publication name or ID...' : 'Filter by Customer ID or Name...'}
                  className="flex-1 px-2 py-0.5 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white font-bold outline-none"
                />
              </div>

              {/* Table */}
              <div className="flex-1 bg-white border border-[#808080] overflow-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead className="sticky top-0 bg-[#ECE9D8] border-b border-[#808080]">
                    <tr>
                      <th className="p-1 border-r text-center">#ID</th>
                      <th className="p-1 border-r text-left">
                        {activeTab === 'publication' ? 'Publication' : 'Cust ID'}
                      </th>
                      <th className="p-1 border-r text-left">Type</th>
                      <th className="p-1 border-r text-left">From</th>
                      <th className="p-1 border-r text-left">To</th>
                      <th className="p-1 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'publication' ? (
                      allPubDiscontinues
                        .filter(d => {
                          if (!findSearch.trim()) return true;
                          const s = findSearch.toLowerCase();
                          const pubName = (pubDisList.find(p => p.publica_id === d.publica_id)?.public_name || '').toLowerCase();
                          return String(d.publica_id).includes(s) || pubName.includes(s) || String(d.id).includes(s);
                        })
                        .slice(0, 100)
                        .map((d) => {
                          const pubName = pubDisList.find(p => p.publica_id === d.publica_id)?.public_name || `Pub #${d.publica_id}`;
                          return (
                            <tr key={d.id} className="border-b hover:bg-blue-50">
                              <td className="p-1 border-r text-center font-mono font-bold">#{d.id}</td>
                              <td className="p-1 border-r text-blue-900 font-bold">{pubName}</td>
                              <td className="p-1 border-r font-bold">
                                {d.dis_type === 'P' ? 'Permanent' : 'Temporary'}
                              </td>
                              <td className="p-1 border-r font-mono">{d.from_date || d.entry_date || '-'}</td>
                              <td className="p-1 border-r font-mono">{d.to_date || d.oc_date || 'Permanent'}</td>
                              <td className="p-1 text-center">
                                <button 
                                  onClick={() => handleDeleteRecord(d.id, true)}
                                  className="px-1.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 text-[10px] font-bold cursor-pointer"
                                >
                                  Del
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      allDiscontinues
                        .filter(d => {
                          if (!findSearch.trim()) return true;
                          const s = findSearch.toLowerCase();
                          return String(d.customer_id).includes(s) || String(d.discontinue_id).includes(s);
                        })
                        .slice(0, 100)
                        .map((d) => (
                          <tr key={d.discontinue_id} className="border-b hover:bg-blue-50">
                            <td className="p-1 border-r text-center font-mono font-bold">#{d.discontinue_id}</td>
                            <td className="p-1 border-r text-blue-900 font-mono font-bold">#{d.customer_id}</td>
                            <td className="p-1 border-r font-bold">
                              {d.temp_perma === 'P' ? 'Permanent' : 'Temporary'}
                            </td>
                            <td className="p-1 border-r font-mono">{d.temp_from || '-'}</td>
                            <td className="p-1 border-r font-mono">{d.temp_to || 'Permanent'}</td>
                            <td className="p-1 text-center">
                              <button 
                                onClick={() => handleDeleteRecord(d.discontinue_id, false)}
                                className="px-1.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 text-[10px] font-bold cursor-pointer"
                              >
                                Del
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-600 text-[11px]">
                  Total Records: {activeTab === 'publication' ? allPubDiscontinues.length : allDiscontinues.length}
                </span>
                <button 
                  onClick={() => setShowFindModal(false)}
                  className="px-3 py-0.5 bg-[#ECE9D8] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] font-bold cursor-pointer hover:bg-white"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
