import { describe, expect, it } from 'vitest';
import { buildDataStatusTable, classifyConsumptionTaxTitle } from './data-status.ts';

describe('classifyConsumptionTaxTitle', () => {
  it('classifies a title that only matches the Moms pattern', () => {
    expect(classifyConsumptionTaxTitle('frp', 'Halvere matmoms (virkning fra 1. april)')).toBe('Moms');
  });

  it('classifies a title that only matches the Særavgifter pattern', () => {
    expect(classifyConsumptionTaxTitle('h', 'Fjerne veibruksavgiften på diesel')).toBe('Særavgifter');
  });

  it('throws instead of silently dropping a title matching neither pattern', () => {
    // Neither "mva|moms|mat" nor "avgift|bensin|diesel|elavgift|fly|alkohol|tobakk"
    // appears here — this is the QUEUE.md Q-009 example proposal.
    expect(() => classifyConsumptionTaxTitle('sv', 'Fjerne CO2-kompensasjon')).toThrow(
      /INGEN av Moms- eller Særavgifter-mønsteret/,
    );
  });

  it('throws instead of silently double-counting a title matching both patterns', () => {
    // Contains "mat" (Moms pattern) and "avgift" (Særavgifter pattern) at once.
    const title = 'Avgift på matvarer';
    expect(() => classifyConsumptionTaxTitle('mdg', title)).toThrow(/BÅDE Moms- og Særavgifter-mønsteret/);
  });

  it('names the party and title in the thrown error, for both failure modes', () => {
    expect(() => classifyConsumptionTaxTitle('krf', 'Fjerne CO2-kompensasjon')).toThrow(
      /"krf".*Fjerne CO2-kompensasjon/,
    );
    expect(() => classifyConsumptionTaxTitle('v', 'Matmoms og alkoholavgift samtidig')).toThrow(
      /"v".*Matmoms og alkoholavgift samtidig/,
    );
  });
});

describe('buildDataStatusTable (real data regression guard)', () => {
  it('never throws for the real DATA_BUNDLE — every real consumption-tax title classifies exactly once', () => {
    // If a future edit adds an unquantified consumption-tax proposal whose
    // title matches zero or both patterns, this call throws and this test
    // goes red — that's the point (see Q-009).
    expect(() => buildDataStatusTable()).not.toThrow();
  });
});
