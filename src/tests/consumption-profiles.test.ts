import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  COICOP_MAPPING,
  CONSUMPTION_PROFILES,
  consumptionFor,
  equivalenceFactor,
  FBU_TOTAL_2022,
  HOUSEHOLD_SPEND_2022,
  KWH_IS_ESTIMATED,
  PROFILE_SEEDS,
  UNIT_PRICES_2022,
} from '../data/consumption-profiles.ts';
import type { ConsumptionProfileId } from '../types/index.ts';
import { EXCISE_GOODS, VAT_CATEGORIES } from '../types/index.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Les den arkiverte json-stat2-filen og gi en oppslagsfunksjon kode -> kr.
 *
 * Testen gar til rakilden med vilje. En test som bare leste modulens egne tall ville
 * bekreftet at de er like seg selv; denne feiler hvis noen retter et tall i modulen uten
 * a rette kartleggingen, eller bytter arkivfilen uten a regne om.
 */
function fbuLookup(): (code: string) => number {
  const raw = JSON.parse(readFileSync(join(ROOT, 'sources', 'raw', 'ssb-fbu-14100.json'), 'utf8'));
  const index: Record<string, number> = raw.dimension.VareTjenesteGruppe.category.index;
  const contents: number = Object.keys(raw.dimension.ContentsCode.category.index).length;
  const utgift: number = raw.dimension.ContentsCode.category.index.Utgift;
  return (code) => {
    const i = index[code];
    if (i === undefined) throw new Error(`COICOP-kode mangler i arkivet: ${code}`);
    const v = raw.value[i * contents + utgift];
    return v == null ? 0 : v;
  };
}

function derive(): Record<string, number> {
  const val = fbuLookup();
  const out: Record<string, number> = {};
  for (const rule of COICOP_MAPPING) {
    const plus = rule.include.reduce((a, c) => a + val(c), 0);
    const minus = rule.exclude.reduce((a, c) => a + val(c), 0);
    out[rule.category] = plus - minus;
  }
  return out;
}

describe('COICOP-kartleggingen (Q-001 punkt 2)', () => {
  it('gir nøyaktig de beløpene modulen oppgir', () => {
    expect(derive()).toEqual({ ...HOUSEHOLD_SPEND_2022 });
  });

  it('dekker hver VatCategory én gang', () => {
    const covered = COICOP_MAPPING.map((r) => r.category).sort();
    expect(covered).toEqual([...VAT_CATEGORIES].sort());
    expect(new Set(covered).size).toBe(covered.length);
  });

  it('summerer til gruppe 00 innenfor avrunding', () => {
    const val = fbuLookup();
    const sum = Object.values(HOUSEHOLD_SPEND_2022).reduce((a, b) => a + b, 0);
    expect(val('00')).toBe(FBU_TOTAL_2022);
    // Kontrollsummen biter fordi `general` summeres av sine egne koder. Hadde den vært
    // en residual, ville denne testen vært sann uansett hva de andre kategoriene sa.
    expect(Math.abs(sum - FBU_TOTAL_2022)).toBeLessThanOrEqual(2);
  });

  it('lar ingen krone telles i to kategorier', () => {
    // En kode som ligger i to include-lister uten å være ekskludert i den ene ville
    // blåst kontrollsummen over 00; dette navngir feilen i stedet for å la den vise seg
    // som et avvik på noen kroner.
    const val = fbuLookup();
    const sum = COICOP_MAPPING.reduce((a, r) => a + r.include.reduce((b, c) => b + val(c), 0), 0);
    const removed = COICOP_MAPPING.reduce((a, r) => a + r.exclude.reduce((b, c) => b + val(c), 0), 0);
    expect(sum - removed).toBeLessThanOrEqual(FBU_TOTAL_2022 + 2);
  });
});

