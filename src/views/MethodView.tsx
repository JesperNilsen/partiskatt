import { Link } from 'wouter';
import { BRAND } from '../config/brand.ts';

export function MethodView() {
  return (
    <article className="doc-page">
      <h1>Metode</h1>
      <p className="lede calm">
        {BRAND.name} sammenligner det vedtatte skatte-, avgifts- og ytelsessystemet for 2026 med hvert partis alternative statsbudsjett.
        Dette er anslag — ikke en individuell skatteberegning.
      </p>

      <section>
        <h2>Referanse</h2>
        <p>
          Referansen er det endelig vedtatte 2026-systemet etter Stortingets vedtak. Alle ni partier sammenlignes med samme referanse.
          Arbeiderpartiet er regjeringsparti og har ikke et alternativt budsjett; partiets kort viser null avvik fordi det vedtatte systemet er regjeringens politikk.
        </p>
      </section>

      <section>
        <h2>Hva inngår i hovedtallet</h2>
        <ul>
          <li>Direkte skatt (inntekt, trinnskatt, trygdeavgift, formuesskatt)</li>
          <li>Moms og særavgifter basert på en standardisert forbruksprofil du kan justere</li>
          <li>Direkte kontantytelser som barnetrygd</li>
        </ul>
        <p>
          Offentlige tjenester, gratisordninger, makspriser og dynamiske vekstvirkninger er ikke med. Arbeidsgiveravgift er av som standard.
        </p>
      </section>

      <section>
        <h2>Usikkerhet</h2>
        <p>
          Regler merket som ikke gjennomgått eller ikke tallfestet vises, men telles ikke i hovedtallet. Usikre forslag kan slås på under avanserte felt.
        </p>
      </section>

      <p><Link href="/">Tilbake til kalkulatoren</Link></p>
    </article>
  );
}
