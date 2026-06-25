import { type IdTokenClaims, useLogto } from '@logto/react';
import { TenantRole } from '@logto/schemas';
import { ResponseError } from '@withtyped/client';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useCloudApi, createTenantApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse } from '@/cloud/types/router';
import AppLoading from '@/components/AppLoading';
import PageMeta from '@/components/PageMeta';
import Topbar from '@/components/Topbar';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useRedirectUri from '@/hooks/use-redirect-uri';
import useSignOut from '@/hooks/use-sign-out';
import { isPaidPlan } from '@/utils/subscription';

import TenantsList from './TenantsList';
import styles from './index.module.scss';
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
  const cloudApi = useCloudApi();

  const [claims, setClaims] = useState<IdTokenClaims>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionError, setDeletionError] = useState<Error>();

  const paidPlans = tenants.filter(({ subscription: { planId, isEnterprisePlan } }) =>
    isPaidPlan(planId, isEnterprisePlan)
  );
  const subscriptionStatusIssues = tenants.filter(
    ({ subscription }) => subscription.status !== 'active'
  );
  const openInvoices = tenants.filter(({ openInvoices }) => openInvoices.length > 0);
  const hasIssues =
    paidPlans.length > 0 || subscriptionStatusIssues.length > 0 || openInvoices.length > 0;

  const issues = [
    { description: 'paid_plan' as const, tenants: paidPlans },
    { description: 'subscription_status' as const, tenants: subscriptionStatusIssues },
    { description: 'open_invoice' as const, tenants: openInvoices },
  ];

  const [step, setStep] = useState(hasIssues ? Step.Issues : Step.Confirmation);

  useEffect(() => {
    setStep((previous) => {
      if (previous === Step.FinalConfirmation) {
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

  if (!claims) {
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
      for (const tenant of tenantsToDelete) {
        // eslint-disable-next-line no-await-in-loop
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
        });
        // eslint-disable-next-line no-await-in-loop
        await tenantApi.delete('/api/tenants/:tenantId/members/:userId', {
          params: { tenantId: tenant.id, userId: claims.sub },
        });
        removeTenant(tenant.id);
      }

      await cloudApi.delete('/api/me');
      await signOut(postSignOutRedirectUri.href);
    } catch (error) {
      setDeletionError(error instanceof Error ? error : new Error(String(error)));
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
              <IssuesContent issues={issues} onClose={handleCancel} />
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

function IssuesContent({
  issues,
  onClose,
}: {
  readonly issues: ReadonlyArray<{
    readonly description: 'paid_plan' | 'subscription_status' | 'open_invoice';
    readonly tenants: readonly TenantResponse[];
  }>;
  readonly onClose: () => void;
}) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.profile.delete_account' });

  return (
    <div className={styles.container}>
      <p>{t('p.has_issue')}</p>
      {issues.map(
        ({ description, tenants }) =>
          tenants.length > 0 && (
            <TenantsList
              key={description}
              description={t(`issues.${description}`, { count: tenants.length })}
              tenants={tenants}
            />
          )
      )}
      <p>{t('p.after_resolved')}</p>
      <div className={styles.actions}>
        <Button size="large" title="general.got_it" onClick={onClose} />
      </div>
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
