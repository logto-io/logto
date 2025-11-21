import Button from '@experience/shared/components/Button';
import PasswordInputField from '@experience/shared/components/InputFields/PasswordInputField';
import { useState, useContext, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { verifyPassword } from '@ac/apis/verification';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const PasswordVerification = () => {
  const { t } = useTranslation();
  const { setVerificationId, setToast } = useContext(PageContext);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!password) {
      return;
    }

    setLoading(true);
    try {
      const result = await verifyPassword(password);
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
