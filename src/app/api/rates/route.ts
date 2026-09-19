import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import path from 'path';
import fs from 'fs';
import { getEffectiveWeekdayRates } from '@/lib/rateEngine';

export const dynamic = 'force-dynamic';

function loadJson(filename: string) {
  const f = path.join(process.cwd(), 'public', 'data', filename);
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'));
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pubIdStr = searchParams.get('publica_id') || searchParams.get('pub_id');
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const rates = loadJson('rates.json');
    const ratechanges = loadJson('ratechanges.json');

    if (pubIdStr) {
      const pubId = parseInt(pubIdStr, 10);
      const effective = getEffectiveWeekdayRates(pubId, dateStr, rates, ratechanges);
      return NextResponse.json({
        publica_id: pubId,
        date: dateStr,
        rates: effective
      });
    }

    // Return effective rates for all publications
    const pubs = loadJson('publications.json');
    const allRates: Record<number, Record<number, number>> = {};
    for (const p of pubs) {
      allRates[p.publica_id] = getEffectiveWeekdayRates(p.publica_id, dateStr, rates, ratechanges);
    }

    return NextResponse.json({
      date: dateStr,
      publications_count: pubs.length,
      rates: allRates
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publica_id, day_rates, dated, new_rate, dayofweek } = body;

    if (!publica_id) {
      return NextResponse.json({ error: 'publica_id is required' }, { status: 400 });
    }

    const pubId = parseInt(publica_id, 10);
    const todayIso = dated || new Date().toISOString().split('T')[0];

    // Case 1: Updating standard 7-day rate matrix
    if (day_rates && typeof day_rates === 'object') {
      const rateRows = Object.entries(day_rates).map(([day, rate]) => ({
        Publica_id: pubId,
        Dayofweek: parseInt(day, 10),
        Rate: Number(rate)
      }));

      // 1. Try Upserting to Supabase rate table
      try {
        await supabase
          .from('rate')
          .upsert(rateRows, { onConflict: 'Publica_id,Dayofweek' });
      } catch (dbErr) {
        console.warn('Supabase rate upsert warning:', dbErr);
      }

      // 2. Also insert into ratechange table as record of revision
      const rateChangeRows = Object.entries(day_rates).map(([day, rate]) => ({
        Publica_id: pubId,
        Dayofweek: parseInt(day, 10),
        OldRate: 0,
        NewRate: Number(rate),
        Dated: todayIso
      }));

      try {
        await supabase
          .from('ratechange')
          .insert(rateChangeRows);
      } catch (rcErr) {
        console.warn('Supabase ratechange insert warning:', rcErr);
      }

      // 3. Update local files for instantaneous offline reflection
      try {
        const ratesFile = path.join(process.cwd(), 'public', 'data', 'rates.json');
        const rcsFile = path.join(process.cwd(), 'public', 'data', 'ratechanges.json');

        if (fs.existsSync(ratesFile)) {
          let currentRates = JSON.parse(fs.readFileSync(ratesFile, 'utf-8'));
          currentRates = currentRates.filter((r: any) => r.publica_id !== pubId);
          rateRows.forEach(r => {
            currentRates.push({ publica_id: r.Publica_id, dayofweek: r.Dayofweek, rate: r.Rate });
          });
          fs.writeFileSync(ratesFile, JSON.stringify(currentRates, null, 2), 'utf-8');
        }

        if (fs.existsSync(rcsFile)) {
          const currentRcs = JSON.parse(fs.readFileSync(rcsFile, 'utf-8'));
          rateChangeRows.forEach(rc => {
            currentRcs.push({ publica_id: rc.Publica_id, dayofweek: rc.Dayofweek, oldrate: rc.OldRate, new_rate: rc.NewRate, dated: rc.Dated });
          });
          fs.writeFileSync(rcsFile, JSON.stringify(currentRcs, null, 2), 'utf-8');
        }
      } catch (fsErr) {
        console.warn('File update warning:', fsErr);
      }

      return NextResponse.json({
        success: true,
        message: `7-Day Rates for Publication #${pubId} updated successfully!`,
        publica_id: pubId,
        rates: day_rates
      });
    }

    return NextResponse.json({ error: 'day_rates object is required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
