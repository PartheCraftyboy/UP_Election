import { PoliticalParty } from '../types';
import { ALL_CONSTITUENCIES } from './upConstituencies';

/**
 * MLA registry: who holds each seat, which bench they sit on, and whether
 * they hold office in the current government.
 *
 * `govRole` is filled only where the office is confirmed. Everyone else
 * reads as "No portfolio" in the UI rather than carrying a guess. Add rows
 * to GOV_ROLES as the scraper confirms them.
 */

export type Bench = 'Treasury' | 'Opposition';

export interface GovRole {
  role: string;
  roleHindi: string;
  rank: 1 | 2 | 3; // 1 chief minister, 2 deputy, 3 cabinet or state minister
}

export interface MlaRecord {
  acNumber: number;
  seat: string;
  seatHindi: string;
  district: string;
  name: string;
  nameHindi?: string;
  party: PoliticalParty;
  bench: Bench;
  govRole?: GovRole;
  margin2022: number;
  momentumScore: number;
  status2027: string;
}

/** Parties currently in the governing alliance. */
export const TREASURY_PARTIES: PoliticalParty[] = ['BJP', 'AD(S)', 'NISHAD', 'RLD', 'SBSP'];

/** Confirmed offices, keyed by assembly constituency number. */
export const GOV_ROLES: Record<number, GovRole> = {
  343: { role: 'Chief Minister', roleHindi: 'मुख्यमंत्री', rank: 1 },
  171: {
    role: 'Deputy Chief Minister, Medical Health and Family Welfare',
    roleHindi: 'उप मुख्यमंत्री, चिकित्सा स्वास्थ्य एवं परिवार कल्याण',
    rank: 2
  }
};

/** Devanagari spellings for the named incumbents. */
export const MLA_NAMES_HINDI: Record<number, string> = {
  343: 'योगी आदित्यनाथ',
  279: 'अखिलेश यादव',
  384: 'डॉ. नीलकंठ तिवारी',
  171: 'ब्रजेश पाठक',
  14: 'कपिल देव अग्रवाल',
  125: 'अर्चना पांडेय',
  177: 'महाराजी प्रजापति',
  275: 'वेद प्रकाश गुप्ता',
  56: 'पंकज सिंह',
  356: 'अब्बास अंसारी',
  222: 'प्रकाश द्विवेदी'
};

export const benchFor = (party: PoliticalParty): Bench =>
  TREASURY_PARTIES.includes(party) ? 'Treasury' : 'Opposition';

/**
 * Only seats with a named incumbent make the registry. The 403 seat
 * generator leaves the rest unnamed, and a tracker of placeholder names
 * would be worse than a short honest list.
 */
export const MLA_REGISTRY: MlaRecord[] = ALL_CONSTITUENCIES.filter(
  (c) => Boolean(MLA_NAMES_HINDI[c.acNumber])
)
  .map((c) => ({
    acNumber: c.acNumber,
    seat: c.name,
    seatHindi: c.nameHindi,
    district: c.district,
    name: c.currentMla,
    nameHindi: MLA_NAMES_HINDI[c.acNumber],
    party: c.mlaParty,
    bench: benchFor(c.mlaParty),
    govRole: GOV_ROLES[c.acNumber],
    margin2022: c.margin2022,
    momentumScore: c.momentumScore,
    status2027: c.status2027
  }))
  .sort((a, b) => {
    const ra = a.govRole?.rank ?? 9;
    const rb = b.govRole?.rank ?? 9;
    if (ra !== rb) return ra - rb;
    return b.momentumScore - a.momentumScore;
  });

export const TREASURY_COUNT = MLA_REGISTRY.filter((m) => m.bench === 'Treasury').length;
export const OFFICE_HOLDERS = MLA_REGISTRY.filter((m) => Boolean(m.govRole));
