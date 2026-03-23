import { decodeJwt } from 'jose';
import { useCallback, useState, type FormEventHandler } from 'react';

import styles from './App.module.scss';
import { parseJsonResponse } from './types';

const localStorageKeyPrefix = 'logto:device-demo-app:dev:';

type DevConfig = {
  scope?: string;
  resource?: string;
  organizationId?: string;
};

const safeDecodeJwt = (token: string) => {
  try {
    return decodeJwt(token);
  } catch {
    return token;
  }
};

export const getDevConfig = (): DevConfig => {
  try {
    const raw = localStorage.getItem(`${localStorageKeyPrefix}config`);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      const record: Record<string, unknown> = Object.fromEntries(Object.entries(parsed));
      return {
        scope: typeof record.scope === 'string' ? record.scope : undefined,
        resource: typeof record.resource === 'string' ? record.resource : undefined,
        organizationId:
          typeof record.organizationId === 'string' ? record.organizationId : undefined,
      };
    }
    return {};
  } catch {
    return {};
  }
};

const setDevConfig = (config: DevConfig) => {
  localStorage.setItem(`${localStorageKeyPrefix}config`, JSON.stringify(config));
};

type DevPanelProps = {
  readonly clientId: string;
  readonly refreshToken: string;
  readonly idToken: string;
  readonly accessToken: string;
};

const DevPanel = ({ clientId, refreshToken, idToken, accessToken }: DevPanelProps) => {
  const config = getDevConfig();
  const [showSaved, setShowSaved] = useState(false);

  const submitConfig: FormEventHandler<HTMLFormElement> = useCallback((event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    setDevConfig({
      scope: typeof data.scope === 'string' ? data.scope : undefined,
      resource: typeof data.resource === 'string' ? data.resource : undefined,
      organizationId: typeof data.organizationId === 'string' ? data.organizationId : undefined,
    });
    setShowSaved(true);

    setTimeout(() => {
      setShowSaved(false);
    }, 500);
  }, []);

  const requestToken: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      if (!refreshToken) {
        console.log('No refresh token available');
        return;
      }

      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
      });

      if (typeof data.resource === 'string' && data.resource) {
        body.set('resource', data.resource);
      }
      if (typeof data.organizationId === 'string' && data.organizationId) {
        body.set('organization_id', data.organizationId);
      }

      try {
        const response = await fetch('/oidc/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });

        const result = await parseJsonResponse<Record<string, unknown>>(response);
        const tokenValue = result.access_token;
        if (typeof tokenValue === 'string') {
          console.log(safeDecodeJwt(tokenValue));
        } else {
          console.log(result);
        }
      } catch (error: unknown) {
        console.error('Token request failed:', error);
      }
    },
    [refreshToken, clientId]
  );

  return (
    <div className={styles.devPanel}>
      <form onSubmit={submitConfig}>
        <div className={styles.title}>Device auth config</div>
        <div className={styles.item}>
          <div className={styles.text}>Scope</div>
          <input
            name="scope"
            defaultValue={config.scope}
            type="text"
            placeholder="openid offline_access profile email"
          />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Resource</div>
          <input name="resource" defaultValue={config.resource} type="text" />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Organization ID</div>
          <input name="organizationId" defaultValue={config.organizationId} type="text" />
        </div>
        <div className={styles.action}>
          <div className={styles.text}>Sign out to apply changes.</div>
          <button type="submit" className={styles.button}>
            {showSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </form>
      <form onSubmit={requestToken}>
        <div className={styles.title}>Refresh token grant</div>
        <div className={styles.item}>
          <div className={styles.text}>Resource</div>
          <input name="resource" type="text" />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Organization ID</div>
          <input name="organizationId" type="text" />
        </div>
        <div className={styles.text}>See console for the result.</div>
        <button type="submit" className={styles.button}>
          Request token
        </button>
      </form>
      <div>
        <div className={styles.title}>Token info</div>
        <div className={styles.text}>See console for the result.</div>
        <p>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              if (idToken) {
                console.log(safeDecodeJwt(idToken));
              } else {
                console.log('No ID token available');
              }
            }}
          >
            Get ID token claims
          </button>
        </p>
        <p>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              if (accessToken) {
                console.log(safeDecodeJwt(accessToken));
              } else {
                console.log('No access token available');
              }
            }}
          >
            Get access token
          </button>
        </p>
      </div>
    </div>
  );
};

export default DevPanel;
