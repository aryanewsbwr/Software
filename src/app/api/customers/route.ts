import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

let cachedCustomers: any[] | null = null;

function loadLocalBackup(): any[] {
  if (cachedCustomers) return cachedCustomers;
  const filePath = path.join(process.cwd(), 'public', 'data', 'all_customers.json');
  if (fs.existsSync(filePath)) {
    cachedCustomers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return cachedCustomers || [];
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const regionId = searchParams.get('region_id');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 1. Try Live Supabase Query
    let query = supabase
      .from('customer')
      .select('*', { count: 'exact' });

    if (search) {
      if (/^\d+$/.test(search)) {
        query = query.or(`customer_id.eq.${search},priority.eq.${search},phone.ilike.%${search}%`);
      } else {
        query = query.or(`name_eng.ilike.%${search}%,name_hindi.ilike.%${search}%`);
      }
    }

    if (regionId && regionId !== 'all') {
      query = query.eq('region_id', parseInt(regionId, 10));
    }

    query = query.order('customer_id', { ascending: true }).range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      return NextResponse.json({
        source: 'supabase',
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        customers: data
      });
    }

    // 2. Fallback to Local Dataset if Supabase has network/config error
    console.warn('Supabase query failed, using local backup:', error?.message);
    const all = loadLocalBackup();
    let filtered = all;

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name_eng?.toLowerCase().includes(s) ||
        c.name_hindi?.includes(s) ||
        c.customer_id?.toString() === s ||
        c.priority?.toString() === s ||
        c.phone?.includes(s)
      );
    }

    if (regionId && regionId !== 'all') {
      filtered = filtered.filter(c => c.region_id === parseInt(regionId, 10));
    }

    const total = filtered.length;
    const localData = filtered.slice(from, from + limit);

    return NextResponse.json({
      source: 'local_backup',
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      customers: localData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Save / Update Customer in Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, ...rest } = body;

    if (customer_id && customer_id > 0) {
      const { data, error } = await supabase
        .from('customer')
        .update(rest)
        .eq('customer_id', customer_id)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, customer: data?.[0] });
    } else {
      const { data, error } = await supabase
        .from('customer')
        .insert([rest])
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, customer: data?.[0] });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
