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

/** The income-tax line items for one adult: three taxes and the jobbfradrag credit. */
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
  const credit = workTaxCredit(wage, add(add(generalTax, bt.amount), ss.amount), rs);
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
  ];
}
