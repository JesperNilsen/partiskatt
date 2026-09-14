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
Standardprofilene (nøktern / typisk / høy) skal bygge på SSBs forbruksundersøkelse (tabell 14100, arkivert). Inntil den koblingen er gjort i datalaget (QUEUE.md Q-001) er profilene plassholdere av riktig størrelsesorden, og kalkulatoren sier det. Profilen angir årlig forbruk inkl. mva per kategori og fysiske mengder for avgiftsbelagte varer. Alle verdier kan endres av brukeren.

## Avrunding
Alle beløp er hele kroner. Hver navngitt komponent avrundes én gang (halv opp, bort fra null). Summen av komponentene er per definisjon lik hovedtallet.

## Usikkerhet
Hver regel har status (`confirmed`, `estimated`, `unquantified`, `not-applicable`, `not-reviewed`). Bare `confirmed` og `estimated` inngår i hovedtallet. Forslag merket usikre (`uncertain: true`) er av som standard og kan slås på under «Mulige endringer». Full dekning per parti og kategori: `DATA_STATUS.md`.

## Personvern
All beregning skjer lokalt i nettleseren. Ingen økonomiske brukerdata sendes eller lagres.
