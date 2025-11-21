import Button from '@experience/shared/components/Button';
import PasswordInputField from '@experience/shared/components/InputFields/PasswordInputField';
import { useLogto } from '@logto/react';
import { useState, useContext, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { verifyPassword } from '@ac/apis/verification';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

type Props = {
  readonly onBack?: () => void;
};

const PasswordVerification = ({ onBack }: Props) => {
  const { t } = useTranslation();
  const { setVerificationId, setToast } = useContext(PageContext);
  const { getAccessToken } = useLogto();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!password) {
      return;
    }

    setLoading(true);
    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('Missing access token');
      }

      const result = await verifyPassword(accessToken, password);
      setVerificationId(result.verificationRecordId);
    } catch {
      const errorMessage = t('account_center.password_verification.error_failed');
      setToast(errorMessage);
    } finally {
      setLoading(false);
    }
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
          disabled={!password}
          isLoading={loading}
        />
      </form>
    </SecondaryPageLayout>
  );
};

export default PasswordVerification;
