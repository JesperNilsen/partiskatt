# Ekstraksjonsark — Fremskrittspartiet alternativt statsbudsjett 2026
Source: sources/text/frp-alt-2026.txt
Extractor: codex · Date: 2026-09-13

> **Revised 2026-09-26 by sprint lane L10b (not-reviewed sweep, decision 2).** Section-A rows whose note carries `[L10b]` replace both extractors’ text with one adjudicated reading of the source, written identically into both sheets. Where the party states only a change, the row is `estimated` with `DERIVE` in the value column and the arithmetic against Prop. 1 LS in the note; the encoded value and its derivation are in `src/data/parties/<party>.ts`. Text in rows without an `[L10b]` note is the extractor’s original 2026-09-13 reading.

## A. Rules (one row per formula; add `trinnN` sub-rows for brackets)

| formulaId | parameter | baseline quoted by party | party absolute value | stated change (verbatim ≤15 words) | page | anchor (≤10 words) | status | proveny mill. kr (if stated) | note |
|---|---|---|---|---|---|---|---|---|---|
| income.generalRate | sats alminnelig inntekt | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «alminnelig inntekt» og skattetabellen s. 46. |
| income.bracketTax.trinn1 | innslagspunkt + sats | — | sats 0 % (trinnet fjernes) | «Fjerne trinnskatt trinn 1» | 46 | Fjerne trinnskatt trinn 1 | estimated | 5 900 | [L10b] Trinn 1 fjernes = sats 0 %; innslagspunkt uten betydning. |
| income.bracketTax.trinn2 | innslagspunkt + sats | — | DERIVE | «Redusere trinnskatten i 2. trinn med 0,5 prosentpoeng.» | 46 | Redusere trinnskatten i 2. trinn med 0,5 prosentpoeng. | estimated | 5 030 | [L10b] Utledet mot Prop. 1 LS tabell 1.7 s. 33: 4,0 − 0,5 = 3,5 %; innslagspunkt 318 300 uendret. |
| income.bracketTax.trinn3 | innslagspunkt + sats | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «trinnskatt» og «innslagspunkt»; bare trinn 1–2 foreslås endret. |
| income.bracketTax.trinn4 | innslagspunkt + sats | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «trinnskatt» og «innslagspunkt»; bare trinn 1–2 foreslås endret. |
| income.bracketTax.trinn5 | innslagspunkt + sats | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «trinnskatt» og «innslagspunkt»; bare trinn 1–2 foreslås endret. |
| income.socialSecurity | trygdeavgift lønn / pensjon / nedre grense | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «trygdeavgift»; ingen treff. |
| income.personalAllowance | personfradrag | NOT FOUND | 127 850 kr | Øke personfradraget til 127 850 kr | 46 | «127 850 kr 11 590 000 000» | confirmed | 11 590 | — |
| income.minimumDeductionWage | minstefradrag lønn: sats / øvre grense | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «minstefradrag»; ingen treff. |
| income.minimumDeductionPension | minstefradrag pensjon: sats / øvre grense | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «minstefradrag»; ingen treff. |
| income.unionFeeDeduction | fagforeningsfradrag maks | — | DERIVE | «Fjerne fagforeningsfradraget» | 46 | Fjerne fagforeningsfradraget | estimated | -1 535 | [L10b] Utledet: Prop. 1 LS maks 8 700 kr (tabell 1.7 s. 36) → 0 kr. |
| wealth.netWealthTax | bunnfradrag (enslig/ektefeller), sats trinn 1, trinn 2 innslag + sats | fra 1,9 til 3 millioner kroner | bunnfradrag enslig 3 000 000, ektepar 6 000 000; sats 0,8 % (også over trinn 2-grensen) | «senke satsen til 0,8 prosent og heve innslagspunktet fra 1,9 til 3 millioner kroner (6 millioner for ektepar)» | 13; 46 | 6 millioner for ektepar | estimated | 12 590 | [L10b] Partiet nevner én sats og ikke trinn 2; 0,8 % brukt på all formue over bunnfradraget (samlet stat + kommune). Utgangspunktet 1,9 mill. = Prop. 1 LS. |
| wealth.valuation | verdsettelse primærbolig (inkl. høy verdi), sekundærbolig, aksjer, bankinnskudd | 100 prosent av markedsverdi (sekundærbolig); øvrig NOT FOUND | 80 % (sekundærbolig); øvrig DERIVE/NOT FOUND | Sekundærbolig, verdsettelse 80 %; Reversere skjerpelse i boligbeskatning (ny modell) | 11; 46 | «sekundærboliger til 100 prosent av»; «Sekundærbolig, verdsettelse 80 % 850 000 000»; «boligbeskatning (ny modell) 435 000 000» | confirmed | 850; 435 | Ny boligmodell beskrives uten satser; aksjer og bankinnskudd ikke funnet. |
| vat.food | mva næringsmidler | — | DERIVE | «Merverdiavgift mat, halveres 1. april» | 46 | Merverdiavgift mat, halveres 1. april | estimated | 8 000 | [L10b] Utledet: Prop. 1 LS/mva-vedtaket 15 % ÷ 2 = 7,5 %; virkning 1. april, vist som helårssats (beslutning 1). |
| vat.general | mva alminnelig sats | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «merverdiavgift» og «mva»; ingen generell satsendring funnet. |
| vat.transportServices | mva persontransport | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt mva-/avgiftstabeller; ingen forslag funnet. |
| vat.electricity | mva strøm | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Bare strømstøtte/makspris funnet, ingen mva-sats. |
| vat.fuel | mva drivstoff | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Bare særavgifter og pumpepriseffekt funnet. |
| vat.alcoholTobacco | mva alkohol/tobakk | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «alkoholavgift», «tobakksavgift» og «snus»; ingen sats funnet. |
| vat.flights | mva flyreiser | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt mva-/luftfartsomtale; ingen sats funnet. |
| excise.petrolLitre | veibruksavgift + CO2-avgift bensin | — | DERIVE | «Veibruksavgift på drivstoff, avgiften halveres»; «Reversere økning CO2-avg mineralske prod» | 46 | Veibruksavgift på drivstoff, avgiften halveres | estimated | 1 050; 1 488 | [L10b] Utledet mot Prop. 1 LS tabell 1.8 s. 40–41: veibruk 4,25 ÷ 2 + CO2 2025-sats 3,25 = 5,375 kr/l. Kontroll s. 10: «om lag 3 kroner» inkl. mva; (8,05 − 5,375) × 1,25 = 3,34. |
| excise.dieselLitre | veibruksavgift + CO2-avgift diesel | — | DERIVE | «Veibruksavgift på drivstoff, avgiften halveres»; «Reversere økning CO2-avg mineralske prod» | 46 | Veibruksavgift på drivstoff, avgiften halveres | estimated | 2 400; 1 488 | [L10b] Utledet mot Prop. 1 LS tabell 1.8 s. 40–41: veibruk 3,00 ÷ 2 + CO2 2025-sats 3,79 = 5,29 kr/l. Kontroll s. 10: «om lag 2,50» inkl. mva; (7,42 − 5,29) × 1,25 = 2,66. |
| excise.kwh | elavgift (alminnelig sats, evt. redusert jan–mar) | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «elavgift»; ingen treff. |
| excise.flightEurope | flypassasjeravgift Europa | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «flypassasjeravgift»; ingen treff. |
| excise.flightOther | flypassasjeravgift utenfor Europa | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «flypassasjeravgift»; ingen treff. |
| excise.beerLitre | alkoholavgift øl | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «alkoholavgift»; ingen treff. |
| excise.wineLitre | alkoholavgift vin | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «alkoholavgift»; ingen treff. |
| excise.spiritsLitre | alkoholavgift brennevin | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «alkoholavgift»; ingen treff. |
| excise.cigarette | tobakksavgift sigaretter | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «tobakksavgift»; bare taxfree-kvote funnet. |
| excise.snusGram | tobakksavgift snus | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «snus» og «tobakksavgift»; ingen sats funnet. |
| benefit.childBenefit | barnetrygd under 6 / fra 6 / utvidet (enslig) | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «barnetrygd»; ingen treff. |
| benefit.studentSupport | studiestøtte (basisstøtte, stipendandel) | — | DERIVE | «knytte studiestøtten til 1,5 G over fire år» | 23 | studiestøtten til 1,5 G over fire år | unquantified | — | [L10b] Første steg i 2026 er ikke oppgitt; G er ikke trykket. Unquantified i frp.ts. |
| employer.contribution | arbeidsgiveravgift sats / ekstra avgift | NOT FOUND | NOT FOUND | NOT FOUND | — | — | NOT FOUND | NOT FOUND | Søkt «arbeidsgiveravgift»; ingen treff. |

