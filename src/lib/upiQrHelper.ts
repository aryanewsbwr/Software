import QRCode from 'qrcode';

export const UPI_VPA = '9462558949m@pnb';
export const UPI_PAYEE_NAME = 'ARYAN NEWS AGENCY';

/**
 * Builds the standard dynamic UPI payment URL
 * Format: upi://pay?pa=<VPA>&pn=<PAYEE>&am=<AMOUNT>&cu=INR&tn=<NOTE>
 */
export function buildUpiPaymentUri(amount: number, billNoOrCustId?: string | number, month?: string): string {
  const cleanAmt = Math.max(0, Number(amount || 0)).toFixed(2);
  const pn = encodeURIComponent(UPI_PAYEE_NAME);

  // Pure dynamic payment: Payee + VPA + Amount only (no note / remark)
  return `upi://pay?pa=${UPI_VPA}&pn=${pn}&am=${cleanAmt}&cu=INR`;
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
  size: number = 110
): string {
  const uri = buildUpiPaymentUri(amount, billNoOrCustId, month);
  let svgString = '';
  // QRCode.toString in svg mode returns SVG synchronously if callback is omitted or via sync
  QRCode.toString(uri, { type: 'svg', width: size, margin: 1, errorCorrectionLevel: 'M' }, (err, svg) => {
    if (!err && svg) {
      svgString = svg;
    }
  });
  return svgString;
}
