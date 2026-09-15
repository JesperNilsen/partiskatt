import { kr } from '../engine/money.ts';
import type { Consumption, ConsumptionProfileId, ExciseGood, Kroner, VatCategory } from '../types/index.ts';
import { EXCISE_GOODS, VAT_CATEGORIES } from '../types/index.ts';

/**
 * Forbruksprofilene, utledet av SSBs forbruksundersøkelse (FBU) 2022.
 *
 * Kilde: StatBank-tabell 14100, arkivert som `ssb-fbu-14100` i `sources/manifest.json`
 * (json-stat2, 510 COICOP-2018-grupper x `Utgift` i kr per husholdning per ar, 2022).
 * Hvert tall her er utledet av den arkiverte filen, ikke skrevet for hand: se
 * `COICOP_MAPPING` under, og testen i `src/tests/consumption-profiles.test.ts`, som
 * regner kartleggingen om igjen fra rafilen og feiler hvis et tall her har glidd.
 *
 * Alt i datalaget er `estimated` inntil operatorport 3 (Skatteetaten-kryssjekk).
 * Profilene inngar ikke i den porten, men provenance-disiplinen er den samme:
 * ingen tall uten kilde eller merket anslag.
 */

/** COICOP-koder hentet ut av tabell 14100, per `VatCategory`. */
export interface CoicopRule {
  readonly category: VatCategory;
  /** Koder som legges sammen. */
  readonly include: readonly string[];
  /** Koder som trekkes fra igjen (en gren som horer til en annen kategori). */
  readonly exclude: readonly string[];
  /** Hvorfor akkurat disse kodene. */
  readonly why: string;
}

/**
 * Kartleggingen COICOP 2018 -> `VatCategory`.
 *
 * Tabell 14100 folger COICOP 2018, ikke den gamle inndelingen: divisjon 08 er
 * «Informasjon og kommunikasjon», 12 er «Forsikring og finansielle tjenester» og 13 er
 * «Andre varer og tjenester». Kodene under er lest av den arkiverte filens egne labels.
 */
export const COICOP_MAPPING: readonly CoicopRule[] = [
  {
    category: 'food',
    include: ['01'],
    exclude: [],
    why: 'Divisjon 01 «Matvarer og alkoholfrie drikkevarer». Alkoholfri drikke er naeringsmiddel og folger samme reduserte mva-sats som mat.',
  },
  {
    category: 'alcoholTobacco',
    include: ['02'],
    exclude: [],
    why: 'Divisjon 02, bade alkohol (02.1) og tobakk (02.3).',
  },
  {
    category: 'electricity',
    include: ['04.5.1'],
    exclude: [],
    why: 'Gruppen heter «Elektrisitet inkludert nettleie» — belopet inneholder altsa nettleie, avgifter og mva, ikke bare kraftprisen. Det er avgjorende for kWh-utledningen under.',
  },
  {
    category: 'fuel',
    include: ['07.2.2'],
    exclude: [],
    why: 'Drivstoff og smoremidler: diesel (07.2.2.1), bensin (07.2.2.2), elbillading (07.2.2.3) og smoremidler (07.2.2.4).',
  },
  {
    category: 'flights',
    include: ['07.3.3'],
    exclude: [],
    why: 'Passasjertransport med fly, skilt ut av 07.3 fordi flypassasjeravgiften bare treffer denne.',
  },
  {
    category: 'transportServices',
    include: ['07.3'],
    exclude: ['07.3.3'],
    why: 'Ovrig passasjertransport — skinner, vei, bat, kombinert — som har redusert mva-sats.',
  },
  {
    category: 'exempt',
    include: ['04.1', '04.2', '06', '10', '12'],
    exclude: [],
    why: 'Mva-frie poster: betalt husleie (04.1), beregnet husleie (04.2), helse (06), utdanning (10) og forsikring/finansielle tjenester (12). Se BEREGNET_HUSLEIE_2022 om den nest storste av dem.',
  },
  {
    category: 'general',
    include: ['03', '05', '08', '09', '11', '13', '04.3', '04.4', '04.5', '07.1', '07.2', '07.4'],
    exclude: ['04.5.1', '07.2.2'],
    why: 'Alt ovrig til full sats. Restene av 04 (vedlikehold, vann, gass/ved/fjernvarme) og av 07 (kjop av kjoretoy, reservedeler, verksted, varetransport) er tatt med eksplisitt, ikke som en residual — se kontrollsummen.',
  },
];

/**
 * Utgift per husholdning per ar, 2022-kroner, per kategori.
 *
 * Regnet ut av `sources/raw/ssb-fbu-14100.json` etter `COICOP_MAPPING`.
 * `general` er IKKE en residual: den summeres av sine egne koder, og kontrollsummen
 * mot gruppe 00 er derfor en pastand som kan vaere usann. Den er testet.
 */
