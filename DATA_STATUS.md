# Datastatus

> Denne filen genereres av `scripts/gen-data-status.ts` fra `src/data/`. Kjør `npm run data-status` for å oppdatere.

Statuser: `confirmed` (primærkilde, kontrollert) · `estimated` (rimelig anslag med dokumentert antagelse) · `unquantified` (forslaget finnes, men kan ikke tallfestes) · `not-applicable` (partiet har ikke forslag i kategorien / kategorien gjelder ikke) · `not-reviewed` (ikke gjennomgått / uttrekkene er uenige)

Generert: 2026-09-13

| Parti | Inntektsskatt | Formuesskatt | Moms | Særavgifter | Kontantytelser | Arbeidsgiveravgift |
|---|---|---|---|---|---|---|
| Ap | not-applicable | not-applicable | not-applicable | not-applicable | not-applicable | not-applicable |
| H | estimated | estimated | not-applicable | not-applicable | not-applicable | not-applicable |
| FrP | estimated | estimated | unquantified | not-applicable | not-reviewed | not-applicable |
| SV | estimated | not-reviewed | not-applicable | not-applicable | not-reviewed | not-applicable |
| Sp | unquantified | estimated | estimated | not-reviewed | not-reviewed | not-applicable |
| R | estimated | not-reviewed | not-applicable | not-applicable | unquantified | not-applicable |
| V | estimated | estimated | unquantified | estimated | not-reviewed | not-applicable |
| MDG | unquantified | not-reviewed | not-applicable | not-applicable | not-reviewed | not-applicable |
| KrF | not-reviewed | estimated | not-reviewed | not-reviewed | estimated | not-applicable |

## Encoded party deltas (S7)

- **Ap**: ingen deltas
- **H**: `income.socialSecurity`, `wealth.valuation`
- **FrP**: `income.socialSecurity`, `income.personalAllowance`, `wealth.valuation`
- **SV**: `income.socialSecurity`, `income.bracketTax`, `income.personalAllowance`, `income.minimumDeductionWage`, `income.minimumDeductionPension`
- **Sp**: `income.bracketTax`, `wealth.valuation`, `vat.food`
- **R**: `income.socialSecurity`, `income.bracketTax`, `income.personalAllowance`
- **V**: `income.socialSecurity`, `income.personalAllowance`, `wealth.valuation`, `excise.kwh`
- **MDG**: `income.personalAllowance`
- **KrF**: `wealth.valuation`, `benefit.childBenefit`
