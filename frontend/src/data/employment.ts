/**
 * Worker population ratio for Uttar Pradesh: the share of people in work.
 *
 * Source: Periodic Labour Force Survey, MoSPI, as tabulated by the Ministry
 * of Labour and Employment in answers to Parliament. Both series are
 * percentages of their own age group, which is why they can share one axis.
 *
 * Why only three years: PLFS state-level tables for the 15-29 group are
 * published per annual report, and the earlier years (2017-18 onward) live in
 * PDF tables that have not been transcribed here. Three verified points beat
 * ten invented ones. To extend it, add rows with their source.
 *
 * What this is NOT: it is not a count of jobs created. A ratio can rise while
 * the number of jobs falls, if the population in that age group falls faster.
 */
export interface EmploymentPoint {
  /** The survey year, as PLFS labels it. */
  year: string;
  /** Worker population ratio, ages 15 to 29, percent. */
  youth: number;
  /** Worker population ratio, ages 15 and above, percent. */
  all: number;
}

export const UP_EMPLOYMENT: EmploymentPoint[] = [
  { year: '2021-22', youth: 34.7, all: 50.1 },
  { year: '2022-23', youth: 38.5, all: 53.9 },
  { year: '2023-24', youth: 39.0, all: 55.1 }
];

export const EMPLOYMENT_SOURCE =
  'PLFS, MoSPI, via Ministry of Labour and Employment';

/** Validated against the section B ground with the dataviz palette checker. */
export const SERIES_COLOUR = {
  youth: '#0A8F88',
  all: '#A85A00'
};
