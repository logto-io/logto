/* eslint-disable max-lines -- Sessions and third-party grants share their loading and step-up state on this page. */
import classNames from 'classnames';
import { HTTPError } from 'ky';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import AccountPageHeader from '@ac/components/AccountPageHeader';
import ConfirmModal from '@ac/components/ConfirmModal';
import PageFooter from '@ac/components/PageFooter';
import { layoutClassNames } from '@ac/constants/layout';
import { isEditableField } from '@ac/utils/security-page';
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
  const { accountCenterSettings, setToast } = useContext(PageContext);
  const {
    isReady: isIdentityProofReady,
    isChecking: isCheckingIdentityProof,
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

  const fetchData = useCallback(
    async (isResumed = false) => {
      if (isFetchingRef.current) {
        return;
      }
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isFetchingRef.current = true;
      setHasGrantLoadingError(false);
      setIsLoading(true);

      const [sessionResponse, grantResponse] = await Promise.all([
        getSessionsApi(),
        getGrantsApi(),
      ]);

      const [sessionError, sessionResult] = sessionResponse;
      const [grantError, grantResult] = grantResponse;

      if (sessionError) {
        if (await requestStepUp(sessionError, { type: 'load-sessions' }, { isResumed })) {
          return;
        }

        await handleError(sessionError);
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

        await handleError(grantError);
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
    [getSessionsApi, getGrantsApi, handleError, requestStepUp]
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

    void fetchData();
  }, [fetchData, hasLoaded, isCheckingIdentityProof, isIdentityProofReady, isLoading]);

  useEffect(() => {
    if (consumePendingStepUpAction(['load-sessions'])) {
      // The resumed action owns this page load; do not also auto-load the list.
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasAutoLoadedRef.current = true;
      void fetchData(true);
    }
  }, [fetchData]);

  const handleManage = useCallback(async () => {
    if (await checkIdentityProof()) {
      await fetchData();
      return;
    }

    await startStepUp({ type: 'load-sessions' });
  }, [checkIdentityProof, fetchData, startStepUp]);

  const handleRevoke = useCallback(
    async (session: AccountSession) => {
      if (!isIdentityProofReady) {
        await startStepUp({ type: 'load-sessions' });
        return;
      }

      const [error] = await revokeSessionApi(session.payload.uid);
      if (error) {
        // The revocation is not replayed after the step-up; the user confirms it again on the
        // reloaded list.
        if (await requestStepUp(error, { type: 'load-sessions' })) {
          return;
        }

        await handleError(error);
        return;
      }

      setSessions((previous) =>
        previous?.filter((item) => item.payload.uid !== session.payload.uid)
      );
    },
    [isIdentityProofReady, revokeSessionApi, handleError, requestStepUp, startStepUp]
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
      if (!isIdentityProofReady) {
        await startStepUp({ type: 'load-sessions' });
        return;
      }

      setRemovingAppId(app.applicationId);

      const results = await Promise.allSettled(
        app.grantIds.map(async (grantId) => {
          const [error] = await revokeGrantApi(grantId);
          if (error) {
            throw error instanceof Error ? error : new Error('revoke_failed');
          }
        })
      );

      const failure = results.find((result) => result.status === 'rejected');
      if (failure) {
        if (await requestStepUp(failure.reason, { type: 'load-sessions' })) {
          return;
        }

        if (failure.reason instanceof HTTPError) {
          await handleError(failure.reason);
        } else {
          setToast(t('account_center.sessions.revoke_grant_failed'));
        }
        setRemovingAppId(undefined);
        return;
      }

      setGrantRows((previous) =>
        previous?.filter((item) => item.applicationId !== app.applicationId)
      );
      setRemovingAppId(undefined);
    },
    [isIdentityProofReady, revokeGrantApi, handleError, requestStepUp, startStepUp, setToast, t]
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
