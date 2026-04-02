import {
  AccountCenterControlValue,
  MfaFactor,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { formatToInternationalPhoneNumber } from '@logto/shared/universal';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
import { hasVisibleMfaSection } from '@ac/utils/security-page';

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
  isPlainValue?: boolean;
  isConfigured: boolean;
  action?: { label: string; handler: () => void };
};

const useMfaRows = (
  mfaVerifications: UserMfaVerificationResponse | undefined,
  navigateTo: (route: string) => void
): Row[] => {
  const { t } = useTranslation();
  const { accountCenterSettings, experienceSettings, userInfo } = useContext(PageContext);

  const mfaControl = accountCenterSettings?.fields.mfa;
  const enabledFactors = useMemo(() => experienceSettings?.mfa.factors ?? [], [experienceSettings]);
  const isEditable = mfaControl === AccountCenterControlValue.Edit;

  return useMemo(() => {
    if (!hasVisibleMfaSection(mfaControl, experienceSettings)) {
      return [];
    }

    const webAuthnVerifications =
      mfaVerifications?.filter((verification) => verification.type === MfaFactor.WebAuthn) ?? [];
    const totpVerification = mfaVerifications?.find(
      (verification) => verification.type === MfaFactor.TOTP
    );
    const backupCodeVerification = mfaVerifications?.find(
      (verification) => verification.type === MfaFactor.BackupCode
    );

    const buildWebAuthnRow = (): Row[] => {
      if (!enabledFactors.includes(MfaFactor.WebAuthn)) {
        return [];
      }
      const isConfigured = webAuthnVerifications.length > 0;
      return [
        {
          key: 'webauthn',
          icon: factorIcon[MfaFactor.WebAuthn],
          label: t('account_center.security.passkeys'),
          value: isConfigured
            ? t('account_center.security.passkeys_count', { count: webAuthnVerifications.length })
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
      return [
        {
          key: 'totp',
          icon: factorIcon[MfaFactor.TOTP],
          label: t('account_center.security.authenticator_app'),
          value: totpVerification ? t('account_center.security.configured') : undefined,
          isConfigured: Boolean(totpVerification),
          action:
            isEditable && !totpVerification
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
      return [
        {
          key: 'backup-code',
          icon: factorIcon[MfaFactor.BackupCode],
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
      return [
        {
          key: 'email',
          icon: factorIcon[MfaFactor.EmailVerificationCode],
          label: t('account_center.security.email_verification_code'),
          value: userInfo.primaryEmail,
          isPlainValue: true,
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
      return [
        {
          key: 'phone',
          icon: factorIcon[MfaFactor.PhoneVerificationCode],
          label: t('account_center.security.phone_verification_code'),
          value: formatToInternationalPhoneNumber(userInfo.primaryPhone),
          isPlainValue: true,
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
    mfaVerifications,
    enabledFactors,
    userInfo,
    isEditable,
    t,
    navigateTo,
  ]);
};

export default useMfaRows;
