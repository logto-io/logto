import { ReservedPlanId } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useAuthedCloudApi, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantSettingsResponse } from '@/cloud/types/router';
import PageMeta from '@/components/PageMeta';
import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { type RequestError } from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import { trySubmitSafe } from '@/utils/form';

import DeleteCard from './DeleteCard';
import DeleteModal from './DeleteModal';
import LeaveCard from './LeaveCard';
import ProfileForm from './ProfileForm';
import styles from './index.module.scss';
import { type TenantSettingsForm } from './types.js';

function TenantBasicSettings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();
  const api = useCloudApi();
  const cloudApi = useAuthedCloudApi();
  const {
    currentTenant,
    currentTenantId,
    isDevTenant,
    updateTenant,
    removeTenant,
    navigateTenant,
  } = useContext(TenantsContext);
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { show: showModal } = useConfirmModal();

  const { data: tenantSettings, mutate: mutateTenantSettings } = useSWR<
    TenantSettingsResponse,
    RequestError
  >(`api/tenants/${currentTenantId}/settings`, async () =>
    cloudApi.get(`/api/tenants/:tenantId/settings`, {
      params: { tenantId: currentTenantId },
    })
  );

  const methods = useForm<TenantSettingsForm>({
    defaultValues: {
      profile: currentTenant,
      isMfaRequired: tenantSettings?.isMfaRequired ?? false,
    },
  });
  const {
    watch,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

  useEffect(() => {
    reset({
      profile: currentTenant,
      isMfaRequired: tenantSettings?.isMfaRequired ?? false,
    });
  }, [currentTenant, tenantSettings, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: TenantSettingsForm) => {
      if (isSubmitting) {
        return;
      }

      const {
        profile: { name, tag },
        isMfaRequired,
      } = formData;

      const profileData = { name, tag };
      const [{ name: updatedName, tag: updatedTag }, updatedTenantSettings] = await Promise.all([
        api.patch(`/api/tenants/:tenantId`, {
          params: { tenantId: currentTenantId },
          body: profileData,
        }),
        cloudApi.patch(`/api/tenants/:tenantId/settings`, {
          params: { tenantId: currentTenantId },
          body: { isMfaRequired },
        }),
      ]);

      reset({
        profile: { name: updatedName, tag: updatedTag },
        isMfaRequired: updatedTenantSettings.isMfaRequired,
      });
      void mutateTenantSettings(updatedTenantSettings);
      toast.success(t('tenants.settings.tenant_info_saved'));
      updateTenant(currentTenantId, profileData);
    })
  );

  const onClickDeletionButton = async () => {
    const isSharedEnterpriseSubscription =
      // TODO: remove the dev feature guard once the enterprise subscription is ready
      isDevFeaturesEnabled && currentTenant?.subscription.quotaScope === 'shared';

    if (
      !isDevTenant &&
      // Should allow production tenant deletion of shared enterprise subscription
      !isSharedEnterpriseSubscription &&
      (currentTenant?.subscription.planId !== ReservedPlanId.Free ||
        currentTenant.openInvoices.length > 0)
    ) {
      await showModal({
        title: 'tenants.delete_modal.cannot_delete_title',
        ModalContent: t('tenants.delete_modal.cannot_delete_description'),
        type: 'alert',
        cancelButtonText: 'general.got_it',
      });

      return;
    }

    setIsDeletionModalOpen(true);
  };

  const onDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/api/tenants/:tenantId`, { params: { tenantId: currentTenantId } });
      setIsDeletionModalOpen(false);
      removeTenant(currentTenantId);
      navigateTenant('');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageMeta titleKey={['tenants.tabs.settings', 'tenants.title']} />
      <form className={classNames(styles.container, isDirty && styles.withSubmitActionBar)}>
        <FormProvider {...methods}>
          <div className={styles.fields}>
            <ProfileForm currentTenantId={currentTenantId} />
            <LeaveCard />
            {canManageTenant && (
              <DeleteCard currentTenantId={currentTenantId} onClick={onClickDeletionButton} />
            )}
          </div>
        </FormProvider>
        {canManageTenant && (
          <SubmitFormChangesActionBar
            isOpen={isDirty}
            isSubmitting={isSubmitting}
            onDiscard={reset}
            onSubmit={onSubmit}
          />
        )}
      </form>
      {canManageTenant && (
        <>
          <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
          <DeleteModal
            isOpen={isDeletionModalOpen}
            isLoading={isDeleting}
            tenant={watch('profile')}
            onClose={() => {
              setIsDeletionModalOpen(false);
            }}
            onDelete={onDelete}
          />
        </>
      )}
    </>
  );
}

export default TenantBasicSettings;
