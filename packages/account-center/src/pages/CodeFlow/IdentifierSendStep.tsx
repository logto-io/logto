import Button from '@experience/shared/components/Button';
import ErrorMessage from '@experience/shared/components/ErrorMessage';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';
import { emailRegEx } from '@logto/core-kit';
import { SignInIdentifier, type SignInIdentifier as SignInIdentifierType } from '@logto/schemas';
import { type TFuncKey } from 'i18next';
import { useCallback, useContext, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

export type IdentifierLabelKey =
  | 'account_center.email_verification.email_label'
  | 'account_center.phone_verification.phone_label';

type Props = {
  readonly identifierType: SignInIdentifierType.Email | SignInIdentifierType.Phone;
  readonly name: string;
  readonly labelKey: IdentifierLabelKey;
  readonly titleKey: TFuncKey;
  readonly descriptionKey: TFuncKey;
  readonly value: string;
  readonly errorMessage?: string;
  readonly clearErrorMessage?: () => void;
  readonly onCodeSent: (identifier: string, verificationRecordId: string) => void;
  readonly onSendFailed: (errorMessage: string) => void;
  readonly sendCode: (
    accessToken: string,
    identifier: string
  ) => Promise<{
    verificationRecordId: string;
    expiresAt: string;
  }>;
};

const IdentifierSendStep = ({
  identifierType,
  name,
  labelKey,
  titleKey,
  descriptionKey,
  value,
  errorMessage,
  clearErrorMessage,
  onCodeSent,
  onSendFailed,
  sendCode,
}: Props) => {
  const { t } = useTranslation();
  const { loading } = useContext(LoadingContext);
  const [pendingValue, setPendingValue] = useState(value);
  const [localErrorMessage, setLocalErrorMessage] = useState<string>();
  const sendCodeRequest = useApi(sendCode);
  const handleError = useErrorHandler();

  useEffect(() => {
    setPendingValue(value);
  }, [value]);

  const handleSend = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      setLocalErrorMessage(undefined);
      clearErrorMessage?.();

      const target = pendingValue.trim();

      if (!target) {
        setLocalErrorMessage(
          t('error.general_required', {
            types: [identifierType === 'email' ? t('input.email') : t('input.phone_number')],
          })
        );
        return;
      }

      // Validate email format before sending
      if (identifierType === SignInIdentifier.Email && !emailRegEx.test(target)) {
        setLocalErrorMessage(t('error.invalid_email'));
        return;
      }

      const [error, result] = await sendCodeRequest(target);

      if (error) {
        await handleError(error, {
          'guard.invalid_input': async (requestError) => {
            onSendFailed(requestError.message);
          },
        });
        return;
      }

      if (!result) {
        onSendFailed(t('account_center.verification.error_send_failed'));
        return;
      }

      onCodeSent(target, result.verificationRecordId);
    },
    [
      clearErrorMessage,
      handleError,
      identifierType,
      onCodeSent,
      onSendFailed,
      pendingValue,
      sendCodeRequest,
      t,
    ]
  );

  const displayError = errorMessage ?? localErrorMessage;

  return (
    <SecondaryPageLayout title={titleKey} description={descriptionKey}>
      <form className={styles.container} onSubmit={handleSend}>
        <SmartInputField
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className={styles.identifierInput}
          name={name}
          label={t(labelKey)}
          defaultValue={pendingValue}
          enabledTypes={[identifierType]}
          isDanger={Boolean(displayError)}
          errorMessage={displayError}
          onChange={(inputValue) => {
            if (inputValue.type === identifierType && inputValue.value !== pendingValue) {
              setPendingValue(inputValue.value);
              // Clear error when user modifies input
              setLocalErrorMessage(undefined);
            }
          }}
        />
        {displayError && <ErrorMessage>{displayError}</ErrorMessage>}
        <Button
          title="account_center.code_verification.send"
          type="primary"
          htmlType="submit"
          className={styles.submit}
          isLoading={loading}
        />
      </form>
    </SecondaryPageLayout>
  );
};

export default IdentifierSendStep;
