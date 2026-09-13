import { describe, expect, it } from 'vitest';
import { parseCorrections } from './corrections.ts';

describe('parseCorrections', () => {
  it('returns empty array for placeholder table', () => {
    const md = `# Rettelseslogg

| Dato | Hva var feil | Hva ble endret | Kilde/verifikasjon |
|---|---|---|---|
| — | Ingen rettelser ennå | | |
`;
    expect(parseCorrections(md)).toEqual([]);
  });

  it('parses real rows newest-first', () => {
    const md = `
| Dato | Hva var feil | Hva ble endret | Kilde/verifikasjon |
|---|---|---|---|
| 2026-09-10 | Feil sats | Oppdatert regel | Skatteetaten |
| 2026-09-01 | Annen feil | Rettet | Intern test |
`;
    expect(parseCorrections(md)).toEqual([
      {
        date: '2026-09-10',
        whatWasWrong: 'Feil sats',
        whatChanged: 'Oppdatert regel',
        verification: 'Skatteetaten',
      },
      {
        date: '2026-09-01',
        whatWasWrong: 'Annen feil',
        whatChanged: 'Rettet',
        verification: 'Intern test',
      },
    ]);
  });
});
