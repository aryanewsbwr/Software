import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { supabase } from '@/lib/supabaseClient';
import { calculateBilling, MONTH_NAMES, parseLegacyDateToIso } from '@/lib/billingEngine';
import { cleanOrTransliterateHindi } from '@/lib/transliteration';

export const dynamic = 'force-dynamic';

let cachedCusts: any[] | null = null;
let cachedRates: any[] | null = null;
let cachedRateChanges: any[] | null = null;
let cachedPubs: any[] | null = null;
let cachedHolidays: any[] | null = null;
let cachedDiscontinues: any[] | null = null;
let cachedBills: any[] | null = null;
let cachedReceipts: any[] | null = null;
let cachedRegions: any[] | null = null;
let cachedPubDis: any[] | null = null;
let cachedAllSubs: any[] | null = null;

function loadJson(filename: string): any[] {
  const f = path.join(process.cwd(), 'public', 'data', filename);
  if (fs.existsSync(f)) {
    try {
      return JSON.parse(fs.readFileSync(f, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

async function fetchAllFromSupabase(table: string): Promise<any[]> {
  const all: any[] = [];
  const PAGE_SIZE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

function getRates(): any[] {
  if (cachedRates && cachedRates.length > 0) return cachedRates;
  cachedRates = loadJson('rates.json');
  return cachedRates || [];
}

function getRateChanges(): any[] {
  if (cachedRateChanges && cachedRateChanges.length > 0) return cachedRateChanges;
  cachedRateChanges = loadJson('ratechanges.json').map((rc: any) => ({
    ...rc,
    dated: rc.effective_date || rc.dated
  }));
  return cachedRateChanges || [];
}

function getPublications(): any[] {
  if (cachedPubs && cachedPubs.length > 0) return cachedPubs;
  cachedPubs = loadJson('publications.json');
  return cachedPubs || [];
}

function getDiscontinues(): any[] {
  if (cachedDiscontinues && cachedDiscontinues.length > 0) return cachedDiscontinues;
  cachedDiscontinues = loadJson('discontinues.json');
  return cachedDiscontinues || [];
}

function getRegions(): any[] {
  if (cachedRegions && cachedRegions.length > 0) return cachedRegions;
  cachedRegions = loadJson('regions.json');
  return cachedRegions || [];
}

function getCustomers(): any[] {
  if (cachedCusts && cachedCusts.length > 0) return cachedCusts;
  cachedCusts = loadJson('all_customers.json');
  return cachedCusts || [];
}

function getAllSubscriptions(): any[] {
  if (cachedAllSubs && cachedAllSubs.length > 0) return cachedAllSubs;
  cachedAllSubs = loadJson('all_subscriptions.json');
  return cachedAllSubs || [];
}

function getActiveCustomerIds(month: string, year: number | string): Set<number> {
  const allSubs = getAllSubscriptions();
  const allRetail = loadJson('retailsale.json');

  const targetMonthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === month.toLowerCase() || m.toLowerCase().startsWith(month.toLowerCase().slice(0, 3)));
  const actualMonthIdx = targetMonthIdx >= 0 ? targetMonthIdx : 8; // default September
  const actualMonthNum = actualMonthIdx + 1;
  const startYr = parseInt(String(year).slice(0, 4), 10) || 2026;
  const calYr = actualMonthIdx >= 3 ? startYr : startYr + 1;
  const daysInM = new Date(calYr, actualMonthIdx + 1, 0).getDate();
  const mStartIso = `${calYr}-${String(actualMonthNum).padStart(2, '0')}-01`;
  const mEndIso = `${calYr}-${String(actualMonthNum).padStart(2, '0')}-${String(daysInM).padStart(2, '0')}`;

  const activeCustSet = new Set<number>();
  for (const s of allSubs) {
    const sDateIso = parseLegacyDateToIso(s.s_date || s.S_Date) || '2000-01-01';
    const cDateIso = parseLegacyDateToIso(s.c_date || s.C_Date);
    if (sDateIso <= mEndIso && (!cDateIso || cDateIso >= mStartIso)) {
      activeCustSet.add(Number(s.customer_id || s.Customer_id));
    }
  }
  for (const rs of allRetail) {
    activeCustSet.add(Number(rs.customer_id || rs.Customer_id));
  }
  return activeCustSet;
}

function getHolidays(): any[] {
  if (cachedHolidays && cachedHolidays.length > 0) return cachedHolidays;
  cachedHolidays = loadJson('holidays.json');
  return cachedHolidays || [];
}

async function getPublicationDiscontinues(): Promise<any[]> {
  if (cachedPubDis && cachedPubDis.length > 0) return cachedPubDis;
  const localPubDis = loadJson('publicationdis.json') || [];
  try {
    const { data } = await supabase.from('publicationdis').select('*');
    if (data && data.length > 0) {
      cachedPubDis = data;
      return cachedPubDis;
    }
  } catch (err) {
    // fallback
  }
  cachedPubDis = localPubDis;
  return cachedPubDis;
}



async function getMaxBillId(fySuffix: string): Promise<number> {
  try {
    const { data } = await supabase
      .from(`billno${fySuffix}`)
      .select('bill_id')
      .order('bill_id', { ascending: false })
      .limit(1);
    if (data && data.length > 0 && data[0].bill_id) {
      return Number(data[0].bill_id);
    }
  } catch (_) {}
  return 1000;
}

async function fetchSubscriptions(customerIds: number[]): Promise<any[]> {
  if (customerIds.length === 0) return [];

  const CHUNK_SIZE = 100;
  const result: any[] = [];
  const foundCustIds = new Set<number>();

  // 1. Query customer_detail directly from Supabase (authoritative active subscriptions)
  for (let i = 0; i < customerIds.length; i += CHUNK_SIZE) {
    const chunk = customerIds.slice(i, i + CHUNK_SIZE);
    try {
      const { data: cdSubs } = await supabase
        .from('customer_detail')
        .select('*')
        .in('customer_id', chunk)
        .limit(50000);
      if (cdSubs && cdSubs.length > 0) {
        result.push(...cdSubs);
        cdSubs.forEach(s => foundCustIds.add(s.customer_id));
      }
    } catch (err) {
      console.error('Error fetching customer_detail chunk:', err);
    }
  }

  // 2. Fallback to all_subscriptions.json for any missing customers
  const missingCustIds = customerIds.filter(id => !foundCustIds.has(id));
  if (missingCustIds.length > 0) {
    try {
      const localSubsPath = path.join(process.cwd(), 'public', 'data', 'all_subscriptions.json');
      if (fs.existsSync(localSubsPath)) {
        const localSubs = JSON.parse(fs.readFileSync(localSubsPath, 'utf-8'));
        const fallback = localSubs.filter((s: any) => missingCustIds.includes(s.customer_id));
        result.push(...fallback);
      }
    } catch (err) {
      console.error('Error reading local all_subscriptions.json fallback:', err);
    }
  }

  return result;
}

async function fetchBillsAndReceipts(customerIds: number[], fySuffix: string) {
  if (customerIds.length === 0) return { bills: [], billHeaders: [], receipts: [] };
  const CHUNK_SIZE = 50;
  const allBills: any[] = [];
  const allBillHeaders: any[] = [];
  const allReceipts: any[] = [];

  try {
    for (let i = 0; i < customerIds.length; i += CHUNK_SIZE) {
      const chunk = customerIds.slice(i, i + CHUNK_SIZE);
      const [{ data: bData }, { data: itemsData }, { data: rData }] = await Promise.all([
        supabase.from(`billno${fySuffix}`).select('*').in('customer_id', chunk).limit(50000),
        supabase.from(`bill${fySuffix}`).select('*').in('customer_id', chunk).limit(50000),
        supabase.from(`receipt${fySuffix}`).select('*').in('customer_id', chunk).limit(50000)
      ]);
      if (bData) allBillHeaders.push(...bData);
      if (itemsData) allBills.push(...itemsData);
      if (rData) allReceipts.push(...rData);
    }
    if (allBills.length > 0 || allBillHeaders.length > 0 || allReceipts.length > 0) {
      return { bills: allBills, billHeaders: allBillHeaders, receipts: allReceipts };
    }
  } catch (e) {
    // fallback
  }
  const bFiltered = (cachedBills || []).filter(b => customerIds.includes(b.customer_id || b.Customer_id));
  const rFiltered = (cachedReceipts || []).filter(r => customerIds.includes(r.customer_id || r.Customer_id));
  return { bills: bFiltered, billHeaders: bFiltered, receipts: rFiltered };
}

async function fetchRetailSales(customerIds: number[], fySuffix: string): Promise<any[]> {
  if (customerIds.length === 0) return [];
  const localSales = loadJson('retailsale.json');
  const matchingLocal = localSales.filter((s: any) => {
    const cid = Number(s.Customer_id || s.customer_id);
    return customerIds.includes(cid);
  });

  const matchingDb: any[] = [];
  try {
    const CHUNK_SIZE = 50;
    for (let i = 0; i < customerIds.length; i += CHUNK_SIZE) {
      const chunk = customerIds.slice(i, i + CHUNK_SIZE);
      
      // 1. Query generic retailsale table
      try {
        const { data: genData } = await supabase
          .from('retailsale')
          .select('*')
          .in('customer_id', chunk)
          .limit(50000);
        if (genData && genData.length > 0) {
          matchingDb.push(...genData.map(r => ({
            Retail_id: r.retail_id || r.Retail_id || r.sale_id,
            Vr_Date: r.vr_date || r.Vr_Date,
            Customer_id: r.customer_id || r.Customer_id,
            Publica_id: r.publica_id || r.Publica_id,
            Copies: r.copies || r.Copies || 1,
            Rate: r.rate || r.Rate || 0,
            Amt: r.amt !== undefined ? r.amt : (r.Amt !== undefined ? r.Amt : (r.amount || 0)),
            Narr: r.narr || r.Narr || r.narration || ''
          })));
        }
      } catch {
        // ignore
      }

      // 2. Query FY specific table (e.g. retailsale20252026)
      try {
        const { data: fyData } = await supabase
          .from(`retailsale${fySuffix}`)
          .select('*')
          .in('Customer_id', chunk)
          .limit(50000);
        if (fyData && fyData.length > 0) {
          matchingDb.push(...fyData);
        }
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.error('Error fetching retail sales from Supabase:', err);
  }

  const seen = new Set<string>();
  const merged: any[] = [];
  for (const item of [...matchingLocal, ...matchingDb]) {
    const rId = item.Retail_id || item.retail_id || item.sale_id;
    const key = rId 
      ? `id-${rId}` 
      : `${item.Customer_id || item.customer_id}-${item.Publica_id || item.publica_id}-${item.Vr_Date || item.vr_date}-${item.Rate || item.rate || 0}-${item.Amt || item.amt || 0}-${item.Copies || item.copies || 1}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }
  return merged;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || 'August';
    const year = searchParams.get('year') || '2026';
    const regionId = searchParams.get('region_id') || 'all';
    const customerIdStr = searchParams.get('customer_id');
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '200', 10);

    // Fetch core reference datasets directly from Supabase
    const [rates, ratechanges, pubs, discontinues, regions] = await Promise.all([
      getRates(),
      getRateChanges(),
      getPublications(),
      getDiscontinues(),
      getRegions()
    ]);

    // Determine fiscal year suffix (e.g. 20252026)
    let fySuffix = '20252026';
    const yStr = String(year);
    if (yStr.length === 8) {
      fySuffix = yStr;
    } else {
      const startY = parseInt(yStr, 10) || 2025;
      fySuffix = `${startY}${startY + 1}`;
    }

    // If single customer queried (for Breakup / Slip): Instant calculation
    if (customerIdStr) {
      const cid = parseInt(customerIdStr, 10);
      let targetCust = (cachedCusts || []).find(c => (c.customer_id || c.Customer_id) === cid);
      if (!targetCust) {
        const { data: dbCust } = await supabase.from('customer').select('*').eq('customer_id', cid).single();
        if (dbCust) targetCust = dbCust;
      }
      const targetCusts = targetCust ? [targetCust] : [];

      const [custSubs, { bills: liveCustBills, billHeaders: liveCustBillHeaders, receipts: liveCustReceipts }, pubDis, liveRetail, maxBillId, liveHolidays] = await Promise.all([
        fetchSubscriptions([cid]),
        fetchBillsAndReceipts([cid], fySuffix),
        getPublicationDiscontinues(),
        fetchRetailSales([cid], fySuffix),
        getMaxBillId(fySuffix),
        getHolidays()
      ]);

      const singleResult = calculateBilling({
        monthName: month,
        year: year,
        regionId: 'all',
        customers: targetCusts,
        subscriptions: custSubs,
        rates: rates,
        ratechanges: ratechanges,
        publications: pubs,
        holidays: liveHolidays,
        discontinues: discontinues,
        publicationDiscontinues: pubDis,
        bills: liveCustBills,
        billHeaders: liveCustBillHeaders,
        receipts: liveCustReceipts,
        regions: regions,
        retailSales: liveRetail,
        startBillId: maxBillId + 1
      });

      const singleBill = singleResult.bills[0] || null;
      if (singleBill) {
        singleBill.customer_hindi = cleanOrTransliterateHindi(singleBill.customer_hindi, singleBill.name_eng);
      }
      const singleBreakup = (singleResult.breakup_lines || []).map(bl => ({
        ...bl,
        customer_hindi: cleanOrTransliterateHindi(bl.customer_hindi || '', bl.name_eng)
      }));

      return NextResponse.json({
        customer_id: cid,
        bill: singleBill,
        breakup: singleBreakup
      });
    }

    let targetCusts = await getCustomers();

    // Filter by region
    if (regionId && regionId !== 'all') {
      const rId = parseInt(regionId, 10);
      targetCusts = targetCusts.filter(c => (c.region_id || c.Region_id) === rId);
    }

    // Filter by search text
    if (search) {
      targetCusts = targetCusts.filter(c => 
        String(c.name_eng || c.Name_eng || '').toLowerCase().includes(search) ||
        String(c.name_hindi || c.Name_hindi || '').toLowerCase().includes(search) ||
        String(c.customer_id || c.Customer_id || '') === search ||
        String(c.customer_id || c.Customer_id || '').includes(search) ||
        String(c.phone || '').includes(search) ||
        String(c.add1 || '').toLowerCase().includes(search) ||
        String(c.hindi_add || '').toLowerCase().includes(search)
      );
    } else {
      // In FoxPro monthly delivery billing, only active delivery customers receive bills.
      // Filter out discontinued / closed customers with 0 current deliveries.
      const activeCustSet = getActiveCustomerIds(month, year);
      targetCusts = targetCusts.filter(c => activeCustSet.has(Number(c.customer_id || c.Customer_id)));
    }

    // Sort target customers strictly by customer_id ascending
    targetCusts.sort((a, b) => {
      const idA = Number(a.customer_id || a.Customer_id || 0);
      const idB = Number(b.customer_id || b.Customer_id || 0);
      return idA - idB;
    });

    const totalCustCount = targetCusts.length;
    // Paginate target customers for instant response
    const paginatedCusts = targetCusts.slice((page - 1) * limit, page * limit);
    const paginatedCustIds = paginatedCusts.map(c => c.customer_id || c.Customer_id);

    const [paginatedSubs, { bills: liveCustBills, billHeaders: liveCustBillHeaders, receipts: liveCustReceipts }, pubDis, dbBatchRetail, maxBillId, liveHolidays] = await Promise.all([
      fetchSubscriptions(paginatedCustIds),
      fetchBillsAndReceipts(paginatedCustIds, fySuffix),
      getPublicationDiscontinues(),
      fetchRetailSales(paginatedCustIds, fySuffix),
      getMaxBillId(fySuffix),
      getHolidays()
    ]);

    const result = calculateBilling({
      monthName: month,
      year: year,
      regionId: regionId,
      customers: paginatedCusts,
      subscriptions: paginatedSubs,
      rates: rates,
      ratechanges: ratechanges,
      publications: pubs,
      holidays: liveHolidays,
      discontinues: discontinues,
      publicationDiscontinues: pubDis,
      bills: liveCustBills,
      billHeaders: liveCustBillHeaders,
      receipts: liveCustReceipts,
      regions: regions,
      retailSales: dbBatchRetail,
      startBillId: maxBillId + 1 + (page - 1) * limit
    });

    // Strip heavy breakup arrays from list view for maximum speed
    const lightweightBills = result.bills.map(b => ({
      bill_no: b.bill_no,
      customer_id: b.customer_id,
      name_eng: b.name_eng,
      customer_hindi: cleanOrTransliterateHindi(b.customer_hindi, b.name_eng),
      region_name: b.region_name,
      previous_due: b.previous_due,
      paper_amount: b.paper_amount,
      delivery_amount: b.delivery_amount,
      discount_amount: b.discount_amount,
      total_payable: b.total_payable,
      month: b.month,
      year: b.year
    }));

    return NextResponse.json({
      month: month,
      year: year,
      page: page,
      limit: limit,
      total_customers: totalCustCount,
      total_bills: lightweightBills.length,
      grand_total: result.grand_total,
      bills: lightweightBills
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month = 'August', year = '2026', region_id = 'all', commitToDb = false } = body;

    let targetCusts = await getCustomers();
    if (region_id && region_id !== 'all') {
      const rId = parseInt(region_id, 10);
      targetCusts = targetCusts.filter(c => (c.region_id || c.Region_id) === rId);
    }

    // Determine fiscal year suffix (e.g. 20252026)
    let fySuffix = '20252026';
    const yStr = String(year);
    if (yStr.length === 8) {
      fySuffix = yStr;
    } else {
      const startY = parseInt(yStr, 10) || 2025;
      fySuffix = `${startY}${startY + 1}`;
    }
    // In FoxPro monthly delivery billing, only active delivery customers receive bills.
    // Filter out discontinued / closed customers with 0 current deliveries.
    const activeCustSet = getActiveCustomerIds(month, year);
    targetCusts = targetCusts.filter(c => activeCustSet.has(Number(c.customer_id || c.Customer_id)));

    // Sort target customers strictly by customer_id ascending
    targetCusts.sort((a, b) => {
      const idA = Number(a.customer_id || a.Customer_id || 0);
      const idB = Number(b.customer_id || b.Customer_id || 0);
      return idA - idB;
    });

    const targetCustIds = targetCusts.map(c => c.customer_id || c.Customer_id);
    const [targetSubs, { bills: liveCustBills, billHeaders: liveCustBillHeaders, receipts: liveCustReceipts }, pubDis, dbBatchRetail, maxBillId, liveHolidays, rates, ratechanges, pubs, discontinues, regions] = await Promise.all([
      fetchSubscriptions(targetCustIds),
      fetchBillsAndReceipts(targetCustIds, fySuffix),
      getPublicationDiscontinues(),
      fetchRetailSales(targetCustIds, fySuffix),
      getMaxBillId(fySuffix),
      getHolidays(),
      getRates(),
      getRateChanges(),
      getPublications(),
      getDiscontinues(),
      getRegions()
    ]);

    const result = calculateBilling({
      monthName: month,
      year: year,
      regionId: region_id,
      customers: targetCusts,
      subscriptions: targetSubs,
      rates: rates,
      ratechanges: ratechanges,
      publications: pubs,
      holidays: liveHolidays,
      discontinues: discontinues,
      publicationDiscontinues: pubDis,
      bills: liveCustBills,
      billHeaders: liveCustBillHeaders,
      receipts: liveCustReceipts,
      regions: regions,
      retailSales: dbBatchRetail,
      startBillId: maxBillId + 1
    });

    // If commit to live Supabase DB is requested:
    let savedToSupabase = false;
    let savedBillnoCount = 0;
    let savedBillItemsCount = 0;

    if (commitToDb && supabase) {
      const billnoTable = `billno${fySuffix}`;
      const billTable = `bill${fySuffix}`;
      const billdelTable = `billdel${fySuffix}`;

      // Extract all DB rows
      const billnoRows = result.bills.map(b => b.db_billno_item).filter(Boolean);
      const billRows = result.bills.flatMap(b => b.db_bill_items || []).filter(Boolean);
      const billdelRows = result.bills.flatMap(b => b.db_billdel_items || []).filter(Boolean);

      // Insert in batches of 500 to Supabase
      const insertBatch = async (tableName: string, rows: any[]) => {
        for (let i = 0; i < rows.length; i += 500) {
          const batch = rows.slice(i, i + 500);
          await supabase.from(tableName).upsert(batch);
        }
      };

      try {
        await insertBatch(billnoTable, billnoRows);
        await insertBatch(billTable, billRows);
        if (billdelRows.length > 0) {
          try {
            await insertBatch(billdelTable, billdelRows);
          } catch (delErr) {
            console.warn('billdel insert note:', delErr);
          }
        }

        // Update customer cbal in customer table to reflect closing balance
        for (let i = 0; i < result.bills.length; i += 100) {
          const chunk = result.bills.slice(i, i + 100);
          await Promise.all(
            chunk.map(b =>
              supabase.from('customer').update({ cbal: -b.total_payable }).eq('customer_id', b.customer_id)
            )
          );
        }

        savedToSupabase = true;
        savedBillnoCount = billnoRows.length;
        savedBillItemsCount = billRows.length;
      } catch (dbErr) {
        console.error('Error saving to Supabase:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      month: result.month,
      year: result.year,
      total_customers: targetCusts.length,
      total_bills_generated: result.bills.length,
      grand_total: result.grand_total,
      saved_to_supabase: savedToSupabase,
      saved_billno_count: savedBillnoCount,
      saved_bill_items_count: savedBillItemsCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
