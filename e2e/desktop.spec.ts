import { test } from '@playwright/test';
import { expectAxeClean } from './axe.ts';
import { fillProfileAndSubmit } from './fill-profile.ts';
import { STATIC_ROUTES } from './routes.ts';

/** Desktop-width smoke pass — same routes, axe only (no scroll assertion). */
test.use({ viewport: { width: 1280, height: 900 } });

test.describe('1280px — static routes', () => {
  for (const route of STATIC_ROUTES) {
    test(`${route}: axe clean`, async ({ page }) => {
      await page.goto(route);
      await expectAxeClean(page);
    });
  }
});

test.describe('1280px — /resultat', () => {
  test('after filling the form: axe clean', async ({ page }) => {
    await fillProfileAndSubmit(page);
    await expectAxeClean(page);
  });
});
