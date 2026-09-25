import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useOssTenantMfa from '@/hooks/use-oss-tenant-mfa';
import { getUserTitle } from '@/utils/user';

import styles from './index.module.scss';

/** Tenant settings of a self-hosted deployment. Only reachable when the license carries them. */
function Settings() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { license } = useContext(SubscriptionDataContext);
  const { show } = useConfirmModal();
  const { data, updateMfaRequirement, getMembersWithoutMfa } = useOssTenantMfa();
  const [isUpdating, setIsUpdating] = useState(false);

  const isMfaRequired = data?.isMfaRequired ?? false;
  // Turning the requirement off stays possible without the entitlement, e.g. after the license
  // lapses, so it can never be stuck on.
  const canEnable = Boolean(license?.quota.mandatoryMfa);
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

  const onToggle = async (checked: boolean) => {
    setIsUpdating(true);

    try {
      if (checked && !(await confirmEnabling())) {
        return;
      }

      await updateMfaRequirement(checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <FormCard title="tenants.settings.title" description="tenants.settings.oss_description">
      <PageMeta titleKey={['tenants.tabs.settings', 'tenants.title']} />
      <FormField title="tenants.settings.tenant_mfa">
        <Switch
          label={t('tenants.settings.tenant_mfa_description')}
          disabled={isDisabled}
          checked={isMfaRequired}
          onChange={({ currentTarget: { checked } }) => {
            void onToggle(checked);
          }}
        />
      </FormField>
    </FormCard>
  );
}

export default Settings;
