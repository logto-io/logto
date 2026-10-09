import { useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useOssTenantMfa from '@/hooks/use-oss-tenant-mfa';
import { trySubmitSafe } from '@/utils/form';
import { getUserTitle } from '@/utils/user';

import styles from './index.module.scss';

/** Tenant settings of a self-hosted deployment. Its tab link shows when the license carries them. */
function Settings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { licenseQuota } = useContext(SubscriptionDataContext);
  const { show } = useConfirmModal();
  const { data, updateMfaRequirement, getMembersWithoutMfa } = useOssTenantMfa();
  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting: isUpdating },
  } = useForm({ defaultValues: { isMfaRequired: data?.isMfaRequired ?? false } });

  useEffect(() => {
    // Keep in-progress edits when SWR revalidates the saved setting.
    if (data && !isDirty) {
      reset({ isMfaRequired: data.isMfaRequired });
    }
  }, [data, isDirty, reset]);

  const isMfaRequired = data?.isMfaRequired ?? false;
  // Turning the requirement off stays possible without the entitlement, e.g. after the license
  // lapses, so it can never be stuck on.
  const canEnable = licenseQuota.mandatoryMfa;
  const isDisabled = !data?.isAdmin || isUpdating || (!isMfaRequired && !canEnable);

  /**
   * Warn before requiring MFA while some members, the current admin included, have none: they keep
   * their current session, and are asked to set it up at their next sign-in.
   */
  const confirmEnabling = async () => {
    const membersWithoutMfa = await getMembersWithoutMfa();

    if (membersWithoutMfa.length === 0) {
      return true;
    }

    const [result] = await show({
      title: 'tenants.settings.tenant_mfa_confirm_title',
      ModalContent: () => (
        <div className={styles.confirmContent}>
          <p>{t('tenants.settings.tenant_mfa_confirm_description')}</p>
          <ul className={styles.members}>
            {membersWithoutMfa.map((member) => (
              <li key={member.id}>{getUserTitle(member)}</li>
            ))}
          </ul>
          {data?.hasMfaConfigured === false && (
            <p>{t('tenants.settings.tenant_mfa_confirm_self')}</p>
          )}
        </div>
      ),
      confirmButtonType: 'primary',
      confirmButtonText: 'tenants.settings.tenant_mfa_confirm_button',
    });

    return result;
  };

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (!data?.isAdmin || isUpdating || !isDirty) {
        return;
      }

      if (formData.isMfaRequired && !(await confirmEnabling())) {
        return;
      }

      await updateMfaRequirement(formData.isMfaRequired);
      reset(formData);
      toast.success(t('general.saved'));
    })
  );

  return (
    <>
      <PageMeta titleKey={['tenants.tabs.settings', 'tenants.title']} />
      <DetailsForm
        isDirty={isDirty && Boolean(data?.isAdmin)}
        isSubmitting={isUpdating}
        onSubmit={onSubmit}
        onDiscard={reset}
      >
        <FormCard title="tenants.settings.title" description="tenants.settings.oss_description">
          <FormField title="tenants.settings.tenant_mfa">
            <Controller
              name="isMfaRequired"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  label={t('tenants.settings.tenant_mfa_description')}
                  disabled={isDisabled}
                  checked={value}
                  onChange={({ currentTarget: { checked } }) => {
                    onChange(checked);
                  }}
                />
              )}
            />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
}

export default Settings;
