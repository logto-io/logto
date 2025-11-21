import Button from '@experience/shared/components/Button';
import InputField from '@experience/shared/components/InputFields/InputField';
import VerificationCodeInput, {
  defaultLength,
} from '@experience/shared/components/VerificationCode';
import { useLogto } from '@logto/react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { sendEmailVerificationCode, verifyEmailVerificationCode } from '@ac/apis/verification';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

type Props = {
  readonly onBack?: () => void;
};

const resendCooldownSeconds = 60;

const isCodeReady = (code: string[]) => {
  return code.length === defaultLength && code.every(Boolean);
};

const EmailVerification = ({ onBack }: Props) => {
  const { t } = useTranslation();
  const { getAccessToken } = useLogto();
  const { userInfo, setToast, setVerificationId } = useContext(PageContext);
  const email = userInfo?.primaryEmail;
  const [codeInput, setCodeInput] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pendingVerificationRecord, setPendingVerificationRecord] = useState<{
    recordId: string;
    expiresAt: string;
  }>();
  const [hasSentCode, setHasSentCode] = useState(false);

  const startCountdown = useCallback(() => {
    setCountdown(resendCooldownSeconds);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    if (!email || isSending) {
      return;
    }

    const accessToken = await getAccessToken();

    if (!accessToken) {
      return;
    }

    setIsSending(true);

    try {
      const result = await sendEmailVerificationCode(accessToken, email);

      setPendingVerificationRecord({
        recordId: result.verificationRecordId,
        expiresAt: result.expiresAt,
      });
      setCodeInput([]);
      setErrorMessage(undefined);
      setHasSentCode(true);
      startCountdown();
    } catch {
      setToast(t('account_center.email_verification.error_send_failed'));
    } finally {
      setIsSending(false);
    }
  }, [email, getAccessToken, isSending, setToast, startCountdown, t]);

  const handleVerify = useCallback(
    async (code: string[]) => {
      if (
        !email ||
        !pendingVerificationRecord?.recordId ||
        !pendingVerificationRecord.expiresAt ||
        isVerifying ||
        !isCodeReady(code)
      ) {
        return;
      }

      const { recordId, expiresAt } = pendingVerificationRecord;

      const accessToken = await getAccessToken();

      if (!accessToken) {
        return;
      }

      setIsVerifying(true);

      try {
        await verifyEmailVerificationCode(accessToken, {
          verificationRecordId: recordId,
          code: code.join(''),
          email,
        });

        setVerificationId(recordId, expiresAt);
        setPendingVerificationRecord(undefined);
      } catch {
        setCodeInput([]);
        setErrorMessage(t('account_center.email_verification.error_verify_failed'));
      } finally {
        setIsVerifying(false);
      }
    },
    [email, getAccessToken, isVerifying, pendingVerificationRecord, setVerificationId, t]
  );

  useEffect(() => {
    if (!isCodeReady(codeInput)) {
      return;
    }

    void handleVerify(codeInput);
  }, [codeInput, handleVerify]);

  const descriptionKey = hasSentCode
    ? 'account_center.email_verification.description'
    : 'account_center.email_verification.prepare_description';

  const descriptionProps = hasSentCode ? { email } : undefined;

  return (
    <SecondaryPageLayout
      title="account_center.email_verification.title"
      description={descriptionKey}
      descriptionProps={descriptionProps}
      onBack={onBack}
    >
      {hasSentCode ? (
        <div className={styles.container}>
          <VerificationCodeInput
            name="emailCode"
            className={styles.codeInput}
            value={codeInput}
            error={errorMessage}
            onChange={(code) => {
              setCodeInput(code);
              setErrorMessage(undefined);
            }}
          />
          <div className={styles.message}>
            {countdown > 0 ? (
              t('account_center.email_verification.resend_countdown', { seconds: countdown })
            ) : (
              <button
                className={styles.resendButton}
                type="button"
                disabled={isSending}
                onClick={() => {
                  void handleSendCode();
                }}
              >
                {t('account_center.email_verification.resend')}
              </button>
            )}
          </div>
          <Button
            title="action.confirm"
            type="primary"
            className={styles.submit}
            isLoading={isVerifying}
            onClick={() => {
              if (!isCodeReady(codeInput)) {
                setErrorMessage(t('error.invalid_passcode'));
                return;
              }

              void handleVerify(codeInput);
            }}
          />
        </div>
      ) : (
        <div className={styles.prepare}>
          <InputField
            readOnly
            className={styles.emailInput}
            name="email"
            label={t('account_center.email_verification.email_label')}
            value={email ?? ''}
          />
          <Button
            title="account_center.email_verification.send"
            type="primary"
            className={styles.prepareAction}
            isLoading={isSending}
            onClick={() => {
              void handleSendCode();
            }}
          />
        </div>
      )}
    </SecondaryPageLayout>
  );
};

export default EmailVerification;
