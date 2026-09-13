import { chromium, devices } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4721';
const OUT = path.resolve('.qa/screenshots');
const WIDTHS = [375, 390];

async function fillIncome(page) {
  await page.locator('#wage-0').fill('550000');
}

const ROUTES = [
  { path: '/', name: 'calculator', setup: async (page) => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await fillIncome(page);
  }},
  { path: '/resultat', name: 'results', setup: async (page) => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await fillIncome(page);
    await page.getByRole('button', { name: 'Se resultat' }).click();
    await page.waitForSelector('.party-list', { timeout: 10000 });
  }},
  { path: '/metode', name: 'metode' },
  { path: '/kilder', name: 'kilder' },
  { path: '/rettelseslogg', name: 'rettelseslogg' },
];

async function checkOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflowX = Math.max(doc.scrollWidth, body.scrollWidth) - doc.clientWidth;
    const offenders = [...document.querySelectorAll('*')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > window.innerWidth + 1 && r.width > 0;
      })
      .slice(0, 8)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        class: el.className?.toString?.().slice(0, 60) ?? '',
        right: Math.round(el.getBoundingClientRect().right),
      }));
    return { overflowX, offenders };
  });
}

const report = { base: BASE, widths: {}, issues: [] };
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    report.widths[width] = {};
    const context = await browser.newContext({
      ...devices['iPhone 13'],
      viewport: { width, height: 812 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      if (route.setup) {
        await route.setup(page);
      } else {
        await page.goto(BASE + route.path, { waitUntil: 'networkidle' });
      }
      await page.waitForTimeout(200);

      const overflow = await checkOverflow(page);
      const key = route.name;
      report.widths[width][key] = overflow;

      if (overflow.overflowX > 2) {
        report.issues.push({ width, route: key, overflowX: overflow.overflowX, offenders: overflow.offenders });
      }

      const file = path.join(OUT, `s10-${width}-${key}.png`);
      await page.screenshot({ path: file, fullPage: true });
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.issues.length > 0 ? 1 : 0);
