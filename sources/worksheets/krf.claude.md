# Ekstraksjonsark — Kristelig Folkeparti alternativt statsbudsjett 2026

Source: `sources/text/krf-alt-2026.txt` (from `sources/raw/krf-alt-2026.pdf`, see `sources/manifest.json`).
Extractor: claude  ·  Date: 2026-09-13

> Extraction constraint (read before using this sheet): the party's numeric annex
> "Budsjettet i tall" is announced on page 34 and occupies pages 35–46, but **every one
> of pages 35–46 extracted to nothing but its own page number** in this text file
> (2 non-whitespace characters each). Pages 12, 19, 20 and 33 are likewise empty.
> No tax or duty *table* exists in the extractable text. Everything below comes from
> the prose chapter "Verdiskaping og skatt" (pages 17–18), the family chapter
> (pages 8–9), the Nøkkeltall box (page 3) and scattered prose. Most section-A rows are
> `NOT FOUND` because the parameter is absent from the whole file, not because it was
> skipped: `trinnskatt`, `innslagspunkt`, `personfradrag`, `minstefradrag`,
> `trygdeavgift`, `alminnelig inntekt`, `bunnfradrag`, `primærbolig`, `sekundærbolig`,
> `bankinnskudd`, `fagforening`, `næringsmidler`, `matmoms`, `persontransport`,
> `elavgift`, `veibruksavgift`, `flypassasjer`, `bensin`, `diesel`, `snus`,
> `studiestøtte`, `basisstøtte`, `stipend`, `Lånekassen` and `mva` each occur
> **0 times** in the 48-page file.

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
| income.generalRate | sats alminnelig inntekt | | NOT FOUND | | 17 | generelle lettelser i inntektsskatten | NOT FOUND | | "alminnelig inntekt" occurs 0 times in the file. Page 17 explicitly contrasts KrF's youth deduction with "generelle lettelser i inntektsskatten"; no rate stated. Numeric annex pp. 35–46 blank. |
| income.bracketTax.trinn1 | innslagspunkt + sats | | NOT FOUND | | | | NOT FOUND | | "trinnskatt" and "innslagspunkt" occur 0 times in the whole file. Looked at pp. 17–18 (tax chapter), p. 3 (Nøkkeltall) and the blank annex pp. 35–46. |
| income.bracketTax.trinn2 | innslagspunkt + sats | | NOT FOUND | | | | NOT FOUND | | Same as trinn1. |
| income.bracketTax.trinn3 | innslagspunkt + sats | | NOT FOUND | | | | NOT FOUND | | Same as trinn1. |
| income.bracketTax.trinn4 | innslagspunkt + sats | | NOT FOUND | | | | NOT FOUND | | Same as trinn1. |
| income.bracketTax.trinn5 | innslagspunkt + sats | | NOT FOUND | | | | NOT FOUND | | Same as trinn1. |
| income.socialSecurity | trygdeavgift lønn / pensjon / nedre grense | | NOT FOUND | | | | NOT FOUND | | "trygdeavgift" occurs 0 times. Looked at pp. 17–18, p. 3, pp. 28–29 (arbeid og inkludering). |
| income.personalAllowance | personfradrag | | NOT FOUND | | | | NOT FOUND | | "personfradrag" occurs 0 times. Looked at pp. 17–18 and p. 3. |
| income.minimumDeductionWage | minstefradrag lønn: sats / øvre grense | | NOT FOUND | | | | NOT FOUND | | "minstefradrag" occurs 0 times. Looked at pp. 17–18 and p. 3. |
| income.minimumDeductionPension | minstefradrag pensjon: sats / øvre grense | | NOT FOUND | | | | NOT FOUND | | "minstefradrag" occurs 0 times. Looked at pp. 17–18, p. 3 and pp. 13–16 (helse/eldre). |
| income.unionFeeDeduction | fagforeningsfradrag maks | | NOT FOUND | | | | NOT FOUND | | "fagforening" occurs 0 times. Looked at pp. 17–18 and pp. 28–29. |
| wealth.netWealthTax | bunnfradrag (enslig/ektefeller), sats trinn 1, trinn 2 innslag + sats | | NOT FOUND | | 17 | fjerne formuesskatten på arbeidende kapital | NOT FOUND | | "bunnfradrag" occurs 0 times; no formuesskatt rate or threshold anywhere. KrF's formuesskatt changes are delivered entirely through verdsettelse — see `wealth.valuation`. Looked at p. 17 (whole tax chapter), p. 3, p. 7. |
| wealth.valuation | verdsettelse primærbolig (inkl. høy verdi), sekundærbolig, aksjer, bankinnskudd | aksjer og driftsmidler: 80 pst | aksjer og driftsmidler: 60 pst | "redusere verdsettelsen av aksjer og driftsmidler fra 80 til 60 pst" | 17 | aksjer og driftsmidler fra 80 til 60 pst | confirmed | | Only the aksjer/driftsmidler figure is numeric. Second change on the same page: "fjerne verdsettelsesrabatten for boliger med verdi over 8 mill. kroner" (p. 17, anchor `over 8 mill. kroner, for å dempe`) — the resulting valuation percentage is not stated, so that component is unquantified (see B). Sekundærbolig and bankinnskudd: words occur 0 times = NOT FOUND. Document does not say whether the 8 mill. threshold applies to the whole value or the excess. |
| vat.food | mva næringsmidler | | NOT FOUND | | | | NOT FOUND | | "næringsmidler" and "matmoms" occur 0 times. Looked at p. 18 (duty chapter) and p. 3. |
| vat.general | mva alminnelig sats | | | | 18 | På avgiftssiden fjerner vi momsfritaket for | no-change | | The general VAT rate itself is never stated or changed. The only VAT measure is removal of the EV exemption ("ordinær moms på elbiler", p. 17/18), i.e. a base change, recorded in B. |
| vat.transportServices | mva persontransport | | NOT FOUND | | | | NOT FOUND | | "persontransport" occurs 0 times. Looked at p. 18 and p. 26 (samferdsel). |
| vat.electricity | mva strøm | | NOT FOUND | | 24 | strøm på 40 øre per kWh, uten moms | NOT FOUND | | The "uten moms" phrase on p. 24 describes the *government's* norgespris scheme, not a KrF VAT proposal. No KrF change to VAT on electricity is stated. |
| vat.fuel | mva drivstoff | | NOT FOUND | | | | NOT FOUND | | "drivstoff" occurs 0 times. Looked at p. 18 and p. 24 (energi og miljø). |
| vat.alcoholTobacco | mva alkohol/tobakk | | NOT FOUND | | | | NOT FOUND | | p. 18 changes the alkohol/tobakk *excise* duties, never their VAT. |
| vat.flights | mva flyreiser | | NOT FOUND | | | | NOT FOUND | | No mention of flights or air travel VAT anywhere. Looked at p. 18 and p. 26. |
| excise.petrolLitre | veibruksavgift + CO2-avgift bensin | | NOT FOUND | | 18 | fører vi fritaket for CO2-avgift for fiskeriene | NOT FOUND | | "veibruksavgift" and "bensin" occur 0 times. The only two CO2-avgift mentions on p. 18 are the fisheries exemption and opposition to CO2-avgift on mineralgjødsel — both industry-specific, excluded by rule 7. |
| excise.dieselLitre | veibruksavgift + CO2-avgift diesel | | NOT FOUND | | 18 | CO2-avgift på mineralgjødsel. Dette vil neppe | NOT FOUND | | "veibruksavgift" and "diesel" occur 0 times. Same two industry-specific CO2-avgift mentions as above. |
| excise.kwh | elavgift (alminnelig sats, evt. redusert jan–mar) | | NOT FOUND | | 24 | innføre makspris på strøm, med 100 | NOT FOUND | | "elavgift" occurs 0 times. The electricity measure on p. 24 is a price cap with 100 pst compensation above 50 øre per kWt, not a duty — recorded in B. |
| excise.flightEurope | flypassasjeravgift Europa | | NOT FOUND | | | | NOT FOUND | | "flypassasjer" occurs 0 times. Looked at p. 18 and p. 26. |
| excise.flightOther | flypassasjeravgift utenfor Europa | | NOT FOUND | | | | NOT FOUND | | "flypassasjer" occurs 0 times. Looked at p. 18 and p. 26. |
| excise.beerLitre | alkoholavgift øl | | DERIVE | "Vi øker alkoholavgiftene reelt til nivået anbefalt av Særavgiftsutvalget" | 18 | Vi øker alkoholavgiftene reelt til | unquantified | | No baseline, no per-litre rate, no proveny. The Særavgiftsutvalget level is referenced but not reproduced in the document; øl/vin/brennevin are not split. |
| excise.wineLitre | alkoholavgift vin | | DERIVE | "Vi øker alkoholavgiftene reelt til nivået anbefalt av Særavgiftsutvalget" | 18 | nivået anbefalt av Særavgiftsutvalget, vi øker | unquantified | | Same sentence as excise.beerLitre; no product split, no rate. |
| excise.spiritsLitre | alkoholavgift brennevin | | DERIVE | "Vi øker alkoholavgiftene reelt til nivået anbefalt av Særavgiftsutvalget" | 18 | nivået anbefalt av Særavgiftsutvalget, vi øker | unquantified | | Same sentence as excise.beerLitre; no product split, no rate. |
| excise.cigarette | tobakksavgift sigaretter | | DERIVE | "vi øker tobakksavgiftene" | 18 | tobakksavgiftene og vi foreslår å gjeninnføre | unquantified | | No rate, no per-unit amount, no percentage. Sigaretter are not named separately. |
| excise.snusGram | tobakksavgift snus | | DERIVE | "vi øker tobakksavgiftene" | 18 | tobakksavgiftene og vi foreslår å gjeninnføre | unquantified | | "snus" occurs 0 times in the file; only the collective plural "tobakksavgiftene" is used, so a snus-specific rate cannot be inferred. |
| benefit.childBenefit | barnetrygd under 6 / fra 6 / utvidet (enslig) | | kr 2 250 per mnd | "økning av barnetrygden til 2 250 kroner i måneden" | 9 | 2 250 kroner i måneden | confirmed | | The level is explicit but **undifferentiated**: the document never distinguishes under-6 / from-6 / utvidet barnetrygd, and quotes no baseline. Stated effect: "løfte 5 000 færre barn ut av vedvarende lavinntekt" (p. 9, anchor `løfte 5 000 færre barn`). Whether 2 250 applies to all age bands is not resolvable from this text. |
| benefit.studentSupport | studiestøtte (basisstøtte, stipendandel) | | NOT FOUND | | | | NOT FOUND | | "studiestøtte", "basisstøtte", "stipend" and "Lånekassen" each occur 0 times. Looked at pp. 10–11 (skole) and pp. 28–29. The student-related measure on p. 7 is foreldrepenger på minst 3G — a different benefit, recorded in B. |
| employer.contribution | arbeidsgiveravgift sats / ekstra avgift | | NOT FOUND | | 17 | sysselsettingsfiendtlig økning i arbeidsgiveravgiften og økt formuesskatten | NOT FOUND | | The single occurrence of "arbeidsgiveravgift" in the file is a criticism of the government's increase, not a KrF proposal: no rate, no reversal, no amount is stated. |

