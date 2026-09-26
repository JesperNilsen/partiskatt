import { expect, test } from '@playwright/test';
import { expectAxeClean, expectNoHorizontalScroll } from './axe.ts';
import { fillProfileAndSubmit } from './fill-profile.ts';
import { STATIC_ROUTES } from './routes.ts';

test.use({ viewport: { width: 375, height: 812 } });

test.describe('375px — static routes', () => {
  for (const route of STATIC_ROUTES) {
    test(`${route}: no horizontal scroll + axe clean`, async ({ page }) => {
      await page.goto(route);
      await expectNoHorizontalScroll(page);
      await expectAxeClean(page);
    });
  }
});

test.describe('375px — /resultat', () => {
  test('redirects to / when the profile is empty, and lands on the calculator', async ({ page }) => {
    await page.goto('/resultat');
    await page.waitForURL((url) => url.pathname === '/');
    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Hvor mye mer eller mindre sitter du igjen med?' })).toBeVisible();
  });

  test('after filling the form: correct URL, heading, no scroll, axe clean', async ({ page }) => {
    await fillProfileAndSubmit(page);
    expect(new URL(page.url()).pathname).toBe('/resultat');
    await expect(page.getByRole('heading', { name: 'Alle ni partier' })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAxeClean(page);
  });

  test('with a party card expanded: no scroll, axe clean', async ({ page }) => {
    await fillProfileAndSubmit(page);
    // Skip the reference party (Ap) — it has zero applied rules by
    // construction (see MethodView) and would leave the rule-list empty.
    const card = page.locator('.party-card:not(:has(.party-card__ref-note))').first();
    const toggle = card.locator('.party-card__toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // The expanded card's rule-provenance rows (added by L5) should be present.
    await expect(card.locator('.rule-row').first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectAxeClean(page);
  });
});
