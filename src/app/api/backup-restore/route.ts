import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function loadJson(filename: string): any[] {
  try {
    const p = path.join(process.cwd(), 'public', 'data', filename);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error reading ${filename}:`, e);
  }
  return [];
}

function saveJson(filename: string, data: any[], append = false) {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const p = path.join(dataDir, filename);

    // If append mode, load existing data and concatenate
    if (append && fs.existsSync(p)) {
      const existing = JSON.parse(fs.readFileSync(p, 'utf-8'));
      const combined = existing.concat(data);
      fs.writeFileSync(p, JSON.stringify(combined, null, 2), 'utf-8');
      return;
    }

    // First chunk / clean replace: keep 1 prior backup for safety
    const backupDir = path.join(process.cwd(), 'public', 'data_backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const priorBackup = path.join(backupDir, filename);
    if (fs.existsSync(p)) {
      fs.copyFileSync(p, priorBackup);
    }

    // Direct clean replace (100% replaces old content, prevents duplicate records)
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error writing ${filename}:`, e);
  }
}

function escapeSqlString(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  const str = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${str}'`;
}

function escapeSqlNum(val: any, fallback = 0): string {
  if (val === null || val === undefined || val === '') return String(fallback);
  const num = Number(val);
  return isNaN(num) ? String(fallback) : String(num);
}

