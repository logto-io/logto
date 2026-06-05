import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import AccountPageHeader from '@ac/components/AccountPageHeader';
import ConfirmModal from '@ac/components/ConfirmModal';
import PageFooter from '@ac/components/PageFooter';
import { layoutClassNames } from '@ac/constants/layout';
import { verifiedActionRoute } from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { isEditableField } from '@ac/utils/security-page';
import { sessionStorage } from '@ac/utils/session-storage';

import { getSessions, revokeSession, getGrants, revokeGrant } from '../../apis/sessions';
import useApi from '../../hooks/use-api';
import useErrorHandler from '../../hooks/use-error-handler';
import homeStyles from '../Home/index.module.scss';

import GrantRow from './GrantRow';
import SessionRow from './SessionRow';
import styles from './index.module.scss';
import { normalizeGrantRows, type AccountSession, type GrantedAppRow } from './utils';

const Sessions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, verificationId, setVerificationId, setToast } =
    useContext(PageContext);
  const [sessions, setSessions] = useState<AccountSession[]>();
  const [grantRows, setGrantRows] = useState<GrantedAppRow[]>();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AccountSession>();
  const [revokeGrantTarget, setRevokeGrantTarget] = useState<GrantedAppRow>();
  const [removingAppId, setRemovingAppId] = useState<string>();
  const handleError = useErrorHandler();

  const getSessionsApi = useApi(getSessions, { silent: true });
  const revokeSessionApi = useApi(revokeSession);
  const getGrantsApi = useApi(getGrants, { silent: true });
  const revokeGrantApi = useApi(revokeGrant);

  const sessionControl = accountCenterSettings?.fields.session;
  const isEditable = isEditableField(sessionControl);

  const fetchData = useCallback(
    async (verifiedId: string) => {
      setIsLoading(true);
      const [sessionError, sessionResult] = await getSessionsApi(verifiedId);

      if (sessionError) {
        await handleError(sessionError, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
        });
        setIsLoading(false);
        return;
      }

      if (sessionResult) {
        setSessions(sessionResult.sessions);
      }

      const [, grantResult] = await getGrantsApi(verifiedId);
      if (grantResult) {
        setGrantRows(normalizeGrantRows(grantResult.grants));
      }

      setHasLoaded(true);
      setIsLoading(false);
    },
    [getSessionsApi, getGrantsApi, handleError, setToast, setVerificationId, t]
  );

  useEffect(() => {
    if (!verificationId) {
      return;
    }

    const pendingAction = sessionStorage.getPendingVerifiedAction();

    if (pendingAction !== 'load-sessions') {
      return;
    }

    sessionStorage.clearPendingVerifiedAction();
    void fetchData(verificationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationId]);

  useEffect(() => {
    if (hasLoaded || isLoading || !verificationId) {
      return;
    }

    const pendingAction = sessionStorage.getPendingVerifiedAction();
    if (pendingAction === 'load-sessions') {
      return;
    }

    void fetchData(verificationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationId, hasLoaded, isLoading]);

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  const handleManage = useCallback(() => {
    if (verificationId) {
      void fetchData(verificationId);
      return;
    }

    sessionStorage.setPendingVerifiedAction('load-sessions');
    navigateTo(verifiedActionRoute);
  }, [verificationId, fetchData, navigateTo]);

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
            setHasLoaded(false);
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

  const handleRevokeGrant = useCallback(
    async (app: GrantedAppRow) => {
      if (!verificationId) {
        return;
      }

      setRemovingAppId(app.applicationId);

      const results = await Promise.allSettled(
        app.grantIds.map(async (grantId) => {
          const [error] = await revokeGrantApi(verificationId, grantId);
          if (error) {
            throw new Error('revoke_failed');
          }
        })
      );

      const hasFailure = results.some((result) => result.status === 'rejected');
      if (hasFailure) {
        setToast(t('account_center.sessions.revoke_grant_failed'));
      }

      setGrantRows((previous) =>
        previous?.filter((item) => item.applicationId !== app.applicationId)
      );
      setRemovingAppId(undefined);
    },
    [verificationId, revokeGrantApi, setToast, t]
  );

  const handleConfirmRevokeGrant = useCallback(async () => {
    if (!revokeGrantTarget) {
      return;
    }
    setRevokeGrantTarget(undefined);
    await handleRevokeGrant(revokeGrantTarget);
  }, [revokeGrantTarget, handleRevokeGrant]);

  const currentSession = sessions?.find((item) => item.isCurrent);
  const otherSessions = sessions?.filter((item) => !item.isCurrent) ?? [];

  return (
    <>
      <div className={homeStyles.container}>
        <AccountPageHeader
          titleKey="account_center.sessions.page_title"
          descriptionKey="account_center.sessions.page_description"
        />
        <div className={classNames(homeStyles.content, layoutClassNames.pageContent)}>
          <div className={classNames(styles.section, layoutClassNames.section)}>
            <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
              {t('account_center.sessions.title')}
            </div>
            <div className={classNames(styles.card, layoutClassNames.card)}>
              {hasLoaded ? (
                <>
                  {currentSession && (
                    <SessionRow isCurrent session={currentSession} isEditable={false} />
                  )}
                  {otherSessions.map((session) => (
                    <SessionRow
                      key={session.payload.uid}
                      session={session}
                      isEditable={isEditable}
                      onRevoke={() => {
                        setRevokeTarget(session);
                      }}
                    />
                  ))}
                  {otherSessions.length === 0 && (
                    <div className={styles.emptyState}>
                      {t('account_center.sessions.no_other_sessions')}
                    </div>
                  )}
                </>
              ) : (
                <div className={classNames(styles.row, layoutClassNames.row)}>
                  <div className={styles.sessionInfo}>
                    {isLoading ? (
                      <div className={styles.meta}>{t('account_center.sessions.loading')}</div>
                    ) : (
                      <button type="button" className={styles.actionButton} onClick={handleManage}>
                        {t('account_center.security.manage')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasLoaded && (
            <div className={classNames(styles.section, layoutClassNames.section)}>
              <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
                {t('account_center.sessions.third_party_apps_title')}
              </div>
              <div className={classNames(styles.card, layoutClassNames.card)}>
                {grantRows && grantRows.length > 0 ? (
                  grantRows.map((app) => (
                    <GrantRow
                      key={app.applicationId}
                      app={app}
                      isEditable={isEditable}
                      isRemoving={removingAppId === app.applicationId}
                      onRevoke={() => {
                        setRevokeGrantTarget(app);
                      }}
                    />
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    {t('account_center.sessions.no_third_party_apps')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <PageFooter />
      </div>

      <ConfirmModal
        isOpen={Boolean(revokeTarget)}
        title="account_center.sessions.revoke_session_title"
        confirmText="account_center.sessions.revoke_session"
        confirmButtonType="danger"
        cancelText="action.cancel"
        onConfirm={() => {
          void handleConfirmRevoke();
        }}
        onCancel={() => {
          setRevokeTarget(undefined);
        }}
      >
        {t('account_center.sessions.revoke_session_description')}
      </ConfirmModal>

      <ConfirmModal
        isOpen={Boolean(revokeGrantTarget)}
        title="account_center.sessions.revoke_grant_title"
        confirmText="account_center.sessions.revoke_grant"
        confirmButtonType="danger"
        cancelText="action.cancel"
        onConfirm={() => {
          void handleConfirmRevokeGrant();
        }}
        onCancel={() => {
          setRevokeGrantTarget(undefined);
        }}
      >
        {t('account_center.sessions.revoke_grant_description')}
      </ConfirmModal>
    </>
  );
};

export default Sessions;
