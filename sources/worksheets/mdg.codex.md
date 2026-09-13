# Ekstraksjonsark — Miljøpartiet De Grønne alternativt statsbudsjett 2026

Source: sources/text/mdg-alt-2026.txt

Extractor: codex · Date: 2026-09-13

## A. Rules (one row per formula; add `trinnN` sub-rows for brackets)

| formulaId | parameter | baseline quoted by party | party absolute value | stated change (verbatim ≤15 words) | page | anchor (≤10 words) | status | proveny mill. kr (if stated) | note |
|---|---|---|---|---|---|---|---|---|---|
| income.generalRate | sats alminnelig inntekt | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt hele filen etter «alminnelig inntekt» og gjennomgått skattetabellene s. 47 og 79–82. |
| income.bracketTax.trinn1 | innslagspunkt + sats | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt hele filen etter «trinnskatt» og «innslagspunkt»; ingen trinnsatser eller grenser oppgitt. |
| income.bracketTax.trinn2 | innslagspunkt + sats | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Samme søk som trinn 1. |
| income.bracketTax.trinn3 | innslagspunkt + sats | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Samme søk som trinn 1. |
| income.bracketTax.trinn4 | innslagspunkt + sats | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Samme søk som trinn 1. |
| income.bracketTax.trinn5 | innslagspunkt + sats | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Samme søk som trinn 1. |
| income.socialSecurity | trygdeavgift lønn / pensjon / nedre grense | NOT FOUND | DERIVE | Reverserer regjeringens flate kutt på 0,1% i trygdeavgiften | 19 | `flate kutt på 0,1% i trygdeavgiften -2 260` | confirmed | -2 260 | Absolutt sats og fordeling lønn/pensjon/nedre grense er ikke oppgitt. S. 47 oppgir avvikende proveny 2 283. |
| income.personalAllowance | personfradrag | NOT FOUND | kr 125.000 | øke personfradraget til kr 125.000 | 19 | `øke personfradraget til kr 125.000 9 180` | confirmed | 9 180 | S. 79 viser provenyet som -9 180 000 i tabell med tall i 1000 kroner. |
| income.minimumDeductionWage | minstefradrag lønn: sats / øvre grense | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt hele filen etter «minstefradrag»; ingen treff. |
| income.minimumDeductionPension | minstefradrag pensjon: sats / øvre grense | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt hele filen etter «minstefradrag»; ingen treff. |
| income.unionFeeDeduction | fagforeningsfradrag maks | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt hele filen etter «fagforening»; ingen treff. |
| wealth.netWealthTax | bunnfradrag (enslig/ektefeller), sats trinn 1, trinn 2 innslag + sats | NOT FOUND | bunnfradrag: 10 mill.; øvrige parametere: NOT FOUND | Øke bunnfradraget i formuesskatten til 10 mill. | 9 | `til 10 mill. og kutte verdsettingsrabatter –8 000` | confirmed | –8 000 | Dokumentet skiller ikke enslig/ektefeller og oppgir ingen satser eller øvre innslagspunkt. Provenyet gjelder også verdsettingsrabatter. |
| wealth.valuation | verdsettelse primærbolig (inkl. høy verdi), sekundærbolig, aksjer, bankinnskudd | NOT FOUND | DERIVE | kutte verdsettingsrabatter | 9 | `til 10 mill. og kutte verdsettingsrabatter –8 000` | unquantified | –8 000 samlet | Ingen verdsettingsprosenter eller aktivafordeling oppgitt; provenyet er samlet med bunnfradraget. |
| vat.food | mva næringsmidler | NOT FOUND | DERIVE | Øker mva til generell sats for ikke-økologisk kjøtt, godteri og brus | 80 | `6 000 000 Øker mva til generell sats for` | unquantified | 6 000 | Generell sats og eksisterende satser er ikke oppgitt; tiltaket gjelder bare angitte varer. |
| vat.general | mva alminnelig sats | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | «Generell sats» omtales som mål for enkelte varer, men satsen oppgis ikke og endres ikke eksplisitt. |
| vat.transportServices | mva persontransport | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt etter «merverdiavgift», «mva» og persontransport; ingen mva-endring for persontransport funnet. |
| vat.electricity | mva strøm | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt etter «mva», «merverdiavgift» og strøm; bare elavgift og støtteordninger funnet. |
| vat.fuel | mva drivstoff | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt etter «mva», «bensin», «diesel» og «drivstoff»; bare særavgifter funnet. |
| vat.alcoholTobacco | mva alkohol/tobakk | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt etter mva sammen med alkohol/tobakk; bare særavgifter og taxfree-endringer funnet. |
| vat.flights | mva flyreiser | NOT FOUND | DERIVE | Innfører generell mva-sats på innenlandsflyreiser | 81 | `1 050 000 Innfører generell mva-sats på` | unquantified | 1 050 | Generell sats og eksisterende sats er ikke oppgitt. |
| excise.petrolLitre | veibruksavgift + CO2-avgift bensin | NOT FOUND | DERIVE | Øker veibruksavgiften på bensin og bioetanol med 2.50 kroner; CO2-avgiften til 2150 kroner per tonn | 81 | `bioetanol med 2.50 kroner`<br>`4 670 000 Vi øker CO2-avgiften til 2150 kroner per` | unquantified | 1 380 (veibruksavgift) | Enhet for 2.50 kroner, baseline og omregning fra CO2-avgift per tonn til per liter oppgis ikke. Generelt CO2-proveny er ikke drivstoffordelt. |
| excise.dieselLitre | veibruksavgift + CO2-avgift diesel | NOT FOUND | DERIVE | Øker veibruksavgiften på diesel/mineralolje og biodiesel med 2.50 kroner; CO2-avgiften til 2150 kroner per tonn | 81 | `diesel/mineralolje og biodiesel med 2.50`<br>`4 670 000 Vi øker CO2-avgiften til 2150 kroner per` | unquantified | 4 350 (veibruksavgift) | Enhet for 2.50 kroner, baseline og omregning fra CO2-avgift per tonn til per liter oppgis ikke. Generelt CO2-proveny er ikke drivstoffordelt. |
| excise.kwh | elavgift (alminnelig sats, evt. redusert jan–mar) | NOT FOUND | DERIVE | Vi reverserer den foreslåtte reduksjonen i elavgiften. | 81 | `2 330 000 Vi reverserer den foreslåtte reduksjonen` | unquantified | 2 330 | Ingen kr/kWh-sats eller månedsfordeling oppgitt. |
| excise.flightEurope | flypassasjeravgift Europa | NOT FOUND | DERIVE | Avvikler dagens flypassasjeravgift; Innfører flyseteavgift mellom Norges største flyplasser og på flygninger utenlands. | 82 | `-1 900 000 Avvikler dagens flypassasjeravgift`<br>`13 000 000 Innfører flyseteavgift mellom Norges` | unquantified | -1 900; 13 000 | Ny avgift oppgis ikke per passasjer eller fordelt på Europa/øvrige reisemål. |
| excise.flightOther | flypassasjeravgift utenfor Europa | NOT FOUND | DERIVE | Avvikler dagens flypassasjeravgift; Innfører flyseteavgift mellom Norges største flyplasser og på flygninger utenlands. | 82 | `-1 900 000 Avvikler dagens flypassasjeravgift`<br>`13 000 000 Innfører flyseteavgift mellom Norges` | unquantified | -1 900; 13 000 | Ny avgift oppgis ikke per passasjer eller fordelt på Europa/øvrige reisemål. |
| excise.beerLitre | alkoholavgift øl | NOT FOUND | DERIVE | Vi avvikler taxfree på alkohol og fjerner tollfri kvote. | 81 | `1 950 000 Vi avvikler taxfree på alkohol` | unquantified | 1 950 samlet alkohol | Ingen avgiftssats eller provenyfordeling mellom øl, vin og brennevin. |
| excise.wineLitre | alkoholavgift vin | NOT FOUND | DERIVE | Vi avvikler taxfree på alkohol og fjerner tollfri kvote. | 81 | `1 950 000 Vi avvikler taxfree på alkohol` | unquantified | 1 950 samlet alkohol | Ingen avgiftssats eller provenyfordeling mellom øl, vin og brennevin. |
| excise.spiritsLitre | alkoholavgift brennevin | NOT FOUND | DERIVE | Vi avvikler taxfree på alkohol og fjerner tollfri kvote. | 81 | `1 950 000 Vi avvikler taxfree på alkohol` | unquantified | 1 950 samlet alkohol | Ingen avgiftssats eller provenyfordeling mellom øl, vin og brennevin. |
| excise.cigarette | tobakksavgift sigaretter | NOT FOUND | DERIVE | Vi avvikler taxfree og øker avgift på tobakksvarer | 81 | `1 620 000 Vi avvikler taxfree og øker avgift` | unquantified | 1 620 samlet tobakk | Ingen sats eller fordeling mellom sigaretter og snus. |
| excise.snusGram | tobakksavgift snus | NOT FOUND | DERIVE | Vi avvikler taxfree og øker avgift på tobakksvarer | 81 | `1 620 000 Vi avvikler taxfree og øker avgift` | unquantified | 1 620 samlet tobakk | Ingen sats eller fordeling mellom sigaretter og snus. |
| benefit.childBenefit | barnetrygd under 6 / fra 6 / utvidet (enslig) | NOT FOUND | DERIVE | Dobler barnetrygden mot å skattelegge den som lønn | 51 | `29 798 000 Dobler barnetrygden mot å skattelegge` | unquantified | 29 798 økt utbetaling | S. 17 sier alle satser dobles, men dokumentet oppgir ingen sats per alder eller kr/mnd. |
| benefit.studentSupport | studiestøtte (basisstøtte, stipendandel) | 15 pst. stipendandel, bare folkehøyskoleelever | basislån: 1,4G; stipendandel folkehøyskoleelever: 40 pst. | Vi øker basislånet til studenter til tilsvarende 1,4G; fra 15 pst. til 40 pst. | 24 | `basislånet til studenter til tilsvarende 1,4G 377,2`<br>`basislånet fra 15 pst. til 40 pst. for folkehøyskoleelever 97,3` | confirmed | 377,2; 97,3 | G-beløpet og generell stipendandel for øvrige studenter er ikke oppgitt. |
| employer.contribution | arbeidsgiveravgift sats / ekstra avgift | NOT FOUND | NOT FOUND | NOT FOUND |  |  | NOT FOUND | NOT FOUND | Søkt hele filen etter «arbeidsgiveravgift»; ingen treff. |

