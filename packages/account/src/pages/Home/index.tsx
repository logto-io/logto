import { AccountCenterControlValue, type AccountCenterFieldControl } from '@logto/schemas';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import {
  authenticatorAppRoute,
  backupCodesManageRoute,
  emailRoute,
  passkeyManageRoute,
  passwordRoute,
  phoneRoute,
  profileRoute,
  usernameRoute,
} from '@ac/constants/routes';

import styles from './index.module.scss';

type FieldAction = 'edit' | 'add' | 'view' | 'manage';

type FieldRowProps = {
  readonly label: string;
  readonly value?: string;
  readonly action?: FieldAction;
  readonly onAction?: () => void;
};

const FieldRow = ({ label, value, action, onAction }: FieldRowProps) => {
  const { t } = useTranslation();

  const actionLabel: Record<FieldAction, string> = {
    edit: t('account_center.home.action_edit'),
    add: t('account_center.home.action_add'),
    view: t('account_center.home.action_view'),
    manage: t('account_center.home.manage'),
  };

  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={`${styles.fieldValue}${value ? '' : ` ${styles.notSet}`}`}>
        {value ?? t('account_center.home.not_set')}
      </span>
      {action && onAction && (
        <div className={styles.fieldAction}>
          <button type="button" onClick={onAction}>
            {actionLabel[action]}
          </button>
        </div>
      )}
    </div>
  );
};

const editAction = (
  controlValue: AccountCenterControlValue | undefined,
  hasValue: boolean
): FieldAction | undefined =>
  controlValue === AccountCenterControlValue.Edit ? (hasValue ? 'edit' : 'add') : undefined;

type PersonalInfoSectionProps = {
  readonly fields: AccountCenterFieldControl;
  readonly userInfo: PageContextType['userInfo'];
  readonly navigate: ReturnType<typeof useNavigate>;
};

const PersonalInfoSection = ({ fields, userInfo, navigate }: PersonalInfoSectionProps) => {
  const { t } = useTranslation();
  const { Off } = AccountCenterControlValue;

  const displayName = userInfo?.name ?? undefined;
  const avatarUrl = userInfo?.avatar ?? undefined;
  const username = userInfo?.username ?? undefined;
  const email = userInfo?.primaryEmail ?? undefined;
  const phone = userInfo?.primaryPhone ?? undefined;

  const hasVisibleField =
    fields.name !== Off ||
    fields.avatar !== Off ||
    fields.username !== Off ||
    fields.email !== Off ||
    fields.phone !== Off;

  if (!hasVisibleField) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t('account_center.home.personal_info_section')}</div>
      {fields.name !== Off && (
        <FieldRow
          label={t('account_center.home.field_name')}
          value={displayName}
          action={editAction(fields.name, Boolean(displayName))}
          onAction={() => {
            navigate(profileRoute);
          }}
        />
      )}
      {fields.avatar !== Off && (
        <FieldRow
          label={t('account_center.home.field_avatar')}
          value={avatarUrl}
          action={editAction(fields.avatar, Boolean(avatarUrl))}
          onAction={() => {
            navigate(profileRoute);
          }}
        />
      )}
      {fields.username !== Off && (
        <FieldRow
          label={t('account_center.home.field_username')}
          value={username}
          action={editAction(fields.username, Boolean(username))}
          onAction={() => {
            navigate(usernameRoute);
          }}
        />
      )}
      {fields.email !== Off && (
        <FieldRow
          label={t('account_center.home.field_email')}
          value={email}
          action={editAction(fields.email, Boolean(email))}
          onAction={() => {
            navigate(emailRoute);
          }}
        />
      )}
      {fields.phone !== Off && (
        <FieldRow
          label={t('account_center.home.field_phone')}
          value={phone}
          action={editAction(fields.phone, Boolean(phone))}
          onAction={() => {
            navigate(phoneRoute);
          }}
        />
      )}
    </div>
  );
};

type SecuritySectionProps = {
  readonly fields: AccountCenterFieldControl;
  readonly hasPassword: boolean;
  readonly navigate: ReturnType<typeof useNavigate>;
};

const SecuritySection = ({ fields, hasPassword, navigate }: SecuritySectionProps) => {
  const { t } = useTranslation();
  const { Off, Edit } = AccountCenterControlValue;

  if (fields.password === Off && fields.mfa === Off) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{t('account_center.home.security_section')}</div>
      {fields.password !== Off && (
        <FieldRow
          label={t('account_center.home.field_password')}
          value={
            hasPassword
              ? t('account_center.home.password_set')
              : t('account_center.home.password_not_set')
          }
          action={fields.password === Edit ? (hasPassword ? 'edit' : 'add') : undefined}
          onAction={() => {
            navigate(passwordRoute);
          }}
        />
      )}
      {fields.mfa !== Off && (
        <>
          <FieldRow
            label={t('account_center.home.field_authenticator_app')}
            action={fields.mfa === Edit ? 'manage' : undefined}
            onAction={() => {
              navigate(authenticatorAppRoute);
            }}
          />
          <FieldRow
            label={t('account_center.home.field_passkeys')}
            action={fields.mfa === Edit ? 'manage' : undefined}
            onAction={() => {
              navigate(passkeyManageRoute);
            }}
          />
          <FieldRow
            label={t('account_center.home.field_backup_codes')}
            action={fields.mfa === Edit ? 'manage' : undefined}
            onAction={() => {
              navigate(backupCodesManageRoute);
            }}
          />
        </>
      )}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { accountCenterSettings, userInfo } = useContext(PageContext);

  const fields = accountCenterSettings?.fields ?? {};
  const displayName = userInfo?.name ?? undefined;
  const avatarUrl = userInfo?.avatar ?? undefined;

  const initials = displayName
    ? displayName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
    : (userInfo?.username?.[0] ?? userInfo?.primaryEmail?.[0] ?? '?');

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.avatarWrapper}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName ?? t('account_center.home.field_avatar')}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>{initials}</div>
          )}
        </div>
        <div className={styles.profileMeta}>
          {(displayName ?? userInfo?.username) && (
            <div className={styles.profileName}>{displayName ?? userInfo?.username}</div>
          )}
          {userInfo?.primaryEmail && (
            <div className={styles.profileEmail}>{userInfo.primaryEmail}</div>
          )}
        </div>
      </div>
      <PersonalInfoSection fields={fields} userInfo={userInfo} navigate={navigate} />
      <SecuritySection
        fields={fields}
        hasPassword={userInfo?.hasPassword ?? false}
        navigate={navigate}
      />
    </div>
  );
};

export default Home;
