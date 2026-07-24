/* TE:BEGIN qr-push-factor */
/**
 * TripleEnable · QR + Push factors — inline sign-in panel.
 *
 * Rendered instead of redirecting when the user picks one of the wallet connectors.
 * The device signature is verified by the TripleEnable IdP, which then mints a Logto
 * one-time token; redeeming that token is what actually creates the Logto session, so
 * every native factor (email, SMS, TOTP, passkey) and every Logto policy stay untouched.
 */

import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { identifyAndSubmitInteraction, signInWithOneTimeToken } from '@/apis/experience';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import { LoadingIcon } from '@/shared/components/LoadingLayer';

import { getTeChallenge, listTeDevices, startTeChallenge, type TeDevice } from '../api';
import { TeWalletMode, teChallengeTimeoutMs, tePollIntervalMs } from '../config';

import styles from './index.module.scss';

type Props = {
  readonly mode: TeWalletMode;
  /** Nombre localizado del conector, igual que lo entrega `sign-in-exp`. */
  readonly connectorName: Record<string, string>;
  readonly onClose: () => void;
};

type Step = 'email' | 'picking' | 'waiting';

const TeWalletFactor = ({ mode, connectorName, onClose }: Props) => {
  const {
    i18n: { language },
  } = useTranslation();
  const title = connectorName[language] ?? connectorName.en;
  const { identifierInputValue } = useContext(UserInteractionContext);
  const prefilledEmail =
    identifierInputValue?.type === SignInIdentifier.Email ? identifierInputValue.value : '';

  // QR is device-agnostic, so it can start straight away. Push needs to know who you are.
  const [step, setStep] = useState<Step>(
    mode === TeWalletMode.Qr || prefilledEmail ? 'waiting' : 'email'
  );
  const [email, setEmail] = useState(prefilledEmail);
  const [devices, setDevices] = useState<TeDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<TeDevice>();
  const [qrDataUrl, setQrDataUrl] = useState<string>();
  const [challengeId, setChallengeId] = useState<string>();
  const [error, setError] = useState<string>();

  // Evita actualizar estado si el usuario cierra el panel mientras esperamos al IdP.
  const isMounted = useRef(true);
  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    isMounted.current = true;
    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isMounted.current = false;
    };
  }, []);

  const handleError = useErrorHandler();
  const redirectTo = useGlobalRedirectTo();
  const asyncSignInWithOneTimeToken = useApi(signInWithOneTimeToken);
  const asyncIdentifyAndSubmit = useApi(identifyAndSubmitInteraction);

  /** Opens a challenge: for push it notifies the chosen device, for QR it returns the code to scan. */
  const beginChallenge = useCallback(
    async (deviceId?: string, identity?: string) => {
      setError(undefined);

      try {
        const challenge = await startTeChallenge({
          mode,
          email: identity,
          deviceId,
        });

        if (!isMounted.current) {
          return;
        }

        setChallengeId(challenge.challengeId);
        setQrDataUrl(challenge.qrDataUrl);
        setStep('waiting');
      } catch {
        setError('No pudimos contactar con el IdP de TripleEnable. Inténtalo de nuevo.');
      }
    },
    [mode]
  );

  /** Looks up the identity's enrolled devices so the user can choose where the push lands. */
  const loadDevices = useCallback(
    async (identity: string) => {
      setError(undefined);

      try {
        const { devices: found } = await listTeDevices(identity);

        if (!isMounted.current) {
          return;
        }

        if (found.length === 0) {
          setError('Esta cuenta no tiene ningún dispositivo enrolado.');
          setStep('email');
          return;
        }

        setDevices(found);

        // A single device needs no picker.
        if (found.length === 1 && found[0]) {
          setActiveDevice(found[0]);
          await beginChallenge(found[0].deviceId, identity);
          return;
        }

        setStep('picking');
      } catch {
        setError('No pudimos obtener tus dispositivos. Inténtalo de nuevo.');
        setStep('email');
      }
    },
    [beginChallenge]
  );

  /** Redeems the one-time token minted by the IdP, which creates the Logto session. */
  const completeSignIn = useCallback(
    async (token: string, identity: string) => {
      const [tokenError, verification] = await asyncSignInWithOneTimeToken({
        token,
        identifier: { type: SignInIdentifier.Email, value: identity },
      });

      if (tokenError) {
        await handleError(tokenError);
        onClose();
        return;
      }

      if (!verification) {
        return;
      }

      const [submitError, result] = await asyncIdentifyAndSubmit({
        verificationId: verification.verificationId,
      });

      if (submitError) {
        await handleError(submitError);
        onClose();
        return;
      }

      if (result?.redirectTo) {
        await redirectTo(result.redirectTo);
      }
    },
    [asyncIdentifyAndSubmit, asyncSignInWithOneTimeToken, handleError, onClose, redirectTo]
  );

  // Kick off the QR challenge (or the push one when the email was already typed).
  useEffect(() => {
    if (step !== 'waiting' || challengeId) {
      return;
    }

    if (mode === TeWalletMode.Qr) {
      void beginChallenge();
      return;
    }

    if (prefilledEmail) {
      void loadDevices(prefilledEmail);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait for the wallet to sign.
  useEffect(() => {
    if (!challengeId) {
      return;
    }

    const deadline = Date.now() + teChallengeTimeoutMs;

    const timer = setInterval(async () => {
      if (Date.now() > deadline) {
        clearInterval(timer);
        setError('La solicitud caducó. Vuelve a intentarlo.');
        return;
      }

      try {
        const status = await getTeChallenge(challengeId);

        if (!isMounted.current) {
          clearInterval(timer);
          return;
        }

        if (status.status === 'approved') {
          clearInterval(timer);
          await completeSignIn(status.oneTimeToken, status.email);
          return;
        }

        if (status.status === 'denied' || status.status === 'expired') {
          clearInterval(timer);
          setError(
            status.status === 'denied'
              ? 'La solicitud fue rechazada desde tu dispositivo.'
              : 'La solicitud caducó. Vuelve a intentarlo.'
          );
        }
      } catch {
        // Transient network blips shouldn't kill the wait; the deadline handles the rest.
      }
    }, tePollIntervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [challengeId, completeSignIn]);

  const retry = () => {
    setError(undefined);
    setChallengeId(undefined);
    setQrDataUrl(undefined);
    setActiveDevice(undefined);
    setStep(mode === TeWalletMode.Qr ? 'waiting' : 'email');

    if (mode === TeWalletMode.Qr) {
      void beginChallenge();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.title}>{title}</div>

        {error && (
          <>
            <div className={styles.error}>{error}</div>
            <button type="button" className={styles.primary} onClick={retry}>
              Reintentar
            </button>
          </>
        )}

        {!error && step === 'email' && (
          <>
            <div className={styles.hint}>
              Escribe tu correo para enviar la notificación a tu dispositivo.
            </div>
            <input
              className={styles.input}
              name="te-email"
              type="email"
              placeholder="tu@tripleenable.com"
              value={email}
              onChange={({ target: { value } }) => {
                setEmail(value);
              }}
            />
            <button
              type="button"
              className={styles.primary}
              disabled={!email}
              onClick={() => {
                setStep('waiting');
                void loadDevices(email);
              }}
            >
              Continuar
            </button>
          </>
        )}

        {!error && step === 'picking' && (
          <>
            <div className={styles.hint}>¿A qué dispositivo enviamos la notificación?</div>
            <ul className={styles.devices}>
              {devices.map((device) => (
                <li key={device.deviceId}>
                  <button
                    type="button"
                    className={styles.device}
                    onClick={() => {
                      setActiveDevice(device);
                      void beginChallenge(device.deviceId, email);
                    }}
                  >
                    <span className={styles.deviceName}>{device.name}</span>
                    {device.platform && (
                      <span className={styles.devicePlatform}>{device.platform}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {!error &&
          step === 'waiting' &&
          (mode === TeWalletMode.Qr ? (
            <>
              {qrDataUrl ? <img className={styles.qr} src={qrDataUrl} alt="QR" /> : <LoadingIcon />}
              <div className={styles.hint}>
                Escanea este código con tu wallet TripleEnable y aprueba el acceso.
              </div>
            </>
          ) : (
            <>
              <LoadingIcon />
              <div className={styles.hint}>
                {activeDevice
                  ? `Enviamos una notificación a ${activeDevice.name}. Apruébala para continuar.`
                  : 'Preparando la notificación…'}
              </div>
            </>
          ))}

        <button type="button" className={styles.cancel} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default TeWalletFactor;
/* TE:END qr-push-factor */
