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
 * Flyreiser: delingen av 07.3.3-kronene i Europa og utenfor Europa.
 *
 * Flypassasjeravgiften har to satser — 61 kr med sluttdestinasjon i Europa og 350 kr for
 * andre flyginger (`src/data/baseline/2026/adopted.ts`, `excise.flightEurope` og
 * `excise.flightOther`). FBUs 07.3.3 er ETT kronebelop for all passasjertransport med fly,
 * sa en profil kan ikke fa den hoye satsen uten at kronene deles.
 *
 * Delingen er et ANSLAG, og det er ikke til a komme rundt: ingen arkiverbar offisiell kilde
 * skiller Europa fra resten. Avinors trafikkstatistikk og SSB 08507 skiller innenlands fra
 * utenlands — et annet skille, som ville plassert en reise til Spania og en til Thailand pa
 * samme side. Derfor star andelen her som et navngitt tall med `sourceId: null`, pa samme
 * vilkar som 1 500-kr-prisen den erstatter, i stedet for a ligge implisitt i et frotall.
 *
 * Kronene DELES, de legges ikke til: `flightEurope x prisEuropa + flightOther x prisUtenfor`
 * er lik `spend.flights` for hvert fro. Det er testet (`src/tests/consumption-profiles.test.ts`).
 */
export const LONGHAUL_SPEND_SHARE = 0.2;

/** ANSLAG: kr per taxert avreise med sluttdestinasjon i Europa. Uendret fra Q-001. */
export const FLIGHT_PRICE_EUROPE_2022 = 1_500;

/**
 * ANSLAG: kr per taxert avreise utenfor Europa.
 *
 * Satt til fem ganger Europa-prisen. En langdistansebillett koster apenbart mer enn en
 * Europa-billett, og a bruke samme pris for begge ville vaert det ene valget som er sikkert
 * galt — det ville gitt langt for mange langdistansereiser per ar.
 */
export const FLIGHT_PRICE_OTHER_2022 = 7_500;

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
  flightEurope: {
    price: FLIGHT_PRICE_EUROPE_2022,
    unit: 'kr/reise',
    sourceId: null,
    note: 'ANSLAG for en gjennomsnittlig flyreise med sluttdestinasjon i Europa.',
  },
  flightOther: {
    price: FLIGHT_PRICE_OTHER_2022,
    unit: 'kr/reise',
    sourceId: null,
    note: 'ANSLAG for en gjennomsnittlig flyreise utenfor Europa. Se LONGHAUL_SPEND_SHARE.',
  },
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

/**
 * Tobakk: delingen av kronene i sigaretter og snus.
 *
 * Tabell 14100 (`ssb-fbu-14100`) splitter 02.3 «Tobakk» for alle husholdninger: 02.3.0.1
 * «Sigaretter» 1 405 kr og 02.3.0.9 «Snus og andre tobakksvarer» 1 872 kr av 3 289 kr.
 * 02.3.0.2 «Sigarer» er skjult i filen (verdi null); de 12 kronene som mangler i summen
 * (3 289 - 1 405 - 1 872) er derfor ikke fordelt pa noen vare. Hele 02.3.0.9 regnes som snus.
 *
 * Tabell 14156 (`ssb-fbu-14156`) gir 02.3 per inntektskvartil (2 450 / 3 289 / 3 372 kr), men
 * ikke delingen. ANTAKELSE: hver kvartil har landsgjennomsnittets andeler. Mengden per fro er
 * da `tobakk_kvartil x andel / AVERAGE_HOUSEHOLD_EQUIVALENCE / pris`, rundet til hele enheter
 * som de ovrige ikke-flymengdene. Testen i `src/tests/consumption-profiles.test.ts` regner det
 * om igjen fra begge rafilene.
 *
 * (Q-001 brukte en stille 50/50-deling her; Codex-kontrollen 2026-09-26 fant den.)
 */
export const TOBACCO_SPLIT_2022 = {
  cigarette: 1_405,
  snusOther: 1_872,
  tobaccoTotal: 3_289,
} as const;

/** 02.3 «Tobakk» per husholdning per ar, 2022-kr, per profil (tabell 14156). */
export const TOBACCO_BY_PROFILE_2022: Readonly<Record<ConsumptionProfileId, number>> = {
  noktern: 2_450,
  typisk: 3_289,
  hoy: 3_372,
};

