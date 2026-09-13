import { kr, krPerUnit, pct } from '../../../engine/money.ts';
import type { AnyRule, BaselineRuleSet, DataStatus, FormulaId, Provenance, Rule } from '../../../types/index.ts';
import { ADOPTED_2026 } from './adopted.ts';

const P = 'prop1ls-2025-2026';
const P_URL = 'https://www.regjeringen.no/no/dokumenter/prop.-1-ls-20252026/id3124192';
const I2S = 'innst-2-s-2025-2026';
const I2S_URL = 'https://www.stortinget.no/globalassets/pdf/innstillinger/stortinget/2025-2026/inns-202526-002s.pdf';

const STATUS: DataStatus = 'estimated';

function prov(
  sourceId: string,
  sourceUrl: string,
  pageOrTable: string,
  anchor: string,
  method: string,
  effectiveDate = '2026-01-01',
  confidence: Provenance['confidence'] = 'high',
): Provenance {
  return {
    sourceId,
    sourceUrl,
    pageOrTable,
    anchor,
    method,
    confidence,
    lastChecked: '2026-09-13',
    effectiveDate,
  };
}

function patch<F extends FormulaId>(rules: readonly AnyRule[], next: Rule<F>): AnyRule[] {
  return rules.map((r) => (r.id === next.id ? (next as AnyRule) : r));
}

/** Regjeringens forslag Prop. 1 LS Tabell 1.7/1.8 (før budsjettforlik). */
export const PROPOSED_2026: BaselineRuleSet = {
  id: 'proposed',
  year: 2026,
  rules: patchRules(ADOPTED_2026.rules),
};

function patchRules(rules: readonly AnyRule[]): AnyRule[] {
  let out = [...rules];

  out = patch(out, {
    id: 'income.bracketTax',
    params: {
      brackets: [
        { threshold: kr(226_100), rateBp: pct(1.7) },
        { threshold: kr(318_300), rateBp: pct(4) },
        { threshold: kr(725_050), rateBp: pct(13.7) },
        { threshold: kr(980_100), rateBp: pct(16.7) },
        { threshold: kr(1_467_200), rateBp: pct(17.7) },
      ],
    },
    status: STATUS,
    uncertain: false,
    label: 'Trinnskatt fem trinn (Prop. 1 LS Tabell 1.7)',
    provenance: prov(
      P,
      P_URL,
      'Tabell 1.7 PDF p33 / printed 31',
      '980 100 kr / 16,7 pst',
      'Terskler og satser trinn 1–5 fra Prop. 1 LS Tabell 1.7 (før forlik hevet trinn 4–5 med 0,1 pst).',
    ),
  });

  out = patch(out, {
    id: 'income.personalAllowance',
    params: { amount: kr(114_210) },
    status: STATUS,
    uncertain: false,
    label: 'Personfradrag 114 210 kr',
    provenance: prov(
      P,
      P_URL,
      'Tabell 1.7 PDF p34 / printed 32',
      '114 210 kr',
      'Prop. 1 LS personfradrag før forlik (+330 kr i vedtatt).',
    ),
  });

  out = patch(out, {
    id: 'wealth.valuation',
    params: {
      primaryHomeBp: pct(25),
      primaryHomeHighValueThreshold: kr(10_000_000),
      primaryHomeHighValueBp: pct(70),
      secondaryHomeBp: pct(100),
      listedSharesBp: pct(80),
      bankDepositsBp: pct(100),
      otherBp: pct(70),
      debtReductionApplies: { secondaryHome: false, listedShares: true, other: true },
    },
    status: STATUS,
    uncertain: false,
    label: 'Verdsettelsesrabatter formue (Prop. 1 LS; primærbolig 10 mill.)',
    provenance: prov(
      P,
      P_URL,
      'Tabell 1.7 PDF p36 footnote 16 / printed 34–35',
      '70 pst over 10 mill. kr',
      'Prop. 1 LS footnote: 70 pst for del av omsetningsverdi over 10 mill. kr. Vedtatt skatteloven §4-10 sier 14 mill. (junilov 2026 — ikke forlik).',
      '2026-01-01',
      'medium',
    ),
    note: 'Adopted ≠ proposed her uten at forliket endret terskelen — se NON_FORLIK_BASELINE_DIFFS.',
  });

  out = patch(out, {
    id: 'excise.petrolLitre',
    params: { ratePerUnit: krPerUnit(8.05) },
    status: STATUS,
    uncertain: false,
    label: 'Veibruks- og CO2-avgift bensin 8,05 kr/l',
    provenance: prov(
      P,
      P_URL,
      'Tabell 1.8 PDF p40 / printed 38',
      '4,25 kr/l',
      'Veibruk 4,25 kr/l (Tabell 1.8) + CO2 bensin 3,80 kr/l (PDF p41) = 8,05 kr/l. Forlik reduserte veibruk til 3,77.',
    ),
  });

  out = patch(out, {
    id: 'excise.dieselLitre',
    params: { ratePerUnit: krPerUnit(7.42) },
    status: STATUS,
    uncertain: false,
    label: 'Veibruks- og CO2-avgift diesel 7,42 kr/l',
    provenance: prov(
      P,
      P_URL,
      'Tabell 1.8 PDF p40 / printed 38',
      '3,00 kr/l',
      'Veibruk mineralolje 3,00 kr/l + CO2 4,42 kr/l = 7,42 kr/l. Forlik reduserte veibruk til 2,28.',
    ),
  });

  out = patch(out, {
    id: 'excise.kwh',
    params: { ratePerUnit: krPerUnit(0.0418) },
    status: STATUS,
    uncertain: false,
    label: 'Elavgift 4,18 øre/kWh',
    provenance: prov(
      P,
      P_URL,
      'Tabell 1.8 PDF p41 / printed 39',
      '4,18 øre/kWh',
      'Prop. 1 LS foreslått kutt til 4,18 øre/kWh. Forlik reduserte kuttet (vedtatt 7,13 øre).',
    ),
  });

  out = patch(out, {
    id: 'benefit.childBenefit',
    params: {
      under6PerMonth: kr(1_968),
      from6PerMonth: kr(1_968),
      ageCutoff: 6,
      extendedSingleParentPerMonth: kr(2_516),
    },
    status: STATUS,
    uncertain: false,
    label: 'Barnetrygd 1 968 kr/mnd (nominell videreføring)',
    provenance: prov(
      I2S,
      I2S_URL,
      'PDF p20 / printed 16',
      'videreføre flere ordninger nominelt',
      'Prop. 1 LS har ikke egen barnetrygdsats; regjeringen foreslo nominell videreføring. Sats 1 968 kr/mnd gjaldt 1.10.2025–31.1.2026 (nav-barnetrygd-2026). Forlik prisjusterte til 2 012 kr/mnd fra 1.2.2026.',
      '2026-01-01',
      'medium',
    ),
    note: 'Proposed-sats er antagelse — «nominelt» kan tolkes annerledes. Utvidet enslig 2 516 kr/mnd til 31.1.2026 (nav-utvidet-barnetrygd-2026).',
  });

  return out;
}
