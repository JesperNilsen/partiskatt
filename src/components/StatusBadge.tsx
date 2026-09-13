import type { DataStatus } from '../types/index.ts';
import { DATA_STATUS_HINTS, DATA_STATUS_LABELS } from '../utils/status-labels.ts';

interface StatusBadgeProps {
  status: DataStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = DATA_STATUS_LABELS[status];
  const hint = DATA_STATUS_HINTS[status];

  return (
    <span className={`status-badge status-badge--${status.replace(/[^a-z]/g, '-')}`} title={hint}>
      {label}
    </span>
  );
}
