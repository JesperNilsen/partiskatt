# Ekstraksjonsark — Senterpartiet alternativt statsbudsjett 2026

Source: `sources/text/sp-alt-2026.txt` (from `sources/raw/sp-alt-2026.pdf`, see `sources/manifest.json`).
Extractor: claude  ·  Date: 2026-09-13

> **Revised 2026-09-26 by sprint lane L10b (not-reviewed sweep, decision 2).** Section-A rows whose note carries `[L10b]` replace both extractors’ text with one adjudicated reading of the source, written identically into both sheets. Where the party states only a change, the row is `estimated` with `DERIVE` in the value column and the arithmetic against Prop. 1 LS in the note; the encoded value and its derivation are in `src/data/parties/<party>.ts`. Text in rows without an `[L10b]` note is the extractor’s original 2026-09-13 reading.

## A. Rules (one row per formula; add `trinnN` sub-rows for brackets)

| formulaId | parameter | baseline quoted by party | party absolute value | stated change (verbatim ≤15 words) | page | anchor (≤10 words) | status | proveny mill. kr (if stated) | note |
|---|---|---|---|---|---|---|---|---|---|
| income.generalRate | sats alminnelig inntekt | | | | | | no-change | | Ingen treff på «alminnelig inntekt» noe sted i dokumentet; posten finnes ikke i partiets fullstendige skatte- og avgiftsoppstilling s. 80. |
| income.bracketTax.trinn1 | innslagspunkt + sats | | | | | | no-change | | Kun trinn 4 og 5 omtales (s. 8, s. 80); trinn 1 nevnes ikke. |
| income.bracketTax.trinn2 | innslagspunkt + sats | | | | | | no-change | | Kun trinn 4 og 5 omtales (s. 8, s. 80); trinn 2 nevnes ikke. |
| income.bracketTax.trinn3 | innslagspunkt + sats | | | | | | no-change | | Kun trinn 4 og 5 omtales (s. 8, s. 80); trinn 3 nevnes ikke. |
| income.bracketTax.trinn4 | innslagspunkt + sats | | innslagspunkt: kr 960 000 · sats: ikke oppgitt | «Redusere innslagspunktet for nye trinn 4 i trinnskatten til 960 000 kr» | 8 | for nye trinn 4 i trinnskatten til 960 000 kr | confirmed | 600 | Innslagspunktet er eksplisitt (kr 960 000) og absolutt. Satsen for det sammenslåtte «nye trinn 4» står ingen steder i dokumentet — DERIVE. Samme rad s. 80 (post 5501.70). |
| income.bracketTax.trinn5 | innslagspunkt + sats | — | DERIVE | «Slå sammen trinn 4 og 5 i trinnskatten» | 8 | Slå sammen trinn 4 og 5 i trinnskatten | unquantified | 1 681 | [L10b] Satsen for det sammenslåtte trinnet er ikke oppgitt. Trinn 5 står som i Prop. 1 LS; unquantified i sp.ts. |
| income.socialSecurity | trygdeavgift lønn / pensjon / nedre grense | — | DERIVE | «Redusere trygdeavgiften på lønn/trygd og næring med 0,1 pst.» | 8 | Redusere trygdeavgiften på lønn/trygd og næring med 0,1 pst. | estimated | -2 345 | [L10b] Utledet: Prop. 1 LS s. 80 lønn/trygd 7,6 % − 0,1 = 7,5 %. Samme tiltak og proveny (−2 345) står i Prop. 1 LS s. 21 som 0,1 prosentenhet; vedlegget s. 80 er «samanlikna med regjeringa sitt forslag». Pensjon 5,1 % uendret. |
| income.personalAllowance | personfradrag | | | | | | no-change | | Null treff på «personfradrag» i hele filen; ikke i oppstillingen s. 80. |
| income.minimumDeductionWage | minstefradrag lønn: sats / øvre grense | | | | | | no-change | | Null treff på «minstefradrag» i hele filen; ikke i oppstillingen s. 80. |
| income.minimumDeductionPension | minstefradrag pensjon: sats / øvre grense | | | | | | no-change | | Null treff på «minstefradrag» i hele filen; ikke i oppstillingen s. 80. |
| income.unionFeeDeduction | fagforeningsfradrag maks | | | | | | no-change | | Null treff på «fagforening» i hele filen; ikke i oppstillingen s. 80. |
| wealth.netWealthTax | bunnfradrag (enslig/ektefeller), sats trinn 1, trinn 2 innslag + sats | — | bunnfradrag 2 000 000 (ektepar 4 000 000); satser uendret | «Øke bunnfradraget i formuesskatten til 2 mill. kroner» | 8 | Øke bunnfradraget i formuesskatten til 2 mill. kroner | estimated | -375 | [L10b] Partiets tall; ektepar = 2 × enslig som i Prop. 1 LS (1,9 / 3,8 mill.). |
| wealth.valuation | verdsettelse primærbolig (inkl. høy verdi), sekundærbolig, aksjer, bankinnskudd | fra 10 til 10,21 mill. kr | boliggrense 10,21 mill. kr; driftsmidler DERIVE (70 − 10 = 60 %) | «Prisjustere grensen for boliger i formuesskatten fra 10 til 10,21 mill. kr»; «Øke rabatten for driftsmidler i formueskatten med 10 prosentpoeng» | 8 | Øke rabatten for driftsmidler i formueskatten med 10 prosentpoeng | estimated | -55; -35 | [L10b] Driftsmidler utledet mot Prop. 1 LS s. 36 (70 %, dvs. 30 % rabatt): 40 % rabatt ⇒ 60 %. |
| vat.food | mva næringsmidler | 15 prosent | 10 prosent fra 1. september 2026 | «Redusere matmomsen til 10 prosent fra 1. september» | 8 | Redusere matmomsen til 10 prosent fra 1. september | confirmed | -1700 (bokført) / -3500 (påløpt) | Baseline 15 pst. er sitert i teksten s. 6: «momsen bør kuttes fra 15 til 10 prosent» (anchor verifisert s. 6). Merk delårsvirkning: gjelder fra 1. september. Påløpt tall fra s. 80 (post 5521.70). |
| vat.general | mva alminnelig sats | | | | | | no-change | | Ordene «merverdiavgift»/«mva» finnes ikke i filen; kun «matmomsen» og «momskompensasjon» (kulturbygg). Ikke i oppstillingen s. 80. |
| vat.transportServices | mva persontransport | | | | | | no-change | | Ikke nevnt; ikke i oppstillingen s. 80. Persontransporttiltak er tilskudd (hurtigbåt, KID), ikke mva. |
| vat.electricity | mva strøm | | | | | | no-change | | Ikke nevnt; ikke i oppstillingen s. 80. |
| vat.fuel | mva drivstoff | | | | | | no-change | | Ikke nevnt; drivstoffgrepene er vegbruksavgift, ikke mva. |
| vat.alcoholTobacco | mva alkohol/tobakk | | | | | | no-change | | Ikke nevnt; ikke i oppstillingen s. 80. |
| vat.flights | mva flyreiser | | | | | | no-change | | Ikke nevnt; flygrepet er flypassasjeravgiften, ikke mva. |
| excise.petrolLitre | veibruksavgift + CO2-avgift bensin | — | DERIVE | «Redusere vegbruksavgiften på bensin slik at avgiftene blir reelt uendret»; «… med ytterligere 25 øre/L» | 8; 80 | Redusere vegbruksavgiften på bensin slik at avgiftene blir reelt uendret | unquantified | -230; -160 | [L10b] Ingen sats. «Reelt uendret» krever en prisjusteringsfaktor som ikke er oppgitt; provenytallene passer ikke med én felles faktor. Unquantified i sp.ts. |
| excise.dieselLitre | veibruksavgift + CO2-avgift diesel | — | DERIVE | «Redusere vegbruksavgiften på diesel slik at avgiftene blir reelt uendret»; «… med ytterligere 25 øre/L» | 8; 80 | Redusere vegbruksavgiften på diesel slik at avgiftene blir reelt uendret | unquantified | -1 370; -465 | [L10b] Som bensin. Unquantified i sp.ts. |
| excise.kwh | elavgift (alminnelig sats, evt. redusert jan–mar) | | | | | | no-change | | Elavgift for husholdninger nevnes ikke. De to elavgiftsgrepene gjelder bare datasentre: «Beholde elavgift på datasentre på dagens nivå (12,81 øre/kWt)» (+179 mill., s. 8) og «Øke elavgiften med reelt 10 øre/kWt for datasentre» (+210 mill., s. 8). Ingen redusert jan–mar-sats omtalt. Se også s. 19 og s. 80 (post 5541.70). |
| excise.flightEurope | flypassasjeravgift Europa | 61 kr | kr 50 per passasjer (lav sats) | «Redusere den lave satsen i flypassasjeravgiften fra 61 til 50 kroner» | 8 | den lave satsen i flypassasjeravgiften fra 61 til 50 kroner | estimated | -220 | [L10b] Utgangspunktet 61 kr = Prop. 1 LS tabell 1.8 s. 43. Høy sats ikke nevnt. |
| excise.flightOther | flypassasjeravgift utenfor Europa | | | | | | no-change | | Bare «den lave satsen» endres; høy sats nevnes ikke noe sted. |
| excise.beerLitre | alkoholavgift øl | — | uendret for øl 3,7–4,7 vol.pst. | «Fjerne avgiften på alkoholholdige drikkevarer fra 0,7 til 2,7 pst.» | 8 | Fjerne avgiften på alkoholholdige drikkevarer fra 0,7 til 2,7 pst. | no-change | -10 | [L10b] Gjelder bare drikkevarer 0,7–2,7 vol.pst.; modellens øl (3,7–4,7) er uendret. |
| excise.wineLitre | alkoholavgift vin | | | | | | no-change | | Ingen treff på «vin»/«alkoholavgift»; eneste alkoholgrep er 0,7–2,7 pst.-gruppa (se excise.beerLitre). |
| excise.spiritsLitre | alkoholavgift brennevin | | | | | | no-change | | Ingen treff på «brennevin»/«alkoholavgift»; eneste alkoholgrep er 0,7–2,7 pst.-gruppa. |
| excise.cigarette | tobakksavgift sigaretter | | | | | | no-change | | Null treff på «tobakk» i hele filen; ikke i oppstillingen s. 80. |
| excise.snusGram | tobakksavgift snus | | | | | | no-change | | Null treff på «snus» i hele filen; ikke i oppstillingen s. 80. |
| benefit.childBenefit | barnetrygd under 6 / fra 6 / utvidet (enslig) | — | DERIVE | «Innføre dobbel barnetrygd for tredje barn frå 1. oktober» | 23 | Innføre dobbel barnetrygd for tredje barn frå 1. oktober | unquantified | 504 | [L10b] Modellen skiller ikke barn etter rekkefølge. Unquantified i sp.ts. |
| benefit.studentSupport | studiestøtte (basisstøtte, stipendandel) | — | DERIVE | «Sikre 40 prosent omgjering av lån til studentar ved folkehøgskular» | 47 | Sikre 40 prosent omgjering av lån til studentar ved folkehøgskular | unquantified | 97,3 | [L10b] Gjelder folkehøgskoleelever (og barne-/foreldrestipend), ikke modellens basisstøtte. Unquantified i sp.ts. |
| employer.contribution | arbeidsgiveravgift sats / ekstra avgift | | | | | | no-change | | Null treff på «arbeidsgiveravgift» i hele filen; ikke i oppstillingen s. 80. |

