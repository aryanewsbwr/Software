/**
 * ARYAN NEWS AGENCY - UNIFIED DISCONTINUE ENGINE
 * 
 * Implements authoritative logic for both:
 * 1. Customer Discontinue & Vacation Hold (custdetail & discontinue)
 * 2. Publication Discontinue & Suspension (publicationdis)
 * 
 * Rules Verified against VB6 / MySQL ERP & September 2026 Audit:
 * - Permanent Stop ('P'): Customer stops paper from Temp_From indefinitely.
 * - Temporary Hold ('T'): Paper is paused between Temp_From and Temp_To (inclusive),
 *   then resumes automatically. If Temp_To is missing/empty, held for single day Temp_From.
 * - Publication Scope: publica_id = 0 or NULL stops all papers for that customer.
 * - Re-subscription Scope: Temp_From >= S_Date. A stop recorded under an older subscription
 *   must NEVER block a newer subscription started after the stop date (e.g. Customer 24669).
 */

export interface DiscontinueRecord {
  discontinue_id?: number;
  sno?: number;
  entry_date?: string;
  customer_id: number;
  publica_id?: number | null;
  temp_perma: 'P' | 'T' | string;
  temp_from: string;
  temp_to?: string | null;
  s_date?: string | null;
  c_date?: string | null;
  hawker_id?: number | null;
}

export interface PublicationDiscontinueRecord {
  id?: number;
  publica_id: number;
  entry_date?: string;
  from_date?: string;
  to_date?: string;
  oc_date?: string;
  dis_type?: 'P' | 'T' | string;
  remark?: string;
}

export interface IndexedCustDiscontinue {
  pubId: number;
  tempFrom: string;
  isPerm: boolean;
  tempTo: string | null;
  sDateIso: string | null;
}

export interface IndexedPubDiscontinue {
  fromIso: string | null;
  toIso: string | null;
  isPerm: boolean;
}

/**
 * Standardizes any DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD string to ISO YYYY-MM-DD.
 * Returns null if invalid or empty.
 */
export function parseDateToIso(val: any): string | null {
  if (!val) return null;
  const s = String(val).trim();
  if (!s || s === '-' || s === 'null' || s === 'undefined') return null;

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // Continuous digits: DDMMYYYY (e.g. 08102026) or YYYYMMDD
  if (/^\d{8}$/.test(s)) {
    const yrFirst = parseInt(s.slice(0, 4), 10);
    if (yrFirst >= 1990 && yrFirst <= 2099) {
      return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    }
    // DDMMYYYY
    return `${s.slice(4, 8)}-${s.slice(2, 4)}-${s.slice(0, 2)}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const parts = s.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return null;
}

/**
 * Builds high-performance O(1) in-memory lookup index for Publication Discontinues.
 */
export function buildPublicationDiscontinueIndex(
  records: any[] = []
): Map<number, IndexedPubDiscontinue[]> {
  const map = new Map<number, IndexedPubDiscontinue[]>();

  for (const pd of records) {
    const rawPid = pd.publica_id !== undefined ? pd.publica_id : (pd.Publica_id !== undefined ? pd.Publica_id : pd.publication_id);
    if (rawPid === undefined || rawPid === null || rawPid === '') continue;
    const pId = Number(rawPid);
    if (isNaN(pId)) continue;

    const fromIso = parseDateToIso(pd.from_date || pd.FromDate || pd.fromdate || pd.entry_date);
    const toIso = parseDateToIso(pd.to_date || pd.ToDate || pd.todate || pd.oc_date);
    const disType = String(pd.dis_type || pd.type || 'P').trim().toUpperCase();
    const isPerm = disType.startsWith('P');

    if (!map.has(pId)) map.set(pId, []);
    map.get(pId)!.push({
      fromIso,
      toIso: isPerm && !toIso ? '2099-12-31' : toIso,
      isPerm
    });
  }

  return map;
}

/**
 * Checks whether a publication is discontinued/suspended globally on targetDateIso.
 * publica_id: 0 ONLY applies to daily newspapers, NOT magazines/periodicals.
 */
export function checkPublicationDiscontinued(
  pubIndex: Map<number, IndexedPubDiscontinue[]>,
  publicaId: number,
  targetDateIso: string,
  isDaily: boolean = true
): boolean {
  const specificList = pubIndex.get(publicaId) || [];
  const globalList = isDaily ? (pubIndex.get(0) || []) : [];
  const allMatching = [...specificList, ...globalList];
  if (allMatching.length === 0) return false;

  return allMatching.some(item => {
    if (item.fromIso && targetDateIso < item.fromIso) return false;
    if (item.toIso && targetDateIso > item.toIso) return false;
    return true;
  });
}

/**
 * Builds high-performance O(1) in-memory lookup index for Customer Discontinues.
 */
export function buildCustomerDiscontinueIndex(
  records: any[] = []
): Map<number, IndexedCustDiscontinue[]> {
  const map = new Map<number, IndexedCustDiscontinue[]>();

  for (const d of records) {
    const cid = Number(d.customer_id || d.Customer_id);
    if (!cid) continue;

    const tempFrom = parseDateToIso(d.temp_from || d.Temp_From || d.from_date);
    if (!tempFrom) continue;

    const tempPermaStr = String(d.temp_perma || d.Temp_Perma || 'P').trim().toUpperCase();
    const isPerm = tempPermaStr.startsWith('P');
    const tempTo = parseDateToIso(d.temp_to || d.Temp_To || d.to_date);
    const sDateIso = parseDateToIso(d.s_date || d.S_Date);

    if (!map.has(cid)) map.set(cid, []);
    map.get(cid)!.push({
      pubId: Number(d.publica_id || d.Publica_id || 0),
      tempFrom,
      isPerm,
      tempTo,
      sDateIso
    });
  }

  return map;
}

/**
 * Checks whether a customer subscription is discontinued on targetDateIso.
 * 
 * Evaluates:
 * 1. Scope (publicaId match or 0/null for all)
 * 2. Re-subscription scope (sDateIso > tempFrom ignores older stop records)
 * 3. Permanent stop ('P') -> targetDateIso >= tempFrom
 * 4. Temporary hold ('T') -> tempFrom <= targetDateIso <= COALESCE(tempTo, tempFrom)
 */
export function checkCustomerDiscontinued(
  custIndex: Map<number, IndexedCustDiscontinue[]>,
  customerId: number,
  publicaId: number,
  targetDateIso: string,
  sDateIso?: string | null
): boolean {
  const list = custIndex.get(customerId);
  if (!list || list.length === 0) return false;

  return list.some(d => {
    // 1. Publication Scope: 0 or null applies to ALL papers, otherwise must match publicaId
    if (d.pubId !== 0 && d.pubId !== publicaId) return false;

    // Explicit subscription s_date scoping if recorded
    if (d.sDateIso && sDateIso && d.sDateIso !== sDateIso) return false;

    // 2. Re-subscription scoping rule (Temp_From >= S_Date)
    // If a new subscription was started after the discontinue date, older stops must not block it
    if (sDateIso && sDateIso > d.tempFrom) return false;

    // 3. Permanent stop: active from tempFrom indefinitely
    if (d.isPerm) {
      return targetDateIso >= d.tempFrom;
    }

    // 4. Temporary hold: active between tempFrom and COALESCE(tempTo, tempFrom)
    const effectiveTo = d.tempTo || d.tempFrom;
    return targetDateIso >= d.tempFrom && targetDateIso <= effectiveTo;
  });
}