export const HOUSEHOLD_SPEND_2022: Readonly<Record<VatCategory, number>> = {
  food: 65_751,
  general: 247_393,
  transportServices: 5_162,
  electricity: 32_173,
  fuel: 10_911,
  alcoholTobacco: 12_177,
  flights: 4_723,
  exempt: 176_295,
};

/** Gruppe 00 «I alt» i samme tabell — kontrollsummen kategoriene ma treffe. */
export const FBU_TOTAL_2022 = 554_585;

/**
 * Beregnet husleie (COICOP 04.2), 109 976 kr av totalen.
 *
 * Dette er ikke en utbetaling. SSB tilordner selveiere en kalkulatorisk leie for at eiere
 * og leietakere skal kunne sammenlignes. Den ligger i `exempt` fordi husleie uansett er
 * mva-fri, sa den flytter ingen avgiftskrone i kalkulatoren — men den er nesten en femtedel
 * av «forbruket», og en leser som ser totalen skal fa vite hvorfor den er sa hoy.
 */
export const BEREGNET_HUSLEIE_2022 = 109_976;

/**
 * Kjop av kjoretoy (COICOP 07.1), 43 890 kr, ligger i `general` til full sats.
 *
 * Det er en kjent forenkling i favor av for mye mva: bruktbil kjopt privat har ingen mva,
 * og nybil har engangsavgift som kalkulatoren ikke modellerer. Skrevet ned her fordi et
 * tall som er galt pa en kjent mate er noe annet enn et tall ingen har sett pa.
 */
export const KJOP_AV_KJORETOY_2022 = 43_890;

/**
 * Gjennomsnittshusholdningens ekvivalensfaktor, 1,4713.
 *
 * FBU 2022 publiserer ikke sin egen husholdningssammensetning — den eneste FBU-tabellen
 * med personer per husholdning (10250) er en avsluttet serie som stopper i 2012. Derfor
 * brukes landsgjennomsnittet, og det sies her at det er landstall og ikke undersokelsens
 * egne: 2 545 902 privathusholdninger og 5 389 181 personer i privathusholdninger
 * (`ssb-06076-husholdningsstorrelse-2022`, 2,12 personer per husholdning), og 1 108 523
 * personer 0-17 ar (`ssb-07459-barn-under-18-2022`).
 *
 * Det gir 1,6814 voksne og 0,4354 barn per husholdning, og med OECD-skalaen
 * 1 + 0,5 x 0,6814 + 0,3 x 0,4354 = 1,4713.
 *
 * Forbehold: 07459 teller alle barn i landet, ikke bare de som bor i privathusholdning.
 * Nesten alle gjor det, sa overtellingen er liten — men den gar i retning av en litt for
 * hoy faktor, altsa litt for lave tall per person.
 */
export const AVERAGE_HOUSEHOLD_EQUIVALENCE = 1.4713;

/**
 * Prisene mengdene er utledet med, 2022.
 *
 * `sourceId` null betyr ANSLAG: ingen offisiell norsk kilde publiserer en gjennomsnittlig
 * kr-per-enhet for varen. SSBs omsetningsstatistikk for alkohol (04188) gir bare volum,
 * og KPI-tabellene gir indekser, ikke kronepriser. De anslatte prisene er skrevet ned her
 * i stedet for a gjemmes i en utregning, sa den som retter dem vet nøyaktig hva som ma
 * byttes.
 */
export interface UnitPrice {
  readonly price: number;
  readonly unit: string;
  readonly sourceId: string | null;
  readonly note: string;
}

export const UNIT_PRICES_2022: Readonly<Record<string, UnitPrice>> = {
  petrol: {
    price: 21.78,
    unit: 'kr/liter',
    sourceId: 'ssb-09654-drivstoffpriser-2022',
    note: 'Bensin blyfri 95 oktan, snitt av de tolv manedsprisene 2022 i den arkiverte filen.',
  },
  diesel: {
    price: 21.72,
    unit: 'kr/liter',
    sourceId: 'ssb-09654-drivstoffpriser-2022',
    note: 'Avgiftspliktig diesel, snitt av de tolv manedsprisene 2022.',
  },
  kwh: {
    price: 2.353,
    unit: 'kr/kWh',
    sourceId: 'ssb-09007-strompris-husholdninger-2022',
    note:
      'Kraft + nettleie INKLUDERT mva og elavgift, 235,3 ore/kWh (KraftOgNettIA). ' +
      'SE ADVARSELEN UNDER: valget mellom denne og prisen etter strømstotte endrer kWh med ~60 %.',
  },
  beer: { price: 52, unit: 'kr/liter', sourceId: null, note: 'ANSLAG. Ingen offisiell kr/liter finnes.' },
  wine: { price: 150, unit: 'kr/liter', sourceId: null, note: 'ANSLAG. Ingen offisiell kr/liter finnes.' },
  spirits: { price: 500, unit: 'kr/liter', sourceId: null, note: 'ANSLAG. Ingen offisiell kr/liter finnes.' },
  cigarette: { price: 6.5, unit: 'kr/stk', sourceId: null, note: 'ANSLAG, ~130 kr per 20-pakning.' },
  snus: { price: 4.2, unit: 'kr/gram', sourceId: null, note: 'ANSLAG, ~100 kr per boks a 24 g.' },
  flight: { price: 1_500, unit: 'kr/reise', sourceId: null, note: 'ANSLAG for en gjennomsnittlig flyreise.' },
};

