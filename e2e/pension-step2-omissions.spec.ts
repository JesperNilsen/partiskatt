import { expect, test } from '@playwright/test';
import { expectAxeClean, expectNoHorizontalScroll } from './axe.ts';
import { submitCalculator } from './fill-profile.ts';

/** Pension 500 000 kr is above trinn 2 (437 100 kr); the credit amount itself is asserted in pension-tax-credit.test.ts. */

test.use({ viewport: { width: 375, height: 812 } });

test.describe('375px — pension above trinn 2, and the omission caveats', () => {
  test('pension caveats appear, no scroll, axe clean', async ({ page }) => {
    await page.goto('/');
    await page.locator('#pension-0').fill('500000');
    await submitCalculator(page);

    await expect(page.getByRole('heading', { name: 'Alle ni partier' })).toBeVisible();

    const omissions = page.getByRole('region', { name: 'Dette er ikke med i tallene' });
    await expect(omissions).toBeVisible();
    await expect(omissions).toContainText('Gradert uttak av pensjon');
    await expect(omissions).toContainText('Skattebegrensning for pensjonister');
    await expect(omissions).not.toContainText('Studiemåneder');
    await expectNoHorizontalScroll(page);
    await expectAxeClean(page);
  });

  test('a wage-only household is not shown the pension caveats', async ({ page }) => {
    await page.goto('/');
    await page.locator('#wage-0').fill('550000');
    await submitCalculator(page);
    const omissions = page.getByRole('region', { name: 'Dette er ikke med i tallene' });
    await expect(omissions).toContainText('Offentlige tjenester');
    await expect(omissions).not.toContainText('Gradert uttak av pensjon');
    await expectNoHorizontalScroll(page);
    await expectAxeClean(page);
  });
});
