import QRCode from 'qrcode';

export const UPI_VPA = '9462558949m@pnb';
export const UPI_PAYEE_NAME = 'ARYAN NEWS AGENCY';

/**
 * Builds the standard UPI payment URL
 * If amount is provided (> 0), it sets 'am' as suggestion, but leaves it editable,
 * or allows customer to enter amount freely (some apps lock amount if 'am' is present).
 * If omitAmount is true or amount <= 0, no 'am' param is included so user enters any amount.
 */
export function buildUpiPaymentUri(amount?: number | null, billNoOrCustId?: string | number, month?: string): string {
  const pn = encodeURIComponent(UPI_PAYEE_NAME);
  // Omit am parameter so customer/app can freely type/edit any amount (including discounted/partial amounts)
  return `upi://pay?pa=${UPI_VPA}&pn=${pn}&cu=INR`;
}

/**
 * Generates an SVG string or DataURL for the dynamic QR code
 */
export async function generateDynamicUpiQrDataUrl(
  amount: number, 
  billNoOrCustId: string | number, 
  month?: string,
  width: number = 140
): Promise<string> {
  const uri = buildUpiPaymentUri(amount, billNoOrCustId, month);
  try {
    return await QRCode.toDataURL(uri, {
      width,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate dynamic UPI QR code:', err);
    return '';
  }
}

/**
 * Synchronous SVG string generator for fast HTML templates without async overhead
 */
export function generateDynamicUpiQrSvg(
  amount: number,
  billNoOrCustId: string | number,
  month?: string,
  size: number = 110,
  margin: number = 0
): string {
  const uri = buildUpiPaymentUri(amount, billNoOrCustId, month);
  let svgString = '';
  // QRCode.toString in svg mode returns SVG synchronously if callback is omitted or via sync
  QRCode.toString(uri, { type: 'svg', width: size, margin: margin, errorCorrectionLevel: 'M' }, (err, svg) => {
    if (!err && svg) {
      svgString = svg;
    }
  });
  return svgString;
}
