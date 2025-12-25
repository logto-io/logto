import Button from '@experience/shared/components/Button';
import PasswordInputField from '@experience/shared/components/InputFields/PasswordInputField';
import { useState, useContext, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { verifyPassword } from '@ac/apis/verification';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import SwitchVerificationMethodLink from '../SwitchVerificationMethodLink';

import styles from './index.module.scss';

type Props = {
  readonly onBack?: () => void;
  readonly onSwitchMethod?: () => void;
  readonly hasAlternativeMethod?: boolean;
};

const PasswordVerification = ({ onBack, onSwitchMethod, hasAlternativeMethod }: Props) => {
  const { t } = useTranslation();
  const { setVerificationId, setToast } = useContext(PageContext);
  const { loading } = useContext(LoadingContext);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const asyncVerifyPassword = useApi(verifyPassword);
  const handleError = useErrorHandler();

  const handleVerify = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setPasswordError(undefined);

    if (!password) {
      setPasswordError(t('error.password_required'));
      return;
    }

    const [error, result] = await asyncVerifyPassword(password);

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
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          autoComplete="current-password"
          label={t('input.password')}
          value={password}
          errorMessage={passwordError}
          isDanger={Boolean(passwordError)}
          onChange={(event) => {
            if (event.target instanceof HTMLInputElement) {
              setPassword(String(event.target.value));
            }
          }}
        />
        <Button
          className={styles.submit}
          htmlType="submit"
          title="action.continue"
          isLoading={loading}
        />
        {hasAlternativeMethod && (
          <SwitchVerificationMethodLink className={styles.switchLink} onClick={onSwitchMethod} />
        )}
      </form>
    </SecondaryPageLayout>
  );
};

export default PasswordVerification;
