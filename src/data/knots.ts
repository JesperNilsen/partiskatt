import type { FormulaId, PartyId } from '../types/index.ts';

/** Four extraction knots carried from S6 — still flagged after reconciliation. */
export interface KnownKnot {
  readonly id: string;
  readonly title: string;
  readonly formulaId: FormulaId;
  readonly parties: readonly PartyId[];
  /** Whether S7 encoded a delta for this knot (may still carry flags). */
  readonly encoded: boolean;
  /** Set when the knot is closed with evidence (mirrors `resolution` in scripts/reconcile.ts). */
  readonly resolved?: { readonly date: string; readonly summary: string };
}

export const KNOWN_KNOTS: readonly KnownKnot[] = [
  {
    id: 'K1-frikort-trygdeavgift',
    title: 'Frikortgrense 150 000 kr mapped onto trygdeavgift lower threshold',
    formulaId: 'income.socialSecurity',
    parties: ['h', 'frp', 'sv', 'r'],
    // Decided 2026-09-13: encoded as `estimated` (frikortgrense = nedre grense trygdeavgift).
    encoded: true,
  },
  {
    id: 'K2-krf-appendix-empty',
    title: 'KrF tax table is image-only (PDF p19); pp. 35–46 are spending tables',
    formulaId: 'income.generalRate',
    parties: ['krf'],
    // Nothing to encode for income.generalRate: KrF proposes no change to it.
    encoded: false,
    resolved: {
      date: '2026-09-26',
      summary:
        'Two independent vision reads of p19 «Skatter og avgifter» (sources/worksheets/krf.vision.md): no row for ' +
        'sats alminnelig inntekt, trinnskatt, personfradrag, minstefradrag or trygdeavgift, so those are no-change. ' +
        'Tobakksavgift +15 pst. is encoded (derived); the other p19 rows are unquantified with reasons in krf.ts.',
    },
  },
  {
    id: 'K3-venstre-elavgift-baseline',
    title: 'Venstre elavgift quoted against today’s rate, not Prop. 1 LS',
    formulaId: 'excise.kwh',
    parties: ['v'],
    encoded: true,
  },
  {
    id: 'K4-mdg-self-contradiction',
    title: 'MDG contradicts itself across pages on several tax lines',
    formulaId: 'income.personalAllowance',
    parties: ['mdg'],
    encoded: true,
  },
];