## B. Proposals that touch household cash but cannot enter the formulas (unquantified)

| category (direct-tax / wealth-tax / consumption-tax / benefit / employer) | title (party's wording) | page | anchor | why it cannot be quantified for an individual |
|---|---|---|---|---|
| direct-tax | Arbeidsfradrag for unge — "innføre et arbeidsfradrag for alle unge på maksimalt 100 000 kroner" | 17 | alle unge på maksimalt 100 000 kroner | A new deduction with no counterpart formula row. The document gives only a maximum; no rate, no age definition of "unge", no phase-in/phase-out, no baseline. Restated on p. 7 as "et skattefradrag for alle unge på 100 000 kroner" — "arbeidsfradrag" vs "skattefradrag" is not reconciled. |
| direct-tax | Nei til regjeringens "skattelotteri" | 17 | telotteri, men i stedet innføre et arbeidsfradrag | Rejects an unnamed government income-tax measure. No parameter, no amount, no proveny. Cannot be mapped to trinnskatt, personfradrag or any other formula row from this text. |
| direct-tax | "øke foreldrefradraget til 50 000 kroner for barn nr. 1 og 2, og 100 000 kroner for barn nr. tre og videre" | 9 | å øke foreldrefradraget til 50 000 kroner | Foreldrefradrag is not one of the formula rows. Second half of the amount verified separately at p. 9, anchor `og 100 000 kroner for`. Document states the deduction "skal gis til alle familier uten byråkratiske krav til å dokumentere utgifter", but quotes no baseline. |
| direct-tax | Stated effect of the family tax relief: "om lag 13 000 kroner for en tobarnsfamilie og 32 000 kroner for en trebarnsfamilie" | 9 | om lag 13 000 kroner for | An outcome figure, not a parameter. Second figure verified at p. 9, anchor `32 000 kroner for en`. The document does not say which measures (foreldrefradrag alone, or with barnetrygd) produce it, nor at which income. |
| direct-tax | Økt skattefradrag for frivillige gaver | 29 | skattefradraget for frivillige gaver | No maximum amount, no rate, no baseline stated. |
| wealth-tax | "fjerne verdsettelsesrabatten for boliger med verdi over 8 mill. kroner" | 17 | over 8 mill. kroner, for å dempe | The threshold is explicit but the resulting verdsettelse percentage is not, nor the current rabatt, nor whether the threshold applies to the full value or only the excess. |
| consumption-tax | "På avgiftssiden fjerner vi momsfritaket for elbiler helt fra 1. januar" | 18 | elbiler helt fra 1. januar | A VAT *base* change on a durable purchase, not a rate in any formula row. Effect on a household depends on whether and which car is bought; no price assumption given. |
| consumption-tax | "vi foreslår å gjeninnføre avgiftene på brus og sukker" | 18 | avgiftene på brus og sukker | No rate, no per-unit amount, no proveny, and no matching formula row. |
| consumption-tax | Makspris på strøm — "100 prosent kompensasjon for priser over 50 øre per kWt" | 24 | prosent kompensasjon for priser over 50 | A price-support scheme, not a tax. Household effect depends on consumption volume and the market price path, neither of which is given. Unit is printed as "kWt" on this page. |
| benefit | Økt kontantstøtte | 7 | (økt kontantstøtte). Økningen i barnetrygden alene gir | Named as a headline priority (also p. 3) but no amount, rate or duration appears anywhere in the file. |
| benefit | Foreldrepenger på minst 3G for studenter og unge foreldre | 7 | foreldrepenger på minst 3G), hvor | Stated in G, and the document never gives the value of G, so no kroner amount can be derived from this source. |
| benefit | Økt pensjon for enslige minstepensjonister | 7 | pensjon for enslige minstepensjonister og en styrking | Listed as a headline priority (also pp. 3 and 6) with no amount anywhere in the file. |
| benefit | Brillestøtte for barn — "sats 1 økes med 800 kroner" | 29 | med 800 kroner | The change is explicit but brillestøtte has no formula row, and the baseline sats 1 is not quoted, so no absolute level can be derived. |
| benefit | Imot regjeringens kutt i overgangsstønaden for enslige foreldre | 29 | overgangsstønaden for enslige foreldre | A reversal of a government cut whose size is not stated in this document. |
| benefit | "reversere regjeringens reelle kutt i grunnstønaden … og i hjelpestønaden" | 29 | forslaget. Vi foreslår også å reversere | No amounts, rates or satser stated for either benefit. |
| employer | Reform av sykelønnsordningen — larger employer financing of long-term absence from 1 July | 28 | KrF foreslår å gjennomføre dette | Employer-side, and the document explicitly states "Endringen innebærer ikke kutt i ytelsene til de sykemeldte"; no rate or amount given. |

