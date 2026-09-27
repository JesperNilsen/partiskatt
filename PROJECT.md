# Første prompt til Claude Code — Partiskatt

Kopier hele teksten nedenfor inn i Claude Code fra roten av et nytt eller eksisterende prosjekt.

---

Du er hovedutvikler, produktdesigner og dataansvarlig for en offentlig norsk skatte- og budsjettkalkulator med arbeidstittelen **Partiskatt**. Bygg en komplett, mobiltilpasset MVP som kan deployes på Netlify innen én helg.

Arbeid autonomt og fortsett fra planlegging til implementasjon, testing og dokumentasjon uten å vente på godkjenning mellom fasene. Still bare spørsmål dersom du møter en faktisk blokkering som ikke kan løses med en forsvarlig, tydelig dokumentert standardantagelse.

Hvis filen `PROJECT.md` eller `partiskatt-project-context.md` finnes i repoet, skal du lese den først og behandle den som autoritativ produktkontekst. Dersom den motsier denne prompten, følger du prosjektkonteksten og dokumenterer avviket. Ikke overskriv brukerens eksisterende arbeid eller ukommitterte endringer.

## Produktets hensikt

Bygg en kalkulator som viser hvor mye mer eller mindre en norsk person eller husholdning anslagsvis ville sittet igjen med dersom hvert stortingspartis alternative statsbudsjett for 2026 ble lagt til grunn i stedet for det vedtatte skatte-, avgifts- og ytelsessystemet for 2026.

Kalkulatoren skal synliggjøre skattetrykket for vanlige mennesker. Den er ikke en valgomat og skal ikke påstå å måle hele politikkens verdi, offentlige tjenester, dynamiske vekstvirkninger eller samlet samfunnsøkonomisk velferd.

Hovedspørsmålet brukeren skal få svar på er:

> Hvor mange kroner mer eller mindre ville jeg eller husholdningen min sittet igjen med i året under hvert partis alternative budsjett?

## Produktbeslutninger som allerede er tatt

- Referansen er det endelig vedtatte 2026-systemet.
- Hvert parti sammenlignes med samme referanse.
- Alle ni stortingspartier skal vises.
- Arbeiderpartiet fungerer normalt som referansekort dersom det vedtatte systemet er regjeringens politikk. Forklar dette presist.
- Opposisjonspartiene modelleres fra sine alternative statsbudsjetter for 2026, ikke fra løse eller langsiktige formuleringer i partiprogrammene.
- Hovedtallet er kroner mer eller mindre igjen mot referansen, per år og per måned.
- Partiene rangeres som standard etter hvem som gir den aktuelle brukeren mest penger igjen.
- Hovedtallet består av direkte skatt, moms/særavgifter og direkte kontantytelser. Disse skal også vises separat.
- Usikre forslag er av som standard og kan eventuelt aktiveres som eksplisitte scenario-brytere.
- Arbeidsgiveravgift kan slås av og på, men skal metodisk skilles fra direkte skattetrekk.
- Brukeren kan beregne for én person eller en husholdning.
- MVP-en bruker kun nasjonale regler. Ikke bygg kommunal skatte- eller avgiftsmodell.
- Kalkulatoren starter enkelt og har en valgfri avansert del.
- Moms og særavgifter bruker en standardisert forbruksprofil som brukeren kan justere.
- Målgruppene er lønnsmottakere, studenter med lønn og stipend, enslige med barn og par med barn.
- Pensjonister med alderspensjon eller AFP støttes (eget felt per voksen, med skattefradrag for pensjonsinntekt). Uføretrygd er ikke modellert.
- Uttrykket skal være tabloid og konfronterende på forsiden og resultatsiden, men nøkternt og etterprøvbart i metode og kilder.
- MVP-en har ingen delingsfunksjon, konto eller backend.
- Alle beregninger skjer lokalt i nettleseren.
- Lanseringen merkes tydelig som offentlig beta.
- Mises-profilering er ikke besluttet. Ikke bruk Mises-navn eller logo uten senere eksplisitt instruks.

## Teknisk ramme

Bruk følgende stack:

- React
- TypeScript med streng typekontroll
- Vite
- Netlify
- Vitest
- Et lett diagramsystem dersom det er nødvendig
- Statisk, versjonert datasett i repoet
- Ingen database, innlogging eller serverfunksjon i MVP-en

