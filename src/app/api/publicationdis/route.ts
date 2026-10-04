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
    const pubIdStr = searchParams.get('publica_id');

    const list = loadJson('publicationdis.json');
    if (pubIdStr) {
      const pid = parseInt(pubIdStr, 10);
      const filtered = list.filter((p: any) => (p.publica_id || p.Publica_id) === pid);
      return NextResponse.json({ total: filtered.length, discontinues: filtered });
    }

    return NextResponse.json({ total: list.length, discontinues: list.slice(0, 200) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      publica_id,
      from_date,
      to_date,
      dis_type = 'P',
      remark = 'Discontinued'
    } = body;

    if (!publica_id) {
      return NextResponse.json({ error: 'publica_id is required' }, { status: 400 });
    }

    const pid = parseInt(publica_id, 10);
    const fromIso = parseDateToIso(from_date) || new Date().toISOString().split('T')[0];
    const isPerm = String(dis_type).trim().toUpperCase().startsWith('P');
    const toIso = isPerm ? (parseDateToIso(to_date) || '2050-03-31') : (parseDateToIso(to_date) || fromIso);

    const list = loadJson('publicationdis.json');
    const maxId = list.reduce((m: number, item: any) => Math.max(m, item.id || 0), 0);
    const newId = maxId + 1;

    const record = {
      id: newId,
      publica_id: pid,
      entry_date: fromIso,
      from_date: fromIso,
      to_date: toIso,
      oc_date: toIso,
      news_mag: null,
      dis_type: isPerm ? 'P' : 'T',
      remark: remark || 'Discontinued'
    };

    // 1. Save to Supabase publicationdis table if exists
    try {
      await supabase.from('publicationdis').insert([{
        publica_id: pid,
        entry_date: fromIso,
        oc_date: toIso,
        dis_type: record.dis_type,
        remark: record.remark
      }]);
    } catch (dbErr) {
      console.warn('Supabase publicationdis warning:', dbErr);
    }

    // 2. Update local publicationdis.json
    try {
      list.unshift(record);
      saveJson('publicationdis.json', list);
    } catch (fErr) {}

    return NextResponse.json({
      success: true,
      message: `Publication discontinue recorded successfully!`,
      record
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');
    if (!idStr) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const did = parseInt(idStr, 10);

    try {
      await supabase.from('publicationdis').delete().eq('id', did);
    } catch (dbErr) {
      console.warn('Supabase delete warning:', dbErr);
    }

    try {
      const list = loadJson('publicationdis.json');
      saveJson('publicationdis.json', list.filter((p: any) => p.id !== did));
    } catch (fErr) {}

    return NextResponse.json({ success: true, message: `Publication discontinue #${did} removed.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
