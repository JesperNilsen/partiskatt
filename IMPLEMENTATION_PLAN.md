# Implementeringsplan — Partiskatt MVP

Autoritativ produktkontekst: `PROJECT.md`. Denne filen er fremdriftsloggen og overleveringsdokumentet mellom økter. Hver fase har en port (gate) som må passere før neste fase.

## Faser

| # | Fase | Port | Status |
|---|------|------|--------|
| S0 | Repo, Vite/TS-strict/Vitest/CSS-tokens/CI/netlify.toml, privat remote | `npm run check` grønn; CI grønn | ☑ 2026-09-13 |
| S1 | (subagent kjørte 2026-09-13 — sjekk `sources/manifest.json` + `sources/worksheets/baseline-2026.md`) Referansekilder arkivert (Lovdata-vedtak, Prop. 1 LS Tabell 1.7, Innst. 2/3 S, Skatteetaten, NAV, Lånekassen, SSB FBU) + `sources/worksheets/baseline-2026.md` | manifest med sha256 for alle; kryssjekk Lovdata↔Skatteetaten | ☑ 2026-09-13 (81ff3f9; manifest slått sammen → `sources/manifest.json`) |
| S2 | `src/types/` + `src/engine/money.ts` | money-tester, tsc rent | ☑ 2026-09-13 (RatePerUnit = 1/10 000 kr per enhet, ikke øre) |
| S3 | Beregningsmotor + `data/baseline/2026/adopted.ts` | invarianter + terskelmatrise + fem profiler grønne | ☑ 2026-09-13 (72 tester mot vedtatt 2026; alt `estimated`) |
| S4 | `proposed.ts` + `forlik.ts` | forlik-diff-test passerer; Ap = 0 | ☑ 2026-09-13 |
| S5 | Åtte partibudsjetter hentet, `pdftotext`, manifest (V og R evt. `operator`) | manifestrader for alle 9 | ☑ 2026-09-13 (alle 8 hentet; V via --http1.1+Referer, R via Wayback) |
| S6 | Uavhengig dobbel ekstraksjon per parti (Claude-subagent + Codex) → `reconciled.md` | avstemte ark finnes; uenigheter listet | ☑ 2026-09-13 (8 claude + 8 codex + 8 reconciled; 9f8f117) |
| S7 | `data/parties/*.ts` kun fra avstemte ark; `DATA_STATUS.md` generert | provenance-, anker- og baseline-tester grønne | ☑ 2026-09-13 |
| S8 | Brukergrensesnitt mot frosset motor-API | fem profiler rendrer; brytere virker; ingen URL-tilstand | ☑ 2026-09-13 (feat/ui) |
| S9 | `METHODOLOGY.md`, `CORRECTIONS.md`, README, `/metode`, `/kilder` | hver antagelse i kode har et metodeavsnitt | ☑ 2026-09-13 (feat/ui) |
| S10 | Mobilsjekk 375/390 px, produksjonsbygg, push, deploy-steg | `vite build` ok; CI grønn; skjermbilde | ☑ 2026-09-13 (feat/ui; Netlify-kobling = operatør) |

## Avhengigheter
- S1 og S5 kjører parallelt med S2–S4.
- S6 krever S5 (tekstfiler) og S2 (formel-ID-er i arbeidsark-malen).
- S7 krever S6 og S3. S8 krever S3 (API) og kan starte før S7 med Ap + én testparti.

## Sentrale designvalg (se også METHODOLOGY.md)
- Tre regelsett: `proposed` (Prop. 1 LS), `adopted` (Lovdata-vedtak = referanse), parti = `adopted` overlagt med partiets absolutte verdier for de reglene partiet faktisk foreslår endret. Partienes egne tall er formulert som avvik fra `proposed`; ekstraksjonen regner om til absolutte verdier og en test krever at partiets oppgitte utgangspunkt er lik `proposed`.
- Penger = hele kroner (heltall, branded type). Satser i basispunkter. Enhetsavgifter i øre. Én avrundingsfunksjon (halv opp, bort fra null), brukt én gang per navngitt komponent.
- `status` er eneste port inn i hovedtallet: `confirmed` og `estimated` telles; `unquantified`/`not-reviewed` vises, men telles aldri.
- Usikre forslag (`uncertain: true`) og arbeidsgiveravgift er av som standard.

## Operatørporter
1. Venstre- og Rødt-dokumenter dersom nettleserhenting også feiler: legg filen i `sources/raw/` og kjør `scripts/fetch-sources.sh --local`.
2. Koble GitHub-repoet til et nytt Netlify-site (byggeinnstillinger leses fra `netlify.toml`).
3. Manuell kontroll av referansesystemets totaler for de fem testprofilene mot Skatteetatens kalkulator før snapshot-verdiene fryses som `confirmed`.
4. Offentlig repo og endelig merkenavn: begge er ett-token-endringer (`src/config/brand.ts`). **2026-09-27: repoet skal være offentlig (ikke vippet ennå); merkenavnet er fortsatt åpent.**

