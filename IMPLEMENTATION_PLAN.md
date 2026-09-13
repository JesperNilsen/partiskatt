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
4. Offentlig repo og endelig merkenavn: begge er ett-token-endringer (`src/config/brand.ts`).

## Neste økt (overlevering 2026-09-13 kl. 18:55)
1. **MVP-koden er komplett på `main`** — S0–S10 ☑. `feat/ui` og `feat/wire-data` er slått sammen (fast-forward til `cdd3ef0`) og worktrees/grener fjernet; `npm run check` grønn (typecheck, tester, reconcile-gate, data-status-gate, build).
2. **Beslutninger tatt av Jesper 2026-09-13, alle encodet:** (a) proposed barnetrygd 1 968 kr/mnd beholdes som encodet (`estimated`, Innst. 2 S); (b) primærbolig **14 mill.** bekreftet — endringslov 23.06.2026 nr. 66 Del II, «verknad frå og med inntektsåret 2026», arkivert som `lovdata-endringslov-2026-06-23-66` (manifest 41 rader); Prop. 1 LS/SE-FU (10 mill.) er eldre enn lovendringen; (c) **K1** encodet som `income.socialSecurity` nedre grense 150 000 kr (`estimated`, K1-note) for H/FrP/SV/Rødt, `KNOWN_KNOTS` K1 `encoded: true`; (d) **K3** Venstre `excise.kwh` beholdes som absolutt 6 øre.
3. **Operatørporter (kun Jesper):** Netlify-kobling av repoet (`netlify.toml` klar, ingen `.netlify`-katalog); **gate 3** — kryssjekk de fem fixtures i `src/tests/fixtures.ts` mot Skatteetatens kalkulator før noe settes `confirmed` (i dag er ALT `estimated`); offentlig repo + navn.
4. **Rester:** forbruksprofilene i UI er midlertidige (`src/provisional/consumption-profiles.ts`, merket «midlertidige» i kalkulatoren) og ikke koblet til SSB 14100 i datalaget — PROJECT.md krever en redigerbar SSB-standardprofil (nøktern/typisk/høyt); bryterne for usikre regler og arbeidsgiveravgift er no-ops med dagens data (0 `uncertain`-regler, 0 `employer.contribution`-deltaer) — riktig, men verdt å vise i UI; røyktest 2026-09-13 (subagent): ingen konsollfeil, Ap = 0, ingen URL-tilstand, /metode og /kilder rendrer, ingen horisontal scroll ved 375 px; grenen `cursor/s7-party-data-bcc3` er slått sammen og kan slettes; KrF-vedlegget pp. 35–46 er tomt i pdftotext (25 NOT FOUND) — tabellbevisst re-ekstraksjon hvis KrF-tallene skal forbedres; K2/K4 står som flaggede knuter i `RECONCILIATION.md`.

## S1-funn (agentrapport 2026-09-13, filene er leveransen)
- `sources/manifest.json` (baseline-delen): 31 rader (30 arkivert, 1 blokkert: Skatteetatens `/satser/`-sider for fradrag finnes ikke; erstattet av `skatteetaten-forskuddsutskrivingen-2026` som har hele 2026-satstabellen). Særavgifter er ett Lovdata-vedtak per avgift (seks id-er). Konsolidert skatteloven kap. 4 arkivert fordi verdsettelsesreglene ikke står i skattevedtaket.
- Prop. 1 LS: Tabell 1.7 på PDF-side 33–37 (trykt 31–35); Tabell 1.8 (mva/særavgifter) PDF 38–43. Innst. 2 S / 3 S / 4 L arkivert.
- **Budsjettforlik:** flertall Ap + SV + Sp + Rødt + MDG (avtale 3. des. 2025); underliggende Ap–Sp–Rødt-forlik 29. nov. 2025 med «Skatt og avgift»-tabell i Innst. 2 S PDF s. 23–24. **15 endrede regler** (12 skatt/avgift, 3 ytelser) med Innst-id + side i `sources/worksheets/baseline-2026.md`; ni rader har vedtatt ≠ Prop. 1 LS. → grunnlag for `forlik.ts` (S4).
- SSB: tabell **14100** (Forbruksundersøkelsen 2022, kr per husholdning per år + andel), hentet via json-stat2; koder for 00/01/02/04.5/04.5.1/07/07.2.2/diesel/bensin notert.
- Lånekassen 2025–26 og 2026–27 arkivert. Barnetrygd endret 1. feb. 2026 (forlikets prisjustering), ingen aldersdeling.
- Flagg til S3: minstefradrag nedre grense finnes ikke (1 NOT FOUND); fem parametre står ikke i vedtaket men i skatteloven/folketrygdloven (verdier fra Forskuddsutskrivingen + Prop, samstemte); **primærbolig høy-verdi-trinn: uenighet** mellom skatteloven § 4-10(2)/Skatteetaten og Prop/Forskuddsutskrivingen (endring ved lov 23. juni 2026 nr. 66, RNB 2026, ikke arkivert) — bruk vedtatt-per-i-dag og marker `estimated` til avklart; CO2-avgift kvotepliktig bruk avviker mellom vedtak og Tabell 1.8 (rettebrev 12.11.2025 nevnt i Innst. 3 S) — irrelevant for husholdninger, noter i METHODOLOGY.
