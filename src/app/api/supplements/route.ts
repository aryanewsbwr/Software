import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { parseLegacyDateToIso, MONTH_NAMES } from '@/lib/billingEngine';

export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = 'news-images';
const STORAGE_FILE = 'data/pubsupplements.json';

async function loadSupplementsFromStorage(): Promise<any[]> {
  // 1. Try Supabase Storage
  try {
    const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(STORAGE_FILE);
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Supabase storage download error:', err);
  }

  // 2. Fallback to /tmp
  const tmpPath = path.join(os.tmpdir(), 'pubsupplements.json');
  if (fs.existsSync(tmpPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}
  }

  // 3. Fallback to public/data
  const pubPath = path.join(process.cwd(), 'public', 'data', 'pubsupplements.json');
  if (fs.existsSync(pubPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(pubPath, 'utf-8'));
      if (Array.isArray(data)) return data;
    } catch {}
  }

  return [];
}

async function saveSupplementsToStorage(data: any[]) {
  // 1. Save to Supabase Storage (Persistent across all serverless containers)
  try {
    await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(
      STORAGE_FILE,
      Buffer.from(JSON.stringify(data, null, 2)),
      { upsert: true, contentType: 'application/json' }
    );
  } catch (err) {
    console.warn('Supabase storage upload error:', err);
  }

  // 2. Save to /tmp
  try {
    const tmpPath = path.join(os.tmpdir(), 'pubsupplements.json');
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write to tmpdir:', err);
  }

  // 3. Save to public/data if writable
  try {
    const dir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const pubPath = path.join(dir, 'pubsupplements.json');
    fs.writeFileSync(pubPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pubId = searchParams.get('publica_id');

    const supplements = await loadSupplementsFromStorage();

    let filtered = supplements;
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

    const list = await loadSupplementsFromStorage();

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

    // Save to persistent Supabase Storage & local caches
    await saveSupplementsToStorage(updatedList);

    // Also persist to Supabase publicationsup table
    try {
      await supabaseAdmin
        .from('publicationsup')
        .delete()
        .eq('publicasup_id', parentPubId)
        .eq('publica_id', suppPubId)
        .eq('month', monthName)
        .eq('year', yearStr);

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

      await supabaseAdmin.from('publicationsup').insert(rowsToInsert);
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

    const list = await loadSupplementsFromStorage();
    const targetItem = list.find((s: any) => Number(s.id) === Number(id));
    const filtered = list.filter((s: any) => Number(s.id) !== Number(id));
    
    await saveSupplementsToStorage(filtered);

    if (targetItem) {
      try {
        const parentId = Number(targetItem.publicasup_id || targetItem.publica_id);
        const suppId = Number(targetItem.publica_id || targetItem.publicasup_id);
        const dateIso = parseLegacyDateToIso(targetItem.date_iso || targetItem.date) || '';
        const dObj = new Date(dateIso + 'T12:00:00');
        const monthName = !isNaN(dObj.getTime()) ? MONTH_NAMES[dObj.getMonth()] : targetItem.month || 'October';
        const yearStr = !isNaN(dObj.getTime()) ? String(dObj.getFullYear()) : targetItem.year || '2026';

        await supabaseAdmin
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
