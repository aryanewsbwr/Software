import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

let cachedCusts: any[] | null = null;
let cachedSubs: any[] | null = null;
let cachedRates: any[] | null = null;
let cachedPubs: any[] | null = null;
let cachedRegions: any[] | null = null;

function loadData() {
  if (!cachedCusts) {
    const f = path.join(process.cwd(), 'public', 'data', 'all_customers.json');
    if (fs.existsSync(f)) cachedCusts = JSON.parse(fs.readFileSync(f, 'utf-8'));
    else cachedCusts = [];
  }
  if (!cachedSubs) {
    const f = path.join(process.cwd(), 'public', 'data', 'all_subscriptions.json');
    if (fs.existsSync(f)) cachedSubs = JSON.parse(fs.readFileSync(f, 'utf-8'));
    else cachedSubs = [];
  }
  if (!cachedRates) {
    const f = path.join(process.cwd(), 'public', 'data', 'rate.json');
    if (fs.existsSync(f)) cachedRates = JSON.parse(fs.readFileSync(f, 'utf-8'));
    else cachedRates = [];
  }
  if (!cachedPubs) {
    const f = path.join(process.cwd(), 'public', 'data', 'publications.json');
    if (fs.existsSync(f)) cachedPubs = JSON.parse(fs.readFileSync(f, 'utf-8'));
    else cachedPubs = [];
  }
  if (!cachedRegions) {
    const f = path.join(process.cwd(), 'public', 'data', 'regions.json');
    if (fs.existsSync(f)) cachedRegions = JSON.parse(fs.readFileSync(f, 'utf-8'));
    else cachedRegions = [];
  }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export async function GET(request: NextRequest) {
  try {
    loadData();
    const { searchParams } = new URL(request.url);
    const monthName = searchParams.get('month') || 'August';
    const year = parseInt(searchParams.get('year') || '2026', 10);
    const regionIdFilter = searchParams.get('region_id') || 'all';

    let monthIdx = MONTH_NAMES.indexOf(monthName);
    if (monthIdx === -1) monthIdx = 7; // August default

    // Days in target month
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

    // Map rates by (publica_id, day_id)
    const rateMap = new Map<string, number>();
    for (const r of (cachedRates || [])) {
      rateMap.set(`${r.publica_id}_${r.day_id}`, r.rate || 4.5);
    }

    // Filter customers by region
    let targetCusts = cachedCusts || [];
    if (regionIdFilter !== 'all') {
      const rId = parseInt(regionIdFilter, 10);
      targetCusts = targetCusts.filter(c => c.region_id === rId);
    }

    // Group subscriptions by customer_id
    const subsByCust = new Map<number, any[]>();
    for (const s of (cachedSubs || [])) {
      if (!subsByCust.has(s.customer_id)) {
        subsByCust.set(s.customer_id, []);
      }
      subsByCust.get(s.customer_id)!.push(s);
    }

    const bills: any[] = [];
    let grandTotal = 0;

    for (let i = 0; i < targetCusts.length; i++) {
      const c = targetCusts[i];
      const custSubs = subsByCust.get(c.customer_id) || [];
      if (custSubs.length === 0 && c.dueamount === 0) continue;

      let currentPapersCost = 0;

      // Calculate cost across all days in month
      for (const sub of custSubs) {
        if (sub.c_date) {
          // Check if subscription was closed before this month
          let cDateObj: Date | null = null;
          if (sub.c_date.includes('/')) {
            const [d, m, y] = sub.c_date.split('/').map(Number);
            cDateObj = new Date(y, m - 1, d);
          } else {
            cDateObj = new Date(sub.c_date);
          }
          if (cDateObj && cDateObj < new Date(year, monthIdx, 1)) continue;
        }

        const qty = sub.qty || 1;
        const discountPct = sub.dis || 0;

        // Daily rate accumulation
        for (let day = 1; day <= daysInMonth; day++) {
          const dObj = new Date(year, monthIdx, day);
          const legacyDay = dObj.getDay() + 1; // 1=Sun..7=Sat

          // Check if delivered on this day
          const fromDay = sub.from_day || '1-7';
          let delivers = true;
          if (fromDay === '2-7' && legacyDay === 1) delivers = false;
          else if (fromDay === '1' && legacyDay !== 1) delivers = false;

          if (delivers) {
            const unitRate = rateMap.get(`${sub.publica_id}_${legacyDay}`) || 5.0;
            const dayCost = unitRate * qty * (1 - discountPct / 100);
            currentPapersCost += dayCost;
          }
        }
      }

      currentPapersCost = Math.round(currentPapersCost * 100) / 100;
      const prevDue = c.dueamount || 0;
      const deliveryAmt = c.delivery || 0;
      const discountAmt = c.discount || 0;
      const totalPayable = Math.round((prevDue + currentPapersCost + deliveryAmt - discountAmt) * 100) / 100;

      if (totalPayable === 0 && currentPapersCost === 0) continue;

      const reg = (cachedRegions || []).find(r => r.region_id === c.region_id);

      bills.push({
        bill_no: 1000 + bills.length + 1,
        customer_id: c.customer_id,
        customer_name: c.name_eng || `Customer #${c.customer_id}`,
        customer_hindi: c.name_hindi || '',
        region_name: reg ? reg.name : `Region #${c.region_id}`,
        previous_due: prevDue,
        current_papers: currentPapersCost,
        delivery: deliveryAmt,
        discount: discountAmt,
        total_payable: totalPayable,
        month: monthName,
        year: year
      });

      grandTotal += totalPayable;
    }

    return NextResponse.json({
      month: monthName,
      year: year,
      total_bills: bills.length,
      grand_total: grandTotal,
      bills: bills
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
