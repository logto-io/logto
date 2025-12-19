import Button from '@experience/shared/components/Button';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';
import { type SignInIdentifier } from '@logto/schemas';
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
  readonly identifierType: SignInIdentifier.Email | SignInIdentifier.Phone;
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
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className={styles.identifierInput}
          name={name}
          label={t(labelKey)}
          defaultValue={pendingValue}
          enabledTypes={[identifierType]}
          onChange={(inputValue) => {
            if (inputValue.type === identifierType) {
              setPendingValue(inputValue.value);
            }
          }}
        />
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
