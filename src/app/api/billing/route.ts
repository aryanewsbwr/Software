import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { calculateBilling } from '@/lib/billingEngine';

export const dynamic = 'force-dynamic';

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

function loadAllDatasets() {
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
    loadAllDatasets();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || 'August';
    const year = parseInt(searchParams.get('year') || '2026', 10);
    const regionId = searchParams.get('region_id') || 'all';
    const customerIdStr = searchParams.get('customer_id');
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let targetCusts = cachedCusts || [];

    // If single customer queried (for Breakup / Slip): Instant calculation
    if (customerIdStr) {
      const cid = parseInt(customerIdStr, 10);
      targetCusts = targetCusts.filter(c => c.customer_id === cid);

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

      return NextResponse.json({
        customer_id: cid,
        bill: singleResult.bills[0] || null,
        breakup: singleResult.breakup_lines || []
      });
    }

    // Filter by region
    if (regionId && regionId !== 'all') {
      const rId = parseInt(regionId, 10);
      targetCusts = targetCusts.filter(c => c.region_id === rId);
    }

    // Filter by search text
    if (search) {
      targetCusts = targetCusts.filter(c => 
        c.name_eng?.toLowerCase().includes(search) ||
        c.customer_id?.toString() === search ||
        c.phone?.includes(search)
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
      customer_hindi: b.customer_hindi,
      region_name: b.region_name,
      previous_due: b.previous_due,
      paper_amount: b.paper_amount,
      delivery_amount: b.delivery_amount,
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
