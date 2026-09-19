import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { calculateBilling } from '@/lib/billingEngine';
import { cleanOrTransliterateHindi } from '@/lib/transliteration';

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mekibdmvpkkujqpfqwyt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let cachedCusts: any[] | null = null;
let cachedSubs: any[] | null = null;
let cachedRates: any[] | null = null;
let cachedRateChanges: any[] | null = null;
let cachedPubs: any[] | null = null;
let cachedHolidays: any[] | null = null;
let cachedDiscontinues: any[] | null = null;
let cachedBills: any[] | null = null;
let cachedReceipts: any[] | null = null;
let cachedRegions: any[] | null = null;

function loadLocalDatasets() {
  const loadJson = (filename: string) => {
    const f = path.join(process.cwd(), 'public', 'data', filename);
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'));
    return [];
  };

  if (!cachedCusts) cachedCusts = loadJson('all_customers.json');
  if (!cachedSubs) cachedSubs = loadJson('all_subscriptions.json');
  if (!cachedRates) cachedRates = loadJson('rates.json');
  if (!cachedRateChanges) cachedRateChanges = loadJson('ratechanges.json');
  if (!cachedPubs) cachedPubs = loadJson('publications.json');
  if (!cachedHolidays) cachedHolidays = loadJson('holidays.json');
  if (!cachedDiscontinues) cachedDiscontinues = loadJson('discontinues.json');
  if (!cachedBills) cachedBills = loadJson('all_bills.json');
  if (!cachedReceipts) cachedReceipts = loadJson('all_receipts.json');
  if (!cachedRegions) cachedRegions = loadJson('regions.json');
}

export async function GET(request: NextRequest) {
  try {
    loadLocalDatasets();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || 'August';
    const year = searchParams.get('year') || '2026';
    const regionId = searchParams.get('region_id') || 'all';
    const customerIdStr = searchParams.get('customer_id');
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let targetCusts = cachedCusts || [];

    // If single customer queried (for Breakup / Slip): Instant calculation
    if (customerIdStr) {
      const cid = parseInt(customerIdStr, 10);
      targetCusts = targetCusts.filter(c => (c.customer_id || c.Customer_id) === cid);

      const singleResult = calculateBilling({
        monthName: month,
        year: year,
        regionId: 'all',
        customers: targetCusts,
        subscriptions: cachedSubs || [],
        rates: cachedRates || [],
        ratechanges: cachedRateChanges || [],
        publications: cachedPubs || [],
        holidays: cachedHolidays || [],
        discontinues: cachedDiscontinues || [],
        bills: cachedBills || [],
        receipts: cachedReceipts || [],
        regions: cachedRegions || []
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

    // Filter by region
    if (regionId && regionId !== 'all') {
      const rId = parseInt(regionId, 10);
      targetCusts = targetCusts.filter(c => (c.region_id || c.Region_id) === rId);
    }

    // Filter by search text
    if (search) {
      targetCusts = targetCusts.filter(c => 
        (c.name_eng || c.Name_eng || '').toLowerCase().includes(search) ||
        (c.customer_id || c.Customer_id)?.toString() === search ||
        (c.phone || '').includes(search)
      );
    }

    const totalCustCount = targetCusts.length;
    // Paginate target customers for instant response
    const paginatedCusts = targetCusts.slice((page - 1) * limit, page * limit);

    const result = calculateBilling({
      monthName: month,
      year: year,
      regionId: regionId,
      customers: paginatedCusts,
      subscriptions: cachedSubs || [],
      rates: cachedRates || [],
      ratechanges: cachedRateChanges || [],
      publications: cachedPubs || [],
      holidays: cachedHolidays || [],
      discontinues: cachedDiscontinues || [],
      bills: cachedBills || [],
      receipts: cachedReceipts || [],
      regions: cachedRegions || []
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
    loadLocalDatasets();
    const body = await request.json();
    const { month = 'August', year = '2026', region_id = 'all', commitToDb = false } = body;

    let targetCusts = cachedCusts || [];
    if (region_id && region_id !== 'all') {
      const rId = parseInt(region_id, 10);
      targetCusts = targetCusts.filter(c => (c.region_id || c.Region_id) === rId);
    }

    const result = calculateBilling({
      monthName: month,
      year: year,
      regionId: region_id,
      customers: targetCusts,
      subscriptions: cachedSubs || [],
      rates: cachedRates || [],
      ratechanges: cachedRateChanges || [],
      publications: cachedPubs || [],
      holidays: cachedHolidays || [],
      discontinues: cachedDiscontinues || [],
      bills: cachedBills || [],
      receipts: cachedReceipts || [],
      regions: cachedRegions || []
    });

    // If commit to live Supabase DB is requested:
    let savedToSupabase = false;
    let savedBillnoCount = 0;
    let savedBillItemsCount = 0;

    if (commitToDb && SUPABASE_KEY) {
      // Determine fiscal year suffix (e.g. 20252026)
      let fySuffix = '20252026';
      const yStr = String(year);
      if (yStr.length === 8) {
        fySuffix = yStr;
      } else {
        const startY = parseInt(yStr, 10) || 2025;
        fySuffix = `${startY}${startY + 1}`;
      }

      const billnoTable = `billno${fySuffix}`;
      const billTable = `bill${fySuffix}`;

      // Extract all DB rows
      const billnoRows = result.bills.map(b => b.db_billno_item).filter(Boolean);
      const billRows = result.bills.flatMap(b => b.db_bill_items || []).filter(Boolean);

      // Insert in batches of 500 to Supabase
      const insertBatch = async (tableName: string, rows: any[]) => {
        for (let i = 0; i < rows.length; i += 500) {
          const batch = rows.slice(i, i + 500);
          await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(batch)
          });
        }
      };

      try {
        await insertBatch(billnoTable, billnoRows);
        await insertBatch(billTable, billRows);
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
