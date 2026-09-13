# Partiskatt (offentlig beta)

Kalkulator som viser hvor mange kroner mer eller mindre en person eller husholdning anslagsvis ville sittet igjen med under hvert stortingspartis alternative statsbudsjett for 2026, målt mot det vedtatte 2026-systemet.

- Produktkontekst: `PROJECT.md` (autoritativ)
- Plan og fremdrift: `IMPLEMENTATION_PLAN.md`
- Datadekning per parti og kategori: `DATA_STATUS.md` (generert)
- Metode: `/metode` · Kilder: `/kilder` · Rettelser: `/rettelseslogg` (speiler `METHODOLOGY.md` og `CORRECTIONS.md`)
- Kilder: `sources/manifest.json` + `src/data/sources.ts`

All beregning skjer i nettleseren. Ingen backend, ingen innlogging, ingen analyse.

```bash
npm ci
npm run check   # typecheck + tester + datastatus + produksjonsbygg
npm run dev
```
