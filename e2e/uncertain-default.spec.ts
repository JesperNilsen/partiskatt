import { expect, test } from '@playwright/test';
import { expectAxeClean, expectNoHorizontalScroll } from './axe.ts';
import { submitCalculator } from './fill-profile.ts';

/**
 * 2026-11-16: uncertain proposals count by default, the results page carries the switch, and the
 * coverage label counts everything left out.
 */

test.use({ viewport: { width: 375, height: 812 } });

test.describe('375px — uncertain proposals on the results page', () => {
  test('650 000 kr wage: H includes the jobbfradrag by default; switching it off changes the card', async ({ page }) => {
    await page.goto('/');
    await page.locator('#wage-0').fill('650000');
    await submitCalculator(page);
    await expect(page.getByRole('heading', { name: 'Alle ni partier' })).toBeVisible();

    const h = page.locator('.party-card').filter({ hasText: 'Høyre (H)' });
    const toggle = page.getByLabel(/Regn med usikre forslag/);
    await expect(toggle).toBeChecked();
    await expect(h.locator('.party-card__headline')).toContainText('+');
    await expect(h.locator('.party-card__uncertain')).toContainText('fra usikre forslag');
    await expect(h.locator('.party-card__coverage')).toHaveText('3 forslag ikke tallfestet');
    await expectNoHorizontalScroll(page);
    await expectAxeClean(page);

    await toggle.uncheck();
    await expect(h.locator('.party-card__headline')).toContainText('−');
    await expect(h.locator('.party-card__uncertain')).toHaveCount(0);
    await expect(h.locator('.party-card__coverage')).toHaveText('5 forslag ikke medregnet');
    await expectNoHorizontalScroll(page);
    await expectAxeClean(page);
  });

  test('wealth and a 12 mill. kr home: MDG and KrF carry the incomplete-number note', async ({ page }) => {
    await page.goto('/');
    await page.locator('#wage-0').fill('1500000');
    await page.getByRole('button', { name: 'Avanserte felt' }).click();
    await page.locator('#wealth-primary').fill('12000000');
    await page.locator('#wealth-shares').fill('10000000');
    await submitCalculator(page);
    await expect(page.getByRole('heading', { name: 'Alle ni partier' })).toBeVisible();

    for (const name of ['Miljøpartiet De Grønne (MDG)', 'Kristelig Folkeparti (KrF)']) {
      const card = page.locator('.party-card').filter({ hasText: name });
      await expect(card.getByRole('note')).toContainText('Ufullstendig tall.');
    }
    await expect(page.locator('.party-card').filter({ hasText: 'Høyre (H)' }).getByRole('note')).toHaveCount(0);
    await expectNoHorizontalScroll(page);
    await expectAxeClean(page);
  });
});
