import type { AdminConsoleKey } from '@logto/phrases';
import { AccountCenterControlValue } from '@logto/schemas';
import { useCallback, useMemo, type ChangeEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Select, { type Option } from '@/ds-components/Select';
import Switch from '@/ds-components/Switch';

import {
  type AccountCenterFormValues,
  type AccountCenterFieldKey,
  type SignInExperienceForm,
} from '../../types';
import SignInExperienceTabWrapper from '../components/SignInExperienceTabWrapper';

import styles from './index.module.scss';

type AccountCenterFieldItem = {
  readonly key: AccountCenterFieldKey;
  readonly title: AdminConsoleKey;
  readonly description?: AdminConsoleKey;
};

type AccountCenterFieldGroup = {
  readonly key: string;
  readonly title: AdminConsoleKey;
  readonly items: readonly AccountCenterFieldItem[];
};

type AccountCenterFieldSection = {
  readonly key: string;
  readonly title: AdminConsoleKey;
  readonly description: AdminConsoleKey;
  readonly groups: readonly AccountCenterFieldGroup[];
};

const accountCenterSections: AccountCenterFieldSection[] = [
  {
    key: 'accountSecurity',
    title: 'sign_in_exp.account_center.sections.account_security.title',
    description: 'sign_in_exp.account_center.sections.account_security.description',
    groups: [
      {
        key: 'identifiers',
        title: 'sign_in_exp.account_center.sections.account_security.groups.identifiers.title',
        items: [
          { key: 'email', title: 'sign_in_exp.account_center.fields.email' },
          { key: 'phone', title: 'sign_in_exp.account_center.fields.phone' },
          { key: 'social', title: 'sign_in_exp.account_center.fields.social' },
        ],
      },
      {
        key: 'authentication',
        title:
          'sign_in_exp.account_center.sections.account_security.groups.authentication_factors.title',
        items: [
          { key: 'password', title: 'sign_in_exp.account_center.fields.password' },
          {
            key: 'mfa',
            title: 'sign_in_exp.account_center.fields.mfa',
          },
        ],
      },
    ],
  },
  {
    key: 'userProfile',
    title: 'sign_in_exp.account_center.sections.user_profile.title',
    description: 'sign_in_exp.account_center.sections.user_profile.description',
    groups: [
      {
        key: 'profileData',
        title: 'sign_in_exp.account_center.sections.user_profile.groups.profile_data.title',
        items: [
          { key: 'username', title: 'sign_in_exp.account_center.fields.username' },
          { key: 'name', title: 'sign_in_exp.account_center.fields.name' },
          { key: 'avatar', title: 'sign_in_exp.account_center.fields.avatar' },
          {
            key: 'profile',
            title: 'sign_in_exp.account_center.fields.profile',
          },
          {
            key: 'customData',
            title: 'sign_in_exp.account_center.fields.custom_data',
          },
        ],
      },
    ],
  },
];

type Props = {
  readonly isActive: boolean;
};

function AccountCenter({ isActive }: Props) {
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
          <FormField title="sign_in_exp.account_center.enable_account_api">
            <Switch
              checked={enabled}
              disabled={isSubmitting}
              description="sign_in_exp.account_center.enable_account_api_description"
              onChange={handleToggle}
            />
          </FormField>
        </div>
      </FormCard>
      {accountCenterSections.map((section) => (
        <FormCard key={section.key} title={section.title} description={section.description}>
          <div className={styles.cardContent}>
            {section.groups.map((group) => (
              <FormField key={group.key} title={group.title}>
                <div className={styles.groupFields}>
                  {group.items.map((item) => {
                    const isReadOnly = !isAccountApiEnabled || isSubmitting;

                    return (
                      <div
                        key={item.key}
                        className={styles.fieldRow}
                        data-disabled={isReadOnly || undefined}
                      >
                        <div className={styles.fieldLabel}>
                          <div className={styles.fieldName}>
                            <DynamicT forKey={item.title} />
                          </div>
                        </div>
                        <div className={styles.fieldControl}>
                          <Select<AccountCenterControlValue>
                            value={fields[item.key]}
                            options={fieldOptions}
                            isReadOnly={isReadOnly}
                            onChange={(value) => {
                              handleFieldChange(item.key, value);
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FormField>
            ))}
          </div>
        </FormCard>
      ))}
    </SignInExperienceTabWrapper>
  );
}

export default AccountCenter;
