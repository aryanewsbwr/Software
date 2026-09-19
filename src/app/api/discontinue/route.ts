import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

function loadJson(filename: string) {
  const f = path.join(process.cwd(), 'public', 'data', filename);
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'));
  return [];
}

function saveJson(filename: string, data: any) {
  const f = path.join(process.cwd(), 'public', 'data', filename);
  fs.writeFileSync(f, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerIdStr = searchParams.get('customer_id');

    const discs = loadJson('discontinues.json');
    if (customerIdStr) {
      const cid = parseInt(customerIdStr, 10);
      const filtered = discs.filter((d: any) => (d.customer_id || d.Customer_id) === cid);
      return NextResponse.json({ total: filtered.length, discontinues: filtered });
    }

    return NextResponse.json({ total: discs.length, discontinues: discs.slice(0, 200) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      publica_id = 0,
      temp_perma = 'Temporary',
      temp_from,
      temp_to,
      entry_date = new Date().toISOString().split('T')[0],
      financial_year = '20262027'
    } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'customer_id is required' }, { status: 400 });
    }

    const cid = parseInt(customer_id, 10);
    const pubId = parseInt(publica_id, 10) || 0;
    const discs = loadJson('discontinues.json');

    const maxId = discs.reduce((max: number, d: any) => Math.max(max, d.discontinue_id || d.Discontinue_id || 0), 0);
    const newId = maxId + 1;

    const record = {
      discontinue_id: newId,
      sno: discs.filter((d: any) => d.customer_id === cid).length + 1,
      entry_date,
      customer_id: cid,
      publica_id: pubId,
      temp_perma: temp_perma.startsWith('P') ? 'Permanent' : 'Temporary',
      temp_from: temp_from || entry_date,
      temp_to: temp_perma.startsWith('P') ? temp_from || entry_date : (temp_to || null)
    };

    // 1. Save to Supabase discontinue table
    try {
      await supabase.from('customer_discontinue').insert([record]);
    } catch (dbErr) {
      console.warn('Supabase discontinue warning:', dbErr);
    }

    // 2. If permanent stop, update c_date in customer_detail
    if (temp_perma.startsWith('P') && pubId > 0) {
      try {
        await supabase
          .from('customer_detail')
          .update({ c_date: temp_from || entry_date })
          .match({ customer_id: cid, publication_id: pubId });
      } catch (cdErr) {}
    }

    // 3. Update local discontinues.json
    try {
      discs.unshift(record);
      saveJson('discontinues.json', discs);
    } catch (fErr) {}

    return NextResponse.json({
      success: true,
      message: `${temp_perma} discontinue / vacation hold recorded successfully!`,
      discontinue: record
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('discontinue_id') || searchParams.get('id');
    if (!idStr) return NextResponse.json({ error: 'discontinue_id is required' }, { status: 400 });

    const did = parseInt(idStr, 10);

    try {
      await supabase.from('customer_discontinue').delete().eq('discontinue_id', did);
    } catch (dbErr) {
      console.warn('Supabase delete warning:', dbErr);
    }

    try {
      const list = loadJson('discontinues.json');
      saveJson('discontinues.json', list.filter((d: any) => (d.discontinue_id || d.Discontinue_id) !== did));
    } catch (fErr) {}

    return NextResponse.json({ success: true, message: `Discontinue record #${did} deleted.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
