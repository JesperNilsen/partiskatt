# Ekstraksjonsark — Venstre alternativt statsbudsjett 2026
Source: sources/text/v-alt-2026.txt
Extractor: codex · Date: 2026-09-13

> **Revised 2026-09-26 by sprint lane L10b (not-reviewed sweep, decision 2).** Section-A rows whose note carries `[L10b]` replace both extractors’ text with one adjudicated reading of the source, written identically into both sheets. Where the party states only a change, the row is `estimated` with `DERIVE` in the value column and the arithmetic against Prop. 1 LS in the note; the encoded value and its derivation are in `src/data/parties/<party>.ts`. Text in rows without an `[L10b]` note is the extractor’s original 2026-09-13 reading.

## A. Rules (one row per formula; add `trinnN` sub-rows for brackets)

| formulaId | parameter | baseline quoted by party | party absolute value | stated change (verbatim ≤15 words) | page | anchor (≤10 words) | status | proveny mill. kr (if stated) | note |
|---|---|---|---|---|---|---|---|---|---|
| income.generalRate | sats alminnelig inntekt | | NOT FOUND | | | | no-change | | Søkt hele filen og skattabellene s. 117–119. |
| income.bracketTax.trinn1 | innslagspunkt + sats | | NOT FOUND | | | | no-change | | «trinnskatt» forekommer ikke; «innslagspunkt» gjelder jobbskattefradrag/mva. |
| income.bracketTax.trinn2 | innslagspunkt + sats | | NOT FOUND | | | | no-change | | Samme søk som trinn 1. |
| income.bracketTax.trinn3 | innslagspunkt + sats | | NOT FOUND | | | | no-change | | Samme søk som trinn 1. |
| income.bracketTax.trinn4 | innslagspunkt + sats | | NOT FOUND | | | | no-change | | Samme søk som trinn 1. |
| income.bracketTax.trinn5 | innslagspunkt + sats | | NOT FOUND | | | | no-change | | Samme søk som trinn 1. |
| income.socialSecurity | trygdeavgift lønn / pensjon / nedre grense | nedre grense kr 100 000 | nedre grense kr 150 000; satser NOT FOUND | «øke frikortgrensen fra 100 000 kroner til 150 000 kroner» | 32 | «100 000 kroner til 150 000 kroner» | confirmed | 1 190,0 | Dokumentet beskriver dette som inntektsgrensen for å betale trygdeavgift; s. 33 oppgir provenyet. |
| income.personalAllowance | personfradrag | | kr 125 757 | «(+ 11 547 kroner)» | 117 | «Personfradraget økes til 125 757» | confirmed | -9 800,0 påløpt / -9 800,0 bokført | Baseline er ikke uttrykkelig oppgitt. |
| income.minimumDeductionWage | minstefradrag lønn: sats / øvre grense | | NOT FOUND | | | | no-change | | Søkt hele filen etter «minstefradrag». |
| income.minimumDeductionPension | minstefradrag pensjon: sats / øvre grense | | NOT FOUND | | | | no-change | | Søkt hele filen etter «minstefradrag». |
| income.unionFeeDeduction | fagforeningsfradrag maks | | NOT FOUND | | | | no-change | | Søkt hele filen etter «fagforening». |
| wealth.netWealthTax | bunnfradrag (enslig/ektefeller), sats trinn 1, trinn 2 innslag + sats | — | DERIVE | «Satsen i formuesskatten for formuer under 21,5 mill. kroner reduseres med 0,1 pst-poeng.» | 119 | formuer under 21,5 mill. kroner reduseres med 0,1 pst-poeng. | estimated | -2 150 | [L10b] Utledet: Prop. 1 LS trinn 1 1,0 % − 0,1 = 0,9 %; trinn 2 og bunnfradrag uendret. |
| wealth.valuation | verdsettelse primærbolig (inkl. høy verdi), sekundærbolig, aksjer, bankinnskudd | aksjer/«arbeidende kapital»: 80 pst. verdsettelsesrabatt | aksjer/«arbeidende kapital»: 70 pst. verdsettelsesrabatt; øvrige felt NOT FOUND | «Verdsettelsesrabatt reduseres fra 80 til 70 pst.» | 119 | «reduseres fra 80 til 70 pst.» | confirmed | -2 710,0 påløpt / -2 710,0 bokført | Dokumentets betegnelse «verdsettelsesrabatt» er beholdt verbatim. |
| vat.food | mva næringsmidler | — | DERIVE | «Momsfritak på frukt og grønt»; «Full mva på kjøtt» | 120 | Full mva på kjøtt | unquantified | -6 000; 4 000 | [L10b] Modellen har én matsats. Unquantified i v.ts. |
| vat.general | mva alminnelig sats | — | uendret | — | 120 | Full mva på kjøtt | no-change | — | [L10b] Ingen endring i den alminnelige satsen; 25 % nevnes bare om kjøtt. |
| vat.transportServices | mva persontransport | | NOT FOUND | | | | no-change | | Søkt hele filen og mva-tabellene s. 120–121. |
| vat.electricity | mva strøm | — | DERIVE | «Avvikle fritaket for mva på elektrisk kraft for husholdninger i Nord-Norge» | 120 | Avvikle fritaket for mva | unquantified | 800 | [L10b] Modellen bruker 25 % for alle og har ikke Nord-Norge-fritaket. Unquantified i v.ts. |
| vat.fuel | mva drivstoff | | NOT FOUND | | | | no-change | | Ingen mva-endring for drivstoff funnet. |
| vat.alcoholTobacco | mva alkohol/tobakk | | NOT FOUND | | | | no-change | | Tobakksendringen gjelder særavgift, ikke mva. |
| vat.flights | mva flyreiser | | NOT FOUND | | | | no-change | | Flypassasjeravgift finnes, men ingen mva-endring for flyreiser. |
| excise.petrolLitre | veibruksavgift + CO2-avgift bensin | — | DERIVE | «Reversere lettelser i veibruksavgiften 2022–2025»; CO2-avgift 1 842 kr/tonn i 2026 | 122 | Avgiftsnivået i 2026 = 1 842 per | unquantified | 650; 2 080 | [L10b] Ingen sats per liter. Unquantified i v.ts. |
| excise.dieselLitre | veibruksavgift + CO2-avgift diesel | — | DERIVE | «Reversere lettelser i veibruksavgiften 2022–2025»; CO2-avgift 1 842 kr/tonn i 2026 | 122 | Avgiftsnivået i 2026 = 1 842 per | unquantified | 1 600; 2 080 | [L10b] Som bensin. |
| excise.kwh | elavgift (alminnelig sats, evt. redusert jan–mar) | regjeringens forslag: 4,18 øre/kWh | 6 øre/kWh | «Redusert el-avgift til 6 øre kWh» | 85, 122 | «Redusert el-avgift til 6 øre kWh» | confirmed | 1 290,0 påløpt / 900,0 bokført | S. 122 oppgir også 9,79 øre jan.–mars og 12,53 øre resten av året. |
| excise.flightEurope | flypassasjeravgift Europa | 2024-nivå; sats ikke oppgitt | DERIVE | «Videreføre flypassasjeravgiften på 2024-nivå» | 85 | «Videreføre flypassasjeravgiften på 2024-nivå 640,0 580,0» | unquantified | Europa/øvrig samlet: 640,0 påløpt / 580,0 bokført | Ingen sats eller geografisk fordeling oppgis. |
| excise.flightOther | flypassasjeravgift utenfor Europa | 2024-nivå; sats ikke oppgitt | DERIVE | «Videreføre flypassasjeravgiften på 2024-nivå» | 85 | «Videreføre flypassasjeravgiften på 2024-nivå 640,0 580,0» | unquantified | Europa/øvrig samlet: 640,0 påløpt / 580,0 bokført | Ingen sats eller geografisk fordeling oppgis. |
| excise.beerLitre | alkoholavgift øl | | NOT FOUND | | | | no-change | | Søkt hele filen etter «alkoholavgift» og «øl». |
| excise.wineLitre | alkoholavgift vin | | NOT FOUND | | | | no-change | | Søkt hele filen etter «alkoholavgift» og «vin». |
| excise.spiritsLitre | alkoholavgift brennevin | | NOT FOUND | | | | no-change | | Søkt hele filen etter «alkoholavgift» og «brennevin». |
| excise.cigarette | tobakksavgift sigaretter | — | DERIVE | «Økes med 5 pst. Gjelder ikke snus.» | 123 | Økes med 5 pst. Gjelder ikke snus. | estimated | 240 | [L10b] Utledet: Prop. 1 LS 3,31 kr/stk × 1,05 = 3,4755 kr/stk. Snus uendret. |
| excise.snusGram | tobakksavgift snus | | NOT FOUND | «Gjelder ikke snus.» | 123 | «Økes med 5 pst. Gjelder ikke snus.» | no-change | | Ingen snussats oppgis. |
| benefit.childBenefit | barnetrygd under 6 / fra 6 / utvidet (enslig) | 23 616 kr/år (2025) | 37 786 kr/år før skatt (alle barn 0–18); barnetrygden skattlegges | «Øke og skattlegge barnetrygden» | 46 | Øke og skattlegge barnetrygden | unquantified | 1 000 | [L10b] Barnetrygden blir skattepliktig, som modellen ikke kan regne; s. 46 gir også +75 kr/mnd for samme tiltak. Unquantified i v.ts. |
| benefit.studentSupport | studiestøtte (basisstøtte, stipendandel) | — | DERIVE | «Økt studiestøtte til 1,4G = 15 365 kroner i økt støtte» | 33 | Økt studiestøtte til 1,4G | unquantified | 365 | [L10b] G og antall måneder ikke oppgitt; økningen er regnet fra 2025–2026. Unquantified i v.ts. |
| employer.contribution | arbeidsgiveravgift sats / ekstra avgift | | NOT FOUND | | | | no-change | | Ingen generell satsendring; målrettede fritak/grenser står i B. |