## Neste økt (overlevering 2026-09-26, etter sprint 2026-09)
1. **Sprint 2026-09 ferdig** (`docs/sprint-2026-09.md`): alle 13 baner + L13 slått sammen, `main` = origin, ingen sprint-worktrees/-grener. `npm run check` 433 tester + `npm run e2e` 15 grønne; begge CI-jobbene (check + e2e) grønne på origin. QUEUE Q-001…Q-010 `done`.
2. **Data etter sprinten:** ikke-gjennomgåtte celler 12 → 0; `unquantified`-celler i tabellen 9 → 29 (sveipet fant forslag skjult bak feil «ingen endring»); 48 `unquantified`-linjer i partidataene; K2 lukket, K1 og K4 åpne; `KWH_IS_ESTIMATED` fjernet (SSB 10572, 14 964 kWh); fly langdistanse-andel 0,2 / pris 7 500 fortsatt `ANSLAG`; 0 regler `confirmed`.
3. **Kildegjennomgang 2026-09-26 (L13, Codex PASS):** SV-personfradrag 143 000 er riktig (sv-alt:2159, «−24 000» påløpt; SV sier selv lettelse under 800 000, økning over 1 mill.). Rettet: H trygdeavgift 7,6 → 7,7 (reverserer regjeringens kutt); FrP/Sp trinn 4–5 hadde arvet Prop.-satser 16,7/17,7 → vedtatt 16,8/17,8; Sp boliggrense 10,21 mill. snudde fortegn mot vedtatt 14 mill. → står som vedtatt. Nye `unquantified`-linjer: H jobbfradrag (4 300 kr, −12 370 mill.) og pensjonsfradrag, R rentefradragstak 8 mill., V forbrukslån/reisefradrag. Regel: parametre partiet ikke rører, bygges fra vedtatt — `proposedParams` bare i `baselineParams`.
4. **Kjent skjevhet i hovedtallet:** H vises som skatteøkning for lønnstakere med standardvalgene: jobbfradraget er modellert (L14, beslutning Jesper 2026-09-26) som flat 4 300 kr per voksen med lønn, begrenset til skatten, men merket `uncertain` — teller bare med «usikre forslag» på (H 600k: −691 av / +3 609 på). Tilsvarende ensidighet: MDG (bunnfradrag 10 mill. med, rabattkutt ikke), KrF (aksjerabatt med, boliger over 8 mill. ikke), Sp (sammenslått trinn 4/5 ikke). R/SV bruker Prop.-grensen 10 mill. for primærbolig mot vedtatt 14 mill. — beholdt som partienes bokstavelige forslag (beslutning Jesper 2026-09-27).
5. **Jespers brytere:** gate 3 via `docs/gate-3.md` (+ om flere fixtures skal legges til — i dag kan bare generalRate, bracketTax og personalAllowance bli `confirmed`); Netlify-kobling (`docs/deploy.md`); rettighetsvalg for parti-PDF-ene før offentlig (`docs/rights.md`); navnet.
6. **Rester:** bare voksen 1 har kapitalinntekt/rentefelt i UI; `playwright.config.ts` har fast port 4912 med `reuseExistingServer` (parallelle worktrees kan teste hverandres server — gjør porten overstyrbar); `employer.contribution`: ingen parti endrer arbeidsgiveravgiften, bryteren er deaktivert med grunn.

## S1-funn (agentrapport 2026-09-13, filene er leveransen)
- `sources/manifest.json` (baseline-delen): 31 rader (30 arkivert, 1 blokkert: Skatteetatens `/satser/`-sider for fradrag finnes ikke; erstattet av `skatteetaten-forskuddsutskrivingen-2026` som har hele 2026-satstabellen). Særavgifter er ett Lovdata-vedtak per avgift (seks id-er). Konsolidert skatteloven kap. 4 arkivert fordi verdsettelsesreglene ikke står i skattevedtaket.
- Prop. 1 LS: Tabell 1.7 på PDF-side 33–37 (trykt 31–35); Tabell 1.8 (mva/særavgifter) PDF 38–43. Innst. 2 S / 3 S / 4 L arkivert.
- **Budsjettforlik:** flertall Ap + SV + Sp + Rødt + MDG (avtale 3. des. 2025); underliggende Ap–Sp–Rødt-forlik 29. nov. 2025 med «Skatt og avgift»-tabell i Innst. 2 S PDF s. 23–24. **15 endrede regler** (12 skatt/avgift, 3 ytelser) med Innst-id + side i `sources/worksheets/baseline-2026.md`; ni rader har vedtatt ≠ Prop. 1 LS. → grunnlag for `forlik.ts` (S4).
- SSB: tabell **14100** (Forbruksundersøkelsen 2022, kr per husholdning per år + andel), hentet via json-stat2; koder for 00/01/02/04.5/04.5.1/07/07.2.2/diesel/bensin notert.
- Lånekassen 2025–26 og 2026–27 arkivert. Barnetrygd endret 1. feb. 2026 (forlikets prisjustering), ingen aldersdeling.
- Flagg til S3: minstefradrag nedre grense finnes ikke (1 NOT FOUND); fem parametre står ikke i vedtaket men i skatteloven/folketrygdloven (verdier fra Forskuddsutskrivingen + Prop, samstemte); **primærbolig høy-verdi-trinn: uenighet** mellom skatteloven § 4-10(2)/Skatteetaten og Prop/Forskuddsutskrivingen (endring ved lov 23. juni 2026 nr. 66, RNB 2026, ikke arkivert) — bruk vedtatt-per-i-dag og marker `estimated` til avklart; CO2-avgift kvotepliktig bruk avviker mellom vedtak og Tabell 1.8 (rettebrev 12.11.2025 nevnt i Innst. 3 S) — irrelevant for husholdninger, noter i METHODOLOGY.
