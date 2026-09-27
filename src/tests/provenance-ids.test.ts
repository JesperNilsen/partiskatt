import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import manifest from '../../sources/manifest.json' with { type: 'json' };
import { ADOPTED_2026_ENCODED } from '../data/baseline/2026/adopted.ts';
import { FORLIK_2026 } from '../data/baseline/2026/forlik.ts';
import * as consumption from '../data/consumption-profiles.ts';
import { DATA_BUNDLE } from '../data/index.ts';
import { KNOWN_KNOTS } from '../data/knots.ts';

/**
 * Every source id the rule data cites must be a row in `sources/manifest.json`. A cited id that is
 * not there points at nothing: no archived file, no sha256, no way to check the anchor.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_DIR = join(ROOT, 'src/data');
const MANIFEST_IDS = new Set((manifest as readonly { id: string }[]).map((e) => e.id));

/** Every `sourceId` string reachable from `value`, with the path where it was found. */
function citedIds(value: unknown, path: string, out: Map<string, string[]>, seen = new Set<unknown>()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return out;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    const at = `${path}.${key}`;
    if (key === 'sourceId' && typeof child === 'string') out.set(child, [...(out.get(child) ?? []), at]);
    citedIds(child, at, out, seen);
  }
  return out;
}

const CITED = citedIds(
  { bundle: DATA_BUNDLE, adoptedEncoded: ADOPTED_2026_ENCODED, forlik: FORLIK_2026, consumption, knots: KNOWN_KNOTS },
  'data',
  new Map(),
);

function dataFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = join(dir, d.name);
    if (d.isDirectory()) return dataFiles(full);
    return d.name.endsWith('.ts') && !d.name.includes('.test.') ? [full] : [];
  });
}

/** String literals shaped like a source id: lower-case, hyphenated, with a year segment (`-2026`). */
const ID_LITERAL = /(['"])([a-z][a-z0-9]*(?:-[a-z0-9]+)*-20\d\d(?:-[a-z0-9]+)*)\1/g;

describe('provenance: cited source ids exist in the manifest', () => {
  it('the walk reaches the baselines, the forlik table, the party overlays and the unit prices', () => {
    // Anti-vacuity: each of these is cited from a different data module.
    for (const id of ['lovdata-skattevedtak-2026', 'innst2s-2025-2026', 'innst3s-2025-2026', 'innst4l-2025-2026', 'h-alt-2026', 'ssb-09654-drivstoffpriser-2022']) {
      expect(CITED.has(id), `${id} is cited somewhere in the walked data`).toBe(true);
    }
  });

  it('every sourceId in the loaded rule data is a manifest id', () => {
    const missing = [...CITED].filter(([id]) => !MANIFEST_IDS.has(id)).map(([id, at]) => `${id} (${at[0]})`);
    expect(missing).toEqual([]);
  });

  it('every source-id-shaped string literal in src/data is a manifest id', () => {
    const files = dataFiles(DATA_DIR);
    expect(files.length).toBeGreaterThan(10);
    const literals: { id: string; file: string }[] = [];
    for (const file of files) {
      for (const m of readFileSync(file, 'utf8').matchAll(ID_LITERAL)) literals.push({ id: m[2]!, file: relative(ROOT, file) });
    }
    expect(literals.length, 'the scan finds the id constants').toBeGreaterThan(20);
    const missing = literals.filter((l) => !MANIFEST_IDS.has(l.id)).map((l) => `${l.id} (${l.file})`);
    expect(missing).toEqual([]);
  });
});
