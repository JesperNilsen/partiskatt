import { BRAND } from './config/brand.ts';

export function App() {
  return (
    <main className="shell">
      <h1>{BRAND.name}</h1>
      <p className="beta">{BRAND.betaNotice}</p>
    </main>
  );
}
