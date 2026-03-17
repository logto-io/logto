import {
  AccountCenterControlValue,
  MfaFactor,
  type AccountCenterFieldControl,
} from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getMfaVerifications } from '@ac/apis/mfa';
import {
  authenticatorAppManageRoute,
  authenticatorAppRoute,
  backupCodesManageRoute,
  passkeyManageRoute,
  passwordRoute,
} from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';

import { FieldRow } from './FieldRow';
import PersonalInfoSection, { checkHasPersonalInfoFields } from './PersonalInfoSection';
import styles from './index.module.scss';

const { Off: OffValue } = AccountCenterControlValue;

const checkHasSecurityFields = (fields: AccountCenterFieldControl): boolean =>
  fields.password !== OffValue || fields.mfa !== OffValue;

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

  const hasPersonalInfo = checkHasPersonalInfoFields(fields);
  const hasSecurity = checkHasSecurityFields(fields);
  const hasAnyFields = hasPersonalInfo || hasSecurity;

  const displayName = userInfo?.name ?? undefined;
  const avatarUrl = userInfo?.avatar ?? undefined;
  const givenName = userInfo?.profile?.givenName;
  const familyName = userInfo?.profile?.familyName;
  const profileFullName = [givenName, familyName].filter(Boolean).join(' ') || undefined;
  const cardName = profileFullName ?? displayName ?? userInfo?.username;

  const initials = cardName
    ? cardName
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
    : (userInfo?.primaryEmail?.[0] ?? '?');

  return (
    <div className={styles.container}>
      {hasAnyFields ? (
        <>
          <div className={styles.profileCard}>
            <div className={styles.avatarWrapper}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={cardName ?? t('account_center.home.field_avatar')}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>{initials}</div>
              )}
            </div>
            <div className={styles.profileMeta}>
              {cardName && <div className={styles.profileName}>{cardName}</div>}
              {userInfo?.primaryEmail && (
                <div className={styles.profileEmail}>{userInfo.primaryEmail}</div>
              )}
            </div>
          </div>
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
