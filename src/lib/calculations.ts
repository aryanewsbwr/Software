import { Customer, CustomerDetail, Rate, RateChange, Holiday, Discontinue, BillHeader, BillItem } from './types';

/**
 * Legacy Day of Week: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
 */
export function getLegacyDayOfWeek(date: Date): number {
  return date.getDay() + 1;
}

/**
 * Resolve rate for a specific publication and delivery date
 */
export function getRateForDate(
  publicaId: number,
  dayOfWeek: number,
  deliveryDateStr: string,
  rateChanges: RateChange[],
  baseRates: Rate[]
): number {
  // Check scheduled / historical rate changes (most recent dated <= deliveryDateStr)
  const applicableChanges = rateChanges
    .filter(rc => rc.publica_id === publicaId && rc.dayofweek === dayOfWeek && rc.dated <= deliveryDateStr)
    .sort((a, b) => b.dated.localeCompare(a.dated));

  if (applicableChanges.length > 0) {
    return applicableChanges[0].new_rate;
  }

  // Fallback to base rate
  const base = baseRates.find(r => r.publica_id === publicaId && r.dayofweek === dayOfWeek);
  return base ? base.rate : 5.00;
}

/**
 * Checks if publication is delivered on a specific calendar day
 */
export function isDeliveredOnDate(
  sub: CustomerDetail,
  date: Date,
  holidays: Holiday[],
  discontinues: Discontinue[]
): boolean {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = getLegacyDayOfWeek(date);

  // 1. Subscription Active Date Range (s_date <= date <= c_date)
  if (sub.s_date) {
    const sDate = new Date(sub.s_date).toISOString().split('T')[0];
    if (dateStr < sDate) return false;
  }
  if (sub.c_date) {
    const cDate = new Date(sub.c_date).toISOString().split('T')[0];
    if (dateStr > cDate) return false;
  }

  // 2. Day of Week Delivery schedule (e.g. "1-7" or "1,2,3,4,5,6,7")
  if (sub.from_day && sub.from_day !== '1-7') {
    const activeDays = sub.from_day.split(/[,-]/).map(d => parseInt(d.trim(), 10)).filter(Boolean);
    if (activeDays.length > 0 && !activeDays.includes(dayOfWeek)) {
      return false;
    }
  }

  // 3. Holiday Check
  const isHoliday = holidays.some(h => {
    const hDate = new Date(h.oc_date).toISOString().split('T')[0];
    return hDate === dateStr && (!h.publica_id || h.publica_id === sub.publica_id);
  });
  if (isHoliday) return false;

  // 4. Vacation / Discontinue Hold Check
  const isVacation = discontinues.some(d => {
    if (d.customer_id !== sub.customer_id) return false;
    if (d.publica_id && d.publica_id !== sub.publica_id) return false;
    const fromStr = new Date(d.temp_from).toISOString().split('T')[0];
    if (d.temp_perma === 'Permanent' || d.temp_perma === 'P') {
      return dateStr >= fromStr;
    }
    const toStr = d.temp_to ? new Date(d.temp_to).toISOString().split('T')[0] : '9999-12-31';
    return dateStr >= fromStr && dateStr <= toStr;
  });
  if (isVacation) return false;

  return true;
}

/**
 * Calculate Monthly Bill for a single customer
 */
export function calculateCustomerMonthlyBill(
  customer: Customer,
  subscriptions: CustomerDetail[],
  baseRates: Rate[],
  rateChanges: RateChange[],
  holidays: Holiday[],
  discontinues: Discontinue[],
  monthName: string,
  year: number
): { billHeader: BillHeader; items: BillItem[] } {
  const monthMap: Record<string, number> = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
  };
  const monthIdx = monthMap[monthName] ?? new Date().getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  let totalPaperAmount = 0;
  let totalCopies = 0;
  let totalDeliveryCharges = 0;
  const items: BillItem[] = [];

  for (const sub of subscriptions) {
    let subCopies = 0;
    let subAmount = 0;
    let avgRate = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const curDate = new Date(year, monthIdx, day);
      const dateStr = curDate.toISOString().split('T')[0];
      const dayOfWeek = getLegacyDayOfWeek(curDate);

      if (isDeliveredOnDate(sub, curDate, holidays, discontinues)) {
        const rate = getRateForDate(sub.publica_id, dayOfWeek, dateStr, rateChanges, baseRates);
        const copies = sub.qty || 1;
        subCopies += copies;
        subAmount += copies * rate;
        avgRate = rate;
      }
    }

    if (subCopies > 0 || sub.dely > 0) {
      totalCopies += subCopies;
      totalPaperAmount += subAmount;
      totalDeliveryCharges += sub.dely || 0;

      items.push({
        customer_id: customer.customer_id,
        publica_id: sub.publica_id,
        publication_name: sub.publication_name || `Pub #${sub.publica_id}`,
        region_id: customer.region_id,
        qty: subCopies,
        rate: avgRate,
        d_charges: sub.dely || 0,
        total_amt: Math.round((subAmount + (sub.dely || 0)) * 100) / 100,
        month: monthName,
        year: year.toString(),
        sno: sub.sno
      });
    }
  }

  // Final Net Balance: Previous Due (dueamount or cbal) + Paper Amount + Delivery Charges
  const previousDue = customer.cbal ?? customer.dueamount ?? 0;
  const netPayable = Math.round((previousDue + totalPaperAmount + totalDeliveryCharges) * 100) / 100;

  const billHeader: BillHeader = {
    bill_id: Number(`${customer.customer_id}${year}${monthIdx + 1}`),
    customer_id: customer.customer_id,
    customer_name: customer.name_eng,
    region_id: customer.region_id,
    due_amt: previousDue,
    del_amt: totalDeliveryCharges,
    dis_amt: 0,
    month: monthName,
    year: year.toString(),
    balance: netPayable,
    total_copies: totalCopies,
    paper_amount: Math.round(totalPaperAmount * 100) / 100
  };

  return { billHeader, items };
}
