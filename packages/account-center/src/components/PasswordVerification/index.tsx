import Button from '@experience/shared/components/Button';
import ErrorMessage from '@experience/shared/components/ErrorMessage';
import PasswordInputField from '@experience/shared/components/InputFields/PasswordInputField';
import { useState, useContext, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { verifyPassword } from '@ac/apis/verification';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const PasswordVerification = () => {
  const { t } = useTranslation();
  const { setVerificationId } = useContext(PageContext);
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleVerify = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!password) {
      setFieldError(t('error.password_required'));
      return;
    }

    setFieldError(undefined);
    setFormError(undefined);
    setLoading(true);
    try {
      const result = await verifyPassword(password);
      setVerificationId(result.verificationRecordId);
    } catch {
      setFormError(
        t('account_center.password_verification.error_failed', {
          defaultValue: 'Verification failed. Please check your password.',
        })
      );
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
          errorMessage={fieldError}
          isDanger={Boolean(fieldError)}
          onChange={(event) => {
            if (event.target instanceof HTMLInputElement) {
              setPassword(String(event.target.value));

              if (fieldError) {
                setFieldError(undefined);
              }

              if (formError) {
                setFormError(undefined);
              }
            }
          }}
        />
        <Button
          className={styles.submit}
          htmlType="submit"
          title="action.confirm"
          isLoading={loading}
        />
        {formError && <ErrorMessage className={styles.error}>{formError}</ErrorMessage>}
      </form>
    </SecondaryPageLayout>
  );
};

export default PasswordVerification;
