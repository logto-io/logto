import { type consoleSsoRouter } from '@logto/cloud/routes';
import { trySafe } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCloudApi, toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { useConsoleSsoConnectors } from '@/cloud/pages/ConsoleSso/use-console-sso';
import AppLoading from '@/components/AppLoading';
import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useRedirectUri from '@/hooks/use-redirect-uri';
import useSignOut from '@/hooks/use-sign-out';

import IssuesContent from './IssuesContent';
import styles from './index.module.scss';

enum Step {
  Issues = 'issues',
  Confirmation = 'confirmation',
  FinalConfirmation = 'final_confirmation',
}

const handleCancel = () => {
  window.location.assign('/');
};

export default function DeleteAccount() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.profile.delete_account',
  });
  const { tenants } = useContext(TenantsContext);
  const { signOut } = useSignOut();
  const postSignOutRedirectUri = useRedirectUri('signOut');
  const cloudApi = useCloudApi({ hideErrorToast: true });
  const consoleSsoApi = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  // Console SSO billing: connectors are user-owned and must be removed before deleting the account.
  const {
    data: consoleSsoConnectors,
    error: consoleSsoError,
    mutate: mutateConsoleSsoConnectors,
  } = useConsoleSsoConnectors(isDevFeaturesEnabled);
  const hasConsoleSsoConnectors = isDevFeaturesEnabled && Boolean(consoleSsoConnectors?.length);

  const [isDeleting, setIsDeleting] = useState(false);
  const [requestError, setRequestError] = useState<Error>();

  const deletionError = requestError ?? consoleSsoError;

  const hasIssues = hasConsoleSsoConnectors || tenants.length > 0;

  const [step, setStep] = useState(hasIssues ? Step.Issues : Step.Confirmation);

  useEffect(() => {
    setStep((previous) => {
      if (!hasIssues && previous === Step.FinalConfirmation) {
        return previous;
      }
      return hasIssues ? Step.Issues : Step.Confirmation;
    });
  }, [hasIssues]);

  if (isDevFeaturesEnabled && !consoleSsoConnectors && !consoleSsoError) {
    return <AppLoading />;
  }

  const errorRequestId =
    deletionError instanceof ResponseError
      ? deletionError.response.headers.get('logto-cloud-request-id')
      : null;

  /** Re-read connectors and fail loudly; a plain SWR revalidation would keep stale data on error. */
  const hasFreshConsoleSsoConnectors = async () => {
    const connectors = await mutateConsoleSsoConnectors(
      consoleSsoApi.get('/api/me/console-sso/connectors'),
      { revalidate: false }
    );
    return Boolean(connectors?.length);
  };

  const deleteAccount = async () => {
    if (isDeleting || hasIssues) {
      return;
    }

    setIsDeleting(true);

    try {
      await cloudApi.delete('/api/me');
      await signOut(postSignOutRedirectUri.href);
    } catch (error) {
      // Refresh the explanation if connectors were created after the page loaded.
      if (
        isDevFeaturesEnabled &&
        error instanceof ResponseError &&
        error.response.status === 422 &&
        (await trySafe(hasFreshConsoleSsoConnectors()))
      ) {
        return;
      }
      void toastResponseError(error);
      setRequestError(error instanceof Error ? error : new Error(String(error)));
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Topbar hideTenantSelector hideTitle />
      <OverlayScrollbar className={styles.scrollable}>
        <div className={styles.wrapper}>
          <PageMeta titleKey="profile.delete_account.label" />
          <CardTitle title="profile.delete_account.label" />
          <div className={styles.content}>
            {deletionError ? (
              <div className={styles.container}>
                <p>{t('error_occurred_description')}</p>
                <p>
                  <code>{deletionError.message}</code>
                  {errorRequestId && (
                    <>
                      <br />
                      <code>{t('request_id', { requestId: errorRequestId })}</code>
                    </>
                  )}
                </p>
                <p>{t('try_again_later')}</p>
                <div className={styles.actions}>
                  <Button size="large" title="general.got_it" onClick={handleCancel} />
                </div>
              </div>
            ) : step === Step.Issues ? (
              <IssuesContent
                tenants={tenants}
                hasConsoleSsoConnectors={hasConsoleSsoConnectors}
                onClose={handleCancel}
              />
            ) : step === Step.Confirmation ? (
              <ConfirmationContent
                onCancel={handleCancel}
                onConfirm={() => {
                  setStep(Step.FinalConfirmation);
                }}
              />
            ) : (
              <FinalConfirmationContent
                isDeleting={isDeleting}
                onCancel={() => {
                  setStep(Step.Confirmation);
                }}
                onDelete={deleteAccount}
              />
            )}
          </div>
        </div>
      </OverlayScrollbar>
    </div>
  );
}

function ConfirmationContent({
  onCancel,
  onConfirm,
}: {
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.profile.delete_account' });

  return (
    <div className={styles.container}>
      <p>{t('p.check_information')}</p>
      <p>{t('p.remove_all_data')}</p>
      <p>{t('p.confirm_information')}</p>
      <div className={styles.actions}>
        <Button size="large" title="general.cancel" onClick={onCancel} />
        <Button size="large" type="danger" title="general.delete" onClick={onConfirm} />
      </div>
    </div>
  );
}

function FinalConfirmationContent({
  isDeleting,
  onCancel,
  onDelete,
}: {
  readonly isDeleting: boolean;
  readonly onCancel: () => void;
  readonly onDelete: () => Promise<void>;
}) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.profile.delete_account' });

  return (
    <div className={styles.container}>
      <p>{t('about_to_start_deletion')}</p>
      <div className={styles.actions}>
        <Button size="large" disabled={isDeleting} title="general.cancel" onClick={onCancel} />
        <Button
          size="large"
          disabled={isDeleting}
          isLoading={isDeleting}
          type="danger"
          title="profile.delete_account.permanently_delete"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}
