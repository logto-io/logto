import {
  AccountCenterControlValue,
  MfaFactor,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { formatToInternationalPhoneNumber } from '@logto/shared/universal';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import EmailIcon from '@ac/assets/icons/email.svg?react';
import BackupCodeIcon from '@ac/assets/icons/factor-backup-code.svg?react';
import TotpIcon from '@ac/assets/icons/factor-totp.svg?react';
import WebAuthnIcon from '@ac/assets/icons/factor-webauthn.svg?react';
import PhoneIcon from '@ac/assets/icons/phone.svg?react';
import {
  authenticatorAppRoute,
  backupCodesGenerateRoute,
  backupCodesManageRoute,
  emailRoute,
  passkeyAddRoute,
  passkeyManageRoute,
  phoneRoute,
} from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import { hasVisibleMfaSection } from '@ac/utils/security-page';

import { getMfaVerifications } from '../../../apis/mfa';
import useApi from '../../../hooks/use-api';

import styles from './index.module.scss';

const factorIcon = {
  [MfaFactor.TOTP]: TotpIcon,
  [MfaFactor.WebAuthn]: WebAuthnIcon,
  [MfaFactor.BackupCode]: BackupCodeIcon,
  [MfaFactor.EmailVerificationCode]: EmailIcon,
  [MfaFactor.PhoneVerificationCode]: PhoneIcon,
};

type Row = {
  key: string;
  icon: typeof TotpIcon;
  label: string;
  value?: string;
  isConfigured: boolean;
  action?: { label: string; handler: () => void };
};

const MfaSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings, userInfo } = useContext(PageContext);
  const [mfaVerifications, setMfaVerifications] = useState<UserMfaVerificationResponse>();

  const mfaControl = accountCenterSettings?.fields.mfa;
  const enabledFactors = experienceSettings?.mfa.factors ?? [];

  const getMfaRequest = useApi(getMfaVerifications, { silent: true });

  const fetchMfaVerifications = useCallback(async () => {
    const [error, result] = await getMfaRequest();
    if (!error && result) {
      setMfaVerifications(result);
    }
  }, [getMfaRequest]);

  useEffect(() => {
    void fetchMfaVerifications();
  }, [fetchMfaVerifications]);

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  const webAuthnVerifications =
    mfaVerifications?.filter((verification) => verification.type === MfaFactor.WebAuthn) ?? [];
  const totpVerification = mfaVerifications?.find(
    (verification) => verification.type === MfaFactor.TOTP
  );
  const backupCodeVerification = mfaVerifications?.find(
    (verification) => verification.type === MfaFactor.BackupCode
  );

  const isEditable = mfaControl === AccountCenterControlValue.Edit;

  const rows = useMemo(() => {
    if (!hasVisibleMfaSection(mfaControl, experienceSettings)) {
      return [];
    }

    const buildWebAuthnRow = (): Row[] => {
      if (!enabledFactors.includes(MfaFactor.WebAuthn)) {
        return [];
      }
      const isConfigured = webAuthnVerifications.length > 0;
      const Icon = factorIcon[MfaFactor.WebAuthn];
      return [
        {
          key: 'webauthn',
          icon: Icon,
          label: t('account_center.security.passkeys'),
          value: isConfigured
            ? t('account_center.security.passkeys_count', {
                count: webAuthnVerifications.length,
              })
            : undefined,
          isConfigured,
          action: isEditable
            ? {
                label: isConfigured
                  ? t('account_center.security.manage')
                  : t('account_center.security.add'),
                handler: () => {
                  navigateTo(isConfigured ? passkeyManageRoute : passkeyAddRoute);
                },
              }
            : undefined,
        },
      ];
    };

    const buildTotpRow = (): Row[] => {
      if (!enabledFactors.includes(MfaFactor.TOTP)) {
        return [];
      }
      const isConfigured = Boolean(totpVerification);
      const Icon = factorIcon[MfaFactor.TOTP];
      return [
        {
          key: 'totp',
          icon: Icon,
          label: t('account_center.security.authenticator_app'),
          value: isConfigured ? t('account_center.security.configured') : undefined,
          isConfigured,
          action:
            isEditable && !isConfigured
              ? {
                  label: t('account_center.security.add'),
                  handler: () => {
                    navigateTo(authenticatorAppRoute);
                  },
                }
              : undefined,
        },
      ];
    };

    const buildBackupCodeRow = (): Row[] => {
      if (!enabledFactors.includes(MfaFactor.BackupCode)) {
        return [];
      }
      const isConfigured = Boolean(backupCodeVerification);
      const Icon = factorIcon[MfaFactor.BackupCode];
      return [
        {
          key: 'backup-code',
          icon: Icon,
          label: t('account_center.security.backup_codes'),
          value: isConfigured
            ? t('account_center.security.backup_codes_count', {
                count: backupCodeVerification?.remainCodes ?? 0,
              })
            : undefined,
          isConfigured,
          action: isEditable
            ? {
                label: isConfigured
                  ? t('account_center.security.manage')
                  : t('account_center.security.add'),
                handler: () => {
                  navigateTo(isConfigured ? backupCodesManageRoute : backupCodesGenerateRoute);
                },
              }
            : undefined,
        },
      ];
    };

    const buildEmailRow = (): Row[] => {
      if (!enabledFactors.includes(MfaFactor.EmailVerificationCode) || !userInfo?.primaryEmail) {
        return [];
      }
      const Icon = factorIcon[MfaFactor.EmailVerificationCode];
      return [
        {
          key: 'email',
          icon: Icon,
          label: t('account_center.security.email_verification_code'),
          value: userInfo.primaryEmail,
          isConfigured: true,
          action: isEditable
            ? {
                label: t('account_center.security.change'),
                handler: () => {
                  navigateTo(emailRoute);
                },
              }
            : undefined,
        },
      ];
    };

    const buildPhoneRow = (): Row[] => {
      if (!enabledFactors.includes(MfaFactor.PhoneVerificationCode) || !userInfo?.primaryPhone) {
        return [];
      }
      const Icon = factorIcon[MfaFactor.PhoneVerificationCode];
      return [
        {
          key: 'phone',
          icon: Icon,
          label: t('account_center.security.phone_verification_code'),
          value: formatToInternationalPhoneNumber(userInfo.primaryPhone),
          isConfigured: true,
          action: isEditable
            ? {
                label: t('account_center.security.change'),
                handler: () => {
                  navigateTo(phoneRoute);
                },
              }
            : undefined,
        },
      ];
    };

    return [
      ...buildWebAuthnRow(),
      ...buildTotpRow(),
      ...buildBackupCodeRow(),
      ...buildEmailRow(),
      ...buildPhoneRow(),
    ];
  }, [
    mfaControl,
    experienceSettings,
    enabledFactors,
    webAuthnVerifications,
    totpVerification,
    backupCodeVerification,
    userInfo,
    isEditable,
    t,
    navigateTo,
  ]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        {t('account_center.security.two_step_verification')}
      </div>
      <div className={styles.card}>
        {rows.map(({ key, icon: Icon, label, value, isConfigured, action }) => (
          <div key={key} className={styles.row}>
            <div className={styles.info}>
              <div className={styles.name}>
                <Icon className={styles.icon} />
                {label}
              </div>
              <div className={styles.value}>
                {isConfigured ? (
                  <span className={styles.statusTag}>
                    <span className={styles.statusDot} />
                    {value}
                  </span>
                ) : (
                  <span className={styles.notConfigured}>
                    {t('account_center.security.not_configured')}
                  </span>
                )}
              </div>
            </div>
            {action && (
              <div className={styles.actions}>
                <button type="button" className={styles.actionButton} onClick={action.handler}>
                  {action.label}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MfaSection;
