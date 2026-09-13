import { describe, expect, it } from 'vitest';
import { BRAND } from '../config/brand.ts';

describe('scaffold', () => {
  it('has a brand seam', () => {
    expect(BRAND.name.length).toBeGreaterThan(0);
  });
});
