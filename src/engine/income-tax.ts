import type { Adult, Component, Kroner } from '../types/index.ts';
import { makeComponent } from './formulas.ts';
import { ZERO, add, max0, maxK, minK, mulBp, sub } from './money.ts';
import type { ResolvedRuleSet } from './rule-set.ts';
import { paramsOf } from './rule-set.ts';

export interface MinimumDeduction {
  wagePart: Kroner;
  pensionPart: Kroner;
  total: Kroner;
}

/**
 * Minstefradrag (sktl. § 6-32): rate × income, floored at the lower limit, capped at the
 * upper limit and at the income itself. With both wage and pension the deduction is the
 * larger of the wage deduction alone and the sum of both capped at the wage ceiling.
 */
export function minimumDeduction(wage: Kroner, pension: Kroner, rs: ResolvedRuleSet): MinimumDeduction {
  const w = paramsOf(rs, 'income.minimumDeductionWage');
  const p = paramsOf(rs, 'income.minimumDeductionPension');
  const wagePart = wage > 0 ? minK(wage, minK(w.max, maxK(w.min, mulBp(wage, w.rateBp)))) : ZERO;
  const pensionPart = pension > 0 ? minK(pension, minK(p.max, maxK(p.min, mulBp(pension, p.rateBp)))) : ZERO;
  let total: Kroner;
  if (wage > 0 && pension > 0) {
    total = maxK(wagePart, minK(add(wagePart, pensionPart), w.max));
  } else {
    total = add(wagePart, pensionPart);
  }
  return { wagePart, pensionPart, total };
}

export interface BracketTax {
  amount: Kroner;
  perBracket: Record<string, number>;
}

/** Trinnskatt: each bracket's rate applies to personal income between its threshold and the next. */
export function bracketTax(personalIncome: Kroner, rs: ResolvedRuleSet): BracketTax {
  const { brackets } = paramsOf(rs, 'income.bracketTax');
  const sorted = [...brackets].sort((a, b) => a.threshold - b.threshold);
  let amount = ZERO;
  const perBracket: Record<string, number> = {};
  sorted.forEach((bracket, i) => {
    const next = sorted[i + 1];
    const upper = next ? minK(personalIncome, next.threshold) : personalIncome;
    const base = max0(sub(upper, bracket.threshold));
    const tax = mulBp(base, bracket.rateBp);
    perBracket[`trinn${i + 1}Grunnlag`] = base;
    perBracket[`trinn${i + 1}Skatt`] = tax;
    amount = add(amount, tax);
  });
  return { amount, perBracket };
}

export interface SocialSecurity {
  amount: Kroner;
  full: Kroner;
  cap: Kroner;
}

/**
 * Trygdeavgift (ftrl. § 23-3): wage rate on wages, pension rate on pensions, but never more
 * than the phase-in rate applied to personal income above the lower threshold.
 */
export function socialSecurity(wage: Kroner, pension: Kroner, rs: ResolvedRuleSet): SocialSecurity {
  const p = paramsOf(rs, 'income.socialSecurity');
  const full = add(mulBp(wage, p.wageRateBp), mulBp(pension, p.pensionRateBp));
  const cap = mulBp(max0(sub(add(wage, pension), p.lowerThreshold)), p.phaseInRateBp);
  return { amount: minK(full, cap), full, cap };
}

export interface WorkTaxCredit {
  amount: Kroner;
  /** Tax the credit can be set off against: general-income tax + bracket tax + trygdeavgift. */
  cap: Kroner;
}

/**
 * Jobbfradrag as a flat skattefradrag (L14, antatt): `amountPerWorker` for an adult with wage income
 * above zero ("i arbeid" = has wage income; pension-only or no income gives nothing), never more
 * than that adult's income tax. The cap covers skatt på alminnelig inntekt, trinnskatt and
 * trygdeavgift — the same taxes the one existing personal skattefradrag (pensjonsinntekt, sktl.
 * § 16-1) is set off against — so the tax after the credit is never below zero.
 */
export function workTaxCredit(wage: Kroner, taxPayable: Kroner, rs: ResolvedRuleSet): WorkTaxCredit {
  const { amountPerWorker } = paramsOf(rs, 'income.workTaxCredit');
  const cap = max0(taxPayable);
  return { amount: wage > 0 ? minK(amountPerWorker, cap) : ZERO, cap };
}

export interface PensionTaxCredit {
  amount: Kroner;
  /** `max` after the two-step phase-out, before the cap. */
  phasedOut: Kroner;
  step1Reduction: Kroner;
  step2Reduction: Kroner;
  /** Tax left to set the credit off against: income taxes + trygdeavgift − jobbfradrag. */
  cap: Kroner;
}

