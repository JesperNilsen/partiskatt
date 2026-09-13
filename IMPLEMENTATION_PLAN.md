# Implementeringsplan — Partiskatt MVP

Autoritativ produktkontekst: `PROJECT.md`. Denne filen er fremdriftsloggen og overleveringsdokumentet mellom økter. Hver fase har en port (gate) som må passere før neste fase.

## Faser

| # | Fase | Port | Status |
|---|------|------|--------|
| S0 | Repo, Vite/TS-strict/Vitest/CSS-tokens/CI/netlify.toml, privat remote | `npm run check` grønn; CI grønn | ☑ 2026-09-13 |
| S1 | (subagent kjørte 2026-09-13 — sjekk `sources/manifest.baseline.json` + `sources/worksheets/baseline-2026.md`) Referansekilder arkivert (Lovdata-vedtak, Prop. 1 LS Tabell 1.7, Innst. 2/3 S, Skatteetaten, NAV, Lånekassen, SSB FBU) + `sources/worksheets/baseline-2026.md` | manifest med sha256 for alle; kryssjekk Lovdata↔Skatteetaten | ☐ |
| S2 | `src/types/` + `src/engine/money.ts` | money-tester, tsc rent | ☑ 2026-09-13 (RatePerUnit = 1/10 000 kr per enhet, ikke øre) |
| S3 | Beregningsmotor + `data/baseline/2026/adopted.ts` | invarianter + terskelmatrise + fem profiler grønne | ☐ |
| S4 | `proposed.ts` + `forlik.ts` | forlik-diff-test passerer; Ap = 0 | ☐ |
| S5 | Åtte partibudsjetter hentet, `pdftotext`, manifest (V og R evt. `operator`) | manifestrader for alle 9 | ☑ 2026-09-13 (alle 8 hentet; V via --http1.1+Referer, R via Wayback) |
| S6 | Uavhengig dobbel ekstraksjon per parti (Claude-subagent + Codex) → `reconciled.md` | avstemte ark finnes; uenigheter listet | ☐ |
| S7 | `data/parties/*.ts` kun fra avstemte ark; `DATA_STATUS.md` generert | provenance-, anker- og baseline-tester grønne | ☐ |
| S8 | Brukergrensesnitt mot frosset motor-API | fem profiler rendrer; brytere virker; ingen URL-tilstand | ☐ |
| S9 | `METHODOLOGY.md`, `CORRECTIONS.md`, README, `/metode`, `/kilder` | hver antagelse i kode har et metodeavsnitt | ☐ |
| S10 | Mobilsjekk 375/390 px, produksjonsbygg, push, deploy-steg | `vite build` ok; CI grønn; skjermbilde | ☐ |

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

## Neste økt (overlevering 2026-09-13, økt stoppet ved kontekst-tak)
1. Les `sources/manifest.baseline.json` og `sources/worksheets/baseline-2026.md` (S1-agentens leveranse). Slå sammen `manifest.baseline.json` + `manifest.parties.json` → `sources/manifest.json`.
2. S6 kan starte nå: mal i `sources/worksheets/TEMPLATE.md`; tekstfiler i `sources/text/<parti>-alt-2026.txt`; `summaryTablePages` i `sources/manifest.parties.json`. Én isolert subagent per parti → `<parti>.claude.md`; Codex via `~/.claude/bin/delegate --to codex --mode consult` → `<parti>.codex.md`; deretter `scripts/reconcile.ts`.
3. S3 parallelt i hovedtråden: `src/engine/{formulas,income-tax,wealth-tax,consumption,benefits,employer-contribution,resolve,calculate-scenario}.ts` mot `src/types/` (frosset). Parti = `adopted` overlagt med partiets absolutte verdier (ikke `proposed ⊕ delta`), se designvalg over.
