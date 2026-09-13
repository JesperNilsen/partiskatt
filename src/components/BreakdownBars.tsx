import type { HeadlineGroup, Kroner } from '../types/index.ts';

const LABELS: Record<HeadlineGroup, string> = {
  direct: 'Skatt',
  consumption: 'Avgifter',
  benefit: 'Ytelser',
};

interface BreakdownBarsProps {
  byGroup: Record<HeadlineGroup, Kroner>;
}

export function BreakdownBars({ byGroup }: BreakdownBarsProps) {
  const values = Object.values(byGroup);
  const max = Math.max(...values.map((v) => Math.abs(v)), 1);

  return (
    <div className="breakdown-bars" aria-hidden="true">
      {(Object.keys(LABELS) as HeadlineGroup[]).map((key) => {
        const v = byGroup[key];
        const width = Math.round((Math.abs(v) / max) * 100);
        const cls = v > 0 ? 'breakdown-bars__bar--gain' : v < 0 ? 'breakdown-bars__bar--loss' : 'breakdown-bars__bar--neutral';
        return (
          <div key={key} className="breakdown-bars__row">
            <span className="breakdown-bars__label">{LABELS[key]}</span>
            <div className="breakdown-bars__track">
              <div className={`breakdown-bars__bar ${cls}`} style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
