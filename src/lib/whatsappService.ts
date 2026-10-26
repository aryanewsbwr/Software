/**
 * WhatsApp Cloud API Service Helper (Server-Side Only)
 * Official Meta Graph API v25.0
 * Aryan News Agency, Beawar
 */

export interface WhatsAppSendResult {
  success: boolean;
  wamid?: string;
  mediaId?: string;
  errorCode?: string;
  errorJson?: any;
}

export interface WhatsAppBillTemplateParams {
  toPhone: string;
  customerName: string;
  month: string;
  billNo: string;
  accountNo: string;
  currentAmount: number | string;
  previousDue: number | string;
  totalPayable: number | string;
  billImageBuffer: Buffer;
  imageFileName?: string;
}

/**
 * Normalizes phone numbers strictly into Meta's required format:
 * '91' + 10-digit mobile number, digits only (no +, spaces, leading 0).
 * Returns null if the phone is missing or invalid.
 */
export function formatWhatsAppPhone(phone: string | number | undefined | null): string | null {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  return null;
}

/**
 * Uploads a bill PNG image buffer to Meta WhatsApp Cloud API Media endpoint.
 * Returns the Media ID string.
 */
export async function uploadWhatsAppMedia(
  imageBuffer: Buffer,
  fileName: string = 'bill.png'
): Promise<{ success: boolean; mediaId?: string; error?: any }> {
  const token = process.env.WA_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID || '867112479817671';
  const apiVersion = process.env.WA_API_VERSION || 'v25.0';

  if (!token) {
    return { success: false, error: 'WA_TOKEN environment variable is not configured' };
  }

  try {
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', 'image/png');
    formData.append('file', new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' }), fileName);

    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    if (res.ok && data.id) {
      return { success: true, mediaId: data.id };
    } else {
      console.error('Meta Media Upload Error:', data);
      return { success: false, error: data };
    }
  } catch (err: any) {
    console.error('Network error uploading WhatsApp media:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Sends the approved 'monthly_bill_hi' template message with Image Header & 7 body parameters.
 */
export async function sendWhatsAppBillMessage(params: WhatsAppBillTemplateParams): Promise<WhatsAppSendResult> {
  const token = process.env.WA_TOKEN;
  const phoneId = process.env.WA_PHONE_NUMBER_ID || '867112479817671';
  const apiVersion = process.env.WA_API_VERSION || 'v25.0';
  const templateName = process.env.WA_TEMPLATE_NAME || 'monthly_bill_hi';

  const cleanPhone = formatWhatsAppPhone(params.toPhone);
  if (!cleanPhone) {
    return {
      success: false,
      errorCode: 'INVALID_PHONE',
      errorJson: { message: `Invalid phone format: ${params.toPhone}` }
    };
  }

  // 1. Upload the bill PNG first to obtain the Media ID
  const uploadResult = await uploadWhatsAppMedia(params.billImageBuffer, params.imageFileName || `Bill_${params.billNo}.png`);
  if (!uploadResult.success || !uploadResult.mediaId) {
    return {
      success: false,
      errorCode: 'MEDIA_UPLOAD_FAILED',
      errorJson: uploadResult.error
    };
  }

  const mediaId = uploadResult.mediaId;

  // 2. Format 7 body variables strictly as 2-decimal non-empty strings
  const fmtMoney = (val: number | string) => {
    const n = Number(val || 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  };

  const p1 = (params.customerName || 'ग्राहक').trim();
  const p2 = (params.month || 'माह').trim();
  const p3 = String(params.billNo || '').trim() || '0';
  const p4 = String(params.accountNo || '').trim() || '0';
  const p5 = fmtMoney(params.currentAmount);
  const p6 = fmtMoney(params.previousDue);
  const p7 = fmtMoney(params.totalPayable);

  const payload = {
    messaging_product: 'whatsapp',
    to: cleanPhone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'hi' },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: { id: mediaId }
            }
          ]
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: p1 },
            { type: 'text', text: p2 },
            { type: 'text', text: p3 },
            { type: 'text', text: p4 },
            { type: 'text', text: p5 },
            { type: 'text', text: p6 },
            { type: 'text', text: p7 }
          ]
        }
      ]
    }
  };

  try {
    const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.messages && data.messages[0]?.id) {
      return {
        success: true,
        wamid: data.messages[0].id,
        mediaId
      };
    } else {
      console.error('Meta Send Message Error:', data);
      const errObj = data?.error || data;
      return {
        success: false,
        mediaId,
        errorCode: String(errObj?.code || 'SEND_FAILED'),
        errorJson: errObj
      };
    }
  } catch (err: any) {
    console.error('Network error sending WhatsApp message:', err);
    return {
      success: false,
      mediaId,
      errorCode: 'NETWORK_ERROR',
      errorJson: { message: err?.message || String(err) }
    };
  }
}
