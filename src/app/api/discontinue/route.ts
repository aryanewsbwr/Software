import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import path from 'path';
import fs from 'fs';
import { parseDateToIso } from '@/lib/discontinueEngine';

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

    let discs: any[] = [];
    try {
      const { data: sbData, error } = await supabase
        .from('discontinue')
        .select('*')
        .order('discontinue_id', { ascending: false });
      if (!error && sbData && sbData.length > 0) {
        discs = sbData;
      }
    } catch (_) {}

    const localDiscs = loadJson('discontinues.json');
    if (discs.length === 0) {
      discs = localDiscs;
    } else {
      const sbIds = new Set(discs.map((r: any) => r.discontinue_id));
      for (const loc of localDiscs) {
        if (!sbIds.has(loc.discontinue_id)) {
          discs.push(loc);
        }
      }
    }

    // Sort newest first
    discs.sort((a: any, b: any) => (b.discontinue_id || 0) - (a.discontinue_id || 0));

    if (customerIdStr) {
      const cid = parseInt(customerIdStr, 10);
      const filtered = discs.filter((d: any) => (d.customer_id || d.Customer_id) === cid);
      return NextResponse.json({ total: filtered.length, discontinues: filtered });
    }

    return NextResponse.json({ total: discs.length, discontinues: discs });
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

    const fromIso = parseDateToIso(temp_from) || entry_date;
    const isPerm = temp_perma.startsWith('P') || temp_perma.toUpperCase() === 'PERMANENT';
    const toIso = isPerm ? fromIso : (parseDateToIso(temp_to) || fromIso);

    const record = {
      discontinue_id: newId,
      sno: discs.filter((d: any) => d.customer_id === cid).length + 1,
      entry_date,
      customer_id: cid,
      publica_id: pubId,
      temp_perma: isPerm ? 'Permanent' : 'Temporary',
      temp_from: fromIso,
      temp_to: toIso
    };

    // 1. Save to Supabase discontinue tables
    try {
      await supabase.from('customer_discontinue').insert([record]);
    } catch (dbErr) {
      console.warn('Supabase customer_discontinue warning:', dbErr);
    }
    try {
      await supabase.from('discontinue').insert([{
        discontinue_id: record.discontinue_id,
        sno: record.sno,
        customer_id: record.customer_id,
        publica_id: record.publica_id,
        temp_perma: record.temp_perma,
        temp_from: record.temp_from,
        temp_to: record.temp_to,
        entry_date: record.entry_date,
        financial_year: '2026-2027'
      }]);
    } catch (dbErr) {
      console.warn('Supabase discontinue warning:', dbErr);
    }

    // 2. If permanent stop, update c_date in customer_detail ONLY for subscriptions started before or on the discontinue date
    if (isPerm) {
      try {
        let query = supabase
          .from('customer_detail')
          .update({ c_date: fromIso })
          .eq('customer_id', cid)
          .lte('s_date', fromIso);
        if (pubId > 0) {
          query = query.eq('publication_id', pubId);
        }
        await query;
      } catch (cdErr) {}

      // Keep local subscriptions JSON in sync if present
      try {
        const subs = loadJson('all_subscriptions.json');
        let updated = false;
        for (const s of subs) {
          const sDate = parseDateToIso(s.s_date || s.S_Date);
          if (s.customer_id === cid && (pubId === 0 || s.publica_id === pubId)) {
            // Only close subscription if it started on or before the discontinue date
            if (!sDate || sDate <= fromIso) {
              s.c_date = fromIso;
              s.is_active = false;
              updated = true;
            }
          }
        }
        if (updated) saveJson('all_subscriptions.json', subs);
      } catch {}
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
      console.warn('Supabase delete customer_discontinue warning:', dbErr);
    }
    try {
      await supabase.from('discontinue').delete().eq('discontinue_id', did);
    } catch (dbErr) {
      console.warn('Supabase delete discontinue warning:', dbErr);
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
