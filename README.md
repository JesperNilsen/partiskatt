# Partiskatt (offentlig beta)

Kalkulator som viser hvor mange kroner mer eller mindre en person eller husholdning anslagsvis ville sittet igjen med under hvert stortingspartis alternative statsbudsjett for 2026, målt mot det vedtatte 2026-systemet.

## Metode (kort)

Referansen er det vedtatte 2026-systemet (Stortingets vedtak via Lovdata), ikke regjeringens opprinnelige forslag. Hvert opposisjonsparti overlegger bare de endringene partiet faktisk foreslår; alt annet følger referansen. Full metode, inkludert hva som inngår i hovedtallet og hvordan avrunding fungerer: `METHODOLOGY.md` / `/metode`.

**Statusmodell:** hver regel har status `confirmed`, `estimated`, `unquantified`, `not-applicable` eller `not-reviewed`. I dag er alt i produksjon `estimated` eller svakere — ingen regel er `confirmed` før den er kryssjekket mot Skatteetatens skattekalkulator per operatørport 3 (`docs/gate-3.md`). Bare `confirmed` og `estimated` teller i hovedtallet. Datadekning per parti og kategori: `DATA_STATUS.md` (generert, aldri redigert for hånd).

## Kilder

- `/kilder` i appen (speiler `sources/manifest.json` og `src/data/sources.ts`) — hver tallverdi kan spores til en arkivert kilde eller er et eksplisitt anslag (`ANSLAG`, `sourceId: null`).
- `docs/rights.md` — hva de underliggende kildene (offentlige dokumenter, partienes alternative budsjett, egne tekstuttrekk/arbeidsark) faktisk tillater ved republisering, og den åpne beslutningen om hva av `sources/` som skal følge en offentlig repo.

## Personvern

All beregning skjer i nettleseren. Ingen backend, ingen innlogging, ingen analyse — ingenting forlater enheten. Dette er ikke bare en påstand: `netlify.toml` setter `Content-Security-Policy` med `connect-src 'none'`, så nettleseren selv nekter appen å gjøre nettverkskall etter at siden er lastet.

## Lisens

- Kode: MIT (`LICENSE`).
- Metodetekst, dokumentasjon og de kodede tallene i `src/data/`: CC BY 4.0 (`LICENSE-DATA.md`).
- Tredjepartsfiler i `sources/` (rå PDF/HTML/CSV og tekstuttrekk/arbeidsark avledet fra dem) er **ikke** dekket av noen av disse lisensene og forblir under sine opprinnelige eiere sine vilkår — se `docs/rights.md`.

## Utviklerkommandoer

```bash
export PATH="$HOME/.local/node24/bin:$PATH"   # ingen global node/npm; se WORKSPACE.md
npm ci
npm run dev             # http://127.0.0.1:4893  (Vite dev-server, streng port)
npm run check           # typecheck + tester + reconcile --check + data-status --check + build
npm run gate3:sheet     # arbeidsark for operatørport 3, se docs/gate-3.md
```

`npm run preview` (etter `npm run build`) serveres på `http://127.0.0.1:4722`. Begge porter er `strictPort` i `vite.config.ts` — de feiler i stedet for å falle over på en annen port hvis de er i bruk.

## Deploy

Se `docs/deploy.md` for Netlify-oppsett og sjekklisten før repoet/siten går offentlig.

## Andre dokumenter

- Produktkontekst: `PROJECT.md` (autoritativ)
- Plan og fremdrift: `IMPLEMENTATION_PLAN.md`
- Rettelser: `/rettelseslogg` (speiler `CORRECTIONS.md`)