## B. Proposals that touch household cash but cannot enter the formulas (unquantified)

| category (direct-tax / wealth-tax / consumption-tax / benefit / employer) | title (party's wording) | page | anchor | why it cannot be quantified for an individual |
|---|---|---|---|---|
| direct-tax | Jobbskattefradrag for unge | 8 | «Jobbskattefradrag for unge, 50 000 kroner» | Avkortes med inntekt; «maksimalt innslagspunkt» tallfestes ikke. |
| direct-tax | Jobbskattefradrag for personer over 70 år | 8 | «personer over 70 år, 50 000 kroner 350,0» | Krever alder, arbeidsinntekt og øvrige fradrag. |
| direct-tax | Nytt særfradrag for enslige forsørgere med flere enn ett barn | 117 | «20.000 kroner for første barn og 25.000 kroner» | Krever forsørgerstatus og antall barn; ikke støttet formel. |
| direct-tax | Redusert reisefradrag | 117 | «Redusert reisefradrag 800,0 640,0» | Nye grenser/satser oppgis ikke. |
| direct-tax | Unnta forbrukslån og kredittkortgjeld fra rentefradraget | 117 | «gjeld = 172,7 mrd. kroner» | Krever individuell gjeld og renteutgift. |
| direct-tax | Øke det maksimale fradraget for pensjonssparing | 117 | «Økes fra 25 000 til 40 000 kroner» | Krever individuell innbetaling. |
| direct-tax | Gjeninnføre ordning med skattefri fordel ved ansattes kjøp av aksjer | 118 | «Maksimal fordel = 25 000 kroner» | Krever arbeidsgiverordning og kjøpsbeløp. |
| direct-tax | Heve grensen for fradrag for pensjonssparing for selvstendig næringsdrivende | 118 | «18,1 pst av lønn mellom 7,1 og 12G» | Krever næringsstatus, lønn og G-verdi. |
| direct-tax | Heve grensen for skattefradrag for gaver til frivillige | 118 | «Heves fra 25 000 til 50 000 kroner» | Krever individuell gave. |
| direct-tax | Redusere maksimalt beløp for skattepliktig fordel av telefon og bredbånd | 118 | «Senkes fra maksimalt 4 392 kroner» | Krever arbeidsgiverbetalt tjeneste. |
| direct-tax | Skattefri kilometergodtgjørelse settes lik statens satser | 118 | «sats økes fra 3,50 til 5 kroner» | Krever antall godtgjorte kilometer. |
| direct-tax | Redusert firmabilbeskatning for el-biler | 118 | «Skattlegges tilsvarende 90 pst av sats for fossile biler» | Fossilbilgrunnlaget og bilverdien mangler. |
| direct-tax | Øke skattefri grense for utleie av egen fritidsbolig og bolig | 118 | «50 000 kroner» | Krever individuell utleieinntekt og eiendomstype. |
| direct-tax | Skattefri inntektsgrense, frivillige organisasjoner | 118 | «10 000 kroner til 15 000 kroner» | Gjelder bare vederlag fra frivillig organisasjon. |
| direct-tax | Ikke gjennomføre forsøksordning/skattelotteri med arbeidsfradrag for unge | 118 | «Ikke gjennomføre 500,0 500,0» | Virkning avhenger av uttrekket i regjeringens forsøksordning. |
| direct-tax | Videreføre Finnmarksfradraget på 2025-nivå | 118 | «fradraget fra 30 000 til 45 000» | Geografisk særregel; Venstres absolutte 2025-beløp er kr 30 000. |
| benefit | Innføre en rett til sykepenger for personer over 70 år som er i arbeid | 8 | «personer over 70 år som er i arbeid 160,0» | Krever alder, arbeidsstatus, lønn og sykefravær. |
| benefit | Økt inntektsgrense i uføreordningen | 8 | «fra 0,4 til 0,75G, fra 1.7.2026» | Krever uføreytelse, inntekt og G-verdi. |
| benefit | Reform av AAP-ordningen | 8 | «økes fra 66 til 80 pst.» | Sats varierer mellom år én, to og tre. |
| benefit | Senket inngangskrav til arbeidsavklaringspenger | 8 | «arbeidsavklaringspenger til 40% av redusert 55,0» | Krever medisinsk vurdering av redusert arbeidsevne. |
| benefit | Utvide småbarnstillegg til enslige forsørgere til 8 år | 44 | «enslige forsørgere til 8 år 9,1» | Selve tilleggssatsen oppgis ikke. |
| benefit | Videreføre engangsstønad på 2025-nivå | 44 | «Videreføre engangsstønad på 2025-nivå 134,0» | 2025-nivået omtales som «vel 92 000», ikke eksakt. |
| benefit | Kontantstøtte — Ordningen avvikles | 88 | «Kontantstøtte -724,6 -724,6» | Individuell virkning krever barnets alder og bruk av ordningen. |
| benefit | Styrket bostøtte | 44 | «Styrket bostøtte 145,0» | Satser og inntektsgrenser oppgis ikke. |
| benefit | Ikke avvikle ordningen med overgangsstønad for enslig far eller mor | 44 | «enslig far eller mor 63,0» | Individuell ytelse og vilkår oppgis ikke. |
| benefit | Økt og forbedret stønad til barnetilsyn til enslige forsørgere | 44 | «stønad til barnetilsyn til enslige forsørgere 37,0» | Satser og utgifter oppgis ikke. |
| benefit | Øke veiledende sosialhjelpssatser for barnefamilier med 15 pst. | 44 | «barnefamilier med 15 pst. 395,0» | Kommunal, behovsprøvd ytelse uten individuelle grunnsatser. |
| benefit | Gratis fulltidsplass i barnehage og øke inntektsgrensen | 44 | «inntektsgrensen til 800 000 kr» | Krever husholdningsinntekt, barn og barnehagebruk. |
| benefit | Hevet inntektsgrense før avkortning i stipend | 33 | «224 709 kroner til 250 000 kroner» | Krever studentens inntekt og stipend/lånesammensetning. |
| benefit | Innføre 12 mnd. studiestøtte for studenter med barn | 33 | «studenter med barn 0,0» | Ingen budsjetteffekt i 2026; månedsbeløp oppgis ikke. |
| benefit | Reversere forslaget om å redusere satsen for omgjøring av lån til stipend for folkehøyskoleelever | 33 | «redusere satsen for omgjøring av 97,3» | Gjeldende og foreslått stipendandel oppgis ikke. |
| consumption-tax | Innføre mva-fritak for solcelleanlegg og varmepumper til husholdninger og boligsameier | 120 | «Innføre mva-fritak for -25,0 -20,0» | Krever individuelt kjøp og pris. |
| consumption-tax | Innføre mva-fritak på kortidsutleie av el-biler | 121 | «Innføre mva-fritak på -100,0 -80,0» | Krever individuell leiekostnad. |
| consumption-tax | Innføre mva-fritak på reparasjon av klær, elektronikk og husholdnings- og fritidsvarer | 121 | «Innføre mva-fritak på -600,0 -420,0» | Krever individuelt forbruk. |
| consumption-tax | Innføre mva-fritak på omsetning av brukte klær, elektronikk og husholdnings- og fritidsvarer | 121 | «Innføre mva-fritak på -400,0 -260,0» | Krever individuelt forbruk. |
| consumption-tax | Ordinær mva-sats på gebyr på vann og avløp | 121 | «Ordinær mva-sats på 4 400,0 3 700,0» | Krever kommunalt gebyr; regjeringens 15 pst. nevnes, absolutt ordinær sats ikke tallfestes her. |
| consumption-tax | Endret virkningstidspunkt for mva-fritak for el-bil | 121 | «Endret virkningstids- -1 000,0 -875,0» | Krever bilpris og kjøpsdato. |
| consumption-tax | Halv dokumentavgift for førstegangskjøpere av bolig | 123 | «Halv dokumentavgift -375,0 -375,0» | Krever førstegangskjøperstatus, boligtype og kjøpesum. |
| employer | Fritak for arbeidsgiveravgift i ett år for arbeidsgivere som ansetter en person med flyktningestatus | 119 | «Fritak for arbeids- -320,0 -270,0» | Ingen sats oppgis; gjelder bare kvalifiserende nyansettelser. |
| employer | Økte grenser for å betale arbeidsgiveravgift for frivillige organisasjoner | 123 | «Økes fra 800 000 totalt/80 000» | Organisasjons- og personspesifikke beløpsgrenser, ikke generell sats. |

## C. Categories reviewed with no proposal

| category | verdict (no-change / not-applicable) | where you looked (pages / table names) | note |
|---|---|---|---|
| Alminnelig inntekt, trinnskatt, minstefradrag og fagforeningsfradrag | no-change | Hele filen; skatt på inntekt s. 78–79; rammeområde 21 s. 117–119 | Ingen relevante satser, grenser eller endringer funnet. |
| Generell mva, persontransport, drivstoff, alkohol/tobakk og flyreiser | no-change | Endringer i momssystemet/tabell 28 s. 81; rammeområde 21 s. 120–121 | Bare de særskilte mva-endringene ført i A/B er oppgitt. |
| Alkoholavgift på øl, vin og brennevin | no-change | Tabell 30 s. 85; bil-/miljøavgifter og andre avgifter s. 122–123 | Ingen treff på relevante avgifter eller produktsatser. |
| Formuesverdsettelse av primærbolig, høyverdi-primærbolig, sekundærbolig og bankinnskudd | no-change | Formuesskatt/tabell 27 s. 80; rammeområde 21 s. 119 | Bare verdsettelsesrabatt for aksjer/«arbeidende kapital» endres. |
| Tobakksavgift på snus | no-change | Rammeområde 21 s. 123 | Tobakksavgiften økes 5 pst., men «Gjelder ikke snus.» |

## D. Extraction notes
- Location of the party's main tax/duty table(s): pages 80–82, 85 and 117–123; relevant benefit tables are on pages 33, 44 and 46.
- Ambiguities: Elavgiften oppgir både tidligere satser, regjeringens 4,18 øre/kWh og Venstres 6 øre/kWh. Veibruksavgiften oppgir bare samlet proveny for bensin og diesel, ikke kr/l. Flypassasjeravgiften oppgir bare «2024-nivå», uten satser eller geografisk fordeling. Barnetrygden oppgis som årsbeløp, ikke kr/mnd. «Verdsettelsesrabatt» er gjengitt uten å omregne den til verdsettelsesandel.