## B. Proposals that touch household cash but cannot enter the formulas (unquantified)

| category (direct-tax / wealth-tax / consumption-tax / benefit / employer) | title (party's wording) | page | anchor | why it cannot be quantified for an individual |
|---|---|---|---|---|
| direct-tax | Skattlegging av doblet barnetrygd | 47 | `Skattlegging av doblet barnetrygd 20 878` | Barnetrygdsatsene og individuell skattesats er ikke oppgitt. |
| direct-tax | Avvikling av foreldrefradraget som følge av doblet barnetrygd | 47 | `Avvikling av foreldrefradraget som følge av doblet barnetrygd 1 200` | Individuelt fradrag og utgifter er ikke oppgitt. |
| direct-tax | Avvikling av rentefradrag på lån over 40 G | 47 | `Avvikling av rentefradrag på lån over 40 G 2 380` | G-beløp, gjeld, renter og gjennomføringsdetaljer mangler. |
| direct-tax | Reduksjon av pendlerfradraget på grunn av innføring av nasjonalt reisekort | 47 | `innføring av nasjonalt reisekort 1 430` | Ny individuell fradragsregel oppgis ikke. |
| direct-tax | Avvikling av skattefradrag for individuell pensjonssparing | 47 | `Avvikling av skattefradrag for individuell pensjonssparing 540` | Individuell sparing og fradragsgrunnlag mangler. |
| direct-tax | Nedskalering av regjeringens skatteforsøk med arbeidsfradrag for unge | 47 | `regjeringens skatteforsøk med arbeidsfradrag for unge 400` | Forsøksutvalg og individuell fradragsvirkning oppgis ikke. |
| direct-tax | Øke skattefri grense på utleie av fritidsbolig til 50 000 | 12 | `skattefri grense på utleie av fritidsbolig til 50 000` | Baseline, leieinntekt og skatteregel utover grensen mangler. |
| direct-tax | Innføre en forenklet fradragsordning for selvstendig næringsdrivende | 10 | `forenklet fradragsordning for selvstendig næringsdrivende –300` | Fradragssats, maksimum og kvalifiserende kostnader oppgis ikke. |
| wealth-tax | nasjonal eiendomsskatt | 41 | `11.​Stortinget ber regjeringen utrede og legge frem forslag` | Bare en utredning foreslås; sats, bunnfradrag og verdsettelse mangler. |
| consumption-tax | Redusert mva på gjenbruk, reparasjoner, el-bil og og uteliv | 47 | `reparasjoner, el-bil og og uteliv –9 500` | Enkeltsatser, baselines og husholdningens kjøp mangler. |
| consumption-tax | Innfører tekstilavgift etter modell av ekspertgruppen for sirkulærøkonomi | 82 | `8 000 000 Innfører tekstilavgift etter modell av` | Avgift per vekt/antall og husholdningens kjøp oppgis ikke. |
| consumption-tax | Innføring av kontrollavgift på småpakker fra utenfor EU/EØS | 82 | `250 000 Innføring av kontrollavgift på småpakker` | Avgift per pakke og individets antall pakker oppgis ikke. |
| benefit | Klimabelønning som flat utbetaling til alle personer | 81 | `-11 100 000 Klimabelønning som flat utbetaling til alle` | Totalrammer oppgis, men ingen sats per person eller geografisk fordelingsregel. |
| benefit | Flat strømstøtte på 400 kroner per måned | 66 | `Flat strømstøtte på 400 kroner per måned` | Gjelder husholdninger i NO1, NO2 og NO5; varighet og individfordeling oppgis ikke. |
| benefit | Ny ordning med rentefrie lån for investeringer i energisparing | 60 | `150 000 Ny ordning med rentefrie lån` | Individuell låneramme, løpetid og kvalifikasjonsvilkår mangler. |
| benefit | Minstepris på 1 kr/kWh for salg av overskuddsstrøm | 66 | `100 000 Minstepris på 1 kr/kWh for salg av` | Krever husholdningens eksporterte kWh, som ikke oppgis. |
| benefit | nasjonalt månedskort til 499 kr for voksne og 249 for studenter, barn/ungdom og honnør | 77 | `et nasjonalt månedskort til 499` | Individuell effekt krever eksisterende billettkostnader og bruk. |
| benefit | Øker fribeløpet i uføretrygden til 1 G fra 1. juli 2026 | 21 | `fribeløpet i uføretrygden til 1 G fra 1. juli 2026` | G-beløp, arbeidsinntekt og avkortingsregel oppgis ikke. |
| benefit | Øke engangsstønaden til 1 G og bevare overgangsstønaden | 21 | `engangsstønaden til 1 G og bevare overgangsstønaden 736` | G-beløpet og individuell rett til ytelsene mangler. |
| benefit | Vi øker bostøtten gjennom å heve boutgiftstaket med 10 pst. | 60 | `boutgiftstaket med 10 pst. slik at støtten` | Baseline, boligkostnader, inntekt og bostøtteformel mangler. |
| benefit | Gjeninnfører en kontantstøtteperiode på 11 måneder fra 1. august 2026 | 50 | `172 523 Gjeninnfører en kontantstøtteperiode på`<br>`11 måneder fra 1. august 2026` | Kontantstøttesatsen og individuell rett oppgis ikke. |
| benefit | Stopper regjeringens utfasing av overgangsstønad | 61 | `76 000 Stopper regjeringens utfasing av` | Sats, varighet og individuell rett oppgis ikke. |
| benefit | Oppskalering av ungdomsprogrammet i NAV, herunder ungdomsprogramytelsen | 61 | `209 000 Oppskalering av ungdomsprogrammet` | Individuell ytelsessats og vilkår oppgis ikke. |
| benefit | Sikre to ukers lønnet omsorgspermisjon | 51 | `8 004 Sikre to ukers lønnet omsorgspermisjon` | Kompensasjonsgrad, inntektsgrunnlag og rettighetsvilkår mangler. |
| benefit | usosial avkorting av sosialstønad mot barnetrygdsutbetaling | 17 | `sosialstønad mot barnetrygdsutbetaling` | Forslaget avvises, men satser og individuell avkorting oppgis ikke. |
| benefit | Enslige minstepensjonister får økt pensjon | 20 | `Enslige minstepensjonister får økt pensjon` | Beløp, sats og virkningstidspunkt er NOT FOUND. |

## C. Categories reviewed with no proposal

| category | verdict (no-change / not-applicable) | where you looked (pages / table names) | note |
|---|---|---|---|
| direct-tax formulaer uten forslag | no-change | Hele filen; «Skatter og fradrag - Hovedtall» s. 47; kap. 5501 og 5700 s. 79–82 | Ingen forslag funnet for alminnelig inntekt, trinnskattens satser/innslag, minstefradrag eller fagforeningsfradrag. |
| consumption-tax formulaer uten forslag | no-change | S. 7–12; «Avgifter - Hovedtall» s. 47; kap. 5521–5561 s. 80–82 | Ingen forslag funnet for generell mva, persontransport-mva, strøm-mva, drivstoff-mva eller alkohol/tobakk-mva. |
| employer | no-change | Hele filen, inkludert skatte- og avgiftstabellene s. 47 og 79–82 | «arbeidsgiveravgift» gir ingen treff; ingen sats eller ekstra avgift foreslås. |

## D. Extraction notes

- Location of the party's main tax/duty table(s): pages 7–8; consolidated tax/duty summary page 47; detailed tax/duty entries pages 79–82.
- Ambiguities: Provenyfortegn følger ulike tabellperspektiver. Personfradrag står som 9 180 på s. 19 og -9 180 000 på s. 79. Formuestiltaket står som 8 000 på s. 19 og –8 000 på s. 9. Trygdeavgift står som -2 260 på s. 19 og 82, men 2 283 på s. 47. Flyavgiftsomleggingen står som –11 100 på s. 7, mens s. 82 viser -1 900 000 for avvikling og 13 000 000 for ny avgift. S. 47 oppgir samlet skattelettelse for personfradrag og formuebunnfradrag til –10 107, som ikke samsvarer med de separate beløpene. Barnetrygdtabellene oppgir både foreldrefradragsproveny 1 200 på s. 47 og 1 400 000 på s. 79. `2.50 kroner` er bevart verbatim; dokumentet oppgir ikke enhet. G-beløpet er ikke oppgitt.