/**
 * Alkohol: samme monster som tobakk.
 *
 * Tabell 14100 splitter 02.1 «Alkoholholdige drikkevarer» (8 888 kr per husholdning) i
 * 02.1.1 brennevin og likor 1 004 kr, 02.1.2 vin (inkl. sider og sake) 4 612 kr og 02.1.3 ol
 * 3 099 kr. 02.1.9 «Andre alkoholholdige drikkevarer» (172 kr) har ingen egen avgiftsvare og
 * fordeles ikke; den siste kronen i summen er SSBs avrunding.
 *
 * Tabell 14156 gir 02.1 per kvartil (4 733 / 8 888 / 13 260 kr), men ikke delingen. ANTAKELSE,
 * som for tobakk: hver kvartil har landsgjennomsnittets andeler. Mengden er
 * `alkohol_kvartil x andel / AVERAGE_HOUSEHOLD_EQUIVALENCE / pris`, og den lagres UAVRUNDET:
 * brennevin ligger under to liter i aret for alle profiler (0,73 for «Nøkternt»), sa en
 * heltallsavrunding ville flyttet avgiften med titalls prosent — samme feilklasse som flyreisene.
 *
 * (Q-001 skalerte med kvartilforholdet for hele divisjon 02, alkohol og tobakk sammen, i stedet
 * for 14156s egen alkoholsum. Rettet 2026-09-26.)
 */
export const ALCOHOL_SPLIT_2022 = {
  spirits: 1_004,
  wine: 4_612,
  beer: 3_099,
  otherAlcohol: 172,
  alcoholTotal: 8_888,
} as const;

/** 02.1 «Alkoholholdige drikkevarer» per husholdning per ar, 2022-kr, per profil (tabell 14156). */
export const ALCOHOL_BY_PROFILE_2022: Readonly<Record<ConsumptionProfileId, number>> = {
  noktern: 4_733,
  typisk: 8_888,
  hoy: 13_260,
};

/** Forventede liter per voksen-ekvivalent per ar, uavrundet. Se ALCOHOL_SPLIT_2022. */
export function alcoholLitres(id: ConsumptionProfileId, drink: 'beer' | 'wine' | 'spirits'): number {
  const price = UNIT_PRICES_2022[drink]?.price;
  if (price === undefined) throw new Error(`pris mangler: ${drink}`);
  return (
    (ALCOHOL_BY_PROFILE_2022[id] * ALCOHOL_SPLIT_2022[drink]) /
    ALCOHOL_SPLIT_2022.alcoholTotal /
    AVERAGE_HOUSEHOLD_EQUIVALENCE /
    price
  );
}

/**
 * AVRUNDING_AV_MENGDER — hvorfor `consumptionFor` ikke runder mengder til hele enheter.
 *
 * Motoren tar mengder som en multiplikator og runder KRONENE en gang til slutt
 * (`unitsTimesRate` -> `toKroner` i `src/engine/money.ts`); `sanitizeUnits` slipper desimaler
 * igjennom med vilje. Mengden trenger derfor ikke vaere et heltall, og skal ikke vaere det:
 * en profil oppgir et FORVENTET arlig forbruk, ikke en handling.
 *
 * Det var avrundingen som skjulte feilen Q-001 ble avvist for. Et forventet antall avreiser
 * utenfor Europa ligger under en halv reise i aret for enhver normal husholdning — 0,252 for
 * «Hoyt» med to voksne og to barn (4 500 x 0,2 / 7 500 = 0,12 per voksen, x 2,1). `Math.round` gjorde det til 0, og en avgift pa 350 kr per
 * reise ble borte i stillhet. Feilen var ikke andelen; den var at et heltallskrav ble lagt pa
 * en forventningsverdi. Sa: ingen avrunding her, og bare EN avrunding i kjeden — motorens.
 *
 * De ovrige mengdene (drivstoff-liter, kWh, sigaretter, gram snus) er rundet til hele enheter;
 * den minste av dem er 66 liter bensin, sa avrundingen der er under 1 % og ikke den samme feilen.
 * Flyreisene og alkoholen lagres uavrundet fordi de er sma nok til at avrundingen biter.
 */