/**
 * ADVARSEL — kWh er det ene tallet her som kan vaere grovt galt, og det er verdt a lese.
 *
 * FBUs 04.5.1 er kroner husholdningen FAKTISK betalte for strom inkludert nettleie i 2022.
 * 2022 var aret med stromstotte: SSB oppgir bade 235,3 ore/kWh inkludert mva og elavgift,
 * og 143,9 ore/kWh nar stotten er trukket fra. Hvilken av dem som svarer til FBUs
 * utgiftstall, star ikke i noen av de arkiverte filene.
 *
 *   235,3 ore  ->  13 673 kWh per husholdning   (brukt her)
 *   143,9 ore  ->  22 358 kWh per husholdning   (forkastet)
 *
 * 235,3 er valgt fordi 13 673 kWh ligger i naerheten av det norske husholdningssnittet pa
 * rundt 16 000 kWh i et ar da forbruket falt, mens 22 358 ligger langt over. Det er et
 * rimelighetsargument, ikke en kilde — derfor er kWh merket som anslag. Tallet mater
 * elavgiften direkte, sa hvis operatoren finner ut hvordan FBU behandler stromstotten,
 * er dette forste tall som skal rettes.
 */
export const KWH_IS_ESTIMATED = true;

interface ProfileSeed {
  readonly id: ConsumptionProfileId;
  readonly label: string;
  readonly blurb: string;
  /** Inntektskvartil i tabell 14156 denne profilen er hentet fra. */
  readonly quartile: string;
  readonly spend: Record<VatCategory, number>;
  readonly units: Partial<Record<ExciseGood, number>>;
}

/**
 * Per enslig voksen per ar: utgift inkl. mva (kr) og fysiske mengder.
 *
 * Husholdningstallene fra FBU delt pa AVERAGE_HOUSEHOLD_EQUIVALENCE. Kronebelopene er
 * rundet til naermeste hundre, slik den forrige modulen ogsa gjorde — profilene er et
 * utgangspunkt brukeren kan redigere, ikke en pastand om ore.
 *
 * `noktern` og `hoy` er IKKE oppdiktede faktorer av `typisk`: de er laveste og hoyeste
 * inntektskvartil i SSB-tabell 14156, arkivert som `ssb-fbu-14156`.
 */
const SEEDS: readonly ProfileSeed[] = [
  {
    id: 'noktern',
    label: 'Nøkternt',
    blurb: 'Laveste inntektskvartil i SSBs forbruksundersøkelse 2022.',
    quartile: '41',
    spend: {
      food: 29_100,
      general: 91_200,
      transportServices: 3_100,
      electricity: 16_200,
      fuel: 3_700,
      alcoholTobacco: 4_900,
      flights: 2_800,
      exempt: 96_800,
    },
    units: {
      petrolLitre: 66,
      dieselLitre: 97,
      kwh: 6_894,
      flightEurope: 2,
      beerLitre: 24,
      wineLitre: 12,
      spiritsLitre: 1,
      cigarette: 101,
      snusGram: 157,
    },
  },
  {
    id: 'typisk',
    label: 'Typisk',
    blurb: 'Gjennomsnittshusholdningen i SSBs forbruksundersøkelse 2022.',
    quartile: '0',
    spend: {
      food: 44_700,
      general: 168_100,
      transportServices: 3_500,
      electricity: 21_900,
      fuel: 7_400,
      alcoholTobacco: 8_300,
      flights: 3_200,
      exempt: 119_800,
    },
    units: {
      petrolLitre: 134,
      dieselLitre: 195,
      kwh: 9_293,
      flightEurope: 2,
      beerLitre: 41,
      wineLitre: 21,
      spiritsLitre: 1,
      cigarette: 172,
      snusGram: 266,
    },
  },
  {
    id: 'hoy',
    label: 'Høyt',
    blurb: 'Høyeste inntektskvartil i SSBs forbruksundersøkelse 2022.',
    quartile: '44',
    spend: {
      food: 59_400,
      general: 256_300,
      transportServices: 4_900,
      electricity: 28_800,
      fuel: 10_600,
      alcoholTobacco: 11_300,
      flights: 4_500,
      exempt: 148_800,
    },
    units: {
      petrolLitre: 191,
      dieselLitre: 277,
      kwh: 12_226,
      flightEurope: 3,
      beerLitre: 55,
      wineLitre: 29,
      spiritsLitre: 2,
      cigarette: 235,
      snusGram: 363,
    },
  },
];

export const PROFILE_SEEDS = SEEDS;

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
