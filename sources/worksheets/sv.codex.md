# Ekstraksjonsark — Sosialistisk Venstreparti alternativt statsbudsjett 2026
Source: sources/text/sv-alt-2026.txt
Extractor: codex · Date: 2026-09-13

> **Revised 2026-09-26 by sprint lane L10b (not-reviewed sweep, decision 2).** Section-A rows whose note carries `[L10b]` replace both extractors’ text with one adjudicated reading of the source, written identically into both sheets. Where the party states only a change, the row is `estimated` with `DERIVE` in the value column and the arithmetic against Prop. 1 LS in the note; the encoded value and its derivation are in `src/data/parties/<party>.ts`. Text in rows without an `[L10b]` note is the extractor’s original 2026-09-13 reading.

## A. Rules (one row per formula; add `trinnN` sub-rows for brackets)

| formulaId | parameter | baseline quoted by party | party absolute value | stated change (verbatim ≤15 words) | page | anchor (≤10 words) | status | proveny mill. kr (if stated) | note |
|---|---|---|---|---|---|---|---|---|---|
| income.generalRate | sats alminnelig inntekt | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Main tax table and whole-file term search reviewed. |
| income.bracketTax.trinn1 | innslagspunkt + sats | NOT FOUND | DERIVE | Trinnskatt, trinn 1: Uendret | 37 | Trinnskatt, trinn 1: Uendret | no-change | NOT FOUND | Neither threshold nor baseline rate is quoted. |
| income.bracketTax.trinn2 | innslagspunkt + sats | NOT FOUND | DERIVE | Trinnskatt, trinn 2: Uendret | 37 | Trinnskatt, trinn 2: Uendret | no-change | NOT FOUND | Neither threshold nor baseline rate is quoted. |
| income.bracketTax.trinn3 | innslagspunkt + sats | NOT FOUND | innslagspunkt NOT FOUND; sats 16,2 prosent | Trinnskatt, trinn 3: Satsen settes til 16,2 prosent | 37 | Trinnskatt, trinn 3: Satsen settes til 16,2 prosent<br>6 150* 6 150* | confirmed | 6 150* påløpt / 6 150* bokført | Threshold is not stated. |
| income.bracketTax.trinn4 | innslagspunkt + sats | NOT FOUND | innslagspunkt NOT FOUND; sats 19,2 prosent | Trinnskatt, trinn 4: Satsen settes til 19,2 prosent | 37 | Trinnskatt, trinn 4: Satsen settes til 19,2 prosent<br>5 890* 5 890* | confirmed | 5 890* påløpt / 5 890* bokført | Threshold is not stated. |
| income.bracketTax.trinn5 | innslagspunkt + sats | NOT FOUND | innslagspunkt NOT FOUND; sats 27 prosent | Trinnskatt, trinn 5: Satsen settes til 27 prosent | 37 | Trinnskatt, trinn 5: Satsen settes til 27 prosent<br>10 380* 10 380* | confirmed | 10 380* påløpt / 10 380* bokført | Threshold is not stated. |
| income.socialSecurity | trygdeavgift lønn / pensjon / nedre grense | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file search for `trygdeavgift`; no occurrence. |
| income.personalAllowance | personfradrag | NOT FOUND | 143 000 kr | Øke personfradraget til 143 000 kr | 37 | Øke personfradraget til 143 000 kr<br>-24 000* -19 200* | confirmed | -24 000* påløpt / -19 200* bokført | |
| income.minimumDeductionWage | minstefradrag lønn: sats / øvre grense | NOT FOUND | sats 55 prosent; øvre grense NOT FOUND | Øke minstefradraget i lønnsinntekt til 55 prosent | 37 | Øke minstefradraget i lønnsinntekt til 55 prosent<br>-71* -56,8* | confirmed | -71* påløpt / -56,8* bokført | |
| income.minimumDeductionPension | minstefradrag pensjon: sats / øvre grense | NOT FOUND | sats 55 %; øvre grense NOT FOUND | Øke minstefradraget i pensjon til 55 % | 37 | Øke minstefradraget i pensjon til 55 % -18 -18 | confirmed | -18 påløpt / -18 bokført | |
| income.unionFeeDeduction | fagforeningsfradrag maks | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file search for `fagforening`; no occurrence. |
| wealth.netWealthTax | bunnfradrag (enslig/ektefeller) | — | bunnfradrag 2 000 000 (ektepar 4 000 000); trinn 1 1,1 %; trinn 2 20 000 000 (ektepar 40 000 000) / 1,4 % | «Øke bunnfradraget til 2 millioner»; «Øke satsen i trinn 1 til 1,1 prosent»; «Sette innslagspunktet i trinn 2 til 20 millioner, og øke satsen til 1,4 prosent» | 37 | Øke satsen i trinn 1 til 1,1 prosent | estimated | -690; 2 190; 3 600 | [L10b] Partiets tall; ektepar = 2 × enslig som i Prop. 1 LS. Trinn 3 se egen rad. |
| wealth.netWealthTax.trinn1 | sats trinn 1 | — | 1,1 % | «Øke satsen i trinn 1 til 1,1 prosent» | 37 | Øke satsen i trinn 1 til 1,1 prosent | estimated | 2 190 | [L10b] Del av wealth.netWealthTax. |
| wealth.netWealthTax.trinn2 | innslagspunkt + sats trinn 2 | — | 20 000 000 / 1,4 % | «Sette innslagspunktet i trinn 2 til 20 millioner, og øke satsen til 1,4 prosent» | 37 | Sette innslagspunktet i trinn 2 til 20 millioner | estimated | 3 600 | [L10b] Del av wealth.netWealthTax. |
| wealth.netWealthTax.trinn3 | nytt trinn 3 | — | DERIVE | «Innføre et tredje trinn i formuesskatten på 1,7 prosent over 100 mill kr» | 37 | Innføre et tredje trinn i formuesskatten på 1,7 prosent | unquantified | 3 091 | [L10b] Modellen har to trinn; trinn 3 er unquantified i sv.ts. |
| wealth.valuation | verdsettelse primærbolig (inkl. høy verdi), sekundærbolig, aksjer, bankinnskudd | — | DERIVE | «Fjerne aksjerabatten (inkludert næringseiendom)»; «Fjerne rabatten for driftsmidler»; «Fjerne verdsettelsesrabatten for primærbolig med høy verdi» | 37 | Fjerne aksjerabatten (inkludert næringseiendom) | estimated | 5 460; 115; 780 | [L10b] Utledet: rabatt fjernet ⇒ 100 % for aksjer (Prop. 1 LS 80), driftsmidler (70) og primærbolig over 10 mill. (70). Sekundærbolig og bank uendret. |
| vat.food | mva næringsmidler | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file searches for `næringsmidler`, `matmoms`, `mva`, `moms`. |
| vat.general | mva alminnelig sats | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Targeted exemptions appear, but no general-rate proposal. |
| vat.transportServices | mva persontransport | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Main duty table and whole-file searches reviewed. |
| vat.electricity | mva strøm | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file searches for `mva`, `moms`, `strøm`. |
| vat.fuel | mva drivstoff | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Fuel excise changes appear, but no fuel-VAT proposal. |
| vat.alcoholTobacco | mva alkohol/tobakk | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file term searches reviewed. |
| vat.flights | mva flyreiser | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Passenger excise changes appear, but no flight-VAT proposal. |
| excise.petrolLitre | veibruksavgift + CO2-avgift bensin | — | veibruksavgift 4,50 kr/l; CO2-avgift som Prop. 1 LS (3,80) ⇒ 8,30 kr/l | «Øke veibruksavgiften på bensin med 0,25 til 4,50 kr/L» | 37 | Øke veibruksavgiften på bensin med 0,25 til 4,50 kr/L | estimated | 130 | [L10b] Veibruk er partiets tall. «Øke opptrappingen av CO2-avgiften» har ingen sats og står som unquantified i sv.ts. |
| excise.dieselLitre | veibruksavgift + CO2-avgift diesel | — | veibruksavgift 3,25 kr/l; CO2-avgift som Prop. 1 LS (4,42) ⇒ 7,67 kr/l | «Øke veibruksavgiften på diesel (mineralolje) med 0,25 til 3,25 kr/L» | 37 | Øke veibruksavgiften på diesel (mineralolje) med 0,25 til 3,25 kr/L | estimated | 430 | [L10b] Veibruk er partiets tall. CO2-økningen står som unquantified i sv.ts. |
| excise.kwh | elavgift (alminnelig sats, evt. redusert jan–mar) | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file search for `elavgift`; no occurrence. |
| excise.flightEurope | flypassasjeravgift Europa | — | DERIVE | «Øke flypassasjeravgiften i Europa med 20%» | 37 | Øke flypassasjeravgiften i Europa med 20% | estimated | 270 | [L10b] Utledet: Prop. 1 LS 61 kr × 1,2 = 73,20 kr. |
| excise.flightOther | flypassasjeravgift utenfor Europa | — | DERIVE | «Øke flypassasjeravgiften utenfor Europa med 20 %» | 37 | Øke flypassasjeravgiften utenfor Europa med 20 % | estimated | 100 | [L10b] Utledet: Prop. 1 LS 350 kr × 1,2 = 420 kr. |
| excise.beerLitre | alkoholavgift øl | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file searches for `alkoholavgift`, `øl`. |
| excise.wineLitre | alkoholavgift vin | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file searches for `alkoholavgift`, `vin`. |
| excise.spiritsLitre | alkoholavgift brennevin | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file searches for `alkoholavgift`, `brennevin`. |
| excise.cigarette | tobakksavgift sigaretter | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file searches for `tobakksavgift`, `sigaretter`. |
| excise.snusGram | tobakksavgift snus | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file searches for `tobakksavgift`, `snus`. |
| benefit.childBenefit | barnetrygd under 6 / fra 6 / utvidet (enslig) | — | DERIVE | «Øke barnetrygden med 100 kr i måneden fra 1. mai»; «Prisjustere barnetrygden fra 1. mai» | 25; 10 | Øke barnetrygden med 100 kr i måneden fra 1. mai | estimated | 872; 443 | [L10b] Utledet: 1 968 + 44 (prisjustering) + 100 = 2 112 kr/mnd; utvidet prisjustert 2 516 → 2 572. Prisjusteringen = Høyres/Rødts 609 mill. × 8/11 = 443. Virkning 1. mai, helårssats. s. 10 har en ufylt «XXX» i teksten. |
| benefit.studentSupport | studiestøtte (basisstøtte, stipendandel) | 15 169 (2025–2026; 16 686 − 1 517) | basislån 16 686 kr/mnd i studieåret 2026–2027 | «øker studiestøtten med ti prosent neste studieår» | 12 | som student i snitt få utbetalt 16.686 | estimated | 296 / 1 020 | [L10b] Absolutt beløp brukt. Partiet måler mot 2025–2026-satsen, ikke Prop. 1 LS (15 488). Tabellen s. 34 har to ulike beløp. Folkehøgskole-stipendandel 40 % er unquantified i sv.ts. |
| employer.contribution | arbeidsgiveravgift sats / ekstra avgift | NOT FOUND | NOT FOUND | NOT FOUND | | | NOT FOUND | NOT FOUND | Whole-file search for `arbeidsgiveravgift`; no occurrence. |

