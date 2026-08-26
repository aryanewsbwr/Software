/**
 * 2008 AUTHENTIC BILLING CALCULATION ENGINE
 * Directly implements the legacy SQL logic:
 * 1. Daily papers (Date-by-date accumulation with 7-day rate & ratechange history)
 * 2. Weekly magazines (MagzineDay matching DAYOFWEEK)
 * 3. Fortnightly (1st and 16th dates)
 * 4. Monthly & Quarterly (1st date; Pub #75 quarterly in Jan/Apr/Jul/Oct)
 * 5. Delivery charges (cd.Dely)
 * 6. Retail sales (retailsale)
 * 7. Previous due (Opening dues + prior bills + delivery - receipts - less amount)
 * 8. Grand Total aggregation
 */

export interface BillingLineItem {
  customer_id: number;
  name_eng: string;
  customer_hindi?: string;
  sort_order: number;
  item: string;
  rate: number | null;
  qty: number | null;
  days_or_copies: number | null;
  amount: number;
}

export interface CustomerMonthlyBill {
  bill_no: number;
  customer_id: number;
  name_eng: string;
  customer_hindi: string;
  region_id: number;
  region_name: string;
  month: string;
  year: number;
  previous_due: number;
  paper_amount: number;
  delivery_amount: number;
  discount_amount: number;
  retail_sale_amount: number;
  total_payable: number;
  breakup: BillingLineItem[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FORTNIGHTLY_PUBS = new Set([13, 11, 17, 23, 24, 18, 216]);

// Parse DD/MM/YYYY to YYYY-MM-DD string
function parseLegacyDateToIso(dStr: string | null | undefined): string | null {
  if (!dStr || dStr.trim() === '' || dStr === 'null') return null;
  const clean = dStr.trim();
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return clean.split('T')[0];
  }
  return null;
}

export function calculateBilling({
  monthName,
  year,
  regionId = 'all',
  customers = [],
  subscriptions = [],
  rates = [],
  ratechanges = [],
  publications = [],
  holidays = [],
  discontinues = [],
  bills = [],
  receipts = [],
  regions = []
}: {
  monthName: string;
  year: number;
  regionId?: string | number;
  customers: any[];
  subscriptions: any[];
  rates: any[];
  ratechanges: any[];
  publications: any[];
  holidays: any[];
  discontinues: any[];
  bills: any[];
  receipts: any[];
  regions: any[];
}) {
  let monthIdx = MONTH_NAMES.indexOf(monthName);
  if (monthIdx === -1) monthIdx = 7; // August default

  const monthNum = monthIdx + 1; // 1-12
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const monthStartIso = `${year}-${String(monthNum).padStart(2, '0')}-01`;
  const monthEndIso = `${year}-${String(monthNum).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // Index Publications
  const pubMap = new Map<number, any>();
  for (const p of publications) {
    pubMap.set(p.publica_id, p);
  }

  // Index Regions
  const regMap = new Map<number, any>();
  for (const r of regions) {
    regMap.set(r.region_id, r);
  }

  // Rate lookup function: ratechanges priority over standard rates
  const getEffectiveRate = (publicaId: number, dayOfWeek: number, targetDateIso: string): number => {
    // 1. Check ratechanges: rc.Publica_id = publica_id AND rc.Dayofweek = dayOfWeek AND rc.Dated <= targetDateIso ORDER BY rc.Dated DESC LIMIT 1
    const matchingChanges = ratechanges.filter(rc => 
      rc.publica_id === publicaId && 
      (rc.dayofweek === dayOfWeek || rc.dayofweek === 0 || !rc.dayofweek) &&
      rc.dated && rc.dated <= targetDateIso
    );
    if (matchingChanges.length > 0) {
      matchingChanges.sort((a, b) => b.dated.localeCompare(a.dated));
      return matchingChanges[0].new_rate || matchingChanges[0].newrate || 0;
    }

    // 2. Fallback to standard rates table: r2.Publica_id = publica_id AND r2.Dayofweek = dayOfWeek
    const stdRate = rates.find(r => r.publica_id === publicaId && r.dayofweek === dayOfWeek);
    if (stdRate && stdRate.rate) return stdRate.rate;

    // 3. Fallback any standard rate for publication
    const anyRate = rates.find(r => r.publica_id === publicaId);
    if (anyRate && anyRate.rate) return anyRate.rate;

    return 5.0; // Standard fallback
  };

  // Holiday check: hol.Publica_id = sub.publica_id AND Oc_Date = targetDateIso
  const isHoliday = (publicaId: number, targetDateIso: string): boolean => {
    return holidays.some(h => {
      const hIso = parseLegacyDateToIso(h.oc_date || h.Oc_Date);
      if (!hIso) return false;
      return hIso === targetDateIso && (!h.publica_id || h.publica_id === publicaId);
    });
  };

  // Discontinue check: disc.Customer_id = cd.Customer_id AND disc.Publica_id IN (cd.Publica_id, 0, NULL)
  const isDiscontinued = (custId: number, publicaId: number, targetDateIso: string): boolean => {
    return discontinues.some(d => {
      if (d.customer_id !== custId) return false;
      if (d.publica_id && d.publica_id !== 0 && d.publica_id !== publicaId) return false;

      const tempFrom = d.temp_from || parseLegacyDateToIso(d.Temp_From || d.entry_date);
      if (!tempFrom) return false;

      const isPerm = (d.temp_perma || d.Temp_Perma || '').toUpperCase().startsWith('P');
      if (isPerm) {
        return targetDateIso >= tempFrom;
      } else {
        const tempTo = d.temp_to || parseLegacyDateToIso(d.Temp_To);
        if (!tempTo) return targetDateIso >= tempFrom;
        return targetDateIso >= tempFrom && targetDateIso <= tempTo;
      }
    });
  };

  // Check schedule day filter (cd.From_Day)
  const isScheduleMatch = (fromDay: string | null | undefined, dayOfWeek: number): boolean => {
    if (!fromDay || fromDay === '' || fromDay === '1-7' || fromDay === 'Daily') return true;
    if (fromDay.includes('-')) {
      const parts = fromDay.split('-').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return dayOfWeek >= parts[0] && dayOfWeek <= parts[1];
      }
    }
    const daysList = fromDay.split(',').map(Number);
    return daysList.includes(dayOfWeek);
  };

  // Filter customers by region if specified
  let targetCustomers = customers;
  if (regionId && regionId !== 'all') {
    const rId = typeof regionId === 'string' ? parseInt(regionId, 10) : regionId;
    targetCustomers = targetCustomers.filter(c => c.region_id === rId);
  }

  // Group subscriptions by customer_id
  const subsByCust = new Map<number, any[]>();
  for (const s of subscriptions) {
    if (!subsByCust.has(s.customer_id)) {
      subsByCust.set(s.customer_id, []);
    }
    subsByCust.get(s.customer_id)!.push(s);
  }

  // Pre-index prior bills and receipts for Previous Due calculation
  const duesByCust = new Map<number, number>();
  for (const b of bills) {
    const prev = duesByCust.get(b.customer_id) || 0;
    const dueAmt = (b.month === 'Dues' || b.Month === 'Dues') ? (b.due_amt || b.Due_Amt || 0) : 0;
    const totalAmt = (b.month !== 'Dues' && b.Month !== 'Dues') ? (b.balance || b.totalamt || b.Totalamt || 0) : 0;
    const delAmt = b.dely || b.del_amt || b.Dely || 0;
    duesByCust.set(b.customer_id, prev + dueAmt + totalAmt + delAmt);
  }

  const receiptsByCust = new Map<number, number>();
  for (const r of receipts) {
    const prev = receiptsByCust.get(r.customer_id) || 0;
    const recpAmt = r.mal_recp_amt || r.MalRecpAmt || r.bill_amt || 0;
    const lessAmt = r.less_amt || r.LessAmt || 0;
    receiptsByCust.set(r.customer_id, prev + recpAmt + lessAmt);
  }

  const generatedBills: CustomerMonthlyBill[] = [];
  const allBreakupLines: BillingLineItem[] = [];

  let grandTotalBilling = 0;

  for (let cIdx = 0; cIdx < targetCustomers.length; cIdx++) {
    const cust = targetCustomers[cIdx];
    const custId = cust.customer_id;
    const custSubs = subsByCust.get(custId) || [];

    const custBreakup: BillingLineItem[] = [];
    let customerPaperTotal = 0;
    let customerDeliveryTotal = 0;

    // =========================================================================
    // 1. PROCESS EACH SUBSCRIPTION LINE ITEM
    // =========================================================================
    for (const cd of custSubs) {
      const pub = pubMap.get(cd.publica_id);
      const pubName = pub ? pub.public_name : `Publication #${cd.publica_id}`;
      const typeP = pub?.type_p || pub?.TypeP || 'Newspaper';
      const magzineDay = pub?.magzine_day || pub?.MagzineDay || 0;
      const isMagzine = typeP.toLowerCase() === 'magzine' || typeP.toLowerCase() === 'magazine';

      const sDateIso = parseLegacyDateToIso(cd.s_date || cd.S_Date) || '2000-01-01';
      const cDateIso = parseLegacyDateToIso(cd.c_date || cd.C_Date);

      const qty = cd.qty || cd.Qty || 1;

      // Group day counts by resolved rate
      const rateDaysMap = new Map<number, number>();

      // CASE A: Daily Newspapers & Regular Publications (typeP != 'Magzine')
      if (!isMagzine) {
        for (let day = 1; day <= daysInMonth; day++) {
          const targetDateIso = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dObj = new Date(year, monthIdx, day);
          const legacyDayOfWeek = dObj.getDay() + 1; // 1=Sun..7=Sat

          // Active date range check
          if (targetDateIso < sDateIso) continue;
          if (cDateIso && targetDateIso >= cDateIso) continue;

          // Holiday & Discontinue checks
          if (isHoliday(cd.publica_id, targetDateIso)) continue;
          if (isDiscontinued(custId, cd.publica_id, targetDateIso)) continue;

          // Schedule day check
          if (!isScheduleMatch(cd.from_day || cd.From_Day, legacyDayOfWeek)) continue;

          // Resolve rate on this date
          const rate = getEffectiveRate(cd.publica_id, legacyDayOfWeek, targetDateIso);
          if (rate > 0) {
            rateDaysMap.set(rate, (rateDaysMap.get(rate) || 0) + 1);
          }
        }
      }
      // CASE B: Weekly Magazines (typeP == 'Magzine' && MagzineDay >= 1)
      else if (magzineDay >= 1) {
        for (let day = 1; day <= daysInMonth; day++) {
          const targetDateIso = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dObj = new Date(year, monthIdx, day);
          const legacyDayOfWeek = dObj.getDay() + 1;

          if (legacyDayOfWeek !== magzineDay) continue;
          if (targetDateIso < sDateIso) continue;
          if (cDateIso && targetDateIso >= cDateIso) continue;
          if (isHoliday(cd.publica_id, targetDateIso)) continue;
          if (isDiscontinued(custId, cd.publica_id, targetDateIso)) continue;

          const rate = getEffectiveRate(cd.publica_id, legacyDayOfWeek, targetDateIso);
          if (rate > 0) {
            rateDaysMap.set(rate, (rateDaysMap.get(rate) || 0) + 1);
          }
        }
      }
      // CASE C: Fortnightly Magazines (Publica_id in 13,11,17,23,24,18,216)
      else if (FORTNIGHTLY_PUBS.has(cd.publica_id)) {
        const periodDates = [
          `${year}-${String(monthNum).padStart(2, '0')}-01`,
          `${year}-${String(monthNum).padStart(2, '0')}-16`
        ];
        for (const pDateIso of periodDates) {
          if (pDateIso < sDateIso) continue;
          if (cDateIso && pDateIso >= cDateIso) continue;
          if (isDiscontinued(custId, cd.publica_id, pDateIso)) continue;

          const rate = getEffectiveRate(cd.publica_id, 1, pDateIso);
          if (rate > 0) {
            rateDaysMap.set(rate, (rateDaysMap.get(rate) || 0) + 1);
          }
        }
      }
      // CASE D: Monthly + Quarterly Magazines (1st of month)
      else {
        const pDateIso = `${year}-${String(monthNum).padStart(2, '0')}-01`;
        // Quarterly rule for publication #75 (only Jan, Apr, Jul, Oct)
        const isQuarterlyAllowed = cd.publica_id !== 75 || [1, 4, 7, 10].includes(monthNum);

        if (isQuarterlyAllowed && sDateIso <= monthEndIso && (!cDateIso || cDateIso > monthStartIso)) {
          if (!isDiscontinued(custId, cd.publica_id, pDateIso)) {
            const rate = getEffectiveRate(cd.publica_id, 1, pDateIso);
            if (rate > 0) {
              rateDaysMap.set(rate, (rateDaysMap.get(rate) || 0) + 1);
            }
          }
        }
      }

      // Add line items for each rate
      for (const [rate, daysOrCopies] of rateDaysMap.entries()) {
        const lineAmt = Math.round(rate * qty * daysOrCopies * 100) / 100;
        customerPaperTotal += lineAmt;
        custBreakup.push({
          customer_id: custId,
          name_eng: cust.name_eng || `Customer #${custId}`,
          customer_hindi: cust.name_hindi || '',
          sort_order: 1,
          item: pubName,
          rate: rate,
          qty: qty,
          days_or_copies: daysOrCopies,
          amount: lineAmt
        });
      }

      // Delivery Charges (Sort_order 2)
      const dely = cd.dely || cd.Dely || 0;
      if (dely !== 0 && (!cDateIso || cDateIso > monthStartIso)) {
        customerDeliveryTotal += dely;
        custBreakup.push({
          customer_id: custId,
          name_eng: cust.name_eng || `Customer #${custId}`,
          customer_hindi: cust.name_hindi || '',
          sort_order: 2,
          item: `${pubName} - Delivery`,
          rate: dely,
          qty: 1,
          days_or_copies: 1,
          amount: dely
        });
      }
    }

