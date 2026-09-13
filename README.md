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
npm run dev     # http://127.0.0.1:4721
```

## Netlify-deploy (operatør)

1. Koble GitHub-repoet til et nytt Netlify-site (byggeinnstillinger leses fra `netlify.toml`).
2. Sett produksjonsbranch til `main` når UI og datalag er merget.
3. `npm run check` kjører automatisk ved deploy (`build.command`); publiseringsmappe er `dist/`.
4. SPA-ruting og sikkerhetsheadere er konfigurert i `netlify.toml` — ingen ekstra steg.
5. Verifiser mobilvisning (375/390 px) og at beta-banner, metode, kilder og rettelseslogg er tilgjengelige.
