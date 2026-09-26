// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { calculateAll } from '../engine/index.ts';
import { DATA_BUNDLE, R_2026, SV_2026, sourceOf } from '../data/index.ts';
import { parsePageRefs } from '../data/provenance.ts';
import { FIXTURES } from '../tests/fixtures.ts';
import { DEFAULT_TOGGLES, PARTY_IDS } from '../types/index.ts';
import type { PartyId, PartyRuleSet, Provenance } from '../types/index.ts';
import { DATA_STATUS_LABELS } from '../utils/status-labels.ts';
import { PartyCard } from './PartyCard.tsx';
import { partyRuleRows } from './rule-provenance.ts';

afterEach(cleanup);

function resultFor(party: PartyId) {
  const r = calculateAll(FIXTURES.medianSingle!, DEFAULT_TOGGLES, DATA_BUNDLE).find((x) => x.party === party);
  if (!r) throw new Error(`no result for ${party}`);
  return r;
}

/** The <li> of the expanded card whose title is exactly `title`. */
function rowTitled(title: string): HTMLElement {
  const row = screen.getByText(title, { selector: '.rule-row__title' }).closest('li');
  if (!row) throw new Error(`no row for ${title}`);
  return row;
}

/** Every page of `prov` must appear in the row's page text, and nothing but those pages. */
function expectPagesInRow(row: HTMLElement, prov: Provenance) {
  const pages = parsePageRefs(prov.pageOrTable);
  expect(pages, `${prov.pageOrTable} must be a page reference`).not.toBeNull();
  const pageEl = row.querySelector('.rule-row__pages');
  expect(pageEl, 'row has a page element').not.toBeNull();
  // The shown text ("s. 32–33, 119") is itself a page reference: parse it back and compare page sets.
  expect(parsePageRefs(pageEl!.textContent ?? '')).toEqual(pages);
}

function trinnskattRule(party: PartyRuleSet) {
  const rule = party.deltas.find((d) => d.id === 'income.bracketTax');
  if (!rule) throw new Error(`${party.id} has no trinnskatt rule`);
  return rule;
}

describe('PartyCard: status and source per rule (Q-003)', () => {
  for (const party of [SV_2026, R_2026]) {
    it(`${party.id}: the trinnskatt row shows its own status and page`, () => {
      const rule = trinnskattRule(party);
      render(<PartyCard result={resultFor(party.id)} rank={1} expanded />);
      const row = rowTitled(rule.label);

      within(row).getByText(DATA_STATUS_LABELS[rule.status]);
      expectPagesInRow(row, rule.provenance);
      const source = sourceOf(rule.provenance.sourceId);
      expect(within(row).getByRole('link').getAttribute('title')).toBe(source.title);
      within(row).getByText(rule.provenance.method);
    });
  }

  it('r: each unquantified proposal row shows its own page, not a neighbour\'s', () => {
    expect(R_2026.unquantified.length).toBeGreaterThanOrEqual(2);
    const pagesSeen = new Set(R_2026.unquantified.map((u) => u.provenance.pageOrTable));
    expect(pagesSeen.size, 'fixture must discriminate: proposals on different pages').toBe(R_2026.unquantified.length);

    render(<PartyCard result={resultFor('r')} rank={1} expanded />);
    for (const u of R_2026.unquantified) {
      const row = rowTitled(u.title);
      within(row).getByText(DATA_STATUS_LABELS[u.status]);
      expectPagesInRow(row, u.provenance);
    }
  });

  it('collapsed card shows no provenance', () => {
    render(<PartyCard result={resultFor('r')} rank={1} />);
    expect(document.querySelector('.rule-row')).toBeNull();
  });

  it('every party: rows cover all deltas and unquantified proposals, each with provenance', () => {
    for (const id of PARTY_IDS) {
      const result = resultFor(id);
      const { applied, excluded } = partyRuleRows(result);
      const party = DATA_BUNDLE.parties.find((p) => p.id === id)!;
      expect(applied.length, `${id} applied`).toBe(result.appliedRuleCount);
      expect(applied.length + excluded.length, `${id} rows`).toBe(party.deltas.length + party.unquantified.length);
      for (const row of [...applied, ...excluded]) expect(row.provenance, `${id}: ${row.title}`).not.toBeNull();
    }
  });
});
