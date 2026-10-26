import { useLogto } from '@logto/react';
import { demoAppApplicationId } from '@logto/schemas';
import { decodeJwt } from 'jose';
import { useCallback, useState, type FormEventHandler } from 'react';

import styles from './App.module.scss';
import StepUpForm from './StepUpForm';
import { getLocalData, isDevFeaturesEnabled, setLocalData } from './utils';

const safeDecodeJwt = (token: string) => {
  try {
    return decodeJwt(token);
  } catch {
    return token;
  }
};

type TokenResult =
  | { type: 'token'; resource?: string; decoded: unknown }
  | { type: 'error'; message: string };

const DevPanel = () => {
  const config = getLocalData('config');
  const [tokenResult, setTokenResult] = useState<TokenResult>();
  const { getAccessToken, clearAccessToken, getIdTokenClaims, fetchUserInfo, error } = useLogto();
  const defaultResource = config.resource?.trim().split(/\s+/).find(Boolean);

  const submitConfig: FormEventHandler<HTMLFormElement> = useCallback((event) => {
    event.preventDefault();
    setLocalData('config', Object.fromEntries(new FormData(event.currentTarget).entries()));

    // Reload with a fresh provider config, then start an authorization request so that new
    // scopes and resources are actually granted instead of being refreshed from the old grant.
    const url = new URL(window.location.href);
    url.searchParams.set('reauthenticate', '1');
    window.location.assign(url);
  }, []);

  const requestToken: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      setTokenResult(undefined);
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());
      const resource = data.resource ? String(data.resource) : undefined;
      const organizationId = data.organizationId ? String(data.organizationId) : undefined;

      // Clear the cached access token so this always exercises the refresh token grant.
      await clearAccessToken();
      const token = await getAccessToken(resource, organizationId);

      if (!token) {
        setTokenResult({ type: 'error', message: 'No access token returned.' });
        return;
      }

      const decoded = safeDecodeJwt(token);
      console.log(decoded);
      setTokenResult({ type: 'token', resource, decoded });
    },
    [clearAccessToken, getAccessToken]
  );

  return (
    <div className={[styles.card, styles.devPanel].join(' ')}>
      {/* Step-up testing tools. */}
      {isDevFeaturesEnabled && error && <div role="alert">Last SDK error: {error.message}</div>}
      {isDevFeaturesEnabled && <StepUpForm />}
      <form onSubmit={submitConfig}>
        <div className={styles.title}>Logto config</div>
        <div className={styles.item}>
          <div className={styles.text}>App ID</div>
          <input
            name="appId"
            defaultValue={config.appId}
            type="text"
            placeholder={demoAppApplicationId}
          />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Sign-in extra params</div>
          <input
            name="signInExtraParams"
            defaultValue={config.signInExtraParams}
            type="text"
            placeholder="foo=bar&baz=qux"
          />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Prompt</div>
          <input
            name="prompt"
            defaultValue={config.prompt}
            type="text"
            placeholder="login consent"
          />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Scope</div>
          <input name="scope" defaultValue={config.scope} type="text" placeholder="foo bar" />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Resource (space delimited)</div>
          <input name="resource" defaultValue={config.resource} type="text" />
        </div>
        <div className={styles.action}>
          <div className={styles.text}>
            Saving starts a new authorization request to apply the new scopes and resources.
          </div>
          <button type="submit" className={styles.button}>
            Save &amp; re-authenticate
          </button>
        </div>
      </form>
      <form onSubmit={requestToken}>
        <div className={styles.title}>Refresh token grant</div>
        <div className={styles.item}>
          <div className={styles.text}>Resource</div>
          <input name="resource" defaultValue={defaultResource} type="text" />
        </div>
        <div className={styles.item}>
          <div className={styles.text}>Organization ID</div>
          <input name="organizationId" type="text" />
        </div>
        <div className={styles.action}>
          <button type="submit" className={styles.button}>
            Request token
          </button>
        </div>
        {tokenResult && (
          <div className={styles.item}>
            {tokenResult.type === 'error' ? (
              <div role="alert" className={styles.text}>
                {error?.message ?? tokenResult.message}
              </div>
            ) : (
              <>
                <div className={styles.text}>
                  {typeof tokenResult.decoded === 'string'
                    ? 'Opaque access token (not a JWT)'
                    : `Decoded JWT access token${
                        tokenResult.resource ? ` for ${tokenResult.resource}` : ''
                      }`}
                </div>
                <pre className={styles.authenticationContext}>
                  {typeof tokenResult.decoded === 'string'
                    ? tokenResult.decoded
                    : JSON.stringify(tokenResult.decoded, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </form>
      <div>
        <div className={styles.title}>User info</div>
        <div className={styles.text}>See console for the result.</div>
        <p>
          <button
            className={styles.button}
            onClick={async () => {
              console.log(await getIdTokenClaims());
            }}
          >
            Get ID token claims
          </button>
        </p>
        <p>
          <button
            className={styles.button}
            onClick={async () => {
              console.log(await fetchUserInfo());
            }}
          >
            Fetch user info
          </button>
        </p>
      </div>
    </div>
  );
};
export default DevPanel;
