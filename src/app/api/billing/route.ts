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

    let targetCusts = cachedCusts || [];
    if (customerIdStr) {
      const cid = parseInt(customerIdStr, 10);
      targetCusts = targetCusts.filter(c => c.customer_id === cid);
    }

    const result = calculateBilling({
      monthName: month,
      year: year,
      regionId: regionId,
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

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
