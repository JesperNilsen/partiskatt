import { kr } from '../engine/money.ts';
import type { Consumption, ConsumptionProfileId, ExciseGood, Kroner, VatCategory } from '../types/index.ts';
import { EXCISE_GOODS, VAT_CATEGORIES } from '../types/index.ts';

/**
 * PROVISIONAL — placeholder consumption profiles.
 *
 * `PROJECT.md` requires the standard profiles to come from SSB's forbruksundersøkelse
 * (table 14100, archived in `sources/manifest.json`). That extraction belongs to the data
 * layer, so these are round placeholder numbers of the right order of magnitude, marked
 * provisional everywhere they surface. Replace with `src/data/consumption-profiles.ts`.
 */
export const PROFILES_ARE_PROVISIONAL = true;

interface ProfileSeed {
  readonly id: ConsumptionProfileId;
  readonly label: string;
  readonly blurb: string;
  readonly spend: Partial<Record<VatCategory, number>>;
  readonly units: Partial<Record<ExciseGood, number>>;
}

/** Per single adult per year: spend incl. VAT (kr) and physical quantities. */
const SEEDS: readonly ProfileSeed[] = [
  {
    id: 'noktern',
    label: 'Nøkternt',
    blurb: 'Lite bilbruk, lavt strømforbruk, få reiser.',
    spend: {
      food: 38_000,
      general: 70_000,
      transportServices: 6_000,
      electricity: 11_000,
      fuel: 6_000,
      alcoholTobacco: 3_000,
      flights: 3_000,
      exempt: 90_000,
    },
    units: { petrolLitre: 300, kwh: 9_000, flightEurope: 1, beerLitre: 30, wineLitre: 8, spiritsLitre: 1 },
  },
  {
    id: 'typisk',
    label: 'Typisk',
    blurb: 'Én bil, vanlig strømforbruk, et par flyreiser.',
    spend: {
      food: 48_000,
      general: 110_000,
      transportServices: 9_000,
      electricity: 15_000,
      fuel: 13_000,
      alcoholTobacco: 8_000,
      flights: 8_000,
      exempt: 120_000,
    },
    units: {
      petrolLitre: 600,
      dieselLitre: 200,
      kwh: 13_000,
      flightEurope: 3,
      beerLitre: 60,
      wineLitre: 20,
      spiritsLitre: 2,
      snusGram: 300,
    },
  },
  {
    id: 'hoy',
    label: 'Høyt',
    blurb: 'Mye kjøring, stort hus, mange reiser.',
    spend: {
      food: 62_000,
      general: 190_000,
      transportServices: 14_000,
      electricity: 22_000,
      fuel: 20_000,
      alcoholTobacco: 16_000,
      flights: 22_000,
      exempt: 170_000,
    },
    units: {
      petrolLitre: 900,
      dieselLitre: 500,
      kwh: 20_000,
      flightEurope: 8,
      flightOther: 2,
      beerLitre: 120,
      wineLitre: 45,
      spiritsLitre: 5,
      cigarette: 1_000,
      snusGram: 900,
    },
  },
];

export const CONSUMPTION_PROFILES: readonly { id: ConsumptionProfileId; label: string; blurb: string }[] = SEEDS.map(
  ({ id, label, blurb }) => ({ id, label, blurb }),
);

/**
 * OECD-modified equivalence scale: the first adult counts 1, a second adult 0,5 and each
 * child 0,3. Households share housing, electricity and a car, so consumption does not
 * double when the household does.
 */
export function equivalenceFactor(adults: number, children: number): number {
  return 1 + 0.5 * Math.max(0, adults - 1) + 0.3 * Math.max(0, children);
}

export function consumptionFor(id: ConsumptionProfileId, adults: number, children: number): Consumption {
  const seed = SEEDS.find((s) => s.id === id) ?? SEEDS[1];
  if (!seed) throw new Error('forbruksprofil mangler');
  const factor = equivalenceFactor(adults, children);
  const spend = {} as Record<VatCategory, Kroner>;
  for (const cat of VAT_CATEGORIES) spend[cat] = kr(Math.round(((seed.spend[cat] ?? 0) * factor) / 100) * 100);
  const units = {} as Record<ExciseGood, number>;
  for (const good of EXCISE_GOODS) units[good] = Math.round((seed.units[good] ?? 0) * factor);
  return { spend, units };
}
