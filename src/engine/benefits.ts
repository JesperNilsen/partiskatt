import type { Component, UserProfile } from '../types/index.ts';
import { makeComponent } from './formulas.ts';
import { mulBp, toKroner } from './money.ts';
import type { ResolvedRuleSet } from './rule-set.ts';
import { paramsOf } from './rule-set.ts';

/** Cash benefits: barnetrygd for the household, studiestøtte (grant share) per adult. */
export function computeBenefits(profile: UserProfile, rs: ResolvedRuleSet): Component[] {
  const cb = paramsOf(rs, 'benefit.childBenefit');
  let under = 0;
  let from = 0;
  for (const age of profile.childrenAges) {
    if (age < cb.ageCutoff) under += 1;
    else from += 1;
  }
  const singleParent = profile.adults.length === 1 && profile.childrenAges.length > 0;
  const extended = singleParent ? cb.extendedSingleParentPerMonth : 0;
  const annual = toKroner(12 * (under * cb.under6PerMonth + from * cb.from6PerMonth + extended));
  const out: Component[] = [
    makeComponent(rs, 'benefit.childBenefit', annual, {
      barnUnderAldersgrense: under,
      barnOverAldersgrense: from,
      aldersgrense: cb.ageCutoff,
      satsUnderPerMnd: cb.under6PerMonth,
      satsOverPerMnd: cb.from6PerMonth,
      utvidetEnsligPerMnd: extended,
      maaneder: 12,
    }),
  ];
  const ss = paramsOf(rs, 'benefit.studentSupport');
  profile.adults.forEach((adult, i) => {
    const months = adult.isStudent ? adult.studyMonths : 0;
    const basic = toKroner(months * ss.basicSupportPerMonth);
    const grant = mulBp(basic, ss.grantShareBp);
    out.push(
      makeComponent(
        rs,
        'benefit.studentSupport',
        grant,
        {
          maaneder: months,
          basisstottePerMnd: ss.basicSupportPerMonth,
          basisstotte: basic,
          stipendandelBp: ss.grantShareBp,
        },
        i,
      ),
    );
  });
  return out;
}
