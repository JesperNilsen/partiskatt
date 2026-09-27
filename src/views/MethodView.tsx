import { Link } from 'wouter';
import { DocDataBanner } from '../components/DocDataBanner.tsx';
import { BRAND } from '../config/brand.ts';

export function MethodView() {
  return (
    <article className="doc-page">
      <DocDataBanner />

      <header className="doc-page__header">
        <h1>Metode</h1>
        <p className="lede calm">
          {BRAND.name} sammenligner det vedtatte skatte-, avgifts- og ytelsessystemet for 2026 med hvert partis alternative
          statsbudsjett. Tallene er anslag basert på standardiserte antagelser — ikke en individuell skatteberegning.
        </p>
      </header>

      <section>
        <h2>Referanse</h2>
        <p>
          Referansen er det endelig <strong>vedtatte</strong> 2026-systemet etter Stortingets vedtak (Lovdata), ikke
          regjeringens opprinnelige forslag (Prop. 1 LS). Alle ni partier sammenlignes med samme referanse.
        </p>
        <p>
          Arbeiderpartiet er regjeringsparti og har ikke et alternativt statsbudsjett for 2026. Partiets kort viser derfor
          null avvik per konstruksjon — det vedtatte systemet er regjeringens politikk etter budsjettforliket.
        </p>
        <p>
          Endringer fra forliket (15 regler som avviker fra Prop. 1 LS) er dokumentert i prosjektets kildemateriale og
          vises under <Link href="/kilder">Kilder</Link>.
        </p>
      </section>

      <section>
        <h2>Tre regelsett</h2>
        <p>Beregningen skiller mellom tre lag av regler:</p>
        <ol>
          <li>
            <strong>Regjeringens forslag</strong> (Prop. 1 LS) — utgangspunkt partiene selv bruker i sine alternative
            budsjetter.
          </li>
          <li>
            <strong>Vedtatt referanse</strong> — det faktiske 2026-systemet etter Stortingets vedtak. Dette er
            baseline for alle sammenligninger.
          </li>
          <li>
            <strong>Partiregler</strong> — for hvert opposisjonsparti overlegges bare de reglene partiet faktisk foreslår
            endret. Alt annet følger referansen.
          </li>
        </ol>
        <p>
          Partienes egne tall er formulert som avvik fra regjeringens forslag. Vi regner om til absolutte satser og
          terskler, og sammenligner med referansen. Løse formuleringer i partiprogram brukes ikke.
        </p>
      </section>

      <section>
        <h2>Hva inngår i hovedtallet</h2>
        <p>Hovedtallet — kroner mer eller mindre igjen per år — består av:</p>
        <ul>
          <li>
            <strong>Direkte skatt</strong> — inntektsskatt, trinnskatt, trygdeavgift, personfradrag, minstefradrag,
            relevante fradrag og formuesskatt der kildene tillater det.
          </li>
          <li>
            <strong>Moms og særavgifter</strong> — beregnet fra en standardisert forbruksprofil (nøktern, typisk eller
            høy) som du kan justere. Moms regnes ikke som en prosent av hele inntekten.
          </li>
          <li>
            <strong>Direkte kontantytelser</strong> — for eksempel barnetrygd, der partiet har konkrete, tallfestede
            forslag.
          </li>
        </ul>
        <p>
          Offentlige tjenester, gratisordninger, makspriser og dynamiske vekstvirkninger er ikke med. Utbytte og
          næringsinntekt er utenfor MVP-en. Kun nasjonale regler — ingen kommunal eiendomsskatt. Skatten på alminnelig
          inntekt (22&nbsp;%) inkluderer kommunens og fylkeskommunens andel til standardsats, og formuesskattesatsen
          inkluderer kommunens andel til standardsats — begge de satsene de aller fleste kommuner og fylkeskommuner
          bruker. Bø i Vesterålen og tiltakssonen i Finnmark og Nord-Troms har andre satser, som ikke er modellert. To
          voksne regnes som ektefeller i formuesskatten; for samboere med lik eierandel gir det samme resultat, fordi
          hvert innslagspunkt for par er nøyaktig det dobbelte av innslagspunktet for enslige — ulik eierandel mellom
          samboere er ikke modellert.
        </p>
      </section>

      <section>
        <h2>Incidensantagelser</h2>
        <ul>
          <li>Direkte skatt og kontantytelser fordeles 100&nbsp;% på personen.</li>
          <li>
            Moms og særavgifter: 100&nbsp;% overveltning til forbrukerpris, uendrede mengder. Særavgifter beregnes per
            enhet (liter, kWh, passasjer) og mva legges oppå avgiften.
          </li>
          <li>
            <strong>Arbeidsgiveravgift</strong> er av som standard. Når du slår den på, brukes full langsiktig incidens
            på arbeidstakeren som foreløpig antagelse. Beløpet vises adskilt fra direkte skatt og påvirker ikke
            standardrangeringen uten at du har valgt det utvidete scenarioet.
          </li>
        </ul>
      </section>

      <section>
        <h2>Forbruksprofil</h2>
        <p>
          Standardprofilene er utledet av SSBs forbruksundersøkelse 2022 (tabell 14100, arkivert). Profilen angir årlig forbruk inkl. mva per
          kategori og fysiske mengder for avgiftsbelagte varer.
          Under avanserte felt kan du endre kronene i alle åtte kategorier og alle ti fysiske mengder (med én desimal); da blir
          profilen egendefinert.
        </p>
        <p>
          Husholdningstallene er delt på gjennomsnittshusholdningen etter den OECD-modifiserte ekvivalensskalaen (1 + 0,5 per ekstra voksen
          + 0,3 per barn). «Nøkternt» og «Høyt» er ikke påslag på «Typisk», men laveste og høyeste inntektskvartil i SSB-tabell 14156.
          Mengdene (liter, reiser) er kroner delt på gjennomsnittsprisen for 2022. Strømforbruket er målt: 14 964 kWh per husholdning
          i 2022 (SSB-tabell 10572, samme utvalg som forbruksundersøkelsen, 80 prosent med målerdata fra Elhub).
        </p>
        <p>
          Flypassasjeravgiften har to satser, så flykronene deles: 20 prosent regnes som reiser utenfor Europa og resten som
          Europa-reiser, med anslåtte 1 500 kr per avreise i Europa og 7 500 kr per avreise utenfor. Kronene deles, de legges ikke
          til. Mengden er et <em>forventet</em> antall reiser per år, ikke et helt antall: «Høyt» med to voksne og to barn får 0,252
          forventede avreiser utenfor Europa i året, altså 88 kr i avgift. Derfor rundes mengder ikke til hele enheter — det er
          avrundingen som ellers gjør en fjerdedels reise til ingen avgift.
        </p>
        <p>
          Prisår: standardprofilene står i 2026-priser. Kronene fra 2022 er løftet per mva-kategori med SSBs konsumprisindeks (tabell
          14700): snittet for januar–august 2026 delt på snittet for 2022. Mat løftes med 1,250 og strøm med 0,924 — under 1 fordi 2022
          var et krisår for strømprisen. Mengdene (liter, kWh, reiser) løftes ikke, så særavgiftene er de samme i begge prisår; det er
          momsen som følger kronene. Velg «2022» ved siden av profilvelgeren for å se profilene uløftet. Beløp du har skrevet inn selv,
          løftes aldri. Alle faktorene står i metodedokumentet.
        </p>
        <p className="muted">
          Prisene på øl, vin, brennevin, sigaretter, snus og flyreiser som mengdene er regnet ut med, er anslag — det finnes
          ingen offisiell kroner-per-enhet for dem. Strømforbruket i kWh er ikke lenger kroner delt på en strømpris: strømstøtten i 2022 gjorde
          det valget usikkert, og SSBs målte forbruk har erstattet det. Utledningen og forbeholdene står i sin helhet i metodedokumentet og under «Kilder».
        </p>
      </section>

      <section>
        <h2>Ikrafttredelse midt i året</h2>
        <p>
          Enkelte regler trer i kraft en dato midt i 2026 — for eksempel studiestøtte fra 1. august eller en momssats
          fra 1. september — i stedet for 1. januar. Hovedtallet er fortsatt en <strong>helårseffekt</strong>: det
          årlige beløpet regelen ville gitt om den hadde gjeldt hele 2026, slik at kalkulatoren sammenligner
          politikknivåer mellom partier, ikke en kontantstrømprognose for 2026 med delårsvirkning (beslutning D2,
          2026-09-27, viderefører beslutning 1 fra 2026-09-25). Der en regel har en slik ikrafttredelsesdato, står
          den ved siden av regelen i partikortet sammen med en egen <strong>«i 2026»</strong>-linje: den delen av
          helårsbeløpet regelen faktisk gir i 2026, ut fra hvor mange måneder den er i kraft. Studiestøtte følger
          utbetalingskalenderen januar–juni og august–desember (11 måneder, ingen juli); andre regler følger vanlig
          kalendermåned fra ikrafttredelsesdatoen til årsslutt.
        </p>
      </section>

      <section>
        <h2>Avrunding</h2>
        <p>
          Alle beløp er hele kroner. Hver navngitt komponent avrundes én gang (halv opp, bort fra null). Summen av
          komponentene er per definisjon lik hovedtallet.
        </p>
      </section>

      <section>
        <h2>Usikkerhet og status</h2>
        <p>Hver regel har en status som bestemmer om den inngår i hovedtallet:</p>
        <ul>
          <li><strong>Bekreftet</strong> og <strong>anslått</strong> — inngår i hovedtallet.</li>
          <li>
            <strong>Ikke tallfestet</strong>, <strong>ikke gjennomgått</strong> og <strong>ikke relevant</strong> — kan
            vises, men telles ikke.
          </li>
        </ul>
        <p>
          Forslag merket som usikre er av som standard og kan slås på under «Mulige endringer» i kalkulatoren. Da vises
          antagelsen, kilden og hvorfor forslaget er usikkert.
        </p>
        <p>
          Eksempel: Høyres jobbfradrag skal gi «4300 kroner lavere skatt for folk i arbeid», men partiet sier ikke hvem som
          regnes som i arbeid eller om fradraget trappes av. Kalkulatoren antar en flat skattereduksjon på 4 300 kr per
          voksen med lønnsinntekt, trukket fra skatt på alminnelig inntekt, trinnskatt og trygdeavgift, aldri så skatten
          blir negativ. Forslaget er merket usikkert.
        </p>
        <p>
          Full oversikt per parti og kategori: <Link href="/kilder">datastatus under Kilder</Link>.
        </p>
      </section>

      <section>
        <h2>Personvern og beregning</h2>
        <p>
          All beregning skjer lokalt i nettleseren. Ingen lønn, formue eller husholdningsdata sendes, lagres eller legges
          i URL-en.
        </p>
      </section>

      <section>
        <h2>Feil og rettelser</h2>
        <p>
          Oppdager du en feil?{' '}
          <a href={BRAND.feedbackMailto}>Meld fra</a> eller se{' '}
          <Link href="/rettelseslogg">rettelsesloggen</Link> for publiserte korreksjoner.
        </p>
      </section>

      <nav className="doc-page__nav" aria-label="Relaterte sider">
        <Link href="/kilder">Se kilder</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/rettelseslogg">Rettelseslogg</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/">Tilbake til kalkulatoren</Link>
      </nav>
    </article>
  );
}
