import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_STATUS_CATEGORIES, partyColumnStatus } from '../src/data/data-status.ts';
import { DATA_BUNDLE, PARTY_META } from '../src/data/index.ts';
import type { DataStatusCategory } from '../src/data/data-status.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'DATA_STATUS.md');

function render(): string {
  const lines: string[] = [
    '# Datastatus',
    '',
    '> Denne filen genereres av `scripts/gen-data-status.ts` fra `src/data/`. Kjør `npm run data-status` for å oppdatere.',
    '',
    'Statuser: `confirmed` (primærkilde, kontrollert) · `estimated` (rimelig anslag med dokumentert antagelse) · `unquantified` (forslaget finnes, men kan ikke tallfestes) · `not-applicable` (partiet har ikke forslag i kategorien / kategorien gjelder ikke) · `not-reviewed` (ikke gjennomgått / uttrekkene er uenige)',
    '',
    `Generert: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '| Parti | Inntektsskatt | Formuesskatt | Moms | Særavgifter | Kontantytelser | Arbeidsgiveravgift |',
    '|---|---|---|---|---|---|---|',
  ];

  for (const meta of PARTY_META) {
    const cells = DATA_STATUS_CATEGORIES.map((c) =>
      partyColumnStatus(meta.id, c.id as DataStatusCategory),
    );
    lines.push(`| ${meta.shortName} | ${cells.join(' | ')} |`);
  }

  lines.push('');
  lines.push('## Encoded party deltas (S7)');
  lines.push('');
  for (const party of DATA_BUNDLE.parties) {
    const meta = PARTY_META.find((m) => m.id === party.id)!;
    if (party.deltas.length === 0) {
      lines.push(`- **${meta.shortName}**: ingen deltas`);
      continue;
    }
    lines.push(`- **${meta.shortName}**: ${party.deltas.map((d) => `\`${d.id}\``).join(', ')}`);
  }

  lines.push('');
  return lines.join('\n');
}

const check = process.argv.includes('--check');
const next = render();

if (check) {
  const current = readFileSync(OUT, 'utf8');
  if (current !== next) {
    console.error('DATA_STATUS.md is out of date — run: npm run data-status');
    process.exit(1);
  }
  console.log('data-status: ok');
} else {
  writeFileSync(OUT, next);
  console.log(`wrote ${OUT}`);
}
