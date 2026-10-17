import { useState } from 'react';
import useSWR from 'swr';

import FormCard from '@/components/FormCard';
import RequestDataError from '@/components/RequestDataError';
import DangerousRaw from '@/ds-components/DangerousRaw';
import useApi, { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';
import { type Portal, organizationsKey, portalsKey } from './types';

type Organization = { id: string; name: string };

/**
 * Which Logto organizations may use this portal. Members of a checked organization can connect to
 * the portal; with nothing checked, nobody can.
 */
function PortalAccess({ portal }: { readonly portal: Portal }) {
  const api = useApi();
  const { data, error, isLoading } = useSWR<[Organization[], number], RequestError>(
    organizationsKey
  );
  const { mutate: refreshPortals } = useSWR(portalsKey);
  const [selected, setSelected] = useState<string[]>(portal.organizationIds);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  if (error) {
    return <RequestDataError error={error} />;
  }

  const toggle = (id: string, checked: boolean) => {
    setSelected((current) =>
      checked ? [...current, id] : current.filter((organizationId) => organizationId !== id)
    );
  };

  const save = async () => {
    setIsSaving(true);
    setSaveError(undefined);

    try {
      await api.put(`${portalsKey}/${encodeURIComponent(portal.id)}/organizations`, {
        json: { organizationIds: selected },
      });
      await refreshPortals();
    } catch {
      setSaveError('Could not save access. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const organizations = data?.[0] ?? [];

  return (
    <FormCard title={<DangerousRaw>Access</DangerousRaw>}>
      <p className={styles.description}>
        Members of the checked organizations can use this portal. With none checked, nobody can.
        Changes can take up to a minute to reach people already connected.
      </p>

      {isLoading && <p className={styles.muted}>Loading organizations…</p>}
      {!isLoading && organizations.length === 0 && (
        <p className={styles.muted}>No organizations yet. Create one first, then grant it here.</p>
      )}
      {organizations.map((organization) => (
        <label key={organization.id} className={styles.checkRow}>
          <input
            type="checkbox"
            checked={selected.includes(organization.id)}
            onChange={(event) => {
              toggle(organization.id, event.target.checked);
            }}
          />
          <span>{organization.name}</span>
        </label>
      ))}

      {organizations.length > 0 && (
        <button
          type="button"
          className={styles.submit}
          disabled={isSaving}
          onClick={() => {
            void save();
          }}
        >
          {isSaving ? 'Saving…' : 'Save access'}
        </button>
      )}
      {saveError && (
        <p role="alert" className={styles.error}>
          {saveError}
        </p>
      )}
    </FormCard>
  );
}

export default PortalAccess;
