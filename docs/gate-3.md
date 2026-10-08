# Operatørport 3: kryssjekk mot Skatteetatens skattekalkulator

Gate 3 er en datainnføring, ikke en kodeendring. Du taster de syv fixturene i
`src/tests/fixtures.ts` inn i Skatteetatens skattekalkulator, skriver av skattelinjene den viser
i `src/data/gate3-results.ts`, og kjører `npm run check`. Regler som stemmer, blir `confirmed`
av seg selv. Ingen status settes for hånd noe sted.

Dette dokumentet inneholder ingen forventede beløp. Alle tall, både det du skal taste og det
motoren forventer, skrives ut direkte fra koden:

```sh
export PATH="$HOME/.local/node24/bin:$PATH"
npm run gate3:sheet            # arbeidsark i markdown
npm run gate3:sheet -- --json  # samme data som JSON
```

## 1. Før du starter

- Kalkulator: <https://skattekalkulator.formueinntekt.skatt.skatteetaten.no/> (lenket fra
  skatteetaten.no → Skattekalkulator). Du trenger ikke logge inn, og tall du legger inn der blir
  ikke lagret.
- Bruk inntektsåret 2026. Skriv ned dato og det du ser av versjonsinformasjon, for eksempel
  bunntekst eller «sist oppdatert».

## 2. Per fixture (arbeidsarket viser hvert felt)

Arbeidsarket har tre deler for hver fixture:

1. **Oppsett.** Svarene på spørsmålene i «Tilpass skattekalkulatoren»: år, sivilstatus og
   fødselsår. I tillegg står det hvilke avkrysningsbokser som skal stå tomme.
   Fødselsåret står per fixture (`FIXTURE_BIRTH_YEAR` i `src/tests/fixtures.ts`). Motoren
   modellerer ingen aldersregler. Lønnstakerne er født 1980, utenfor årskullene som får
   «Arbeidsfradrag for unge». Pensjonisten er født 1956 og er dermed gammel nok til
   alderspensjon. Pensjonisten har ingen lønn, så den lave trygdeavgiftssatsen på lønn
   etter 69 år spiller ingen rolle.
2. **Tast inn.** Hvilket kort og hvilket felt hvert beløp hører til, og hvilket felt i
   profilen beløpet kommer fra. Husstandsfixturen er et ektepar. Formuen deres er fordelt
   likt, halvparten på hver ektefelle. Det gir samme formuesskatt som motorens
   parberegning (felles bunnfradrag og trinn). Kalkulatoren regner begge ektefellene
   i samme kjøring. Klarer den bare én om gangen, kjører du den én gang per ektefelle.
3. **Tabell.** Én rad per nøkkel i resultatfilen, med kalkulatorlinjene som skal summeres og
   motorens forventning.

«Til feilsøking» lister mellomtall som minstefradrag, alminnelig inntekt, nettoformue og
sum skatt (skattene minus skattefradraget for pensjonsinntekt). Dem skriver du ikke inn, men
de hjelper deg å finne hvor et avvik oppstår.

Feltnavn uten merknad er lest ordrett fra kalkulatorens egne tekstfiler for 2026
(lest 2026-09-26, bare lesing: ingenting er tastet inn eller sendt). Navn merket
**(verify label)** fantes ikke som ferdig tekst i de filene. Det er de vanlige navnene fra
skattemeldingen. Gjelder det feltene inne i kortene «Bankinnskudd», gjeld og bolig, og
navnene på skattelinjene («Fellesskatt», «Trinnskatt», «Trygdeavgift», «Formuesskatt til
kommune/staten» osv.), bekrefter du navnet mens du taster. Er det feil, retter du `LABELS`
i `src/data/gate3-sheet.ts`, og da blir merknaden borte.

### Pensjonisten (beslutning D5, 2026-09-27)

Fixturen `singlePensioner` har bare alderspensjon fra folketrygden. Den er lagt til fordi
pensjonister er med i kalkulatoren (D5), og den er valgt slik at pensjonen ligger over
innslagspunktet for trinn 1 i nedtrappingen av skattefradraget for pensjonsinntekt, mens
fradraget fortsatt er mindre enn skatten det trekkes fra. Taket i skatteloven § 16-1 sjette
ledd binder altså ikke, og fradraget avhenger bare av sine egne parametre.

- Tast pensjonen som alderspensjon fra folketrygden for hele året, med full uttaksgrad.
  Motoren modellerer ikke gradert uttak eller færre måneder med pensjon.
- Kalkulatoren skal vise fradraget som en egen linje. Skattelinjene registreres før
  fradraget, og fradraget registreres som et positivt beløp under `skattefradragPensjon#0`.
  Viser kalkulatoren bare skatten etter fradraget, registrerer du ikke denne fixturen og
  noterer det i `version`. Da blir ingen regel som fixturen mater bekreftet, og hvordan
  fradraget skal sammenlignes, blir en egen beslutning.
- **Beslutning 2026-09-28 (Jesper):** fradraget bekreftes mot vedtaket (39 100 kr / 294 200 kr /
  19,1 %), ikke mot Skatteetatens kalkulator så lenge den bruker desemberverdiene (37 100 kr /
  284 950 kr / 16,7 %). Tast inn Skatteetatens tall slik det står, og noter i `version` at
  kalkulatoren bruker desemberverdiene. Den som går gjennom arket, sjekker avviket mot
  desemberformelen i METHODOLOGY.md. Lovdatas fotnote «i kraft 1 juli 2026» ved § 6-5 overstyres av vedtakets egen tekst
  (1. januar), jf. METHODOLOGY.md.

