# Ekstraksjonsark — Rødt alternativt statsbudsjett 2026
Source: sources/text/r-alt-2026.txt
Extractor: codex · Date: 2026-09-13

> **Revised 2026-09-26 by sprint lane L10b (not-reviewed sweep, decision 2).** Section-A rows whose note carries `[L10b]` replace both extractors’ text with one adjudicated reading of the source, written identically into both sheets. Where the party states only a change, the row is `estimated` with `DERIVE` in the value column and the arithmetic against Prop. 1 LS in the note; the encoded value and its derivation are in `src/data/parties/<party>.ts`. Text in rows without an `[L10b]` note is the extractor’s original 2026-09-13 reading.

## A. Rules (one row per formula; add `trinnN` sub-rows for brackets)

| formulaId | parameter | baseline quoted by party | party absolute value | stated change (verbatim ≤15 words) | page | anchor (≤10 words) | status | proveny mill. kr (if stated) | note |
|---|---|---|---|---|---|---|---|---|---|
| income.generalRate | sats alminnelig inntekt | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Searched the full file for «alminnelig inntekt» and reviewed pp. 30–36. |
| income.bracketTax.trinn1 | innslagspunkt + sats | 226 100 / 1,7 % | sats 0 % (trinnet fjernes) | «Fjernes» | 31 | Fjernes | estimated | — | [L10b] Tabell 1: regjeringskolonnen 226 100 / 1,7 %, Rødt «Fjernes». |
| income.bracketTax.trinn2 | innslagspunkt + sats | kr 318 300 / 4,0 % | kr 404 115 / 4,0 % | NOT FOUND | 31 | `2 318 300 4,0 % 404 115 4,0 %` | confirmed | NOT FOUND | Absolute values are shown side by side; no verbal change is stated. |
| income.bracketTax.trinn3 | innslagspunkt + sats | 725 050 / 13,7 % | uendret | — | 31 | 725 050 | no-change | — | [L10b] Tabell 1: Rødt-kolonnen er lik regjeringens (725 050 / 13,7 %). |
| income.bracketTax.trinn4 | innslagspunkt + sats | kr 980 100 / 16,7 % | kr 800 000 / 21,7 % | NOT FOUND | 31 | `4 980 100 16,7 % 800 000 21,7 %` | confirmed | NOT FOUND | Absolute values are shown side by side; no row-level proveny. |
| income.bracketTax.trinn5 | innslagspunkt + sats | kr 1 467 200 / 17,7 % | kr 1 467 200 / 25,0 % | NOT FOUND | 31 | `5 1 467 200 17,7 %`<br>`1 467 200 25,0 %` | confirmed | NOT FOUND | Threshold unchanged; rate differs. |
| income.socialSecurity | trygdeavgift lønn / pensjon / nedre grense | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «trygdeavgift» found nothing. |
| income.personalAllowance | personfradrag | kr 114 210 | kr 121 810 | NOT FOUND | 31 | `Personfradrag 114 210 Personfradrag 121 810` | confirmed | NOT FOUND | Included in the combined 5 000 mill. kr item on p. 36; not allocated. |
| income.minimumDeductionWage | minstefradrag lønn: sats / øvre grense | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «minstefradrag» found nothing. |
| income.minimumDeductionPension | minstefradrag pensjon: sats / øvre grense | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «minstefradrag» found nothing. |
| income.unionFeeDeduction | fagforeningsfradrag maks | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | «fagforeninger» occurs only in a grant proposal on p. 26. |
| wealth.netWealthTax | bunnfradrag (enslig/ektefeller), sats trinn 1, trinn 2 innslag + sats | 1 900 000; 1,0 %; 21 500 000 / 1,1 % | bunnfradrag 2 200 000 (ektepar 4 400 000); sats 1 1,2 %; trinn 2 20 000 000 (ektepar 40 000 000) / 1,4 % | Tabell 3: bunnfradrag, sats 1, trinn 2 og sats 2 endres; nytt trinn 3 over 100 mill. / 1,6 % | 32 | øker vi bunnfradraget til 2,2 millioner kroner | estimated | 14 930 | [L10b] Partiets tall; regjeringskolonnen = Prop. 1 LS. Ektepar = 2 × enslig. Trinn 3 (1,6 % over 100 mill.) er unquantified i r.ts. |
| wealth.valuation | verdsettelse primærbolig (inkl. høy verdi), sekundærbolig, aksjer, bankinnskudd | primærbolig o/10 mill. 70 %; aksjer 80 %; driftsmidler 70 % | primærbolig 25 %; over 10 mill. 100 %; sekundærbolig 100 %; aksjer og næringseiendom 100 %; driftsmidler 100 % | Tabell 3: rabattene for høy boligverdi, aksjer og driftsmidler fjernes | 32 | Primærbolig o/10 millioner: 100 % | estimated | 14 930 | [L10b] Partiets tall; regjeringskolonnen = Prop. 1 LS. |
| vat.food | mva næringsmidler | — | DERIVE | «Fjerne mva på norskproduserte fersk frukt og grønnsaker» | 36 | Fjerne mva på norskproduserte fersk frukt og grønnsaker | unquantified | -2 379 | [L10b] Modellen har én matsats. Unquantified i r.ts. |
| vat.general | mva alminnelig sats | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Reviewed VAT items on pp. 33 and 36; no general household rate proposal. |
| vat.transportServices | mva persontransport | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file VAT searches and p. 36 reviewed. |
| vat.electricity | mva strøm | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file searches for «mva» and «strøm» reviewed. |
| vat.fuel | mva drivstoff | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file searches for «mva», «bensin» and «diesel» reviewed. |
| vat.alcoholTobacco | mva alkohol/tobakk | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file searches for alcohol and tobacco terms reviewed. |
| vat.flights | mva flyreiser | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | The p. 36 flight proposal is an unspecified progressive flight duty, not a VAT rate. |
| excise.petrolLitre | veibruksavgift + CO2-avgift bensin | — | DERIVE | «Økt CO2-avgift (32 % økning utover prisstigning fra 2025-nivå)» | 36 | Økt CO2-avgift (32 % økning utover prisstigning fra 2025-nivå) | unquantified | 2 395 | [L10b] Ingen veibruksendring. CO2-økningen er målt mot prisjustert 2025-nivå uten oppgitt faktor. Unquantified i r.ts. |
| excise.dieselLitre | veibruksavgift + CO2-avgift diesel | — | DERIVE | «Økt CO2-avgift (32 % økning utover prisstigning fra 2025-nivå)» | 36 | Økt CO2-avgift (32 % økning utover prisstigning fra 2025-nivå) | unquantified | 2 395 | [L10b] Som bensin. |
| excise.kwh | elavgift (alminnelig sats, evt. redusert jan–mar) | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «elavgift» found nothing. |
| excise.flightEurope | flypassasjeravgift Europa | NOT FOUND | DERIVE | Innføre progressiv flyavgift for reiser mellom de største byene | 36 | `største byene, samt 1 170 1 050`<br>`utenlandsreiser utover en årlig feriereise (fra 1. mars 2026)` | unquantified | 1 050 (overall proposal) | No Europe rate; proposal is structured by routes/travel frequency. |
| excise.flightOther | flypassasjeravgift utenfor Europa | NOT FOUND | DERIVE | Innføre progressiv flyavgift for reiser mellom de største byene | 36 | `største byene, samt 1 170 1 050`<br>`utenlandsreiser utover en årlig feriereise (fra 1. mars 2026)` | unquantified | 1 050 (overall proposal) | No outside-Europe rate; the same overall proveny cannot be allocated. |
| excise.beerLitre | alkoholavgift øl | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «alkoholavgift» and «øl» found nothing usable. |
| excise.wineLitre | alkoholavgift vin | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «alkoholavgift» and «vin» found nothing usable. |
| excise.spiritsLitre | alkoholavgift brennevin | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «alkoholavgift» and «brennevin» found nothing usable. |
| excise.cigarette | tobakksavgift sigaretter | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «tobakksavgift» and «sigaretter» found nothing. |
| excise.snusGram | tobakksavgift snus | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «snus» found nothing. |
| benefit.childBenefit | barnetrygd under 6 / fra 6 / utvidet (enslig) | — | DERIVE | «Øke barnetrygden i tråd med prisutviklingen»; «Øke utvidet barnetrygd for enslige med 500 kroner i måneden utover prisjustering» | 38 | Øke barnetrygden i tråd med prisutviklingen | estimated | 609; 717 | [L10b] Utledet: 1 968 → 2 012 (eksempel s. 11: +88 kr for to barn); utvidet 2 516 → 2 572 + 500 = 3 072. Virkning 1. februar (s. 7), helårssats. |
| benefit.studentSupport | studiestøtte (basisstøtte, stipendandel) | — | DERIVE | «Øke studielån og stipend med 15 000 kroner i året fra og med studiestart høsten 2026» | 18; 12 | Øke studielån og stipend med 15 000 kroner i året | estimated | 455 | [L10b] Utledet: 15 488 (Prop. 1 LS-grunnlaget 2026–2027) + 1 250 (partiets månedsbeløp s. 12) = 16 738 kr/mnd. Virkning 1. august, helårssats. |
| employer.contribution | arbeidsgiveravgift sats / ekstra avgift | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Full-file search for «arbeidsgiveravgift» found nothing. |

