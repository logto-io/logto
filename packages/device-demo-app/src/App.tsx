import { deviceDemoAppApplicationId } from '@logto/schemas';
import { decodeJwt } from 'jose';
import { toDataURL } from 'qrcode';
import { useCallback, useEffect, useRef, useState } from 'react';

import '@/scss/normalized.scss';

import styles from './App.module.scss';
import DevPanel, { getDevConfig } from './DevPanel';
import Footer, { useIsDarkMode } from './Footer';
import congratsDark from './assets/congrats-dark.svg';
import congrats from './assets/congrats.svg';
import logtoIcon from './assets/logto-icon.svg';
import type { AppState, DeviceAuthResponse, TokenResponse, UserInfo } from './types';
import { getStringClaim, parseJsonResponse } from './types';

const defaultScope = 'openid offline_access profile email';

const App = () => {
  const [state, setState] = useState<AppState>('loading');
  const [deviceAuth, setDeviceAuth] = useState<DeviceAuthResponse>();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [user, setUser] = useState<UserInfo>();
  const [idToken, setIdToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');
  const [showDevPanel, setShowDevPanel] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval>>();
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isDarkMode = useIsDarkMode();
  const params = new URL(window.location.href).searchParams;
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- We need to fall back for empty string
  const clientId = params.get('app_id') || deviceDemoAppApplicationId;

  const cleanup = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      pollingRef.current = undefined;
    }
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      expiryTimerRef.current = undefined;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (refreshToken) {
      await fetch('/oidc/token/revocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: refreshToken,
          token_type_hint: 'refresh_token',
          client_id: clientId,
        }),
      });
    }
    // End OIDC session and redirect back to restart the device flow
    if (idToken) {
      const endSessionUrl = new URL('/oidc/session/end', window.location.origin);
      endSessionUrl.searchParams.set('id_token_hint', idToken);
      endSessionUrl.searchParams.set(
        'post_logout_redirect_uri',
        `${window.location.origin}/device-demo-app`
      );
      // eslint-disable-next-line @silverhand/fp/no-mutation
      window.location.href = endSessionUrl.toString();
      return;
    }
    void initiateDeviceFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken, idToken, clientId]);

  const initiateDeviceFlow = useCallback(async () => {
    cleanup();
    setState('loading');
    setError('');
    setUser(undefined);
    setIdToken('');
    setRefreshToken('');
    setAccessToken('');

    const devConfig = getDevConfig();
    const scope = devConfig.scope ?? defaultScope;
    const bodyParams: Record<string, string> = { client_id: clientId, scope };
    if (devConfig.resource) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      bodyParams.resource = devConfig.resource;
    }
    if (devConfig.organizationId) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      bodyParams.organization_id = devConfig.organizationId;
    }

    try {
      const response = await fetch('/oidc/device/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(bodyParams),
      });
      if (!response.ok) {
        const errorData = await parseJsonResponse<Record<string, string>>(response);
        throw new Error(
          errorData.error_description ?? errorData.error ?? 'Failed to initiate device flow'
        );
      }

      const data = await parseJsonResponse<DeviceAuthResponse>(response);
      setDeviceAuth(data);
      const qrUrl = await toDataURL(data.verification_uri_complete, {
        width: 120,
        margin: 0,
        color: { dark: '#191c1d', light: '#ffffff' },
      });
      setQrCodeDataUrl(qrUrl);
      setState('device-code');

      // eslint-disable-next-line @silverhand/fp/no-mutation
      expiryTimerRef.current = setTimeout(() => {
        cleanup();
        setState('expired');
      }, data.expires_in * 1000);

      const interval = (data.interval || 5) * 1000;
      // eslint-disable-next-line @silverhand/fp/no-mutation
      pollingRef.current = setInterval(async () => {
        try {
          const tokenResponse = await fetch('/oidc/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
              device_code: data.device_code,
              client_id: clientId,
            }),
          });
          if (tokenResponse.ok) {
            const tokenData = await parseJsonResponse<TokenResponse>(tokenResponse);
            cleanup();
            setAccessToken(tokenData.access_token);
            if (tokenData.id_token) {
              setIdToken(tokenData.id_token);
              if (tokenData.refresh_token) {
                setRefreshToken(tokenData.refresh_token);
              }
              const claims = decodeJwt(tokenData.id_token);
              setUser({
                sub: getStringClaim(claims, 'sub') ?? 'N/A',
                username: getStringClaim(claims, 'username'),
                email: getStringClaim(claims, 'email'),
              });
            } else {
              setUser({ sub: 'N/A' });
            }
            setState('success');
            return;
          }
          const errorData = await parseJsonResponse<Record<string, string>>(tokenResponse);
          if (errorData.error === 'expired_token') {
            cleanup();
            setState('expired');
          } else if (
            errorData.error !== 'authorization_pending' &&
            errorData.error !== 'slow_down'
          ) {
            cleanup();
            setError(errorData.error_description ?? errorData.error ?? 'Unknown error');
            setState('error');
          }
        } catch {
          // Network error during polling, continue
        }
      }, interval);
    } catch (error_: unknown) {
      setError(error_ instanceof Error ? error_.message : 'Unknown error');
      setState('error');
    }
  }, [clientId, cleanup]);

  useEffect(() => {
    void initiateDeviceFlow();
    return cleanup;
  }, [initiateDeviceFlow, cleanup]);

  if (state === 'loading') {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>Initializing device flow...</div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    );
  }

  if (state === 'success' && user) {
    return (
      <div className={styles.app}>
        {showDevPanel && (
          <DevPanel
            clientId={clientId}
            refreshToken={refreshToken}
            idToken={idToken}
            accessToken={accessToken}
          />
        )}
        <div className={styles.successCard}>
          <img
            className={styles.congratsIcon}
            src={isDarkMode ? congratsDark : congrats}
            alt="Congrats"
          />
          <div className={styles.successTitle}>
            You&apos;ve successfully signed in the demo app.
          </div>
          <div className={styles.successSubtitle}>Here is your log in information:</div>
          <div className={styles.infoCard}>
            {user.email && (
              <div>
                Email: <span>{user.email}</span>
              </div>
            )}
            {user.username && !user.email && (
              <div>
                Username: <span>{user.username}</span>
              </div>
            )}
            <div>
              User ID: <span>{user.sub}</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              void signOut();
            }}
          >
            Sign out the demo app
          </button>
          <button
            type="button"
            className={styles.openDevPanel}
            onClick={() => {
              setShowDevPanel((previous) => !previous);
            }}
          >
            {showDevPanel ? 'Close dev panel' : 'Open dev panel'}
          </button>
        </div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    );
  }

  if (state === 'error' || state === 'expired') {
    return (
      <div className={styles.app}>
        <div className={styles.errorContainer}>
          <div className={styles.errorTitle}>
            {state === 'expired' ? 'Device code expired' : 'Something went wrong'}
          </div>
          <div className={styles.errorMessage}>
            {state === 'expired'
              ? 'The device code has expired. Please try again to get a new code.'
              : error}
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              void initiateDeviceFlow();
            }}
          >
            Try again
          </button>
        </div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img className={styles.icon} src={logtoIcon} alt="Logto" />
          <h1 className={styles.title}>Sign in to your account</h1>
        </div>
        {deviceAuth && (
          <>
            <div className={styles.stepSection}>
              <ol className={styles.stepList} start={1}>
                <li>
                  Scan the QR code, or use a browser on another device to visit:
                  <br />
                  <a
                    className={styles.verificationLink}
                    href={deviceAuth.verification_uri_complete}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {deviceAuth.verification_uri}
                  </a>
                </li>
              </ol>
              <div className={styles.qrCodeBox}>
                {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="Scan to verify" />}
              </div>
            </div>
            <div className={styles.stepSection}>
              <ol className={styles.stepList} start={2}>
                <li>Enter the one-time code</li>
              </ol>
              <div className={styles.userCode}>{deviceAuth.user_code}</div>
            </div>
          </>
        )}
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default App;
