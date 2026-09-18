import { type IdTokenClaims, useLogto } from '@logto/react';
import { TenantRole } from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  useCloudApi,
  createTenantApi,
  tryReadResponseErrorBody,
  toastResponseError,
} from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse } from '@/cloud/types/router';
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
import { isPaidPlan } from '@/utils/subscription';

import IssuesContent from './IssuesContent';
import TenantsList from './TenantsList';
import styles from './index.module.scss';
import useAccountDeletionStatus from './use-account-deletion-status';
import { getRoleMap } from './utils';

enum Step {
  Issues = 'issues',
  Confirmation = 'confirmation',
  FinalConfirmation = 'final_confirmation',
}

const handleCancel = () => {
  window.location.assign('/');
};

export default function DeleteAccount() {
  const { t, i18n } = useTranslation(undefined, {
    keyPrefix: 'admin_console.profile.delete_account',
  });
  const { tenants, removeTenant } = useContext(TenantsContext);
  const { getIdTokenClaims, isAuthenticated, getOrganizationToken } = useLogto();
  const { signOut } = useSignOut();
  const postSignOutRedirectUri = useRedirectUri('signOut');
  const cloudApi = useCloudApi({ hideErrorToast: true });
  const {
    data: deletionStatus,
    error: statusError,
    mutate: refreshDeletionStatus,
  } = useAccountDeletionStatus();
  const [hasSsoDeletionRefusal, setHasSsoDeletionRefusal] = useState(false);
  const hasConsoleSsoConnectors =
    isDevFeaturesEnabled &&
    (hasSsoDeletionRefusal || deletionStatus?.hasConsoleSsoConnectors === true);

  const [claims, setClaims] = useState<IdTokenClaims>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [requestError, setRequestError] = useState<Error>();

  const deletionError = requestError ?? statusError;

  const paidPlans = tenants.filter(({ subscription: { planId, isEnterprisePlan } }) =>
    isPaidPlan(planId, isEnterprisePlan)
  );
  const subscriptionStatusIssues = tenants.filter(
    ({ subscription }) => subscription.status !== 'active'
  );
  const openInvoices = tenants.filter(({ openInvoices }) => openInvoices.length > 0);
  const hasIssues =
    hasConsoleSsoConnectors ||
    paidPlans.length > 0 ||
    subscriptionStatusIssues.length > 0 ||
    openInvoices.length > 0;

  const issues = [
    { description: 'paid_plan' as const, tenants: paidPlans },
    { description: 'subscription_status' as const, tenants: subscriptionStatusIssues },
    { description: 'open_invoice' as const, tenants: openInvoices },
  ];

  const [step, setStep] = useState(hasIssues ? Step.Issues : Step.Confirmation);

  useEffect(() => {
    setStep((previous) => {
      if (!hasIssues && previous === Step.FinalConfirmation) {
        return previous;
      }
      return hasIssues ? Step.Issues : Step.Confirmation;
    });
  }, [hasIssues]);

  useEffect(() => {
    const fetchClaims = async () => {
      setClaims(undefined);
      const claims = await getIdTokenClaims();
      if (!claims) {
        toast.error(t('error_occurred'));
        handleCancel();
        return;
      }
      setClaims(claims);
    };
    void fetchClaims();
  }, [getIdTokenClaims, t]);

  if (!claims || (isDevFeaturesEnabled && !deletionStatus && !statusError)) {
    return <AppLoading />;
  }

  const roleMap = getRoleMap(claims.organization_roles ?? []);
  const tenantsToDelete = tenants.filter(({ id }) => roleMap[id]?.includes(TenantRole.Admin));
  const tenantsToQuit = tenants.filter(({ id }) =>
    tenantsToDelete.every(({ id: tenantId }) => tenantId !== id)
  );

  const errorRequestId =
    deletionError instanceof ResponseError
      ? deletionError.response.headers.get('logto-cloud-request-id')
      : null;

  const deleteAccount = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      if (isDevFeaturesEnabled) {
        const status = await refreshDeletionStatus();
        if (status?.hasConsoleSsoConnectors) {
          return;
        }
      }
      for (const tenant of tenantsToDelete) {
        // eslint-disable-next-line no-await-in-loop -- finish each tenant operation before deleting the account
        await cloudApi.delete(`/api/tenants/:tenantId`, {
          params: { tenantId: tenant.id },
        });
        removeTenant(tenant.id);
      }

      for (const tenant of tenantsToQuit) {
        const tenantApi = createTenantApi({
          isAuthenticated,
          getOrganizationToken,
          tenantId: tenant.id,
          language: i18n.language,
          hideErrorToast: true,
        });
        // eslint-disable-next-line no-await-in-loop -- finish each tenant operation before deleting the account
        await tenantApi.delete('/api/tenants/:tenantId/members/:userId', {
          params: { tenantId: tenant.id, userId: claims.sub },
        });
        removeTenant(tenant.id);
      }

      await cloudApi.delete('/api/me');
      await signOut(postSignOutRedirectUri.href);
    } catch (error) {
      const response =
        error instanceof ResponseError ? await tryReadResponseErrorBody(error) : undefined;
      if (
        isDevFeaturesEnabled &&
        z.object({ code: z.literal('console_sso.configuration_exists') }).safeParse(response?.error)
          .success
      ) {
        setHasSsoDeletionRefusal(true);
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
                issues={issues}
                hasConsoleSsoConnectors={hasConsoleSsoConnectors}
                onClose={handleCancel}
              />
            ) : step === Step.Confirmation ? (
              <ConfirmationContent
                tenantsToDelete={tenantsToDelete}
                tenantsToQuit={tenantsToQuit}
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
  tenantsToDelete,
  tenantsToQuit,
  onCancel,
  onConfirm,
}: {
  readonly tenantsToDelete: readonly TenantResponse[];
  readonly tenantsToQuit: readonly TenantResponse[];
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.profile.delete_account' });

  return (
    <div className={styles.container}>
      <p>{t('p.check_information')}</p>
      {tenantsToDelete.length > 0 && (
        <TenantsList
          description={t('p.has_admin_role', { count: tenantsToDelete.length })}
          tenants={tenantsToDelete}
        />
      )}
      {tenantsToQuit.length > 0 && (
        <TenantsList
          description={t('p.quit_tenant', { count: tenantsToQuit.length })}
          tenants={tenantsToQuit}
        />
      )}
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
