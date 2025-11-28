import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import VerificationCodeInput, {
  defaultLength,
} from '@experience/shared/components/VerificationCode';
import { useLogto } from '@logto/react';
import { type TFuncKey } from 'i18next';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
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
    resendKey: TFuncKey;
    resendCountdownKey: TFuncKey;
  };
  readonly onResent: (verificationRecordId: string) => void;
  readonly resetSignal: number;
  readonly onSubmit: (code: string) => void;
  readonly onBack: () => void;
  readonly onInvalidCode: () => void;
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
  onResent,
  resetSignal,
  onSubmit,
  onBack,
  onInvalidCode,
  sendCode,
}: Props) => {
  const { t } = useTranslation();
  const { getAccessToken } = useLogto();
  const { loading } = useContext(LoadingContext);
  const { setToast } = useContext(PageContext);
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

  const handleResend = async () => {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      setToast(t('account_center.verification.error_send_failed'));
      return;
    }

    const [error, result] = await sendCodeRequest(accessToken, identifier);

    if (error) {
      await handleError(error);
      return;
    }

    if (!result) {
      setToast(t('account_center.verification.error_send_failed'));
      return;
    }

    onResent(result.verificationRecordId);
  };

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
          onChange={(code) => {
            setCodeInput(code);
          }}
        />
        <div className={styles.message}>
          {countdown > 0 ? (
            <DynamicT
              forKey={translation.resendCountdownKey}
              interpolation={{ seconds: countdown }}
            />
          ) : (
            <button
              className={styles.resendButton}
              type="button"
              disabled={loading}
              onClick={() => {
                void handleResend();
              }}
            >
              <DynamicT forKey={translation.resendKey} />
            </button>
          )}
        </div>
        <Button
          title="action.confirm"
          type="primary"
          className={styles.submit}
          isLoading={loading}
          onClick={() => {
            if (!isCodeReady) {
              onInvalidCode();
              return;
            }

            onSubmit(codeInput.join(''));
          }}
        />
      </div>
    </SecondaryPageLayout>
  );
};

export default IdentifierVerifyStep;
