import type { Component, Consumption } from '../types/index.ts';
import { EXCISE_GOODS, VAT_CATEGORIES } from '../types/index.ts';
import { VAT_ON_EXCISE, makeComponent } from './formulas.ts';
import { ZERO, add, mulBp, netOfGross, unitsTimesRate } from './money.ts';
import type { ResolvedRuleSet } from './rule-set.ts';
import { paramsOf } from './rule-set.ts';

/**
 * VAT and excise duties on the household's consumption.
 *
 * Spend is entered incl. VAT under the reference system, so the ex-VAT base is fixed by
 * the reference rate and each rule set's VAT is that base × its rate (100 % pass-through,
 * quantities held fixed). Excise = units × rate; the consumer also pays VAT on the duty,
 * which is attributed to the excise component so it is never counted twice.
 */
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
    const netBase = netOfGross(spend, refRateBp);
    out.push(
      makeComponent(rs, id, mulBp(netBase, rateBp), {
        forbrukInklMva: spend,
        referansesatsBp: refRateBp,
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
