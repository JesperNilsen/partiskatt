# L11: the two weakest profile inputs (research log, 2026-09-26)

Sprint lane L11 checked two inputs to `src/data/consumption-profiles.ts` without assuming the answer (fail-closed):

- **(a)** Is FBU 2022 group 04.5.1 «Elektrisitet inkludert nettleie» recorded before or after strømstøtte?
- **(b)** Is there a source for the long-haul (outside Europe) share of flight spending, or for a long-haul ticket price?

**Outcome:**
- **(a)** is answered by SSB's own documentation, and the kWh seeds changed as a result.
- **(b)** is not settled by any source, so no flight number changed.

## (a) Strømstøtte and kWh

### What SSB says

The source is the statistics page «Energibruk i husholdningene» (the «Om statistikken» section, last updated 24 July 2025). It is archived as `ssb-energibruk-husholdningene-2022`, and the line numbers below refer to its text extract, `sources/text/ssb-energibruk-husholdningene-2022.txt`. That statistic is computed from the FBU 2022 sample itself: 3 507 households.

- **l. 408:** In 2022 the survey asked for electricity *expenses only*, and only for the last month.
- **l. 413:**
  - Electricity use for 2 813 households (80 %) comes from Elhub meter data.
  - For the rest, the self-reported cost for the last month is annualised with a consumption profile.
  - That cost is then divided by a weighted electricity price to get kWh.
  - The price is built from spot price plus fees and grid tariff, and SSB states: «mens strømstøtte er trukket i fra».
- **Reading:** SSB treats the FBU 2022 reported electricity cost as the amount *after* strømstøtte.

The following were searched and are silent on strømstøtte:

- the FBU documentation note (Notater 2024/46, «Forbruksundersøkelsen 2022, Dokumentasjonsnotat»);
- the FBU «Om statistikken» page;
- the 14100 table metadata and notes (PxWebApi v2 `/tables/14100/metadata`: one note, about the (T)/(IV)/(HV)/(V) suffixes).

The questionnaire in the note (Appendix C) asks: «Hvor store utgifter har du/dere hatt til strøm og nettleie siste måned?» It gives separate fields for nettleie, strøm, or both combined, and it has no instruction about strømstøtte. If the support shows up as a deduction on the bill, a household answering from its bill reports the net amount, which would match SSB's own conversion. That billing detail is not in any archived source.

No SSB text addresses the *aggregate* 04.5.1 figure in table 14100 directly. The statement above covers the survey answers that 04.5.1 is built from.

### Why the old choice is replaced rather than flipped

| Derivation | kWh per household |
|---|---|
| 32 173 kr (14100, 04.5.1) ÷ 2,353 kr (09007, before support), the old method | 13 673 |
| 32 173 kr ÷ 1,439 kr (09007, after support), the literal flip | 22 358 |
| **SSB-measured, same FBU 2022 sample (10572, Elektrisitet, Forbruk, 2022)** | **14 964** |

The literal flip would be 49 % above what SSB measures for the same households. The implied price 32 173 ÷ 14 964 = 2,150 kr/kWh sits between the before-support and after-support prices.

SSB's own FBU-sample average after support is 157 øre/kWh. Source: the article «Vi bruker mindre energi», https://www.ssb.no/energi-og-industri/energi/statistikk/energibruk-i-husholdningene/artikler/vi-bruker-mindre-energi (not archived; context only).

No archived source explains the gap. Candidate explanations: 04.5.1 may include cabin electricity, the annualisation profile, or sample composition.

So neither price turns the kroner into kWh reliably. The kWh seeds now use the measured figure directly:

- `KWH_PER_HOUSEHOLD_2022 = 14 964`, from `ssb-10572-energibruk-husholdninger-2022`.
- Cell: Energibaerer `1.1` Elektrisitet × ContentsCode `Forbruk` × Tid `2022`.

### Quartiles (assumption, stated)

Table 10572 has no income breakdown. The electricity kroner in `spend.electricity` already scale by 04.5 «Elektrisitet og brensel» per quartile in 14156, because 14156 has no 04.5.1. The kWh seeds use the same scaling:

`kWh_seed = round(14 964 × 04.5_quartile / 04.5_all / 1,4713)`

| Profile | 14156 04.5 (kr) | Calculation | Old seed | New seed |
|---|---|---|---|---|
| noktern (41) | 26 737 | 14 964 × 26 737 / 36 042 / 1,4713 = 7 544,84 | 6 894 | **7 545** |
| typisk (0) | 36 042 | 14 964 / 1,4713 = 10 170,60 | 9 293 | **10 171** |
| hoy (44) | 47 416 | 14 964 × 47 416 / 36 042 / 1,4713 = 13 380,20 | 12 226 | **13 380** |

