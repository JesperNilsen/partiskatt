import { PARTY_META } from '../config/parties.ts';
import type { PartyResult } from '../types/index.ts';
import { headlinePhrase, monthlyPhrase } from '../utils/format.ts';

interface HeadlineVerdictProps {
  top: PartyResult;
}

export function HeadlineVerdict({ top }: HeadlineVerdictProps) {
  const meta = PARTY_META[top.party];
  const cls = top.headline > 0 ? 'verdict verdict--gain' : top.headline < 0 ? 'verdict verdict--loss' : 'verdict';

  return (
    <section className={cls} aria-live="polite">
      <h2 className="verdict__headline">{headlinePhrase(top.headline, meta.shortName)}</h2>
      <p className="verdict__sub">{monthlyPhrase(top.headline)}</p>
      <p className="verdict__note">
        Rangert etter hvem som gir deg mest penger igjen. Alle partier sammenlignes med det vedtatte 2026-systemet.
      </p>
    </section>
  );
}
