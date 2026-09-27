import type { Page } from '@playwright/test';

/** Clicks «Se resultat» on the calculator and waits for /resultat. */
export async function submitCalculator(page: Page) {
  await page.getByRole('button', { name: 'Se resultat' }).click();
  await page.waitForURL('**/resultat');
}

/**
 * Fills the calculator form through the real UI with a minimal profile (one
 * wage income) and submits it, landing on /resultat. /resultat redirects to /
 * until the form has been submitted once in the session (`submitted` in
 * src/state/app.tsx), so tests reach it through this submit, never by URL.
 */
export async function fillProfileAndSubmit(page: Page) {
  await page.goto('/');
  await page.locator('#wage-0').fill('550000');
  await submitCalculator(page);
}
