# Ekstraksjonsark — <PARTI> alternativt statsbudsjett 2026

Source: `sources/text/<party>-alt-2026.txt` (from `sources/raw/<party>-alt-2026.pdf`, see `sources/manifest.parties.json`).
Extractor: <claude|codex>  ·  Date: 2026-09-13

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
| income.generalRate | sats alminnelig inntekt | | | | | | | | |
| income.bracketTax.trinn1 | innslagspunkt + sats | | | | | | | | |
| income.bracketTax.trinn2 | innslagspunkt + sats | | | | | | | | |
| income.bracketTax.trinn3 | innslagspunkt + sats | | | | | | | | |
| income.bracketTax.trinn4 | innslagspunkt + sats | | | | | | | | |
| income.bracketTax.trinn5 | innslagspunkt + sats | | | | | | | | |
| income.socialSecurity | trygdeavgift lønn / pensjon / nedre grense | | | | | | | | |
| income.personalAllowance | personfradrag | | | | | | | | |
| income.minimumDeductionWage | minstefradrag lønn: sats / øvre grense | | | | | | | | |
| income.minimumDeductionPension | minstefradrag pensjon: sats / øvre grense | | | | | | | | |
| income.unionFeeDeduction | fagforeningsfradrag maks | | | | | | | | |
| wealth.netWealthTax | bunnfradrag (enslig/ektefeller), sats trinn 1, trinn 2 innslag + sats | | | | | | | | |
| wealth.valuation | verdsettelse primærbolig (inkl. høy verdi), sekundærbolig, aksjer, bankinnskudd | | | | | | | | |
| vat.food | mva næringsmidler | | | | | | | | |
| vat.general | mva alminnelig sats | | | | | | | | |
| vat.transportServices | mva persontransport | | | | | | | | |
| vat.electricity | mva strøm | | | | | | | | |
| vat.fuel | mva drivstoff | | | | | | | | |
| vat.alcoholTobacco | mva alkohol/tobakk | | | | | | | | |
| vat.flights | mva flyreiser | | | | | | | | |
| excise.petrolLitre | veibruksavgift + CO2-avgift bensin | | | | | | | | |
| excise.dieselLitre | veibruksavgift + CO2-avgift diesel | | | | | | | | |
| excise.kwh | elavgift (alminnelig sats, evt. redusert jan–mar) | | | | | | | | |
| excise.flightEurope | flypassasjeravgift Europa | | | | | | | | |
| excise.flightOther | flypassasjeravgift utenfor Europa | | | | | | | | |
| excise.beerLitre | alkoholavgift øl | | | | | | | | |
| excise.wineLitre | alkoholavgift vin | | | | | | | | |
| excise.spiritsLitre | alkoholavgift brennevin | | | | | | | | |
| excise.cigarette | tobakksavgift sigaretter | | | | | | | | |
| excise.snusGram | tobakksavgift snus | | | | | | | | |
| benefit.childBenefit | barnetrygd under 6 / fra 6 / utvidet (enslig) | | | | | | | | |
| benefit.studentSupport | studiestøtte (basisstøtte, stipendandel) | | | | | | | | |
| employer.contribution | arbeidsgiveravgift sats / ekstra avgift | | | | | | | | |

## B. Proposals that touch household cash but cannot enter the formulas (unquantified)

| category (direct-tax / wealth-tax / consumption-tax / benefit / employer) | title (party's wording) | page | anchor | why it cannot be quantified for an individual |
|---|---|---|---|---|

## C. Categories reviewed with no proposal

| category | verdict (no-change / not-applicable) | where you looked (pages / table names) | note |
|---|---|---|---|

## D. Extraction notes
- Location of the party's main tax/duty table(s): page(s) …
- Ambiguities: …
