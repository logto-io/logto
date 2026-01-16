import {
  MfaFactor,
  type SignInExperience,
  type UserMfaVerificationResponse,
  type UserProfileResponse,
} from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import FactorBackupCode from '@/assets/icons/factor-backup-code.svg?react';
import FactorEmail from '@/assets/icons/factor-email.svg?react';
import FactorPhone from '@/assets/icons/factor-phone.svg?react';
import FactorTotp from '@/assets/icons/factor-totp.svg?react';
import FactorWebAuthn from '@/assets/icons/factor-webauthn.svg?react';
import FormCard from '@/components/FormCard';
import { adminTenantEndpoint } from '@/consts';
import Tag from '@/ds-components/Tag';
import useAccountApi from '@/hooks/use-account-api';

import CardContent, { type Row } from '../CardContent';

import styles from './index.module.scss';

const factorIcon: Record<MfaFactor, SvgComponent> = {
  [MfaFactor.TOTP]: FactorTotp,
  [MfaFactor.WebAuthn]: FactorWebAuthn,
  [MfaFactor.BackupCode]: FactorBackupCode,
  [MfaFactor.EmailVerificationCode]: FactorEmail,
  [MfaFactor.PhoneVerificationCode]: FactorPhone,
};

type Props = {
  readonly user: UserProfileResponse;
  readonly signInExperience?: SignInExperience;
};

