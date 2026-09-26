import { expect, test, type Page } from '@playwright/test';
import { expectAxeClean, expectNoHorizontalScroll } from './axe.ts';
import { fillProfileAndSubmit } from './fill-profile.ts';

/** L8: the advanced fields (excise units, wealth, honest toggles) through the real UI. */

/** The panel stays open across client-side navigation, so only click when it is closed. */
async function openAdvanced(page: Page) {
  const toggle = page.locator('.advanced-toggle');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(page.locator('#units-petrolLitre')).toBeVisible();
}

/** Every party's headline, in rendered order. */
async function headlines(page: Page): Promise<string> {
  return (await page.locator('.party-card__headline').allTextContents()).join(' | ');
}

async function backToCalculator(page: Page) {
  await page.getByRole('link', { name: 'Endre inndata' }).click();
  await page.waitForURL((url) => url.pathname === '/');
}

async function submit(page: Page) {
  await page.getByRole('button', { name: 'Se resultat' }).click();
  await page.waitForURL('**/resultat');
}

for (const viewport of [
  { width: 375, height: 812 },
  { width: 1280, height: 900 },
]) {
  test.describe(`${viewport.width}px — advanced fields`, () => {
    test.use({ viewport });

    test('open panel: no horizontal scroll, axe clean, toggle notes visible', async ({ page }) => {
      await page.goto('/');
      await openAdvanced(page);
      await expect(page.getByText(/Gjelder 4 regler merket usikre/)).toBeVisible();
      await expect(page.getByLabel(/Vis arbeidsgiveravgift/)).toBeDisabled();
      await expect(page.getByText(/Ingen partier i datagrunnlaget endrer arbeidsgiveravgiften/)).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectAxeClean(page);
    });
  });
}

test.describe('375px — inputs move the numbers', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('an excise unit and a wealth field each change the results', async ({ page }) => {
    await fillProfileAndSubmit(page);
    const base = await headlines(page);

    await backToCalculator(page);
    await openAdvanced(page);
    await page.locator('#units-petrolLitre').fill('5000,5');
    await submit(page);
    const afterUnits = await headlines(page);
    expect(afterUnits).not.toBe(base);

    await backToCalculator(page);
    await openAdvanced(page);
    await page.locator('#wealth-secondary').fill('30000000');
    await submit(page);
    expect(await headlines(page)).not.toBe(afterUnits);
  });
});
