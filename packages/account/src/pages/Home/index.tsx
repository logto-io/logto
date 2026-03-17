import Button from '@experience/shared/components/Button';
import {
  AccountCenterControlValue,
  MfaFactor,
  type AccountCenterFieldControl,
} from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import { getMfaVerifications } from '@ac/apis/mfa';
import {
  authenticatorAppManageRoute,
  authenticatorAppRoute,
  backupCodesManageRoute,
  emailRoute,
  passkeyManageRoute,
  passwordRoute,
  phoneRoute,
  profileRoute,
  usernameRoute,
} from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';

import styles from './index.module.scss';

type FieldRowProps = {
  readonly label: string;
  readonly value?: string;
  readonly actionKey?: TFuncKey;
  readonly onAction?: () => void;
};

const FieldRow = ({ label, value, actionKey, onAction }: FieldRowProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={`${styles.fieldValue}${value ? '' : ` ${styles.notSet}`}`}>
        {value ?? t('account_center.home.not_set')}
      </span>
      {actionKey && onAction && (
        <div className={styles.fieldAction}>
          <Button title={actionKey} type="secondary" size="small" onClick={onAction} />
        </div>
      )}
    </div>
  );
};

const editAction = (
  controlValue: AccountCenterControlValue | undefined,
  hasValue: boolean
): TFuncKey | undefined =>
  controlValue === AccountCenterControlValue.Edit
    ? hasValue
      ? 'account_center.home.action_edit'
      : 'account_center.home.action_add'
    : undefined;

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
          actionKey={editAction(fields.name, Boolean(displayName))}
          onAction={() => {
            navigate(profileRoute);
          }}
        />
      )}
      {fields.avatar !== Off && (
        <FieldRow
          label={t('account_center.home.field_avatar')}
          value={avatarUrl}
          actionKey={editAction(fields.avatar, Boolean(avatarUrl))}
          onAction={() => {
            navigate(profileRoute);
          }}
        />
      )}
      {fields.username !== Off && (
        <FieldRow
          label={t('account_center.home.field_username')}
          value={username}
          actionKey={editAction(fields.username, Boolean(username))}
          onAction={() => {
            navigate(usernameRoute);
          }}
        />
      )}
      {fields.email !== Off && (
        <FieldRow
          label={t('account_center.home.field_email')}
          value={email}
          actionKey={editAction(fields.email, Boolean(email))}
          onAction={() => {
            navigate(emailRoute);
          }}
        />
      )}
      {fields.phone !== Off && (
        <FieldRow
          label={t('account_center.home.field_phone')}
          value={phone}
          actionKey={editAction(fields.phone, Boolean(phone))}
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
  readonly hasTotpSetup: boolean;
  readonly passkeyCount: number;
  readonly navigate: ReturnType<typeof useNavigate>;
};

const SecuritySection = ({
  fields,
  hasPassword,
  hasTotpSetup,
  passkeyCount,
  navigate,
}: SecuritySectionProps) => {
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
          actionKey={
            fields.password === Edit
              ? hasPassword
                ? 'account_center.home.action_edit'
                : 'account_center.home.action_add'
              : undefined
          }
          onAction={() => {
            navigate(passwordRoute);
          }}
        />
      )}
      {fields.mfa !== Off && (
        <>
          <FieldRow
            label={t('account_center.home.field_authenticator_app')}
            value={hasTotpSetup ? t('account_center.home.totp_active') : undefined}
            actionKey={fields.mfa === Edit ? 'account_center.home.manage' : undefined}
            onAction={() => {
              navigate(hasTotpSetup ? authenticatorAppManageRoute : authenticatorAppRoute);
            }}
          />
          <FieldRow
            label={t('account_center.home.field_passkeys')}
            value={
              passkeyCount > 0
                ? t('account_center.home.passkeys_count', { count: passkeyCount })
                : undefined
            }
            actionKey={fields.mfa === Edit ? 'account_center.home.manage' : undefined}
            onAction={() => {
              navigate(passkeyManageRoute);
            }}
          />
          <FieldRow
            label={t('account_center.home.field_backup_codes')}
            actionKey={fields.mfa === Edit ? 'account_center.home.manage' : undefined}
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
  const getMfaRequest = useApi(getMfaVerifications, { silent: true });
  const [hasTotpSetup, setHasTotpSetup] = useState(false);
  const [passkeyCount, setPasskeyCount] = useState(0);

  const fields = accountCenterSettings?.fields ?? {};

  useEffect(() => {
    const checkMfa = async () => {
      const [, result] = await getMfaRequest();
      if (result) {
        setHasTotpSetup(result.some((mfa) => mfa.type === MfaFactor.TOTP));
        setPasskeyCount(result.filter((mfa) => mfa.type === MfaFactor.WebAuthn).length);
      }
    };
    void checkMfa();
  }, [getMfaRequest]);

  const { Off } = AccountCenterControlValue;
  const hasPersonalInfoFields =
    fields.name !== Off ||
    fields.avatar !== Off ||
    fields.username !== Off ||
    fields.email !== Off ||
    fields.phone !== Off;
  const hasSecurityFields = fields.password !== Off || fields.mfa !== Off;
  const hasAnyFields = hasPersonalInfoFields || hasSecurityFields;

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
      {hasAnyFields ? (
        <>
          <PersonalInfoSection fields={fields} userInfo={userInfo} navigate={navigate} />
          <SecuritySection
            fields={fields}
            hasPassword={userInfo?.hasPassword ?? false}
            hasTotpSetup={hasTotpSetup}
            passkeyCount={passkeyCount}
            navigate={navigate}
          />
        </>
      ) : (
        <p className={styles.emptyState}>{t('account_center.home.no_fields_available')}</p>
      )}
    </div>
  );
};

export default Home;
