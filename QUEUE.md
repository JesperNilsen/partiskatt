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
status: blocked:avvist i gjennomgang 2026-09-18 — erstattet av Q-010; settes done når Q-010 er flettet
result: datalaget og kartleggingen er gjort og verifisert (tsc rent, 138 tester gronne); migreringen, manifest-radene og METHODOLOGY star igjen. Fire nye SSB-arkiv ligger ukommitert-i-commit pa grenen: 14156 (inntektskvartiler — gjor noktern/hoy kildefestet i stedet for oppdiktede faktorer), 06076, 07459, 09654, 09007. LES kWh-advarselen i modulen for dette landes.
result: Køkjøringen 2026-09-15 avbrøt. Treet ~/dev/queue-partiskatt-001 (gren queue/q-001-ssb-forbruksprofiler, 0 commits) fikk samtidige skrivinger fra en annen agent som løser SAMME oppgave: mine arkiverte råfiler ble slettet og erstattet med filer under andre navn, og src/data/consumption-profiles.ts + src/tests/consumption-profiles.test.ts dukket opp uten at kjøringen hadde skrevet dem. Mine egne endringer (fire manifestrader + fire tekstuttrekk) er rullet tilbake; den andre agentens ucommittede filer er rørt. MERK 2026-09-16: briefs/queue-2026-09-15.md ble aldri skrevet og finnes ikke på noen gren — den utledningen er tapt. Grunnlaget som FINNES er commit faf0c7d (src/data/consumption-profiles.ts + testen + fem SSB-arkiv under sources/raw/); utled resten på nytt derfra, ikke fra denne noten.
result: Fullfort 2026-09-16 i 0be47ed pa queue/q-001-ssb-forbruksprofiler (pushet). Manifestrader for de fem arkivene, METHODOLOGY § Forbruksprofil med den faktiske utledningen, MethodView-teksten, src/provisional/ slettet, og testene for punkt 7. `npm run check` gronn (146 tester) og verify-porten passerer. Star til gjennomgang, ikke merget.
result: Avvist i gjennomgang 2026-09-18 (flightOther-frø blir stille 0; se noten nederst). IKKE kjørt på nytt: rettelsen og landingen av grenen er Q-010. Rydding 2026-09-24: grenen ligger som origin/rejected/q-001-ssb-forbruksprofiler (0be47ed), origin/queue/q-001-ssb-forbruksprofiler er slettet, worktreet ~/dev/queue-partiskatt-001 er fjernet. Denne posten holdt lanen stengt fra 2026-09-16 til 2026-09-24.
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

**Rejected on review 2026-09-18 — not re-run; superseded by Q-010, which lands this branch plus the fix.** `src/data/consumption-profiles.ts:337` — missing `flightOther` seeds are silently coerced to `0`, so standard profiles never apply outside-Europe flight passenger duty even though `flightOther` is a modelled excise good and is taxed in `src/data/baseline/2026/adopted.ts:221`. Only `flightEurope` is seeded (lines 251/278/305).

Full verdict with cited evidence: `~/Claude programmer/briefs/queue-review-2026-09-18.md`.
The rejected work is preserved as `origin/rejected/q-001-ssb-forbruksprofiler` (0be47ed);
the `queue/` branch was deleted on origin 2026-09-24 so it no longer blocks the lane.
Q-010 must fix the defect above, not re-litigate it.

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

## Q-005 · Motortest: minstefradrag med både lønn og pensjon
status: ready
lane: partiskatt-main

acceptance:
`minimumDeduction` i `src/engine/income-tax.ts:18-30` har en egen gren for
husholdninger med både lønn og pensjon (`total = maxK(wagePart, minK(add(wagePart,
pensionPart), w.max))`), men ingen fixture i `src/tests/fixtures.ts` setter
`pensionIncome` til noe annet enn `kr(0)` (linje 8). Grenen er altså ikke dekket av
`npm run check` i det hele tatt.

1. Ny `src/engine/income-tax.test.ts` kaller `minimumDeduction` og
   `socialSecurity` direkte — begge er eksportert fra `src/engine/income-tax.ts` —
   mot `resolveBaseline(ADOPTED_2026)`. Ikke gjennom UI, ikke gjennom fixtures.
2. `minimumDeduction(kr(100_000), kr(300_000), adopted)` skal gi
   `{ wagePart: 46000, pensionPart: 75400, total: 95700 }`. Tallene er kontrollregnet
   mot `adopted.ts:124` (46 pst, tak 95 700) og `:139` (40 pst, tak 75 400), ikke
   kopiert: 46 pst av 100 000 = 46 000; 40 pst av 300 000 = 120 000, kappet til
   75 400; `total` = maks(46 000, min(121 400, 95 700)) = 95 700.
