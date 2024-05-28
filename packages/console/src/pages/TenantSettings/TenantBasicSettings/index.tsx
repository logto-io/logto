import { ReservedPlanId, type TenantTag } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import PageMeta from '@/components/PageMeta';
import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { TenantsContext } from '@/contexts/TenantsProvider';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import { trySubmitSafe } from '@/utils/form';

import DeleteCard from './DeleteCard';
import DeleteModal from './DeleteModal';
import LeaveCard from './LeaveCard';
import ProfileForm from './ProfileForm';
import * as styles from './index.module.scss';
import { type TenantSettingsForm } from './types.js';

function TenantBasicSettings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();
  const api = useCloudApi();
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
    defaultValues: { profile: currentTenant },
  });
  const {
    watch,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

  useEffect(() => {
    reset({ profile: currentTenant });
  }, [currentTenant, reset]);

  const saveData = async (data: { name?: string; tag?: TenantTag }) => {
    const { name, tag } = await api.patch(`/api/tenants/:tenantId`, {
      params: { tenantId: currentTenantId },
      body: data,
    });
    reset({ profile: { name, tag } });
    toast.success(t('tenants.settings.tenant_info_saved'));
    updateTenant(currentTenantId, data);
  };

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: TenantSettingsForm) => {
      if (isSubmitting) {
        return;
      }

      const {
        profile: { name, tag },
      } = formData;
      await saveData({ name, tag });
    })
  );

  const onClickDeletionButton = async () => {
    if (
      !isDevTenant &&
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
