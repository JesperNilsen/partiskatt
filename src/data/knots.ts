import type { FormulaId, PartyId } from '../types/index.ts';

/** Four extraction knots carried from S6 — still flagged after reconciliation. */
export interface KnownKnot {
  readonly id: string;
  readonly title: string;
  readonly formulaId: FormulaId;
  readonly parties: readonly PartyId[];
  /** Whether S7 encoded a delta for this knot (may still carry flags). */
  readonly encoded: boolean;
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
    title: 'KrF tax appendix empty in pdftotext output',
    formulaId: 'income.generalRate',
    parties: ['krf'],
    encoded: false,
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
