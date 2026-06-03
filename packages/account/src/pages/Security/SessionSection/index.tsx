import { AccountCenterControlValue, type GetAccountUserSessionsResponse } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ConfirmModal from '@ac/components/ConfirmModal';
import { layoutClassNames } from '@ac/constants/layout';
import { verifiedActionRoute } from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { isEditableField } from '@ac/utils/security-page';
import { sessionStorage } from '@ac/utils/session-storage';

import { getSessions, revokeSession } from '../../../apis/sessions';
import useApi from '../../../hooks/use-api';
import useErrorHandler from '../../../hooks/use-error-handler';

import styles from './index.module.scss';
import { formatSessionMeta, parseUserAgent } from './utils';

type AccountSession = GetAccountUserSessionsResponse['sessions'][number];

const SessionSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const [sessions, setSessions] = useState<AccountSession[]>();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AccountSession>();
  const handleError = useErrorHandler();

  const getSessionsApi = useApi(getSessions, { silent: true });
  const revokeSessionApi = useApi(revokeSession);

  const sessionControl = accountCenterSettings?.fields.session;
  const isVisible =
    sessionControl !== undefined && sessionControl !== AccountCenterControlValue.Off;
  const isEditable = isEditableField(sessionControl);

  const fetchSessions = useCallback(
    async (verifiedId: string) => {
      setIsLoading(true);
      const [error, result] = await getSessionsApi(verifiedId);
      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
      } else if (result) {
        setSessions(result.sessions);
      }
      setHasLoaded(true);
      setIsLoading(false);
    },
    [getSessionsApi, handleError, setToast, setVerificationId, t]
  );

  // Auto-fetch sessions once we have a verificationId
  useEffect(() => {
    if (!isVisible || hasLoaded || isLoading) {
      return;
    }

    if (!verificationId) {
      return;
    }

    void fetchSessions(verificationId);
  }, [isVisible, verificationId, hasLoaded, isLoading, fetchSessions]);

  // Handle pending verified action (coming back from verification page)
  useEffect(() => {
    if (!verificationId) {
      return;
    }

    const pendingAction = sessionStorage.getPendingVerifiedAction();

    if (pendingAction !== 'load-sessions') {
      return;
    }

    sessionStorage.clearPendingVerifiedAction();
    void fetchSessions(verificationId);
  }, [verificationId, fetchSessions]);

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  const handleViewSessions = useCallback(() => {
    if (verificationId) {
      void fetchSessions(verificationId);
      return;
    }

    sessionStorage.setPendingVerifiedAction('load-sessions');
    navigateTo(verifiedActionRoute);
  }, [verificationId, fetchSessions, navigateTo]);

  const handleRevoke = useCallback(
    async (session: AccountSession) => {
      if (!verificationId) {
        return;
      }

      const [error] = await revokeSessionApi(verificationId, session.payload.uid);
      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        return;
      }

      setSessions((previous) =>
        previous?.filter((item) => item.payload.uid !== session.payload.uid)
      );
    },
    [verificationId, revokeSessionApi, handleError, setVerificationId, setToast, t]
  );

  const handleConfirmRevoke = useCallback(async () => {
    if (!revokeTarget) {
      return;
    }
    setRevokeTarget(undefined);
    await handleRevoke(revokeTarget);
  }, [revokeTarget, handleRevoke]);

  if (!isVisible) {
    return null;
  }

  const currentSession = sessions?.find((item) => item.isCurrent);
  const otherSessions = sessions?.filter((item) => !item.isCurrent) ?? [];

  return (
    <>
      <div className={classNames(styles.section, layoutClassNames.section)}>
        <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
          {t('account_center.security.sessions')}
        </div>
        <div className={classNames(styles.card, layoutClassNames.card)}>
          {hasLoaded ? (
            <>
              {currentSession && (
                <SessionRow isCurrentLabel session={currentSession} isEditable={false} />
              )}
              {otherSessions.length > 0 ? (
                otherSessions.map((session) => (
                  <SessionRow
                    key={session.payload.uid}
                    session={session}
                    isEditable={isEditable}
                    onRevoke={() => {
                      setRevokeTarget(session);
                    }}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  {t('account_center.security.session_no_other')}
                </div>
              )}
            </>
          ) : (
            <div className={styles.sessionRow}>
              <div className={styles.sessionInfo}>
                <button type="button" className={styles.revokeButton} onClick={handleViewSessions}>
                  {t('account_center.security.manage')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={Boolean(revokeTarget)}
        title="account_center.security.session_revoke_confirmation_title"
        confirmText="account_center.security.session_revoke"
        confirmButtonType="danger"
        cancelText="action.cancel"
        onConfirm={() => {
          void handleConfirmRevoke();
        }}
        onCancel={() => {
          setRevokeTarget(undefined);
        }}
      >
        {t('account_center.security.session_revoke_confirmation_description')}
      </ConfirmModal>
    </>
  );
};

type SessionRowProps = {
  readonly session: AccountSession;
  readonly isEditable: boolean;
  readonly isCurrentLabel?: boolean;
  readonly onRevoke?: () => void;
};

const SessionRow = ({ session, isEditable, isCurrentLabel, onRevoke }: SessionRowProps) => {
  const { t } = useTranslation();

  const userAgent = session.lastSubmission?.signInContext?.userAgent;
  const deviceLabel = parseUserAgent(userAgent);
  const meta = formatSessionMeta(session);
  const signedInDate = new Date(session.payload.loginTs * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={styles.sessionRow}>
      <div className={styles.sessionInfo}>
        <div className={styles.sessionHeader}>
          <span className={styles.sessionDevice}>{deviceLabel}</span>
          {isCurrentLabel && (
            <span className={styles.currentTag}>
              <span className={styles.currentDot} />
              {t('account_center.security.session_current')}
            </span>
          )}
        </div>
        {meta && <div className={styles.sessionMeta}>{meta}</div>}
        <div className={styles.sessionMeta}>
          {t('account_center.security.session_signed_in', { date: signedInDate })}
        </div>
      </div>
      {isEditable && onRevoke && (
        <button type="button" className={styles.revokeButton} onClick={onRevoke}>
          {t('account_center.security.session_revoke')}
        </button>
      )}
    </div>
  );
};

export default SessionSection;
