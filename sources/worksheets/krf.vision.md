# KrF alternativt budsjett 2026: vision reads of the image-only pages (K2)

Source: `sources/raw/krf-alt-2026.pdf` (48 PDF pages, `pdfinfo`; printed page number = PDF page number).
Lane L10a, 2026-09-26. This file records the independent vision reads that closed knot
`K2-krf-appendix-empty`. It is an evidence archive, not an extraction sheet: `scripts/reconcile.ts`
does not read it.

## Why this was needed

`pdftotext` gives nothing but the page number for PDF pp. 12, 19, 20, 33 and 35–46: each is one
raster image with no text layer. The text-only extraction (2026-09-13) assumed the tax annex was
pp. 35–46. The images show otherwise:

- **p. 19 is KrF's full tax table**, «Skatter og avgifter». It is the only page anywhere in the
  document that itemises tax and duty changes.
- **pp. 35–46 («Budsjettet i tall», title page p. 34) are spending tables**, one per rammeområde
  (Dep | Kap | Post | Tiltak (tall i mill. kr) | Beløp). They contain no tax rate, bracket, threshold,
  allowance or duty rate.
- pp. 12, 20 and 33 are full-page photographs. p. 47 is blank; p. 48 is the back cover.

## Reads

| read | model | pages | independence |
|---|---|---|---|
| A | Opus (lane L10a) | 12, 19, 20, 33–48 | written before B or C was opened |
| B | Sonnet (dispatched by the orchestrator) | 35–46 and a text-layer sweep | did not see p. 19 (no text layer), so it has no p. 19 cells |
| C | Sonnet (dispatched by L10a) | 19 and 35 | had no access to A, B or any worksheet |

**Encoding rule:** a value may be encoded only if two reads agree on it. For p. 19 those reads are
A and C. For pp. 35–46 they are A and B, plus C for p. 35.

## p. 19 «Skatter og avgifter» (A and C agree on every cell)

Amounts are in mill. kr. Under «Skatter (negative tall er skattelettelser)» the columns are Bokført
and Påløpt. Under «Avgifter» only «Bokført» is printed as a header, but every row carries a second
value to its right, the same Bokført/Påløpt layout as the table above. A and C both read it that way.

| Kap | Post | Beskrivelse (as printed) | Bokført | Påløpt |
|---|---|---|---|---|
| 5501 | 70 | Formuesskatt: Boliger med verdi o. 8 mill. kr verdsettes med 100 pst. | 2065,0 | 2065,0 |
| 5501 | 72 | Går imot regjeringens forsøk m. arbeidsfradrag | 500,0 | 500,0 |
| 5501 | 70 | Redusert formuesskatt på arbeidende kapital: Redusert verdsettelse fra 80 til 60 pst. på aksjer og driftsmidler | -5400,0 | -5400,0 |
| 5501 | 72 | Arbeidsfradrag for unge (født 1991-2006) på 100 000 kr | -4000,0 | -4000,0 |
| 5501 | 72 | Øke og forenkle foreldrefradraget til 50 000 kroner per barn for barn 1 og 2 og 100 000 kroner for barn 3 og videre | -1300,0 | -5100,0 |
| 5501 | 72 | Øke skattefradrag for gaver til frivillighet fra 25 000 til 50 000 kr og 100 000 kr for næringsdrivende | 0,0 | -120,0 |
| 5501 | 74 | Stenge for bruk av flertrinnsmodellen ved omgjøring av eksisterende utleieleiligheter til borettslag | 0,0 | -700,0 |
| 5501 | 74 | Går imot regjeringens forslag til reduksjon av nedre grense i grunnrenteskatten for vannkraft | 0,0 | -800,0 |
| 5501 | 74 | Redusere effektiv sats i grunnrenteskatten på havbruk til 20 pst. | 0,0 | -800,0 |
| | | SUM Skatter | -8135,0 | -14355,0 |
| 5521 | 70 | Fjerne mva-fritaket for elbiler | 6 600,0 | 7 500,0 |
| 5526 | 70 | Alkoholavgift: Særavgiftsutvalgets (NOU 2007:8) forslag om 10 pst. økning i 2008, reell økning | 1 400,0 | 1 550,0 |
| 5526 | 70 | Alkoholavgift: Halvering av innførselskvoten | 950,0 | 1 050,0 |
| 5531 | 70 | Avgift på tobakksvarer, 15 pst. økning | 930,0 | 1 010,0 |
| 5555 | 70 | Avgift på sjokolade og sukkervarer, gjeninnføring, 2020-satser | 1500,0 | 1600,0 |
| 5556 | 70 | Avgift på sukkerholdige alkoholfrie drikkevarer, Solberg-regjeringens forslag RNB 2021 | 850,0 | 925,0 |
| 5543 | 70 | CO2-avgift, fritak for fiskeri | -960,0 | -1 100,0 |
| 5543 | 71 | CO2-avgift, veksthusnæringen, mindre økning enn regjeringens forslag | -11,0 | -12,0 |
| | | SUM Avgifter | 11259,0 | 12523,0 |
| | | SUM Skatt og avgift | 3124,0 | -1832,0 |

