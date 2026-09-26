import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ALCOHOL_BY_PROFILE_2022,
  ALCOHOL_SPLIT_2022,
  AVERAGE_HOUSEHOLD_EQUIVALENCE,
  COICOP_MAPPING,
  CONSUMPTION_PROFILES,
  consumptionFor,
  equivalenceFactor,
  FBU_TOTAL_2022,
  FLIGHT_PRICE_EUROPE_2022,
  FLIGHT_PRICE_OTHER_2022,
  HOUSEHOLD_SPEND_2022,
  KWH_IS_ESTIMATED,
  LONGHAUL_SPEND_SHARE,
  PROFILE_SEEDS,
  TOBACCO_BY_PROFILE_2022,
  TOBACCO_SPLIT_2022,
  UNIT_PRICES_2022,
} from '../data/consumption-profiles.ts';
import type { ProfileSeed } from '../data/consumption-profiles.ts';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { computeScenario, sanitizeProfile } from '../engine/index.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import { createProfile } from '../state/profile.ts';
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
   * Froene for liter/kWh/stk ble rundet til hele enheter da de ble utledet i Q-001, sa de
   * sma varene kan sta stille mellom to kvartiler (brennevin 1/1/2). Kravet er derfor
   * ikke-synkende, ikke strengt stigende — men aldri nedover. Flyreisene er uavrundet og
   * stiger strengt; de dekkes av kroneidentiteten under.
   */
  it('lar ingen fysisk mengde gå nedover når inntekten går opp', () => {
    const seeds = order.map((id) => PROFILE_SEEDS.find((s) => s.id === id)!);
    for (const good of EXCISE_GOODS) {
      // Ingen `?? 0`: et manglende fro skal gi undefined og ryke pa sammenligningen, ikke bli 0.
      const v = seeds.map((s) => s.units[good]);
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
    // Mengdene skaleres na eksakt med faktoren (ingen heltallsavrunding i consumptionFor),
    // sa dette er en strengere pastand enn den avrundede den erstattet.
    expect(two.units.kwh).toBeCloseTo(one.units.kwh * 1.5, 10);
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

/**
 * Q-010: feilen Q-001 ble avvist for var en KLASSE, ikke ett tall. `ProfileSeed.units` var
 * `Partial`, `consumptionFor` gjorde `?? 0`, og en avgiftsvare som manglet i et fro ble stille
 * 0. Disse tre testene lukker klassen, kroneidentiteten og veien gjennom motoren.
 */
describe('flyreiser og komplette frø (Q-010)', () => {
  const rs = resolveBaseline(ADOPTED_2026);

  function amount(profileId: ConsumptionProfileId, adults: number, children: number, id: string): number {
    const base = createProfile();
    const p = sanitizeProfile({
      ...base,
      mode: adults === 2 ? 'household' : 'person',
      adults: adults === 2 ? [base.adults[0], base.adults[0]] : [base.adults[0]],
      childrenAges: Array.from({ length: children }, () => 8),
      consumptionProfileId: profileId,
      consumption: consumptionFor(profileId, adults, children),
    });
    const c = computeScenario(p, rs, rs).components.find((x) => x.id === id);
    if (!c) throw new Error(`missing ${id}`);
    return c.amount;
  }

  // (a) Klassen: hvert frø bærer HVER nøkkel, og feilmeldingen navngir frø og nøkkel.
  it('har hver ExciseGood og hver VatCategory i hvert frø, med et endelig tall', () => {
    for (const seed of PROFILE_SEEDS) {
      for (const good of EXCISE_GOODS) {
        const v: number | undefined = seed.units[good];
        expect(v, `frø ${seed.id} mangler units.${good}`).toBeDefined();
        expect(Number.isFinite(v), `frø ${seed.id}: units.${good} er ikke et endelig tall (${String(v)})`).toBe(true);
        expect(v, `frø ${seed.id}: units.${good} er negativ`).toBeGreaterThanOrEqual(0);
      }
      for (const cat of VAT_CATEGORIES) {
        const v: number | undefined = seed.spend[cat];
        expect(v, `frø ${seed.id} mangler spend.${cat}`).toBeDefined();
        expect(Number.isFinite(v), `frø ${seed.id}: spend.${cat} er ikke et endelig tall (${String(v)})`).toBe(true);
      }
    }
  });

  /**
   * GATE (erstatter grep-sjekken fra Q-001-reviewen, som kunne lures): flightOther er varen som
   * manglet, sa den navngis. Alle tre frø skal ha en strengt positiv forventet mengde.
   */
  it('gir hvert frø et flightOther-frø større enn null', () => {
    expect(PROFILE_SEEDS.map((s) => s.id)).toEqual(['noktern', 'typisk', 'hoy']);
    for (const seed of PROFILE_SEEDS) {
      expect(seed.units.flightOther, `frø ${seed.id}: flightOther`).toBeGreaterThan(0);
      expect(seed.units.flightEurope, `frø ${seed.id}: flightEurope`).toBeGreaterThan(0);
    }
  });

  /**
   * GATE for typen: `ProfileSeed.units` er `Record<ExciseGood, number>`, ikke `Partial`. Et frø uten
   * flightOther skal avvises av tsc. Blir `units` `Partial` igjen, er direktivet under ubrukt og
   * `npm run typecheck` feiler med TS2578 — det er meningen.
   */
  it('lar tsc avvise et frø uten flightOther', () => {
    // @ts-expect-error — flightOther mangler, og det skal være en typefeil.
    const missing: ProfileSeed['units'] = {
      petrolLitre: 1,
      dieselLitre: 1,
      kwh: 1,
      flightEurope: 1,
      beerLitre: 1,
      wineLitre: 1,
      spiritsLitre: 1,
      cigarette: 1,
      snusGram: 1,
    };
    expect(Object.keys(missing)).not.toContain('flightOther');
  });

  // (b) Kronene DELES, de legges ikke til.
  it('deler flykronene: europa x pris + utenfor x pris = spend.flights', () => {
    for (const seed of PROFILE_SEEDS) {
      const recomposed =
        seed.units.flightEurope * FLIGHT_PRICE_EUROPE_2022 + seed.units.flightOther * FLIGHT_PRICE_OTHER_2022;
      expect(Math.abs(recomposed - seed.spend.flights), `frø ${seed.id}`).toBeLessThanOrEqual(1);
    }
    // Og andelen er den som er oppgitt, ikke en som har glidd.
    for (const seed of PROFILE_SEEDS) {
      const longhaulKr = seed.units.flightOther * FLIGHT_PRICE_OTHER_2022;
      expect(longhaulKr / seed.spend.flights, `frø ${seed.id}`).toBeCloseTo(LONGHAUL_SPEND_SHARE, 10);
    }
    // Prisene er anslag, men de skal være ULIKE: samme pris for begge var det sikre feilsvaret.
    expect(FLIGHT_PRICE_OTHER_2022).toBeGreaterThan(FLIGHT_PRICE_EUROPE_2022);
    expect(UNIT_PRICES_2022.flightEurope!.price).toBe(FLIGHT_PRICE_EUROPE_2022);
    expect(UNIT_PRICES_2022.flightOther!.price).toBe(FLIGHT_PRICE_OTHER_2022);
  });

  /**
   * (c) Gjennom motoren, med EKSAKT forventet belop — ikke `> 0`. Testen gar via `sanitizeProfile`
   * og `computeScenario`, altsa hele avrundingskjeden. Handregning, «Høyt», 2 voksne + 2 barn:
   *
   *   spend.flights i hoy-frøet     = 4 500 kr per voksen-ekvivalent (FBU 14156, kvartil 44)
   *   flightOther per ekvivalent    = 4 500 x 0,2 / 7 500           = 0,12 avreiser
   *   flightEurope per ekvivalent   = 4 500 x 0,8 / 1 500           = 2,4 avreiser
   *   ekvivalensfaktor 2v + 2b      = 1 + 0,5 + 0,3 x 2             = 2,1
   *   flightOther for husholdningen = 0,12 x 2,1                    = 0,252 avreiser
   *   flightEurope for husholdningen= 2,4 x 2,1                     = 5,04 avreiser
   *   excise.flightOther            = 0,252 x 350 kr = 88,2         -> 88 kr
   *   excise.flightEurope           = 5,04 x 61 kr   = 307,44       -> 307 kr
   *
   * Flypassasjeravgiften har ingen mva oppa (`VAT_ON_EXCISE.flightOther === null`), sa
   * komponentbelopet er avgiften selv. 350 og 61 kr er vedtatte satser i `adopted.ts`.
   * Med heltallsavrunding av mengden (feilen Q-001 ble avvist for) ville 0,252 blitt 0 og
   * avgiften 0 kr.
   */
  it('lar «Høyt» med 2 voksne og 2 barn betale nøyaktig 88 kr flypassasjeravgift utenfor Europa', () => {
    expect(consumptionFor('hoy', 2, 2).units.flightOther).toBeCloseTo(0.252, 12);
    expect(amount('hoy', 2, 2, 'excise.flightOther')).toBe(88);
    expect(amount('hoy', 2, 2, 'excise.flightEurope')).toBe(307);
  });

  /** Tallet i metodesiden og i METHODOLOGY.md er det samme tallet motoren gir, ikke en kopi som kan gli. */
  it('står med samme mengde og samme beløp i MethodView og METHODOLOGY.md', () => {
    const units = consumptionFor('hoy', 2, 2).units.flightOther;
    const phrase = `${units.toFixed(3).replace('.', ',')} forventede avreiser utenfor Europa i året, altså ${amount('hoy', 2, 2, 'excise.flightOther')} kr i avgift`;
    expect(phrase).toBe('0,252 forventede avreiser utenfor Europa i året, altså 88 kr i avgift');
    for (const file of [join('src', 'views', 'MethodView.tsx'), 'METHODOLOGY.md']) {
      const text = readFileSync(join(ROOT, file), 'utf8').replace(/\s+/g, ' ');
      expect(text, file).toContain(phrase);
    }
  });

  /**
   * Mengder er forventningsverdier og skal overleve `sanitizeProfile` som desimaltall. En kvart reise
   * i aret er 0,25 x 350 = 87,5 kr -> 88 kr (halv bort fra null). Ugyldige mengder blir 0, ikke NaN.
   */
  it('beholder 0,25 reiser gjennom sanitizeProfile og gir 88 kr', () => {
    const base = createProfile();
    const units = { ...base.consumption.units, flightOther: 0.25 };
    const clean = sanitizeProfile({ ...base, consumption: { ...base.consumption, units } });
    expect(clean.consumption.units.flightOther).toBe(0.25);
    const c = computeScenario(clean, rs, rs).components.find((x) => x.id === 'excise.flightOther');
    expect(c?.amount).toBe(88);

    const odd = sanitizeProfile({
      ...base,
      consumption: { ...base.consumption, units: { ...base.consumption.units, flightOther: -1, flightEurope: Number.NaN, kwh: 1.5 } },
    });
    expect(odd.consumption.units.flightOther).toBe(0);
    expect(odd.consumption.units.flightEurope).toBe(0);
    expect(odd.consumption.units.kwh).toBe(1.5);
  });

  it('gir hver profil og hver husholdning en flightOther-avgift over null', () => {
    for (const id of ['noktern', 'typisk', 'hoy'] as const) {
      for (const [adults, children] of [[1, 0], [1, 2], [2, 0], [2, 2]] as const) {
        expect(amount(id, adults, children, 'excise.flightOther'), `${id} ${adults}v${children}b`).toBeGreaterThan(0);
      }
    }
  });
});

/**
 * Tobakk (Codex-kontrollen 2026-09-26): sigarett- og snusmengdene skal komme fra 14100s egne
 * underkoder, ikke fra en stille 50/50-deling. Testen gar til begge rafilene.
 */
describe('tobakks- og alkoholdelingen (14100 02.x.x, 14156 02.1 og 02.3)', () => {
  function raw14100(code: string): number | null {
    const raw = JSON.parse(readFileSync(join(ROOT, 'sources', 'raw', 'ssb-fbu-14100.json'), 'utf8'));
    const i: number = raw.dimension.VareTjenesteGruppe.category.index[code];
    const contents = Object.keys(raw.dimension.ContentsCode.category.index).length;
    return raw.value[i * contents + raw.dimension.ContentsCode.category.index.Utgift];
  }
  function raw14156(code: string, quartile: string): number {
    const raw = JSON.parse(readFileSync(join(ROOT, 'sources', 'raw', 'ssb-fbu-14156.json'), 'utf8'));
    const dim = raw.dimension;
    const g: number = dim.VareTjenesteGruppe.category.index[code];
    const q: number = dim.InntektForbrEnhet.category.index[quartile];
    const nQ = Object.keys(dim.InntektForbrEnhet.category.index).length;
    return raw.value[g * nQ + q];
  }

  it('henter sigarett/snus-kronene fra 14100 og kvartilenes tobakk fra 14156', () => {
    expect(raw14100('02.3.0.1')).toBe(TOBACCO_SPLIT_2022.cigarette);
    expect(raw14100('02.3.0.9')).toBe(TOBACCO_SPLIT_2022.snusOther);
    expect(raw14100('02.3')).toBe(TOBACCO_SPLIT_2022.tobaccoTotal);
    expect(raw14100('02.3.0.2')).toBeNull(); // sigarer skjult; 12 kr fordeles ikke
    for (const seed of PROFILE_SEEDS) {
      expect(raw14156('02.3', seed.quartile), seed.id).toBe(TOBACCO_BY_PROFILE_2022[seed.id]);
    }
  });

  it('gir sigarett- og snusmengder = kvartilens tobakk x 14100-andel / 1,4713 / pris, rundet', () => {
    const { cigarette, snusOther, tobaccoTotal } = TOBACCO_SPLIT_2022;
    for (const seed of PROFILE_SEEDS) {
      const t = TOBACCO_BY_PROFILE_2022[seed.id];
      const cig = Math.round((t * cigarette) / tobaccoTotal / AVERAGE_HOUSEHOLD_EQUIVALENCE / UNIT_PRICES_2022.cigarette!.price);
      const snus = Math.round((t * snusOther) / tobaccoTotal / AVERAGE_HOUSEHOLD_EQUIVALENCE / UNIT_PRICES_2022.snus!.price);
      expect(seed.units.cigarette, `${seed.id} cigarette`).toBe(cig);
      expect(seed.units.snusGram, `${seed.id} snusGram`).toBe(snus);
    }
    // Handregnet: 109/226, 147/303, 151/311.
    expect(PROFILE_SEEDS.map((s) => [s.units.cigarette, s.units.snusGram])).toEqual([
      [109, 226],
      [147, 303],
      [151, 311],
    ]);
  });

  it('henter alkoholkronene fra 14100 og kvartilenes alkohol fra 14156', () => {
    expect(raw14100('02.1.1')).toBe(ALCOHOL_SPLIT_2022.spirits);
    expect(raw14100('02.1.2')).toBe(ALCOHOL_SPLIT_2022.wine);
    expect(raw14100('02.1.3')).toBe(ALCOHOL_SPLIT_2022.beer);
    expect(raw14100('02.1.9')).toBe(ALCOHOL_SPLIT_2022.otherAlcohol); // ingen avgiftsvare; fordeles ikke
    expect(raw14100('02.1')).toBe(ALCOHOL_SPLIT_2022.alcoholTotal);
    for (const seed of PROFILE_SEEDS) {
      expect(raw14156('02.1', seed.quartile), seed.id).toBe(ALCOHOL_BY_PROFILE_2022[seed.id]);
    }
  });

  /**
   * Regnet om fra rafilene, uavhengig av modulens hjelpefunksjon: kvartilens 02.1 (14156) x
   * underkodens andel av 02.1 (14100) / 1,4713 / pris (52 / 150 / 500 kr per liter, anslag).
   * Eks. «Nøkternt» ol: 4 733 x 3 099 / 8 888 / 1,4713 / 52 = 21,570 liter.
   */
  it('gir øl/vin/brennevin = kvartilens alkohol x 14100-andel / 1,4713 / pris, uavrundet', () => {
    const codes = { beerLitre: ['02.1.3', 52], wineLitre: ['02.1.2', 150], spiritsLitre: ['02.1.1', 500] } as const;
    for (const seed of PROFILE_SEEDS) {
      for (const [good, [code, price]] of Object.entries(codes) as [keyof typeof codes, (typeof codes)[keyof typeof codes]][]) {
        expect(UNIT_PRICES_2022[good.replace('Litre', '')]!.price).toBe(price);
        const expected = (raw14156('02.1', seed.quartile) * raw14100(code)!) / raw14100('02.1')! / 1.4713 / price;
        expect(seed.units[good], `${seed.id} ${good}`).toBeCloseTo(expected, 10);
      }
    }
    const pinned = PROFILE_SEEDS.map((s) => [s.units.beerLitre, s.units.wineLitre, s.units.spiritsLitre].map((v) => Number(v.toFixed(3))));
    expect(pinned).toEqual([
      [21.57, 11.128, 0.727],
      [40.506, 20.898, 1.365],
      [60.431, 31.177, 2.036],
    ]);
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
