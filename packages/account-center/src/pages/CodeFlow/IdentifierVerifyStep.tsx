import Button from '@experience/shared/components/Button';
import VerificationCodeInput, {
  defaultLength,
} from '@experience/shared/components/VerificationCode';
import { type TFuncKey } from 'i18next';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import SwitchVerificationMethodLink from '@ac/components/SwitchVerificationMethodLink';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const resendCooldownSeconds = 60;

type Props = {
  readonly identifier: string;
  readonly verificationRecordId: string;
  readonly codeInputName: string;
  readonly translation: {
    titleKey: TFuncKey;
    descriptionKey: TFuncKey;
    descriptionProps: Record<string, string>;
  };
  readonly errorMessage?: string;
  readonly clearErrorMessage?: () => void;
  readonly onResent: (verificationRecordId: string) => void;
  readonly onResendFailed: (errorMessage: string) => void;
  readonly resetSignal: number;
  readonly onSubmit: (code: string) => void;
  readonly onBack: () => void;
  readonly onInvalidCode: (errorMessage: string) => void;
  readonly onSwitchMethod?: () => void;
  readonly sendCode: (
    accessToken: string,
    identifier: string
  ) => Promise<{
    verificationRecordId: string;
    expiresAt: string;
  }>;
};

const IdentifierVerifyStep = ({
  identifier,
  verificationRecordId,
  codeInputName,
  translation,
  errorMessage,
  clearErrorMessage,
  onResent,
  onResendFailed,
  resetSignal,
  onSubmit,
  onBack,
  onInvalidCode,
  onSwitchMethod,
  sendCode,
}: Props) => {
  const { t } = useTranslation();
  const { loading } = useContext(LoadingContext);
  const [codeInput, setCodeInput] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(resendCooldownSeconds);
  const sendCodeRequest = useApi(sendCode);
  const handleError = useErrorHandler();

  const isCodeReady = useMemo(
    () => codeInput.length === defaultLength && codeInput.every(Boolean),
    [codeInput]
  );

  useEffect(() => {
    setCodeInput([]);
    setCountdown(resendCooldownSeconds);
  }, [verificationRecordId, resetSignal]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (!isCodeReady) {
      return;
    }
    onSubmit(codeInput.join(''));
  }, [codeInput, isCodeReady, onSubmit]);

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

  const handleResend = useCallback(async () => {
    clearErrorMessage?.();

    const [error, result] = await sendCodeRequest(identifier);

    if (error) {
      await handleError(error);
      return;
    }

    if (!result) {
      onResendFailed(t('account_center.verification.error_send_failed'));
      return;
    }

    onResent(result.verificationRecordId);
  }, [clearErrorMessage, handleError, identifier, onResendFailed, onResent, sendCodeRequest, t]);

  return (
    <SecondaryPageLayout
      title={translation.titleKey}
      description={translation.descriptionKey}
      descriptionProps={translation.descriptionProps}
      onBack={onBack}
    >
      <div className={styles.container}>
        <VerificationCodeInput
          name={codeInputName}
          className={styles.codeInput}
          value={codeInput}
          error={errorMessage}
          onChange={(code) => {
            setCodeInput(code);
          }}
        />
        <div className={styles.message}>
          {countdown > 0 ? (
            <Trans components={{ span: <span className={styles.highlight} /> }}>
              {t('account_center.code_verification.resend_countdown', { seconds: countdown })}
            </Trans>
          ) : (
            <Trans
              components={{
                a: (
                  <button
                    className={styles.resendButton}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      void handleResend();
                    }}
                  />
                ),
              }}
            >
              {t('account_center.code_verification.resend')}
            </Trans>
          )}
        </div>
        <Button
          title="action.continue"
          type="primary"
          className={styles.submit}
          isLoading={loading}
          onClick={() => {
            clearErrorMessage?.();

            if (!isCodeReady) {
              onInvalidCode(t('account_center.verification.error_invalid_code'));
              return;
            }

            onSubmit(codeInput.join(''));
          }}
        />
        {onSwitchMethod && (
          <SwitchVerificationMethodLink className={styles.switchMethod} onClick={onSwitchMethod} />
        )}
      </div>
    </SecondaryPageLayout>
  );
};

export default IdentifierVerifyStep;