Both A and C recomputed every SUM row from the rows above it, and all of them reproduce exactly. The totals also
match the text layer: p. 3 prints «Skatter og avgifter -3124,0», which is the bokført total with the
sign flipped, and p. 18 says «påløpt lettelse på om lag 2 mrd. kroner», which matches the påløpt total of -1832,0.

**Disagreements on p. 19:** one glyph. In the kap 5543 post 70 label, A wrote «C02-avgift» (digit zero) and C
wrote «CO2-avgift». This does not affect any value and nothing is encoded from that row.

## pp. 35–46 (A and B agree on the page content: spending tables, no tax parameter)

| p. | tables (SUM as printed; A's read) |
|---|---|
| 35 | Rammeområde 1 Statsforvaltning (-110,0); 2 Familie og forbruker (3216,8) |
| 36 | 3 Kultur (-230,5) |
| 37 | 4 Utenriks (1690,3) |
| 38 | 5 Justis (661,8); 6 Innvandring, regional utvikling mv. (860,4) |
| 39 | 7 Arbeid og sosial (784,2) |
| 40 | 9 Næring (-3150,3) |
| 41 | 11 Landbruk (150,8); 12 Olje og energi (430,0) |
| 42 | 13 Miljø (-3625,0) |
| 43 | 15 Helse (1925,3) |
| 44 | 16 Kunnskap (1299,1) |
| 45 | 17 Samferdsel (-353,0); 18 Rammeoverføring til kommunesektoren (2849,5) |
| 46 | 19 Tilfeldige utgifter og inntekter (-3344,0); 20 Finansadministrasjon (-330,0); 21,22 Inntektsøkninger (-1355,0) |

Cells transcribed by more than one read:

| p. | label as printed | value | A | B | C |
|---|---|---|---|---|---|
| 35 | Økt barnetrygd til 2250 kr per mnd fra 1.3.2026 (BFD 845 70) | 3075,0 | ✓ | «2250 kr per mnd» (no row value) | ✓ |
| 35 | Kontantstøtte: 11 mnd. støtte og sats 10 000 kr fra 1.8.2026 (BFD 844 70) | 202,0 | ✓ | «sats 10 000 kr» | ✓ |
| 35 | Foreldrepenger på min. 3G for alle foreldre fra 1.7.2026 (BFD 2530 70) | 412,0 | ✓ | — | ✓ |
| 35 | SUM Rammeområde 2: Familie og forbruker | 3216,8 | ✓ | — | ✓ |
| 39 | Brillestøtte for barn. Sats 1 økes med 800 kr | 19,2 | ✓ | ✓ | — |
| 46 | Sektoravgift tobakk økes for å finansiere røykesluttprogram (HOD 5572 75) | -81,0 | ✓ | ✓ | — |
| 46 | Havindustritilsynet: Finansiere m. sektoravgift som Finanstilsynet (ED 5582 75) | -174,0 | ✓ | ✓ | — |
| 46 | Argentum, utbytte (NFD 5656 85) | -600,0 | ✓ | ✓ | — |
| 46 | Bane Nors driftskreditt avvikles (SD 5672 86) | -500,0 | ✓ | ✓ | — |
| 46 | SUM Rammeområde 21,22 Inntektsøkninger | -1355,0 | ✓ | ✓ | — |

No read disagrees on any value on pp. 35–46.

## What this settles for the model

| formula | outcome | basis |
|---|---|---|
| income.generalRate, income.bracketTax (trinn 1–5), income.personalAllowance, income.minimumDeductionWage/Pension, income.socialSecurity, income.unionFeeDeduction | **no-change**: KrF does not propose one | p. 19 itemises every KrF tax change and none touches these. The sums reproduce, so no row is hidden. |
| wealth.netWealthTax | no-change | there is no bunnfradrag or sats row on p. 19 |
| wealth.valuation | aksjer/driftsmidler 80 → 60 pst (already encoded, p. 17). The bolig row stays unquantified | «Boliger med verdi o. 8 mill. kr verdsettes med 100 pst.» does not say whether 100 pst applies to the whole value or only the part above 8 mill. |
| excise.cigarette, excise.snusGram | **derived** Prop. 1 LS × 1,15: 3,31 → 3,8065 kr/stk; 1,02 → 1,173 kr/g | «Avgift på tobakksvarer, 15 pst. økning» (kap 5531 post 70). The baseline is Prop. 1 LS Tabell 1.8 (PDF p. 38): Sigaretter 331 kr/100 stk, Snus 102 kr/100 gram |
| excise.beerLitre / wineLitre / spiritsLitre | unquantified | «NOU 2007:8 forslag om 10 pst. økning i 2008, reell økning» is not a rate against Prop. 1 LS: it points at a 2008 recommendation, and p. 18 says «til nivået anbefalt». |
| sugar and soft-drink duties | unquantified | no formula; the rates are referenced («2020-satser», «RNB 2021») but not printed |
| vat.* | no rate change | the EV exemption removal changes the base, not a rate |
| benefit.childBenefit | 2 250 kr/mnd (already encoded); effective **2026-03-01** | p. 35 BFD 845 70, A and C agree |
