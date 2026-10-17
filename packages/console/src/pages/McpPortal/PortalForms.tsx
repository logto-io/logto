import { type FormEvent, useState } from 'react';

import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';

import styles from './index.module.scss';
import { portalsKey, settingsKey } from './types';

// Sets the domain that portal hostnames are created under, e.g. mcp.example.com.
export function BaseDomainForm({
  baseDomain,
  onSaved,
}: {
  readonly baseDomain?: string;
  readonly onSaved: () => Promise<void>;
}) {
  const api = useApi();
  const [value, setValue] = useState(baseDomain ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>();

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(undefined);

    try {
      await api.put(settingsKey, { json: { baseDomain: value.trim().toLowerCase() } });
      await onSaved();
    } catch {
      setFormError('Could not save the base domain. Use a domain such as mcp.example.com.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <form className={styles.form} onSubmit={save}>
        <label className={styles.field}>
          <span>Base domain</span>
          <input
            required
            value={value}
            placeholder="mcp.example.com"
            onChange={(event) => {
              setValue(event.target.value);
            }}
          />
        </label>
        <button type="submit" className={styles.submit} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save base domain'}
        </button>
      </form>
      {formError && (
        <p role="alert" className={styles.error}>
          {formError}
        </p>
      )}
    </>
  );
}

// Creates a portal from a name and a subdomain. The hostname is <subdomain>.<base domain>.
function CreatePortalForm({
  baseDomain,
  onCreated,
}: {
  readonly baseDomain?: string;
  readonly onCreated: () => Promise<void>;
}) {
  const api = useApi();
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string>();

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFormError(undefined);

    try {
      await api.post(portalsKey, { json: { name, subdomain: subdomain.toLowerCase() } });
      setName('');
      setSubdomain('');
      await onCreated();
    } catch {
      setFormError('Could not create the portal. Check the name and subdomain, then try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <form className={styles.form} onSubmit={create}>
        <label className={styles.field}>
          <span>Name</span>
          <input
            required
            value={name}
            placeholder="Engineering"
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </label>
        <label className={styles.field}>
          <span>Subdomain</span>
          <input
            required
            value={subdomain}
            placeholder="eng"
            onChange={(event) => {
              setSubdomain(event.target.value);
            }}
          />
          <span className={styles.muted}>.{baseDomain}</span>
        </label>
        <button type="submit" className={styles.submit} disabled={isSaving}>
          {isSaving ? 'Creating…' : 'Create portal'}
        </button>
      </form>
      {formError && (
        <p role="alert" className={styles.error}>
          {formError}
        </p>
      )}
    </>
  );
}

// The "Add server portal" dialog. A base domain is set here first, if the tenant has none yet.
export function AddPortalModal({
  baseDomain,
  onClose,
  onCreated,
  onBaseDomainSaved,
}: {
  readonly baseDomain?: string;
  readonly onClose: () => void;
  readonly onCreated: () => Promise<void>;
  readonly onBaseDomainSaved: () => Promise<void>;
}) {
  return (
    <ModalLayout title={<>Add server portal</>} size="medium" onClose={onClose}>
      {baseDomain ? (
        <CreatePortalForm
          baseDomain={baseDomain}
          onCreated={async () => {
            await onCreated();
            onClose();
          }}
        />
      ) : (
        <>
          <p className={styles.description}>
            Portals are created under a base domain. Set it once for this tenant.
          </p>
          <BaseDomainForm baseDomain={baseDomain} onSaved={onBaseDomainSaved} />
        </>
      )}
    </ModalLayout>
  );
}
