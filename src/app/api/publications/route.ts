import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import path from 'path';
import fs from 'fs';
import { cleanOrTransliterateHindi } from '@/lib/transliteration';
import { getEffectiveWeekdayRates } from '@/lib/rateEngine';

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
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const withRates = searchParams.get('with_rates') !== 'false';

    const pubs = loadJson('publications.json');
    const rates = loadJson('rates.json');
    const ratechanges = loadJson('ratechanges.json');

    let filtered = pubs;
    if (search) {
      filtered = filtered.filter((p: any) =>
        p.public_name?.toLowerCase().includes(search) ||
        p.pub_hindi?.includes(search) ||
        p.publica_id?.toString() === search ||
        p.abrv?.toLowerCase().includes(search)
      );
    }

    const todayIso = new Date().toISOString().split('T')[0];

    const result = filtered.map((p: any) => {
      const decodedHindi = cleanOrTransliterateHindi(p.pub_hindi, p.public_name);
      const effectiveRates = withRates ? getEffectiveWeekdayRates(p.publica_id, todayIso, rates, ratechanges) : null;

      return {
        ...p,
        pub_hindi: decodedHindi,
        current_rates: effectiveRates,
        today_rate: effectiveRates ? effectiveRates[new Date().getDay() + 1] : 5.0
      };
    });

    return NextResponse.json({
      total: result.length,
      publications: result
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
      public_name,
      pub_hindi,
      type_p = 'Daily',
      publish_id = 1,
      abrv = '',
      circulation = 'Morning',
      duration = 'Daily',
      magzine_day = null,
      magzine_month = null,
      chr_del = 0,
      rates: customRates
    } = body;

    if (!public_name || !public_name.trim()) {
      return NextResponse.json({ error: 'Publication Name is required' }, { status: 400 });
    }

    const hindiName = cleanOrTransliterateHindi(pub_hindi, public_name);
    const pubList = loadJson('publications.json');

    let finalPubId = publica_id ? parseInt(publica_id, 10) : 0;
    const isUpdate = finalPubId > 0 && pubList.some((p: any) => p.publica_id === finalPubId);

    if (!isUpdate) {
      // Assign new ID
      const maxId = pubList.reduce((max: number, p: any) => Math.max(max, p.publica_id || 0), 0);
      finalPubId = maxId + 1;
    }

    const pubRecord = {
      publica_id: finalPubId,
      public_name: public_name.trim(),
      pub_hindi: hindiName,
      type_p,
      publish_id: parseInt(publish_id, 10) || 1,
      abrv: abrv || public_name.slice(0, 4).toUpperCase(),
      circulation,
      duration,
      magzine_day: magzine_day ? parseInt(magzine_day, 10) : null,
      magzine_month: magzine_month ? parseInt(magzine_month, 10) : null,
      chr_del: chr_del ? 1 : 0
    };

    // 1. Save to Supabase publication table
    try {
      if (isUpdate) {
        await supabase.from('publication').update(pubRecord).eq('publica_id', finalPubId);
      } else {
        await supabase.from('publication').insert([pubRecord]);
      }
    } catch (dbErr) {
      console.warn('Supabase publication save warning:', dbErr);
    }

    // 2. Save 7-day rates if provided
    if (customRates && typeof customRates === 'object') {
      const rateRows = Object.entries(customRates).map(([day, rate]) => ({
        Publica_id: finalPubId,
        Dayofweek: parseInt(day, 10),
        Rate: Number(rate)
      }));

      try {
        await supabase.from('rate').upsert(rateRows, { onConflict: 'Publica_id,Dayofweek' });
      } catch (rErr) {
        console.warn('Supabase rate upsert warning:', rErr);
      }

      // Update local rates.json
      try {
        const ratesFile = path.join(process.cwd(), 'public', 'data', 'rates.json');
        if (fs.existsSync(ratesFile)) {
          let curRates = JSON.parse(fs.readFileSync(ratesFile, 'utf-8'));
          curRates = curRates.filter((r: any) => r.publica_id !== finalPubId);
          rateRows.forEach(r => {
            curRates.push({ publica_id: r.Publica_id, dayofweek: r.Dayofweek, rate: r.Rate });
          });
          saveJson('rates.json', curRates);
        }
      } catch (fErr) {}
    }

    // 3. Update local publications.json
    try {
      let updatedPubList = pubList;
      if (isUpdate) {
        updatedPubList = updatedPubList.map((p: any) => p.publica_id === finalPubId ? { ...p, ...pubRecord } : p);
      } else {
        updatedPubList.push(pubRecord);
      }
      saveJson('publications.json', updatedPubList);
    } catch (fErr) {}

    return NextResponse.json({
      success: true,
      message: `Publication #${finalPubId} (${public_name}) ${isUpdate ? 'updated' : 'created'} successfully!`,
      publication: pubRecord
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pubIdStr = searchParams.get('publica_id') || searchParams.get('id');

    if (!pubIdStr) {
      return NextResponse.json({ error: 'publica_id is required' }, { status: 400 });
    }

    const pubId = parseInt(pubIdStr, 10);

    // 1. Delete from Supabase
    try {
      await supabase.from('publication').delete().eq('publica_id', pubId);
      await supabase.from('rate').delete().eq('publica_id', pubId);
      await supabase.from('ratechange').delete().eq('publica_id', pubId);
    } catch (dbErr) {
      console.warn('Supabase delete warning:', dbErr);
    }

    // 2. Delete from local JSON files
    try {
      const pubList = loadJson('publications.json');
      const updatedPubs = pubList.filter((p: any) => p.publica_id !== pubId);
      saveJson('publications.json', updatedPubs);

      const ratesList = loadJson('rates.json');
      const updatedRates = ratesList.filter((r: any) => r.publica_id !== pubId);
      saveJson('rates.json', updatedRates);
    } catch (fErr) {}

    return NextResponse.json({
      success: true,
      message: `Publication #${pubId} deleted successfully.`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
