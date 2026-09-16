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
status: review:queue/q-001-ssb-forbruksprofiler
result: datalaget og kartleggingen er gjort og verifisert (tsc rent, 138 tester gronne); migreringen, manifest-radene og METHODOLOGY star igjen. Fire nye SSB-arkiv ligger ukommitert-i-commit pa grenen: 14156 (inntektskvartiler — gjor noktern/hoy kildefestet i stedet for oppdiktede faktorer), 06076, 07459, 09654, 09007. LES kWh-advarselen i modulen for dette landes.
result: Køkjøringen 2026-09-15 avbrøt. Treet ~/dev/queue-partiskatt-001 (gren queue/q-001-ssb-forbruksprofiler, 0 commits) fikk samtidige skrivinger fra en annen agent som løser SAMME oppgave: mine arkiverte råfiler ble slettet og erstattet med filer under andre navn, og src/data/consumption-profiles.ts + src/tests/consumption-profiles.test.ts dukket opp uten at kjøringen hadde skrevet dem. Mine egne endringer (fire manifestrader + fire tekstuttrekk) er rullet tilbake; den andre agentens ucommittede filer er rørt. MERK 2026-09-16: briefs/queue-2026-09-15.md ble aldri skrevet og finnes ikke på noen gren — den utledningen er tapt. Grunnlaget som FINNES er commit faf0c7d (src/data/consumption-profiles.ts + testen + fem SSB-arkiv under sources/raw/); utled resten på nytt derfra, ikke fra denne noten.
result: Fullfort 2026-09-16 i 0be47ed pa queue/q-001-ssb-forbruksprofiler (pushet). Manifestrader for de fem arkivene, METHODOLOGY § Forbruksprofil med den faktiske utledningen, MethodView-teksten, src/provisional/ slettet, og testene for punkt 7. `npm run check` gronn (146 tester) og verify-porten passerer. Star til gjennomgang, ikke merget.
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

## Q-002 · Særavgifter: fysiske mengder kan justeres i avanserte felt
status: ready
lane: partiskatt-main

acceptance:
Brukeren kan overstyre de fysiske mengdene som særavgiftene regnes av, ikke bare
kronebeløpene per mva-kategori. I dag viser de avanserte feltene i
`src/views/CalculatorView.tsx` bare `spend`; `units` (liter bensin/diesel, kWh,
flyreiser, liter øl/vin/brennevin, sigaretter, gram snus — listen `EXCISE_GOODS`
i `src/types/profile.ts`) settes kun av forbruksprofilen, og reduceren i
`src/state/profile.ts` har allerede en handling for `units` som aldri sendes.

1. Én tallinput per `ExciseGood` under de avanserte feltene, med norsk etikett
   og enhetssuffiks (l, kWh, reiser, stk, gram), `inputMode="numeric"`, egen
   `<label for>`; verdier går gjennom den eksisterende reducer-handlingen og
   `sanitizeProfile` (ikke-negative heltall).
2. Bytte av forbruksprofil overskriver mengdene igjen (samme oppførsel som
   `spend` i dag); en manuelt endret mengde markerer profilen som `custom`.
3. Komponenttest `src/components/ExciseUnitsFields.test.tsx` (jsdom, som
   `PartyCard.test.tsx`): rendrer feltene, endrer bensinliter, og asserterer at
   `computeScenario` gir en annen `excise.petrolLitre`-komponent etterpå.
4. Ingen ny tilstand i URL; mobil 375 px uten horisontal scroll.

verify: `npm ci && npm run check && test -f src/components/ExciseUnitsFields.test.tsx && grep -q "ExciseUnitsFields" src/views/CalculatorView.tsx`

notes:
- Funn fra Codex-gjennomgang 2026-09-14 (FIX 5). Mønster for input: `src/components/MoneyInput.tsx` og `Field.tsx`.
- Engine-API er frosset (`src/engine/index.ts`); UI regner ingenting selv.

## Q-003 · Partikort viser status og kilde per regel
status: ready
lane: partiskatt-main

acceptance:
Et utvidet partikort (`src/components/PartyCard.tsx`) forklarer hvor hvert tall
kommer fra. PROJECT.md krever at status og kilde er synlig, ikke bare i
`/kilder`.

1. For hver komponent med `keptDelta !== 0` («Største årsaker» og resten bak
   en «vis alle»-knapp): norsk statusetikett (`DATA_STATUS_LABELS` i
   `src/utils/status-labels.ts`), kildens korttittel fra `sources/manifest.json`
   (via `src/data/sources.ts`), `pageOrTable` og `method` fra regelens
   provenance. Provenance hentes fra partiets regelsett i `DATA_BUNDLE`
   (`ruleOf` i `src/engine/rule-set.ts`), ikke fra UI-konstanter.
2. Ekskluderte regler (`result.excluded`) viser det samme, pluss grunnen som i
   dag; ingen rå engelske enum-verdier i UI.
3. Komponenttest `src/components/PartyCard.provenance.test.tsx`: for SV med
   fixture `medianSingle` rendres «Anslått», kildetittelen og «PDF p37» for
   trinnskatt-regelen.
4. Kortet er fortsatt lesbart på 375 px; provenance ligger bak utvidelsen, ikke
   i sammendraget.

verify: `npm ci && npm run check && test -f src/components/PartyCard.provenance.test.tsx && ! grep -n "({item.status})" src/components/PartyCard.tsx`

notes:
- Funn fra Codex-gjennomgang 2026-09-14 (FIX 6). Statusetiketten for ekskluderte regler er allerede byttet til norsk (2026-09-14); resten gjenstår.
- Kjør etter Q-002 (samme lane; begge rører kalkulator/kort-filer).

## Q-004 · Provenance-tester uten stille forbikoblinger
status: ready
lane: partiskatt-main

acceptance:
`src/tests/party-data.test.ts` skal ikke kunne bli grønn ved å hoppe over
tilfeller.

1. `party baselineParams vs proposed`: erstatt `if (!d.baselineParams) continue;`
   med en eksplisitt forventning — enten en allowlist over regler som SKAL bære
   `baselineParams`, eller `expect(withBaseline).toHaveLength(N)` der N er
   dagens faktiske antall (0 er lov, men må stå eksplisitt).
2. Ankertesten: `pageFromProvenance` som ikke kan tolke `pageOrTable` skal feile
   testen, ikke returnere; flersidige referanser («PDF p32; p119») må tolkes til
   alle sidene, og ankeret må finnes på minst én av dem.
3. `anchorOnPage`: sammenhengende frase (normalisert mellomrom/case, tall med
   og uten tusenskille), ikke uordnet ordforekomst; kjente layout-brudd får en
   eksplisitt allowlist med begrunnelse per oppføring.
4. Kjør testene mot dagens data og rett data eller allowlist der de feiler —
   aldri løsne regelen.

verify: `npm ci && npm run check && ! grep -n "if (!page) return;" src/tests/party-data.test.ts && ! grep -n "if (!d.baselineParams) continue;" src/tests/party-data.test.ts`

notes:
- Funn fra Codex-gjennomgang 2026-09-14 (FIX 9). Kildetekst: `sources/text/<party>.txt` per manifest-rad (`textFile`); les i vinduer, aldri hele filen i hovedtråden.
