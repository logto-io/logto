import { useState } from 'react';

import useApi from '@/hooks/use-api';

import styles from './index.module.scss';
import { type Upstream } from './types';

/**
 * The bearer token the portal sends to this server. It is write-only: the console can set or clear
 * it, and it never shows the token back. The token is stored encrypted on the server.
 */
function ServerCredential({
  listKey,
  upstream,
  onSaved,
}: {
  readonly listKey: string;
  readonly upstream: Upstream;
  readonly onSaved: () => Promise<unknown>;
}) {
  const api = useApi();
  const [token, setToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const credentialPath = `${listKey}/${encodeURIComponent(upstream.name)}/credential`;

  const save = async () => {
    setIsSaving(true);
    setError(undefined);

    try {
      await api.put(credentialPath, { json: { token } });
      setToken('');
      await onSaved();
    } catch {
      setError(
        `Could not save the token for "${upstream.name}". Check that the portal encryption key is set.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    setIsSaving(true);
    setError(undefined);

    try {
      await api.delete(credentialPath);
      await onSaved();
    } catch {
      setError(`Could not remove the token for "${upstream.name}". Try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.serverAccess}>
      <div className={styles.muted}>
        Token: {upstream.hasCredential ? 'set' : 'not set'}. The portal sends it as a bearer token to
        this server. It is stored encrypted and cannot be read back.
      </div>
      <div className={styles.copyRow}>
        <input
          type="password"
          value={token}
          placeholder="Bearer token"
          aria-label={`Bearer token for ${upstream.name}`}
          autoComplete="off"
          onChange={(event) => {
            setToken(event.target.value);
          }}
        />
        <button type="button" disabled={isSaving || token.length === 0} onClick={() => void save()}>
          {upstream.hasCredential ? 'Replace token' : 'Save token'}
        </button>
        {upstream.hasCredential && (
          <button type="button" className={styles.remove} disabled={isSaving} onClick={() => void remove()}>
            Remove token
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

export default ServerCredential;
