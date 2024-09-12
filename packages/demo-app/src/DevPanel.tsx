import { useLogto } from '@logto/react';
import { demoAppApplicationId } from '@logto/schemas';
import { decodeJwt } from 'jose';
import { useCallback, useState, type FormEventHandler } from 'react';

import styles from './App.module.scss';
import { getLocalData, setLocalData } from './utils';

const safeDecodeJwt = (token: string) => {
  try {
    return decodeJwt(token);
  } catch {
    return token;
  }
};

const DevPanel = () => {
  const config = getLocalData('config');
  const [showSaved, setShowSaved] = useState(false);
  const { getAccessToken, getIdTokenClaims, fetchUserInfo } = useLogto();

  const submitConfig: FormEventHandler<HTMLFormElement> = useCallback((event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    setLocalData('config', data);
    setShowSaved(true);

    setTimeout(() => {
      setShowSaved(false);
    }, 500);
  }, []);

  const requestToken: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const data = Object.fromEntries(formData.entries());
      const token = await getAccessToken(
        data.resource ? String(data.resource) : undefined,
        data.organizationId ? String(data.organizationId) : undefined
      );
      console.log(token ? safeDecodeJwt(token) : 'No token');
    },
    [getAccessToken]
  );

  return (
    <div className={[styles.card, styles.devPanel].join(' ')}>
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
        <div className={styles.action}>
          <div className={styles.text}>See console for the result.</div>
          <button type="submit" className={styles.button}>
            Request token
          </button>
        </div>
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
