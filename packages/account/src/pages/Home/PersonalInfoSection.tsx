import Button from '@experience/shared/components/Button';
import { AccountCenterControlValue, type AccountCenterFieldControl } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';
import { type useNavigate } from 'react-router-dom';

import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import { emailRoute, phoneRoute, profileRoute, usernameRoute } from '@ac/constants/routes';

import { FieldRow, editAction } from './FieldRow';
import styles from './index.module.scss';

const { Off: OffValue, Edit: EditValue } = AccountCenterControlValue;

export const checkHasPersonalInfoFields = (fields: AccountCenterFieldControl): boolean =>
  fields.name !== OffValue ||
  fields.avatar !== OffValue ||
  fields.username !== OffValue ||
  fields.email !== OffValue ||
  fields.phone !== OffValue ||
  fields.profile !== OffValue;

type FieldConfig = {
  readonly fieldKey: keyof AccountCenterFieldControl;
  readonly labelKey: TFuncKey;
  readonly value: string | undefined;
  readonly route: string;
};

type PersonalInfoSectionProps = {
  readonly fields: AccountCenterFieldControl;
  readonly userInfo: PageContextType['userInfo'];
  readonly navigate: ReturnType<typeof useNavigate>;
};

const PersonalInfoSection = ({ fields, userInfo, navigate }: PersonalInfoSectionProps) => {
  const { t } = useTranslation();

  const fieldConfigs: FieldConfig[] = [
    {
      fieldKey: 'name',
      labelKey: 'account_center.home.field_name',
      value: userInfo?.name ?? undefined,
      route: profileRoute,
    },
    {
      fieldKey: 'profile',
      labelKey: 'account_center.home.field_given_name',
      value: userInfo?.profile?.givenName,
      route: profileRoute,
    },
    {
      fieldKey: 'profile',
      labelKey: 'account_center.home.field_family_name',
      value: userInfo?.profile?.familyName,
      route: profileRoute,
    },
    {
      fieldKey: 'avatar',
      labelKey: 'account_center.home.field_avatar',
      value: userInfo?.avatar ?? undefined,
      route: profileRoute,
    },
    {
      fieldKey: 'username',
      labelKey: 'account_center.home.field_username',
      value: userInfo?.username ?? undefined,
      route: usernameRoute,
    },
    {
      fieldKey: 'email',
      labelKey: 'account_center.home.field_email',
      value: userInfo?.primaryEmail ?? undefined,
      route: emailRoute,
    },
    {
      fieldKey: 'phone',
      labelKey: 'account_center.home.field_phone',
      value: userInfo?.primaryPhone ?? undefined,
      route: phoneRoute,
    },
  ];

  const visibleFields = fieldConfigs.filter(({ fieldKey }) => fields[fieldKey] !== OffValue);

  if (visibleFields.length === 0) {
    return null;
  }

  const profileFields = visibleFields.filter(({ route }) => route === profileRoute);
  const contactFields = visibleFields.filter(({ route }) => route !== profileRoute);

  const profileEditable = profileFields.some(({ fieldKey }) => fields[fieldKey] === EditValue);
  const hasProfileValue = profileFields.some(({ value }) => Boolean(value));
  const profileActionKey: TFuncKey | undefined = profileEditable
    ? hasProfileValue
      ? 'account_center.home.action_edit'
      : 'account_center.home.action_add'
    : undefined;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeaderRow}>
        <span className={styles.sectionHeaderTitle}>
          {t('account_center.home.personal_info_section')}
        </span>
        {profileActionKey && profileFields.length > 0 && (
          <Button
            title={profileActionKey}
            type="secondary"
            size="small"
            onClick={() => {
              navigate(profileRoute);
            }}
          />
        )}
      </div>
      {profileFields.map(({ labelKey, value }) => (
        <FieldRow key={labelKey} label={t(labelKey)} value={value} />
      ))}
      {contactFields.map(({ fieldKey, labelKey, value, route }) => (
        <FieldRow
          key={labelKey}
          label={t(labelKey)}
          value={value}
          actionKey={editAction(fields[fieldKey], Boolean(value))}
          onAction={() => {
            navigate(route);
          }}
        />
      ))}
    </div>
  );
};

export default PersonalInfoSection;
