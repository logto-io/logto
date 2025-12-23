import { AccountCenterControlValue, type SignInExperience } from '@logto/schemas';
import { useCallback, useMemo, type ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import FormField from '@/ds-components/FormField';
import type { Option } from '@/ds-components/Select';
import Switch from '@/ds-components/Switch';

import type {
  AccountCenterFormValues,
  AccountCenterFieldKey,
  SignInExperienceForm,
} from '../../types';
import SignInExperienceTabWrapper from '../components/SignInExperienceTabWrapper';

import AccountCenterField from './AccountCenterField';
import IntegratePrebuiltUi from './IntegratePrebuiltUi';
import SecretVaultSection from './SecretVaultSection';
import WebauthnRelatedOriginsField from './WebauthnRelatedOriginsField';
import { accountCenterSections } from './constants';
import styles from './index.module.scss';

type Props = {
  readonly isActive: boolean;
  readonly data: SignInExperience;
};

function AccountCenter({ isActive, data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    watch,
    setValue,
    formState: { isSubmitting },
  } = useFormContext<SignInExperienceForm & { accountCenter: AccountCenterFormValues }>();

  const fieldOptions = useMemo<Array<Option<AccountCenterControlValue>>>(
    () => [
      {
        value: AccountCenterControlValue.Off,
        title: t('sign_in_exp.account_center.field_options.off'),
      },
      {
        value: AccountCenterControlValue.Edit,
        title: t('sign_in_exp.account_center.field_options.edit'),
      },
      {
        value: AccountCenterControlValue.ReadOnly,
        title: t('sign_in_exp.account_center.field_options.read_only'),
      },
    ],
    [t]
  );

  const { enabled, fields } = watch('accountCenter');
  const isAccountApiEnabled = enabled;

  const isMfaEnabled = useMemo(() => {
    return data.mfa.factors.length > 0;
  }, [data.mfa]);

  const handleToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue('accountCenter.enabled', event.target.checked, { shouldDirty: true });
    },
    [setValue]
  );

  const handleFieldChange = useCallback(
    (field: AccountCenterFieldKey, value?: AccountCenterControlValue) => {
      if (!value) {
        return;
      }

      setValue(`accountCenter.fields.${field}`, value, { shouldDirty: true });
    },
    [setValue]
  );

  return (
    <SignInExperienceTabWrapper isActive={isActive}>
      {isActive && (
        <PageMeta titleKey={['sign_in_exp.tabs.account_center', 'sign_in_exp.page_title']} />
      )}
      <FormCard
        title="sign_in_exp.account_center.title"
        description="sign_in_exp.account_center.description"
        learnMoreLink={{ href: 'end-user-flows/account-settings/by-account-api' }}
      >
        <div className={styles.cardContent}>
          <FormField title="sign_in_exp.account_center.enable_account_api" headlineSpacing="large">
            <Switch
              checked={enabled}
              disabled={isSubmitting}
              description="sign_in_exp.account_center.enable_account_api_description"
              onChange={handleToggle}
            />
          </FormField>
        </div>
      </FormCard>
      <IntegratePrebuiltUi />
      {accountCenterSections.map((section) => (
        <FormCard key={section.key} title={section.title} description={section.description}>
          <div className={styles.cardContent}>
            {section.groups.map((group) => (
              <FormField key={group.key} title={group.title} headlineSpacing="large">
                <div className={styles.groupFields}>
                  {group.items.map((item) => (
                    <AccountCenterField
                      key={item.key}
                      item={item}
                      value={fields[item.key]}
                      isMfaEnabled={isMfaEnabled}
                      isGlobalDisabled={!isAccountApiEnabled}
                      fieldOptions={fieldOptions}
                      onChange={handleFieldChange}
                    />
                  ))}
                </div>
              </FormField>
            ))}
            {section.key === 'accountSecurity' && (
              <WebauthnRelatedOriginsField isAccountApiEnabled={isAccountApiEnabled} />
            )}
          </div>
        </FormCard>
      ))}
      <SecretVaultSection isAccountApiEnabled={isAccountApiEnabled} />
    </SignInExperienceTabWrapper>
  );
}

export default AccountCenter;
