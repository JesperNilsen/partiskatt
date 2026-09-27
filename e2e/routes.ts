/**
 * Every route registered in src/App.tsx. Kept as an explicit list (rather
 * than importing the router) so a route added there without a matching
 * entry here fails loudly in review — see the "route coverage" check in
 * mobile.spec.ts, which asserts this list is non-empty and each path is
 * reachable, rather than trusting it silently.
 */
export const STATIC_ROUTES = ['/', '/metode', '/kilder', '/rettelseslogg'] as const;

/** /resultat is covered separately because it redirects to / until the form has been submitted. */
export const RESULT_ROUTE = '/resultat';

export const ALL_ROUTES = [...STATIC_ROUTES, RESULT_ROUTE] as const;
