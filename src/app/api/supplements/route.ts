import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { parseLegacyDateToIso, MONTH_NAMES } from '@/lib/billingEngine';

export const dynamic = 'force-dynamic';

function getStoragePaths(): string[] {
  return [
    path.join(os.tmpdir(), 'pubsupplements.json'),
    path.join(process.cwd(), 'public', 'data', 'pubsupplements.json')
  ];
}

function loadJsonSupplements(): any[] {
  const tmpPath = path.join(os.tmpdir(), 'pubsupplements.json');
  if (fs.existsSync(tmpPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}
  }

  const pubPath = path.join(process.cwd(), 'public', 'data', 'pubsupplements.json');
  if (fs.existsSync(pubPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(pubPath, 'utf-8'));
      if (Array.isArray(data)) return data;
    } catch {}
  }

  return [];
}

function saveJsonSupplements(data: any[]) {
  // 1. Always write to /tmp (always writable on serverless / Vercel)
  try {
    const tmpPath = path.join(os.tmpdir(), 'pubsupplements.json');
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to tmpdir:', err);
  }

  // 2. Also write to public/data if writable (local development)
  try {
    const dir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const pubPath = path.join(dir, 'pubsupplements.json');
    fs.writeFileSync(pubPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Silently ignore EROFS on read-only serverless lambdas
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pubId = searchParams.get('publica_id');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const jsonList = loadJsonSupplements();

    // Fetch from Supabase publicationsup to ensure full persistence across serverless invocations
    let dbRows: any[] = [];
    try {
      const { data, error } = await supabase.from('publicationsup').select('*');
      if (!error && data) {
        dbRows = data;
      }
    } catch (_) {}

    // Merge Supabase entries with rich local JSON items
    const mergedMap = new Map<string, any>();

    // 1. Add JSON items first (they have rate, custom names, etc.)
    jsonList.forEach(item => {
      const key = `${item.id || item.publica_id}_${item.date_iso || item.date}_${item.rate}`;
      mergedMap.set(key, item);
    });

    // 2. Group DB rows by publica_id, publicasup_id, month, year
    const dbGrouped = new Map<string, any>();
    for (const r of dbRows) {
      const gKey = `${r.publicasup_id || r.publica_id}_${r.publica_id}_${r.month}_${r.year}`;
      if (!dbGrouped.has(gKey)) {
        dbGrouped.set(gKey, {
          id: Number(r.id),
          publicasup_id: Number(r.publicasup_id || r.publica_id),
          publica_id: Number(r.publica_id),
          month: r.month,
          year: r.year,
          region_ids: [Number(r.region_id)],
          all_regions: Number(r.region_id) === 0,
          date_iso: `${r.year}-10-01`,
          date: `01/10/${r.year}`,
          rate: 0
        });
      } else {
        const existing = dbGrouped.get(gKey);
        if (Number(r.region_id) === 0) {
          existing.all_regions = true;
        } else if (!existing.region_ids.includes(Number(r.region_id))) {
          existing.region_ids.push(Number(r.region_id));
        }
      }
    }

    dbGrouped.forEach((val, key) => {
      // Check if already in mergedMap with similar pub/month
      const existsInJson = jsonList.some(
        j => (Number(j.publica_id) === val.publica_id || Number(j.publicasup_id) === val.publicasup_id) &&
             (j.date_iso?.includes(val.year) || j.date?.includes(val.year))
      );
      if (!existsInJson) {
        mergedMap.set(`db_${key}`, val);
      }
    });

    let filtered = Array.from(mergedMap.values());

    if (pubId) {
      filtered = filtered.filter((s: any) => 
        Number(s.publica_id) === Number(pubId) || Number(s.publicasup_id) === Number(pubId)
      );
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
      publicasup_id,
      public_name = '',
      supplement_name = '',
      date,
      rate = 0,
      region_ids = [],
      all_regions = true
    } = body;

    const parentPubId = Number(publicasup_id || publica_id);
    const suppPubId = Number(publica_id || publicasup_id);

    if (!parentPubId && !suppPubId) {
      return NextResponse.json({ error: 'Publication is required.' }, { status: 400 });
    }

    const dateIso = parseLegacyDateToIso(date) || new Date().toISOString().split('T')[0];
    const dateObj = new Date(dateIso + 'T12:00:00');
    const monthName = !isNaN(dateObj.getTime()) ? MONTH_NAMES[dateObj.getMonth()] : 'October';
    const yearStr = !isNaN(dateObj.getTime()) ? String(dateObj.getFullYear()) : '2026';

    const list = loadJsonSupplements();

    let finalId = id ? Number(id) : 0;
    const isUpdate = finalId > 0 && list.some((s: any) => Number(s.id) === finalId);

    if (!isUpdate) {
      const maxId = list.reduce((m: number, s: any) => Math.max(m, Number(s.id || 0)), 0);
      finalId = maxId + 1;
    }

    const record = {
      id: finalId,
      publicasup_id: parentPubId,
      publica_id: suppPubId,
      public_name: String(public_name).trim(),
      supplement_name: String(supplement_name).trim() || String(public_name).trim(),
      date: date || dateIso,
      date_iso: dateIso,
      month: monthName,
      year: yearStr,
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

    // Save to local / tmp storage safely
    saveJsonSupplements(updatedList);

    // Also persist to Supabase publicationsup table
    try {
      // 1. Delete old assignments for this parent & supplement pub for that month/year
      await supabase
        .from('publicationsup')
        .delete()
        .eq('publicasup_id', parentPubId)
        .eq('publica_id', suppPubId)
        .eq('month', monthName)
        .eq('year', yearStr);

      // 2. Insert new rows per region (or 0 for all regions)
      const targetRegions = record.all_regions || record.region_ids.length === 0
        ? [0]
        : record.region_ids;

      const rowsToInsert = targetRegions.map(rId => ({
        publicasup_id: parentPubId,
        publica_id: suppPubId,
        month: monthName,
        year: yearStr,
        region_id: rId
      }));

      await supabase.from('publicationsup').insert(rowsToInsert);
    } catch (sbErr) {
      console.warn('Supabase publicationsup insert notice:', sbErr);
    }

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

    const list = loadJsonSupplements();
    const targetItem = list.find((s: any) => Number(s.id) === Number(id));
    const filtered = list.filter((s: any) => Number(s.id) !== Number(id));
    saveJsonSupplements(filtered);

    // Also delete from Supabase if we found target item
    if (targetItem) {
      try {
        const parentId = Number(targetItem.publicasup_id || targetItem.publica_id);
        const suppId = Number(targetItem.publica_id || targetItem.publicasup_id);
        const dateIso = parseLegacyDateToIso(targetItem.date_iso || targetItem.date) || '';
        const dObj = new Date(dateIso + 'T12:00:00');
        const monthName = !isNaN(dObj.getTime()) ? MONTH_NAMES[dObj.getMonth()] : targetItem.month || 'October';
        const yearStr = !isNaN(dObj.getTime()) ? String(dObj.getFullYear()) : targetItem.year || '2026';

        await supabase
          .from('publicationsup')
          .delete()
          .eq('publicasup_id', parentId)
          .eq('publica_id', suppId)
          .eq('month', monthName)
          .eq('year', yearStr);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }
    }

    return NextResponse.json({ success: true, message: `Supplement #${id} deleted successfully.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