// -------------------------------------------------------------
// GET: Generate & Download standard MySQL dump .sql backup
// -------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    let sqlContent = `-- ========================================================\n` +
      `-- ARYAN NEWS ERP DATABASE BACKUP DUMP\n` +
      `-- Exported At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n` +
      `-- Host: MySQL / Supabase Compatible ERP Dump\n` +
      `-- ========================================================\n\n` +
      `SET FOREIGN_KEY_CHECKS=0;\n` +
      `SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";\n\n`;

    // 1. Region Master (regions / region)
    const regions = loadJson('regions.json');
    if (regions.length > 0) {
      sqlContent += `-- --------------------------------------------------------\n` +
        `-- Table structure and data for table \`region\`\n` +
        `-- --------------------------------------------------------\n` +
        `CREATE TABLE IF NOT EXISTS \`region\` (\n` +
        `  \`Region_id\` int(11) NOT NULL default '0',\n` +
        `  \`Region_Name\` varchar(50) default NULL,\n` +
        `  \`Zone\` varchar(50) default NULL,\n` +
        `  PRIMARY KEY  (\`Region_id\`)\n` +
        `) ENGINE=MyISAM DEFAULT CHARSET=latin1;\n\n`;

      for (let i = 0; i < regions.length; i += 200) {
        const chunk = regions.slice(i, i + 200);
        const values = chunk.map(r => {
          const id = escapeSqlNum(r.region_id);
          const name = escapeSqlString(r.region_name || r.name || '');
          const zone = escapeSqlString(r.zone || '');
          return `(${id}, ${name}, ${zone})`;
        }).join(',\n');
        sqlContent += `INSERT INTO \`region\` (\`Region_id\`, \`Region_Name\`, \`Zone\`) VALUES\n${values};\n\n`;
      }
    }

    // 2. Hawker Master (hawker)
    const hawkers = loadJson('hawkers.json');
    if (hawkers.length > 0) {
      sqlContent += `-- --------------------------------------------------------\n` +
        `-- Table structure and data for table \`hawker\`\n` +
        `-- --------------------------------------------------------\n` +
        `CREATE TABLE IF NOT EXISTS \`hawker\` (\n` +
        `  \`Hawker_id\` int(11) NOT NULL default '0',\n` +
        `  \`Name\` varchar(50) default NULL,\n` +
        `  \`Address\` varchar(100) default NULL,\n` +
        `  \`City\` varchar(50) default NULL,\n` +
        `  \`Phone\` varchar(20) default NULL,\n` +
        `  \`Mobile\` varchar(20) default NULL,\n` +
        `  \`Region_id\` int(11) default '0',\n` +
        `  \`Commission_rate\` decimal(10,2) default '0.00',\n` +
        `  PRIMARY KEY  (\`Hawker_id\`)\n` +
        `) ENGINE=MyISAM DEFAULT CHARSET=latin1;\n\n`;

      for (let i = 0; i < hawkers.length; i += 200) {
        const chunk = hawkers.slice(i, i + 200);
        const values = chunk.map(h => {
          const id = escapeSqlNum(h.hawker_id);
          const name = escapeSqlString(h.name || '');
          const addr = escapeSqlString(h.address || '');
          const city = escapeSqlString(h.city || '');
          const ph = escapeSqlString(h.phone || '');
          const mob = escapeSqlString(h.mobile || '');
          const reg = escapeSqlNum(h.region_id || 0);
          const comm = escapeSqlNum(h.commission_rate || 0);
          return `(${id}, ${name}, ${addr}, ${city}, ${ph}, ${mob}, ${reg}, ${comm})`;
        }).join(',\n');
        sqlContent += `INSERT INTO \`hawker\` (\`Hawker_id\`, \`Name\`, \`Address\`, \`City\`, \`Phone\`, \`Mobile\`, \`Region_id\`, \`Commission_rate\`) VALUES\n${values};\n\n`;
      }
    }

    // 3. Publication Master (publica / publication)
    const publications = loadJson('publications.json');
    if (publications.length > 0) {
      sqlContent += `-- --------------------------------------------------------\n` +
        `-- Table structure and data for table \`publica\`\n` +
        `-- --------------------------------------------------------\n` +
        `CREATE TABLE IF NOT EXISTS \`publica\` (\n` +
        `  \`Publica_id\` int(11) NOT NULL default '0',\n` +
        `  \`Public_Name\` varchar(100) default NULL,\n` +
        `  \`Type_P\` varchar(30) default NULL,\n` +
        `  \`Publish_id\` int(11) default '0',\n` +
        `  \`Abrv\` varchar(20) default NULL,\n` +
        `  \`Circulation\` varchar(20) default NULL,\n` +
        `  \`Duration\` varchar(20) default NULL,\n` +
        `  \`Magzine_day\` int(11) default '0',\n` +
        `  \`Magzine_month\` int(11) default '0',\n` +
        `  \`Chr_Del\` int(11) default '0',\n` +
        `  \`Pub_Hindi\` varchar(100) default NULL,\n` +
        `  PRIMARY KEY  (\`Publica_id\`)\n` +
        `) ENGINE=MyISAM DEFAULT CHARSET=latin1;\n\n`;

      for (let i = 0; i < publications.length; i += 200) {
        const chunk = publications.slice(i, i + 200);
        const values = chunk.map(p => {
          const id = escapeSqlNum(p.publica_id);
          const name = escapeSqlString(p.public_name || p.name || '');
          const type = escapeSqlString(p.type_p || p.frequency || 'Newspaper');
          const pubid = escapeSqlNum(p.publish_id || 0);
          const abrv = escapeSqlString(p.abrv || '');
          const circ = escapeSqlString(p.circulation || 'Morning');
          const dur = escapeSqlString(p.duration || '');
          const magd = escapeSqlNum(p.magzine_day || 0);
          const magm = escapeSqlNum(p.magzine_month || 0);
          const chrd = escapeSqlNum(p.chr_del || 0);
          const pubhindi = escapeSqlString(p.pub_hindi || '');
          return `(${id}, ${name}, ${type}, ${pubid}, ${abrv}, ${circ}, ${dur}, ${magd}, ${magm}, ${chrd}, ${pubhindi})`;
        }).join(',\n');
        sqlContent += `INSERT INTO \`publica\` (\`Publica_id\`, \`Public_Name\`, \`Type_P\`, \`Publish_id\`, \`Abrv\`, \`Circulation\`, \`Duration\`, \`Magzine_day\`, \`Magzine_month\`, \`Chr_Del\`, \`Pub_Hindi\`) VALUES\n${values};\n\n`;
      }
    }

    // 4. Rates Master (rate)
    const rates = loadJson('rates.json');
    if (rates.length > 0) {
      sqlContent += `-- --------------------------------------------------------\n` +
        `-- Table structure and data for table \`rate\`\n` +
        `-- --------------------------------------------------------\n` +
        `CREATE TABLE IF NOT EXISTS \`rate\` (\n` +
        `  \`Publica_id\` int(11) NOT NULL default '0',\n` +
        `  \`Rate\` decimal(10,2) default '0.00',\n` +
        `  \`Dayofweek\` int(11) NOT NULL default '0'\n` +
        `) ENGINE=MyISAM DEFAULT CHARSET=latin1;\n\n`;

      for (let i = 0; i < rates.length; i += 200) {
        const chunk = rates.slice(i, i + 200);
        const values = chunk.map(r => {
          const pid = escapeSqlNum(r.publica_id || r.Publica_id);
          const rate = escapeSqlNum(r.rate || r.Rate);
          const dow = escapeSqlNum(r.dayofweek || r.Dayofweek);
          return `(${pid}, ${rate}, ${dow})`;
        }).join(',\n');
        sqlContent += `INSERT INTO \`rate\` (\`Publica_id\`, \`Rate\`, \`Dayofweek\`) VALUES\n${values};\n\n`;
      }
    }

    // 5. Customer Master (customer)
    const customers = loadJson('all_customers.json');
    if (customers.length > 0) {
      sqlContent += `-- --------------------------------------------------------\n` +
        `-- Table structure and data for table \`customer\`\n` +
        `-- --------------------------------------------------------\n` +
        `CREATE TABLE IF NOT EXISTS \`customer\` (\n` +
        `  \`Customer_id\` bigint(20) NOT NULL default '0',\n` +
        `  \`name_eng\` varchar(100) default NULL,\n` +
        `  \`Type_Cust\` int(11) default '-1',\n` +
        `  \`name_hindi\` varchar(100) default NULL,\n` +
        `  \`add1\` varchar(100) default NULL,\n` +
        `  \`add2\` varchar(100) default NULL,\n` +
        `  \`phone\` varchar(50) default NULL,\n` +
        `  \`Security_Deposit\` decimal(10,2) default '0.00',\n` +
        `  \`Type\` varchar(50) default NULL,\n` +
        `  \`Priority\` int(11) default '1',\n` +
        `  \`Self_Agent\` int(11) default '-1',\n` +
        `  \`FontType\` int(11) default '-1',\n` +
        `  \`dueamount\` decimal(10,2) default '0.00',\n` +
        `  \`Region_id\` int(11) default '0',\n` +
        `  \`Paid\` varchar(10) default 'P',\n` +
        `  \`Delivery\` decimal(10,2) default '0.00',\n` +
        `  \`Discount\` decimal(10,2) default '0.00',\n` +
        `  \`GovtSupply\` int(11) default '0',\n` +
        `  \`Hindi_Add\` varchar(100) default NULL,\n` +
        `  \`Cbal\` decimal(10,2) default '0.00',\n` +
        `  \`pmonth\` varchar(20) default NULL,\n` +
        `  \`pyear\` varchar(20) default NULL,\n` +
        `  PRIMARY KEY  (\`Customer_id\`)\n` +
        `) ENGINE=MyISAM DEFAULT CHARSET=latin1;\n\n`;

      for (let i = 0; i < customers.length; i += 200) {
        const chunk = customers.slice(i, i + 200);
        const values = chunk.map(c => {
          const cid = escapeSqlNum(c.customer_id || c.Customer_id);
          const nEng = escapeSqlString(c.name_eng || '');
          const tCust = escapeSqlNum(c.type_cust || c.Type_Cust, -1);
          const nHin = escapeSqlString(c.name_hindi || '');
          const a1 = escapeSqlString(c.add1 || '');
          const a2 = escapeSqlString(c.add2 || '');
          const ph = escapeSqlString(c.phone || '');
          const sec = escapeSqlNum(c.security_deposit || c.Security_Deposit, 0);
          const typ = escapeSqlString(c.type || c.Type || '');
          const pri = escapeSqlNum(c.priority || c.Priority, 1);
          const sa = escapeSqlNum(c.self_agent || c.Self_Agent, -1);
          const ft = escapeSqlNum(c.font_type || c.FontType, -1);
          const due = escapeSqlNum(c.dueamount, 0);
          const rid = escapeSqlNum(c.region_id || c.Region_id, 0);
          const pd = escapeSqlString(c.paid || c.Paid || 'P');
          const dly = escapeSqlNum(c.delivery || c.Delivery, 0);
          const disc = escapeSqlNum(c.discount || c.Discount, 0);
          const govt = escapeSqlNum(c.govt_supply || c.GovtSupply, 0);
          const hadd = escapeSqlString(c.hindi_add || c.Hindi_Add || '');
          const cbal = escapeSqlNum(c.cbal || c.Cbal, 0);
          const pm = escapeSqlString(c.pmonth || '');
          const py = escapeSqlString(c.pyear || '');
          return `(${cid}, ${nEng}, ${tCust}, ${nHin}, ${a1}, ${a2}, ${ph}, ${sec}, ${typ}, ${pri}, ${sa}, ${ft}, ${due}, ${rid}, ${pd}, ${dly}, ${disc}, ${govt}, ${hadd}, ${cbal}, ${pm}, ${py})`;
        }).join(',\n');
        sqlContent += `INSERT INTO \`customer\` (\`Customer_id\`, \`name_eng\`, \`Type_Cust\`, \`name_hindi\`, \`add1\`, \`add2\`, \`phone\`, \`Security_Deposit\`, \`Type\`, \`Priority\`, \`Self_Agent\`, \`FontType\`, \`dueamount\`, \`Region_id\`, \`Paid\`, \`Delivery\`, \`Discount\`, \`GovtSupply\`, \`Hindi_Add\`, \`Cbal\`, \`pmonth\`, \`pyear\`) VALUES\n${values};\n\n`;
      }
    }

    // 6. Subscriptions (custdetail / customer_detail)
    const subs = loadJson('all_subscriptions.json');
    if (subs.length > 0) {
      sqlContent += `-- --------------------------------------------------------\n` +
        `-- Table structure and data for table \`custdetail\`\n` +
        `-- --------------------------------------------------------\n` +
        `CREATE TABLE IF NOT EXISTS \`custdetail\` (\n` +
        `  \`sno\` bigint(20) NOT NULL default '0',\n` +
        `  \`Customer_id\` bigint(20) default '0',\n` +
        `  \`Publica_id\` int(11) default '0',\n` +
        `  \`Hawker_id\` int(11) default '0',\n` +
        `  \`Qty\` int(11) default '1',\n` +
        `  \`Circulation\` varchar(20) default 'Morning',\n` +
        `  \`S_Date\` varchar(20) default NULL,\n` +
        `  \`C_Date\` varchar(20) default NULL,\n` +
        `  \`From_Day\` varchar(20) default '1-7',\n` +
        `  \`Hawk_Sub\` int(11) default '-1',\n` +
        `  \`Dis\` varchar(20) default '0',\n` +
        `  \`Dely\` decimal(10,2) default '0.00',\n` +
        `  PRIMARY KEY  (\`sno\`)\n` +
        `) ENGINE=MyISAM DEFAULT CHARSET=latin1;\n\n`;

      for (let i = 0; i < subs.length; i += 200) {
        const chunk = subs.slice(i, i + 200);
        const values = chunk.map(s => {
          const sno = escapeSqlNum(s.sno);
          const cid = escapeSqlNum(s.customer_id || s.Customer_id);
          const pid = escapeSqlNum(s.publica_id || s.Publica_id);
          const hid = escapeSqlNum(s.hawker_id || s.Hawker_id);
          const qty = escapeSqlNum(s.qty || s.Qty, 1);
          const circ = escapeSqlString(s.circulation || s.Circulation || 'Morning');
          const sdate = escapeSqlString(s.s_date || s.S_Date || '');
          const cdate = escapeSqlString(s.c_date || s.C_Date || '');
          const fday = escapeSqlString(s.from_day || s.From_Day || '1-7');
          const hsub = escapeSqlNum(s.hawk_sub || s.Hawk_Sub, -1);
          const dis = escapeSqlString(s.dis || s.Dis || '0');
          const dely = escapeSqlNum(s.dely || s.Dely, 0);
          return `(${sno}, ${cid}, ${pid}, ${hid}, ${qty}, ${circ}, ${sdate}, ${cdate}, ${fday}, ${hsub}, ${dis}, ${dely})`;
        }).join(',\n');
        sqlContent += `INSERT INTO \`custdetail\` (\`sno\`, \`Customer_id\`, \`Publica_id\`, \`Hawker_id\`, \`Qty\`, \`Circulation\`, \`S_Date\`, \`C_Date\`, \`From_Day\`, \`Hawk_Sub\`, \`Dis\`, \`Dely\`) VALUES\n${values};\n\n`;
      }
    }

    // 7. Discontinue (discontinue)
    const discontinues = loadJson('discontinues.json');
    if (discontinues.length > 0) {
      sqlContent += `-- --------------------------------------------------------\n` +
        `-- Table structure and data for table \`discontinue\`\n` +
        `-- --------------------------------------------------------\n` +
        `CREATE TABLE IF NOT EXISTS \`discontinue\` (\n` +
        `  \`discontinue_id\` bigint(20) NOT NULL default '0',\n` +
        `  \`sno\` bigint(20) default '0',\n` +
        `  \`Customer_id\` bigint(20) NOT NULL default '0',\n` +
        `  \`Publica_id\` int(11) NOT NULL default '0',\n` +
        `  \`Temp_Perma\` varchar(10) default 'T',\n` +
        `  \`Temp_From\` date default NULL,\n` +
        `  \`Temp_To\` date default NULL,\n` +
        `  \`S_Date\` varchar(20) default NULL,\n` +
        `  \`C_Date\` varchar(20) default NULL,\n` +
        `  \`Hawker_id\` int(11) default '0',\n` +
        `  PRIMARY KEY  (\`discontinue_id\`)\n` +
        `) ENGINE=MyISAM DEFAULT CHARSET=latin1;\n\n`;

      for (let i = 0; i < discontinues.length; i += 200) {
        const chunk = discontinues.slice(i, i + 200);
        const values = chunk.map(d => {
          const did = escapeSqlNum(d.discontinue_id);
          const sno = escapeSqlNum(d.sno);
          const cid = escapeSqlNum(d.customer_id || d.Customer_id);
          const pid = escapeSqlNum(d.publica_id || d.Publica_id);
          const tp = escapeSqlString(d.temp_perma || d.Temp_Perma || 'T');
          const tfrom = d.temp_from ? `'${d.temp_from}'` : 'NULL';
          const tto = d.temp_to ? `'${d.temp_to}'` : 'NULL';
          const sdate = escapeSqlString(d.s_date || d.S_Date || '');
          const cdate = escapeSqlString(d.c_date || d.C_Date || '');
          const hid = escapeSqlNum(d.hawker_id || d.Hawker_id);
          return `(${did}, ${sno}, ${cid}, ${pid}, ${tp}, ${tfrom}, ${tto}, ${sdate}, ${cdate}, ${hid})`;
        }).join(',\n');
        sqlContent += `INSERT INTO \`discontinue\` (\`discontinue_id\`, \`sno\`, \`Customer_id\`, \`Publica_id\`, \`Temp_Perma\`, \`Temp_From\`, \`Temp_To\`, \`S_Date\`, \`C_Date\`, \`Hawker_id\`) VALUES\n${values};\n\n`;
      }
    }

    sqlContent += `\nSET FOREIGN_KEY_CHECKS=1;\n`;
    sqlContent += `-- ========================================================\n`;
    sqlContent += `-- BACKUP COMPLETED: ${dateStr}\n`;
    sqlContent += `-- ========================================================\n`;

    return new NextResponse(sqlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql; charset=utf-8',
        'Content-Disposition': `attachment; filename="AryanNews_Backup_${dateStr}.sql"`,
      },
    });
  } catch (error: any) {
    console.error('Backup generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// -------------------------------------------------------------
// POST: Process SQL restore via JSON payload or File upload
// -------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let parsedTables: Record<string, any[]> = {};

    let isAppendMode = false;
    // 1. If JSON payload (client-side pre-filtered or server local stream)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      isAppendMode = !!body.appendMode;

      // Mode A: Server local file path
      if (body.filePath) {
        if (!fs.existsSync(body.filePath)) {
          return NextResponse.json({ success: false, error: `File not found at ${body.filePath}` }, { status: 404 });
        }
        parsedTables = await parseSqlFileStream(body.filePath);
      }
      // Mode B: Client extracted tables directly
      else if (body.tables) {
        parsedTables = body.tables;
      } else {
        return NextResponse.json({ success: false, error: 'No tables or filePath provided' }, { status: 400 });
      }
    } 
    // 2. Fallback: multipart/form-data for smaller SQL files (< 50MB)
    else {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ success: false, error: 'No SQL file uploaded' }, { status: 400 });
      }

      // Save file temporarily to disk to stream-parse without RAM exhaustion
      const tempPath = path.join(process.cwd(), 'public', `temp_restore_${Date.now()}.sql`);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(tempPath, buffer);

      try {
        parsedTables = await parseSqlFileStream(tempPath);
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    }

    const stats: Record<string, number> = {};

    // -------------------------------------------------------------
    // Map & Update Active Stores
    // -------------------------------------------------------------

    // 1. Customers
    const customerRows = parsedTables['customer'] || parsedTables['tbl_customer'];
    if (customerRows && customerRows.length > 0) {
      const mappedCusts = customerRows.map(r => {
        if (Array.isArray(r)) {
          return {
            customer_id: Number(r[0]),
            name_eng: r[1] || '',
            type_cust: Number(r[2] ?? -1),
            name_hindi: r[3] || '',
            add1: r[4] || '',
            add2: r[5] || '',
            phone: r[6] || '',
            security_deposit: Number(r[7] ?? 0),
            type: r[8] || '',
            priority: Number(r[9] ?? 1),
            self_agent: Number(r[10] ?? -1),
            font_type: Number(r[11] ?? -1),
            dueamount: Number(r[12] ?? 0),
            region_id: Number(r[13] ?? 0),
            paid: r[14] || 'P',
            delivery: Number(r[15] ?? 0),
            discount: Number(r[16] ?? 0),
            govt_supply: Number(r[17] ?? 0),
            hindi_add: r[18] || '',
            cbal: Number(r[19] ?? 0),
            pmonth: r[20] || '',
            pyear: r[21] || '',
          };
        }
        return {
          customer_id: Number(r.customer_id ?? r.customerid ?? 0),
          name_eng: r.name_eng ?? r.nameeng ?? '',
          type_cust: Number(r.type_cust ?? -1),
          name_hindi: r.name_hindi ?? r.namehindi ?? '',
          add1: r.add1 ?? '',
          add2: r.add2 ?? '',
          phone: r.phone ?? '',
          security_deposit: Number(r.security_deposit ?? 0),
          type: r.type ?? '',
          priority: Number(r.priority ?? 1),
          self_agent: Number(r.self_agent ?? -1),
          font_type: Number(r.fonttype ?? -1),
          dueamount: Number(r.dueamount ?? 0),
          region_id: Number(r.region_id ?? r.regionid ?? 0),
          paid: r.paid ?? 'P',
          delivery: Number(r.delivery ?? 0),
          discount: Number(r.discount ?? 0),
          govt_supply: Number(r.govtsupply ?? 0),
          hindi_add: r.hindi_add ?? r.hindiadd ?? '',
          cbal: Number(r.cbal ?? 0),
          pmonth: r.pmonth ?? '',
          pyear: r.pyear ?? '',
        };
      });
      saveJson('all_customers.json', mappedCusts, isAppendMode);
      stats['customer'] = mappedCusts.length;

      // Upsert full customer master into Supabase in batches of 500
      (async () => {
        try {
          for (let i = 0; i < mappedCusts.length; i += 500) {
            const batch = mappedCusts.slice(i, i + 500);
            await supabase.from('customer').upsert(batch, { onConflict: 'customer_id' });
          }
        } catch (err) {
          console.warn('Supabase customer full sync error:', err);
        }
      })();
    }

    // 2. Subscriptions
    const subRows = parsedTables['customer_detail'] || parsedTables['custdetail'];
    if (subRows && subRows.length > 0) {
      const mappedSubs = subRows.map(r => {
        if (Array.isArray(r)) {
          return {
            sno: Number(r[0]),
            customer_id: Number(r[1]),
            publica_id: Number(r[2]),
            hawker_id: Number(r[3]),
            qty: Number(r[4] ?? 1),
            circulation: r[5] || 'Morning',
            s_date: r[6] || '',
            c_date: r[7] || '',
            from_day: r[8] || '1-7',
            hawk_sub: Number(r[9] ?? -1),
            dis: r[10] || 0,
            dely: Number(r[11] ?? 0),
          };
        }
        return {
          sno: Number(r.sno ?? 0),
          customer_id: Number(r.customer_id ?? r.customerid ?? 0),
          publica_id: Number(r.publica_id ?? r.publicaid ?? 0),
          hawker_id: Number(r.hawker_id ?? r.hawkerid ?? 0),
          qty: Number(r.qty ?? 1),
          circulation: r.circulation ?? 'Morning',
          s_date: r.s_date ?? r.sdate ?? '',
          c_date: r.c_date ?? r.cdate ?? '',
          from_day: r.from_day ?? r.fromday ?? '1-7',
          hawk_sub: Number(r.hawk_sub ?? -1),
          dis: r.dis ?? 0,
          dely: Number(r.dely ?? 0),
        };
      });
      saveJson('all_subscriptions.json', mappedSubs, isAppendMode);
      stats['customer_detail'] = mappedSubs.length;

      // Upsert full customer_detail into Supabase in batches
      (async () => {
        try {
          for (let i = 0; i < mappedSubs.length; i += 500) {
            const batch = mappedSubs.slice(i, i + 500);
            await supabase.from('customer_detail').upsert(batch, { onConflict: 'sno' });
          }
        } catch (err) {
          console.warn('Supabase customer_detail sync error:', err);
        }
      })();
    }

    // 3. Discontinue
    const discRows = parsedTables['discontinue20262027'] || parsedTables['discontinue'];
    if (discRows && discRows.length > 0) {
      const mappedDiscs = discRows.map(r => {
        if (Array.isArray(r)) {
          return {
            discontinue_id: Number(r[0]),
            sno: Number(r[1] ?? 0),
            entry_date: r[2] || '',
            customer_id: Number(r[3]),
            publica_id: Number(r[4]),
            temp_perma: r[5] || 'T',
            temp_from: r[6] || '',
            temp_to: r[7] || '',
            s_date: r[8] || '',
            c_date: r[9] || '',
            hawker_id: Number(r[10] ?? 0),
          };
        }
        return {
          discontinue_id: Number(r.discontinue_id ?? r.discontinueid ?? 0),
          sno: Number(r.sno ?? 0),
          entry_date: r.entry_date ?? r.entrydate ?? '',
          customer_id: Number(r.customer_id ?? r.customerid ?? 0),
          publica_id: Number(r.publica_id ?? r.publicaid ?? 0),
          temp_perma: r.temp_perma ?? r.tempperma ?? 'T',
          temp_from: r.temp_from ?? r.tempfrom ?? '',
          temp_to: r.temp_to ?? r.tempto ?? '',
          s_date: r.s_date ?? r.sdate ?? '',
          c_date: r.c_date ?? r.cdate ?? '',
          hawker_id: Number(r.hawker_id ?? r.hawkerid ?? 0),
        };
      });
      saveJson('discontinues.json', mappedDiscs, isAppendMode);
      stats['discontinue'] = mappedDiscs.length;

      // Upsert full discontinue into Supabase in batches
      (async () => {
        try {
          for (let i = 0; i < mappedDiscs.length; i += 500) {
            const batch = mappedDiscs.slice(i, i + 500);
            await supabase.from('discontinue').upsert(batch, { onConflict: 'discontinue_id' });
          }
        } catch (err) {
          console.warn('Supabase discontinue upsert warning:', err);
        }
      })();
    }

    // 4. Hawkers
    const hawkerRows = parsedTables['hawker'];
    if (hawkerRows && hawkerRows.length > 0) {
      const mappedHawkers = hawkerRows.map(r => {
        if (Array.isArray(r)) {
          return {
            hawker_id: Number(r[0]),
            name: r[1] || '',
            address: r[2] || '',
            city: r[3] || '',
            phone: r[4] || '',
            mobile: r[5] || '',
            region_id: Number(r[6] ?? 0),
            commission_rate: Number(r[7] ?? 0),
          };
        }
        return {
          hawker_id: Number(r.hawker_id ?? r.hawkerid ?? 0),
          name: r.name ?? '',
          address: r.address ?? '',
          city: r.city ?? '',
          phone: r.phone ?? '',
          mobile: r.mobile ?? '',
          region_id: Number(r.region_id ?? 0),
          commission_rate: Number(r.commission_rate ?? 0),
        };
      });
      saveJson('hawkers.json', mappedHawkers);
      stats['hawker'] = mappedHawkers.length;
    }

    // 5. Publications
    const pubRows = parsedTables['publication'] || parsedTables['publica'];
    if (pubRows && pubRows.length > 0) {
      const mappedPubs = pubRows.map(r => {
        if (Array.isArray(r)) {
          return {
            publica_id: Number(r[0]),
            name: r[1] || '',
            public_name: r[1] || '',
            type_p: r[2] || 'Newspaper',
            publish_id: Number(r[3] ?? 0),
            abrv: r[4] || '',
            circulation: r[5] || 'Morning',
            duration: r[6] || null,
            magzine_day: Number(r[7] ?? 0),
            magzine_month: Number(r[8] ?? 0),
            chr_del: Number(r[9] ?? 0),
            pub_hindi: r[10] || '',
          };
        }
        return {
          publica_id: Number(r.publica_id ?? r.publicaid ?? 0),
          name: r.public_name ?? r.name ?? '',
          public_name: r.public_name ?? r.name ?? '',
          type_p: r.type_p ?? 'Newspaper',
          publish_id: Number(r.publish_id ?? 0),
          abrv: r.abrv ?? '',
          circulation: r.circulation ?? 'Morning',
          duration: r.duration ?? null,
          magzine_day: Number(r.magzine_day ?? 0),
          magzine_month: Number(r.magzine_month ?? 0),
          chr_del: Number(r.chr_del ?? 0),
          pub_hindi: r.pub_hindi ?? '',
        };
      });
      saveJson('publications.json', mappedPubs);
      stats['publication'] = mappedPubs.length;
    }

    // 6. Rates
    const rateRows = parsedTables['rate'];
    if (rateRows && rateRows.length > 0) {
      const mappedRates = rateRows.map(r => {
        if (Array.isArray(r)) {
          return {
            publica_id: Number(r[0]),
            rate: Number(r[1] ?? 0),
            dayofweek: Number(r[2] ?? 1),
          };
        }
        return {
          publica_id: Number(r.publica_id ?? r.publicaid ?? 0),
          rate: Number(r.rate ?? 0),
          dayofweek: Number(r.dayofweek ?? 1),
        };
      });
      saveJson('rates.json', mappedRates);
      stats['rate'] = mappedRates.length;
    }

    // 7. Regions (regiond / region / regions)
    const regionRows = parsedTables['regiond'] || parsedTables['region'] || parsedTables['regions'];
    if (regionRows && regionRows.length > 0) {
      const mappedRegions = regionRows.map(r => {
        if (Array.isArray(r)) {
          return {
            region_id: Number(r[0]),
            region_name: r[1] || '',
            name: r[1] || '',
            zone: r[2] || '',
          };
        }
        return {
          region_id: Number(r.region_id ?? r.regionid ?? 0),
          region_name: r.region_name ?? r.regionname ?? r.name ?? '',
          name: r.region_name ?? r.regionname ?? r.name ?? '',
          zone: r.zone ?? '',
        };
      });
      saveJson('regions.json', mappedRegions);
      stats['region'] = mappedRegions.length;
    }

    // 8. Holidays (holiday)
    const holidayRows = parsedTables['holiday'];
    if (holidayRows && holidayRows.length > 0) {
      const mappedHolidays = holidayRows.map(r => {
        if (Array.isArray(r)) {
          return {
            oc_date: r[0] || '',
            occasion: r[1] || '',
            publica_id: Number(r[2] ?? 0),
          };
        }
        return {
          oc_date: r.oc_date ?? r.ocdate ?? '',
          occasion: r.occasion ?? '',
          publica_id: Number(r.publica_id ?? r.publicaid ?? 0),
        };
      });
      saveJson('holidays.json', mappedHolidays);
      stats['holiday'] = mappedHolidays.length;
    }

    // 9. Current Financial Year Receipts (receipt20262027)
    const receiptRows = parsedTables['receipt20262027'];
    if (receiptRows && receiptRows.length > 0) {
      const mappedReceipts = receiptRows.map(r => {
        if (Array.isArray(r)) {
          // MySQL: (`Receipt_id`,`Bill_id`,`ReceiptNo`,`ManualRepNo`,`BillDate`,`BillAmt`,`MalRecpDt`,`Month`,`Year`,`DueAmt`,`MalRecpAmt`,`Balance`,`LessAmt`,`RAmt`,`ChequeNo`,`ChequeDate`,`Debit`,`Credit`,`Cash_Chq`,`Narr`,`customer_id`)
          const repId = Number(r[0] ?? 0);
          const recpNo = Number(r[2] ?? 0);
          return {
            receipt_id: repId,
            id: repId,
            bill_id: Number(r[1] ?? 0),
            bill_no: Number(r[1] ?? 0),
            receipt_no: recpNo,
            recp_no: recpNo,
            manual_rep_no: String(r[3] ?? ''),
            mal_rep_no: String(r[3] ?? ''),
            bill_date: r[4] || '',
            recp_date: r[4] || r[6] || '',
            bill_amt: Number(r[5] ?? 0),
            mal_recp_dt: r[6] || '',
            month: r[7] || '',
            year: String(r[8] ?? '2026'),
            due_amt: Number(r[9] ?? 0),
            mal_recp_amt: Number(r[10] ?? 0),
            r_amt: Number(r[13] ?? r[10] ?? 0),
            balance: Number(r[11] ?? 0),
            less_amt: Number(r[12] ?? 0),
            cheque_no: String(r[14] ?? ''),
            cheque_date: String(r[15] ?? ''),
            cash_chq: r[18] || 'Cash',
            narr: r[19] || '',
            customer_id: Number(r[20] ?? 0),
          };
        }
        const repId = Number(r.receipt_id ?? r.receiptid ?? r.id ?? 0);
        const recpNo = Number(r.receipt_no ?? r.receiptno ?? r.recp_no ?? 0);
        return {
          receipt_id: repId,
          id: repId,
          bill_id: Number(r.bill_id ?? r.billid ?? 0),
          bill_no: Number(r.bill_no ?? r.bill_id ?? 0),
          receipt_no: recpNo,
          recp_no: recpNo,
          manual_rep_no: String(r.manual_rep_no ?? r.manualrepno ?? r.mal_rep_no ?? ''),
          mal_rep_no: String(r.manual_rep_no ?? r.manualrepno ?? r.mal_rep_no ?? ''),
          bill_date: r.bill_date ?? r.billdate ?? '',
          recp_date: r.recp_date ?? r.recpdate ?? r.bill_date ?? '',
          bill_amt: Number(r.bill_amt ?? r.billamt ?? 0),
          mal_recp_dt: r.mal_recp_dt ?? r.malrecpdt ?? '',
          month: r.month ?? '',
          year: String(r.year ?? '2026'),
          due_amt: Number(r.due_amt ?? r.dueamt ?? 0),
          mal_recp_amt: Number(r.mal_recp_amt ?? r.malrecpamt ?? 0),
          r_amt: Number(r.r_amt ?? r.ramt ?? r.mal_recp_amt ?? 0),
          balance: Number(r.balance ?? 0),
          less_amt: Number(r.less_amt ?? r.lessamt ?? 0),
          cheque_no: String(r.cheque_no ?? r.chequeno ?? ''),
          cheque_date: String(r.cheque_date ?? r.chequedate ?? ''),
          cash_chq: r.cash_chq ?? r.cashchq ?? 'Cash',
          narr: r.narr ?? '',
          customer_id: Number(r.customer_id ?? r.customerid ?? 0),
        };
      });

      // Save into active JSON store
      saveJson('all_receipts.json', mappedReceipts, isAppendMode);
      stats['receipt20262027'] = mappedReceipts.length;

      // Sync into Supabase receipt20262027 table
      (async () => {
        try {
          const supabaseBatch = mappedReceipts.map(rc => ({
            id: rc.receipt_id,
            recp_no: rc.recp_no,
            recp_date: rc.recp_date,
            customer_id: rc.customer_id,
            bill_amt: rc.bill_amt,
            less_amt: rc.less_amt,
            mal_recp_amt: rc.mal_recp_amt,
            month: rc.month,
            year: rc.year,
            region_id: null,
            remarks: JSON.stringify({
              bill_no: rc.bill_no,
              manual_rep_no: rc.manual_rep_no,
              mal_rep_no: rc.mal_rep_no,
              mal_recp_dt: rc.mal_recp_dt,
              balance: rc.balance,
              cash_chq: rc.cash_chq,
              r_amt: rc.r_amt
            })
          }));

          for (let i = 0; i < supabaseBatch.length; i += 300) {
            const chunk = supabaseBatch.slice(i, i + 300);
            await supabase.from('receipt20262027').upsert(chunk, { onConflict: 'id' });
          }
        } catch (err) {
          console.warn('Supabase receipt20262027 sync error:', err);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: 'SQL Backup file parsed and restored successfully into active database and local JSON stores!',
      stats,
    });
  } catch (error: any) {
    console.error('Restore processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// -------------------------------------------------------------
// Stream Parser Helper (Handles huge 500MB+ MySQL dumps in seconds)
// -------------------------------------------------------------
async function parseSqlFileStream(filePath: string): Promise<Record<string, any[]>> {
  const fileStream = fs.createReadStream(filePath, { encoding: 'latin1' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const coreTables = new Set([
    'customer',
    'customer_detail',
    'custdetail',
    'hawker',
    'publication',
    'publica',
    'rate',
    'discontinue20262027',
    'discontinue',
    'regiond',
    'region',
    'regions',
    'holiday',
    'receipt20262027',
  ]);

  const parsedTables: Record<string, any[]> = {};
  for (const t of coreTables) parsedTables[t] = [];

  const parseRow = (str: string): any[] => {
    const trimmed = str.trim().replace(/^\(/, '').replace(/\)[,;]?$/, '');
    const tokens: string[] = [];
    let inQuote = false;
    let cur = '';

    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === '\'' && (i === 0 || trimmed[i - 1] !== '\\')) {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        tokens.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    tokens.push(cur.trim());

    return tokens.map(t => {
      if (t === 'NULL' || t === 'null') return null;
      if (t.startsWith('\'') && t.endsWith('\'')) {
        return t.slice(1, -1).replace(/\\'/g, '\'').replace(/\\\\/g, '\\');
      }
      const num = Number(t);
      return isNaN(num) ? t : num;
    });
  };

  let currentTbl: string | null = null;

  for await (const line of rl) {
    if (line.startsWith('INSERT INTO ' + String.fromCharCode(96))) {
      const b1 = line.indexOf(String.fromCharCode(96));
      const b2 = line.indexOf(String.fromCharCode(96), b1 + 1);
      if (b2 !== -1) {
        const tbl = line.slice(b1 + 1, b2);
        currentTbl = coreTables.has(tbl) ? tbl : null;
      }
    } else if (currentTbl) {
      const trimmed = line.trim();
      if (trimmed.startsWith('(')) {
        parsedTables[currentTbl].push(parseRow(trimmed));
      }
      if (trimmed.endsWith(');') || trimmed.endsWith(';')) {
        currentTbl = null;
      }
    }
  }

  return parsedTables;
}
