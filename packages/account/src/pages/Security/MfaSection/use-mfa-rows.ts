import {
  AccountCenterControlValue,
  MfaFactor,
  MfaVerificationCodeEnrollment,
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
  authenticatorAppReplaceRoute,
  authenticatorAppRoute,
  backupCodesGenerateRoute,
  backupCodesManageRoute,
  emailRoute,
  passkeyAddRoute,
  passkeyManageRoute,
  phoneRoute,
} from '@ac/constants/routes';
import { type VerificationCodeMfaFactor } from '@ac/utils/pending-step-up';
import {
  hasVisibleMfaSection,
  isEditableField,
  isPasskeySignInEnabled,
} from '@ac/utils/security-page';

import { type SecurityRowData } from '../components/SecurityRow';

const factorIcon = {
  [MfaFactor.TOTP]: TotpIcon,
  [MfaFactor.WebAuthn]: WebAuthnIcon,
  [MfaFactor.BackupCode]: BackupCodeIcon,
  [MfaFactor.EmailVerificationCode]: EmailIcon,
  [MfaFactor.PhoneVerificationCode]: PhoneIcon,
};

type VerificationCodeHandlers = {
  onAddVerificationCode: (factor: VerificationCodeMfaFactor) => Promise<void>;
  onRemoveVerificationCode: (verification: UserMfaVerificationResponse[number]) => void;
};

const useMfaRows = (
  mfaVerifications: UserMfaVerificationResponse | undefined,
  navigateTo: (route: string) => void,
  { onAddVerificationCode, onRemoveVerificationCode }: VerificationCodeHandlers
): SecurityRowData[] => {
  const { t } = useTranslation();
  const { accountCenterSettings, experienceSettings, userInfo } = useContext(PageContext);

  const mfaControl = accountCenterSettings?.fields.mfa;
  const emailControl = accountCenterSettings?.fields.email;
  const phoneControl = accountCenterSettings?.fields.phone;
  const enabledFactors = useMemo(() => experienceSettings?.mfa.factors ?? [], [experienceSettings]);
  const isEditable = mfaControl === AccountCenterControlValue.Edit;
  const isExplicitEnrollment =
    experienceSettings?.mfa.verificationCodeEnrollment === MfaVerificationCodeEnrollment.Explicit;

  return useMemo(() => {
    if (!hasVisibleMfaSection(mfaControl, experienceSettings)) {
      return [];
    }

    const webAuthnVerifications =
      mfaVerifications?.filter((verification) => verification.type === MfaFactor.WebAuthn) ?? [];
    const totpVerification = mfaVerifications?.find(
      (verification) => verification.type === MfaFactor.TOTP
    );
    // Legacy data can contain both an exhausted and a usable backup-code record. Pick the usable
    // one so the row reflects the codes that can actually be used.
    const backupCodeVerification = mfaVerifications?.find(
      (verification) =>
        verification.type === MfaFactor.BackupCode && (verification.remainCodes ?? 0) > 0
    );

    const buildWebAuthnRow = (): SecurityRowData[] => {
      // When passkey sign-in is enabled, WebAuthn is surfaced in its own passkey section, so it
      // is excluded here to avoid showing it twice.
      if (
        !enabledFactors.includes(MfaFactor.WebAuthn) ||
        isPasskeySignInEnabled(experienceSettings)
      ) {
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

    const buildTotpRow = (): SecurityRowData[] => {
      if (!enabledFactors.includes(MfaFactor.TOTP)) {
        return [];
      }
      const isConfigured = Boolean(totpVerification);
      return [
        {
          key: 'totp',
          icon: factorIcon[MfaFactor.TOTP],
          label: t('account_center.security.authenticator_app'),
          value: totpVerification ? t('account_center.security.configured') : undefined,
          isConfigured,
          action: isEditable
            ? {
                label: isConfigured
                  ? t('account_center.security.change')
                  : t('account_center.security.add'),
                handler: () => {
                  navigateTo(isConfigured ? authenticatorAppReplaceRoute : authenticatorAppRoute);
                },
              }
            : undefined,
        },
      ];
    };

    const buildBackupCodeRow = (): SecurityRowData[] => {
      if (!enabledFactors.includes(MfaFactor.BackupCode)) {
        return [];
      }
      const isConfigured = (backupCodeVerification?.remainCodes ?? 0) > 0;
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

    const buildVerificationCodeRow = (
      factor: VerificationCodeMfaFactor,
      identifier: string | undefined,
      identifierRoute: string,
      identifierControl: AccountCenterControlValue | undefined
    ): SecurityRowData[] => {
      if (!enabledFactors.includes(factor) || !identifier) {
        return [];
      }

      const isEmail = factor === MfaFactor.EmailVerificationCode;
      const row = {
        key: isEmail ? 'email' : 'phone',
        icon: factorIcon[factor],
        label: t(
          isEmail
            ? 'account_center.security.email_verification_code'
            : 'account_center.security.phone_verification_code'
        ),
        value: isEmail ? identifier : formatToInternationalPhoneNumber(identifier),
        isPlainValue: true,
      };

      // In explicit enrollment, the factor counts only once the user enrolls it, so the row
      // manages the enrollment instead of the address.
      if (isExplicitEnrollment) {
        const verification = mfaVerifications?.find(({ type }) => type === factor);

        return [
          {
            ...row,
            isConfigured: Boolean(verification),
            action: isEditable
              ? verification
                ? {
                    label: t('account_center.security.remove'),
                    handler: () => {
                      onRemoveVerificationCode(verification);
                    },
                  }
                : {
                    label: t('account_center.security.add'),
                    handler: () => {
                      void onAddVerificationCode(factor);
                    },
                  }
              : undefined,
          },
        ];
      }

      return [
        {
          ...row,
          isConfigured: true,
          action:
            isEditable && isEditableField(identifierControl)
              ? {
                  label: t('account_center.security.change'),
                  handler: () => {
                    navigateTo(identifierRoute);
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
      ...buildVerificationCodeRow(
        MfaFactor.EmailVerificationCode,
        userInfo?.primaryEmail ?? undefined,
        emailRoute,
        emailControl
      ),
      ...buildVerificationCodeRow(
        MfaFactor.PhoneVerificationCode,
        userInfo?.primaryPhone ?? undefined,
        phoneRoute,
        phoneControl
      ),
    ];
  }, [
    mfaControl,
    emailControl,
    phoneControl,
    experienceSettings,
    mfaVerifications,
    enabledFactors,
    userInfo,
    isEditable,
    isExplicitEnrollment,
    t,
    navigateTo,
    onAddVerificationCode,
    onRemoveVerificationCode,
  ]);
};

export default useMfaRows;
