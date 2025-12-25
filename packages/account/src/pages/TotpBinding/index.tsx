import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import VerificationCodeInput, {
  defaultLength,
} from '@experience/shared/components/VerificationCode';
import { AccountCenterControlValue, MfaFactor, type Mfa } from '@logto/schemas';
import qrcode from 'qrcode';
import { useCallback, useContext, useEffect, useState, type FormEvent } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { getMfaVerifications, generateTotpSecret, addTotpMfa } from '@ac/apis/mfa';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { authenticatorAppSuccessRoute, backupCodesGenerateRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const isCodeReady = (code: string[]) => {
  return code.length === defaultLength && code.every(Boolean);
};

const isTotpEnabled = (mfa?: Mfa) => mfa?.factors.includes(MfaFactor.TOTP) ?? false;
const isBackupCodeEnabled = (mfa?: Mfa) => mfa?.factors.includes(MfaFactor.BackupCode) ?? false;

const TotpBinding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const {
    accountCenterSettings,
    experienceSettings,
    verificationId,
    setVerificationId,
    setToast,
    userInfo,
  } = useContext(PageContext);
  const getMfaRequest = useApi(getMfaVerifications);
  const generateSecretRequest = useApi(generateTotpSecret);
  const addTotpRequest = useApi(addTotpMfa);
  const handleError = useErrorHandler();

  const [secret, setSecret] = useState<string>();
  const [secretQrCode, setSecretQrCode] = useState<string>();
  const [isQrCodeFormat, setIsQrCodeFormat] = useState(!isMobile);
  const [codeInput, setCodeInput] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [hasTotpAlready, setHasTotpAlready] = useState<boolean>();
  const [hasBackupCodes, setHasBackupCodes] = useState<boolean>();

  // Check if TOTP already exists on mount
  useEffect(() => {
    const checkExistingMfa = async () => {
      const [error, result] = await getMfaRequest();

      if (error) {
        // If there's an error, we'll let the user continue and the backend will validate
        setHasTotpAlready(false);
        setHasBackupCodes(false);
        return;
      }

      const hasTotp = result?.some((mfa) => mfa.type === MfaFactor.TOTP) ?? false;
      const hasBackup = result?.some((mfa) => mfa.type === MfaFactor.BackupCode) ?? false;
      setHasTotpAlready(hasTotp);
      setHasBackupCodes(hasBackup);
    };

    void checkExistingMfa();
  }, [getMfaRequest]);

  // Generate TOTP secret on mount
  useEffect(() => {
    if (!verificationId || Boolean(secret) || hasTotpAlready !== false) {
      return;
    }

    const generateSecret = async () => {
      const [error, result] = await generateSecretRequest();

      if (error) {
        await handleError(error);
        return;
      }

      if (result) {
        setSecret(result.secret);

        // Generate QR code locally
        const displayName =
          userInfo?.username ?? userInfo?.primaryEmail ?? userInfo?.primaryPhone ?? 'User';
        const service = window.location.hostname;
        // Build the otpauth URI manually for QR code
        const keyUri = `otpauth://totp/${encodeURIComponent(service)}:${encodeURIComponent(displayName)}?secret=${result.secret}&issuer=${encodeURIComponent(service)}`;
        const qrCodeDataUrl = await qrcode.toDataURL(keyUri);
        setSecretQrCode(qrCodeDataUrl);
      }
    };

    void generateSecret();
  }, [generateSecretRequest, handleError, hasTotpAlready, secret, userInfo, verificationId]);

  const copySecret = useCallback(async () => {
    if (!secret) {
      return;
    }

    await navigator.clipboard.writeText(secret);
    setToast(t('mfa.secret_key_copied'));
  }, [secret, setToast, t]);

  const handleSubmit = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!verificationId || !secret || loading || !isCodeReady(codeInput)) {
        return;
      }

      setErrorMessage(undefined);

      const codeString = codeInput.join('');
      const [error] = await addTotpRequest(verificationId, { secret, code: codeString });

      if (error) {
        await handleError(error, {
          'verification_record.permission_denied': async () => {
            setVerificationId(undefined);
            setToast(t('account_center.verification.verification_required'));
          },
          'user.totp_already_in_use': async (requestError) => {
            setToast(requestError.message);
          },
          'session.mfa.invalid_totp_code': async () => {
            setErrorMessage(t('error.invalid_passcode'));
            setCodeInput([]);
          },
        });
        return;
      }

      if (isBackupCodeEnabled(experienceSettings?.mfa) && !hasBackupCodes) {
        void navigate(backupCodesGenerateRoute, { replace: true });
        return;
      }

      void navigate(authenticatorAppSuccessRoute, { replace: true });
    },
    [
      addTotpRequest,
      codeInput,
      experienceSettings?.mfa,
      handleError,
      hasBackupCodes,
      loading,
      navigate,
      secret,
      setToast,
      setVerificationId,
      t,
      verificationId,
    ]
  );

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (!isCodeReady(codeInput)) {
      return;
    }
    void handleSubmit();
  }, [codeInput, handleSubmit]);

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.mfa !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!isTotpEnabled(experienceSettings?.mfa)) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.mfa.totp_not_enabled"
      />
    );
  }

  if (hasTotpAlready) {
    return (
      <ErrorPage
        titleKey="error.something_went_wrong"
        messageKey="account_center.mfa.totp_already_added"
      />
    );
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  return (
    <SecondaryPageLayout title="mfa.add_authenticator_app" description="">
      <div className={styles.container}>
        {/* Step 1: QR Code or Secret Key */}
        <div className={styles.step}>
          <div className={styles.stepTitle}>
            <DynamicT
              forKey="mfa.step"
              interpolation={{
                step: 1,
                content: isQrCodeFormat ? t('mfa.scan_qr_code') : t('mfa.copy_and_paste_key'),
              }}
            />
          </div>
          <div className={styles.stepDescription}>
            <DynamicT
              forKey={
                isQrCodeFormat
                  ? 'mfa.scan_qr_code_description'
                  : 'mfa.copy_and_paste_key_description'
              }
            />
          </div>
          <div className={styles.secretContent}>
            {isQrCodeFormat && secretQrCode && (
              <div className={styles.qrCode}>
                <img src={secretQrCode} alt="QR code" />
              </div>
            )}
            {!isQrCodeFormat && secret && (
              <div className={styles.copySecret}>
                <div className={styles.rawSecret}>{secret}</div>
                <Button
                  title="action.copy"
                  type="secondary"
                  onClick={() => {
                    void copySecret();
                  }}
                />
              </div>
            )}
            <button
              type="button"
              className={styles.switchLink}
              onClick={() => {
                setIsQrCodeFormat(!isQrCodeFormat);
              }}
            >
              <DynamicT
                forKey={isQrCodeFormat ? 'mfa.qr_code_not_available' : 'mfa.want_to_scan_qr_code'}
              />
            </button>
          </div>
        </div>

        {/* Step 2: Verification Code */}
        <div className={styles.divider} />
        <form className={styles.step} onSubmit={handleSubmit}>
          <div className={styles.stepTitle}>
            <DynamicT
              forKey="mfa.step"
              interpolation={{
                step: 2,
                content: t('mfa.enter_one_time_code'),
              }}
            />
          </div>
          <div className={styles.stepDescription}>
            <DynamicT forKey="mfa.enter_one_time_code_link_description" />
          </div>
          <VerificationCodeInput
            name="totpCode"
            className={styles.codeInput}
            value={codeInput}
            error={errorMessage}
            onChange={(code) => {
              setCodeInput(code);
            }}
          />
          <Button
            title="action.continue"
            type="primary"
            htmlType="submit"
            className={styles.submitButton}
            isLoading={loading}
          />
        </form>
      </div>
    </SecondaryPageLayout>
  );
};

export default TotpBinding;