## B. Proposals that touch household cash but cannot enter the formulas (unquantified)

| category (direct-tax / wealth-tax / consumption-tax / benefit / employer) | title (party's wording) | page | anchor | why it cannot be quantified for an individual |
|---|---|---|---|---|
| direct-tax | Frikortgrense 150 000 kr | 46 | «Frikortgrense 150 000 kr» | Dokumentet gir ikke nødvendig individuell skatteberegning. |
| direct-tax | Reversere kutt i foreldrefradraget | 12 | «foreldrefradraget fra 25 000 til 15 000»; «fra 15 000 til 10 000» | Faktiske, kvalifiserende utgifter og øvrige vilkår mangler. |
| direct-tax | Fjerne forsøksordning med arbeidsfradraget for unge | 46 | «arbeidsfradraget for unge -500 000 000» | Ordningens individuelle satser og vilkår oppgis ikke. |
| direct-tax | Skattefradrag for gaver/donasjoner til godkjente organisasjoner | 46 | «gaver/donasjoner til godkjente organisasjoner 120 000 000» | Fradragssats, maksimum og individets gaver oppgis ikke. |
| consumption-tax | fradrag i dokumentavgiften for førstegangskjøpere under 35 år | 38 | «førstegangskjøpere under 35 år.» | Dokumentet ber om senere forslag til innretning og nivå. |
| consumption-tax | Fjerne gammel vektkomponent | 46 | «Fjerne gammel vektkomponent 500 000 000» | Kjøretøyets vekt og avgiftsberegning mangler. |
| consumption-tax | Tak i engangsavgiften (Personbil 200 000 kr, Vare/Bobil 150 000 kr) samt 10 årsregel | 46 | «Vare/Bobil 150 000 kr) samt 10 årsregel» | Krever kjøretøydata, beregnet avgift og bruksfradrag. |
| consumption-tax | forskyve reduksjonen av innslagspunktet for mva. på elbilkjøp til 300 000 kroner | 38 | «mva. på elbilkjøp til 300»; «fra 1. januar til 1. april 2026.» | Individuell virkning avhenger av kjøpsdato og bilpris. |
| consumption-tax | Reversere taxfree-innstrammingene (bytteordning + økt tobakkskvote) | 46 | «tobakkskvote) 400 000 000» | Kvoteendring og individets kjøp oppgis ikke numerisk. |
| consumption-tax | Tilskuddsordning lavere bompengetakster | 21 | «1 395 000 000» | Nye takster, passeringer og berørte prosjekter spesifiseres ikke. |
| benefit | Strømstønad til husholdninger og borettslag 50 øre ink. mva., inkludert fritidsboliger | 46 | «husholdninger og borettslag 50 øre ink. mva.» | Krever strømforbruk og priser; full beregningsregel oppgis ikke. |
| benefit | Øke minste pensjonsnivå med 10 000 kr fra 1. mai | 51 | «10 000 kr fra 1. mai 900 000 000» | Individets pensjonstype, kvalifikasjon og skattevirkning mangler. |
| benefit | Senke egenandelstaket til 3000 kroner | 28 | «egenandelstaket til 3000 kroner 600 000 000» | Virkningen avhenger av individets kvalifiserende helseutgifter. |

