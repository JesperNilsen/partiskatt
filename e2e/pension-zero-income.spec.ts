import { expect, test } from '@playwright/test';
import { expectAxeClean, expectNoHorizontalScroll } from './axe.ts';
import { submitCalculator } from './fill-profile.ts';

/** L5: a pensioner and a household with no income both get a result through the real UI. */

/** The label the engine gives `income.pensionTaxCredit` (src/engine/formulas.ts). */
const PENSION_CREDIT_LABEL = 'Skattefradrag for pensjonsinntekt';
const NO_INCOME_NOTICE = 'Ingen inntekt lagt inn: tallene viser bare avgifter, ytelser og eventuell formuesskatt.';

test.use({ viewport: { width: 375, height: 812 } });

test.describe('375px — pension and zero income', () => {
  test('alderspensjon 300 000 kr only: a party card breakdown shows the pension credit line', async ({ page }) => {
    await page.goto('/');
    await page.locator('#pension-0').fill('300000');
    await submitCalculator(page);
    await expect(page.getByRole('heading', { name: 'Alle ni partier' })).toBeVisible();
    await expect(page.getByText(NO_INCOME_NOTICE)).toHaveCount(0);

    // Only one card is open at a time; open each until one lists the credit among its largest effects.
    const cards = page.locator('.party-card');
    const count = await cards.count();
    expect(count).toBe(9);
    let found = false;
    for (let i = 0; i < count && !found; i++) {
      const card = cards.nth(i);
      await card.locator('.party-card__toggle').click();
      await expect(card.locator('.party-card__toggle')).toHaveAttribute('aria-expanded', 'true');
      const line = card.locator('.party-card__details li').filter({ hasText: `${PENSION_CREDIT_LABEL}:` });
      if ((await line.count()) > 0) {
        await expect(line.first()).toBeVisible();
        await expect(line.first()).toContainText(/kr$/);
        found = true;
      }
    }
    expect(found, `some party card lists «${PENSION_CREDIT_LABEL}»`).toBe(true);
    await expectNoHorizontalScroll(page);
    await expectAxeClean(page);
  });

  test('no income, two children: reaches /resultat and shows the no-income notice', async ({ page }) => {
    await page.goto('/');
    const addChild = page.getByRole('button', { name: 'Legg til barn' });
    await addChild.click();
    await addChild.click();
    await expect(page.locator('#child-1')).toBeVisible();
    await submitCalculator(page);
    expect(new URL(page.url()).pathname).toBe('/resultat');
    await expect(page.getByRole('heading', { name: 'Alle ni partier' })).toBeVisible();
    await expect(page.getByText(NO_INCOME_NOTICE)).toBeVisible();
    await expect(page.locator('.party-card')).toHaveCount(9);
    await expectNoHorizontalScroll(page);
    await expectAxeClean(page);
  });
});