3. `socialSecurity` testes med pensjon ulik null, siden trygdeavgiften har egen
   sats for pensjonsinntekt.
4. ANTI-VAKUITET: endre midlertidig `total` til `total = wagePart`. Den nye testen
   skal bli rød (46 000 ≠ 95 700) mens alle eksisterende tester forblir grønne.
   Skriv den observerte røde utgangen i `result:`. En naiv sum (121 400) skal også
   feile.

verify: `npm ci && npm run test -- income-tax && npm run check`

notes:
- Høstet 2026-09-16 av en Explore-miner; tallene er etterregnet for hånd før posten
  ble skrevet, ikke overtatt fra mineren.
- Kolliderer ikke med Q-001→Q-003: rører verken `CalculatorView.tsx` eller
  partikort-filene.

## Q-006 · Motortest: utvidet barnetrygd for enslig forsørger
status: ready
lane: partiskatt-main

acceptance:
`computeBenefits` (`src/engine/benefits.ts:16-17`) gir `extendedSingleParentPerMonth`
når `profile.adults.length === 1 && profile.childrenAges.length > 0`. Ingen fixture
har én voksen med barn, så den grenen er død i testsuiten — enda den styrer omtrent
30 864 kr/år.

1. Ny `src/engine/benefits.test.ts` kaller `computeBenefits` med én voksen og to
   barn (4 og 10 år) mot `resolveBaseline(ADOPTED_2026)`.
2. Beløpet skal være `79152` = 12 × (2 012 + 2 012 + 2 572), kontrollregnet mot
   `adopted.ts:261-264` (`under6PerMonth` og `from6PerMonth` er begge kr 2 012,
   `extendedSingleParentPerMonth` er kr 2 572).
3. ANTI-VAKUITET: sett `extended = 0` i `src/engine/benefits.ts`. Bare den nye
   testen skal gå rød, og den skal gå fra 79 152 til **48 288** (12 × 4 024).
   MERK: minerens notat oppga 72 432 her — det er feil, det svarer til tre barn.
   Bruk 48 288, eller regn det ut på nytt fra satsene og si hva du fikk.

verify: `npm ci && npm run test -- benefits && npm run check`

notes:
- Høstet 2026-09-16. Feilen i minerens anti-vakuitetstall ble fanget ved
  etterregning før posten ble skrevet — ikke stol på oppgitte deltaer uten å regne.
- Kolliderer ikke med Q-001→Q-003.

## Q-007 · Motortest: gjeldsfordeling i formuesskatten over flere klasser
status: ready
lane: partiskatt-main

acceptance:
Ingenting fester i dag den pro rata gjeldsfordelingen eller rabatten per klasse i
`computeWealthTax` (`src/engine/wealth-tax.ts:33-47`). `invariants.test.ts` sjekker
bare at komponentene summerer til `net`, som er blind for en intern formelfeil.

1. Ny `src/engine/wealth-tax.test.ts` kaller `computeWealthTax` direkte mot
   `resolveBaseline(ADOPTED_2026)` med én voksen og: primærbolig 2 mill.,
   sekundærbolig 3 mill., børsnoterte aksjer 5 mill., bankinnskudd 1 mill., annen
   formue 2 mill., gjeld 6 mill.
2. Assertér `gjeldsreduksjon === 738461`, `nettoformue === 4638461` og
   `amount === 27385`. Alle tre er etterregnet for hånd mot `adopted.ts:150-170`
   (verdsettelse 25/100/80/100/70 pst, `debtReductionApplies.secondaryHome: false`,
   bunnfradrag 1,9 mill., trinn 1 på 1,0 pst) og stemmer.
3. ANTI-VAKUITET: sett `debtReductionApplies.secondaryHome` til `true`. De nye
   tallene skal slutte å stemme mens `invariants.test.ts` forblir grønn — det er
   nettopp den blindsonen posten lukker. Skriv den observerte differansen i `result:`.

verify: `npm ci && npm run test -- wealth-tax && npm run check`

notes:
- Høstet 2026-09-16; alle tre tallene er uavhengig etterregnet før posten ble
  skrevet, inkludert avrundingen i `toKroner` (halve kroner rundes opp — hvis
  implementasjonen trunkerer i stedet, blir 738 461 til 738 459, og da er det
  avrundingsregelen som skal dokumenteres, ikke testen som skal justeres).
- Kolliderer ikke med Q-001→Q-003.

