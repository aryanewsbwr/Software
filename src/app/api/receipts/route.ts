import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

let cachedReceipts: any[] | null = null;

function loadReceipts() {
  if (!cachedReceipts) {
    const f = path.join(process.cwd(), 'public', 'data', 'all_receipts.json');
    if (fs.existsSync(f)) cachedReceipts = JSON.parse(fs.readFileSync(f, 'utf-8'));
    else cachedReceipts = [];
  }
}

export async function GET(request: NextRequest) {
  try {
    loadReceipts();
    const { searchParams } = new URL(request.url);
    const customerIdStr = searchParams.get('customer_id');

    if (customerIdStr) {
      const cid = parseInt(customerIdStr, 10);
      const list = (cachedReceipts || []).filter(r => r.customer_id === cid);
      return NextResponse.json({ customer_id: cid, total: list.length, receipts: list });
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const total = (cachedReceipts || []).length;
    const start = (page - 1) * limit;
    const data = (cachedReceipts || []).slice(start, start + limit);

    return NextResponse.json({ total, page, limit, receipts: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
