import { HTTPError } from 'ky';
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
  const oauthStartPath = `${listKey}/${encodeURIComponent(upstream.name)}/oauth/start`;

  // Sign in with the server's own OAuth flow. The server returns the approval URL; the browser comes back
  // to the console once the admin has approved access.
  const authenticate = async () => {
    setError(undefined);

    try {
      const { authorizationUrl } = await api
        .post(oauthStartPath)
        .json<{ authorizationUrl: string }>();
      window.location.assign(authorizationUrl);
    } catch (error: unknown) {
      // The server reports a specific reason when it does not offer OAuth; anything else is generic.
      const body =
        error instanceof HTTPError
          ? await error.response
              .clone()
              .json<{ code?: string }>()
              .catch(() => null)
          : null;

      setError(
        body?.code === 'mcp_portal.oauth_unsupported'
          ? 'This server does not offer OAuth sign-in. Paste a bearer token instead.'
          : 'Could not start sign-in with this server. Try again, or paste a bearer token.'
      );
    }
  };

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
        Token: {upstream.hasCredential ? 'set' : 'not set'}. Use OAuth if this server supports it,
        or paste a bearer token. Either way it is stored encrypted and cannot be read back.
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
        <button type="button" disabled={isSaving} onClick={() => void authenticate()}>
          Sign in with OAuth
        </button>
        {upstream.hasCredential && (
          <button
            type="button"
            className={styles.remove}
            disabled={isSaving}
            onClick={() => void remove()}
          >
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
