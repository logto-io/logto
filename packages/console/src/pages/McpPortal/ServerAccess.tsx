import { useState } from 'react';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
import useApi, { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';
import { type Upstream, organizationsKey } from './types';

type Organization = { id: string; name: string };

/**
 * Narrows one server to some organizations. With none checked, the server follows the portal: every
 * organization the portal admits can see it.
 */
function ServerAccess({
  listKey,
  upstream,
  onSaved,
}: {
  readonly listKey: string;
  readonly upstream: Upstream;
  readonly onSaved: () => Promise<unknown>;
}) {
  const api = useApi();
  const { data, error, isLoading } = useSWR<[Organization[], number], RequestError>(
    organizationsKey
  );
  const [selected, setSelected] = useState<string[]>(upstream.organizationIds ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  if (error) {
    return <RequestDataError error={error} />;
  }

  const save = async () => {
    setIsSaving(true);
    setSaveError(undefined);

    try {
      await api.patch(`${listKey}/${encodeURIComponent(upstream.name)}`, {
        json: { organizationIds: selected },
      });
      await onSaved();
    } catch {
      setSaveError(`Could not update who can see "${upstream.name}". Try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const organizations = data?.[0] ?? [];

  return (
    <div className={styles.serverAccess}>
      <div className={styles.muted}>
        Visible to:{' '}
        {selected.length === 0 ? 'everyone the portal admits' : `${selected.length} selected`}
      </div>
      {isLoading && <p className={styles.muted}>Loading organizations…</p>}
      {organizations.map((organization) => (
        <label key={organization.id} className={styles.checkRow}>
          <input
            type="checkbox"
            checked={selected.includes(organization.id)}
            onChange={(event) => {
              const { checked } = event.target;
              setSelected((current) =>
                checked
                  ? [...current, organization.id]
                  : current.filter((id) => id !== organization.id)
              );
            }}
          />
          <span>{organization.name}</span>
        </label>
      ))}
      <button
        type="button"
        className={styles.remove}
        disabled={isSaving}
        onClick={() => {
          void save();
        }}
      >
        {isSaving ? 'Saving…' : 'Save visibility'}
      </button>
      {saveError && (
        <p role="alert" className={styles.error}>
          {saveError}
        </p>
      )}
    </div>
  );
}

export default ServerAccess;
