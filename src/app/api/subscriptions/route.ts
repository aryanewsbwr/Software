import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

let cachedSubs: any[] | null = null;
let cachedPubs: any[] | null = null;
let cachedHawkers: any[] | null = null;

function loadLocalData() {
  if (!cachedSubs) {
    const f = path.join(process.cwd(), 'public', 'data', 'all_subscriptions.json');
    if (fs.existsSync(f)) cachedSubs = JSON.parse(fs.readFileSync(f, 'utf-8'));
    else cachedSubs = [];
  }
  if (!cachedPubs) {
    const f = path.join(process.cwd(), 'public', 'data', 'publications.json');
    if (fs.existsSync(f)) cachedPubs = JSON.parse(fs.readFileSync(f, 'utf-8'));
    else cachedPubs = [];
  }
  if (!cachedHawkers) {
    const f = path.join(process.cwd(), 'public', 'data', 'hawkers.json');
    if (fs.existsSync(f)) cachedHawkers = JSON.parse(fs.readFileSync(f, 'utf-8'));
    else cachedHawkers = [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerIdStr = searchParams.get('customer_id') || searchParams.get('customerId');

    if (!customerIdStr) {
      return NextResponse.json({ subscriptions: [], total: 0, active_count: 0, discontinued_count: 0 });
    }

    const cid = parseInt(customerIdStr, 10);
    loadLocalData();

    // 1. Get Authentic Complete Subscriptions from Dataset
    const subs = (cachedSubs || []).filter(s => s.customer_id === cid);

    const enriched = subs.map(s => {
      const pId = s.publica_id || s.publication_id;
      const hId = s.hawker_id;
      const pub = (cachedPubs || []).find(p => p.publica_id === pId);
      const hw = (cachedHawkers || []).find(h => h.hawker_id === hId);
      const hasCloseDate = s.c_date && s.c_date.trim().length > 0 && s.c_date !== 'null';
      const is_active = !hasCloseDate;

      return {
        ...s,
        sno: s.sno,
        customer_id: s.customer_id,
        publica_id: pId,
        publication_name: pub ? pub.public_name : (s.publication_name || `Publication #${pId}`),
        hawker_id: hId,
        hawker_name: hw ? hw.name : (s.hawker_name || `Hawker #${hId}`),
        qty: s.qty || 1,
        circulation: s.circulation || 'Morning',
        from_day: s.from_day || '1-7',
        s_date: s.s_date || '',
        c_date: hasCloseDate ? s.c_date : null,
        dis: s.dis ?? s.discount_percent ?? 0,
        dely: s.dely ?? s.delivery_charge ?? 0,
        is_active
      };
    });

    return NextResponse.json({
      source: 'authentic_database',
      subscriptions: enriched,
      total: enriched.length,
      active_count: enriched.filter(s => s.is_active).length,
      discontinued_count: enriched.filter(s => !s.is_active).length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add or Update Subscription in Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('customer_detail')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, subscription: data?.[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
