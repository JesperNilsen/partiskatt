# Ekstraksjonsark — Miljøpartiet De Grønne alternativt statsbudsjett 2026

Source: `sources/text/mdg-alt-2026.txt` (from `sources/raw/mdg-alt-2026.pdf`, see `sources/manifest.json`).
Extractor: claude  ·  Date: 2026-09-13

> **Revised 2026-09-26 by sprint lane L10b (not-reviewed sweep, decision 2).** Section-A rows whose note carries `[L10b]` replace both extractors’ text with one adjudicated reading of the source, written identically into both sheets. Where the party states only a change, the row is `estimated` with `DERIVE` in the value column and the arithmetic against Prop. 1 LS in the note; the encoded value and its derivation are in `src/data/parties/<party>.ts`. Text in rows without an `[L10b]` note is the extractor’s original 2026-09-13 reading.

## Rules for filling this sheet (binding)
1. Every value comes from the text file above. Nothing from memory, news, or other parties. If the document does not state it, write `NOT FOUND`.
2. `page` = 1 + number of form-feed characters (`\f`) before the line in the text file. Verify with `awk 'BEGIN{RS="\f"} NR==<page>' file | grep -n "<anchor>"`.
3. `anchor` = up to 10 words copied verbatim from that page, containing the number.
4. Parties state changes relative to the government's proposal (Prop. 1 LS 2025–2026). Record the party's stated *change* verbatim, the *baseline the party quotes* (if quoted), and the resulting *absolute value* only when it can be derived from numbers in the document (baseline + change). Otherwise write `DERIVE` in the absolute column and leave the change column filled.
5. `status`: `confirmed` = explicit number in the document · `estimated` = needs an assumption (state it in note) · `unquantified` = proposal exists but has no usable number · `no-change` = category reviewed, nothing proposed · `NOT FOUND` = looked, found nothing (state where you looked in note).
6. Units: rates in percent as printed (e.g. `13,7 %`), thresholds and amounts in kroner as printed (`kr 697 150`), per-unit duties as printed with unit (`0,1669 kr/kWh`, `3,53 kr/l`, `kr 100 per passasjer`), monthly benefits as `kr/mnd`.
7. Do not summarise or interpret policy. Do not fill rows for proposals aimed at companies, municipalities or specific industries unless they hit one of the formulas below.

## A. Rules (one row per formula; add `trinnN` sub-rows for brackets)

