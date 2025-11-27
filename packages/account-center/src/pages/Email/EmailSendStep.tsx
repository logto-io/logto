import Button from '@experience/shared/components/Button';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';
import { useLogto } from '@logto/react';
import { SignInIdentifier } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { sendEmailVerificationCode } from '@ac/apis/verification';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

type Props = {
  readonly email: string;
  readonly onCodeSent: (email: string, verificationRecordId: string) => void;
};

const EmailSendStep = ({ email, onCodeSent }: Props) => {
  const { t } = useTranslation();
  const { getAccessToken } = useLogto();
  const { loading } = useContext(LoadingContext);
  const { setToast } = useContext(PageContext);
  const [pendingEmail, setPendingEmail] = useState(email);
  const sendCodeRequest = useApi(sendEmailVerificationCode);
  const handleError = useErrorHandler();

  useEffect(() => {
    setPendingEmail(email);
  }, [email]);

  const handleSend = async () => {
    const target = pendingEmail.trim();

    if (!target || loading) {
      return;
    }

    const accessToken = await getAccessToken();

    if (!accessToken) {
      setToast(t('account_center.email_verification.error_send_failed'));
      return;
    }

    const [error, result] = await sendCodeRequest(accessToken, target);

    if (error) {
      await handleError(error);
      return;
    }

    if (!result) {
      setToast(t('account_center.email_verification.error_send_failed'));
      return;
    }

    onCodeSent(target, result.verificationRecordId);
  };

  return (
    <SecondaryPageLayout
      title="account_center.email.title"
      description="account_center.email.description"
    >
      <div className={styles.container}>
        <SmartInputField
          className={styles.identifierInput}
          name="email"
          label={t('account_center.email_verification.email_label')}
          defaultValue={pendingEmail}
          enabledTypes={[SignInIdentifier.Email]}
          onChange={(value) => {
            if (value.type === SignInIdentifier.Email) {
              setPendingEmail(value.value);
            }
          }}
        />
        <Button
          title="account_center.email_verification.send"
          type="primary"
          className={styles.submit}
          disabled={!pendingEmail || loading}
          isLoading={loading}
          onClick={() => {
            void handleSend();
          }}
        />
      </div>
    </SecondaryPageLayout>
  );
};

export default EmailSendStep;
