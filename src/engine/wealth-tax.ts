import type { Component, Kroner, Wealth } from '../types/index.ts';
import { makeComponent } from './formulas.ts';
import { ZERO, add, max0, minK, mulBp, sub, sum, toKroner } from './money.ts';
import type { ResolvedRuleSet } from './rule-set.ts';
import { paramsOf } from './rule-set.ts';

/**
 * Formuesskatt for the household. Assets are valued at the rule set's discounts; debt is
 * allocated pro rata across gross asset values and the part allocated to a discounted class
 * is discounted at the same rate (sktl. § 4-19). Couples are assessed jointly with the
 * couple allowance and threshold.
 */
export function computeWealthTax(wealth: Wealth, adultCount: 1 | 2, rs: ResolvedRuleSet): Component {
  const v = paramsOf(rs, 'wealth.valuation');
  const t = paramsOf(rs, 'wealth.netWealthTax');

  const primaryLow = minK(wealth.primaryHomeValue, v.primaryHomeHighValueThreshold);
  const primaryHigh = max0(sub(wealth.primaryHomeValue, v.primaryHomeHighValueThreshold));
  const primaryTaxable = add(mulBp(primaryLow, v.primaryHomeBp), mulBp(primaryHigh, v.primaryHomeHighValueBp));
  const secondaryTaxable = mulBp(wealth.secondaryHomeValue, v.secondaryHomeBp);
  const sharesTaxable = mulBp(wealth.listedShares, v.listedSharesBp);
  const bankTaxable = mulBp(wealth.bankDeposits, v.bankDepositsBp);
  const otherTaxable = mulBp(wealth.otherTaxableWealth, v.otherBp);
  const taxableAssets = sum([primaryTaxable, secondaryTaxable, sharesTaxable, bankTaxable, otherTaxable]);

  const grossAssets = sum([
    wealth.primaryHomeValue,
    wealth.secondaryHomeValue,
    wealth.listedShares,
    wealth.bankDeposits,
    wealth.otherTaxableWealth,
  ]);
  let debtReduction = ZERO;
  if (grossAssets > 0 && wealth.debt > 0) {
    const classes: { value: Kroner; bp: number; applies: boolean }[] = [
      { value: wealth.secondaryHomeValue, bp: v.secondaryHomeBp, applies: v.debtReductionApplies.secondaryHome },
      { value: wealth.listedShares, bp: v.listedSharesBp, applies: v.debtReductionApplies.listedShares },
      { value: wealth.otherTaxableWealth, bp: v.otherBp, applies: v.debtReductionApplies.other },
    ];
    for (const c of classes) {
      if (!c.applies || c.value <= 0) continue;
      const allocated = toKroner((wealth.debt * c.value) / grossAssets);
      debtReduction = add(debtReduction, sub(allocated, toKroner((allocated * c.bp) / 10_000)));
    }
  }
  const deductibleDebt = max0(sub(wealth.debt, debtReduction));
  const netWealth = max0(sub(taxableAssets, deductibleDebt));

  const tier = adultCount === 2 ? t.couple : t.single;
  const tier1Base = minK(max0(sub(netWealth, tier.allowance)), max0(sub(tier.tier2Threshold, tier.allowance)));
  const tier2Base = max0(sub(netWealth, tier.tier2Threshold));
  const amount = add(mulBp(tier1Base, t.tier1RateBp), mulBp(tier2Base, t.tier2RateBp));

  return makeComponent(rs, 'wealth.netWealthTax', amount, {
    primaerboligVerdi: wealth.primaryHomeValue,
    primaerboligSkattepliktig: primaryTaxable,
    sekundaerboligSkattepliktig: secondaryTaxable,
    aksjerSkattepliktig: sharesTaxable,
    bankinnskuddSkattepliktig: bankTaxable,
    annenFormueSkattepliktig: otherTaxable,
    bruttoformue: grossAssets,
    skattepliktigFormue: taxableAssets,
    gjeld: wealth.debt,
    gjeldsreduksjon: debtReduction,
    fradragsberettigetGjeld: deductibleDebt,
    nettoformue: netWealth,
    bunnfradrag: tier.allowance,
    trinn1Grunnlag: tier1Base,
    trinn2Grunnlag: tier2Base,
    antallVoksne: adultCount,
  });
}