## C. Categories reviewed with no proposal

| category | verdict (no-change / not-applicable) | where you looked (pages / table names) | note |
|---|---|---|---|
| Trinnskatt (all brackets, satser and innslagspunkt) | not-applicable | pp. 17–18 ("Verdiskaping og skatt"), p. 3 ("Nøkkeltall"), blank annex pp. 35–46 | "trinnskatt" and "innslagspunkt" occur 0 times in the 48-page file. |
| Sats alminnelig inntekt | not-applicable | pp. 17–18, p. 3 | "alminnelig inntekt" occurs 0 times. p. 17 explicitly declines general income-tax relief. |
| Personfradrag / minstefradrag | not-applicable | pp. 17–18, p. 3, pp. 8–9 | Both terms occur 0 times. |
| Trygdeavgift | not-applicable | pp. 17–18, pp. 28–29 | Term occurs 0 times. |
| Fagforeningsfradrag | not-applicable | pp. 17–18, pp. 28–29 | "fagforening" occurs 0 times. |
| Formuesskatt bunnfradrag og satser | not-applicable | p. 17 (full formuesskatt passage), p. 3, p. 7 | "bunnfradrag" occurs 0 times; the party's formuesskatt changes run entirely through verdsettelse. |
| Verdsettelse sekundærbolig / bankinnskudd | not-applicable | p. 17 | Both terms occur 0 times. |
| Merverdiavgift — alminnelig sats | no-change | pp. 17–18 (duty chapter), p. 3 | Only the EV exemption is touched; the standard rate is never stated. |
| Merverdiavgift — næringsmidler, persontransport, drivstoff, alkohol/tobakk, flyreiser | not-applicable | p. 18, p. 24, p. 26 | "næringsmidler", "matmoms", "persontransport", "drivstoff" occur 0 times; no flights mentioned. |
| Veibruksavgift og drivstoff-CO2-avgift (bensin/diesel) | not-applicable | p. 18 (full duty passage), p. 24, p. 26 | "veibruksavgift", "bensin", "diesel" occur 0 times. The two CO2-avgift mentions are fisheries and mineralgjødsel — excluded by rule 7. |
| Elavgift | not-applicable | p. 18, p. 24 (full energy chapter) | Term occurs 0 times; the electricity measure is a price cap, not a duty. |
| Flypassasjeravgift | not-applicable | p. 18, p. 26 (samferdsel) | "flypassasjer" occurs 0 times. |
| Studiestøtte / basisstøtte / stipendandel | not-applicable | pp. 10–11 (skole), pp. 28–29, p. 7 | All four search terms occur 0 times; higher education is not a chapter in this budget document. |
| Arbeidsgiveravgift | no-change | p. 17 | Single occurrence is a criticism of the government's increase; no KrF proposal stated. |

