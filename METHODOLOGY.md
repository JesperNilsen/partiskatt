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
Standardprofilene (nøktern / typisk / høy) er utledet av SSBs forbruksundersøkelse (FBU) 2022 i `src/data/consumption-profiles.ts`. Profilen angir årlig forbruk inkl. mva per kategori og fysiske mengder for avgiftsbelagte varer. Under avanserte felt kan brukeren endre kronene i alle åtte kategorier og alle ti fysiske mengder (med én desimal); en endring gjør profilen egendefinert. Profilen er et utgangspunkt, ikke en påstand om den enkelte.

**Kroner.** Tabell 14100 (`ssb-fbu-14100`, json-stat2, 510 COICOP-2018-grupper, kr per husholdning per år) kartlegges til mva-kategoriene: `food` = 01, `alcoholTobacco` = 02, `electricity` = 04.5.1, `fuel` = 07.2.2, `flights` = 07.3.3, `transportServices` = 07.3 minus fly, `exempt` = de mva-frie gruppene (04.1, 04.2, 06, 10, 12), `general` = 03, 05, 08, 09, 11, 13 og restene av 04 og 07, summert fra sine egne koder og ikke som en residual. Derfor er kontrollsummen mot gruppe 00 en påstand som kan feile, og den er testet. Kartleggingen står som data i `COICOP_MAPPING`, med en begrunnelse per kode, og en test regner den om igjen fra råfilen og feiler hvis et tall har glidd.

**Fra husholdning til person.** Husholdningstallene deles på gjennomsnittshusholdningens ekvivalensfaktor, 1,4713, etter den OECD-modifiserte skalaen (1 + 0,5 per ekstra voksen + 0,3 per barn). FBU publiserer ikke sin egen husholdningssammensetning, så faktoren bygger på landstall: 2,12 personer per privathusholdning (`ssb-06076-husholdningsstorrelse-2022`) og 1 108 523 personer 0–17 år (`ssb-07459-barn-under-18-2022`). Forbehold: 07459 teller alle barn i landet, ikke bare de i privathusholdning, så faktoren blir marginalt for høy og tallene per person marginalt for lave.

**Nøktern og høy er ikke oppdiktede faktorer av typisk.** De er laveste og høyeste inntektskvartil i tabell 14156 (`ssb-fbu-14156`); `typisk` er alle husholdninger i samme tabell.

**Fysiske mengder** er kroner ÷ gjennomsnittspris 2022. Bensin og diesel fra `ssb-09654-drivstoffpriser-2022` (snitt av tolv månedspriser). kWh er unntaket: den er målt, ikke utledet av kroner (se under). Øl, vin, brennevin, sigaretter, snus og flyreiser har **ingen offisiell kr-per-enhet** — de prisene er anslag, skrevet eksplisitt ned i `UNIT_PRICES_2022` med `sourceId: null` i stedet for gjemt i en utregning.

**Tobakk deles etter SSBs egne underkoder.** Tabell 14100 splitter 02.3 «Tobakk» (3 289 kr per husholdning) i 02.3.0.1 «Sigaretter» 1 405 kr og 02.3.0.9 «Snus og andre tobakksvarer» 1 872 kr; 02.3.0.2 «Sigarer» er skjult i filen, så de 12 kronene som mangler i summen fordeles ikke. Hele 02.3.0.9 regnes som snus. Tabell 14156 gir tobakk per kvartil (2 450 / 3 289 / 3 372 kr), men ikke delingen, så **hver kvartil antas å ha landsgjennomsnittets andeler** (42,7 % sigaretter, 56,9 % snus). Mengden er kvartilens tobakk × andel ÷ 1,4713 ÷ pris (6,50 kr/stk og 4,20 kr/g, begge anslag), rundet til hele enheter: 109/226, 147/303 og 151/311 sigaretter/gram snus for nøktern/typisk/høy. En test regner det om fra begge råfilene. (Q-001 delte tobakkskronene 50/50 uten å si det; det er rettet.)

