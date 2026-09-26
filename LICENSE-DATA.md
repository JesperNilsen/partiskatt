# Licence for method text and encoded data — CC BY 4.0

Copyright (c) 2026 Jesper Nilsen.

The following are licensed under the **Creative Commons Attribution 4.0
International licence (CC BY 4.0)**: <https://creativecommons.org/licenses/by/4.0/>

- `METHODOLOGY.md`
- everything under `docs/` (including `docs/rights.md`, `docs/deploy.md`,
  `docs/gate-3.md`)
- the encoded numbers and rule structures in `src/data/` — the party rule
  sets (`src/data/parties/*`), the baseline/adopted rule set
  (`src/data/baseline/*`), provenance records (`src/data/provenance.ts`),
  knot definitions (`src/data/knots.ts`), consumption profiles
  (`src/data/consumption-profiles.ts`), and the source manifest entries in
  `src/data/sources.ts`
- `PROJECT.md`, `IMPLEMENTATION_PLAN.md`, `CORRECTIONS.md`, and the
  reconciliation worksheets under `sources/worksheets/` that this project
  itself authored (`*.claude.md`, `*.codex.md`, `*.reconciled.md`,
  `RECONCILIATION.md`, `baseline-2026.md`, `TEMPLATE.md`) — these are
  original analysis, not reproductions of the source documents they
  reference.

You are free to share and adapt this material for any purpose, including
commercially, as long as you give appropriate credit, provide a link to the
licence, and indicate if changes were made. Suggested attribution:

> "Partiskatt" method and data by Jesper Nilsen, used under CC BY 4.0.

## What this licence does **not** cover

The *code* that reads and renders this data (everything under `src/` other
than `src/data/`, plus `scripts/`) is licensed MIT — see [`LICENSE`](./LICENSE).

Third-party source material under `sources/` — the raw party PDFs/HTML, the
public-sector documents, the plain-text extracts of both, and the SSB JSON
downloads — is **not** licensed by this project. Those files remain under
their original publishers' terms, whatever those are. See
[`docs/rights.md`](./docs/rights.md) for the rights table and the open
decision on what of `sources/` should travel with a public repo.

Every number in `src/data/` cites a `sourceId` (or is an explicit `ANSLAG`
with `sourceId: null`); this licence covers Partiskatt's own encoding and
arithmetic, not the underlying facts or the documents cited as `sourceId`.