## Q-008 · Integritetssjekk av sha256/bytes i kildemanifestet
status: ready
lane: partiskatt-main

acceptance:
`sources/manifest.json` har `sha256` og `bytes` på hver arkivert kilde, men
ingenting verifiserer dem noen gang — feltene er typet og så glemt. En råfil kunne
vært hentet på nytt, avkortet eller håndredigert uten at manifestet merket det.

1. Ny `src/content/manifest-integrity.test.ts` itererer over hver post i
   `sources/manifest.json` med `status: 'archived'` og en `rawFile` (målt
   2026-09-16: 39 av 41 poster), leser filen fra disk og asserterer at
   `createHash('sha256').update(buf).digest('hex') === entry.sha256` og
   `buf.length === entry.bytes`.
2. Feilmeldingen navngir post-id og hvilket av de to feltene som sprikte, med
   forventet og funnet verdi. En test som bare sier «mismatch» er ikke nok til å
   finne filen igjen.
3. Manglende råfil er en feil, ikke et hopp over. En post som peker på en fil som
   ikke finnes skal gjøre testen rød.
4. ANTI-VAKUITET: endre siste byte i én committet råfil. Testen skal bli rød og
   navngi nettopp den posten. Skriv den observerte utgangen i `result:`.

verify: `npm ci && npm run test -- manifest-integrity && npm run check`

notes:
- Høstet 2026-09-16. 39 arkiverte poster, ca. 38 MB til sammen — hashes offline på
  én kjøring, ingen nett.
- Evidens: `sources/manifest.json` (toppnivå er en liste); `src/data/sources.ts:1-22`.
- Kolliderer ikke med Q-001→Q-003.

## Q-009 · data-status.ts: ingen stille bortfall av uklassifiserte forbruksavgifter
status: ready
lane: partiskatt-main

acceptance:
`unquantifiedForColumn` (`src/data/data-status.ts:95-104`) fordeler uklassifiserte
`consumption-tax`-forslag mellom «Moms» og «Særavgifter» med to regex-er over den
norske tittelen. Et forslag som treffer ingen av dem **forsvinner stille** fra både
`DATA_STATUS.md` og `/kilder`; et som treffer begge telles i to kolonner.

1. Kast en feil (i produksjonskoden, ikke bare i en test) når et
   `consumption-tax`-forslag treffer null eller begge regex-er. Meldingen navngir
   parti og tittel.
2. Ny `src/data/data-status.test.ts` beviser at et syntetisk forslag med tittel
   f.eks. `"Fjerne CO2-kompensasjon"` kaster i stedet for å forsvinne, og at et
   forslag som treffer begge også kaster.
3. Dagens ekte data har ingen tittel som treffer null — derfor må testen bruke et
   syntetisk tilfelle. Ikke «fiks» dette ved å legge til flere ord i regex-en; det
   er stillheten som er feilen, ikke ordlisten.
4. ANTI-VAKUITET: gå tilbake til et stille `return false`. Den nye testen skal være
   den eneste som blir rød.

verify: `npm ci && npm run test -- data-status && npm run check`

notes:
- Høstet 2026-09-16, etterprøvd i kildekoden: `src/data/data-status.ts:95-104` og
  `:118-127`. Eksempler på uklassifiserte forbruksavgiftsforslag i dagens data:
  `src/data/parties/frp.ts:52`, `src/data/parties/v.ts:57`.
- Kolliderer ikke med Q-001→Q-003.

## Q-010 · Forbruksprofiler: `flightOther`-frø og landing av Q-001-grenen
status: ready
lane: partiskatt-main

acceptance:
Q-001-grenen ble avvist i gjennomgang 2026-09-18
(`~/Claude programmer/briefs/queue-review-2026-09-18.md` § partiskatt). Feilen er en
klasse, ikke ett tall: `ProfileSeed.units` er `Partial<Record<ExciseGood, number>>`
(`src/data/consumption-profiles.ts:218` på grenen) og `consumptionFor` gjør
`seed.units[good] ?? 0` (`:337`), så en avgiftsvare som mangler i et frø blir stille 0.
`flightOther` mangler i alle tre frø — bare `flightEurope` er satt (`:251/:278/:305`) —
så standardprofilene betaler aldri flypassasjeravgift utenfor Europa (350 kr per reise,
`src/data/baseline/2026/adopted.ts:221`) selv om varen er modellert og prises i motoren.
Posten lander HELE Q-001-arbeidet pluss rettelsen; den skal ikke utlede Q-001 på nytt og
ikke re-forhandle avvisningen.

