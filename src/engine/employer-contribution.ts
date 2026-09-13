import type { Adult, Component } from '../types/index.ts';
import { makeComponent } from './formulas.ts';
import { add, max0, mulBp, sub } from './money.ts';
import type { ResolvedRuleSet } from './rule-set.ts';
import { paramsOf } from './rule-set.ts';

/** Arbeidsgiveravgift on one adult's wage: ordinary rate plus the extra rate above the threshold. */
export function computeEmployerContribution(adult: Adult, adultIndex: number, rs: ResolvedRuleSet): Component {
  const p = paramsOf(rs, 'employer.contribution');
  const ordinary = mulBp(adult.wageIncome, p.rateBp);
  const extraBase = max0(sub(adult.wageIncome, p.extraThreshold));
  const extra = mulBp(extraBase, p.extraRateBp);
  return makeComponent(
    rs,
    'employer.contribution',
    add(ordinary, extra),
    {
      lonn: adult.wageIncome,
      satsBp: p.rateBp,
      ordinaer: ordinary,
      ekstraGrunnlag: extraBase,
      ekstraSatsBp: p.extraRateBp,
      ekstra: extra,
    },
    adultIndex,
  );
}