/**
 * Skattefradrag for pensjonsinntekt (sktl. § 16-1). The phase-out runs on the adult's pension income
 * (§ 16-1 (3)): `rate1` of pension between trinn 1 and trinn 2, `rate2` of pension above trinn 2.
 * The credit is never more than «summen av fastsatte inntektsskatter og trygdeavgift» (§ 16-1 (6)),
 * i.e. skatt på alminnelig inntekt + trinnskatt + trygdeavgift of the whole adult, less any
 * jobbfradrag already set off against the same taxes. Only an adult with pension income gets it.
 *
 * Assumed, not modelled: the whole pension qualifies (alderspensjon/AFP, § 16-1 (1)), drawn for the
 * full year at 100 % uttak (§ 16-1 (2) would scale the credit and both limits down), and no
 * skattebegrensning (§ 17-1, which § 16-1 (4) lets win when it gives lower tax).
 */
export function pensionTaxCredit(
  pension: Kroner,
  taxPayable: Kroner,
  jobbfradrag: Kroner,
  rs: ResolvedRuleSet,
): PensionTaxCredit {
  const p = paramsOf(rs, 'income.pensionTaxCredit');
  const step1Reduction = mulBp(max0(sub(minK(pension, p.threshold2), p.threshold1)), p.rate1Bp);
  const step2Reduction = mulBp(max0(sub(pension, p.threshold2)), p.rate2Bp);
  const phasedOut = max0(sub(sub(p.max, step1Reduction), step2Reduction));
  const cap = max0(sub(taxPayable, jobbfradrag));
  return {
    amount: pension > 0 ? minK(phasedOut, cap) : ZERO,
    phasedOut,
    step1Reduction,
    step2Reduction,
    cap,
  };
}

/** The income-tax line items for one adult: three taxes, the jobbfradrag and the pension credit. */
export function computeIncomeTax(adult: Adult, adultIndex: number, rs: ResolvedRuleSet): Component[] {
  const wage = adult.wageIncome;
  const pension = adult.pensionIncome;
  const personalIncome = add(wage, pension);
  const md = minimumDeduction(wage, pension, rs);
  const unionDeduction = minK(adult.unionFee, paramsOf(rs, 'income.unionFeeDeduction').max);
  const allowance = paramsOf(rs, 'income.personalAllowance').amount;
  const ordinaryIncome = max0(
    sub(sub(sub(add(personalIncome, adult.capitalIncome), adult.interestExpense), md.total), unionDeduction),
  );
  const taxBase = max0(sub(ordinaryIncome, allowance));
  const generalRateBp = paramsOf(rs, 'income.generalRate').rateBp;
  const generalTax = mulBp(taxBase, generalRateBp);
  const bt = bracketTax(personalIncome, rs);
  const ss = socialSecurity(wage, pension, rs);
  const taxPayable = add(add(generalTax, bt.amount), ss.amount);
  const credit = workTaxCredit(wage, taxPayable, rs);
  const pensionCredit = pensionTaxCredit(pension, taxPayable, credit.amount, rs);
  return [
    makeComponent(
      rs,
      'income.generalRate',
      generalTax,
      {
        lonn: wage,
        pensjon: pension,
        kapitalinntekt: adult.capitalIncome,
        renteutgifter: adult.interestExpense,
        minstefradrag: md.total,
        fagforeningsfradrag: unionDeduction,
        alminneligInntekt: ordinaryIncome,
        personfradrag: allowance,
        grunnlag: taxBase,
        satsBp: generalRateBp,
      },
      adultIndex,
    ),
    makeComponent(rs, 'income.bracketTax', bt.amount, { personinntekt: personalIncome, ...bt.perBracket }, adultIndex),
    makeComponent(
      rs,
      'income.socialSecurity',
      ss.amount,
      { personinntekt: personalIncome, fullAvgift: ss.full, tak: ss.cap },
      adultIndex,
    ),
    makeComponent(
      rs,
      'income.workTaxCredit',
      credit.amount,
      {
        lonn: wage,
        belopPerArbeidstaker: paramsOf(rs, 'income.workTaxCredit').amountPerWorker,
        inntektsskattForFradrag: credit.cap,
      },
      adultIndex,
    ),
    makeComponent(
      rs,
      'income.pensionTaxCredit',
      pensionCredit.amount,
      {
        pensjon: pension,
        maksFradrag: paramsOf(rs, 'income.pensionTaxCredit').max,
        nedtrappingTrinn1: pensionCredit.step1Reduction,
        nedtrappingTrinn2: pensionCredit.step2Reduction,
        fradragEtterNedtrapping: pensionCredit.phasedOut,
        skattForFradrag: pensionCredit.cap,
      },
      adultIndex,
    ),
  ];
}