Velg en enkel og vedlikeholdbar stylingløsning. Prioriter ytelse, mobilbruk, tilgjengelighet og tydelig visuell hierarki fremfor tung animasjon eller kompliserte komponentbiblioteker.

## Før du koder

1. Inspiser repoet og eksisterende filer.
2. Opprett en kort `IMPLEMENTATION_PLAN.md` med konkrete faser, avhengigheter og ferdigkriterier.
3. Opprett `DATA_STATUS.md` som tabell over alle partier og alle beregningskategorier med statusene:
   - `confirmed`
   - `estimated`
   - `unquantified`
   - `not-applicable`
   - `not-reviewed`
4. Opprett `METHODOLOGY.md` som forklarer referanse, avgrensninger, incidensantagelser, forbruksprofil og usikkerhet.
5. Fortsett deretter direkte til implementasjon. Ikke stopp etter å ha skrevet planen.

## Datakilder og kildehierarki

Bruk primærkilder som grunnlag for alle beløp:

1. Stortingets oversikt over alternative statsbudsjetter for 2026:  
   https://www.stortinget.no/no/Saker-og-publikasjoner/Statsbudsjettet/statsbudsjettet-2026/alternative-statsbudsjetter/
2. Stortingets samlede side for statsbudsjettet 2026, inkludert saldert budsjett og vedtak:  
   https://www.stortinget.no/no/Saker-og-publikasjoner/Statsbudsjettet/statsbudsjettet-2026/
3. Finansdepartementets Prop. 1 LS (2025–2026), Skatter og avgifter 2026:  
   https://www.regjeringen.no/no/dokumenter/prop.-1-ls-20252026/id3124192/
4. Skatteetatens satser og regler for 2026.
5. SSB for standardiserte forbruks- og husholdningsprofiler.
6. Lånekassen og NAV for relevante student- og familieytelser.

Sekundærkilder kan brukes til å finne frem, men ikke som eneste dokumentasjon når en primærkilde finnes.

Ikke finn på satser, terskler, ikrafttredelsesdatoer eller fordelingsvirkninger. Dersom du ikke kan hente eller tolke en kilde sikkert:

- behold partiet synlig i grensesnittet;
- merk den aktuelle komponenten som `not-reviewed`, `unquantified` eller «under kontroll»;
- utelat komponenten fra standardhovedtallet;
- forklar konkret hva som mangler i `DATA_STATUS.md`;
- gå videre med resten av produktet.

Målet er full dekning, men manglende data skal aldri skjules for å kunne hevde at produktet er komplett.

## Datastruktur og proveniens

Lag et eksplisitt, versjonert typesystem for:

- brukerprofil;
- husholdning;
- inntekter;
- formue og gjeld;
- forbruk;
- kontantytelser;
- baseline-regler;
- partiregler;
- beregningsresultat;
- usikkerhetsstatus;
- kilder og antagelser.

Hver regel som kan påvirke et resultat, må kunne knyttes til:

- parti;
- budsjettår;
- kategori;
- gjeldende regel;
- foreslått regel;
- ikrafttredelsesdato;
- beregningsformel;
- kilde-URL;
- sidetall eller tabell dersom kilden er PDF;
- kort metodeforklaring;
- sikkerhetsgrad;
- dato for siste kontroll.

Bruk én modul per parti og egne moduler for referansesystem, inntektsskatt, formuesskatt, forbruksavgifter, ytelser og arbeidsgiveravgift. Ikke legg politiske satser direkte i React-komponenter.

Foreslått struktur:

```text
src/
  components/
  views/
  engine/
    baseline.ts
    income-tax.ts
    wealth-tax.ts
    consumption.ts
    benefits.ts
    employer-contribution.ts
    calculate-scenario.ts
  data/
    baseline/2026.ts
    parties/
    consumption-profiles.ts
    sources.ts
  types/
  tests/
```

Tilpass strukturen dersom repoet allerede har en god arkitektur, men bevar skillet mellom data, beregningsmotor og presentasjon.

## Beregningsmodell

Beregn først samme brukerprofil under referansesystemet:

```text
netto_referanse = inntekt
                 - direkte_skatt
                 - beregnede_moms_og_særavgifter
                 + direkte_kontantytelser
```

Beregn deretter profilen under hvert partis regler:

```text
endring_parti = netto_parti - netto_referanse
```

Rangeringen bruker `endring_parti` for standardscenarioet. Alle delkomponenter må lagres slik at sluttsummen kan rekonstrueres nøyaktig i detaljvisningen.

