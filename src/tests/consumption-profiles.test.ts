import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  COICOP_MAPPING,
  FBU_TOTAL_2022,
  HOUSEHOLD_SPEND_2022,
} from '../data/consumption-profiles.ts';
import { VAT_CATEGORIES } from '../types/index.ts';

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
