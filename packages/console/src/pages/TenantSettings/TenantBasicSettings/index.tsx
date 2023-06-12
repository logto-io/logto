import { type PatchTenant, type TenantInfo, TenantTag } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import AppError from '@/components/AppError';
import AppLoading from '@/components/AppLoading';
import PageMeta from '@/components/PageMeta';
import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useTenants from '@/hooks/use-tenants';

import DeleteCard from './DeleteCard';
import DeleteModal from './DeleteModal';
import ProfileForm from './ProfileForm';
import * as styles from './index.module.scss';
import { type TenantSettingsForm } from './types.js';

function TenantBasicSettings() {
  const {
    api: cloudApi,
    currentTenant,
    currentTenantId,
    error: requestError,
    mutate,
    isLoading,
    tenants,
  } = useTenants();
  const [error, setError] = useState<Error>();
  const [isDeletionModalOpen, setIsDeletionModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (requestError) {
      setError(requestError);
    }
  }, [requestError]);

  const methods = useForm<TenantSettingsForm>();
  const {
    watch,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

  useEffect(() => {
    const { name, tag } = currentTenant ?? { name: 'My project', tag: TenantTag.Development };
    reset({ profile: { name, tag } });
  }, [currentTenant, reset]);

  const saveData = async (data: PatchTenant) => {
    try {
      const { name, tag } = await cloudApi
        .patch(`/api/tenants/${currentTenantId}`, {
          json: data,
        })
        .json<TenantInfo>();
      reset({ profile: { name, tag } });
      void mutate();
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
      await cloudApi.delete(`/api/tenants/${currentTenantId}`);
      setIsDeletionModalOpen(false);
      await mutate();
      if (tenants?.[0]?.id) {
        window.open(new URL(`/${tenants[0].id}`, window.location.origin).toString(), '_self');
      }
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

  if (isLoading) {
    return <AppLoading />;
  }

  if (error) {
    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  return (
    <>
      <PageMeta titleKey={['tenant_settings.tabs.settings', 'tenant_settings.title']} />
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
