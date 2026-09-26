import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** WCAG 2 Level A + AA, across the 2.0/2.1/2.2 tag generations. */
export const WCAG2_A_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];

/**
 * Runs axe against the current page and asserts:
 *  - zero violations for the given tags;
 *  - at least one passing check ran, so a blank/broken page (nothing to
 *    check) cannot be reported as "clean" by omission.
 */
export async function expectAxeClean(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG2_A_AA_TAGS).analyze();
  expect(
    results.violations,
    formatViolations(results.violations),
  ).toEqual([]);
  expect(results.passes.length).toBeGreaterThan(0);
  return results;
}

function formatViolations(violations: { id: string; help: string; nodes: { target: string[] }[] }[]): string {
  if (violations.length === 0) return '';
  return violations
    .map((v) => `${v.id} (${v.help}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
    .join('\n');
}

/** Asserts the page does not overflow horizontally at the current viewport. */
export async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, `document.documentElement.scrollWidth (${scrollWidth}) > innerWidth (${innerWidth})`).toBeLessThanOrEqual(
    innerWidth,
  );
}
