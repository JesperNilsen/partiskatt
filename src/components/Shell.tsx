import { Link } from 'wouter';
import { BRAND } from '../config/brand.ts';

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <header className="site-header">
        <div className="shell site-header__inner">
          <Link href="/" className="brand">
            {BRAND.logoSrc ? <img src={BRAND.logoSrc} alt={BRAND.name} className="brand__logo" /> : null}
            <span className="brand__name">{BRAND.name}</span>
          </Link>
          <nav className="site-nav" aria-label="Hovedmeny">
            <Link href="/">Kalkulator</Link>
            <Link href="/metode">Metode</Link>
            <Link href="/kilder">Kilder</Link>
            <Link href="/rettelseslogg">Rettelser</Link>
          </nav>
        </div>
      </header>
      <main className="shell main">{children}</main>
      <footer className="site-footer shell">
        <p className="privacy">
          All beregning skjer lokalt i nettleseren. Ingen lønn, formue eller husholdningsdata sendes eller lagres.
        </p>
        <p>
          <a href={BRAND.feedbackMailto}>Meld feil</a>
        </p>
      </footer>
    </div>
  );
}
