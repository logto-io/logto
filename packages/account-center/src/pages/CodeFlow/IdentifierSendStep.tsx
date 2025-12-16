import Button from '@experience/shared/components/Button';
import ErrorMessage from '@experience/shared/components/ErrorMessage';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';
import { emailRegEx } from '@logto/core-kit';
import { SignInIdentifier, type SignInIdentifier as SignInIdentifierType } from '@logto/schemas';
import { type TFuncKey } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
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
  readonly onCodeSent: (identifier: string, verificationRecordId: string) => void;
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
  onCodeSent,
  sendCode,
}: Props) => {
  const { t } = useTranslation();
  const { loading } = useContext(LoadingContext);
  const { setToast } = useContext(PageContext);
  const [pendingValue, setPendingValue] = useState(value);
  const [errorMessage, setErrorMessage] = useState<string>();
  const sendCodeRequest = useApi(sendCode);
  const handleError = useErrorHandler();

  useEffect(() => {
    setPendingValue(value);
  }, [value]);

  const handleSend = async () => {
    const target = pendingValue.trim();

    if (!target || loading) {
      return;
    }

    // Validate email format before sending
    if (identifierType === SignInIdentifier.Email && !emailRegEx.test(target)) {
      setErrorMessage(t('error.invalid_email'));
      return;
    }

    // Clear any previous validation error
    setErrorMessage(undefined);

    const [error, result] = await sendCodeRequest(target);

    if (error) {
      await handleError(error);
      return;
    }

    if (!result) {
      setToast(t('account_center.verification.error_send_failed'));
      return;
    }

    onCodeSent(target, result.verificationRecordId);
  };

  return (
    <SecondaryPageLayout title={titleKey} description={descriptionKey}>
      <div className={styles.container}>
        <SmartInputField
          className={styles.identifierInput}
          name={name}
          label={t(labelKey)}
          defaultValue={pendingValue}
          enabledTypes={[identifierType]}
          isDanger={Boolean(errorMessage)}
          onChange={(inputValue) => {
            if (inputValue.type === identifierType && inputValue.value !== pendingValue) {
              setPendingValue(inputValue.value);
              // Clear error when user modifies input
              setErrorMessage(undefined);
            }
          }}
        />
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <Button
          title="account_center.code_verification.send"
          type="primary"
          className={styles.submit}
          disabled={!pendingValue || loading}
          isLoading={loading}
          onClick={() => {
            void handleSend();
          }}
        />
      </div>
    </SecondaryPageLayout>
  );
};

export default IdentifierSendStep;
