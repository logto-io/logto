/* TE:BEGIN qr-push-factor */
/**
 * TripleEnable · QR sign-in — dedicated screen, reached from the sign-in page the same
 * way the passkey screen is. The wallet scans the code and signs the challenge.
 */

import { useEffect, useMemo } from 'react';

import { LoadingIcon } from '@/shared/components/LoadingLayer';

import TeLayout from '../TeLayout';
import TeSwitchLink from '../TeSwitchLink';
import { TeWalletMode } from '../config';
import useTeChallenge from '../use-te-challenge';

import styles from './index.module.scss';

/** Shortens a long value the way the design shows it: `0x9f2a4e…c41b`. */
const shorten = (value?: string) =>
  value && value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;

/** Reads a string field off a parsed payload without trusting its shape. */
const readString = (source: unknown, key: string) => {
  if (typeof source !== 'object' || source === null) {
    return;
  }

  const value: unknown = Reflect.get(source, key);
  return typeof value === 'string' ? value : undefined;
};

const TeQrPage = () => {
  const { challenge, error, isVerifying, begin, reset } = useTeChallenge(TeWalletMode.Qr);

  useEffect(() => {
    void begin();
  }, [begin]);

  const details = useMemo(() => {
    if (!challenge?.qrPayload) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(challenge.qrPayload);

      // Under te2 the code only points at the challenge: the material to sign is
      // fetched by the wallet over TLS, so a photo of the screen carries nothing useful.
      return {
        version: readString(parsed, 'v'),
        challengeId: shorten(readString(parsed, 'challengeId')),
      };
    } catch {
      // The payload is only shown for transparency; ignore anything unexpected.
    }
  }, [challenge?.qrPayload]);

  return (
    <TeLayout
      title="Escanea para entrar"
      description="Escanea este código con tu wallet TripleEnable. Tu dispositivo firmará el challenge y la llave privada nunca sale de él."
    >
      <div className={styles.container}>
        {error && (
          <>
            <div className={styles.error}>{error}</div>
            <button
              type="button"
              className={styles.retry}
              onClick={() => {
                reset();
                void begin();
              }}
            >
              Reintentar
            </button>
          </>
        )}

        {!error && isVerifying && (
          <div className={styles.waiting}>
            <LoadingIcon />
            <div className={styles.hint}>Firma válida. Entrando…</div>
          </div>
        )}

        {!error && !isVerifying && (
          <>
            <div className={styles.qrFrame}>
              {challenge?.qrDataUrl ? (
                <img className={styles.qr} src={challenge.qrDataUrl} alt="Código QR de acceso" />
              ) : (
                <div className={styles.qrPlaceholder}>
                  <LoadingIcon />
                </div>
              )}
            </div>

            {details && (
              <dl className={styles.details}>
                <div className={styles.detailRow}>
                  <dt>protocolo</dt>
                  <dd>{details.version}</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>challenge</dt>
                  <dd>{details.challengeId}</dd>
                </div>
              </dl>
            )}

            <div className={styles.hint}>Esperando la firma del wallet…</div>
          </>
        )}

        <TeSwitchLink className={styles.switchLink} />
      </div>
    </TeLayout>
  );
};

export default TeQrPage;
/* TE:END qr-push-factor */