**Alkohol deles på samme måte.** Tabell 14100 splitter 02.1 «Alkoholholdige drikkevarer» (8 888 kr per husholdning) i brennevin og likør 1 004 kr (02.1.1), vin inkl. sider og sake 4 612 kr (02.1.2) og øl 3 099 kr (02.1.3); 02.1.9 «Andre alkoholholdige drikkevarer» (172 kr) har ingen egen avgiftsvare og fordeles ikke. Tabell 14156 gir alkohol per kvartil (4 733 / 8 888 / 13 260 kr), og hver kvartil antas å ha landsgjennomsnittets andeler. Mengden er kvartilens alkohol × andel ÷ 1,4713 ÷ pris (52, 150 og 500 kr/liter, anslag) og lagres **uavrundet**, fordi brennevin ligger under to liter i året (0,73 liter for nøktern) og en heltallsavrunding ville flyttet avgiften med titalls prosent. Per voksen-ekvivalent gir det øl/vin/brennevin 21,57/11,13/0,73 liter (nøktern), 40,51/20,90/1,37 (typisk) og 60,43/31,18/2,04 (høy). (Q-001 skalerte med kvartilforholdet for hele divisjon 02, alkohol og tobakk sammen; det er rettet.)

**Flyreiser deles i to, fordi avgiften har to satser.** Flypassasjeravgiften er 61 kr med sluttdestinasjon i Europa og 350 kr for andre flyginger, men FBUs gruppe 07.3.3 er ett kronebeløp for all flyreise. Kronene deles derfor med en eksplisitt andel: **20 % av flykronene regnes som reiser utenfor Europa**, resten som Europa-reiser, med **1 500 kr per Europa-avreise og 7 500 kr per avreise utenfor Europa** (begge anslag, `sourceId: null`). Kronene deles, de legges ikke til — `flightEurope × 1 500 + flightOther × 7 500` er lik `spend.flights` for hvert frø, og en test fester det.

Andelen er et anslag og kan ikke være noe annet: ingen arkiverbar offisiell kilde skiller Europa fra resten. Avinors trafikkstatistikk og SSB 08507 skiller innenlands fra utenlands, altså et annet skille, som ville lagt Spania og Thailand på samme side. Det står derfor som et navngitt anslag (`LONGHAUL_SPEND_SHARE`) i stedet for å ligge implisitt i et frøtall. Et nytt søk 2026-09-26 (SSB reiseundersøkelsen, Avinor, TØI, budsjettproposisjonene) fant fortsatt ingen kilde for andelen eller langdistanseprisen; søket og kryssjekkene står i `docs/research/l11-profile-inputs.md`, og ingen av tallene er endret.

**Mengden er et forventet antall reiser per år, ikke et helt antall reiser.** «Høyt» med to voksne og to barn har 0,252 forventede avreiser utenfor Europa i året, altså 88 kr i avgift — ikke null og ikke én reise. Regnestykket: 4 500 kr × 0,2 ÷ 7 500 kr = 0,12 avreiser per voksen-ekvivalent, × ekvivalensfaktoren 2,1 = 0,252, × 350 kr = 88,2 kr, avrundet til 88 kr (flypassasjeravgiften har ingen mva oppå). Derfor rundes fysiske mengder ikke til hele enheter; de går uavrundet gjennom `consumptionFor` og `sanitizeProfile` (ikke-negative, endelige desimaltall beholdes), og motoren runder kronene én gang til slutt. Avrunding til heltall var nettopp det som gjorde 0,252 reiser til 0 og fjernet avgiften i stillhet, og det er feilen dette punktet retter. Alle tre profiler har en positiv `flightOther`-mengde, og typen tillater ikke et frø uten den.

