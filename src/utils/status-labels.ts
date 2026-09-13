import type { DataStatus } from '../types/index.ts';

export const DATA_STATUS_LABELS: Record<DataStatus, string> = {
  confirmed: 'Bekreftet',
  estimated: 'Anslått',
  unquantified: 'Ikke tallfestet',
  'not-applicable': 'Ikke relevant',
  'not-reviewed': 'Ikke gjennomgått',
};

export const DATA_STATUS_HINTS: Record<DataStatus, string> = {
  confirmed: 'Primærkilde kontrollert og inngår i hovedtallet.',
  estimated: 'Dokumentert antagelse; inngår i hovedtallet.',
  unquantified: 'Forslag finnes, men kan ikke tallfestes — vises, telles ikke.',
  'not-applicable': 'Partiet har ikke forslag i kategorien, eller kategorien gjelder ikke.',
  'not-reviewed': 'Ikke gjennomgått ennå — vises, telles ikke.',
};

export type ManifestArchiveStatus = 'archived' | 'blocked' | 'not-applicable';

export const MANIFEST_STATUS_LABELS: Record<ManifestArchiveStatus, string> = {
  archived: 'Arkivert',
  blocked: 'Blokkert',
  'not-applicable': 'Ikke relevant',
};
