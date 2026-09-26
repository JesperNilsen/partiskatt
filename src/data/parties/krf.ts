import type { PartyRuleSet, Provenance } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, krPerUnit, partyRule, patchWealthValuation, pct } from '../rule-helpers.ts';

/** Provenance re-checked by sprint lane L10a against the vision reads of the image-only pages (K2). */
function prov(...args: Parameters<typeof partyProv>): Provenance {
  return { ...partyProv(...args), lastChecked: '2026-09-26' };
}

/**
 * KrF's tax table is PDF p. 19 «Skatter og avgifter»: one raster image with no text layer, read twice
 * independently (sources/worksheets/krf.vision.md). It changes no income-tax rate, bracket, allowance or
 * trygdeavgift (K2, closed 2026-09-26). Encodable: aksjer/driftsmidler 60 pst.; barnetrygd 2 250 kr/mnd;
 * tobakksavgift +15 pst. (derived from Prop. 1 LS).
 */
export const KRF_2026: PartyRuleSet = {
  ...emptyParty('krf'),
  deltas: [
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ listedSharesBp: pct(60), otherBp: pct(60) }),
      'Aksjer og driftsmidler verdsettes til 60 pst.',
      prov(
        'krf',
        'PDF p17',
        'aksjer og driftsmidler fra 80 til 60 pst',
        'Agreed-value fra p17; bekreftet i skattetabellen p19 (bilde): «Redusert verdsettelse fra 80 til 60 pst. på aksjer og driftsmidler», −5 400 mill.',
        '2026-01-01',
        'medium',
      ),
      { note: 'Kun aksjer/driftsmidler er kodet; boligdelen (over 8 mill. kr) står som ikke-tallfestet forslag.' },
    ),
    partyRule(
      'benefit.childBenefit',
      {
        ...adoptedParams('benefit.childBenefit'),
        under6PerMonth: kr(2_250),
        from6PerMonth: kr(2_250),
      },
      'Barnetrygd 2 250 kr/mnd (aldersnøytral)',
      prov(
        'krf',
        'PDF p9',
        '2 250 kroner i måneden',
        'Én sats for alle barn 0–18; utvidet barnetrygd ikke differensiert. Ikrafttredelse fra p35 (bilde, BFD kap 845 post 70): «Økt barnetrygd til 2250 kr per mnd fra 1.3.2026».',
        '2026-03-01',
      ),
      { note: 'no-baseline-quoted; aldersspesifikke satser ikke oppgitt; gjelder fra 1.3.2026.' },
    ),
    partyRule(
      'excise.cigarette',
      { ratePerUnit: krPerUnit(3.8065) },
      'Tobakksavgift sigaretter +15 pst. (3,8065 kr/stk)',
      prov(
        'krf',
        'PDF p19',
        'Avgift på tobakksvarer, 15 pst. økning',
        'Skattetabellen p19 (bilde, kap 5531 post 70), to uavhengige lesninger. Partiet oppgir ikke baseline; utledet fra Prop. 1 LS Tabell 1.8 (PDF p38) «Sigaretter, kr/100 stk» 331 × 1,15 = 380,65 kr/100 stk.',
        '2026-01-01',
        'medium',
      ),
      { note: 'Utledet (beslutning 2): Prop. 1 LS 3,31 kr/stk × 1,15. Proveny p19: 930 mill. bokført / 1 010 mill. påløpt for alle tobakksvarer.' },
    ),
    partyRule(
      'excise.snusGram',
      { ratePerUnit: krPerUnit(1.173) },
      'Tobakksavgift snus +15 pst. (1,173 kr/g)',
      prov(
        'krf',
        'PDF p19',
        'Avgift på tobakksvarer, 15 pst. økning',
        'Skattetabellen p19 (bilde, kap 5531 post 70), to uavhengige lesninger. Partiet oppgir ikke baseline; utledet fra Prop. 1 LS Tabell 1.8 (PDF p38) «Snus, kr/100 gram» 102 × 1,15 = 117,3 kr/100 g.',
        '2026-01-01',
        'medium',
      ),
      { note: 'Utledet (beslutning 2): Prop. 1 LS 1,02 kr/g × 1,15. Samme 15 pst.-rad som sigaretter; snus er ikke nevnt særskilt.' },
    ),
  ],
  reviewed: {
    employer: {
      status: 'no-change',
      pageOrTable: 'PDF p17–19',
      note: 'Arbeidsgiveravgift er ikke foreslått endret; skattetabellen p19 har ingen rad for den.',
    },
  },
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Arbeidsfradrag for unge (født 1991–2006) på inntil 100 000 kr',
      status: 'unquantified',
      reason:
        'Nytt fradrag uten formel i modellen. Skattetabellen p19 (bilde) oppgir aldersgruppen og −4 000 mill., men ikke sats, opptrapping eller avtrapping.',
      provenance: prov('krf', 'PDF p17', 'alle unge på maksimalt 100 000 kroner', 'Prosa p17; detaljer fra p19 (bilde).'),
    },
    {
      category: 'direct-tax',
      title: 'Går imot regjeringens forsøk med arbeidsfradrag',
      status: 'unquantified',
      reason: 'Reverserer et forslag i Prop. 1 LS som ikke er en formel i modellen; p19 (bilde) gir bare provenyet +500 mill.',
      provenance: prov('krf', 'PDF p17', 'si nei til regjeringens', '«si nei til regjeringens skattelotteri» (p17); p19-raden «Går imot regjeringens forsøk m. arbeidsfradrag».'),
    },
    {
      category: 'direct-tax',
      title: 'Foreldrefradrag 50 000 kr per barn for barn 1–2 og 100 000 kr fra barn 3',
      status: 'unquantified',
      reason:
        'Foreldrefradraget er ikke en formel i modellen, og dagens nivå er ikke oppgitt. Skattetabellen p19 (bilde): −1 300 mill. bokført / −5 100 mill. påløpt.',
      provenance: prov('krf', 'PDF p9', 'å øke foreldrefradraget til 50 000 kroner', 'Prosa p9; bekreftet i p19 (bilde).'),
    },
    {
      category: 'direct-tax',
      title: 'Skattefradrag for gaver til frivillighet fra 25 000 til 50 000 kr',
      status: 'unquantified',
      reason: 'Gavefradraget er ikke en formel i modellen. p19 (bilde): 100 000 kr for næringsdrivende, −120 mill. påløpt.',
      provenance: prov('krf', 'PDF p29', 'skattefradraget for frivillige gaver', 'Prosa p29; beløpene fra p19 (bilde).'),
    },
    {
      category: 'wealth-tax',
      title: 'Boliger med verdi over 8 mill. kr verdsettes med 100 pst.',
      status: 'unquantified',
      reason:
        'Skattetabellen p19 (bilde) sier «Boliger med verdi o. 8 mill. kr verdsettes med 100 pst.» (+2 065 mill.), men ikke om 100 pst. gjelder hele boligverdien eller bare delen over 8 mill., og skiller ikke primær- fra sekundærbolig. Kan ikke kodes entydig.',
      provenance: prov('krf', 'PDF p17', 'over 8 mill. kroner, for å dempe', 'Prosa p17 («fjerne verdsettelsesrabatten»); satsen fra p19 (bilde).'),
    },
    {
      category: 'consumption-tax',
      title: 'Fjerne mva-fritaket for elbiler',
      status: 'unquantified',
      reason: 'Endrer avgiftsgrunnlaget for ett bilkjøp, ikke en sats i modellen; effekten avhenger av om og hvilken bil husholdningen kjøper.',
      provenance: prov('krf', 'PDF p18', 'elbiler helt fra 1. januar', 'Prosa p18; p19 (bilde): +6 600 mill. bokført.'),
    },
    {
      category: 'consumption-tax',
      title: 'Alkoholavgift økt reelt til Særavgiftsutvalgets nivå (NOU 2007:8)',
      status: 'unquantified',
      reason:
        'p19 (bilde): «Særavgiftsutvalgets (NOU 2007:8) forslag om 10 pst. økning i 2008, reell økning». Viser til en anbefaling fra 2008, ikke en sats mot Prop. 1 LS, og deler ikke på øl, vin og brennevin, så aritmetikken er ikke entydig.',
      provenance: prov('krf', 'PDF p18', 'Vi øker alkoholavgiftene reelt til', 'Prosa p18; raden fra p19 (bilde).'),
    },
    {
      category: 'consumption-tax',
      title: 'Alkoholavgift: halvering av innførselskvoten',
      status: 'unquantified',
      reason: 'Endrer tollfri kvote, ikke en sats i modellen; effekten avhenger av grensehandel. p19 (bilde): +950 mill. bokført.',
      provenance: prov('krf', 'PDF p19', 'Alkoholavgift: Halvering av innførselskvoten', 'Skattetabellen p19 (bilde), to uavhengige lesninger.'),
    },
    {
      category: 'consumption-tax',
      title: 'Avgift på sjokolade og sukkervarer og på sukkerholdige alkoholfrie drikkevarer gjeninnføres',
      status: 'unquantified',
      reason:
        'Ingen formel i modellen. p19 (bilde) viser til «2020-satser» og «Solberg-regjeringens forslag RNB 2021», men satsene står ikke i dokumentet.',
      provenance: prov('krf', 'PDF p18', 'avgiftene på brus og sukker', 'Prosa p18; radene fra p19 (bilde).'),
    },
  ],
};
