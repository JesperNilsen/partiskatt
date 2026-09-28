import { describe, expect, it } from 'vitest';
import { BRAND } from '../config/brand.ts';

describe('scaffold', () => {
  it('has a brand seam', () => {
    expect(BRAND.name.length).toBeGreaterThan(0);
  });

  it('carries launch values, not placeholders', () => {
    expect(BRAND.feedbackMailto).toMatch(/^mailto:[^@\s]+@[^@\s?]+\.[a-z]+(\?|$)/);
    expect(BRAND.feedbackMailto).not.toMatch(/example\.invalid/);
    expect(BRAND.repoUrl).toMatch(/^https:\/\/github\.com\/[^/]+\/[^/]+$/);
  });
});
