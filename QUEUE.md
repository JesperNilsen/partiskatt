# Arbeidskø — partiskatt

Tømmes nattlig av den planlagte oppgaven `queue-runner`. Den jobber i en isolert
worktree, porter på hver posts `verify:`-kommando og etterlater en
`queue/<id>-<slug>`-gren til gjennomgang. **Den fletter, pusher eller deployer aldri.**

### Kontrakt for en post

```
(overskrift: '## Q-NNN · Kort tittel' — en '## Q-'-overskrift er det som gjør en post)
status: <ready | blocked:HVA | running:GREN | review:GREN | done>
lane: <én kjørende oppgave per lane>
acceptance: hva «ferdig» betyr, slik at noen andre kan sjekke det
verify: en kommando som faktisk FEILER når arbeidet er galt
notes: pekere, tidligere arbeid, commits å følge
```

En post uten en reell `verify:`-port er ikke klar for ubevoktet kjøring — runneren
merker den `blocked:no verify gate` i stedet for å gjette. Hold postene avgrenset:
én gren til gjennomgang per post. En fersk worktree har ingen `node_modules`:
kjør `npm ci` før noe annet.

## Q-001 · Forbruksprofiler fra SSB 14100 i datalaget
status: ready
lane: partiskatt-main

acceptance:
Kalkulatorens tre forbruksprofiler (`noktern` / `typisk` / `hoy`) kommer fra den
arkiverte SSB-forbruksundersøkelsen, ikke fra runde plassholdere. PROJECT.md
krever «en redigerbar standardprofil basert på SSB-data» med minst mat,
alminnelige varer og tjenester, transport og drivstoff, strøm, alkohol/tobakk
og flyreiser skilt fra hverandre.

1. **Ny modul `src/data/consumption-profiles.ts`** erstatter
   `src/provisional/consumption-profiles.ts`, og katalogen `src/provisional/`
   slettes. Samme offentlige flate som i dag: `CONSUMPTION_PROFILES`
   (id/label/blurb), `consumptionFor(id, adults, children): Consumption` og
   `equivalenceFactor` (OECD-modifisert skala beholdes: 1 + 0,5 per ekstra
   voksen + 0,3 per barn). `src/state/profile.ts` og
   `src/views/CalculatorView.tsx` importerer fra den nye modulen.
2. **Kroner fra SSB.** Kilden er `sources/raw/ssb-fbu-14100.json` (manifest-id
   `ssb-fbu-14100`; json-stat2 med 510 COICOP-grupper × `Utgift` i kr per
   husholdning per år, 2022) pluss metadataene `ssb-fbu-14100-meta`. Kartlegg
   COICOP → `VatCategory` slik: `food` = 01; `alcoholTobacco` = 02;
   `electricity` = 04.5.1; `fuel` = 07.2.2; `transportServices` = 07.3 minus
   fly; `flights` = flyreiser under 07.3; `exempt` = mva-frie grupper (husleie
   04.1, helse 06, utdanning 10, forsikring/finans 12 — dokumenter listen);
   `general` = 00 minus alt over. Kontrollsum: kategoriene summerer til gruppe
   00 innenfor avrunding, og en test asserterer det.
3. **Fra husholdning til enkeltperson.** `typisk` er SSB-gjennomsnittet per
   husholdning delt på gjennomsnittshusholdningens ekvivalensfaktor (samme
   OECD-skala). Gjennomsnittlig husholdningsstørrelse/-sammensetning for FBU
   2022 hentes fra SSB og arkiveres i `sources/` + `sources/manifest.json`
   (sha256 + bytes) hvis den ikke finnes fra før. `noktern` og `hoy` er
   dokumenterte faktorer av `typisk` (eller hentet fra en arkivert SSB-tabell
   med inntektsgrupper, hvis en finnes); faktorene og begrunnelsen står i
   `METHODOLOGY.md` og i modulens provenance-kommentar.
4. **Fysiske mengder** (`units`: liter bensin/diesel, kWh, flyreiser, liter
   øl/vin/brennevin, sigaretter, gram snus) utledes som kroner ÷ dokumentert
   gjennomsnittspris 2022 per enhet, hver pris med arkivert kilde
   (manifest-id). Der ingen offisiell pris finnes, merkes mengden eksplisitt
   som anslag i provenance-kommentaren. Ingen tall i modulen uten kilde eller
   merket anslag.
5. **2022 → 2026.** Si eksplisitt i `METHODOLOGY.md` om 2022-kroner brukes
   uendret eller løftes med KPI (arkiver KPI-faktoren hvis den brukes). Begge
   er greit; udokumentert er ikke greit.
6. **UI-tekst.** `PROFILES_ARE_PROVISIONAL` og de tre «midlertidige»-notisene
   (`src/components/DataBanner.tsx`, `src/views/CalculatorView.tsx`,
   `src/views/MethodView.tsx`) fjernes. Avsnittet «Forbruksprofil» i
   `MethodView` beskriver utledningen (kilde, ekvivalensskala, faktorer,
   prisår). `/kilder` lister SSB-tabellen med manifest-id.
7. **Tester** i `src/tests/consumption-profiles.test.ts`: kontrollsum mot gruppe
   00; `noktern < typisk < hoy` per kategori; `consumptionFor` skalerer med
   ekvivalensfaktoren; alle manifest-id-er modulen refererer finnes i
   `sources/manifest.json`; ingen `NaN` eller negative verdier. `npm run check`
   grønn (typecheck, vitest, `reconcile --check`, `data-status --check`, build).

verify: `npm ci && npm run check && test ! -e src/provisional && ! grep -rqE "PROFILES_ARE_PROVISIONAL|fra SSB ennå|koblet på i datalaget" src && test -f src/tests/consumption-profiles.test.ts`

notes:
- Dagens plassholdere: `src/provisional/consumption-profiles.ts` (seed per
  enkeltperson: `spend` per `VatCategory`, `units` per `ExciseGood`; listene
  står i `src/types/profile.ts`). Behold formen, bytt tallene.
- Arkivlayout: rå fil i `sources/raw/`, tekst i `sources/text/`, én
  manifestrad med `sha256` + `bytes` (se de to SSB-radene som finnes). Aldri
  les `sources/text/*` eller hele json-stat-filen inn i hovedtråden; bruk
  node/jq for uttrekk.
- S1-notat med SSB-koder: `IMPLEMENTATION_PLAN.md` § S1-funn («SSB: tabell
  14100 …»).
- Alt i datalaget er `estimated` inntil operatørport 3 (Skatteetaten-kryssjekk);
  profilene inngår ikke i den porten, men provenance-disiplinen er den samme.
- Bakgrunn: røyktest 2026-09-13 fant at profilene er plassholdere; se
  `IMPLEMENTATION_PLAN.md` § Neste økt pkt. 4.
