import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_BUNDLE, PARTY_META } from '../src/data/index.ts';
import type { Category, DataStatus, FormulaId, PartyId } from '../src/types/index.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'DATA_STATUS.md');

type DisplayColumn =
  | 'Inntektsskatt'
  | 'Formuesskatt'
  | 'Moms'
  | 'Særavgifter'
  | 'Kontantytelser'
  | 'Arbeidsgiveravgift';

const COLUMN_FORMULAS: Record<DisplayColumn, readonly FormulaId[]> = {
  Inntektsskatt: [
    'income.generalRate',
    'income.bracketTax',
    'income.socialSecurity',
    'income.personalAllowance',
    'income.minimumDeductionWage',
    'income.minimumDeductionPension',
    'income.unionFeeDeduction',
  ],
  Formuesskatt: ['wealth.netWealthTax', 'wealth.valuation'],
  Moms: [
    'vat.food',
    'vat.general',
    'vat.transportServices',
    'vat.electricity',
    'vat.fuel',
    'vat.alcoholTobacco',
    'vat.flights',
  ],
  Særavgifter: [
    'excise.petrolLitre',
    'excise.dieselLitre',
    'excise.kwh',
    'excise.flightEurope',
    'excise.flightOther',
    'excise.beerLitre',
    'excise.wineLitre',
    'excise.spiritsLitre',
    'excise.cigarette',
    'excise.snusGram',
  ],
  Kontantytelser: ['benefit.childBenefit', 'benefit.studentSupport'],
  Arbeidsgiveravgift: ['employer.contribution'],
};

const COLUMN_CATEGORY: Record<DisplayColumn, Category> = {
  Inntektsskatt: 'direct-tax',
  Formuesskatt: 'wealth-tax',
  Moms: 'consumption-tax',
  Særavgifter: 'consumption-tax',
  Kontantytelser: 'benefit',
  Arbeidsgiveravgift: 'employer',
};

const STATUS_RANK: Record<DataStatus, number> = {
  'not-reviewed': 5,
  unquantified: 4,
  estimated: 3,
  confirmed: 2,
  'not-applicable': 1,
};

function worstStatus(statuses: DataStatus[]): DataStatus {
  if (statuses.length === 0) return 'not-reviewed';
  return statuses.reduce((a, b) => (STATUS_RANK[a] >= STATUS_RANK[b] ? a : b));
}

function unquantifiedForColumn(partyId: PartyId, column: DisplayColumn) {
  const party = DATA_BUNDLE.parties.find((p) => p.id === partyId)!;
  const cat = COLUMN_CATEGORY[column];
  return party.unquantified.filter((u) => {
    if (u.category !== cat) return false;
    if (column === 'Moms') return /mva|moms|mat/i.test(u.title);
    if (column === 'Særavgifter') return /avgift|bensin|diesel|elavgift|fly|alkohol|tobakk/i.test(u.title);
    return true;
  });
}

function partyColumnStatus(partyId: PartyId, column: DisplayColumn): DataStatus {
  const party = DATA_BUNDLE.parties.find((p) => p.id === partyId)!;
  const formulas = COLUMN_FORMULAS[column];
  const cat = COLUMN_CATEGORY[column];

  if (partyId === 'ap') return 'not-applicable';

  const reviewed = party.reviewed[cat];
  const statuses: DataStatus[] = [];

  for (const f of formulas) {
    const delta = party.deltas.find((d) => d.id === f);
    if (delta) statuses.push(delta.status);
  }

  for (const u of unquantifiedForColumn(partyId, column)) {
    statuses.push(u.status);
  }

  if (statuses.length > 0) return worstStatus(statuses);

  if (reviewed) return reviewed.status === 'no-change' ? 'not-applicable' : 'not-applicable';

  return 'not-reviewed';
}

function render(): string {
  const cols: DisplayColumn[] = [
    'Inntektsskatt',
    'Formuesskatt',
    'Moms',
    'Særavgifter',
    'Kontantytelser',
    'Arbeidsgiveravgift',
  ];
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
    const cells = cols.map((c) => partyColumnStatus(meta.id, c));
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
