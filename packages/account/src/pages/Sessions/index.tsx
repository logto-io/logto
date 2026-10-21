/* eslint-disable max-lines -- Sessions and third-party grants share their loading and step-up state on this page. */
import classNames from 'classnames';
import { HTTPError } from 'ky';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
import { consumePendingStepUpAction } from '@ac/utils/step-up';

import { getSessions, revokeSession, getGrants, revokeGrant } from '../../apis/sessions';
import useApi from '../../hooks/use-api';
import useErrorHandler from '../../hooks/use-error-handler';
import useStepUp, { useIdentityProof } from '../../hooks/use-step-up';
import homeStyles from '../Home/index.module.scss';

import GrantRow from './GrantRow';
import SessionRow from './SessionRow';
import styles from './index.module.scss';
import { normalizeGrantRows, type AccountSession, type GrantedAppRow } from './utils';

const Sessions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, setVerificationId, setToast } = useContext(PageContext);
  const {
    isReady: isIdentityProofReady,
    isChecking: isCheckingIdentityProof,
    verificationId,
    checkIdentityProof,
  } = useIdentityProof();
  const { requestStepUp, startStepUp } = useStepUp();
  const [sessions, setSessions] = useState<AccountSession[]>();
  const [grantRows, setGrantRows] = useState<GrantedAppRow[]>();
  const [hasGrantLoadingError, setHasGrantLoadingError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<AccountSession>();
  const [revokeGrantTarget, setRevokeGrantTarget] = useState<GrantedAppRow>();
  const [removingAppId, setRemovingAppId] = useState<string>();
  const handleError = useErrorHandler();
  const isFetchingRef = useRef(false);
  const hasAutoLoadedRef = useRef(false);

  const getSessionsApi = useApi(getSessions, { silent: true });
  const revokeSessionApi = useApi(revokeSession);
  const getGrantsApi = useApi(getGrants, { silent: true });
  const revokeGrantApi = useApi(revokeGrant);

  const sessionControl = accountCenterSettings?.fields.session;
  const isEditable = isEditableField(sessionControl);

  const handlePermissionDenied = useCallback(async () => {
    setVerificationId(undefined);
    setToast(t('account_center.verification.verification_required'));
  }, [setVerificationId, setToast, t]);

  const handleRevokePermissionDenied = useCallback(async () => {
    // The revocation needs a new proof of identity; return the page to its Manage state.
    setVerificationId(undefined);
    setHasLoaded(false);
    setToast(t('account_center.verification.verification_required'));
  }, [setVerificationId, setToast, t]);

  const fetchData = useCallback(
    async (verifiedId: string | undefined, isResumed = false) => {
      if (isFetchingRef.current) {
        return;
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isFetchingRef.current = true;
      setHasGrantLoadingError(false);
      setIsLoading(true);

      const [sessionResponse, grantResponse] = await Promise.all([
        getSessionsApi(verifiedId),
        getGrantsApi(verifiedId),
      ]);

      const [sessionError, sessionResult] = sessionResponse;
      const [grantError, grantResult] = grantResponse;

      if (sessionError) {
        if (await requestStepUp(sessionError, { type: 'load-sessions' }, { isResumed })) {
          return;
        }

        await handleError(sessionError, {
          'verification_record.permission_denied': handlePermissionDenied,
        });
        setIsLoading(false);
        // eslint-disable-next-line @silverhand/fp/no-mutation
        isFetchingRef.current = false;
        return;
      }

      if (sessionResult) {
        setSessions(sessionResult.sessions);
      }

      if (grantError) {
        if (await requestStepUp(grantError, { type: 'load-sessions' }, { isResumed })) {
          return;
        }

        await handleError(grantError, {
          'verification_record.permission_denied': handlePermissionDenied,
        });
        setHasGrantLoadingError(true);
      } else if (grantResult) {
        setGrantRows(normalizeGrantRows(grantResult.grants));
        setHasGrantLoadingError(false);
      }

      setHasLoaded(true);
      setIsLoading(false);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isFetchingRef.current = false;
    },
    [getSessionsApi, getGrantsApi, handleError, handlePermissionDenied, requestStepUp]
  );

  useEffect(() => {
    if (
      !isIdentityProofReady ||
      isCheckingIdentityProof ||
      hasLoaded ||
      isLoading ||
      hasAutoLoadedRef.current
    ) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    hasAutoLoadedRef.current = true;

    if (verificationId) {
      const pendingAction = sessionStorage.getPendingVerifiedAction();

      if (pendingAction === 'load-sessions') {
        sessionStorage.clearPendingVerifiedAction();
      }
    }

    void fetchData(verificationId);
  }, [
    fetchData,
    hasLoaded,
    isCheckingIdentityProof,
    isIdentityProofReady,
    isLoading,
    verificationId,
  ]);

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  const handleManage = useCallback(async () => {
    if (await checkIdentityProof()) {
      await fetchData(verificationId);
      return;
    }

    if (await startStepUp({ type: 'load-sessions' })) {
      return;
    }

    sessionStorage.setPendingVerifiedAction('load-sessions');
    navigateTo(verifiedActionRoute);
  }, [checkIdentityProof, verificationId, fetchData, startStepUp, navigateTo]);

  const handleRevokeSession = useCallback(
    async (sessionId: string, isResumed = false) => {
      const [error] = await revokeSessionApi(verificationId, sessionId);

      if (error) {
        if (await requestStepUp(error, { type: 'revoke-session', sessionId }, { isResumed })) {
          return;
        }

        await handleError(error, {
          'verification_record.permission_denied': handleRevokePermissionDenied,
        });

        if (isResumed) {
          // The resumed action owns this page load; reload the list so a failed replay does not
          // leave the page in its Manage state.
          await fetchData(undefined, true);
        }
        return;
      }

      if (isResumed) {
        // The confirmed revocation runs once after the step-up, then the list reloads with the
        // elevated token.
        await fetchData(undefined, true);
        return;
      }

      setSessions((previous) => previous?.filter((item) => item.payload.uid !== sessionId));
    },
    [
      fetchData,
      handleError,
      handleRevokePermissionDenied,
      requestStepUp,
      revokeSessionApi,
      verificationId,
    ]
  );

  const handleRevokeGrants = useCallback(
    async (applicationId: string, grantIds: string[], isResumed = false) => {
      setRemovingAppId(applicationId);

      const results = await Promise.allSettled(
        grantIds.map(async (grantId) => {
          const [error] = await revokeGrantApi(verificationId, grantId);
          if (error) {
            throw error instanceof Error ? error : new Error('revoke_failed');
          }
        })
      );

      const failure = results.find((result) => result.status === 'rejected');
      if (failure) {
        if (
          await requestStepUp(
            failure.reason,
            { type: 'revoke-grant', applicationId, grantIds },
            { isResumed }
          )
        ) {
          return;
        }

        if (failure.reason instanceof HTTPError) {
          await handleError(failure.reason);
        } else {
          setToast(t('account_center.sessions.revoke_grant_failed'));
        }
        setRemovingAppId(undefined);

        if (isResumed) {
          // The resumed action owns this page load; reload the list so a failed replay does not
          // leave the page in its Manage state.
          await fetchData(undefined, true);
        }
        return;
      }

      if (isResumed) {
        // The confirmed revocation runs once after the step-up, then the list reloads with the
        // elevated token.
        setRemovingAppId(undefined);
        await fetchData(undefined, true);
        return;
      }

      setGrantRows((previous) => previous?.filter((item) => item.applicationId !== applicationId));
      setRemovingAppId(undefined);
    },
    [fetchData, handleError, requestStepUp, revokeGrantApi, setToast, t, verificationId]
  );

  const handleRevoke = useCallback(
    async (session: AccountSession) => {
      const { uid } = session.payload;

      if (await checkIdentityProof()) {
        await handleRevokeSession(uid);
        return;
      }

      await startStepUp({ type: 'revoke-session', sessionId: uid });
    },
    [checkIdentityProof, handleRevokeSession, startStepUp]
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
      if (await checkIdentityProof()) {
        await handleRevokeGrants(app.applicationId, app.grantIds);
        return;
      }

      await startStepUp({
        type: 'revoke-grant',
        applicationId: app.applicationId,
        grantIds: app.grantIds,
      });
    },
    [checkIdentityProof, handleRevokeGrants, startStepUp]
  );

  useEffect(() => {
    const action = consumePendingStepUpAction(['load-sessions', 'revoke-session', 'revoke-grant']);

    if (!action) {
      return;
    }

    // The resumed action owns this page load; do not also auto-load the list.
    // eslint-disable-next-line @silverhand/fp/no-mutation
    hasAutoLoadedRef.current = true;

    switch (action.type) {
      case 'load-sessions': {
        void fetchData(undefined, true);
        break;
      }
      case 'revoke-session': {
        void handleRevokeSession(action.sessionId, true);
        break;
      }
      case 'revoke-grant': {
        void handleRevokeGrants(action.applicationId, action.grantIds, true);
        break;
      }
    }
  }, [fetchData, handleRevokeGrants, handleRevokeSession]);

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
                    {isLoading || isCheckingIdentityProof ? (
                      <div className={styles.meta}>{t('account_center.sessions.loading')}</div>
                    ) : (
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => {
                          void handleManage();
                        }}
                      >
                        {t('account_center.security.manage')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasLoaded && (grantRows !== undefined || hasGrantLoadingError) && (
            <div className={classNames(styles.section, layoutClassNames.section)}>
              <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
                {t('account_center.sessions.third_party_apps_title')}
              </div>
              <div className={classNames(styles.card, layoutClassNames.card)}>
                {hasGrantLoadingError ? (
                  <div className={styles.emptyState}>
                    {t('account_center.sessions.third_party_apps_load_failed')}
                  </div>
                ) : grantRows && grantRows.length > 0 ? (
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
/* eslint-enable max-lines */
