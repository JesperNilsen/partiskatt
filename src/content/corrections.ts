import correctionsMd from '../../CORRECTIONS.md?raw';

export interface CorrectionEntry {
  date: string;
  whatWasWrong: string;
  whatChanged: string;
  verification: string;
}

/** Parse the public corrections table in CORRECTIONS.md (newest first). */
export function parseCorrections(markdown: string): CorrectionEntry[] {
  const rows: CorrectionEntry[] = [];

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || trimmed.includes('---')) continue;
    const cells = trimmed
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells.length < 4) continue;
    const date = cells[0];
    const whatWasWrong = cells[1];
    const whatChanged = cells[2];
    const verification = cells[3];
    if (!date || !whatWasWrong || whatChanged === undefined || verification === undefined) continue;
    if (date === 'Dato') continue;
    if (date === '—' || date === '-' || whatWasWrong.toLowerCase().includes('ingen rettelser')) continue;
    rows.push({
      date,
      whatWasWrong,
      whatChanged,
      verification,
    });
  }

  return rows;
}

export const CORRECTIONS = parseCorrections(correctionsMd);
