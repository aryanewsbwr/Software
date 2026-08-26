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
    const customerIdStr = searchParams.get('customer_id');

    if (!customerIdStr) {
      return NextResponse.json({ subscriptions: [], total: 0, active_count: 0, discontinued_count: 0 });
    }

    const cid = parseInt(customerIdStr, 10);

    // 1. Try Querying Supabase customer_detail
    const { data: supaSubs, error } = await supabase
      .from('customer_detail')
      .select('*')
      .eq('customer_id', cid)
      .order('sno', { ascending: true });

    if (!error && supaSubs && supaSubs.length > 0) {
      const enriched = supaSubs.map(s => {
        const hasCloseDate = s.c_date && s.c_date.trim().length > 0;
        return {
          sno: s.sno,
          customer_id: s.customer_id,
          publica_id: s.publication_id || s.publica_id,
          publication_name: s.publication_name,
          hawker_id: s.hawker_id,
          hawker_name: s.hawker_name,
          qty: s.qty || 1,
          circulation: s.circulation || 'Morning',
          from_day: Array.isArray(s.delivery_days) ? (s.delivery_days.length === 7 ? '1-7' : s.delivery_days.join(',')) : (s.from_day || '1-7'),
          s_date: s.s_date || s.created_at || '',
          c_date: s.c_date || null,
          dis: s.discount_percent || s.dis || 0,
          dely: s.delivery_charge || s.dely || 0,
          is_active: !hasCloseDate
        };
      });

      return NextResponse.json({
        source: 'supabase',
        subscriptions: enriched,
        total: enriched.length,
        active_count: enriched.filter(s => s.is_active).length,
        discontinued_count: enriched.filter(s => !s.is_active).length
      });
    }

    // 2. Fallback to Local Backup
    loadLocalData();
    const subs = (cachedSubs || []).filter(s => s.customer_id === cid);

    const enriched = subs.map(s => {
      const pub = (cachedPubs || []).find(p => p.publica_id === s.publica_id);
      const hw = (cachedHawkers || []).find(h => h.hawker_id === s.hawker_id);
      const hasCloseDate = s.c_date && s.c_date.trim().length > 0;
      const is_active = !hasCloseDate;

      return {
        ...s,
        publication_name: pub ? pub.public_name : `Publication #${s.publica_id}`,
        hawker_name: hw ? hw.name : `Hawker #${s.hawker_id}`,
        is_active,
        s_date: s.s_date || '',
        c_date: s.c_date || null
      };
    });

    return NextResponse.json({
      source: 'local_backup',
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