## D. Extraction notes
- **Location of the party's main tax/duty table(s): none exists in the extractable text.** The manifest hint (page 18) points at the *prose* duty section, not a table. The tax/duty content is prose on pages 17 ("Verdiskaping og skatt" — formuesskatt, verdsettelse, arbeidsfradrag) and 18 (moms på elbil, alkohol, tobakk, brus/sukker, CO2-avgift, aggregate relief). The aggregate is in the "Nøkkeltall" box on page 3.
- **The numeric annex did not survive extraction.** Page 34 carries the section title "Budsjettet i tall"; pages 35–46 each contain only their own page number (2 non-whitespace characters). Pages 12, 19, 20 and 33 are the same. That is 12 annex pages of tables — almost certainly where the per-measure duty lines and proveny figures live — unavailable from this source file. Any re-run should re-extract the PDF with a table-aware mode before trusting the `NOT FOUND` verdicts in section A.
- Ambiguities:
  1. **Barnetrygd is a single undifferentiated figure.** "økning av barnetrygden til 2 250 kroner i måneden" (p. 9) gives no age band, no utvidet-barnetrygd treatment and no baseline, so the three components of `benefit.childBenefit` cannot be separated.
  2. **The two aggregate tax figures do not match.** Page 3's Nøkkeltall row reads "Skatter og avgifter −3124,0" (anchor `3124,0`, in mill. kroner per the footnote `* i mill. kroner`), while page 18 states "en påløpt lettelse på om lag 2 mrd. kroner sammenliknet med regjeringens forslag" (anchor `påløpt lettelse på om lag 2 mrd. kroner`). The document never labels the page-3 figure as bokført, so the two cannot be reconciled from this text.
  3. **"Arbeidsfradrag" vs "skattefradrag" for young people.** p. 17 calls it "et arbeidsfradrag for alle unge på maksimalt 100 000 kroner"; p. 7 calls the same measure "et skattefradrag for alle unge på 100 000 kroner". Whether it is a deduction in income or a credit against tax, and what "unge" means, is not resolved — which determines whether it belongs to `income.personalAllowance` or nowhere.
  4. **The 8 mill. kroner housing threshold** has no stated resulting verdsettelse rate and no statement of whether it bites on the whole value or the excess.
- Process observations:
  - The manifest's page hint was accurate as a *chapter* pointer but misleading as a *table* pointer; the real numbers annex is pages 35–46 and is blank. A manifest field recording extracted-characters-per-page would have caught this before extraction started.
  - `pdftotext -layout` merged this document's two-column prose line-by-line, so a single output line often splices unrelated left- and right-column text (e.g. p. 9 line 2 carries both "økning av barnetrygden til" and "og 32 000 kroner for en"). Anchors must be grep-verified rather than eyeballed, and any anchor longer than a few words risks crossing a column boundary.
