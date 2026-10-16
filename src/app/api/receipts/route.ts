import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

let cachedReceipts: any[] | null = null;
let lastMtime: number = 0;

function loadReceipts() {
  const f = path.join(process.cwd(), 'public', 'data', 'all_receipts.json');
  if (fs.existsSync(f)) {
    const stats = fs.statSync(f);
    if (!cachedReceipts || stats.mtimeMs !== lastMtime) {
      cachedReceipts = JSON.parse(fs.readFileSync(f, 'utf-8'));
      lastMtime = stats.mtimeMs;
    }
  } else {
    cachedReceipts = [];
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

export async function DELETE(request: NextRequest) {
  try {
    loadReceipts();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const recpNo = searchParams.get('recp_no') || searchParams.get('receipt_no');
    const customerIdStr = searchParams.get('customer_id');

    if (!id && !recpNo) {
      return NextResponse.json({ error: 'id or recp_no is required' }, { status: 400 });
    }

    const f = path.join(process.cwd(), 'public', 'data', 'all_receipts.json');
    if (!cachedReceipts) {
      cachedReceipts = [];
    }

    const initialLen = cachedReceipts.length;
    cachedReceipts = cachedReceipts.filter(r => {
      const matchId = id && (String(r.id) === String(id) || String(r.receipt_id) === String(id));
      const matchRecpNo = recpNo && (String(r.recp_no) === String(recpNo) || String(r.receipt_no) === String(recpNo));
      const matchCust = customerIdStr ? String(r.customer_id) === String(customerIdStr) : true;

      // If matched, filter out
      if ((matchId || matchRecpNo) && matchCust) {
        return false;
      }
      return true;
    });

    if (cachedReceipts.length !== initialLen && fs.existsSync(f)) {
      fs.writeFileSync(f, JSON.stringify(cachedReceipts, null, 2), 'utf-8');
      lastMtime = fs.statSync(f).mtimeMs;
    }

    return NextResponse.json({ success: true, deleted: initialLen - cachedReceipts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

