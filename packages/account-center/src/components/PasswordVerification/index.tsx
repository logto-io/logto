import Button from '@experience/shared/components/Button';
import PasswordInputField from '@experience/shared/components/InputFields/PasswordInputField';
import { useLogto } from '@logto/react';
import { useState, useContext, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { verifyPassword } from '@ac/apis/verification';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

type Props = {
  readonly onBack?: () => void;
};

const PasswordVerification = ({ onBack }: Props) => {
  const { t } = useTranslation();
  const { setVerificationId, setToast } = useContext(PageContext);
  const { getAccessToken } = useLogto();
  const { loading } = useContext(LoadingContext);
  const [password, setPassword] = useState('');
  const asyncVerifyPassword = useApi(verifyPassword);
  const handleError = useErrorHandler();

  const handleVerify = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!password || loading) {
      return;
    }

    const accessToken = await getAccessToken();

    if (!accessToken) {
      setToast(t('account_center.password_verification.error_failed'));
      return;
    }

    const [error, result] = await asyncVerifyPassword(accessToken, password);

    if (error) {
      await handleError(error);
      return;
    }

    if (!result) {
      setToast(t('account_center.password_verification.error_failed'));
      return;
    }

    setVerificationId(result.verificationRecordId, result.expiresAt);
  };

  return (
    <SecondaryPageLayout
      title="account_center.password_verification.title"
      description="account_center.password_verification.description"
      onBack={onBack}
    >
      <form noValidate className={styles.form} onSubmit={handleVerify}>
        <PasswordInputField
          autoComplete="current-password"
          label={t('input.password')}
          value={password}
          onChange={(event) => {
            if (event.target instanceof HTMLInputElement) {
              setPassword(String(event.target.value));
            }
          }}
        />
        <Button
          className={styles.submit}
          htmlType="submit"
          title="action.confirm"
          disabled={!password || loading}
          isLoading={loading}
        />
      </form>
    </SecondaryPageLayout>
  );
};

export default PasswordVerification;
