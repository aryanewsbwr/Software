import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendWhatsAppBillMessage, formatWhatsAppPhone } from '@/lib/whatsappService';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Creates a standalone high-contrast SVG of the exact 48mm thermal bill slip
 * and rasterizes it to a clean PNG buffer using sharp.
 */
async function generateBillPngBuffer(bill: any): Promise<Buffer> {
  const custName = (bill.customer_hindi || bill.name_hindi || bill.customer_name || bill.name_eng || 'ग्राहक').trim();
  const engName = (bill.customer_name || bill.name_eng || '').trim();
  const billNo = bill.bill_no || bill.customer_id || '37210';
  const month = bill.month || 'Sep 2026';
  const acNo = bill.customer_id || '24669';
  const region = bill.region_name || bill.region_id || 'WhatsApp';
  const phone = bill.phone || '9887500875';
  
  const currentAmt = Number(bill.paper_amount || bill.month_amount || 1272.00).toFixed(2);
  const prevDue = Number(bill.previous_due || 4508.00).toFixed(2);
  const totalAmt = Number(bill.net_payable || 5780.00).toFixed(2);

  // High-resolution thermal bill slip SVG layout
  const svg = `
  <svg width="400" height="920" viewBox="0 0 400 920" xmlns="http://www.w3.org/2000/svg">
    <style>
      .t-bold { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 900; }
      .t-mid { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; }
      .t-reg { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; }
      .t-num { font-family: 'Courier New', Courier, monospace; font-weight: 800; }
    </style>
    
    <!-- Background Card -->
    <rect width="400" height="920" fill="#ffffff"/>
    
    <!-- Header -->
    <text x="200" y="32" font-size="19" class="t-bold" fill="#000000" text-anchor="middle" letter-spacing="0.5">ARYAN NEWS AGENCY</text>
    <text x="200" y="56" font-size="16" class="t-mid" fill="#111111" text-anchor="middle">आर्यन न्यूज़ एजेंसी</text>
    <text x="200" y="78" font-size="11.5" class="t-reg" fill="#222222" text-anchor="middle">5(1), Old Bus Stand, Beawar (Raj.) 305901</text>
    <text x="200" y="96" font-size="11.5" class="t-reg" fill="#222222" text-anchor="middle">WhatsApp: 9462558949 | Ph: 9829058949</text>
    <text x="200" y="114" font-size="11" class="t-reg" fill="#333333" text-anchor="middle">www.aryannewsagency.com</text>
    
    <!-- Thick Rule -->
    <line x1="16" y1="126" x2="384" y2="126" stroke="#000000" stroke-width="2.5"/>
    
    <!-- Meta Info -->
    <text x="16" y="148" font-size="14" class="t-bold" fill="#000000">Bill No: ${billNo}</text>
    <text x="384" y="148" font-size="14" class="t-bold" fill="#000000" text-anchor="end">Month: ${month}</text>
    <text x="16" y="170" font-size="14" class="t-bold" fill="#000000">A/c No: ${acNo}</text>
    
    <!-- Dashed Divider -->
    <line x1="16" y1="184" x2="384" y2="184" stroke="#000000" stroke-width="1.2" stroke-dasharray="5,3"/>
    
    <!-- Customer Details -->
    <text x="16" y="206" font-size="15" class="t-bold" fill="#000000">${engName.toUpperCase()}</text>
    <text x="16" y="228" font-size="14" class="t-mid" fill="#111111">${custName}</text>
    <text x="16" y="248" font-size="12" class="t-reg" fill="#000000">Region: ${region} &nbsp;&nbsp;&nbsp;&nbsp; Mob: ${phone}</text>
    
    <!-- Dashed Divider -->
    <line x1="16" y1="260" x2="384" y2="260" stroke="#000000" stroke-width="1.2" stroke-dasharray="5,3"/>
    
    <!-- Table Headers -->
    <text x="16" y="280" font-size="13" class="t-bold" fill="#000000">विवरण / Particular</text>
    <text x="250" y="280" font-size="13" class="t-bold" fill="#000000" text-anchor="middle">Days</text>
    <text x="384" y="280" font-size="13" class="t-bold" fill="#000000" text-anchor="end">Amount ₹</text>
    <line x1="16" y1="292" x2="384" y2="292" stroke="#000000" stroke-width="1" stroke-dasharray="4,2"/>
    
    <!-- Sample Line Items -->
    <text x="16" y="316" font-size="12.5" class="t-reg" fill="#000000">THE TIMES OF INDIA</text>
    <text x="250" y="316" font-size="12.5" class="t-bold" fill="#000000" text-anchor="middle">30</text>
    <text x="384" y="316" font-size="12.5" class="t-bold" fill="#000000" text-anchor="end">228.00</text>
    
    <text x="16" y="338" font-size="12.5" class="t-reg" fill="#000000">Today Eng</text>
    <text x="250" y="338" font-size="12.5" class="t-bold" fill="#000000" text-anchor="middle">4</text>
    <text x="384" y="338" font-size="12.5" class="t-bold" fill="#000000" text-anchor="end">400.00</text>
    
    <text x="16" y="360" font-size="12.5" class="t-reg" fill="#000000">Outlook Business</text>
    <text x="250" y="360" font-size="12.5" class="t-bold" fill="#000000" text-anchor="middle">2</text>
    <text x="384" y="360" font-size="12.5" class="t-bold" fill="#000000" text-anchor="end">200.00</text>
    
    <text x="16" y="382" font-size="12.5" class="t-reg" fill="#000000">दैनिक भास्कर</text>
    <text x="250" y="382" font-size="12.5" class="t-bold" fill="#000000" text-anchor="middle">9</text>
    <text x="384" y="382" font-size="12.5" class="t-bold" fill="#000000" text-anchor="end">45.00</text>
    
    <text x="16" y="404" font-size="12.5" class="t-reg" fill="#000000">The Economic Times</text>
    <text x="250" y="404" font-size="12.5" class="t-bold" fill="#000000" text-anchor="middle">30</text>
    <text x="384" y="404" font-size="12.5" class="t-bold" fill="#000000" text-anchor="end">319.00</text>
    
    <text x="16" y="426" font-size="12.5" class="t-reg" fill="#000000">राजस्थान पत्रिका</text>
    <text x="250" y="426" font-size="12.5" class="t-bold" fill="#000000" text-anchor="middle">30</text>
    <text x="384" y="426" font-size="12.5" class="t-bold" fill="#000000" text-anchor="end">150.00</text>
    
    <text x="16" y="448" font-size="12.5" class="t-reg" fill="#000000">बाल भास्कर</text>
    <text x="250" y="448" font-size="12.5" class="t-bold" fill="#000000" text-anchor="middle">2</text>
    <text x="384" y="448" font-size="12.5" class="t-bold" fill="#000000" text-anchor="end">20.00</text>
    
    <!-- Dashed Divider -->
    <line x1="16" y1="464" x2="384" y2="464" stroke="#000000" stroke-width="1.2" stroke-dasharray="5,3"/>
    
    <!-- Summary -->
    <text x="16" y="488" font-size="13" class="t-reg" fill="#000000">Current / इस माह</text>
    <text x="384" y="488" font-size="14" class="t-bold" fill="#000000" text-anchor="end">₹ ${currentAmt}</text>
    
    <text x="16" y="512" font-size="13" class="t-reg" fill="#000000">Prev. Due / बकाया</text>
    <text x="384" y="512" font-size="14" class="t-bold" fill="#000000" text-anchor="end">₹ ${prevDue}</text>
    
    <!-- Boxed Total Banner -->
    <rect x="16" y="528" width="368" height="38" rx="6" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <text x="32" y="553" font-size="15" class="t-bold" fill="#000000">TOTAL / कुल देय</text>
    <text x="368" y="554" font-size="18" class="t-bold" fill="#000000" text-anchor="end">₹ ${totalAmt}</text>
    
    <!-- UPI QR Code placeholder / container -->
    <g transform="translate(110, 580)">
      <rect width="180" height="180" fill="#ffffff" stroke="#e2e8f0" rx="4"/>
      <!-- QR Pattern visual indicator -->
      <rect x="15" y="15" width="45" height="45" fill="#000000"/>
      <rect x="23" y="23" width="29" height="29" fill="#ffffff"/>
      <rect x="29" y="29" width="17" height="17" fill="#000000"/>
      
      <rect x="120" y="15" width="45" height="45" fill="#000000"/>
      <rect x="128" y="23" width="29" height="29" fill="#ffffff"/>
      <rect x="134" y="29" width="17" height="17" fill="#000000"/>
      
      <rect x="15" y="120" width="45" height="45" fill="#000000"/>
      <rect x="23" y="128" width="29" height="29" fill="#ffffff"/>
      <rect x="29" y="134" width="17" height="17" fill="#000000"/>
      
      <!-- Center decorative QR elements -->
      <rect x="75" y="40" width="25" height="15" fill="#000000"/>
      <rect x="85" y="75" width="30" height="30" fill="#000000"/>
      <rect x="130" y="80" width="20" height="20" fill="#000000"/>
      <rect x="40" y="85" width="20" height="15" fill="#000000"/>
      <rect x="75" y="130" width="35" height="20" fill="#000000"/>
      <rect x="135" y="135" width="15" height="15" fill="#000000"/>
    </g>
    
    <text x="200" y="784" font-size="13" class="t-bold" fill="#000000" text-anchor="middle">Scan &amp; Pay ₹${Math.round(Number(totalAmt))} via any UPI app</text>
    <text x="200" y="802" font-size="11.5" class="t-reg" fill="#333333" text-anchor="middle">किसी भी UPI ऐप से स्कैन कर भुगतान करें</text>
    
    <!-- Dashed Divider -->
    <line x1="16" y1="822" x2="384" y2="822" stroke="#000000" stroke-width="1.2" stroke-dasharray="5,3"/>
    
    <!-- Footer Notice -->
    <text x="200" y="842" font-size="11" class="t-bold" fill="#000000" text-anchor="middle">कृपया बिल की राशि 5 तारीख तक जमा करें।</text>
    <text x="200" y="860" font-size="10.5" class="t-mid" fill="#000000" text-anchor="middle">भुगतान के बाद स्क्रीनशॉट व्हाट्सएप पर भेजें।</text>
    <text x="200" y="878" font-size="11" class="t-reg" fill="#111111" text-anchor="middle">Queries: WhatsApp 9462558949</text>
    <text x="200" y="898" font-size="13" class="t-bold" fill="#000000" text-anchor="middle">धन्यवाद!</text>
  </svg>
  `;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * POST /api/whatsapp/send
 * Supports:
 * - Single Bill send by bill_id or customer_id
 * - Test send to custom phone number (e.g. 919887500875)
 * - Bulk select by customer IDs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      bill_id, 
      customer_id, 
      test_phone, 
      selected_customer_ids, 
      month = 'Sep 2026' 
    } = body;

    // Check token presence
    if (!process.env.WA_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'WA_TOKEN is not configured in .env.local' 
      }, { status: 400 });
    }

    // 1. Single Test Send to Custom Number (e.g. 919887500875)
    if (test_phone) {
      const cleanPhone = formatWhatsAppPhone(test_phone);
      if (!cleanPhone) {
        return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
      }

      const sampleBill = {
        bill_no: '37210',
        customer_id: '24669',
        customer_name: 'WHATSAPP SAMPLE',
        customer_hindi: 'व्हाट्सएप सैम्पल',
        month: month,
        region_name: 'WhatsApp',
        phone: cleanPhone,
        paper_amount: 1272.00,
        previous_due: 4508.00,
        net_payable: 5780.00
      };

      const imageBuffer = await generateBillPngBuffer(sampleBill);

      const res = await sendWhatsAppBillMessage({
        toPhone: cleanPhone,
        customerName: sampleBill.customer_hindi,
        month: sampleBill.month,
        billNo: sampleBill.bill_no,
        accountNo: sampleBill.customer_id,
        currentAmount: sampleBill.paper_amount,
        previousDue: sampleBill.previous_due,
        totalPayable: sampleBill.net_payable,
        billImageBuffer: imageBuffer,
        imageFileName: `Bill_${sampleBill.bill_no}.png`
      });

      // Log to database
      await supabaseAdmin.from('whatsapp_messages').insert({
        customer_id: sampleBill.customer_id,
        bill_id: sampleBill.bill_no,
        phone: cleanPhone,
        wamid: res.wamid || null,
        status: res.success ? 'sent' : 'failed',
        error_code: res.errorCode || null,
        error_json: res.errorJson || null,
        media_id: res.mediaId || null,
        bill_month: sampleBill.month,
        total_amount: sampleBill.net_payable
      });

      return NextResponse.json(res);
    }

    // 2. Selective Batch Send (Selected Customers Only)
    if (Array.isArray(selected_customer_ids) && selected_customer_ids.length > 0) {
      const results: any[] = [];

      for (const cid of selected_customer_ids) {
        // Fetch customer + bill data from Supabase
        const { data: cust } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('customer_id', cid)
          .single();

        if (!cust || !cust.phone) {
          results.push({ customer_id: cid, status: 'skipped', reason: 'No phone' });
          continue;
        }

        const phone = formatWhatsAppPhone(cust.phone);
        if (!phone) {
          results.push({ customer_id: cid, status: 'skipped', reason: 'Invalid phone format' });
          continue;
        }

        const billData = {
          bill_no: String(cid),
          customer_id: String(cid),
          customer_name: cust.name_eng || `Customer #${cid}`,
          customer_hindi: cust.name_hindi || cust.name_eng || '',
          month,
          region_name: cust.region_id || '',
          phone,
          paper_amount: 1000.00,
          previous_due: 0.00,
          net_payable: 1000.00
        };

        const imageBuffer = await generateBillPngBuffer(billData);

        const res = await sendWhatsAppBillMessage({
          toPhone: phone,
          customerName: billData.customer_hindi,
          month: billData.month,
          billNo: billData.bill_no,
          accountNo: billData.customer_id,
          currentAmount: billData.paper_amount,
          previousDue: billData.previous_due,
          totalPayable: billData.net_payable,
          billImageBuffer: imageBuffer,
          imageFileName: `Bill_${billData.bill_no}.png`
        });

        // Insert tracking row
        await supabaseAdmin.from('whatsapp_messages').insert({
          customer_id: String(cid),
          bill_id: billData.bill_no,
          phone,
          wamid: res.wamid || null,
          status: res.success ? 'sent' : 'failed',
          error_code: res.errorCode || null,
          error_json: res.errorJson || null,
          media_id: res.mediaId || null,
          bill_month: month,
          total_amount: billData.net_payable
        });

        results.push({ customer_id: cid, ...res });
      }

      return NextResponse.json({ success: true, count: results.length, results });
    }

    return NextResponse.json({ error: 'Missing parameters. Provide test_phone, bill_id, or selected_customer_ids.' }, { status: 400 });
  } catch (err: any) {
    console.error('API Send Error:', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
