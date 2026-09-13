import { describe, expect, it } from 'vitest';
import {
  add,
  bp,
  kr,
  krPerUnit,
  mulBp,
  netOfGross,
  pct,
  roundHalfAway,
  sanitizeKroner,
  sanitizeUnits,
  shareOfGross,
  sub,
  sum,
  unitsTimesRate,
} from './money.ts';

describe('money', () => {
  it('rounds half away from zero on both sides', () => {
    expect(roundHalfAway(2.5)).toBe(3);
    expect(roundHalfAway(-2.5)).toBe(-3);
    expect(roundHalfAway(2.4999)).toBe(2);
    expect(roundHalfAway(-0.5)).toBe(-1);
    expect(roundHalfAway(0)).toBe(0);
  });

  it('rejects non-integers at construction', () => {
    expect(() => kr(1.5)).toThrow(RangeError);
    expect(() => kr(Number.NaN)).toThrow(RangeError);
    expect(() => bp(0.1)).toThrow(RangeError);
    expect(kr(500_000)).toBe(500_000);
  });

  it('converts percent and kr/unit exactly', () => {
    expect(pct(22)).toBe(2200);
    expect(pct(7.7)).toBe(770);
    expect(pct(13.7)).toBe(1370);
    expect(krPerUnit(3.53)).toBe(35_300);
    expect(krPerUnit(0.1669)).toBe(1_669);
  });

  it('multiplies by basis points with a single rounding', () => {
    expect(mulBp(kr(100_000), pct(22))).toBe(22_000);
    expect(mulBp(kr(123_456), pct(7.7))).toBe(9_506); // 9506.112
    expect(mulBp(kr(1), pct(50))).toBe(1); // 0.5 → 1
  });

  it('splits gross amounts into base and tax consistently', () => {
    const gross = kr(125_000);
    const rate = pct(25);
    expect(shareOfGross(gross, rate)).toBe(25_000);
    expect(netOfGross(gross, rate)).toBe(100_000);
    expect(add(netOfGross(gross, rate), shareOfGross(gross, rate))).toBe(gross);
  });

  it('computes excise from units and øre', () => {
    expect(unitsTimesRate(1000, krPerUnit(3.53))).toBe(3_530);
    expect(unitsTimesRate(15_000, krPerUnit(0.1669))).toBe(2_504); // 2503.5 → 2504 (half away from zero)
    expect(() => unitsTimesRate(-1, krPerUnit(1))).toThrow(RangeError);
  });

  it('sanitises untrusted input', () => {
    expect(sanitizeKroner('abc')).toBe(0);
    expect(sanitizeKroner(-5)).toBe(0);
    expect(sanitizeKroner(Number.POSITIVE_INFINITY)).toBe(0);
    expect(sanitizeKroner('  650000 ')).toBe(650_000);
    expect(sanitizeKroner(1e15)).toBe(1_000_000_000_000);
    expect(sanitizeKroner(12.6)).toBe(13);
    expect(sanitizeUnits(Number.NaN, 3)).toBe(3);
  });

  it('sums and subtracts without drift', () => {
    expect(sum([kr(1), kr(2), kr(3)])).toBe(6);
    expect(sub(kr(10), kr(25))).toBe(-15);
  });
});