1. **Base.** Grenen lages fra `main` som vanlig; flett så inn
   `origin/rejected/q-001-ssb-forbruksprofiler` (0be47ed = faf0c7d + 0be47ed over
   abe84e4; rører ikke `QUEUE.md`). Q-001-porten skal fortsatt passere etterpå (den
   står i `verify:` under). Ikke rør kWh-advarselen eller KPI-valget i modulen.
2. **Klassen.** `ProfileSeed.spend` blir `Record<VatCategory, number>` og
   `ProfileSeed.units` blir `Record<ExciseGood, number>` — komplette, ikke `Partial` —
   og begge `?? 0` i `consumptionFor` fjernes. Da nekter tsc et frø som mangler en
   kategori eller vare; det er hele poenget.
3. **Instansen.** `flights`-kronene (07.3.3: 2 800 / 3 200 / 4 500 kr per person)
   deles i Europa- og utenfor-Europa-reiser med en EKSPLISITT andel og en egen pris
   per langdistansereise. Andel og pris hentes fra en arkivert offisiell kilde
   (manifestrad) hvis en finnes; ellers står de som `ANSLAG` med `sourceId: null` i
   `UNIT_PRICES_2022`-stil, nøyaktig som dagens 1 500-kr-pris (`:189`). Kronene
   deles, de legges ikke til: `flightEurope·prisEuropa + flightOther·prisUtenfor`
   = `spend.flights` per frø innenfor 1 kr. Frøene lagres UAVRUNDET per person
   (desimaler er lov); `consumptionFor` runder én gang per husholdning, som i dag.
   Ikke rund til hele reiser per person først — det er dobbeltavrundingen som gjør
   0,4 reiser til 0. METHODOLOGY § Forbruksprofil og MethodView-avsnittet sier
   andelen, prisen og at verdien er et forventet antall reiser per år.
4. **Tester** i `src/tests/consumption-profiles.test.ts`:
   (a) hvert frø har hver nøkkel i `EXCISE_GOODS` og hver i `VAT_CATEGORIES` med et
   endelig tall — feilmeldingen navngir frø og nøkkel;
   (b) kroneidentiteten i punkt 3 for hvert frø;
   (c) gjennom motoren: `computeScenario(sanitizeProfile(...), rs, rs)` for `hoy` med
   2 voksne + 2 barn gir `excise.flightOther` > 0 (bruk `amount`-mønsteret fra
   `src/tests/profiles.test.ts:10`). Hvis (c) blir rød med en ærlig andel, er feilen
   i avrundingskjeden (punkt 3), ikke i andelen.
5. **ANTI-VAKUITET**, to retninger, begge observert og skrevet i `result:`:
   (i) med rettelsen på plass: slett `flightOther:` fra ett frø → `npm run check`
   skal bli rød allerede i typecheck; (ii) sett typen midlertidig tilbake til
   `Partial` og gjeninnfør `?? 0` med samme frø slettet → test (a) skal bli rød og
   navngi frøet og `flightOther`, og (c) skal bli rød.

verify: `npm ci && npm run check && test ! -e src/provisional && ! grep -rqE "PROFILES_ARE_PROVISIONAL|fra SSB ennå|koblet på i datalaget" src && test -f src/tests/consumption-profiles.test.ts && ! grep -qE 'Partial<Record<(ExciseGood|VatCategory)' src/data/consumption-profiles.ts && ! grep -qE 'seed\.(units|spend)\[[a-z]+\] \?\? 0' src/data/consumption-profiles.ts && [ "$(grep -cE '^\s+flightOther:' src/data/consumption-profiles.ts)" -ge 3 ] && grep -q "flightOther" src/tests/consumption-profiles.test.ts`

notes:
- Avvist arbeid: `origin/rejected/q-001-ssb-forbruksprofiler` (0be47ed). Q-001 står
  `blocked:` og settes `done` i samme gjennomgang som fletter denne.
- Rekkefølge: kjør før Q-002/Q-003 (grenen rører `CalculatorView.tsx` og
  `MethodView.tsx`). Hvis Q-002 likevel er flettet først: løs konflikten i
  `CalculatorView.tsx` til fordel for main og behold bare importbyttet til den nye
  modulen.
- Kildeidé for andelen, hvis den skal kildefestes: Avinors trafikkstatistikk og
  SSB 08507 skiller innenlands/utenlands, ikke Europa/utenfor Europa — si det, og
  bruk anslag hvis skillet ikke finnes offisielt. Ikke les PDF-er i hovedtråden.
- Gate 3 (Skatteetaten-kryssjekk) gjelder ikke profilene; alt forblir `estimated`.
