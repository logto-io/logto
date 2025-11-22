import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';
import VerificationCodeInput, {
  defaultLength,
} from '@experience/shared/components/VerificationCode';
import { useLogto } from '@logto/react';
import { SignInIdentifier } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const resendCooldownSeconds = 60;

export type TranslationKeys = {
  readonly title: TFuncKey;
  readonly description: TFuncKey;
  readonly prepareDescription: TFuncKey;
};

const isCodeReady = (code: string[]) => {
  return code.length === defaultLength && code.every(Boolean);
};

type Props = {
  readonly identifier?: string;
  readonly codeInputName: string;
  readonly translationKeys: TranslationKeys;
  readonly identifierLabelKey:
    | 'account_center.email_verification.email_label'
    | 'account_center.phone_verification.phone_label';
  readonly descriptionPropsBuilder?: (identifier: string) => Record<string, string>;
  readonly onBack?: () => void;
  readonly sendCode: (
    accessToken: string,
    identifier: string
  ) => Promise<{ verificationRecordId: string; expiresAt: string }>;
  readonly verifyCode: (
    accessToken: string,
    payload: { verificationRecordId: string; code: string; identifier: string }
  ) => Promise<unknown>;
};

const CodeVerification = ({
  identifier,
  codeInputName,
  translationKeys,
  identifierLabelKey,
  descriptionPropsBuilder,
  onBack,
  sendCode,
  verifyCode,
}: Props) => {
  const { t } = useTranslation();
  const { getAccessToken } = useLogto();
  const { setToast, setVerificationId } = useContext(PageContext);
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
    if (!identifier || isSending) {
      return;
    }

    const accessToken = await getAccessToken();

    if (!accessToken) {
      return;
    }

    setIsSending(true);

    try {
      const result = await sendCode(accessToken, identifier);

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
  }, [getAccessToken, identifier, isSending, sendCode, setToast, startCountdown, t]);

  const handleVerify = useCallback(
    async (code: string[]) => {
      if (
        !identifier ||
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
        await verifyCode(accessToken, {
          verificationRecordId: recordId,
          code: code.join(''),
          identifier,
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
    [
      getAccessToken,
      identifier,
      isVerifying,
      pendingVerificationRecord,
      setVerificationId,
      t,
      verifyCode,
    ]
  );

  useEffect(() => {
    if (!isCodeReady(codeInput)) {
      return;
    }

    void handleVerify(codeInput);
  }, [codeInput, handleVerify]);

  const descriptionKey = hasSentCode
    ? translationKeys.description
    : translationKeys.prepareDescription;

  const descriptionProps =
    hasSentCode && identifier && descriptionPropsBuilder
      ? descriptionPropsBuilder(identifier)
      : undefined;
  const identifierType =
    identifierLabelKey === 'account_center.phone_verification.phone_label'
      ? SignInIdentifier.Phone
      : SignInIdentifier.Email;

  return (
    <SecondaryPageLayout
      title={translationKeys.title}
      description={descriptionKey}
      descriptionProps={descriptionProps}
      onBack={onBack}
    >
      {hasSentCode ? (
        <div className={styles.container}>
          <VerificationCodeInput
            name={codeInputName}
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
              <DynamicT
                forKey="account_center.email_verification.resend_countdown"
                interpolation={{ seconds: countdown }}
              />
            ) : (
              <button
                className={styles.resendButton}
                type="button"
                disabled={isSending}
                onClick={() => {
                  void handleSendCode();
                }}
              >
                <DynamicT forKey="account_center.email_verification.resend" />
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
          <SmartInputField
            readOnly
            className={styles.identifierInput}
            name="identifier"
            label={t(identifierLabelKey)}
            defaultValue={identifier ?? ''}
            enabledTypes={[identifierType]}
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

export default CodeVerification;