## B. Proposals that touch household cash but cannot enter the formulas (unquantified)

| category (direct-tax / wealth-tax / consumption-tax / benefit / employer) | title (party's wording) | page | anchor | why it cannot be quantified for an individual |
|---|---|---|---|---|
| direct-tax | Styrke reisefradraget (nedre grense 12 000 kr, 1,90 kr/km og øvre 120 000) | 8 | grense 12 000 kr, 1,90 kr/km og øvre 120 000) | Reisefradrag er ikke en av formelparameterne; effekten avhenger av den enkeltes arbeidsreiseavstand. Partiet anslår selv «skattelette for de aller fleste pendlerne på minst 800 kr i året» (s. 42). Proveny −270 mill. |
| direct-tax | Ikke redusere foreldrefradraget | 8 | Ikke redusere foreldrefradraget | Reversering av regjeringens kutt; kronebeløp for fradraget er ikke oppgitt i dokumentet. Proveny −50 mill. bokført / −190 mill. påløpt (s. 80). |
| direct-tax | Øke den skattefrie satsen for kost på brakke fra 400 til 500 kr | 8 | for kost på brakke fra 400 til 500 kr | Gjelder kun ansatte som bor på brakke; ikke en formelparameter. Proveny −30 mill. |
| direct-tax | Øke jordbruksfradraget (min. 99 600 kroner og maks. 208 900 kroner) | 8 | jordbruksfradraget (min. 99 600 kroner og maks. 208 900 kroner) | Næringsspesifikt fradrag (jordbruk); treffer bare selvstendige i landbruket. Proveny −26 mill. |
| direct-tax | Øke sjøfolkfradraget til 86 300 kroner | 8 | Øke sjøfolkfradraget til 86 300 kroner | Yrkesspesifikt fradrag; ikke en formelparameter. Proveny −11 mill. |
| direct-tax | Øke fiskerfradraget til 160 000 kroner | 8 | Øke fiskerfradraget til 160 000 kroner | Yrkesspesifikt fradrag; ikke en formelparameter. Proveny −9 mill. |
| direct-tax | Fjerne standardfradraget for utenlandske arbeidstakere | 8 | Fjerne standardfradraget for utenlandske arbeidstakere | Gjelder kun utenlandske arbeidstakere; fradragets størrelse er ikke oppgitt. Proveny +25 mill. |
| direct-tax | Ikke gjennomføre regjeringens skattelotteri | 8 | Ikke gjennomføre regjeringens skattelotteri | Ordningens innretning og individuelle virkning er ikke beskrevet. Proveny +500 mill. |
| wealth-tax | Øke rabatten for driftsmidler i formueskatten med 10 prosentpoeng | 8 | Øke rabatten for driftsmidler i formueskatten med 10 prosentpoeng | Driftsmidler er ikke en av verdsettelseskategoriene i formelen (primærbolig/sekundærbolig/aksjer/bankinnskudd), og resulterende rabattsats er ikke oppgitt. Proveny −35 mill. |
| consumption-tax | Fjerne tillegget i trafikkforsikringsavgiften for biler uten partikkelfilter | 8 | Fjerne tillegget i trafikkforsikringsavgiften for biler uten partikkelfilter | Trafikkforsikringsavgift er ikke en formelparameter, og tilleggets kronesats er ikke oppgitt. Proveny −22 mill. bokført / −45 mill. påløpt (s. 80). |
| benefit | Reversere kuttet i eingongsstønaden | 23 | Reversere kuttet i eingongsstønaden | Engangsstønad ved fødsel er ikke en formelparameter, og verken dagens eller foreslått beløp er oppgitt. Bevilgning 134 mill. |
| benefit | Auke bortebuarstipendet med 500 kroner (til 7 515 kr) | 47 | Auke bortebuarstipendet med 500 kroner (til 7 515 kr) | Borteboerstipend for elever i videregående, ikke studiestøtte/basisstøtte. Beløp er oppgitt (kr 7 515), men faller utenfor formelraden. Bevilgning 52,8 mill. (også s. 15). |
| benefit | Sikre 40 prosent omgjering av lån til studentar ved folkehøgskular | 47 | Sikre 40 prosent omgjering av lån til studentar ved folkehøgskular | Reverserer kutt i stipendandelen «frå 40 % til 15 %» (s. 46) — gjelder bare folkehøgskoleelever, ikke ordinær basisstøtte. Bevilgning 97,3 mill. |
| benefit | Auke barnestipendet med 25 prosent utover regjeringa sin auke | 47 | Auke barnestipendet med 25 prosent utover regjeringa sin auke | Prosentvis økning uten oppgitt baseline; treffer bare studenter med barn. Bevilgning 44,9 mill. |
| benefit | Innføre eit ekstra foreldrestipend på 25 000 kroner | 47 | Innføre eit ekstra foreldrestipend på 25 000 kroner | Engangsstipend for studenter som får barn; ikke en formelparameter. Bevilgning 44,4 mill. |
| benefit | Ikkje betale ut barnetrygd utanfor EØS | 57 | Ikkje betale ut barnetrygd utanfor EØS | Innstramming for mottakere bosatt utenfor EØS; endrer ikke satsen for husholdninger i Norge. Innsparing −39 mill. |

