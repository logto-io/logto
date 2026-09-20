import { type IdTokenClaims, Prompt, useLogto } from '@logto/react';
import { useEffect, useState, type FormEventHandler } from 'react';

import styles from './App.module.scss';
import { getLocalData, setLocalData } from './utils';

const StepUpForm = () => {
  const config = getLocalData('stepUp');
  const { signIn, getIdTokenClaims, error } = useLogto();
  const [claims, setClaims] = useState<IdTokenClaims>();

  useEffect(() => {
    const loadClaims = async () => {
      setClaims(await getIdTokenClaims());
    };
    void loadClaims();
  }, [getIdTokenClaims]);

  const submit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setLocalData('stepUp', Object.fromEntries(new FormData(event.currentTarget)));
    const { acrValues, maxAge, prompt } = getLocalData('stepUp');

    await signIn({
      redirectUri: window.location.origin + window.location.pathname,
      clearTokens: false,
      // Override the SDK prompt, rather than appending a duplicate through extraParams.
      prompt: prompt ? [prompt] : [],
      extraParams: {
        ...(acrValues.trim() && { acr_values: acrValues.trim() }),
        ...(maxAge !== '' && { max_age: maxAge }),
      },
    });
  };

  return (
    <form onSubmit={submit}>
      <div className={styles.title}>Step-up authentication</div>
      <div className={styles.text}>
        Request authentication without signing out. These parameters apply only to this request.
      </div>
      <div className={styles.item}>
        <label className={styles.text} htmlFor="step-up-acr-values">
          ACR values (space delimited)
        </label>
        <input
          id="step-up-acr-values"
          name="acrValues"
          defaultValue={config.acrValues}
          placeholder="urn:logto:acr:1fa urn:logto:acr:mfa"
        />
      </div>
      <div className={styles.item}>
        <label className={styles.text} htmlFor="step-up-max-age">
          Max age (seconds)
        </label>
        <input
          id="step-up-max-age"
          name="maxAge"
          type="number"
          min="0"
          step="1"
          defaultValue={config.maxAge}
          placeholder="Optional; 0 requires fresh authentication"
        />
      </div>
      <div className={styles.item}>
        <label className={styles.text} htmlFor="step-up-prompt">
          Prompt
        </label>
        <select id="step-up-prompt" name="prompt" defaultValue={config.prompt}>
          <option value="">No prompt</option>
          <option value={Prompt.Login}>login — force authentication</option>
          <option value={Prompt.None}>none — no interaction</option>
          <option value={Prompt.Consent}>consent — request consent</option>
        </select>
      </div>
      <button type="submit" className={styles.button}>
        Request step-up
      </button>
      {error && <div role="alert">{error.message}</div>}
      <div className={styles.item}>
        <div className={styles.text}>Current ID token authentication context</div>
        <pre className={styles.authenticationContext} aria-label="Current authentication context">
          {JSON.stringify(
            {
              sub: claims?.sub,
              acr: claims?.acr ?? null,
              amr: claims?.amr ?? [],
              auth_time: claims?.auth_time ?? null,
            },
            null,
            2
          )}
        </pre>
      </div>
    </form>
  );
};

export default StepUpForm;
