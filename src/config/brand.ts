/**
 * Single seam for brand identity. Swap name/logo here; nothing else in the
 * UI hard-codes the product name.
 */
export const BRAND = {
  name: 'Partiskatt',
  shortName: 'Partiskatt',
  tagline: 'Hvor mye mer eller mindre sitter du igjen med?',
  betaNotice:
    'Offentlig beta: Kalkulatoren bygger på publiserte 2026-budsjetter og standardiserte antagelser. Tallene er anslag, ikke en individuell skatteberegning. Se metode og kilder før du tolker små forskjeller.',
  /** Path to an SVG in /public, or null for a text wordmark. */
  logoSrc: null as string | null,
  /** Channel for reporting errors. Replace before launch. */
  feedbackMailto: 'mailto:feil@example.invalid',
  repoUrl: null as string | null,
} as const;