Regn i hele øre eller hele kroner etter en konsekvent og dokumentert avrundingsregel. Ikke bruk upresise flyttallsoperasjoner for pengebeløp.

### Direkte skatt

Modeller så langt kildene tillater:

- skatt på alminnelig inntekt;
- trinnskatt;
- trygdeavgift;
- personfradrag og minstefradrag;
- relevante skattefradrag;
- formuesskatt;
- verdsettelsesregler for relevante formuesobjekter;
- andre konkret tallfestede personskatter.

### Moms og særavgifter

Lag en redigerbar standardprofil basert på SSB-data. Skill mellom husholdningens utgifter til minst:

- mat;
- alminnelige varer og tjenester;
- transport og drivstoff;
- strøm;
- eventuelt alkohol og tobakk;
- eventuelt flyreiser.

Ikke beregn moms som en prosent av hele inntekten. Ved satsendring skal prisvirkningen beregnes konsistent. Dokumenter antagelsen om overveltning til forbrukeren. Beregn særavgifter per relevant enhet når det er mulig.

### Kontantytelser

Ta med direkte og konkret tallfestede kontantytelser som er relevante for målgruppene, særlig barnetrygd. Ikke verdsett offentlige tjenester, gratisordninger eller lavere maksimalpriser som om de var kontanter.

### Arbeidsgiveravgift

Arbeidsgiveravgift er av som standard.

Når brukeren aktiverer den:

- vis et utvidet mål på skatt på arbeid;
- forklar at avgiften betales av arbeidsgiveren og ikke trekkes direkte fra nettolønnen;
- vis valgt incidensantagelse;
- bruk full langsiktig incidens på arbeidstakeren som foreløpig betaantagelse dersom ingen bedre eksplisitt beslutning finnes;
- skill den visuelt fra direkte skatt;
- ikke la den påvirke standardrangeringen uten en tydelig merking av at brukeren har valgt et utvidet scenario.

### Usikre forslag

Ufullstendige forslag er av som standard. Dersom et rimelig anslag er mulig, legg det bak en bryter under «Mulige endringer». Vis:

- antagelsen;
- kilden;
- hvorfor forslaget er usikkert;
- hvordan resultatet endres når bryteren aktiveres.

Bruk samme beviskrav for alle partier.

## Brukerflyt

Lag en enkel inngang med valgfri avansert tilpasning.

### Enkel del

- Beregn for person eller husholdning
- Årlig brutto arbeidsinntekt per voksen
- Studentstatus og relevant inntekt
- Antall voksne
- Antall barn og aldersgrupper
- Enkel formuesangivelse eller «ingen skattepliktig formue»
- Forbruksprofil: nøktern, typisk eller høyt forbruk

Målet er et forståelig resultat på omtrent ett minutt.

### Avansert del

- Kapitalinntekt
- Renteutgifter
- Boligverdi og gjeld
- Bankinnskudd
- Aksjer og fond
- Annen skattepliktig formue
- Kjørelengde, biltype eller drivstofforbruk
- Strømforbruk
- Alkohol og tobakk
- Flyreiser
- Redigerbare forbrukskategorier
- Arbeidsgiveravgift
- Usikre policybrytere

Ikke be om navn, personnummer, adresse eller andre unødvendige personopplysninger.

## Resultatside

Resultatsiden skal være mobiltilpasset og åpne med en tabloid, konkret konklusjon. Eksempler på tone:

> Dette partiet lar deg beholde 8 430 kroner mer i året.

> Skattesmellen: 12 700 kroner mindre igjen.

Vis deretter:

1. Alle partier, sortert etter mest penger igjen
2. Årlig endring
3. Månedlig endring
4. Oppdeling i direkte skatt, moms/særavgifter og kontantytelser
5. En lettlest fossefallsfigur eller tilsvarende dekomponering
6. De viktigste årsakene til hvert partis resultat
7. Kilder og antagelser
8. Forslag som ikke er medregnet
9. Mulighet til å endre inndata uten å begynne på nytt

Ikke bygg delingskort, eksport eller delingslenker i MVP-en.

## Design og tekst

- Mobil først
- Store tall
- Korte, konfronterende overskrifter
- Umiddelbar forskjell mellom mer og mindre igjen
- Partifarger som identifikasjon
- God kontrast og tilgjengelighet
- Klart norsk uten unødvendig fagspråk
- Forsiden og resultatene kan være tabloide
- Metode og kildevisning skal være rolige og institusjonelle
- Unngå både generisk offentlig portal-estetikk og useriøst memepreg
- Resultatet skal være skarpt; metoden skal være kjølig

