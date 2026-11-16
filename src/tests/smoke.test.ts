import { readFileSync } from 'node:fs';
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

  it('is not searchable and links to the owner homepage', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
    const toml = readFileSync('netlify.toml', 'utf8');
    expect(toml.match(/X-Robots-Tag = "noindex, nofollow"/g)).toHaveLength(1);
    expect(toml.match(/for = "\/\*"/g)).toHaveLength(1);
    expect(BRAND.homepageUrl).toBe('https://jespernilsen.com/');
    expect(BRAND.homepageLabel).toBe('jespernilsen.com');
  });
});
