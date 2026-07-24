/* TE:BEGIN qr-push-factor */
/**
 * TripleEnable · push sign-in — dedicated screen, reached from the verification-methods
 * list once the user has identified themselves.
 *
 * The push is aimed at one specific enrolled device ("iPhone X"), and approving it uses
 * number matching: the number shown here has to be tapped on the phone, so a blind
 * "approve" under a prompt-bombing attack does not get anyone in.
 */

import { useContext, useEffect, useState } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { LoadingIcon } from '@/shared/components/LoadingLayer';

import TeLayout from '../TeLayout';
import TeSwitchLink from '../TeSwitchLink';
import { listTeDevices, type TeDevice } from '../api';
import { TeWalletMode } from '../config';
import useTeChallenge from '../use-te-challenge';

import styles from './index.module.scss';

type DevicePickerProps = {
  readonly devices: TeDevice[];
  readonly onPick: (device: TeDevice) => void;
};

const DevicePicker = ({ devices, onPick }: DevicePickerProps) => (
  <>
    <div className={styles.hint}>¿A qué dispositivo enviamos la notificación?</div>
    <ul className={styles.devices}>
      {devices.map((device) => (
        <li key={device.deviceId}>
          <button
            type="button"
            className={styles.device}
            onClick={() => {
              onPick(device);
            }}
          >
            <span className={styles.deviceName}>{device.name}</span>
            {device.platform && <span className={styles.devicePlatform}>{device.platform}</span>}
          </button>
        </li>
      ))}
    </ul>
  </>
);

const TePushPage = () => {
  const { identifierInputValue } = useContext(UserInteractionContext);
  const identifier = identifierInputValue?.value ?? '';

  const [devices, setDevices] = useState<TeDevice[]>();
  const [activeDevice, setActiveDevice] = useState<TeDevice>();
  const [lookupError, setLookupError] = useState<string>();
  /** Bumped on retry so the device lookup runs again. */
  const [attempt, setAttempt] = useState(0);

  const { challenge, error, isVerifying, begin, reset } = useTeChallenge(TeWalletMode.Push);

  // Look up where we can send the push as soon as we know who is signing in.
  useEffect(() => {
    if (!identifier) {
      return;
    }

    const load = async () => {
      try {
        const { devices: found } = await listTeDevices(identifier);
        setDevices(found);

        // A single device needs no picker.
        if (found.length === 1 && found[0]) {
          setActiveDevice(found[0]);
          await begin({ email: identifier, deviceId: found[0].deviceId });
        }
      } catch {
        setLookupError('No pudimos obtener tus dispositivos. Inténtalo de nuevo.');
      }
    };

    void load();
  }, [identifier, begin, attempt]);

  const pickDevice = (device: TeDevice) => {
    setActiveDevice(device);
    void begin({ email: identifier, deviceId: device.deviceId });
  };

  if (!identifier) {
    return (
      <TeLayout title="Aprueba desde tu teléfono">
        <div className={styles.error}>
          Vuelve atrás e introduce tu correo o usuario para poder enviar la notificación.
        </div>
      </TeLayout>
    );
  }

  const shownError = error ?? lookupError;
  const view = (() => {
    if (shownError) {
      return 'error';
    }
    if (isVerifying) {
      return 'verifying';
    }
    if (challenge?.matchNumber) {
      return 'match';
    }
    if (!devices) {
      return 'loading';
    }
    return devices.length > 0 ? 'picker' : 'empty';
  })();

  return (
    <TeLayout
      title="Aprueba desde tu teléfono"
      description={
        view === 'match'
          ? 'Abre la notificación de TripleEnable y toca el número que ves aquí.'
          : 'Enviaremos una notificación al dispositivo que elijas.'
      }
    >
      <div className={styles.container}>
        {view === 'error' && (
          <>
            <div className={styles.error}>{shownError}</div>
            <button
              type="button"
              className={styles.retry}
              onClick={() => {
                reset();
                setActiveDevice(undefined);
                setLookupError(undefined);
                setDevices(undefined);
                setAttempt((value) => value + 1);
              }}
            >
              Reintentar
            </button>
          </>
        )}

        {view === 'verifying' && (
          <div className={styles.waiting}>
            <LoadingIcon />
            <div className={styles.hint}>Firma válida. Entrando…</div>
          </div>
        )}

        {view === 'match' && (
          <>
            <div className={styles.match}>
              <div className={styles.matchNumber}>{challenge?.matchNumber}</div>
              <div className={styles.matchLabel}>Número a confirmar</div>
            </div>
            <div className={styles.hint}>
              {activeDevice
                ? `Enviada a ${activeDevice.name}. Esperando tu confirmación…`
                : 'Esperando tu confirmación…'}
            </div>
          </>
        )}

        {view === 'loading' && (
          <div className={styles.waiting}>
            <LoadingIcon />
            <div className={styles.hint}>Buscando tus dispositivos…</div>
          </div>
        )}

        {view === 'empty' && (
          <div className={styles.error}>Esta cuenta no tiene ningún dispositivo enrolado.</div>
        )}

        {view === 'picker' && devices && <DevicePicker devices={devices} onPick={pickDevice} />}

        <TeSwitchLink className={styles.switchLink} />
      </div>
    </TeLayout>
  );
};

export default TePushPage;
/* TE:END qr-push-factor */