| formulaId | parameter | baseline quoted by party | party absolute value | stated change (verbatim ≤15 words) | page | anchor (≤10 words) | status | proveny mill. kr (if stated) | note |
|---|---|---|---|---|---|---|---|---|---|
| income.generalRate | sats alminnelig inntekt | | | | | | no-change | | Uttrykket «alminnelig inntekt» forekommer ikke i dokumentet. Sett gjennom kap. 5501 post 70/72 (s. 79–80) og hovedtabellene s. 19 og s. 47; ingen satsendring. |
| income.bracketTax.trinn1 | innslagspunkt + sats | | | | | | no-change | | «Trinnskatt» forekommer kun som posttittel «Trinnskatt og formuesskatt mv.» (s. 79); under den posten ligger personfradrag og bunnfradrag, ingen trinnendring. |
| income.bracketTax.trinn2 | innslagspunkt + sats | | | | | | no-change | | Som trinn 1. |
| income.bracketTax.trinn3 | innslagspunkt + sats | | | | | | no-change | | Som trinn 1. |
| income.bracketTax.trinn4 | innslagspunkt + sats | | | | | | no-change | | Som trinn 1. |
| income.bracketTax.trinn5 | innslagspunkt + sats | | | | | | no-change | | Som trinn 1. |
| income.socialSecurity | trygdeavgift lønn / pensjon / nedre grense | — | DERIVE | «Reverserer regjeringens flate kutt på 0,1% i trygdeavgiften» | 19; 82 | Reverserer regjeringens flate kutt på 0,1% i trygdeavgiften | estimated | -2 260 (s. 19, 82) / 2 283 (s. 47) | [L10b] Utledet: Prop. 1 LS s. 80 kutter lønn/trygd 7,7 → 7,6 %; reversert 7,7 %. Pensjon 5,1 % uendret. Sidene er enige om tiltaket; bare provenyfortegnet avviker (K4). |
| income.personalAllowance | personfradrag | ikke sitert | kr 125 000 | Gir skattelettelse til alle ved å øke personfradraget til kr 125.000 | 19 | øke personfradraget til kr 125.000 | confirmed | 9 180 (s. 19); −9 180 (kap. 5501 post 70, s. 79) | S. 79 presiserer «Øker personfradrag på arbeid og trygd til 125.000 kr.» (anker: «-9 180 000 Øker personfradrag på arbeid og trygd», tallet 125.000 står på neste linje). Dokumentet sier ikke om andre inntektstyper får samme fradrag. S. 47 slår personfradrag og formuesbunnfradrag sammen til −10 107. |
| income.minimumDeductionWage | minstefradrag lønn: sats / øvre grense | | | | | | no-change | | Ordet «minstefradrag» forekommer ikke i dokumentet (0 treff i hele filen). Sett gjennom skattekapitlet s. 18–19, vedlegg II s. 47 og kap. 21-tabellen s. 79–82. |
| income.minimumDeductionPension | minstefradrag pensjon: sats / øvre grense | | | | | | no-change | | Som minstefradrag lønn: 0 treff på «minstefradrag». |
| income.unionFeeDeduction | fagforeningsfradrag maks | | | | | | no-change | | Ordet «fagforening» forekommer ikke i dokumentet (0 treff). Sett gjennom kap. 5501 post 72 (s. 79–80) der øvrige fradragsendringer er bokført. |
| wealth.netWealthTax | bunnfradrag (enslig/ektefeller), sats trinn 1, trinn 2 innslag + sats | — | bunnfradrag 10 000 000 (ektepar 20 000 000); satser uendret | «Øke bunnfradraget i formuesskatten til 10 mill. og kutte verdsettingsrabatter» | 9; 19; 79 | Øke bunnfradraget i formuesskatten til 10 mill. | estimated | -8 000 | [L10b] Partiets tall; ektepar = 2 × enslig som i Prop. 1 LS. Rabattkuttet i samme linje er unquantified. |
| wealth.valuation | verdsettelse primærbolig (inkl. høy verdi), sekundærbolig, aksjer, bankinnskudd | — | DERIVE | «kutte verdsettingsrabatter» (s. 9) / «rabatter fjernes» (s. 79) | 9; 79 | Bunnfradrag økes til 10 mill. og rabatter | unquantified | -8 000 (samlet) | [L10b] Ikke sagt hvilke rabatter eller til hvilket nivå. Unquantified i mdg.ts. |
| vat.food | mva næringsmidler | — | DERIVE | «Øker mva til generell sats for ikke-økologisk kjøtt, godteri og brus» | 80 | ikke-økologisk kjøtt, godteri og brus | unquantified | 6 000 | [L10b] Modellen har én matsats. Unquantified i mdg.ts. |
| vat.general | mva alminnelig sats | | | | | | no-change | | Kap. 5521 (s. 80–81) endrer kun hvilke varer og tjenester som ligger i hvilken sats, ikke satsen selv. Ingen mva-prosent er trykt i dokumentet. |
| vat.transportServices | mva persontransport | | | | | | no-change | | Ingen generell endring for persontransport i kap. 5521 (s. 80–81). Kun innenlandsflyreiser flyttes til generell sats — ført på vat.flights. |
| vat.electricity | mva strøm | | | | | | no-change | | Mva på strøm nevnes ikke. Strømtiltakene ligger på utgiftssiden (kap. 1820 postene 75/77/78/79/80, s. 66). |
| vat.fuel | mva drivstoff | | | | | | no-change | | Mva på drivstoff nevnes ikke; drivstoffendringene ligger i veibruksavgift og CO2-avgift (kap. 5538/5542, s. 81). |
| vat.alcoholTobacco | mva alkohol/tobakk | | | | | | no-change | | Alkohol- og tobakksendringene ligger i særavgiftene (kap. 5526 og 5531, s. 81), ikke i mva. |
| vat.flights | mva flyreiser | — | DERIVE | «Innfører generell mva-sats på innenlandsflyreiser» | 81 | innenlandsflyreiser | unquantified | 1 050 | [L10b] Forbruksprofilen skiller ikke innenlands fra utenlands fly. Unquantified i mdg.ts. |
| excise.petrolLitre | veibruksavgift + CO2-avgift bensin | — | DERIVE | «Øker veibruksavgiften på bensin og bioetanol med 2.50 kroner» | 81 | på bensin og bioetanol med 2.50 kroner | estimated | 1 380 | [L10b] Utledet: Prop. 1 LS (4,25 + 2,50) + CO2 3,80 = 10,55 kr/l. CO2-avgift 2150 kr/tonn er unquantified i mdg.ts. |
| excise.dieselLitre | veibruksavgift + CO2-avgift diesel | — | DERIVE | «Øker veibruksavgiften på diesel/mineralolje og biodiesel med 2.50 kroner» | 81 | diesel/mineralolje og biodiesel med 2.50 | estimated | 4 350 | [L10b] Utledet: Prop. 1 LS (3,00 + 2,50) + CO2 4,42 = 9,92 kr/l. CO2-økningen er unquantified. |
| excise.kwh | elavgift (alminnelig sats, evt. redusert jan–mar) | — | DERIVE | «Vi reverserer den foreslåtte reduksjonen i elavgiften.» | 81 | Vi reverserer den foreslåtte reduksjonen i | unquantified | 2 330 | [L10b] 2025-satsene var ulike gjennom året; ingen entydig helårssats. Unquantified i mdg.ts. |
| excise.flightEurope | flypassasjeravgift Europa | — | DERIVE | «Avvikler dagens flypassasjeravgift»; «Innfører flyseteavgift mellom Norges største flyplasser og på flygninger utenlands» | 82 | Avvikler dagens flypassasjeravgift | unquantified | -1 900; 13 000 | [L10b] Den nye flyseteavgiften har ingen sats. Unquantified i mdg.ts (K4 står åpen). |
| excise.flightOther | flypassasjeravgift utenfor Europa | — | DERIVE | «Avvikler dagens flypassasjeravgift»; «Innfører flyseteavgift mellom Norges største flyplasser og på flygninger utenlands» | 82 | Avvikler dagens flypassasjeravgift | unquantified | -1 900; 13 000 | [L10b] Som flightEurope. |
| excise.beerLitre | alkoholavgift øl | — | uendret | — | 81 | Vi avvikler taxfree på alkohol og fjerner | no-change | 1 950 | [L10b] Bare taxfree og tollfri kvote endres, ikke alkoholavgiften per liter. |
| excise.wineLitre | alkoholavgift vin | — | uendret | — | 81 | Vi avvikler taxfree på alkohol og fjerner | no-change | 1 950 | [L10b] Bare taxfree og tollfri kvote endres, ikke alkoholavgiften per liter. |
| excise.spiritsLitre | alkoholavgift brennevin | — | uendret | — | 81 | Vi avvikler taxfree på alkohol og fjerner | no-change | 1 950 | [L10b] Bare taxfree og tollfri kvote endres, ikke alkoholavgiften per liter. |
| excise.cigarette | tobakksavgift sigaretter | — | DERIVE | «Vi avvikler taxfree og øker avgift på tobakksvarer» | 81 | Vi avvikler taxfree og øker avgift på | unquantified | 1 620 | [L10b] Økningen er ikke tallfestet. Unquantified i mdg.ts. |
| excise.snusGram | tobakksavgift snus | — | DERIVE | «Vi avvikler taxfree og øker avgift på tobakksvarer» | 81 | Vi avvikler taxfree og øker avgift på | unquantified | 1 620 | [L10b] Økningen er ikke tallfestet. Unquantified i mdg.ts. |
| benefit.childBenefit | barnetrygd under 6 / fra 6 / utvidet (enslig) | — | DERIVE | «Doble barnetrygden og gjøre den mer omfordelende gjennom skatt og avvikling av foreldrefradrag» | 21; 50 | Doble barnetrygden og gjøre den mer omfordelende gjennom skatt | unquantified | 29 798 | [L10b] Barnetrygden skattlegges som lønn, som modellen ikke kan regne. Unquantified i mdg.ts. |
| benefit.studentSupport | studiestøtte (basisstøtte, stipendandel) | — | DERIVE | «Vi øker basislånet til studenter til tilsvarende 1,4G» | 24 | Vi øker basislånet til studenter til tilsvarende 1,4G | unquantified | 377,2 | [L10b] G og virkningstidspunkt ikke oppgitt. Unquantified i mdg.ts. |
| employer.contribution | arbeidsgiveravgift sats / ekstra avgift | | | | | | no-change | | Ordet «arbeidsgiveravgift» forekommer ikke i dokumentet (0 treff). Kap. 5700 post 72 er ikke med i kapittel 21-tabellen (s. 79–82); eneste endrede post under Folketrygdens inntekter er post 71 Trygdeavgift. |

