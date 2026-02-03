import { ReservedPlanId, type TenantTag } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR, { type KeyedMutator } from 'swr';

import { useAuthedCloudApi, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantSettingsResponse } from '@/cloud/types/router';
import AppLoading from '@/components/AppLoading';
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
  const authedCloudApi = useAuthedCloudApi();
  const { currentTenantId } = useContext(TenantsContext);

  const {
    data: tenantSettings,
    error: tenantSettingsError,
    isLoading: isTenantSettingsLoading,
    mutate: mutateTenantSettings,
  } = useSWR<TenantSettingsResponse, RequestError>(
    `api/tenants/${currentTenantId}/settings`,
    async () =>
      authedCloudApi.get(`/api/tenants/:tenantId/settings`, {
        params: { tenantId: currentTenantId },
      })
  );

  if (isTenantSettingsLoading) {
    return (
      <>
        <PageMeta titleKey={['tenants.tabs.settings', 'tenants.title']} />
        <AppLoading />
      </>
    );
  }

  const resolvedTenantSettings: TenantSettingsResponse =
    tenantSettings ?? { isMfaRequired: false };

  return (
    <>
      <PageMeta titleKey={['tenants.tabs.settings', 'tenants.title']} />
      <TenantBasicSettingsForm
        tenantSettings={resolvedTenantSettings}
        mutateTenantSettings={mutateTenantSettings}
        isTenantSettingsLoading={isTenantSettingsLoading}
        hasTenantSettingsError={Boolean(tenantSettingsError)}
      />
    </>
  );
}

type TenantBasicSettingsFormProps = {
  readonly tenantSettings: TenantSettingsResponse;
  readonly mutateTenantSettings: KeyedMutator<TenantSettingsResponse>;
  readonly isTenantSettingsLoading: boolean;
  readonly hasTenantSettingsError: boolean;
};

function TenantBasicSettingsForm({
  tenantSettings,
  mutateTenantSettings,
  isTenantSettingsLoading,
  hasTenantSettingsError,
}: TenantBasicSettingsFormProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();
  const api = useCloudApi();
  const authedCloudApi = useAuthedCloudApi();
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

  const methods = useForm<TenantSettingsForm>({
    defaultValues: {
      profile: currentTenant,
      settings: {
        isMfaRequired: tenantSettings.isMfaRequired,
      },
    },
  });
  const {
    watch,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting, dirtyFields },
  } = methods;

  const [lastTenantId, setLastTenantId] = useState(currentTenantId);

  useEffect(() => {
    const hasTenantChanged = lastTenantId !== currentTenantId;
    const nextValues = {
      profile: currentTenant,
      settings: {
        isMfaRequired: tenantSettings.isMfaRequired,
      },
    };

    if (hasTenantChanged) {
      reset(nextValues);
      setLastTenantId(currentTenantId);
      return;
    }

    reset(nextValues, { keepDirtyValues: true });
  }, [currentTenant, currentTenantId, lastTenantId, reset, tenantSettings.isMfaRequired]);

  const saveData = async (data: { name?: string; tag?: TenantTag }) => {
    const { name, tag } = await api.patch(`/api/tenants/:tenantId`, {
      params: { tenantId: currentTenantId },
      body: data,
    });
    updateTenant(currentTenantId, data);

    return { name, tag };
  };

  const saveTenantSettings = async (isMfaRequired: boolean) => {
    const updated = await authedCloudApi.patch(`/api/tenants/:tenantId/settings`, {
      params: { tenantId: currentTenantId },
      body: { isMfaRequired },
    });
    void mutateTenantSettings(updated);
    return updated;
  };

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: TenantSettingsForm) => {
      if (isSubmitting) {
        return;
      }

      const { profile, settings } = formData;
      const hasProfileChanges = Boolean(dirtyFields.profile?.name ?? dirtyFields.profile?.tag);
      const hasMfaChanges = Boolean(dirtyFields.settings?.isMfaRequired);

      const [nextProfile, nextSettings] = await Promise.all([
        hasProfileChanges
          ? saveData({ name: profile.name, tag: profile.tag }).then(({ name, tag }) => ({
              ...profile,
              name,
              tag,
            }))
          : Promise.resolve(profile),
        hasMfaChanges
          ? saveTenantSettings(settings.isMfaRequired)
          : Promise.resolve(tenantSettings),
      ]);

      reset({
        profile: nextProfile,
        settings: {
          isMfaRequired: nextSettings.isMfaRequired,
        },
      });

      if (hasProfileChanges) {
        toast.success(t('tenants.settings.tenant_info_saved'));
      } else if (hasMfaChanges) {
        toast.success(t('general.saved'));
      }
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
      <form className={classNames(styles.container, isDirty && styles.withSubmitActionBar)}>
        <FormProvider {...methods}>
          <div className={styles.fields}>
            <ProfileForm
              currentTenantId={currentTenantId}
              isTenantSettingsLoading={isTenantSettingsLoading}
              hasTenantSettingsError={hasTenantSettingsError}
            />
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