`KWH_IS_ESTIMATED` was removed. The anchor is now a measured SSB figure, and the quartile spread uses the same kind of stated assumption as the tobacco and alcohol splits, which are not flagged either. `UNIT_PRICES_2022.kwh` (2,353, `ssb-09007`) was removed because no quantity is derived from it any more. The 09007 manifest row stays as it is; this lane does not own it, and its note still describes the old use.

### Known limitation

The 14 964 kWh excludes cabins (fritidsbolig). SSB's article «Hva er gjennomsnittlig strømforbruk i husholdningene» puts cabin use at about 1 000 kWh per household (2024). Elavgift applies to cabin electricity too, so the modelled elavgift errs low, not high.

## (b) Long-haul share and price

No number changed. `LONGHAUL_SPEND_SHARE` 0,2, `FLIGHT_PRICE_OTHER_2022` 7 500 kr and `FLIGHT_PRICE_EUROPE_2022` 1 500 kr stay ANSLAG with `sourceId: null`.

| Source (URL / query) | What it gives | Why it does not settle the share |
|---|---|---|
| SSB PxWebApi table search `query=reiser` (tables 10140, 06921, 04529/04491, 05717, 12899) | 10140: trips by trip *type* (city, sea, …), not region. 06921: trips by transport mode × domestic/abroad (2022, fly, summed K1–K4: 8,10 mill. trips, 3,27 domestic, 4,82 abroad). 04491/04529: spend by domestic/abroad. | Domestic/abroad only, the same wrong divide as Avinor. No destination × mode or spend × destination table. |
| SSB 12899 «Reiser til utvalgte land, de 30 mest besøkte», 2022 | 7 040 thousand trips abroad. High-rate countries visible: Tyrkia 147, USA 88, Japan 0. Thailand and India suppressed. «Andre land» 656. | All transport modes, not flight spend. 656 thousand trips are unallocated, so the long-haul share of trips is only bounded, roughly 3 %–13 %. |
| SSB article «Nordmenn satte reiserekord i 2022» | 24 % of trips went abroad and took 44 % of travel money. | No split within abroad. |
| SSB 08507 (Lufttransport, passasjerar etter lufthamn) | Domestic/international only. | Same divide as before. |
| Prop. 1 LS (2018–2019), ch. 13.18 Flypassasjeravgift, https://www.regjeringen.no/no/dokumenter/prop.-1-ls-20182019/id2613834/?ch=2 | Says «en svært liten andel av flyreisene fra norske flyplasser har en sluttdestinasjon utenfor Europa». The two-rate split (75/200 kr) was set revenue-neutral. | Against a flat rate of about 84 kr, 75/200 implies a high-rate share of (84 − 75)/(200 − 75) ≈ 7 % of *taxed departures*. That covers all passengers, including foreign residents and domestic legs, and is a departure count, not household spend. The 84 kr is from memory and was not verified against an archived source. |
| Sp alt. budget 2026 (`sources/text/sp-alt-2026.txt` l. 186) + Innst. 3 S kap. 5561 (1 900 mill.) | Cutting the low rate 61 → 50 kr costs 220 mill., which implies about 20 mill. low-rate departures and about 1,9 mill. high-rate departures (≈ 9 % of departures). | Derived arithmetic on a party's costing, for 2026 and all passengers. Not a household spend share. |
| Web searches: «flypassasjeravgift sluttdestinasjon utenfor Europa andel passasjerer», «Avinor passasjerer interkontinentale ruter andel utenfor Europa 2022», «SSB reiseundersøkelsen 2022 reiser utenfor Europa utgifter transport fly» | Avinor press releases say intercontinental traffic is small and growing slowly. TØI report 1873/2022 is listed but gives no destination-region spend split in the search results. | No figure. |
| Long-haul ticket price | SSB KPI publishes indices for air fares, not kroner. No official average long-haul fare was found. | No figure. |

**Cross-check, not a source.** The current constants imply this long-haul share of *departures* for the typical profile:

`(3 200 × 0,2 / 7 500) / (3 200 × 0,8 / 1 500 + 3 200 × 0,2 / 7 500) = 0,0853 / 1,792 ≈ 4,8 %`

That is the same order as the ≈ 7–9 % of all taxed departures implied by the budget documents. The population differs (all passengers vs. Norwegian households), so it is not evidence for 0,2 itself.
