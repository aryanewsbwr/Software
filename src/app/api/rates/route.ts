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
    const isHistory = searchParams.get('history') === 'true';

    const rates = loadJson('rates.json');
    let ratechanges = loadJson('ratechanges.json');

    // Try fetching newest from Supabase
    try {
      const { data: sbRc } = await supabase.from('ratechange').select('*').order('Dated', { ascending: false });
      if (sbRc && sbRc.length > 0) {
        const localIds = new Set(ratechanges.map((r: any) => `${r.publica_id || r.Publica_id}-${r.dayofweek || r.Dayofweek}-${(r.dated || r.Dated || '').split('T')[0]}`));
        sbRc.forEach((r: any) => {
          const key = `${r.Publica_id || r.publica_id}-${r.Dayofweek || r.dayofweek}-${(r.Dated || r.dated || '').split('T')[0]}`;
          if (!localIds.has(key)) {
            ratechanges.push({
              publica_id: r.Publica_id || r.publica_id,
              dayofweek: r.Dayofweek !== undefined ? r.Dayofweek : r.dayofweek,
              oldrate: r.OldRate ?? r.oldrate ?? 0,
              new_rate: r.NewRate ?? r.new_rate ?? 0,
              dated: (r.Dated || r.dated || '').split('T')[0],
              effective_date: (r.Dated || r.dated || '').split('T')[0]
            });
            localIds.add(key);
          }
        });
      }
    } catch (_) {}

    // History mode: return chronological history of rate changes for a publication
    if (isHistory && pubIdStr) {
      const pubId = parseInt(pubIdStr, 10);
      const pubChanges = ratechanges.filter((rc: any) => (rc.publica_id || rc.Publica_id) === pubId);
      pubChanges.sort((a: any, b: any) => {
        const dA = (a.dated || a.effective_date || '').split('T')[0];
        const dB = (b.dated || b.effective_date || '').split('T')[0];
        return dB.localeCompare(dA);
      });
      return NextResponse.json({
        publica_id: pubId,
        history: pubChanges
      });
    }

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
      allRates[p.publica_id] = getEffectiveWeekdayRates(p.publica_id, dateStr, rates, ratechanges, p.magzine_day);
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
    const { 
      publica_id, 
      day_rates, 
      dated, 
      new_rates, 
      old_rates, 
      is_rate_change = false,
      effective_date 
    } = body;

    if (!publica_id) {
      return NextResponse.json({ error: 'publica_id is required' }, { status: 400 });
    }

    const pubId = parseInt(publica_id, 10);
    const effDateIso = (effective_date || dated || new Date().toISOString().split('T')[0]).split('T')[0];
    const todayIso = new Date().toISOString().split('T')[0];

    const targetRates = (is_rate_change && new_rates) ? new_rates : day_rates;

    if (targetRates && typeof targetRates === 'object') {
      // 1. Build rate changes records
      const rateChangeRows: any[] = [];
      Object.entries(targetRates).forEach(([day, rate]) => {
        const dayNum = parseInt(day, 10);
        const rateVal = Number(rate);
        if (rateVal > 0) {
          const oldVal = (old_rates && old_rates[dayNum]) ? Number(old_rates[dayNum]) : 0;
          rateChangeRows.push({
            Publica_id: pubId,
            Dayofweek: dayNum,
            OldRate: oldVal,
            NewRate: rateVal,
            Dated: effDateIso
          });
        }
      });

      // 2. Insert into Supabase ratechange table
      if (rateChangeRows.length > 0) {
        try {
          await supabase.from('ratechange').insert(rateChangeRows);
        } catch (rcErr) {
          console.warn('Supabase ratechange insert warning:', rcErr);
        }
      }

      // 3. If effective immediately (effDateIso <= todayIso) or direct rate update, update rate table
      const rateRows = Object.entries(targetRates).map(([day, rate]) => ({
        Publica_id: pubId,
        Dayofweek: parseInt(day, 10),
        Rate: Number(rate)
      }));

      if (effDateIso <= todayIso) {
        try {
          await supabase
            .from('rate')
            .upsert(rateRows, { onConflict: 'Publica_id,Dayofweek' });
        } catch (dbErr) {
          console.warn('Supabase rate upsert warning:', dbErr);
        }
      }

      // 4. Update local JSON files for immediate offline reflection
      try {
        const ratesFile = path.join(process.cwd(), 'public', 'data', 'rates.json');
        const rcsFile = path.join(process.cwd(), 'public', 'data', 'ratechanges.json');

        if (fs.existsSync(rcsFile)) {
          const currentRcs = JSON.parse(fs.readFileSync(rcsFile, 'utf-8'));
          rateChangeRows.forEach(rc => {
            currentRcs.push({
              publica_id: rc.Publica_id,
              dayofweek: rc.Dayofweek,
              oldrate: rc.OldRate,
              new_rate: rc.NewRate,
              dated: rc.Dated,
              effective_date: rc.Dated
            });
          });
          fs.writeFileSync(rcsFile, JSON.stringify(currentRcs, null, 2), 'utf-8');
        }

        if (effDateIso <= todayIso && fs.existsSync(ratesFile)) {
          let currentRates = JSON.parse(fs.readFileSync(ratesFile, 'utf-8'));
          currentRates = currentRates.filter((r: any) => r.publica_id !== pubId);
          rateRows.forEach(r => {
            currentRates.push({ publica_id: r.Publica_id, dayofweek: r.Dayofweek, rate: r.Rate });
          });
          fs.writeFileSync(ratesFile, JSON.stringify(currentRates, null, 2), 'utf-8');
        }
      } catch (fsErr) {
        console.warn('File update warning:', fsErr);
      }

      return NextResponse.json({
        success: true,
        message: is_rate_change 
          ? `Rate Change for Publication #${pubId} effective ${effDateIso} recorded successfully!`
          : `Rates for Publication #${pubId} updated successfully!`,
        publica_id: pubId,
        effective_date: effDateIso,
        rates: targetRates
      });
    }

    return NextResponse.json({ error: 'day_rates or new_rates object is required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