Bruk plassholder for logo og merkenavn slik at navnet kan byttes senere uten omfattende refaktorering.

## Personvern

- All beregning skjer lokalt i nettleseren.
- Ingen økonomiske brukerdata sendes eller lagres.
- Ingen innlogging.
- Ikke legg lønn, formue eller husholdningsdata i URL-en.
- Ikke bygg analyse som registrerer individuelle økonomiske opplysninger.
- Vis en kort personverntekst ved kalkulatoren.

## Beta og redaksjonell standard

Vis tydelig:

> Offentlig beta: Kalkulatoren bygger på publiserte 2026-budsjetter og standardiserte antagelser. Tallene er anslag, ikke en individuell skatteberegning. Se metode og kilder før du tolker små forskjeller.

Lag også:

- `/metode` eller tilsvarende visning;
- `/kilder` eller tilsvarende visning;
- en enkel offentlig rettelseslogg;
- en tydelig kanal for å melde feil.

## Tester og kontroll

Skriv enhetstester parallelt med beregningsreglene. Minstekrav:

1. Student med lav arbeidsinntekt og ingen formue
2. Enslig lønnsmottaker rundt medianinntekt
3. To lønnsmottakere med to barn
4. Høyinntektslønnsmottaker rundt relevante trinnskattegrenser
5. Boligeier med gjeld og skattepliktig nettoformue

For alle terskelbaserte regler: test rett under, på og rett over innslagspunktet. Test at:

- standardreferansen gir null avvik mot seg selv;
- partirangeringen samsvarer med beregnede summer;
- detaljkomponentene summerer til hovedtallet;
- scenario-brytere er av som standard;
- person- og husholdningsmodus håndterer samme voksne konsistent;
- ingen ugyldige eller negative brukerverdier gir ødelagt resultat;
- siden fungerer på små mobilskjermer;
- produksjonsbygget lykkes.

## Prioritering for helgen

Arbeid i denne rekkefølgen:

1. Robust typesystem og referansemodell
2. Testbar beregningsmotor
3. Partidatasett med kilder og status
4. Enkel brukerflyt
5. Resultatrangering og dekomponering
6. Avansert forbruks- og formuesjustering
7. Usikkerhetsbrytere og arbeidsgiveravgift
8. Metode, kilder, beta og personvern
9. Mobilpolering
10. Netlify-konfigurasjon og produksjonsbygg

Unngå å bruke tid på deling, kontoer, backend, full kommunegeografi, koalisjoner, historiske år eller gründermodellen.

## Ferdigkriterier

MVP-en er ferdig når:

- prosjektet bygger uten feil;
- Netlify-konfigurasjonen er klar;
- enkel registrering fungerer;
- avanserte felt kan åpnes og justeres;
- person og husholdning støttes;
- alle ni partier vises;
- hvert beregnet parti bruker samme 2026-referanse;
- hovedresultatet viser mer eller mindre per år og måned;
- partiene sorteres etter penger igjen;
- skatt, avgifter og ytelser vises separat;
- forbruksprofilen kan justeres;
- usikre forslag er av som standard og tydelig merket;
- arbeidsgiveravgift kan aktiveres og forklares;
- alle aktive regler har kilde og status;
- alle beregninger skjer lokalt;
- private økonomiske data ikke lagres;
- mobilvisningen er god;
- betamerking, metode, kilder og rettelseslogg finnes;
- testpakken passerer.

## Avsluttende arbeidsregel

Ikke rapporter at et parti er «ferdig» bare fordi kortet vises i grensesnittet. Skill hele tiden mellom:

- implementert grensesnitt;
- implementert beregningsregel;
- dokumentert kilde;
- manuelt kontrollert resultat.

Når du har gjort så mye som mulig, gi en kort sluttrapport med:

1. hva som faktisk er implementert;
2. hvilke partier og regler som er fullt dokumentert;
3. hvilke tall som fortsatt må kontrolleres;
4. testresultater;
5. nøyaktige steg for Netlify-deploy;
6. de tre viktigste gjenværende risikoene.

Start nå med å inspisere repoet, lese prosjektkonteksten dersom den finnes, skrive de tre styringsfilene og deretter implementere MVP-en.