## C. Categories reviewed with no proposal

| category | verdict (no-change / not-applicable) | where you looked (pages / table names) | note |
|---|---|---|---|
| Alminnelig inntekt (sats) | no-change | s. 8 «Skatt og avgift»-tabellen, s. 80 «Skatter og avgifter» (partiets komplette skatte-/avgiftsoppstilling), s. 6 narrativ | Søkeord «alminnelig inntekt» gir null treff i hele filen. |
| Trinnskatt trinn 1–3 | no-change | s. 8, s. 80; søk på «trinnskatt» og «innslagspunkt» (treff kun s. 8 og s. 80) | Kun trinn 4 og 5 berøres. |
| Personfradrag, minstefradrag (lønn og pensjon), fagforeningsfradrag | no-change | s. 8, s. 80; ordsøk i hele filen | Null treff på «personfradrag», «minstefradrag», «fagforening». |
| Formuesskattesatser (trinn 1/trinn 2) og verdsettelse av primærbolig, sekundærbolig, aksjer, bankinnskudd | no-change | s. 6, s. 8, s. 40, s. 41, s. 80 | Null treff på «verdsettelse», «primærbolig», «sekundærbolig», «aksje». Kun bunnfradrag, boliggrensen 10→10,21 mill. og driftsmiddelrabatt endres. |
| Merverdiavgift utenom næringsmidler (alminnelig sats, persontransport, strøm, drivstoff, alkohol/tobakk, flyreiser) | no-change | s. 8, s. 80; ordsøk «mva», «merverdiavgift», «moms» (treff s. 6, 8, 21, 24, 70, 80) | Bare matmomsen endres; øvrige «moms»-treff er momskompensasjon til organisasjonseigde kulturbygg (s. 21/24/70). |
| Elavgift for husholdninger | no-change | s. 8, s. 19, s. 80 | Begge elavgiftsgrepene gjelder datasentre. Ingen redusert vintersats (jan–mar) omtalt. |
| CO2-avgift på bensin og diesel | no-change | s. 7, s. 8, s. 38, s. 40, s. 41, s. 80 | CO2-endringene gjelder fiske og fangst i fjerne farvann, kvotepliktig innenriks sjøfart, veksthusnæringen og naturgass/LPG til industri — ingen husholdningsvirkning via drivstoffpumpa. |
| Alkoholavgift på vin og brennevin; tobakksavgift (sigaretter, snus) | no-change | s. 8, s. 80; ordsøk «alkohol», «tobakk», «snus» | Eneste alkoholgrep er gruppa «0,7 til 2,7 pst.». Null treff på «tobakk»/«snus». |
| Flypassasjeravgift, høy sats | no-change | s. 8, s. 15, s. 44, s. 80 | Bare «den lave satsen» endres. |
| Arbeidsgiveravgift (sats / ekstra arbeidsgiveravgift) | no-change | s. 8, s. 80; ordsøk i hele filen | Null treff på «arbeidsgiveravgift». |
| Kontantstøtte | not-applicable | s. 22–23 (familie), s. 57 (BFD-oppstilling); ordsøk «kontantst» | Null treff; ikke en template-rad, men gjennomgått som del av familieytelsene. |
| Barnetrygd, ordinære satser (under 6 / fra 6 / utvidet) | no-change | s. 22, s. 23, s. 57 | Bare dobbel barnetrygd for tredje barn og EØS-innstrammingen foreslås. |