export interface ProfileSeed {
  readonly id: ConsumptionProfileId;
  readonly label: string;
  readonly blurb: string;
  /** Inntektskvartil i tabell 14156 denne profilen er hentet fra. */
  readonly quartile: string;
  readonly spend: Record<VatCategory, number>;
  /**
   * KOMPLETT, ikke `Partial`. Et fro som mangler en avgiftsvare skal avvises av tsc, ikke
   * stille bli 0 i `consumptionFor` — det var nettopp den feilen som fikk Q-001 avvist
   * 2026-09-18: `flightOther` manglet i alle tre fro, og standardprofilene betalte derfor
   * aldri flypassasjeravgift utenfor Europa.
   */
  readonly units: Record<ExciseGood, number>;
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
      // 2 800 kr flyreiser delt etter LONGHAUL_SPEND_SHARE. UAVRUNDET: dette er et
      // FORVENTET antall avreiser per ar, ikke en reise noen faktisk tar.
      flightEurope: (2_800 * (1 - LONGHAUL_SPEND_SHARE)) / FLIGHT_PRICE_EUROPE_2022,
      flightOther: (2_800 * LONGHAUL_SPEND_SHARE) / FLIGHT_PRICE_OTHER_2022,
      // Alkohol: 14156s alkoholsum delt etter 14100s andeler, UAVRUNDET (ALCOHOL_SPLIT_2022).
      beerLitre: alcoholLitres('noktern', 'beer'),
      wineLitre: alcoholLitres('noktern', 'wine'),
      spiritsLitre: alcoholLitres('noktern', 'spirits'),
      // Tobakk delt etter 14100s sigarett/snus-andeler, se TOBACCO_SPLIT_2022.
      cigarette: 109,
      snusGram: 226,
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
      // 3 200 kr flyreiser delt etter LONGHAUL_SPEND_SHARE. UAVRUNDET: dette er et
      // FORVENTET antall avreiser per ar, ikke en reise noen faktisk tar.
      flightEurope: (3_200 * (1 - LONGHAUL_SPEND_SHARE)) / FLIGHT_PRICE_EUROPE_2022,
      flightOther: (3_200 * LONGHAUL_SPEND_SHARE) / FLIGHT_PRICE_OTHER_2022,
      // Alkohol: 14156s alkoholsum delt etter 14100s andeler, UAVRUNDET (ALCOHOL_SPLIT_2022).
      beerLitre: alcoholLitres('typisk', 'beer'),
      wineLitre: alcoholLitres('typisk', 'wine'),
      spiritsLitre: alcoholLitres('typisk', 'spirits'),
      // Tobakk delt etter 14100s sigarett/snus-andeler, se TOBACCO_SPLIT_2022.
      cigarette: 147,
      snusGram: 303,
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
      // 4 500 kr flyreiser delt etter LONGHAUL_SPEND_SHARE. UAVRUNDET: dette er et
      // FORVENTET antall avreiser per ar, ikke en reise noen faktisk tar.
      flightEurope: (4_500 * (1 - LONGHAUL_SPEND_SHARE)) / FLIGHT_PRICE_EUROPE_2022,
      flightOther: (4_500 * LONGHAUL_SPEND_SHARE) / FLIGHT_PRICE_OTHER_2022,
      // Alkohol: 14156s alkoholsum delt etter 14100s andeler, UAVRUNDET (ALCOHOL_SPLIT_2022).
      beerLitre: alcoholLitres('hoy', 'beer'),
      wineLitre: alcoholLitres('hoy', 'wine'),
      spiritsLitre: alcoholLitres('hoy', 'spirits'),
      // Tobakk delt etter 14100s sigarett/snus-andeler, se TOBACCO_SPLIT_2022.
      cigarette: 151,
      snusGram: 311,
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
  for (const cat of VAT_CATEGORIES) spend[cat] = kr(Math.round((seed.spend[cat] * factor) / 100) * 100);
  const units = {} as Record<ExciseGood, number>;
  // `spend` og `units` er komplette Record-er (se ProfileSeed), sa tsc garanterer hver nokkel
  // og ingen fallback trengs. Ingen avrunding til hele enheter — se AVRUNDING_AV_MENGDER over.
  for (const good of EXCISE_GOODS) units[good] = seed.units[good] * factor;
  return { spend, units };
}
