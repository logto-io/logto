import { deviceDemoAppApplicationId } from '@logto/schemas';
import { decodeJwt } from 'jose';
import { useCallback, useState, type FormEventHandler } from 'react';

import styles from './App.module.scss';
import { parseJsonResponse } from './types';

const localStorageKeyPrefix = 'logto:device-demo-app:dev:';

export type DevConfig = {
  appId?: string;
  scope?: string;
  resource?: string;
  organizationId?: string;
};

export const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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
        appId: normalizeOptionalString(record.appId),
        scope: normalizeOptionalString(record.scope),
        resource: normalizeOptionalString(record.resource),
        organizationId: normalizeOptionalString(record.organizationId),
      };
    }
    return {};
  } catch {
    return {};
  }
};

export const clearDevConfig = () => {
  localStorage.removeItem(`${localStorageKeyPrefix}config`);
};

export const hasDevConfig = (): boolean => {
  const config = getDevConfig();
  return Boolean(config.appId ?? config.scope ?? config.resource ?? config.organizationId);
};

const setDevConfig = (config: DevConfig) => {
  localStorage.setItem(`${localStorageKeyPrefix}config`, JSON.stringify(config));
};

type DevPanelProps = {
  readonly clientId: string;
  readonly urlAppId?: string;
  readonly refreshToken: string;
  readonly idToken: string;
  readonly accessToken: string;
};

const DevPanel = ({ clientId, urlAppId, refreshToken, idToken, accessToken }: DevPanelProps) => {
  const config = getDevConfig();
  const [appIdInput, setAppIdInput] = useState(urlAppId ?? config.appId ?? '');
  const [showSaved, setShowSaved] = useState(false);

  const effectiveFormClientId =
    urlAppId ?? normalizeOptionalString(appIdInput) ?? deviceDemoAppApplicationId;
  const isBuiltInFormClient = effectiveFormClientId === deviceDemoAppApplicationId;
  const isBuiltInSessionClient = clientId === deviceDemoAppApplicationId;

  const submitConfig: FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());
      const nextAppId = urlAppId ? config.appId : normalizeOptionalString(appIdInput);
      const effectiveNextClientId = urlAppId ?? nextAppId ?? deviceDemoAppApplicationId;
      const isBuiltInNext = effectiveNextClientId === deviceDemoAppApplicationId;

      setDevConfig({
        appId: nextAppId === deviceDemoAppApplicationId ? undefined : nextAppId,
        scope: normalizeOptionalString(data.scope),
        resource: isBuiltInNext ? undefined : normalizeOptionalString(data.resource),
        organizationId: isBuiltInNext ? undefined : normalizeOptionalString(data.organizationId),
      });
      setShowSaved(true);

      setTimeout(() => {
        setShowSaved(false);
      }, 500);
    },
    [appIdInput, config.appId, urlAppId]
  );

  const requestToken: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      if (isBuiltInSessionClient) {
        return;
      }

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
    [refreshToken, clientId, isBuiltInSessionClient]
  );

  return (
    <div className={styles.devPanel}>
      <form onSubmit={submitConfig}>
        <div className={styles.title}>Device auth config</div>
        {isBuiltInFormClient && (
          <div className={styles.notice} role="note">
            Built-in <code>{deviceDemoAppApplicationId}</code> only supports basic OIDC scopes (
            <code>openid offline_access profile email</code>) and cannot request API resources or
            organizations. Enter a registered Device Flow App ID below (or pass{' '}
            <code>?app_id=</code>) to test custom scopes, resources, or organizations.
          </div>
        )}
        <div className={styles.item}>
          <div className={styles.text}>
            App ID{urlAppId ? ' (controlled by ?app_id= URL param)' : ''}
          </div>
          <input
            name="appId"
            value={urlAppId ?? appIdInput}
            disabled={Boolean(urlAppId)}
            type="text"
            placeholder={deviceDemoAppApplicationId}
            onChange={(event) => {
              setAppIdInput(event.target.value);
            }}
          />
        </div>
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
          <input
            name="resource"
            defaultValue={isBuiltInFormClient ? '' : config.resource}
            disabled={isBuiltInFormClient}
            type="text"
          />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Organization ID</div>
          <input
            name="organizationId"
            defaultValue={isBuiltInFormClient ? '' : config.organizationId}
            disabled={isBuiltInFormClient}
            type="text"
          />
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
        {isBuiltInSessionClient && (
          <div className={styles.text}>
            Requires a registered Device Flow App ID to request resource or organization tokens.
          </div>
        )}
        <div className={styles.item}>
          <div className={styles.text}>Resource</div>
          <input name="resource" disabled={isBuiltInSessionClient} type="text" />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Organization ID</div>
          <input name="organizationId" disabled={isBuiltInSessionClient} type="text" />
        </div>
        <div className={styles.text}>See console for the result.</div>
        <button type="submit" className={styles.button} disabled={isBuiltInSessionClient}>
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
