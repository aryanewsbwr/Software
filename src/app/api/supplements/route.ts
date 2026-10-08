import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import path from 'path';
import fs from 'fs';
import { parseLegacyDateToIso } from '@/lib/billingEngine';

export const dynamic = 'force-dynamic';

function loadJson(filename: string): any[] {
  const f = path.join(process.cwd(), 'public', 'data', filename);
  if (fs.existsSync(f)) {
    try {
      return JSON.parse(fs.readFileSync(f, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

function saveJson(filename: string, data: any) {
  const dir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, filename);
  fs.writeFileSync(f, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pubId = searchParams.get('publica_id');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const supplements = loadJson('pubsupplements.json');

    let filtered = supplements;
    if (pubId) {
      filtered = filtered.filter((s: any) => Number(s.publica_id) === Number(pubId));
    }

    // Sort by date descending
    filtered.sort((a: any, b: any) => {
      const dA = a.date_iso || a.date || '';
      const dB = b.date_iso || b.date || '';
      return dB.localeCompare(dA);
    });

    return NextResponse.json({ total: filtered.length, supplements: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, supplements: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      publica_id,
      public_name = '',
      supplement_name = '',
      date,
      rate = 0,
      region_ids = [],
      all_regions = true
    } = body;

    if (!publica_id) {
      return NextResponse.json({ error: 'Publication is required.' }, { status: 400 });
    }

    const dateIso = parseLegacyDateToIso(date) || new Date().toISOString().split('T')[0];
    const list = loadJson('pubsupplements.json');

    let finalId = id ? Number(id) : 0;
    const isUpdate = finalId > 0 && list.some((s: any) => Number(s.id) === finalId);

    if (!isUpdate) {
      const maxId = list.reduce((m: number, s: any) => Math.max(m, Number(s.id || 0)), 0);
      finalId = maxId + 1;
    }

    const record = {
      id: finalId,
      publica_id: Number(publica_id),
      public_name: String(public_name).trim(),
      supplement_name: String(supplement_name).trim() || String(public_name).trim(),
      date: date || dateIso,
      date_iso: dateIso,
      rate: Number(rate || 0),
      region_ids: Array.isArray(region_ids) ? region_ids.map(Number) : [],
      all_regions: Boolean(all_regions || region_ids.length === 0),
      updated_at: new Date().toISOString()
    };

    let updatedList: any[];
    if (isUpdate) {
      updatedList = list.map((s: any) => (Number(s.id) === finalId ? record : s));
    } else {
      updatedList = [record, ...list];
    }

    saveJson('pubsupplements.json', updatedList);

    return NextResponse.json({
      success: true,
      message: `Publication supplement saved successfully!`,
      supplement: record
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Supplement ID is required.' }, { status: 400 });
    }

    const list = loadJson('pubsupplements.json');
    const filtered = list.filter((s: any) => Number(s.id) !== Number(id));
    saveJson('pubsupplements.json', filtered);

    return NextResponse.json({ success: true, message: `Supplement #${id} deleted successfully.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
