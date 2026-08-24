import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

let cachedCustomers: any[] | null = null;

function loadCustomers(): any[] {
  if (cachedCustomers) return cachedCustomers;
  const filePath = path.join(process.cwd(), 'public', 'data', 'all_customers.json');
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    cachedCustomers = JSON.parse(raw);
    return cachedCustomers || [];
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const regionId = searchParams.get('region_id');

    const all = loadCustomers();
    let filtered = all;

    if (search) {
      filtered = filtered.filter(c => 
        c.name_eng?.toLowerCase().includes(search) ||
        c.name_hindi?.includes(search) ||
        c.customer_id?.toString() === search ||
        c.priority?.toString() === search ||
        c.phone?.includes(search)
      );
    }

    if (regionId && regionId !== 'all') {
      const rId = parseInt(regionId, 10);
      filtered = filtered.filter(c => c.region_id === rId);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      customers: data
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
