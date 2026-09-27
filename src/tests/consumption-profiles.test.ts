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
  ENERGY_BY_PROFILE_2022,
  equivalenceFactor,
  FBU_TOTAL_2022,
  FLIGHT_PRICE_EUROPE_2022,
  FLIGHT_PRICE_OTHER_2022,
  HOUSEHOLD_SPEND_2022,
  KPI_2026_MONTHS,
  KPI_MONTHLY_SUMS,
  KWH_PER_HOUSEHOLD_2022,
  LONGHAUL_SPEND_SHARE,
  PRICE_INDEX_MAPPING,
  PRICE_UPLIFT_2022_2026,
  PROFILE_SEEDS,
  TOBACCO_BY_PROFILE_2022,
  TOBACCO_SPLIT_2022,
  UNIT_PRICES_2022,
} from '../data/consumption-profiles.ts';
import type { ProfileSeed } from '../data/consumption-profiles.ts';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { DATA_BUNDLE } from '../data/index.ts';
import { calculateParty, computeScenario, sanitizeProfile } from '../engine/index.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import { createProfile, profileReducer } from '../state/profile.ts';
import type { ConsumptionProfileId, PartyId, PriceYear, UserProfile, VatCategory } from '../types/index.ts';
import { DEFAULT_TOGGLES, EXCISE_GOODS, PRICE_YEARS, VAT_CATEGORIES } from '../types/index.ts';
import { profile as fixtureProfile } from './fixtures.ts';

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

    const one = consumptionFor('typisk', 1, 0, 2022);
    const two = consumptionFor('typisk', 2, 0, 2022);
    for (const cat of VAT_CATEGORIES) {
      // Belopene rundes til naermeste hundre, derfor slingringsmonn pa 100.
      expect(Math.abs(two.spend[cat] - one.spend[cat] * 1.5), cat).toBeLessThanOrEqual(100);
    }
    // Mengdene skaleres na eksakt med faktoren (ingen heltallsavrunding i consumptionFor),
    // sa dette er en strengere pastand enn den avrundede den erstattet.
    expect(two.units.kwh).toBeCloseTo(one.units.kwh * 1.5, 10);
  });

  it('gir ingen NaN og ingen negative tall for noen husholdning, i noe prisår', () => {
    for (const priceYear of PRICE_YEARS) {
      for (const id of order) {
        for (const [adults, children] of [[1, 0], [1, 3], [2, 0], [2, 4]] as const) {
          const c = consumptionFor(id, adults, children, priceYear);
          for (const cat of VAT_CATEGORIES) {
            expect(Number.isFinite(c.spend[cat]), `${priceYear} ${id} ${cat}`).toBe(true);
            expect(c.spend[cat], `${priceYear} ${id} ${cat}`).toBeGreaterThanOrEqual(0);
          }
          for (const good of EXCISE_GOODS) {
            expect(Number.isFinite(c.units[good]), `${priceYear} ${id} ${good}`).toBe(true);
            expect(c.units[good], `${priceYear} ${id} ${good}`).toBeGreaterThanOrEqual(0);
          }
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
      consumption: consumptionFor(profileId, adults, children, base.priceYear),
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
    expect(consumptionFor('hoy', 2, 2, 2026).units.flightOther).toBeCloseTo(0.252, 12);
    expect(amount('hoy', 2, 2, 'excise.flightOther')).toBe(88);
    expect(amount('hoy', 2, 2, 'excise.flightEurope')).toBe(307);
  });

  /** Tallet i metodesiden og i METHODOLOGY.md er det samme tallet motoren gir, ikke en kopi som kan gli. */
  it('står med samme mengde og samme beløp i MethodView og METHODOLOGY.md', () => {
    const units = consumptionFor('hoy', 2, 2, 2026).units.flightOther;
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
    const cited = [
      'ssb-fbu-14100',
      'ssb-fbu-14100-meta',
      'ssb-fbu-14156',
      'ssb-10572-energibruk-husholdninger-2022',
      'ssb-energibruk-husholdningene-2022',
    ];
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

  it('gir kWh ingen pris, så ingen kan dele 04.5.1-kroner på en strømpris igjen', () => {
    expect(UNIT_PRICES_2022.kwh).toBeUndefined();
  });
});

describe('kWh fra SSB-tabell 10572, ikke kroner delt på strømpris (L11)', () => {
  function raw10572(carrier: string, contents: string): number {
    const raw = JSON.parse(readFileSync(join(ROOT, 'sources', 'raw', 'ssb-10572-energibruk-husholdninger-2022.json'), 'utf8'));
    const dim = raw.dimension;
    expect(Object.keys(dim.Tid.category.index)).toEqual(['2022']);
    const c: number = dim.Energibaerer.category.index[carrier];
    const k: number = dim.ContentsCode.category.index[contents];
    const nK = Object.keys(dim.ContentsCode.category.index).length;
    return raw.value[c * nK + k];
  }
  function raw14156(code: string, quartile: string): number {
    const raw = JSON.parse(readFileSync(join(ROOT, 'sources', 'raw', 'ssb-fbu-14156.json'), 'utf8'));
    const dim = raw.dimension;
    const g: number = dim.VareTjenesteGruppe.category.index[code];
    const q: number = dim.InntektForbrEnhet.category.index[quartile];
    return raw.value[g * Object.keys(dim.InntektForbrEnhet.category.index).length + q];
  }

  it('henter 14 964 kWh elektrisitet per husholdning 2022 fra den arkiverte 10572-filen', () => {
    expect(raw10572('1.1', 'Forbruk')).toBe(KWH_PER_HOUSEHOLD_2022);
    expect(KWH_PER_HOUSEHOLD_2022).toBe(14_964);
  });

  it('henter kvartilenes 04.5 fra 14156', () => {
    for (const seed of PROFILE_SEEDS) {
      expect(raw14156('04.5', seed.quartile), seed.id).toBe(ENERGY_BY_PROFILE_2022[seed.id]);
    }
  });

  /** kWh_2022 x 04.5_kvartil / 04.5_alle / 1,4713, rundet. Eks. «Høyt»: 14 964 x 47 416 / 36 042 / 1,4713 = 13 380,2. */
  it('gir kWh-frøene = 10572-kWh x kvartilens 04.5-andel / 1,4713, rundet', () => {
    for (const seed of PROFILE_SEEDS) {
      const expected = Math.round(
        (raw10572('1.1', 'Forbruk') * raw14156('04.5', seed.quartile)) / raw14156('04.5', '0') / 1.4713,
      );
      expect(seed.units.kwh, seed.id).toBe(expected);
    }
    expect(PROFILE_SEEDS.map((s) => s.units.kwh)).toEqual([7_545, 10_171, 13_380]);
  });

  it('står på SSBs egen setning om at strømstøtten er trukket fra når FBU-utgiften regnes om', () => {
    const text = readFileSync(join(ROOT, 'sources', 'text', 'ssb-energibruk-husholdningene-2022.txt'), 'utf8');
    expect(text).toContain('mens strømstøtte er trukket i fra');
    expect(text).toContain('For 2022 så er strømforbruket for 2813 husholdninger , altså 80 prosent, basert på tall fra Elhub');
  });
});

/**
 * Prisløftet 2022 -> 2026 (sprint 2026-10 lane L7, beslutning D4). Faktorene regnes om igjen fra
 * den arkiverte 14700-filen, ikke fra modulens egne tall.
 */
describe('prisløft 2022 -> 2026 fra SSB-tabell 14700 (D4)', () => {
  const kpi = JSON.parse(readFileSync(join(ROOT, 'sources', 'raw', 'ssb-kpi-14700.json'), 'utf8'));
  const dim = kpi.dimension;
  const groups: string[] = Object.keys(dim.VareTjenesteGrp.category.index);
  const contents: string[] = Object.keys(dim.ContentsCode.category.index);
  const months: string[] = Object.keys(dim.Tid.category.index);
  /** json-stat2: verdien ligger på (gruppe, statistikkvariabel, måned) i radrekkefølge. */
  function index(group: string, month: string): number {
    const g = dim.VareTjenesteGrp.category.index[group];
    const c = dim.ContentsCode.category.index.KpiIndMnd;
    const t = dim.Tid.category.index[month];
    if (g === undefined || t === undefined) throw new Error(`mangler i 14700-arkivet: ${group} ${month}`);
    const v = kpi.value[(g * contents.length + c) * months.length + t];
    if (typeof v !== 'number') throw new Error(`ingen indeks for ${group} ${month}`);
    return v;
  }
  const months2022 = months.filter((m) => m.startsWith('2022'));
  const months2026 = months.filter((m) => m.startsWith('2026'));
  const mean = (group: string, ms: readonly string[]) => ms.reduce((a, m) => a + index(group, m), 0) / ms.length;
  const factorFromArchive = (group: string) => mean(group, months2026) / mean(group, months2022);

  it('bruker alle tolv 2022-måneder og hver 2026-måned SSB hadde publisert ved henting', () => {
    expect(dim.ContentsCode.category.unit.KpiIndMnd.base).toBe('indeks');
    expect(months2022).toEqual(Array.from({ length: 12 }, (_, i) => `2022M${String(i + 1).padStart(2, '0')}`));
    expect(months2026).toEqual([...KPI_2026_MONTHS]);
    // Metadatafilen hentet samme minutt: siste publiserte måned er siste måned i løftet.
    const meta = JSON.parse(readFileSync(join(ROOT, 'sources', 'raw', 'ssb-kpi-14700.meta.json'), 'utf8'));
    const tid: string[] = meta.variables.find((v: { code: string }) => v.code === 'Tid').values;
    expect(tid.at(-1)).toBe(KPI_2026_MONTHS.at(-1));
    expect(KPI_2026_MONTHS.at(-1)).toBe('2026M08');
  });

  it('bruker 14700 fordi 03013 er avsluttet i 2025M12 og ikke har noen 2026-indeks', () => {
    const meta = JSON.parse(readFileSync(join(ROOT, 'sources', 'raw', 'ssb-kpi-03013.meta.json'), 'utf8'));
    const tid: string[] = meta.variables.find((v: { code: string }) => v.code === 'Tid').values;
    expect(tid.at(-1)).toBe('2025M12');
    expect(tid.some((m) => m.startsWith('2026'))).toBe(false);
  });

  it('dekker hver VatCategory én gang, med en gruppe som finnes i arkivet', () => {
    const covered = PRICE_INDEX_MAPPING.map((r) => r.category).sort();
    expect(covered).toEqual([...VAT_CATEGORIES].sort());
    expect(new Set(covered).size).toBe(covered.length);
    for (const rule of PRICE_INDEX_MAPPING) {
      expect(groups, `${rule.category} -> ${rule.group}`).toContain(rule.group);
      expect(PRICE_UPLIFT_2022_2026[rule.category], rule.category).toBeDefined();
    }
  });

  it('bruker samme COICOP 2018-kode som FBU-kronene der kategorien er én gruppe', () => {
    // 14700 og 14100 følger begge COICOP 2018. Der COICOP_MAPPING er én kode uten unntak, skal
    // prisindeksen være den samme koden, ikke en nabo.
    for (const rule of COICOP_MAPPING) {
      if (rule.include.length !== 1 || rule.exclude.length !== 0) continue;
      const price = PRICE_INDEX_MAPPING.find((r) => r.category === rule.category);
      expect(price?.group, rule.category).toBe(rule.include[0]);
    }
    // De tre som ikke er én gruppe, og hva de får i stedet.
    const group = (c: VatCategory) => PRICE_INDEX_MAPPING.find((r) => r.category === c)?.group;
    expect([group('transportServices'), group('general'), group('exempt')]).toEqual(['07.3', '00', '00']);
  });

  it('har summene i KPI_MONTHLY_SUMS fra den arkiverte filen', () => {
    for (const [group, sums] of Object.entries(KPI_MONTHLY_SUMS)) {
      expect(mean(group, months2022) * 12, `${group} 2022`).toBeCloseTo(sums.sum2022, 9);
      expect(mean(group, months2026) * months2026.length, `${group} 2026`).toBeCloseTo(sums.sum2026, 9);
    }
  });

  /**
   * Hver faktor regnet om fra rafilen, og festet med fire desimaler regnet for hånd:
   *
   *   mat          01      819,0 / 8 = 102,3750   982,8 / 12 = 81,9000   -> 1,2500
   *   alkohol/tob. 02      821,7 / 8 = 102,7125  1053,4 / 12 = 87,7833   -> 1,1701
   *   strøm        04.5.1  833,2 / 8 = 104,1500  1352,8 / 12 = 112,7333  -> 0,9239
   *   drivstoff    07.2.2  805,6 / 8 = 100,7000  1273,8 / 12 = 106,1500  -> 0,9487
   *   fly          07.3.3  798,4 / 8 =  99,8000   795,3 / 12 = 66,2750   -> 1,5058
   *   kollektiv    07.3    814,1 / 8 = 101,7625   997,4 / 12 = 83,1167   -> 1,2243
   *   øvrig, fritt 00      822,1 / 8 = 102,7625  1069,9 / 12 = 89,1583   -> 1,1526
   */
  it('gir hver faktor = snitt 2026 / snitt 2022 regnet fra rafilen', () => {
    for (const rule of PRICE_INDEX_MAPPING) {
      expect(PRICE_UPLIFT_2022_2026[rule.category], rule.category).toBeCloseTo(factorFromArchive(rule.group), 12);
    }
    const pinned = Object.fromEntries(VAT_CATEGORIES.map((c) => [c, Number(PRICE_UPLIFT_2022_2026[c]!.toFixed(4))]));
    expect(pinned).toEqual({
      food: 1.25,
      general: 1.1526,
      transportServices: 1.2243,
      electricity: 0.9239,
      fuel: 0.9487,
      alcoholTobacco: 1.1701,
      flights: 1.5058,
      exempt: 1.1526,
    });
  });

  it('løfter kronene i 2026 og lar dem stå i 2022, rundet til nærmeste hundre én gang', () => {
    // «Typisk», én voksen: 2022 = frøet selv. 2026, mat: 44 700 x 1,25 = 55 875 -> 55 900;
    // strøm: 21 900 x 0,923862 = 20 232,6 -> 20 200 (under 2022: krisepris i 2022).
    expect(consumptionFor('typisk', 1, 0, 2022).spend.food).toBe(44_700);
    expect(consumptionFor('typisk', 1, 0, 2026).spend.food).toBe(55_900);
    expect(consumptionFor('typisk', 1, 0, 2022).spend.electricity).toBe(21_900);
    expect(consumptionFor('typisk', 1, 0, 2026).spend.electricity).toBe(20_200);
    for (const seed of PROFILE_SEEDS) {
      for (const [adults, children] of [[1, 0], [2, 2]] as const) {
        const eq = equivalenceFactor(adults, children);
        const c22 = consumptionFor(seed.id, adults, children, 2022);
        const c26 = consumptionFor(seed.id, adults, children, 2026);
        for (const rule of PRICE_INDEX_MAPPING) {
          const cat = rule.category;
          expect(c22.spend[cat], `${seed.id} ${cat} 2022`).toBe(Math.round((seed.spend[cat] * eq) / 100) * 100);
          expect(c26.spend[cat], `${seed.id} ${cat} 2026`).toBe(
            Math.round((seed.spend[cat] * eq * factorFromArchive(rule.group)) / 100) * 100,
          );
        }
      }
    }
  });

  const rs = resolveBaseline(ADOPTED_2026);

  it('løfter aldri mengdene, og ingen særavgiftslinje flytter seg mellom prisårene', () => {
    for (const seed of PROFILE_SEEDS) {
      for (const [adults, children] of [[1, 0], [1, 2], [2, 0], [2, 2]] as const) {
        const scenario = (priceYear: PriceYear) => {
          const base = createProfile();
          const p = sanitizeProfile({
            ...base,
            mode: adults === 2 ? 'household' : 'person',
            adults: adults === 2 ? [base.adults[0], base.adults[0]] : [base.adults[0]],
            childrenAges: Array.from({ length: children }, () => 8),
            consumptionProfileId: seed.id,
            priceYear,
            consumption: consumptionFor(seed.id, adults, children, priceYear),
          });
          return { units: p.consumption.units, components: computeScenario(p, rs, rs).components };
        };
        const a = scenario(2026);
        const b = scenario(2022);
        const label = `${seed.id} ${adults}v${children}b`;
        const excise = (s: typeof a) =>
          s.components.filter((c) => c.id.startsWith('excise.')).map((c) => `${c.id} ${c.amount} kr`);
        expect(excise(a).length, label).toBe(EXCISE_GOODS.length);
        expect(excise(a), label).toEqual(excise(b));
        expect(a.units, label).toEqual(b.units);
        // Og mva-linjene flytter seg faktisk — ellers ville testen over vært sann uansett.
        expect(a.components.find((c) => c.id === 'vat.food')!.amount, label).toBeGreaterThan(
          b.components.find((c) => c.id === 'vat.food')!.amount,
        );
      }
    }
  });

  /**
   * Matmoms-deltaen skalerer med matfaktoren (1,25) innenfor 100-kr-avrundingen av kronene.
   * «Typisk», to voksne og to barn, gjennom reduceren (mode, addChild x 2, consumptionProfile):
   *
   *   frø mat 44 700 x ekvivalens 2,1       = 93 870
   *   2022: -> 93 900 kr     netto 93 900 / 1,15 = 81 652,17 -> 81 652
   *   2026: 93 870 x 1,25 = 117 337,5 -> 117 300 kr   netto 117 300 / 1,15 = 102 000
   *   referanse 15 %: 2022 81 652 x 0,15 = 12 247,8 -> 12 248;  2026 102 000 x 0,15 = 15 300
   *   FrP 7,5 %:      2022 6 123,9 -> 6 124, delta 6 124;       2026 7 650, delta 7 650
   *   Sp 10 %:        2022 8 165,2 -> 8 165, delta 4 083;       2026 10 200, delta 5 100
   *
   * Grensen: hver krone-sum er høyst 50 kr fra det uavrundede, så |kr2026 - 1,25 x kr2022| <=
   * 50 + 1,25 x 50 = 112,5 kr forbruk; det gir høyst 112,5 x |satsendring| / 1,15 i delta, pluss
   * én krone avrunding per komponent (to i 2026, to ganger 1,25 i 2022).
   */
  function typicalFamily(priceYear: PriceYear): UserProfile {
    let p = createProfile();
    p = profileReducer(p, { type: 'mode', mode: 'household' });
    p = profileReducer(p, { type: 'addChild' });
    p = profileReducer(p, { type: 'addChild' });
    return profileReducer(p, { type: 'consumptionProfile', id: 'typisk', priceYear });
  }
  function foodDelta(party: PartyId, priceYear: PriceYear): number {
    const r = calculateParty(typicalFamily(priceYear), party, DATA_BUNDLE, DEFAULT_TOGGLES);
    const c = r.components.find((x) => x.id === 'vat.food');
    if (!c) throw new Error(`${party}: vat.food mangler`);
    return c.keptDelta;
  }

  it('lar FrPs og Sps matmoms-delta skalere med matfaktoren innenfor avrundingen', () => {
    const food = PRICE_UPLIFT_2022_2026.food!;
    expect(food).toBeCloseTo(1.25, 12); // 102,375 / 81,9, eksakt 1,25 i desimaler
    expect(typicalFamily(2022).consumption.spend.food).toBe(93_900);
    expect(typicalFamily(2026).consumption.spend.food).toBe(117_300);
    const cases = [
      ['frp', 0.15 - 0.075, 6_124, 7_650],
      ['sp', 0.15 - 0.1, 4_083, 5_100],
    ] as const;
    for (const [party, rateCut, d2022, d2026] of cases) {
      expect(foodDelta(party, 2022), `${party} 2022`).toBe(d2022);
      expect(foodDelta(party, 2026), `${party} 2026`).toBe(d2026);
      const bound = ((50 + food * 50) * rateCut) / 1.15 + 2 + 2 * food;
      expect(Math.abs(d2026 - food * d2022), party).toBeLessThanOrEqual(bound);
    }
  });

  /** Tallene i METHODOLOGY.md og MethodView er tallene koden gir, ikke kopier som kan gli. */
  it('står med samme faktorer, måneder og matmoms-deltaer i METHODOLOGY.md og MethodView', () => {
    const three = (x: number) => x.toFixed(3).replace('.', ',');
    const krs = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const md = readFileSync(join(ROOT, 'METHODOLOGY.md'), 'utf8').replace(/\s+/g, ' ');
    const view = readFileSync(join(ROOT, 'src', 'views', 'MethodView.tsx'), 'utf8').replace(/\s+/g, ' ');
    // Boolske sjekker, sa en feil navngir frasen og ikke dumper hele dokumentet.
    const phrases: [string, string][] = PRICE_INDEX_MAPPING.map((rule) => [
      md,
      `(${rule.group}) ${three(PRICE_UPLIFT_2022_2026[rule.category]!)}`,
    ]);
    const food = (y: PriceYear) => krs(typicalFamily(y).consumption.spend.food);
    phrases.push(
      [md, 'januar–august 2026'],
      [view, 'januar–august 2026'],
      [view, `Mat løftes med ${three(PRICE_UPLIFT_2022_2026.food!)} og strøm med ${three(PRICE_UPLIFT_2022_2026.electricity!)}`],
      [md, `matkronene fra ${food(2022)} til ${food(2026)} kr`],
      [md, `FrPs matmoms-lettelse fra ${krs(foodDelta('frp', 2022))} til ${krs(foodDelta('frp', 2026))} kr`],
      [md, `Sps fra ${krs(foodDelta('sp', 2022))} til ${krs(foodDelta('sp', 2026))} kr`],
    );
    expect(KPI_2026_MONTHS).toHaveLength(8);
    for (const [text, phrase] of phrases) {
      expect(text.includes(phrase), `${text === md ? 'METHODOLOGY.md' : 'MethodView.tsx'} mangler «${phrase}»`).toBe(true);
    }
  });

  it('lar egne beløp stå når prisåret ikke kan byttes, og når husholdningen endres', () => {
    let p = typicalFamily(2026);
    p = profileReducer(p, { type: 'spend', category: 'food', value: 70_000 });
    expect(p.consumptionProfileId).toBe('custom');
    expect(p.priceYear).toBe(2026);
    const typed = p.consumption;
    // Husholdningen endres: egne beløp skaleres ikke og løftes ikke.
    p = profileReducer(p, { type: 'addChild' });
    expect(p.consumption).toEqual(typed);
    expect(p.consumption.spend.food).toBe(70_000);
    // Prisåret byttes bare ved å så inn en profil; å velge en profil er å forkaste egne beløp med vilje.
    const reseeded = profileReducer(p, { type: 'consumptionProfile', id: 'typisk', priceYear: 2022 });
    expect(reseeded.consumptionProfileId).toBe('typisk');
    expect(reseeded.priceYear).toBe(2022);
  });

  it('bytter prisår og beholder profilen når en standardprofil er valgt', () => {
    const p26 = typicalFamily(2026);
    const p22 = profileReducer(p26, { type: 'consumptionProfile', id: 'typisk', priceYear: 2022 });
    expect(p22.consumptionProfileId).toBe('typisk');
    expect(p22.consumption).toEqual(consumptionFor('typisk', 2, 2, 2022));
    // Uten priceYear beholder et profilbytte gjeldende prisår.
    const hoy = profileReducer(p22, { type: 'consumptionProfile', id: 'hoy' });
    expect(hoy.priceYear).toBe(2022);
    expect(hoy.consumption).toEqual(consumptionFor('hoy', 2, 2, 2022));
    // Og en endret husholdning sås inn i gjeldende prisår.
    expect(profileReducer(hoy, { type: 'addChild' }).consumption).toEqual(consumptionFor('hoy', 2, 3, 2022));
  });

  it('slipper prisåret gjennom sanitizeProfile, createProfile og testhjelperen', () => {
    expect(createProfile().priceYear).toBe(2026);
    expect(createProfile().consumption).toEqual(consumptionFor('typisk', 1, 0, 2026));
    expect(fixtureProfile().priceYear).toBe(2026);
    expect(sanitizeProfile({ ...createProfile(), priceYear: 2022 }).priceYear).toBe(2022);
    expect(sanitizeProfile({ ...createProfile(), priceYear: 2026 }).priceYear).toBe(2026);
    for (const junk of [undefined, 2025, '2022', Number.NaN, null]) {
      const p = { ...createProfile(), priceYear: junk } as unknown as UserProfile;
      expect(sanitizeProfile(p).priceYear, String(junk)).toBe(2026);
    }
    // Motoren leser ikke prisåret: samme forbruk gir samme skatt uansett merkelapp.
    const base = createProfile();
    const a = computeScenario(sanitizeProfile({ ...base, priceYear: 2026 }), rs, rs);
    const b = computeScenario(sanitizeProfile({ ...base, priceYear: 2022 }), rs, rs);
    expect(a).toEqual(b);
  });
});
