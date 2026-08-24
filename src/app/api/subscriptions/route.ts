import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

let cachedSubs: any[] | null = null;
let cachedPubs: any[] | null = null;
let cachedHawkers: any[] | null = null;

function loadData() {
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
    loadData();
    const { searchParams } = new URL(request.url);
    const customerIdStr = searchParams.get('customer_id');

    if (!customerIdStr) {
      return NextResponse.json({ subscriptions: [] });
    }

    const cid = parseInt(customerIdStr, 10);
    const subs = (cachedSubs || []).filter(s => s.customer_id === cid);

    const enriched = subs.map(s => {
      const pub = (cachedPubs || []).find(p => p.publica_id === s.publica_id);
      const hw = (cachedHawkers || []).find(h => h.hawker_id === s.hawker_id);
      return {
        ...s,
        publication_name: pub ? pub.public_name : `Publication #${s.publica_id}`,
        hawker_name: hw ? hw.name : `Hawker #${s.hawker_id}`
      };
    });

    return NextResponse.json({
      customer_id: cid,
      total: enriched.length,
      subscriptions: enriched
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
