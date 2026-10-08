import type { UserProfile } from '../types/index.ts';

/**
 * Everything the calculator knowingly leaves out, each with the caveat the reader gets.
 * One entry per omission: add a line here when the model starts ignoring something new, and
 * both the method page (all entries) and the result page (entries whose `appliesTo` holds for
 * the profile) pick it up. `appliesTo` omitted = relevant to everyone.
 */
export interface Omission {
  readonly id: string;
  readonly label: string;
  readonly caveat: string;
  readonly appliesTo?: (profile: UserProfile) => boolean;
}

const hasPension = (p: UserProfile) => p.adults.some((a) => a.pensionIncome > 0);
const hasWageAndPension = (p: UserProfile) => p.adults.some((a) => a.wageIncome > 0 && a.pensionIncome > 0);

export const OMISSIONS: readonly Omission[] = [
  {
    id: 'public-services',
    label: 'Offentlige tjenester og gratisordninger',
    caveat:
      'Hva du får igjen i helse, skole, barnehage og andre tjenester er ikke regnet inn. Et parti kan gi deg mer i lommeboken og samtidig kutte i tjenester, eller omvendt.',
  },
  {
    id: 'price-caps',
    label: 'Makspriser og prisreguleringer',
    caveat: 'Tak på for eksempel strøm- eller barnehagepris er ikke modellert, så tallene viser bare skatter, avgifter og kontantytelser.',
  },
  {
    id: 'dynamic-effects',
    label: 'Dynamiske virkninger',
    caveat:
      'Tallene forutsetter uendret atferd og uendret økonomi: ingen endring i arbeidstilbud, forbruk eller priser som følge av forslagene.',
  },
  {
    id: 'business-income',
    label: 'Næringsinntekt og utbytte',
    caveat: 'Selvstendig næringsdrivende og aksjeeiere med utbytte får et ufullstendig bilde; slike inntekter kan ikke legges inn.',
  },
  {
    id: 'property-tax',
    label: 'Kommunal eiendomsskatt',
    caveat: 'Bare nasjonale regler er med. Eiendomsskatt, der kommunen har innført den, er ikke med i noen av tallene.',
  },
  {
    id: 'special-rates',
    label: 'Særskilte satser i enkelte kommuner',
    caveat: 'Bø i Vesterålen, Finnmark og Nord-Troms har andre skattesatser enn dem som brukes her.',
  },
  {
    id: 'cohabitant-ownership',
    label: 'Ulik eierandel mellom samboere',
    caveat: 'Formuesskatten regnes som for ektefeller. Det gir samme resultat som lik eierandel, men ikke hvis den ene eier mer enn den andre.',
    appliesTo: (p) => p.adults.length > 1,
  },
  {
    id: 'graded-pension',
    label: 'Gradert uttak av pensjon',
    caveat: 'Pensjonsfradraget regnes som om pensjonen tas ut for hele året og med full uttaksgrad. Ved gradert uttak blir fradraget lavere enn tallet viser.',
    appliesTo: hasPension,
  },
  {
    id: 'tax-limitation',
    label: 'Skattebegrensning for pensjonister',
    caveat: 'Regelen om at skatten ikke kan overstige en andel av inntekten (skattelovens § 17-1) er ikke regnet inn. Den kan gi lavere skatt enn vist.',
    appliesTo: hasPension,
  },
  {
    id: 'wage-and-pension',
    label: 'Lønn og pensjon samtidig',
    caveat: 'Pensjonsfradraget avgrenses mot all skatt du betaler, ikke bare skatten på pensjonen. Med høy lønn kan fradraget bli noe for stort.',
    appliesTo: hasWageAndPension,
  },
  {
    id: 'student-months',
    label: 'Studiemåneder 2026–27',
    caveat: 'Antall støttemåneder står ikke i noen kilde vi har arkivert; 11 måneder er videreført fra tidligere. Endre antallet hvis ditt er et annet.',
    appliesTo: (p) => p.adults.some((a) => a.isStudent),
  },
  {
    id: 'disability-benefit',
    label: 'Uføretrygd',
    caveat: 'Uføretrygd kan ikke legges inn og gir ikke pensjonsfradrag her. Er du ufør, er resultatet ikke til å stole på.',
  },
  {
    id: 'mid-year-rules',
    label: 'Regler som starter midt i året',
    caveat: 'Hovedtallet er helårseffekt. Forslag som trer i kraft midt i 2026 gir mindre i 2026 enn tallet viser; «i 2026»-linjen viser det.',
  },
];

/** The omissions that matter for this profile, in list order. */
export function omissionsFor(profile: UserProfile): readonly Omission[] {
  return OMISSIONS.filter((o) => (o.appliesTo ? o.appliesTo(profile) : true));
}
