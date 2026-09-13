import { DataBanner } from './DataBanner.tsx';
import { useApp } from '../state/app.tsx';

/** Institutional pages use the same provisional/beta banner as the calculator. */
export function DocDataBanner() {
  const { data, dataLoading, dataError } = useApp();
  return <DataBanner data={data} loading={dataLoading} error={dataError} />;
}
