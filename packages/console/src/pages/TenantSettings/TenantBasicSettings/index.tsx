import { type TenantInfo, TenantTag } from '@logto/schemas/models';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppError from '@/components/AppError';
import PageMeta from '@/components/PageMeta';
import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { TenantsContext } from '@/contexts/TenantsProvider';

import DeleteCard from './DeleteCard';
import DeleteModal from './DeleteModal';
import ProfileForm from './ProfileForm';
import * as styles from './index.module.scss';
import { type TenantSettingsForm } from './types.js';

const tenantProfileToForm = (tenant?: TenantInfo): TenantSettingsForm => {
  return {
    profile: { name: tenant?.name ?? 'My project', tag: tenant?.tag ?? TenantTag.Development },
  };
};

function TenantBasicSettings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useCloudApi();
  const { currentTenant, currentTenantId, tenants, updateTenant, removeTenant } =
    useContext(TenantsContext);
  const [error, setError] = useState<Error>();
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const methods = useForm<TenantSettingsForm>({
    defaultValues: tenantProfileToForm(currentTenant),
  });
  const {
    watch,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

  useEffect(() => {
    reset(tenantProfileToForm(currentTenant));
  }, [currentTenant, reset]);

  const saveData = async (data: { name?: string; tag?: TenantTag }) => {
    try {
      const { name, tag } = await api.patch(`/api/tenants/:tenantId`, {
        params: { tenantId: currentTenantId },
        body: data,
      });
      reset({ profile: { name, tag } });
      toast.success(t('tenants.settings.tenant_info_saved'));
      updateTenant(currentTenantId, data);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error
          : new Error(JSON.stringify(error, Object.getOwnPropertyNames(error)))
      );
    }
  };

  const onSubmit = handleSubmit(async (formData: TenantSettingsForm) => {
    if (isSubmitting) {
      return;
    }

    const {
      profile: { name, tag },
    } = formData;
    await saveData({ name, tag });
  });

  const onClickDeletionButton = () => {
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
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error
          : new Error(JSON.stringify(error, Object.getOwnPropertyNames(error)))
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  return (
    <>
      <PageMeta titleKey={['tenants.tabs.settings', 'tenants.title']} />
      <form className={classNames(styles.container, isDirty && styles.withSubmitActionBar)}>
        <FormProvider {...methods}>
          <div className={styles.fields}>
            <ProfileForm currentTenantId={currentTenantId} />
            <DeleteCard currentTenantId={currentTenantId} onClick={onClickDeletionButton} />
          </div>
        </FormProvider>
        <SubmitFormChangesActionBar
          isOpen={isDirty}
          isSubmitting={isSubmitting}
          onDiscard={reset}
          onSubmit={onSubmit}
        />
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
      </form>
    </>
  );
}

export default TenantBasicSettings;