describe('profilene (Q-001 punkt 3 og 7)', () => {
  const order: ConsumptionProfileId[] = ['noktern', 'typisk', 'hoy'];

  it('stiger strengt fra nøktern til typisk til høy i hver mva-kategori', () => {
    const seeds = order.map((id) => PROFILE_SEEDS.find((s) => s.id === id)!);
    for (const cat of VAT_CATEGORIES) {
      expect(seeds[0]!.spend[cat], cat).toBeLessThan(seeds[1]!.spend[cat]);
      expect(seeds[1]!.spend[cat], cat).toBeLessThan(seeds[2]!.spend[cat]);
    }
  });

  /**
   * Mengdene avrundes til hele enheter, sa de sma varene kan sta stille mellom to
   * kvartiler (flyreiser 2/2/3, brennevin 1/1/2). Kravet er derfor ikke-synkende,
   * ikke strengt stigende — men aldri nedover.
   */
  it('lar ingen fysisk mengde gå nedover når inntekten går opp', () => {
    const seeds = order.map((id) => PROFILE_SEEDS.find((s) => s.id === id)!);
    for (const good of EXCISE_GOODS) {
      const v = seeds.map((s) => s.units[good] ?? 0);
      expect(v[0]!, good).toBeLessThanOrEqual(v[1]!);
      expect(v[1]!, good).toBeLessThanOrEqual(v[2]!);
    }
  });

  it('skalerer med ekvivalensfaktoren, ikke med hodetellingen', () => {
    expect(equivalenceFactor(1, 0)).toBe(1);
    expect(equivalenceFactor(2, 0)).toBeCloseTo(1.5, 10);
    expect(equivalenceFactor(2, 2)).toBeCloseTo(2.1, 10);

    const one = consumptionFor('typisk', 1, 0);
    const two = consumptionFor('typisk', 2, 0);
    for (const cat of VAT_CATEGORIES) {
      // Belopene rundes til naermeste hundre, derfor slingringsmonn pa 100.
      expect(Math.abs(two.spend[cat] - one.spend[cat] * 1.5), cat).toBeLessThanOrEqual(100);
    }
    expect(two.units.kwh).toBe(Math.round((one.units.kwh / 1) * 1.5));
  });

  it('gir ingen NaN og ingen negative tall for noen husholdning', () => {
    for (const id of order) {
      for (const [adults, children] of [[1, 0], [1, 3], [2, 0], [2, 4]] as const) {
        const c = consumptionFor(id, adults, children);
        for (const cat of VAT_CATEGORIES) {
          expect(Number.isFinite(c.spend[cat]), `${id} ${cat}`).toBe(true);
          expect(c.spend[cat], `${id} ${cat}`).toBeGreaterThanOrEqual(0);
        }
        for (const good of EXCISE_GOODS) {
          expect(Number.isFinite(c.units[good]), `${id} ${good}`).toBe(true);
          expect(c.units[good], `${id} ${good}`).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('holder CONSUMPTION_PROFILES og seedene i takt', () => {
    expect(CONSUMPTION_PROFILES.map((p) => p.id)).toEqual(PROFILE_SEEDS.map((s) => s.id));
  });
});

describe('provenance (Q-001 punkt 4 og 7)', () => {
  const manifestIds = new Set<string>(
    (JSON.parse(readFileSync(join(ROOT, 'sources', 'manifest.json'), 'utf8')) as { id: string }[]).map((r) => r.id),
  );

  it('finner hver manifest-id modulen viser til', () => {
    const cited = ['ssb-fbu-14100', 'ssb-fbu-14100-meta', 'ssb-fbu-14156'];
    for (const price of Object.values(UNIT_PRICES_2022)) {
      if (price.sourceId) cited.push(price.sourceId);
    }
    cited.push('ssb-06076-husholdningsstorrelse-2022', 'ssb-07459-barn-under-18-2022');
    for (const id of cited) {
      expect(manifestIds.has(id), `mangler i sources/manifest.json: ${id}`).toBe(true);
    }
  });

  /** Ingen pris uten kilde ELLER uten et eksplisitt ANSLAG i noten. Q-001: ingen tall uten begge deler. */
  it('merker hver kildelose pris som anslag', () => {
    for (const [good, price] of Object.entries(UNIT_PRICES_2022)) {
      expect(price.price, good).toBeGreaterThan(0);
      if (price.sourceId === null) {
        expect(price.note.toUpperCase(), good).toContain('ANSLAG');
      } else {
        expect(manifestIds.has(price.sourceId), good).toBe(true);
      }
    }
  });

  it('holder fast at kWh er et anslag så lenge strømstøtten er uavklart', () => {
    expect(KWH_IS_ESTIMATED).toBe(true);
  });
});
