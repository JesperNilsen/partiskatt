# Metode

## Referanse
Referansen er det endelig vedtatte skatte-, avgifts- og ytelsessystemet for inntektsåret 2026 slik det følger av Stortingets vedtak (Lovdata) etter budsjettforliket — ikke regjeringens opprinnelige forslag (Prop. 1 LS). Alle partier sammenlignes med samme referanse. Arbeiderpartiet er regjeringsparti og har ikke et alternativt budsjett; partiets kort viser derfor null avvik per konstruksjon. Endringer fra forliket (15 regler som avviker fra Prop. 1 LS) er listet i `sources/worksheets/baseline-2026.md` og vises under Kilder.

## Tre regelsett
1. **Regjeringens forslag** (`proposed`) — Prop. 1 LS; utgangspunkt partiene bruker i sine alternative budsjetter.
2. **Vedtatt referanse** (`adopted`) — det faktiske 2026-systemet; baseline for alle sammenligninger.
3. **Partiregler** — for hvert opposisjonsparti overlegges bare endringer partiet faktisk foreslår; alt annet følger referansen.

Partienes egne tall er formulert som avvik fra `proposed`. Ekstraksjonen regner om til absolutte verdier (sats, terskel, beløp) og sammenligner med `adopted`. Løse formuleringer i partiprogram brukes ikke.

## Hva inngår i hovedtallet
- Direkte skatt (inntekt, trinnskatt, trygdeavgift, fradrag, formuesskatt der kildene tillater det).
- Moms og særavgifter fra en standardisert forbruksprofil (justerbar). Moms regnes ikke som prosent av hele inntekten.
- Direkte kontantytelser (f.eks. barnetrygd) der partiet har konkrete, tallfestede forslag.

Ikke med: offentlige tjenester, gratisordninger, makspriser, dynamiske vekstvirkninger, utbytte/næringsinntekt, kommunal skatt. Kun nasjonale regler.

## Avgrensninger
Kun nasjonale regler. Ingen kommunal eiendomsskatt, ingen verdsetting av offentlige tjenester, gratisordninger eller makspriser, ingen dynamiske virkninger. Utbytte og næringsinntekt er utenfor MVP.

## Incidens
- Direkte skatt og kontantytelser: 100 % på personen.
- Moms og særavgifter: 100 % overveltning til forbrukerpris, uendrede mengder. Særavgifter beregnes per enhet (liter, kWh, passasjer) og mva legges oppå avgiften.
- Arbeidsgiveravgift: av som standard. Når den slås på, brukes full langsiktig incidens på arbeidstakeren som foreløpig antagelse, og beløpet vises adskilt fra direkte skatt.

## Forbruksprofil
Standardprofilene (nøktern / typisk / høy) er utledet av SSBs forbruksundersøkelse (FBU) 2022 i `src/data/consumption-profiles.ts`. Profilen angir årlig forbruk inkl. mva per kategori og fysiske mengder for avgiftsbelagte varer. Alle verdier kan endres av brukeren — profilen er et utgangspunkt, ikke en påstand om den enkelte.

**Kroner.** Tabell 14100 (`ssb-fbu-14100`, json-stat2, 510 COICOP-2018-grupper, kr per husholdning per år) kartlegges til mva-kategoriene: `food` = 01, `alcoholTobacco` = 02, `electricity` = 04.5.1, `fuel` = 07.2.2, `flights` = 07.3.3, `transportServices` = 07.3 minus fly, `exempt` = de mva-frie gruppene, `general` = gruppe 00 minus alt det andre. Kartleggingen står som data i `COICOP_MAPPING`, med en begrunnelse per kode, og en test regner den om igjen fra råfilen og feiler hvis et tall har glidd.

**Fra husholdning til person.** Husholdningstallene deles på gjennomsnittshusholdningens ekvivalensfaktor, 1,4713, etter den OECD-modifiserte skalaen (1 + 0,5 per ekstra voksen + 0,3 per barn). FBU publiserer ikke sin egen husholdningssammensetning, så faktoren bygger på landstall: 2,12 personer per privathusholdning (`ssb-06076-husholdningsstorrelse-2022`) og 1 108 523 personer 0–17 år (`ssb-07459-barn-under-18-2022`). Forbehold: 07459 teller alle barn i landet, ikke bare de i privathusholdning, så faktoren blir marginalt for høy og tallene per person marginalt for lave.

**Nøktern og høy er ikke oppdiktede faktorer av typisk.** De er laveste og høyeste inntektskvartil i tabell 14156 (`ssb-fbu-14156`); `typisk` er alle husholdninger i samme tabell.

**Fysiske mengder** er kroner ÷ gjennomsnittspris 2022. Bensin og diesel fra `ssb-09654-drivstoffpriser-2022` (snitt av tolv månedspriser), kWh fra `ssb-09007-strompris-husholdninger-2022`. Øl, vin, brennevin, sigaretter, snus og flyreiser har **ingen offisiell kr-per-enhet** — de prisene er anslag, skrevet eksplisitt ned i `UNIT_PRICES_2022` med `sourceId: null` i stedet for gjemt i en utregning.

**kWh er det svakeste tallet.** 2022 var strømstøtteåret, og SSB oppgir både 235,3 øre/kWh (inkl. mva og elavgift) og 143,9 øre/kWh etter støtte. Hvilken FBUs utgiftstall svarer til, står ikke i noen arkivert fil. 235,3 er valgt på et rimelighetsargument — 13 673 kWh per husholdning mot 22 358 — ikke på en kilde, og mengden er derfor merket som anslag. Den måler elavgiften direkte, så den skal rettes først hvis spørsmålet avklares.

**Prisår: 2022-kroner brukes uendret, uten KPI-løft.** Det er et bevisst valg, ikke en forglemmelse. Profilen er et redigerbart utgangspunkt brukeren kan overstyre, og et udokumentert KPI-løft ville gitt tallene en presisjon de ikke har. Konsekvensen skal sies rett ut: mengdene (liter, kWh) er de riktige å regne særavgift av, mens kronebeløpene ligger på 2022-nivå og dermed noe under 2026-forbruk i kroner.

## Avrunding
Alle beløp er hele kroner. Hver navngitt komponent avrundes én gang (halv opp, bort fra null). Summen av komponentene er per definisjon lik hovedtallet.

## Usikkerhet
Hver regel har status (`confirmed`, `estimated`, `unquantified`, `not-applicable`, `not-reviewed`). Bare `confirmed` og `estimated` inngår i hovedtallet. Forslag merket usikre (`uncertain: true`) er av som standard og kan slås på under «Mulige endringer». Full dekning per parti og kategori: `DATA_STATUS.md`.

## Personvern
All beregning skjer lokalt i nettleseren. Ingen økonomiske brukerdata sendes eller lagres.
