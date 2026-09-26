import type { Page } from '@playwright/test';

/**
 * Fills the calculator form through the real UI with a minimal non-empty
 * profile (one wage income field is enough — see isProfileEmpty in
 * src/state/profile.ts) and submits it, landing on /resultat.
 */
export async function fillProfileAndSubmit(page: Page) {
  await page.goto('/');
  await page.locator('#wage-0').fill('550000');
  await page.getByRole('button', { name: 'Se resultat' }).click();
  await page.waitForURL('**/resultat');
}
