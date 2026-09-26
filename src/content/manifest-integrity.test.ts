import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import manifest from '../../sources/manifest.json' with { type: 'json' };

/**
 * Full-fidelity view of a manifest row for integrity checking — deliberately
 * separate from `SourceManifestEntry` in `./manifest.ts`, which is a display-
 * oriented subset that drops sha256/bytes/rawFile.
 */
interface ManifestRow {
  id: string;
  status: string;
  rawFile: string | null;
  sha256: string | null;
  bytes: number;
}

const ENTRIES = manifest as ManifestRow[];
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const RAW_DIR = join(ROOT, 'sources/raw');

/** Every archived row that claims a raw file — these must be checkable. */
const ARCHIVED_WITH_FILE = ENTRIES.filter((e) => e.status === 'archived' && !!e.rawFile);

describe('sources/manifest.json sha256/bytes integrity', () => {
  it('has archived rows with raw files to verify (sanity check on the fixture itself)', () => {
    // Measured 2026-09-16 at 39; +1 for the r-alt-2026.html row and +5 for the
    // SSB FBU 2022 tables (Q-010), both 2026-09-26; +2 for SSB 10572 and the
    // Energibruk i husholdningene page (lane L11, 2026-09-26). Bump this when a source is
    // archived; a drop means a row was deleted.
    expect(ARCHIVED_WITH_FILE.length).toBe(47);
  });

  for (const entry of ARCHIVED_WITH_FILE) {
    it(`${entry.id}: raw file exists and matches recorded sha256 + bytes`, () => {
      const relPath = entry.rawFile as string;
      const absPath = join(ROOT, relPath);

      let buf: Buffer;
      try {
        buf = readFileSync(absPath);
      } catch (err) {
        throw new Error(
          `manifest entry "${entry.id}" points to rawFile "${relPath}", but that file could not be ` +
            `read from disk (${(err as Error).message}).`,
        );
      }

      const actualSha256 = createHash('sha256').update(buf).digest('hex');
      const actualBytes = buf.length;

      const mismatches: string[] = [];
      if (actualSha256 !== entry.sha256) {
        mismatches.push(`sha256 mismatch — expected "${entry.sha256}", found "${actualSha256}"`);
      }
      if (actualBytes !== entry.bytes) {
        mismatches.push(`bytes mismatch — expected ${entry.bytes}, found ${actualBytes}`);
      }

      if (mismatches.length > 0) {
        throw new Error(`manifest entry "${entry.id}" (${relPath}): ${mismatches.join('; ')}`);
      }
    });
  }
});

describe('sources/raw/ reverse integrity (every file has a manifest row)', () => {
  it('no file in sources/raw/ is missing from sources/manifest.json', () => {
    const filesOnDisk = readdirSync(RAW_DIR).filter((f) => statSync(join(RAW_DIR, f)).isFile());
    const referenced = new Set(
      ENTRIES.filter((e) => !!e.rawFile).map((e) => (e.rawFile as string).replace(/^sources\/raw\//, '')),
    );
    const orphaned = filesOnDisk.filter((f) => !referenced.has(f));

    expect(orphaned, `files present in sources/raw/ with no manifest row: ${orphaned.join(', ') || '(none)'}`).toEqual(
      [],
    );
  });
});