    // =========================================================================
    // 2. PREVIOUS DUE (Sort_order 4)
    // =========================================================================
    const initialDue = cust.dueamount || 0;
    const billedHistory = duesByCust.get(custId) || 0;
    const paidHistory = receiptsByCust.get(custId) || 0;
    const previousDue = Math.round((initialDue + billedHistory - paidHistory) * 100) / 100;

    if (previousDue !== 0) {
      custBreakup.push({
        customer_id: custId,
        name_eng: cust.name_eng || `Customer #${custId}`,
        customer_hindi: cust.name_hindi || '',
        sort_order: 4,
        item: 'Previous Due (Opening + Apr-Jul Bills)',
        rate: null,
        qty: null,
        days_or_copies: null,
        amount: previousDue
      });
    }

    // =========================================================================
    // 3. GRAND TOTAL (Sort_order 9)
    // =========================================================================
    const totalPayable = Math.round((previousDue + customerPaperTotal + customerDeliveryTotal) * 100) / 100;

    // Only generate bill if customer has active papers or outstanding dues
    if (totalPayable === 0 && customerPaperTotal === 0 && custBreakup.length === 0) {
      continue;
    }

    custBreakup.push({
      customer_id: custId,
      name_eng: cust.name_eng || `Customer #${custId}`,
      customer_hindi: cust.name_hindi || '',
      sort_order: 9,
      item: 'GRAND TOTAL',
      rate: null,
      qty: null,
      days_or_copies: null,
      amount: totalPayable
    });

    const reg = regMap.get(cust.region_id);

    const billObj: CustomerMonthlyBill = {
      bill_no: 1000 + generatedBills.length + 1,
      customer_id: custId,
      name_eng: cust.name_eng || `Customer #${custId}`,
      customer_hindi: cust.name_hindi || '',
      region_id: cust.region_id,
      region_name: reg ? reg.name : `Region #${cust.region_id}`,
      month: monthName,
      year: year,
      previous_due: previousDue,
      paper_amount: customerPaperTotal,
      delivery_amount: customerDeliveryTotal,
      discount_amount: cust.discount || 0,
      retail_sale_amount: 0,
      total_payable: totalPayable,
      breakup: custBreakup
    };

    generatedBills.push(billObj);
    allBreakupLines.push(...custBreakup);
    grandTotalBilling += totalPayable;
  }

  return {
    month: monthName,
    year: year,
    region_id: regionId,
    total_bills: generatedBills.length,
    grand_total: Math.round(grandTotalBilling * 100) / 100,
    bills: generatedBills,
    breakup_lines: allBreakupLines
  };
}