**kWh er målt, ikke utledet av kroner.** Frøene bygger på 14 964 kWh elektrisitet per husholdning i 2022 fra SSB-tabell 10572 (`ssb-10572-energibruk-husholdninger-2022`), som er regnet på FBU 2022 sitt eget utvalg, med Elhub-målerdata for 80 % av husholdningene (bolig uten fritidsbolig, inkludert elbillading hjemme). Tidligere ble FBUs 04.5.1 (32 173 kr) delt på 235,3 øre/kWh før strømstøtte, som ga 13 673 kWh og var merket som anslag. SSBs egen dokumentasjon (`ssb-energibruk-husholdningene-2022`, «Om statistikken») viser at SSB regner FBU-husholdningenes oppgitte strømkostnader om til kWh med en pris der «strømstøtte er trukket i fra». SSB leser altså utgiften som beløpet etter støtten. Men 32 173 kr ÷ 143,9 øre gir 22 358 kWh, 49 % over det SSB måler for samme utvalg. Brøken er derfor ingen kWh-kilde uansett pris, og det målte tallet erstatter den. Kvartilene: 10572 har ingen inntektsfordeling, så kWh antas å følge 04.5 «Elektrisitet og brensel» per kvartil i 14156 (26 737 / 36 042 / 47 416 kr), samme antakelse som kronene bygger på. Frøet er 14 964 × 04.5-kvartil ÷ 36 042 ÷ 1,4713, rundet: 7 545 / 10 171 / 13 380 kWh per voksen-ekvivalent for nøktern/typisk/høy (før: 6 894 / 9 293 / 12 226). Forbehold: strøm i fritidsbolig er ikke med, så elavgiften blir heller for lav enn for høy. Søket og regnestykkene står i `docs/research/l11-profile-inputs.md`.

**Prisår: 2022-kroner brukes uendret, uten KPI-løft.** Det er et bevisst valg, ikke en forglemmelse. Profilen er et redigerbart utgangspunkt brukeren kan overstyre, og et udokumentert KPI-løft ville gitt tallene en presisjon de ikke har. Konsekvensen skal sies rett ut: mengdene (liter, kWh) er de riktige å regne særavgift av, mens kronebeløpene ligger på 2022-nivå og dermed noe under 2026-forbruk i kroner.

## Ikrafttredelse midt i året
Enkelte regler — vedtatte og foreslåtte — trer i kraft en dato midt i 2026, ikke 1. januar (for eksempel barnetrygd fra 1. februar eller en momssats fra 1. september). Denne modellen pro-rerer ikke etter ikrafttredelsesdato; det er uttrykkelig utenfor omfanget (beslutning 1, 2026-09-25, `docs/sprint-2026-09.md`). Regelen vises i stedet som en **helårseffekt**: det årlige beløpet den ville gitt om den gjaldt hele 2026. Dette er et bevisst valg, ikke en forglemmelse — kalkulatoren sammenligner **politikknivåer** mellom partier (satser, beløp, terskler for et helt år), ikke en kontantstrømprognose for 2026 med delårsvirkning. Der en regels `effectiveDate` avviker fra 1. januar, viser partikortet ikrafttredelsesdatoen ved siden av regelen («gjelder fra …; vist som helårseffekt»).

## Avrunding
Alle beløp er hele kroner. Hver navngitt komponent avrundes én gang (halv opp, bort fra null). Summen av komponentene er per definisjon lik hovedtallet.

## Usikkerhet
Hver regel har status (`confirmed`, `estimated`, `unquantified`, `not-applicable`, `not-reviewed`). Bare `confirmed` og `estimated` inngår i hovedtallet. Forslag merket usikre (`uncertain: true`) er av som standard og kan slås på under «Mulige endringer». Full dekning per parti og kategori: `DATA_STATUS.md`.

## Personvern
All beregning skjer lokalt i nettleseren. Ingen økonomiske brukerdata sendes eller lagres.

---
Denne metodeteksten er lisensiert CC BY 4.0 — se [`LICENSE-DATA.md`](./LICENSE-DATA.md).