### Kapitalinntekt og bolig/aksjer

- `capitalIncome` tastes som opptjente renter på bankinnskudd. Rentene skattlegges med 22
  prosent uten oppjustering, slik motoren regner. Aksjeutbytte blir oppjustert, og det
  modellerer ikke motoren.
- Primærbolig, sekundærbolig og aksjer tastes som **markedsverdi**, slik at kalkulatoren selv
  trekker verdsettingsrabatten. Da tester kalkulatoren også `wealth.valuation`. Godtar
  kalkulatoren bare en ferdig formuesverdi, setter du `valuationEnteredAs: 'formuesverdi'`.
  Da forblir `wealth.valuation` `estimated`.

## 3. Registrer resultatene

`src/data/gate3-results.ts`:

```ts
export const GATE3_RESULTS: Gate3Results = {
  checkedOn: 'ÅÅÅÅ-MM-DD',
  calculator: { inntektsaar: 2026, version: '<url + versjon/bunntekst>' },
  valuationEnteredAs: 'markedsverdi',
  values: {
    medianSingle: { 'skattAlminneligInntekt#0': …, 'trinnskatt#0': …, 'trygdeavgift#0': …, formuesskatt: … },
    // … én blokk per fixture, nøklene står i arbeidsarket
  },
};
```

- `skattAlminneligInntekt#i` er summen av «Fellesskatt», «Inntektsskatt til kommune» og
  «Inntektsskatt til fylkeskommune» for voksen *i* (`#0` er deg, `#1` er ektefellen).
- `skattefradragPensjon#i` er «Skattefradrag for pensjonsinntekt» for voksen *i*, skrevet som
  et positivt beløp. For voksne uten pensjon er den 0.
- `formuesskatt` er formuesskatt til kommune pluss til staten, summert for begge ektefellene.
- Skriv hele kroner slik kalkulatoren viser dem, og skriv inn også linjer som er 0.

Kjør `npm run gate3:sheet` på nytt. Kolonnen «ok» og regeltabellen nederst viser da hva som
stemmer, og hvorfor en regel eventuelt ikke er bekreftet. Kjør til slutt `npm run check`.

## 4. Når blir en regel `confirmed`?

Dette gjelder bare regler i det vedtatte referansesystemet (`ADOPTED_2026`). Statusen
avledes i `src/data/gate3.ts`, og en regel blir `confirmed` når alle fire vilkårene holder:

1. **Regelen mater en komponent kalkulatoren viser** (`GATE3_RULE_FEEDS`). Kartet er lest ut
   av motoren, og en test forskyver hver parameter i hver regel for å vise at kartet er
   nøyaktig.
2. **Hver parameter i regelen påvirkes av fixturene.** Når parameteren flyttes 1 prosent
   opp eller ned, skal minst én komponent den mater endre seg. Et treff sier ingenting om en
   parameter som ikke påvirker noe tall. Et innslagspunkt ingen fixture når opp til, blir
   derfor ikke bekreftet av at resten stemmer.
3. **Alle fixture-komponentene regelen mater har en registrert verdi**, og hver av dem ligger
   innenfor 1 kr av motorens tall.
4. **Resultatfilen har dato og inntektsår 2026.** For `wealth.valuation` må verdiene i
   tillegg være tastet som markedsverdi.

Et avvik på mer enn 1 kr stopper alle reglene som mater den komponenten. Regeltabellen i
arbeidsarket viser hvilke det gjelder.

Vakter:

- `applyGate3Status` stopper med feil hvis en regel i `adopted.ts` er satt til `confirmed`
  for hånd.
- Med tom resultatfil er ingen regel `confirmed`. Det sjekker `src/tests/gate3.test.ts` og
  `forlik-diff.test.ts`.
- Partiregler går aldri gjennom gate 3 og forblir `estimated`.

## 5. Hva gate 3 ikke kan bekrefte

Arbeidsarket skriver ut listen med begrunnelse (`GATE3_OUT_OF_SCOPE`):

- **Moms og særavgifter.** Kalkulatoren regner dem ikke.
- **Barnetrygd og studiestøtte.** Det er utbetalinger og ikke skatt, så kalkulatoren viser dem
  ikke.
- **Arbeidsgiveravgift.** Den betales av arbeidsgiveren.
- **Regler med parametre ingen fixture påvirker.** Regeltabellen nevner hver parameter ved
  navn. Typiske eksempler er trinn 2 i nedtrappingen av skattefradraget for pensjonsinntekt
  og satsen i minstefradraget for pensjon (den ene pensjonsfixturen ligger over begge
  grensene), trygdeavgiftens nedre grense og opptrapping, taket på fagforeningsfradraget,
  formuesskattens trinn 2 og parverdiene, og boligrabatten over innslagspunktet for høy verdi. Skal slike regler kunne
  bli `confirmed`, trengs flere fixturer som treffer disse grenene. Det er en egen beslutning.
  Gate 3 legger ikke til fixturer selv.