## B. Proposals that touch household cash but cannot enter the formulas (unquantified)

| category (direct-tax / wealth-tax / consumption-tax / benefit / employer) | title (party's wording) | page | anchor | why it cannot be quantified for an individual |
|---|---|---|---|---|
| benefit | Klimabelønning som flat utbetaling til alle personer fra flyseteavgiften | 81 | Klimabelønning som flat utbetaling til alle | Utbetalingen er geografisk differensiert (s. 18) og oppgis kun som samlet beløp (−11 100 og −900 mill.). Eksempelhusholdningene får 6 000 kr/år (s. 19) og 11 250 kr/år (s. 20), men ingen sats per person er definert. |
| consumption-tax | Innfører flyseteavgift mellom Norges største flyplasser og på flygninger utenlands | 82 | 13 000 000 Innfører flyseteavgift mellom Norges | Avgiften legges per sete på flyselskapet, ikke per passasjer. Ingen kronesats per sete, og ingen soneinndeling, er oppgitt. |
| benefit | Flat strømstøtte på 400 kroner per måned til alle husholdninger med høye strømpriser | 66 | Flat strømstøtte på 400 kroner per måned | Beløpet er per husholdning og betinget av prisområde (NO1, NO2, NO5) og av at prisen er høy; eksemplene regner 6 måneder (s. 19, s. 20). Ikke en skatte- eller avgiftsparameter. |
| direct-tax | Avvikling av foreldrefradraget grunnet doblet barnetrygd | 79 | Avvikling av foreldrefradraget grunnet | Fradragets satser og tak er ikke trykt; effekten avhenger av antall barn og faktiske pass- og stellutgifter. Proveny 1 400 mill. (s. 79) / 1 200 mill. (s. 47). |
| direct-tax | Avvikling av pendlerfradraget som erstattes av nasjonalt månedskort og klimabelønning | 80 | 1 430 000 Avvikling av pendlerfradraget som | Fradragets satser, bunnbeløp og avstandsgrenser er ikke trykt; effekten avhenger av reiseavstand. Proveny 1 430 mill. |
| direct-tax | Innfører tak på fradrag for renter på lån 40 G | 80 | Innfører tak på fradrag for renter på lån 40 | G er ikke tallfestet i dokumentet, og det står ikke om taket gjelder lånets størrelse eller rentebeløpet. Proveny 2 380 mill. |
| direct-tax | Avvikler skattefavorisert individuell pensjonssparing | 79 | Avvikler skattefavorisert individuell | Verken innskuddstak eller fradragssats for IPS er trykt. Proveny 540 mill. Se også verbalforslag s. 41. |
| direct-tax | Nedskalering av Stoltenbergs skatteforsøk fra 100.000 personer til 20.000 personer | 79 | fra 100.000 personer til 20.000 personer | Arbeidsfradraget for unge er ikke tallfestet, og ordningen treffer bare et utvalg personer. Proveny 400 mill. |
| direct-tax | Øker skattefri grense på utleie av fritidsbolig til 50.000 kr. | 80 | Øker skattefri grense på utleie av | Beløpsgrensen er oppgitt (50 000 kr), men gjelder bare husholdninger som leier ut fritidsbolig og inngår ikke i noen av formlene. Proveny −110 mill. (s. 80) / 110 mill. (s. 12). |
| wealth-tax | Innføre nasjonal eiendomsskatt | 18 | Innføre nasjonal eiendomsskatt | Bare en hovedsatsing; verbalforslaget s. 41 ber om utredning. Ingen sats, bunnfradrag eller proveny er oppgitt. |
| consumption-tax | Fjerner mva på gjenbruk, brukthandel og reparasjon | 81 | - 500 000 Fjerner mva på gjenbruk, brukthandel og | Berører bare et avgrenset varesegment; verken dagens sats eller husholdningenes forbruksandel er oppgitt. Proveny −500 mill. |
| consumption-tax | Redusere til redusert mva-sats på servering | 81 | - 6 000 000 Redusere til redusert mva-sats på | Den reduserte satsen er ikke trykt, og serveringsforbruk inngår ikke i noen formel. Proveny −6 000 mill. |
| consumption-tax | Mer gradvis reduksjon av elbil-mvafritak | 81 | - 3 000 000 Mer gradvis reduksjon av elbil-mvafritak | Innslagspunktet for 2026 er ikke oppgitt (verbalforslaget s. 39 gjelder fra 2027, maks −100 000 kr per år). Proveny −3 000 mill. |
| consumption-tax | Innfører tekstilavgift etter modell av ekspertgruppen for sirkulærøkonomi | 82 | 8 000 000 Innfører tekstilavgift etter modell av | Ny avgift uten sats eller beregningsgrunnlag; verbalforslaget s. 40 sier vekt og antall. Proveny 8 000 mill. |
| consumption-tax | Innføring av kontrollavgift på småpakker fra utenfor EU/EØS | 82 | 250 000 Innføring av kontrollavgift på småpakker | Ingen sats per pakke oppgitt. Proveny 250 mill. |
| consumption-tax | Øker veibruksavgiften på naturgass og LPG med 2,00 kroner per Sm3 | 81 | LPG med 2,00 kroner per Sm3 | Gjelder et drivstoff som ikke inngår i formlene for bensin/diesel. Proveny 2 mill. |
| consumption-tax | Innfører avgift tilsvarende veibruksavgift for diesel brukt til fritidsbåter | 81 | Innfører avgift tilsvarende veibruksavgift | Satsen er ikke tallfestet, og forbruket er ikke en husholdningsformel. Proveny 86 mill. |
| consumption-tax | Øke satsen i trinn 1 i CO2-komponenten (engangsavgift) | 81 | Øke satsen i trinn 1 i CO2-komponenten | Engangsavgift ved kjøretøykjøp; ingen kronesats oppgitt. Proveny 45 mill. |
| consumption-tax | Vi avvikler taxfree på alkohol og fjerner tollfri kvote | 81 | 1 950 000 Vi avvikler taxfree på alkohol og | Prisvirkningen per husholdning avhenger av reisemønster og kvoteutnyttelse; ingen sats endres. Proveny 1 950 mill. |
| benefit | Innføre nasjonalt reisekort til 499 kr for voksne og 249 kr for barn, ungdom og studenter | 8 | Innføre nasjonalt reisekort til 499 kr for voksne og 249 kr | Prisregulering av kollektivbilletter, ikke en skatte- eller ytelsesparameter. Proveny/utgift 6 000 mill. |
| benefit | Gjeninnfører en kontantstøtteperiode på 11 måneder fra 1. august 2026 | 50 | Gjeninnfører en kontantstøtteperiode på | Ingen månedssats oppgitt, kun varighet og utgift 172,523 mill. |
| benefit | Øker fribeløpet i uføretrygden til 1 G fra 1. juli 2026 | 21 | Øker fribeløpet i uføretrygden til 1 G fra 1. juli 2026 | G er ikke tallfestet i dokumentet; treffer bare uføretrygdede. Utgift 381 mill. |
| benefit | Øke engangsstønaden til 1 G og bevare overgangsstønaden | 21 | Øke engangsstønaden til 1 G og bevare overgangsstønaden | G er ikke tallfestet; engangsytelse utenfor formlene. Utgift 736 mill. |
| benefit | Øker utgiftstaket i bostøtten | 21 | Øker utgiftstaket i bostøtten | Verken dagens eller nytt utgiftstak er oppgitt. Utgift 480 mill. |
| benefit | Minstepris på 1 kr/kWh for salg av overskuddsstrøm | 66 | Minstepris på 1 kr/kWh for salg av | Gjelder kun husholdninger som selger egenprodusert strøm; ikke en avgifts- eller ytelsesparameter. Utgift 100 mill. |

## C. Categories reviewed with no proposal

| category | verdict (no-change / not-applicable) | where you looked (pages / table names) | note |
|---|---|---|---|
| Sats alminnelig inntekt | no-change | s. 18–19 (kap. 3.1 «Omfordele gjennom grønn og rettferdig skatt» + tiltakstabell), s. 47 (Vedlegg II «Skatter og fradrag - Hovedtall»), s. 79–80 (kap. 5501 postene 70 og 72) | Uttrykket forekommer ikke i filen. |
| Trinnskatt (alle trinn) | no-change | s. 79 (kap. 5501 post 70 «Trinnskatt og formuesskatt mv.»), s. 19, s. 47 | Posttittelen nevner trinnskatt, men de tre bokførte endringene under posten er personfradrag, bunnfradrag i formuesskatten og skatteforsøket for unge. |
| Minstefradrag (lønn og pensjon) | no-change | Hele filen (0 treff på «minstefradrag»), s. 18–19, s. 47, s. 79–82 | |
| Fagforeningsfradrag | no-change | Hele filen (0 treff på «fagforening»), s. 79–80 (kap. 5501 post 72) | |
| Arbeidsgiveravgift | no-change | Hele filen (0 treff på «arbeidsgiveravgift»), s. 82 (kap. 5700) | Kun post 71 Trygdeavgift endres under Folketrygdens inntekter. |
| Alminnelig mva-sats | no-change | s. 80–81 (kap. 5521 Merverdiavgift, seks bokførte endringer), s. 47 | Ingen mva-prosent er trykt noe sted i dokumentet. |
| Mva persontransport, strøm, drivstoff, alkohol/tobakk | no-change | s. 80–81 (kap. 5521), s. 47 | Kun flyreiser (innenlands), kjøtt/godteri/brus, servering, gjenbruk/reparasjon og elbil er omtalt. |
| Alkoholavgift per liter (øl, vin, brennevin) | no-change | s. 81 (kap. 5526 post 70), s. 47 («Avgifter på rusmidler») | Eneste tiltak er avvikling av taxfree og tollfri kvote. |
| Verdsettelse av bankinnskudd | not-applicable | s. 9, s. 19, s. 47, s. 79 | «Rabatter fjernes» gjelder rabatterte formuesobjekter; bankinnskudd verdsettes allerede uten rabatt og nevnes ikke. |
| Flypassasjeravgift sonedeling | not-applicable | s. 82 (kap. 5561 postene 70 og 71), s. 7 | Avgiften avvikles i sin helhet, så skillet Europa/utenfor Europa faller bort. |

## D. Extraction notes
- Location of the party's main tax/duty table(s): page(s) **79–82** (Vedlegg III, kapittel «20 Stortinget, finansadministrasjon» og «21 Skatter, avgifter, toll» — kap./post-tabellen med alle skatte- og avgiftsendringer), supplert av **s. 47** (Vedlegg II, «Skatter og avgifter» — hovedtall) og **s. 19** (kapittel 3.1, «Våre viktigste tiltak»). Manifestets hint om s. 7–8 traff sammendragstabellene i klima- og energikapitlet, ikke skattetabellen.
- Statuskonvensjon brukt her: `confirmed` når dokumentet trykker et tall som fester selve parameteren (kr 125 000, 10 mill., +0,1 %, +2,50 kr/l, 2150 kr/tonn, 1,4 G, «dobler»), også når absoluttverdien krever et Prop. 1 LS-grunnlag partiet ikke siterer (da `DERIVE`). `unquantified` er forbeholdt forslag uten brukbart tall for parameteren (tobakk).
- Ambiguities:
  1. **Fortegn på provenytallene er inkonsistent.** Trygdeavgiften står som −2 260 på s. 19 og s. 82, men +2 283 på s. 47. Personfradraget står som 9 180 på s. 19 og −9 180 000 på s. 79. Tabellene på s. 7–19 bruker tilsynelatende «−» for provenyøkning (inndragning fra husholdningene), mens vedlegg II på s. 47 bruker motsatt fortegn. Beløpene er også ulike (2 260 mot 2 283).
  2. **«Rabatter fjernes» er ikke spesifisert.** Dokumentet sier aldri hvilke verdsettelsesrabatter som fjernes, og nevner verken primærbolig, sekundærbolig eller aksjer i formuessammenheng. Antakelsen om 100 % verdsettelse på alle objekter er min, ikke partiets.
  3. **Ingen mva-satser eller G-beløp er trykt.** «Generell sats», «redusert mva-sats», «1,4 G», «1 G» og «40 G» brukes gjennomgående uten tallverdi, så alle mva-rader og studiestøtte/uføre-/engangsstønadsradene må hente baseline utenfra.
  4. **Barnetrygdsatsene er aldri trykt.** «Dobler alle satsene» (s. 17) er entydig som operasjon, men dokumentet oppgir ikke om utvidet barnetrygd for enslige forsørgere dobles på samme måte — eksempelet på s. 20 antyder ja, uten å si det.
  5. **Flypassasjeravgiften erstattes av en avgift med annen skattesubjekt.** Flyseteavgiften (13 000 mill.) treffer seter, ikke passasjerer, så husholdningseffekten kan ikke utledes uten en antakelse om overveltning.
- Process observations:
  - Case-sensitiv grep på «trinnskatt» ga null treff og nesten fikk meg til å konkludere for tidlig; den eneste forekomsten er posttittelen «Trinnskatt og formuesskatt mv.» med stor T. Alle nøkkelordsøk bør kjøres case-insensitivt.
  - pdftotext-tabellene bryter setninger midt i talloppgaven («Øker personfradrag … til» / «125.000 kr.» på neste linje), så et anker med tall må ofte hentes fra sammendragstabellen i brødteksten i stedet for fra kap./post-tabellen.
  - MDGs dokument har ingen samlet skatte- og avgiftssatstabell av den typen andre partier bruker; alt må leses ut av kap./post-tabellen på s. 79–82, der endringen beskrives i fritekst og bare provenyet er tallfestet.
