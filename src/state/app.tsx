import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import { calculateAll, sanitizeProfile } from '../engine/index.ts';
import type { PartyResult, Toggles, UserProfile } from '../types/index.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { loadDataSource, type DataSource } from './data-source.ts';
import { createProfile, profileReducer, type ProfileAction } from './profile.ts';

interface AppContextValue {
  profile: UserProfile;
  dispatchProfile: Dispatch<ProfileAction>;
  toggles: Toggles;
  setToggles: Dispatch<React.SetStateAction<Toggles>>;
  showAdvanced: boolean;
  setShowAdvanced: Dispatch<React.SetStateAction<boolean>>;
  data: DataSource | null;
  dataLoading: boolean;
  dataError: string | null;
  results: PartyResult[] | null;
  /**
   * True once the calculator form has been submitted in this session. `/resultat` redirects to `/`
   * until then. A fresh profile already carries a seeded consumption profile, so "has the user
   * entered data" cannot be read off the profile itself; a zero-income profile is a valid input.
   */
  submitted: boolean;
  /** Marks the form as submitted; the calculator's submit handler calls it. */
  markSubmitted: () => void;
  recalculate: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, dispatchProfile] = useReducer(profileReducer, undefined, createProfile);
  const [toggles, setToggles] = useState<Toggles>(DEFAULT_TOGGLES);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [data, setData] = useState<DataSource | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [results, setResults] = useState<PartyResult[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const markSubmitted = useCallback(() => setSubmitted(true), []);

  useEffect(() => {
    let alive = true;
    setDataLoading(true);
    setDataError(null);
    void loadDataSource()
      .then((source) => {
        if (!alive) return;
        setData(source);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        const message = error instanceof Error ? error.message : String(error);
        setDataError(message);
      })
      .finally(() => {
        if (alive) setDataLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const recalculate = useCallback(() => {
    if (!data) {
      setResults(null);
      return;
    }
    const clean = sanitizeProfile(profile);
    setResults(calculateAll(clean, toggles, data.bundle));
  }, [data, profile, toggles]);

  const value = useMemo<AppContextValue>(
    () => ({
      profile,
      dispatchProfile,
      toggles,
      setToggles,
      showAdvanced,
      setShowAdvanced,
      data,
      dataLoading,
      dataError,
      results,
      submitted,
      markSubmitted,
      recalculate,
    }),
    [
      profile,
      toggles,
      showAdvanced,
      data,
      dataLoading,
      dataError,
      results,
      submitted,
      markSubmitted,
      recalculate,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp må brukes innenfor AppProvider');
  return ctx;
}