## C. Categories reviewed with no proposal

| category | verdict (no-change / not-applicable) | where you looked (pages / table names) | note |
|---|---|---|---|
| alminnelig inntekt, trygdeavgift og minstefradrag | no-change | Heltekstssøk; s. 46 «Tabeller» | Ingen sats- eller grenseforslag funnet. |
| trinnskatt trinn 3–5 | no-change | s. 8–9 og 46 | Bare trinn 1 og 2 omtales som endret. |
| øvrig mva | no-change | s. 10, 38 og 46 | Matmoms er eneste funne mva-satsforslag; elbilforslaget står i B. |
| el-, fly-, alkohol- og tobakksavgifter | no-change | Heltekstssøk; s. 46 «Tabeller» | Taxfree-kvote er ført i B, ikke som avgiftssats. |
| barnetrygd, kontantstøtte og arbeidsgiveravgift | no-change | Heltekstssøk; s. 46–55 tabeller | Ingen relevante treff eller forslag funnet. |

## D. Extraction notes
- Location of the party's main tax/duty table(s): page 46, anchor «Merverdiavgift mat, halveres 1. april».
- Ambiguities: Absolutte satser kan ikke utledes for trinnskatt, matmoms eller drivstoffavgifter. CO2-provenyet på 1 488 mill. kr er ikke fordelt mellom bensin og diesel. Formuesskattesatsen 0,8% er ikke fordelt på trinn. Studiestøttemålet 1,5 G gjelder «over fire år», ikke en eksplisitt 2026-sats.