## B. Proposals that touch household cash but cannot enter the formulas (unquantified)

| category (direct-tax / wealth-tax / consumption-tax / benefit / employer) | title (party's wording) | page | anchor | why it cannot be quantified for an individual |
|---|---|---|---|---|
| direct-tax | øker frikortgrensa til 150 000 kroner | 31 | `Frikortgrense 100 000 kr Frikortgrense 150 000 kr` | No frikort formula or necessary withholding inputs. |
| direct-tax | begrenser skattefradrag på renter til de første 8 millioner kronene av lån | 30 | `første 8 millioner kronene av lån (60 G)`<br>`opptil 16 millioner kroner` | Loan interest and individual/couple allocation inputs are absent. |
| direct-tax | Øke utbytteskatten | 31 | `Utbytteskatt 38 % Utbytteskatt 44 %` | Dividend income is not an input formula. |
| direct-tax | fjerne skjermingsfradraget og innføre et bunnfradrag på 10 000 kroner for aksjegevinster | 30; 36 | `drag på 10 000 kroner for slike inntekter`<br>`bunnfradrag på 10 000 kro- 1 600` | Requires gains, shielding and realization data. |
| direct-tax | Fjerne 24-månedersgrensa for pendlere | 36 | `Fjerne 24-månedersgrensa for pendlere -400 -100` | No commuter eligibility or expense inputs. |
| direct-tax | Avlyse forsøksordning med arbeidsfradrag for unge | 36 | `arbeidsfradrag for unge 500 500` | Individual rules for the proposed government pilot are not quoted. |
| direct-tax | innføre en egen klimaskatt på de med høye millioninntekter | 33 | `klimaskatt på de med høye millioninntekter` | No rate, threshold or calculation rule is stated. |
| benefit | Rødts klimarabatt | 33 | `Inntekt 0-250' 2 400 3 000`<br>`Inntekt 250-500' 1 800 2 400` | Depends on income and centrality zone; child supplement amount is absent. |
| consumption-tax | Fjerne mva på reparasjoner av klær, sko, husholdnings- og fritidsvarer og elektronikk | 36 | `fritidsvarer -600 -300` | Household repair spending by covered item is unknown. |
| consumption-tax | Omsetningsavgift på private helseforsikringer | 36 | `helseforsikringer (25 % fra 1.7.26) 665 550` | Requires household insurance premiums and effective-date allocation. |
| consumption-tax | Økt CO2-avgift | 36 | `CO2-avgift (32 % økning utover prisstigning fra 2025-nivå)`<br>`2025-nivå) 2 395 2 195` | No taxable products, unit rates or household quantities are stated. |
| benefit | Holde barnetrygden utenfor ved beregningen av sosialhjelp | 24 | `barnetrygden utenfor ved beregningen av sosialhjelp 650` | Requires household social-assistance assessment. |
| benefit | Reversere kutt i engangsstønaden | 38 | `Reversere kutt i engangsstønaden 134` | No individual baseline or change amount is quoted. |
| benefit | Reversere kuttet i overgangsstønad til enslige forsørgere | 43 | `overgangsstønad til enslige forsørgere 76` | No individual baseline or change amount is quoted. |
| benefit | Øke minstesatsene for pensjon, uføretrygd og AAP med 15 000 kroner | 15 | `uføretrygd og AAP med 15 000 kroner 3 624` | Calculator lacks benefit type and eligibility inputs. |
| benefit | Øke fribeløpet for uføre til 1 G fra 1. januar 2026 | 43 | `fribeløpet for uføre til 1 G fra 1. januar 2026` | The document does not state a kroner value for 1 G. |
| benefit | Reversere kuttet for unge mottakere av arbeidsavklaringspenger (AAP) | 43 | `arbeidsavklaringspenger (AAP) fra 1. mai 190` | No individual rate or affected cohort rule is quoted. |
| benefit | Prisjustere tilskudd som grunnstønad, hjelpestønad, tilskudd til ortopediske hjelpemidler | 43 | `grunnstønad, hjelpestønad, tilskudd til ortopediske 140` | Adjustment percentage and individual baselines are absent. |
| benefit | Fryse levealdersjusteringen for pensjonister i 2026 | 43 | `pensjonister i 2026 508` | Individual pension basis and adjustment factor are absent. |
| benefit | Øke inntektsgrensene i bostøtten med 10 prosent | 42 | `bostøtten med 10 prosent 290` | Housing-cost, household and current-threshold inputs are absent. |
| benefit | Gjeninnføre ordningen med kutt i studiegjeld for personer i distriktet | 49 | `personer i distriktet 794` | Individual debt reduction and eligibility rules are not quoted. |
| benefit | Øke stipendandelen for elever på folkehøgskoler til 40 prosent | 49 | `folkehøgskoler til 40 prosent 97` | Applies to a separate student group; support base is absent. |
| benefit | Øke utstyrsstipendet for elever på VGS med 10 prosent | 49 | `VGS med 10 prosent fra skoleåret 2026-2027 52` | Individual baseline and programme eligibility are absent. |
| benefit | Øke borteboerstipendet med 1 000 kroner i måneden | 49 | `borteboerstipendet med 1 000 kroner i måneden fra skoleåret` | Eligibility and months received are absent. |
| benefit | omgjøring av kontantstøtte til ventestøtte | 51 | `barnehageplasser som følge av omgjøring av 0,6` | No household rate, eligibility rule or effective date is stated. |

## C. Categories reviewed with no proposal

| category | verdict (no-change / not-applicable) | where you looked (pages / table names) | note |
|---|---|---|---|
| general income-tax rate | no-change | pp. 30–33; Table 1; full-file «alminnelig inntekt» search | No household general-rate proposal found. |
| social-security contribution | no-change | pp. 30–36; full-file «trygdeavgift» search | No wage, pension or lower-bound value found. |
| minimum deductions | no-change | pp. 30–36; full-file «minstefradrag» search | No wage or pension proposal found. |
| union-fee deduction | no-change | pp. 26, 30–36; full-file «fagforening» search | P. 26 concerns organizational support, not the deduction. |
| general and reduced VAT rates other than specified produce/repairs | no-change | pp. 33, 36; VAT lines in main table | No rates for general VAT, transport, electricity, fuel, alcohol/tobacco or flights. |
| electricity duty | no-change | p. 36; full-file «elavgift» search | No proposal found. |
| road-use duty and fuel-specific CO2 rates | no-change | p. 36; searches for «veibruksavgift», «bensin», «diesel» | Overall CO2-duty increase is not assigned to fuels in the document. |
| alcohol and tobacco duties | no-change | p. 36; searches for «alkoholavgift», «tobakksavgift», «snus» | No per-unit proposal found. |
| employer contribution | no-change | pp. 30–36; full-file «arbeidsgiveravgift» search | No rate or extra contribution proposal found. |

## D. Extraction notes
- Location of the party's main tax/duty table(s): pages 30 and 36; detailed income- and wealth-tax values are on pages 31–32.
- Ambiguities: Table 1 states baselines and Rødt absolute values but generally not verbal numerical changes. The 32 % CO2-duty increase is not assigned to petrol, diesel or per-unit rates. The progressive flight duty has no Europe/outside-Europe rates. The produce VAT proposal covers only Norwegian-produced fresh fruit and vegetables. Child-benefit price adjustment, student-support baselines and several benefit reversals lack absolute individual values; these are marked `DERIVE` or placed in section B.
