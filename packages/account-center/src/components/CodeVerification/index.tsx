import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';
import VerificationCodeInput, {
  defaultLength,
} from '@experience/shared/components/VerificationCode';
import { SignInIdentifier } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useCallback, useContext, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import SwitchVerificationMethodLink from '../SwitchVerificationMethodLink';

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
  readonly onSwitchMethod?: () => void;
  readonly hasAlternativeMethod?: boolean;
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
  onSwitchMethod,
  hasAlternativeMethod,
  sendCode,
  verifyCode,
}: Props) => {
  const { t } = useTranslation();
  const { setToast, setVerificationId } = useContext(PageContext);
  const { loading } = useContext(LoadingContext);
  const sendCodeRequest = useApi(sendCode);
  const verifyCodeRequest = useApi(verifyCode);
  const handleError = useErrorHandler();
  const [codeInput, setCodeInput] = useState<string[]>([]);
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

  const handleSendCode = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!identifier || loading) {
        return;
      }

      const [error, result] = await sendCodeRequest(identifier);

      if (error) {
        await handleError(error);
        return;
      }

      if (!result) {
        setToast(t('account_center.email_verification.error_send_failed'));
        return;
      }

      setPendingVerificationRecord({
        recordId: result.verificationRecordId,
        expiresAt: result.expiresAt,
      });
      setCodeInput([]);
      setHasSentCode(true);
      startCountdown();
    },
    [handleError, identifier, loading, sendCodeRequest, setToast, startCountdown, t]
  );

  const handleVerify = useCallback(
    async (code: string[]) => {
      if (
        !identifier ||
        !pendingVerificationRecord?.recordId ||
        !pendingVerificationRecord.expiresAt ||
        loading ||
        !isCodeReady(code)
      ) {
        return;
      }

      const { recordId, expiresAt } = pendingVerificationRecord;

      const [error] = await verifyCodeRequest({
        verificationRecordId: recordId,
        code: code.join(''),
        identifier,
      });

      if (error) {
        setCodeInput([]);
        await handleError(error);
        return;
      }

      setVerificationId(recordId, expiresAt);
      setPendingVerificationRecord(undefined);
    },
    [
      handleError,
      identifier,
      loading,
      pendingVerificationRecord,
      setVerificationId,
      verifyCodeRequest,
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
        <form
          className={styles.container}
          onSubmit={(event) => {
            event.preventDefault();
            if (!isCodeReady(codeInput)) {
              setToast(t('error.invalid_passcode'));
              return;
            }
            void handleVerify(codeInput);
          }}
        >
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
                forKey="account_center.email_verification.resend_countdown"
                interpolation={{ seconds: countdown }}
              />
            ) : (
              <button
                className={styles.resendButton}
                type="button"
                disabled={loading}
                onClick={() => {
                  void handleSendCode();
                }}
              >
                <DynamicT forKey="account_center.email_verification.resend" />
              </button>
            )}
          </div>
          <Button
            title="action.continue"
            type="primary"
            htmlType="submit"
            className={styles.submit}
            isLoading={loading}
          />
          {hasAlternativeMethod && (
            <SwitchVerificationMethodLink className={styles.switchLink} onClick={onSwitchMethod} />
          )}
        </form>
      ) : (
        <form className={styles.prepare} onSubmit={handleSendCode}>
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
            htmlType="submit"
            className={styles.prepareAction}
            disabled={loading}
            isLoading={loading}
          />
          {hasAlternativeMethod && (
            <SwitchVerificationMethodLink className={styles.switchLink} onClick={onSwitchMethod} />
          )}
        </form>
      )}
    </SecondaryPageLayout>
  );
};

export default CodeVerification;