## B. Proposals that touch household cash but cannot enter the formulas (unquantified)

| category (direct-tax / wealth-tax / consumption-tax / benefit / employer) | title (party's wording) | page | anchor | why it cannot be quantified for an individual |
|---|---|---|---|---|
| wealth-tax | innføre en progressiv arveskatt med høyt bunnfradrag | 6 | beregne i vårt skatteopplegg for 2026 | Rate, threshold and timing are not specified. |
| benefit | Øke fribeløpet for uføre fra 0,4G til 1G fra 1. juli | 7 | fribeløpet for uføre fra 0,4G til 1G | Requires benefit and earnings details. |
| benefit | Øke minstepensjonen for enslige og høy sats i garantipensjonen med 12 000 kroner | 7 | garantipensjonen med 12 000 kroner fra 1. | Requires pension category and payment-period details. |
| benefit | Beholde overgangstønaden | 7 | Beholde overgangstønaden 93 | Individual baseline and eligibility are not stated. |
| benefit | Beholde engangsstønaden på dagens nivå | 10 | Beholde engangsstønaden på dagens nivå 134 | Current individual amount is not stated. |
| direct-tax | Innføre skattefritak på slitertilegget for AFP-mottakere i privat sektor | 37 | AFP-mottakere i privat sektor -33 -33 | Individual supplement and tax position are unknown. |
| direct-tax | Utbytteskatten økes | 37 | oppjusteringsfaktoren settes til 1,86 | Requires taxable dividend amount. |
| direct-tax | Øke frikortgrensen til 150 000 kr | 37 | frikortgrensen til 150 000 kr -1 190* -950* | No frikort formula exists in section A. |
| wealth-tax | Gjeninnføre skatt på fordelen av å eie egen bolig | 37 | Bunnfradrag på 10 mill kr<br>sats på 1,7 prosent<br>1 000* 250* | Requires assessed housing benefit and valuation method. |
| direct-tax | Fjerne påslaget i skjermingsfradraget | 37 | Fjerne påslaget i skjermingsfradraget 340 0 | Individual share basis and shielding are unknown. |
| direct-tax | Ikke innføre forsøksordning med arbeidsfradrag ("skattelotteriet") | 37 | arbeidsfradrag ("skattelotteriet") 500 500 | Proposed government eligibility and amount are not quoted. |
| consumption-tax | Øke satsen i laveste intervall (0-100 gram) i CO2-avgiften for engangsavgiften for personbil til 1100 | 37 | laveste intervall (0-100 gram)<br>personbil til 1100 | Unit and vehicle emissions are needed. |
| consumption-tax | Gi elbiler samme trafikkforsikringsavgift som fossile biler | 37 | elbiler samme trafikkforsikringsavgift som fossile biler -350 -170 | Per-vehicle baseline is not quoted. |
| consumption-tax | innføre 50 % rabatt på omregistreringsavgift for elbiler | 37 | innføre 50 % rabatt på<br>-300 -300 | Requires baseline duty and a qualifying transaction. |
| consumption-tax | Innføre momsfritak på reparasjon av klær, sko, husholdningsvarer, fritidsvarer og elektronikk | 37 | -600 -300 | Requires qualifying household repair expenditure. |
| consumption-tax | Fjerne dokumentavgiften for førstegangskjøpere | 37 | Fjerne dokumentavgiften for førstegangskjøpere -2 300 -2070 | Requires purchase price and first-time-buyer status. |
| consumption-tax | Redusere dokumentavgiften fra 2,5 til 2 pst for alle andre | 37 | dokumentavgiften fra 2,5 til 2 pst<br>-3100 -2790 | Requires dutiable purchase price. |
| consumption-tax | Innføre en omsetningsavgift på private helseforsikringer på 25 prosent fra 1. juli | 37 | private helseforsikringer på 25 prosent fra 1.<br>450 405 | Requires insurance premium and purchase timing. |
| consumption-tax | Utsette tidspunktet for økt elbilmoms til 1. mars | 37 | økt elbilmoms til 1. mars -670 -670 | New VAT threshold/rate and vehicle purchase details are absent. |

## C. Categories reviewed with no proposal

| category | verdict (no-change / not-applicable) | where you looked (pages / table names) | note |
|---|---|---|---|
| General-income rate, trygdeavgift, fagforeningsfradrag | no-change | Page 37, “Skatter”; whole-file term searches | No usable proposal found. |
| Food/general/transport/electricity/fuel/alcohol-tobacco/flight VAT rates | no-change | Pages 37–38, “Avgifter”; whole-file VAT searches | Only targeted repair and EV proposals were found. |
| Elavgift, alcohol and tobacco excises | no-change | Pages 37–38, “Avgifter”; whole-file excise searches | No usable proposal found. |
| Secondary-home and bank-deposit valuation | no-change | Page 37, “Formuesskatt”; whole-file valuation searches | Stock and high-value primary-home discounts are addressed. |
| Kontantstøtte | no-change | Whole file | No occurrence found. |
| Arbeidsgiveravgift | no-change | Whole file | No occurrence found. |

## D. Extraction notes
- Location of the party's main tax/duty table(s): pages 25, 37, 38.
- Ambiguities: Page 37 interleaves two parallel table columns. Most government baselines are absent. Fuel-specific CO2 rates, income-bracket thresholds, wealth-valuation percentages and absolute child-benefit rates cannot be derived. Student support combines an average basis-loan amount with a folkehøgskole-specific stipend share. Starred proveny figures are isolated estimates under the page 37 SSB-model footnote.
