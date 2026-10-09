import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase } from '@/lib/supabaseClient';
import path from 'path';
import fs from 'fs';
import os from 'os';

export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = 'news-images';
const STORAGE_FILE = 'data/receipt_allotments.json';

export interface ReceiptAllotmentRecord {
  id?: string | number;
  sno: number;
  collect_id?: number | null;
  collector_name: string;
  receipt_from: number;
  receipt_to: number;
  allot_date: string;
  rec_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Initial sample seed if no allotments exist yet
const INITIAL_ALLOTMENTS: ReceiptAllotmentRecord[] = [
  { sno: 1, collector_name: 'Salam', receipt_from: 1001, receipt_to: 1100, allot_date: '01/08/2026', rec_date: '15/08/2026' },
  { sno: 2, collector_name: 'Salam', receipt_from: 1101, receipt_to: 1200, allot_date: '16/08/2026', rec_date: null }
];

async function loadAllotmentsFromStorage(): Promise<ReceiptAllotmentRecord[]> {
  // 1. Try Supabase Storage
  try {
    const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(STORAGE_FILE);
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Supabase storage download error for receipt allotments:', err);
  }

  // 2. Fallback to /tmp
  const tmpPath = path.join(os.tmpdir(), 'receipt_allotments.json');
  if (fs.existsSync(tmpPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}
  }

  // 3. Fallback to public/data
  const pubPath = path.join(process.cwd(), 'public', 'data', 'receipt_allotments.json');
  if (fs.existsSync(pubPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(pubPath, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}
  }

  return INITIAL_ALLOTMENTS;
}

async function saveAllotmentsToStorage(data: ReceiptAllotmentRecord[]) {
  // 1. Save to Supabase Storage
  try {
    await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(
      STORAGE_FILE,
      Buffer.from(JSON.stringify(data, null, 2)),
      { upsert: true, contentType: 'application/json' }
    );
  } catch (err) {
    console.warn('Supabase storage upload error for receipt allotments:', err);
  }

  // 2. Save to /tmp
  try {
    const tmpPath = path.join(os.tmpdir(), 'receipt_allotments.json');
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}

  // 3. Save to public/data
  try {
    const pubDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
    const pubPath = path.join(pubDir, 'receipt_allotments.json');
    fs.writeFileSync(pubPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

/**
 * GET /api/receipt-allotment
 * Query Params:
 * - collector_name (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collectorName = searchParams.get('collector_name');

    const [allotments, collectorsRes] = await Promise.all([
      loadAllotmentsFromStorage(),
      supabase.from('collect').select('*').order('Collect_id', { ascending: true })
    ]);

    const collectors = (collectorsRes.data || []).map((c: any) => ({
      collect_id: c.Collect_id || c.collect_id || c.id,
      name: c.name || c.collector_name || `Collector #${c.Collect_id}`
    }));

    let filtered = allotments;
    if (collectorName) {
      filtered = allotments.filter(a => 
        (a.collector_name || '').toLowerCase() === collectorName.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      allotments: filtered,
      all_allotments: allotments,
      collectors: collectors
    });
  } catch (error: any) {
    console.error('Error fetching receipt allotments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/receipt-allotment
 * Body:
 * - collector_name: string
 * - receipt_from: number
 * - receipt_to: number
 * - allot_date: string
 * - rec_date?: string | null
 * - edit_sno?: number (if editing existing row for this collector)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collector_name, receipt_from, receipt_to, allot_date, rec_date, edit_sno } = body;

    if (!collector_name || !collector_name.trim()) {
      return NextResponse.json({ success: false, error: 'Collector / Hawker name is required.' }, { status: 400 });
    }

    const fromNum = parseInt(String(receipt_from), 10);
    const toNum = parseInt(String(receipt_to), 10);

    if (isNaN(fromNum) || isNaN(toNum) || fromNum <= 0 || toNum <= 0) {
      return NextResponse.json({ success: false, error: 'Valid Receipt From and Receipt To numbers are required.' }, { status: 400 });
    }

    if (toNum < fromNum) {
      return NextResponse.json({ success: false, error: 'Receipt To number must be greater than or equal to Receipt From number.' }, { status: 400 });
    }

    const allotments = await loadAllotmentsFromStorage();
    const cleanName = collector_name.trim();

    // Check for range overlap with other allotments (excluding the current one if editing)
    for (const item of allotments) {
      const isSameItem = edit_sno && (item.collector_name.toLowerCase() === cleanName.toLowerCase()) && item.sno === edit_sno;
      if (!isSameItem) {
        const itemFrom = item.receipt_from;
        const itemTo = item.receipt_to;
        // Overlap condition: max(fromNum, itemFrom) <= min(toNum, itemTo)
        if (Math.max(fromNum, itemFrom) <= Math.min(toNum, itemTo)) {
          return NextResponse.json({
            success: false,
            error: `Receipt range ${fromNum}-${toNum} overlaps with existing allotment (${itemFrom}-${itemTo}) allotted to ${item.collector_name}.`
          }, { status: 400 });
        }
      }
    }

    let updatedAllotments = [...allotments];

    if (edit_sno) {
      // Edit existing row
      const idx = updatedAllotments.findIndex(a => 
        a.collector_name.toLowerCase() === cleanName.toLowerCase() && a.sno === edit_sno
      );
      if (idx !== -1) {
        updatedAllotments[idx] = {
          ...updatedAllotments[idx],
          collector_name: cleanName,
          receipt_from: fromNum,
          receipt_to: toNum,
          allot_date: allot_date || updatedAllotments[idx].allot_date,
          rec_date: rec_date !== undefined ? rec_date : updatedAllotments[idx].rec_date,
          updated_at: new Date().toISOString()
        };
      }
    } else {
      // Add new row for this collector
      const collectorItems = allotments.filter(a => a.collector_name.toLowerCase() === cleanName.toLowerCase());
      const nextSno = collectorItems.length > 0 ? Math.max(...collectorItems.map(a => a.sno)) + 1 : 1;

      const newRecord: ReceiptAllotmentRecord = {
        sno: nextSno,
        collector_name: cleanName,
        receipt_from: fromNum,
        receipt_to: toNum,
        allot_date: allot_date || new Date().toLocaleDateString('en-GB'),
        rec_date: rec_date || null,
        created_at: new Date().toISOString()
      };

      updatedAllotments.push(newRecord);
    }

    await saveAllotmentsToStorage(updatedAllotments);

    const collectorFiltered = updatedAllotments.filter(a => 
      a.collector_name.toLowerCase() === cleanName.toLowerCase()
    );

    return NextResponse.json({
      success: true,
      message: 'Receipt allotment saved successfully!',
      allotments: collectorFiltered,
      all_allotments: updatedAllotments
    });
  } catch (error: any) {
    console.error('Error saving receipt allotment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/receipt-allotment
 * Query Params:
 * - collector_name: string
 * - sno: number
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collectorName = searchParams.get('collector_name');
    const snoStr = searchParams.get('sno');

    if (!collectorName || !snoStr) {
      return NextResponse.json({ success: false, error: 'collector_name and sno are required.' }, { status: 400 });
    }

    const sno = parseInt(snoStr, 10);
    const allotments = await loadAllotmentsFromStorage();

    const filtered = allotments.filter(a => 
      !(a.collector_name.toLowerCase() === collectorName.toLowerCase() && a.sno === sno)
    );

    // Re-index SNOs for this collector
    let cCounter = 1;
    const reindexed = filtered.map(a => {
      if (a.collector_name.toLowerCase() === collectorName.toLowerCase()) {
        return { ...a, sno: cCounter++ };
      }
      return a;
    });

    await saveAllotmentsToStorage(reindexed);

    const collectorRemaining = reindexed.filter(a => 
      a.collector_name.toLowerCase() === collectorName.toLowerCase()
    );

    return NextResponse.json({
      success: true,
      message: 'Allotment deleted successfully!',
      allotments: collectorRemaining,
      all_allotments: reindexed
    });
  } catch (error: any) {
    console.error('Error deleting receipt allotment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
