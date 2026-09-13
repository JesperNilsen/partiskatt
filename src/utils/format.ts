import { kr, perMonth } from '../engine/money.ts';
import type { Kroner } from '../types/index.ts';

const nb = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 });

/** Whole kroner with Norwegian grouping, no currency suffix. */
export function formatKr(amount: Kroner): string {
  return nb.format(amount);
}

/** Signed delta for headlines: +8 430 or −12 700. */
export function formatSignedKr(amount: Kroner): string {
  if (amount === 0) return '0';
  const sign = amount > 0 ? '+' : '−';
  return `${sign}${nb.format(Math.abs(amount))}`;
}

/** Plain-language headline for a party delta. */
export function headlinePhrase(amount: Kroner, partyShort: string): string {
  const amountKr = formatKr(kr(Math.abs(amount)));
  if (amount > 0) return `${partyShort} lar deg beholde ${amountKr} kroner mer i året.`;
  if (amount < 0) return `Skattesmellen: ${amountKr} kroner mindre igjen med ${partyShort}.`;
  return `${partyShort} gir samme resultat som referansen.`;
}

/** Monthly companion line. */
export function monthlyPhrase(amount: Kroner): string {
  const monthly = perMonth(amount);
  const monthlyKr = formatKr(kr(Math.abs(monthly)));
  if (amount > 0) return `Det tilsvarer ${monthlyKr} kroner mer per måned.`;
  if (amount < 0) return `Det tilsvarer ${monthlyKr} kroner mindre per måned.`;
  return 'Ingen månedlig forskjell.';
}
