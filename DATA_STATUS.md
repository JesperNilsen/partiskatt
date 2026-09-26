# Datastatus

> Denne filen genereres av `scripts/gen-data-status.ts` fra `src/data/`. Kjør `npm run data-status` for å oppdatere.

Statuser: `confirmed` (primærkilde, kontrollert) · `estimated` (rimelig anslag med dokumentert antagelse) · `unquantified` (forslaget finnes, men kan ikke tallfestes) · `not-applicable` (partiet har ikke forslag i kategorien / kategorien gjelder ikke) · `not-reviewed` (ikke gjennomgått / uttrekkene er uenige)

| Parti | Inntektsskatt | Formuesskatt | Moms | Særavgifter | Kontantytelser | Arbeidsgiveravgift |
|---|---|---|---|---|---|---|
| Ap | not-applicable | not-applicable | not-applicable | not-applicable | not-applicable | not-applicable |
| H | unquantified | estimated | unquantified | estimated | estimated | not-applicable |
| FrP | estimated | unquantified | estimated | estimated | unquantified | not-applicable |
| SV | unquantified | unquantified | not-applicable | unquantified | unquantified | not-applicable |
| Sp | unquantified | estimated | estimated | unquantified | unquantified | not-applicable |
| R | estimated | unquantified | unquantified | unquantified | unquantified | not-applicable |
| V | estimated | estimated | unquantified | unquantified | unquantified | not-applicable |
| MDG | estimated | unquantified | unquantified | unquantified | unquantified | not-applicable |
| KrF | unquantified | unquantified | unquantified | unquantified | estimated | not-applicable |

## Encoded party deltas (S7)

- **Ap**: ingen deltas
- **H**: `income.socialSecurity`, `wealth.netWealthTax`, `wealth.valuation`, `excise.cigarette`, `benefit.childBenefit`
- **FrP**: `income.socialSecurity`, `income.bracketTax`, `income.personalAllowance`, `income.unionFeeDeduction`, `wealth.netWealthTax`, `wealth.valuation`, `vat.food`, `excise.petrolLitre`, `excise.dieselLitre`
- **SV**: `income.socialSecurity`, `income.bracketTax`, `income.personalAllowance`, `income.minimumDeductionWage`, `income.minimumDeductionPension`, `wealth.netWealthTax`, `wealth.valuation`, `excise.petrolLitre`, `excise.dieselLitre`, `excise.flightEurope`, `excise.flightOther`, `benefit.childBenefit`, `benefit.studentSupport`
- **Sp**: `income.bracketTax`, `income.socialSecurity`, `wealth.netWealthTax`, `wealth.valuation`, `vat.food`, `excise.flightEurope`
- **R**: `income.socialSecurity`, `income.bracketTax`, `income.personalAllowance`, `wealth.netWealthTax`, `wealth.valuation`, `benefit.childBenefit`, `benefit.studentSupport`
- **V**: `income.socialSecurity`, `income.personalAllowance`, `wealth.netWealthTax`, `wealth.valuation`, `excise.kwh`, `excise.cigarette`
- **MDG**: `income.personalAllowance`, `income.socialSecurity`, `wealth.netWealthTax`, `excise.petrolLitre`, `excise.dieselLitre`
- **KrF**: `wealth.valuation`, `benefit.childBenefit`, `excise.cigarette`, `excise.snusGram`
