# Metode (utkast — utvides i S9)

## Referanse
Referansen er det endelig vedtatte skatte-, avgifts- og ytelsessystemet for inntektsåret 2026 slik det følger av Stortingets vedtak (Lovdata) etter budsjettforliket. Alle partier sammenlignes med samme referanse. Arbeiderpartiet er regjeringsparti og har ikke et alternativt budsjett; partiets kort viser derfor null avvik per konstruksjon. Det vedtatte systemet er ikke identisk med regjeringens forslag (Prop. 1 LS): endringene fra forliket er listet i `src/data/baseline/2026/forlik.ts` og vises under «Kilder».

## Partienes forslag
Opposisjonspartienes tall hentes fra deres alternative statsbudsjetter for 2026. Disse er formulert som avvik fra regjeringens forslag, ikke fra det vedtatte budsjettet. Vi regner om til absolutte verdier (sats, terskel, beløp) og sammenligner med referansen. For regler et parti ikke har foreslått endret, legger vi det vedtatte systemet til grunn. Løse formuleringer i partiprogram brukes ikke.

## Avgrensninger
Kun nasjonale regler. Ingen kommunal eiendomsskatt, ingen verdsetting av offentlige tjenester, gratisordninger eller makspriser, ingen dynamiske virkninger. Utbytte og næringsinntekt er utenfor MVP.

## Incidens
- Direkte skatt og kontantytelser: 100 % på personen.
- Moms og særavgifter: 100 % overveltning til forbrukerpris, uendrede mengder. Særavgifter beregnes per enhet (liter, kWh, passasjer) og mva legges oppå avgiften.
- Arbeidsgiveravgift: av som standard. Når den slås på, brukes full langsiktig incidens på arbeidstakeren som foreløpig antagelse, og beløpet vises adskilt fra direkte skatt.

## Forbruksprofil
Standardprofilene (nøktern / typisk / høy) bygger på SSBs forbruksundersøkelse. Profilen angir årlig forbruk inkl. mva per kategori og fysiske mengder for avgiftsbelagte varer. Alle verdier kan endres av brukeren.

## Avrunding
Alle beløp er hele kroner. Hver navngitt komponent avrundes én gang (halv opp, bort fra null). Summen av komponentene er per definisjon lik hovedtallet.

## Usikkerhet
Hver regel har status (`confirmed`, `estimated`, `unquantified`, `not-applicable`, `not-reviewed`). Bare `confirmed` og `estimated` inngår i hovedtallet. Forslag merket usikre er av som standard og kan slås på under «Mulige endringer».