## D. Extraction notes
- Location of the party's main tax/duty table(s): page(s) **8** (kapittelet «Skatt og avgift», gruppert etter formål) og **80** (vedlegget «Skatter og avgifter», partiets fullstendige post-for-post-oppstilling med både bokført og påløpt proveny). De to tabellene er konsistente; s. 80 gir i tillegg påløpte tall og kapittel/postnummer. Delvise gjentakelser av de samme radene finnes på s. 15 (kommune/distrikt), s. 40–41 (næring) og s. 44 (samferdsel), delvis på nynorsk. Makrotabellen s. 55 bekrefter netto −4269 mill. kr.
- Ambiguities:
  1. **Trinnskatt trinn 4/5**: innslagspunktet for «nye trinn 4» er eksplisitt (kr 960 000), men satsen for det sammenslåtte trinnet står ingen steder. Uten den kan marginalskatten over 960 000 kr ikke beregnes — kombinasjonen av +1681 mill. (sammenslåing) og +600 mill. (lavere innslagspunkt) er eneste holdepunkt.
  2. **«Reelt uendret» på bensin og diesel**: hovedkuttet i vegbruksavgiften er definert ved en egenskap (samlede drivstoffavgifter reelt uendret), ikke ved et kronebeløp. Bare det ekstra kuttet på 25 øre/L er tallfestet. Absoluttsats krever Prop. 1 LS-satser pluss prisjusteringsfaktor.
  3. **Alkoholgrepet «fra 0,7 til 2,7 pst.»**: dokumentet skriver ikke ut hva prosenttallene viser til (volumprosent er ikke nevnt), og oppgir ingen kronesats per liter. Radplasseringen under `excise.beerLitre` er gjort fordi det er nærmeste formelrad, ikke fordi dokumentet sier «øl».
  4. **Matmomsen har delårsvirkning** (fra 1. september): bokført −1700 mill. mot påløpt −3500 mill. En helårsberegning for husholdninger må velge mellom satsen (10 pst.) og årsvirkningen.
  5. **Flypassasjeravgiften**: dokumentet sier «den lave satsen», ikke «Europa». Tilordningen til `excise.flightEurope` er en mapping-beslutning, ikke partiets ordlyd.
- Process observations:
  - `awk`-et på macOS er ikke gawk: `IGNORECASE` gjør ingenting, så et første nøkkelordsveip ga falske nullresultater. Bruk `tolower($0) ~ k` eller `index(tolower($0),k)`.
  - Substring-søk gir falske treff på norsk: «mineralgjødselavgift» treffer på «elavgift» (s. 7), og «matmomsen» treffer på «moms». Verifiser alltid treffsiden før den føres inn.
  - Linjeskift i pdftotext-utdata deler ord med bindestrek («mat-/momsen» s. 6), så et anker må velges innenfor én linje. Alle 35 ankre i dette arket er `grep -F`-verifisert mot sin side.
  - Dokumentet er tospråklig (bokmål i skattekapitlet, nynorsk i flere fagkapitler): samme tiltak opptrer som «vegbruksavgiften … 25 øre/L» (s. 8) og «vegbruksavgifta … 25 øre per liter» (s. 40/44). Et søk på bare den ene formen mister sider.
