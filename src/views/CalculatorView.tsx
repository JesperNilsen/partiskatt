import { useLocation } from 'wouter';
import { Field } from '../components/Field.tsx';
import { MoneyInput } from '../components/MoneyInput.tsx';
import { DataBanner } from '../components/DataBanner.tsx';
import { ExciseUnitsFields } from '../components/ExciseUnitsFields.tsx';
import { ScenarioToggles } from '../components/ScenarioToggles.tsx';
import { BRAND } from '../config/brand.ts';
import { CONSUMPTION_PROFILES } from '../data/consumption-profiles.ts';
import { useApp } from '../state/app.tsx';
import type { ConsumptionProfileId } from '../types/index.ts';
import { VAT_CATEGORIES } from '../types/index.ts';

const VAT_LABELS: Record<string, string> = {
  food: 'Mat',
  general: 'Varer og tjenester',
  transportServices: 'Kollektivtransport',
  electricity: 'Strøm',
  fuel: 'Drivstoff',
  alcoholTobacco: 'Alkohol og tobakk',
  flights: 'Flyreiser',
  exempt: 'Avgiftsfritt forbruk',
};

export function CalculatorView() {
  const [, navigate] = useLocation();
  const {
    profile,
    dispatchProfile,
    toggles,
    setToggles,
    showAdvanced,
    setShowAdvanced,
    data,
    dataLoading,
    dataError,
    profileEmpty,
    recalculate,
  } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileEmpty || dataLoading || !data) return;
    recalculate();
    navigate('/resultat');
  };

  const adult = profile.adults[0];
  const adult2 = profile.adults[1];

  return (
    <>
      <DataBanner data={data} loading={dataLoading} error={dataError} />

      <header className="page-header">
        <h1>{BRAND.tagline}</h1>
        <p className="lede">
          Se hvor mange kroner mer eller mindre du ville sittet igjen med under hvert partis alternative statsbudsjett for 2026.
        </p>
      </header>

      <form className="calc-form" onSubmit={handleSubmit}>
        <section className="card">
          <h2>Hvem beregner du for?</h2>
          <div className="segmented" role="group" aria-label="Person eller husholdning">
            <button
              type="button"
              className={profile.mode === 'person' ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
              onClick={() => dispatchProfile({ type: 'mode', mode: 'person' })}
            >
              Én person
            </button>
            <button
              type="button"
              className={profile.mode === 'household' ? 'segmented__btn segmented__btn--active' : 'segmented__btn'}
              onClick={() => dispatchProfile({ type: 'mode', mode: 'household' })}
            >
              Husholdning
            </button>
          </div>
        </section>

        <section className="card">
          <h2>Inntekt</h2>
          <Field label="Årlig brutto arbeidsinntekt" id="wage-0" hint="Før skatt, pensjon og trygd.">
            <MoneyInput
              id="wage-0"
              value={adult.wageIncome}
              onChange={(v) => dispatchProfile({ type: 'adult', index: 0, patch: { wageIncome: v } })}
            />
          </Field>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={adult.isStudent}
              onChange={(e) => dispatchProfile({ type: 'adult', index: 0, patch: { isStudent: e.target.checked, studyMonths: e.target.checked ? 10 : 0 } })}
            />
            Student med inntekt fra jobb (gir 10 måneder studiestøtte)
          </label>

          {profile.mode === 'household' && adult2 ? (
            <Field label="Årlig brutto arbeidsinntekt (voksen 2)" id="wage-1">
              <MoneyInput
                id="wage-1"
                value={adult2.wageIncome}
                onChange={(v) => dispatchProfile({ type: 'adult', index: 1, patch: { wageIncome: v } })}
              />
            </Field>
          ) : null}
        </section>

        <section className="card">
          <h2>Barn</h2>
          <p className="field__hint">Alder under 18 — brukes til barnetrygd og husholdningsstørrelse.</p>
          {profile.childrenAges.length === 0 ? (
            <p className="muted">Ingen barn registrert.</p>
          ) : (
            <ul className="child-list">
              {profile.childrenAges.map((age, i) => (
                <li key={i}>
                  <Field label={`Barn ${i + 1}`} id={`child-${i}`}>
                    <input
                      id={`child-${i}`}
                      type="number"
                      min={0}
                      max={17}
                      value={age}
                      onChange={(e) =>
                        dispatchProfile({ type: 'childAge', index: i, age: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <button type="button" className="btn btn--ghost" onClick={() => dispatchProfile({ type: 'removeChild', index: i })}>
                    Fjern
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="btn btn--ghost" onClick={() => dispatchProfile({ type: 'addChild' })}>
            Legg til barn
          </button>
        </section>

        <section className="card">
          <h2>Forbruk</h2>
          <div className="profile-picks">
            {CONSUMPTION_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={
                  profile.consumptionProfileId === p.id
                    ? 'profile-pick profile-pick--active'
                    : 'profile-pick'
                }
                onClick={() => dispatchProfile({ type: 'consumptionProfile', id: p.id as ConsumptionProfileId })}
              >
                <strong>{p.label}</strong>
                <span>{p.blurb}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <button
            type="button"
            className="btn btn--ghost advanced-toggle"
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? 'Skjul avanserte felt' : 'Avanserte felt'}
          </button>

          {showAdvanced ? (
            <div className="advanced-panel">
              <h3>Formue og gjeld</h3>
              <Field label="Primærbolig (markedsverdi)" id="wealth-primary">
                <MoneyInput
                  id="wealth-primary"
                  value={profile.wealth.primaryHomeValue}
                  onChange={(v) => dispatchProfile({ type: 'wealth', patch: { primaryHomeValue: v } })}
                />
              </Field>
              <Field label="Sekundærbolig (markedsverdi)" id="wealth-secondary">
                <MoneyInput
                  id="wealth-secondary"
                  value={profile.wealth.secondaryHomeValue}
                  onChange={(v) => dispatchProfile({ type: 'wealth', patch: { secondaryHomeValue: v } })}
                />
              </Field>
              <Field label="Gjeld" id="wealth-debt">
                <MoneyInput
                  id="wealth-debt"
                  value={profile.wealth.debt}
                  onChange={(v) => dispatchProfile({ type: 'wealth', patch: { debt: v } })}
                />
              </Field>
              <Field label="Bankinnskudd" id="wealth-bank">
                <MoneyInput
                  id="wealth-bank"
                  value={profile.wealth.bankDeposits}
                  onChange={(v) => dispatchProfile({ type: 'wealth', patch: { bankDeposits: v } })}
                />
              </Field>
              <Field label="Aksjer og fond" id="wealth-shares">
                <MoneyInput
                  id="wealth-shares"
                  value={profile.wealth.listedShares}
                  onChange={(v) => dispatchProfile({ type: 'wealth', patch: { listedShares: v } })}
                />
              </Field>

              <Field label="Annen skattepliktig formue" id="wealth-other">
                <MoneyInput
                  id="wealth-other"
                  value={profile.wealth.otherTaxableWealth}
                  onChange={(v) => dispatchProfile({ type: 'wealth', patch: { otherTaxableWealth: v } })}
                />
              </Field>

              <h3>Kapitalinntekt og fradrag</h3>
              <Field label="Kapitalinntekt" id="capital-0">
                <MoneyInput
                  id="capital-0"
                  value={adult.capitalIncome}
                  onChange={(v) => dispatchProfile({ type: 'adult', index: 0, patch: { capitalIncome: v } })}
                />
              </Field>
              <Field label="Renteutgifter" id="interest-0">
                <MoneyInput
                  id="interest-0"
                  value={adult.interestExpense}
                  onChange={(v) => dispatchProfile({ type: 'adult', index: 0, patch: { interestExpense: v } })}
                />
              </Field>

              <h3>Forbrukskategorier (kr/år inkl. mva)</h3>
              {VAT_CATEGORIES.map((cat) => (
                <Field key={cat} label={VAT_LABELS[cat] ?? cat} id={`spend-${cat}`}>
                  <MoneyInput
                    id={`spend-${cat}`}
                    value={profile.consumption.spend[cat]}
                    onChange={(v) => dispatchProfile({ type: 'spend', category: cat, value: v })}
                  />
                </Field>
              ))}

              <ExciseUnitsFields
                units={profile.consumption.units}
                onChange={(good, value) => dispatchProfile({ type: 'units', good, value })}
              />

              <h3>Scenario-brytere</h3>
              <ScenarioToggles bundle={data?.bundle ?? null} toggles={toggles} setToggles={setToggles} />
              <p className="field__hint">
                Arbeidsgiveravgift betales av arbeidsgiveren. Vi bruker full langsiktig incidens på arbeidstakeren som foreløpig antagelse.
              </p>
            </div>
          ) : null}
        </section>

        {profileEmpty ? (
          <p className="empty-hint" role="status">
            Fyll inn minst én inntekt eller formue for å beregne.
          </p>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={profileEmpty || dataLoading || !data}>
            Se resultat
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => dispatchProfile({ type: 'reset' })}>
            Nullstill
          </button>
        </div>
      </form>
    </>
  );
}
