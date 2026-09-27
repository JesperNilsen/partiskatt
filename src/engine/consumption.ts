import type { Component, Consumption, Kroner, VatCategory } from '../types/index.ts';
import { EXCISE_GOODS, VAT_CATEGORIES } from '../types/index.ts';
import { VAT_ON_EXCISE, makeComponent } from './formulas.ts';
import { ZERO, add, max0, mulBp, netOfGross, sub, unitsTimesRate } from './money.ts';
import type { ResolvedRuleSet } from './rule-set.ts';
import { paramsOf } from './rule-set.ts';

/**
 * VAT and excise duties on the household's consumption.
 *
 * Spend is entered incl. VAT under the reference system, so the ex-VAT base is fixed by
 * the reference rate and each rule set's VAT is that base × its rate (100 % pass-through,
 * quantities held fixed). Excise = units × rate; the consumer also pays VAT on the duty,
 * attributed to the excise component. But the reference-price spend the user typed already
 * has that duty baked in, so `netOfGross(spend, refRate)` still contains it — left alone, the
 * VAT category would tax the duty a second time. The reference excise for that category
 * (units × the REFERENCE rule set's ratePerUnit, since spend is in reference prices) is
 * subtracted back out, clamped at zero because `makeComponent` rejects a negative amount.
 */
function referenceExciseFor(cat: Exclude<VatCategory, 'exempt'>, consumption: Consumption, reference: ResolvedRuleSet): Kroner {
  let total = ZERO;
  for (const good of EXCISE_GOODS) {
    if (VAT_ON_EXCISE[good] !== cat) continue;
    const refRatePerUnit = paramsOf(reference, `excise.${good}`).ratePerUnit;
    total = add(total, unitsTimesRate(consumption.units[good], refRatePerUnit));
  }
  return total;
}

export function computeConsumptionTaxes(
  consumption: Consumption,
  rs: ResolvedRuleSet,
  reference: ResolvedRuleSet,
): Component[] {
  const out: Component[] = [];
  for (const cat of VAT_CATEGORIES) {
    if (cat === 'exempt') continue;
    const id = `vat.${cat}` as const;
    const refRateBp = paramsOf(reference, id).rateBp;
    const rateBp = paramsOf(rs, id).rateBp;
    const spend = consumption.spend[cat];
    const refExcise = referenceExciseFor(cat, consumption, reference);
    // Clamp: a household whose typed excise units imply more duty than its typed spend
    // covers (e.g. an unrealistically large petrol-litre override) would otherwise drive
    // this negative, which makeComponent throws on. Harmless — see consumption.test.ts.
    const netBase = max0(sub(netOfGross(spend, refRateBp), refExcise));
    out.push(
      makeComponent(rs, id, mulBp(netBase, rateBp), {
        forbrukInklMva: spend,
        referansesatsBp: refRateBp,
        referanseavgift: refExcise,
        grunnlagEksMva: netBase,
        satsBp: rateBp,
      }),
    );
  }
  for (const good of EXCISE_GOODS) {
    const id = `excise.${good}` as const;
    const ratePerUnit = paramsOf(rs, id).ratePerUnit;
    const units = consumption.units[good];
    const excise = unitsTimesRate(units, ratePerUnit);
    const vatCat = VAT_ON_EXCISE[good];
    const vatBp = vatCat === null ? 0 : paramsOf(rs, `vat.${vatCat}`).rateBp;
    const vatOnExcise = vatCat === null ? ZERO : mulBp(excise, paramsOf(rs, `vat.${vatCat}`).rateBp);
    out.push(
      makeComponent(rs, id, add(excise, vatOnExcise), {
        mengde: units,
        satsPerEnhet: ratePerUnit,
        avgift: excise,
        mvaPaaAvgiftBp: vatBp,
        mvaPaaAvgift: vatOnExcise,
      }),
    );
  }
  return out;
}