function MfaSection({ user, signInExperience }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const accountApi = useAccountApi();

  const fetcher = useCallback(
    async () => accountApi.get('mfa-verifications').json<UserMfaVerificationResponse>(),
    [accountApi]
  );

  const { data: mfaVerifications } = useSWR('account-mfa-verifications', fetcher);

  const navigateToAccountPage = useCallback((path: string) => {
    const currentProfileUrl = `${window.location.origin}${window.location.pathname}`;
    const accountUrl = new URL(path, adminTenantEndpoint);
    accountUrl.searchParams.set('redirect', currentProfileUrl);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.location.href = accountUrl.toString();
  }, []);

  const rows = useMemo<Array<Row<string | boolean | undefined>>>(() => {
    if (!signInExperience?.mfa.factors.length) {
      return [];
    }

    const enabledFactors = signInExperience.mfa.factors;

    // Group verifications by type
    const webAuthnVerifications =
      mfaVerifications?.filter((verification) => verification.type === MfaFactor.WebAuthn) ?? [];
    const totpVerification = mfaVerifications?.find(
      (verification) => verification.type === MfaFactor.TOTP
    );
    const backupCodeVerification = mfaVerifications?.find(
      (verification) => verification.type === MfaFactor.BackupCode
    );

    // Build rows using spread operator instead of push
    const webAuthnRow = (): Array<Row<string | boolean | undefined>> => {
      if (!enabledFactors.includes(MfaFactor.WebAuthn)) {
        return [];
      }
      const hasPasskeys = webAuthnVerifications.length > 0;
      const Icon = factorIcon[MfaFactor.WebAuthn];
      return [
        {
          key: 'webauthn',
          icon: <Icon />,
          label: 'mfa.webauthn',
          value: hasPasskeys ? 'configured' : undefined,
          renderer: () =>
            hasPasskeys ? (
              <Tag type="state" status="success" variant="outlined">
                {t('profile.mfa.passkeys_count', { count: webAuthnVerifications.length })}
              </Tag>
            ) : (
              <span>{t('profile.mfa.not_configured')}</span>
            ),
          action: hasPasskeys
            ? {
                name: 'profile.mfa.view',
                handler: () => {
                  navigateToAccountPage('/account/passkey/manage');
                },
              }
            : {
                name: 'profile.mfa.add',
                handler: () => {
                  navigateToAccountPage('/account/passkey/add');
                },
              },
        },
      ];
    };

    const totpRow = (): Array<Row<string | boolean | undefined>> => {
      if (!enabledFactors.includes(MfaFactor.TOTP)) {
        return [];
      }
      const hasTotp = Boolean(totpVerification);
      const Icon = factorIcon[MfaFactor.TOTP];
      return [
        {
          key: 'totp',
          icon: <Icon />,
          label: 'mfa.totp',
          value: hasTotp ? 'configured' : undefined,
          renderer: () =>
            hasTotp ? (
              <Tag type="state" status="success" variant="outlined">
                {t('profile.mfa.configured')}
              </Tag>
            ) : (
              <span>{t('profile.mfa.not_configured')}</span>
            ),
          action: hasTotp
            ? undefined
            : {
                name: 'profile.mfa.add',
                handler: () => {
                  navigateToAccountPage('/account/authenticator-app');
                },
              },
        },
      ];
    };

    const emailRow = (): Array<Row<string | boolean | undefined>> => {
      if (!enabledFactors.includes(MfaFactor.EmailVerificationCode) || !user.primaryEmail) {
        return [];
      }
      const Icon = factorIcon[MfaFactor.EmailVerificationCode];
      return [
        {
          key: 'email',
          icon: <Icon />,
          label: 'mfa.email_verification_code',
          value: user.primaryEmail,
          renderer: (value) => (
            <span className={styles.status}>
              <Icon className={styles.valueIcon} />
              <span className={styles.dot} />
              {value}
            </span>
          ),
          action: {
            name: 'profile.change',
            handler: () => {
              navigateToAccountPage('/account/email');
            },
          },
        },
      ];
    };

    const phoneRow = (): Array<Row<string | boolean | undefined>> => {
      if (!enabledFactors.includes(MfaFactor.PhoneVerificationCode) || !user.primaryPhone) {
        return [];
      }
      const Icon = factorIcon[MfaFactor.PhoneVerificationCode];
      return [
        {
          key: 'phone',
          icon: <Icon />,
          label: 'mfa.phone_verification_code',
          value: user.primaryPhone,
          renderer: (value) => (
            <span className={styles.status}>
              <Icon className={styles.valueIcon} />
              <span className={styles.dot} />
              {value}
            </span>
          ),
          action: {
            name: 'profile.change',
            handler: () => {
              navigateToAccountPage('/account/phone');
            },
          },
        },
      ];
    };

    const backupCodeRow = (): Array<Row<string | boolean | undefined>> => {
      if (!enabledFactors.includes(MfaFactor.BackupCode)) {
        return [];
      }
      const hasBackupCodes = Boolean(backupCodeVerification);
      const remainCodes = backupCodeVerification?.remainCodes ?? 0;
      const Icon = factorIcon[MfaFactor.BackupCode];
      return [
        {
          key: 'backup-code',
          icon: <Icon />,
          label: 'mfa.backup_code',
          value: hasBackupCodes ? 'configured' : undefined,
          renderer: () =>
            hasBackupCodes ? (
              <Tag type="state" status="success" variant="outlined">
                {t('profile.mfa.backup_codes_count', { count: remainCodes })}
              </Tag>
            ) : (
              <span>{t('profile.mfa.not_configured')}</span>
            ),
          action: hasBackupCodes
            ? {
                name: 'profile.mfa.view',
                handler: () => {
                  navigateToAccountPage('/account/backup-codes/manage');
                },
              }
            : {
                name: 'profile.mfa.add',
                handler: () => {
                  navigateToAccountPage('/account/backup-codes/generate');
                },
              },
        },
      ];
    };

    return [...webAuthnRow(), ...totpRow(), ...emailRow(), ...phoneRow(), ...backupCodeRow()];
  }, [mfaVerifications, navigateToAccountPage, signInExperience?.mfa.factors, t, user]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <FormCard title="profile.mfa.title">
      <CardContent
        title="profile.mfa.two_step_verification"
        description="profile.mfa.section_description"
        data={rows}
      />
    </FormCard>
  );
}

export default MfaSection;
