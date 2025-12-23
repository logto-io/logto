import Button from '@experience/shared/components/Button';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';
import { validateUsername } from '@experience/shared/utils/validate-username';
import { AccountCenterControlValue, SignInIdentifier } from '@logto/schemas';
import { useContext, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { updateUsername } from '@ac/apis/account';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';
import { usernameSuccessRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from '../CodeFlow/index.module.scss';

const Username = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const {
    accountCenterSettings,
    verificationId,
    setVerificationId,
    setToast,
    userInfo,
    setUserInfo,
  } = useContext(PageContext);
  const defaultUsername = userInfo?.username ?? '';
  const [pendingUsername, setPendingUsername] = useState(defaultUsername);
  const [inputKey, setInputKey] = useState(defaultUsername);
  const [usernameError, setUsernameError] = useState<string>();
  const updateUsernameRequest = useApi(updateUsername);
  const handleError = useErrorHandler();

  useEffect(() => {
    setPendingUsername((current) => current || defaultUsername);
    setInputKey(defaultUsername);
  }, [defaultUsername]);

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.username !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    setUsernameError(undefined);

    if (!verificationId) {
      return;
    }

    const username = pendingUsername.trim();

    if (!username) {
      setUsernameError(t('error.username_required'));
      return;
    }

    const validationError = validateUsername(username);

    if (validationError) {
      const message =
        typeof validationError === 'string'
          ? t(`error.${validationError}`)
          : t(`error.${validationError.code}`, validationError.data ?? {});
      setUsernameError(message);
      return;
    }

    const [error] = await updateUsernameRequest(verificationId, { username });

    if (error) {
      await handleError(error, {
        'verification_record.permission_denied': async () => {
          setVerificationId(undefined);
          setToast(t('account_center.verification.verification_required'));
        },
        'user.username_already_in_use': async () => {
          setToast(t('error.username_exists'));
        },
        'user.username_required': async () => {
          setToast(t('error.username_required'));
        },
        'user.username_invalid_charset': async () => {
          setToast(t('error.username_invalid_charset'));
        },
        'user.username_should_not_start_with_number': async () => {
          setToast(t('error.username_should_not_start_with_number'));
        },
      });
      return;
    }

    setUserInfo((current) => ({ ...current, username }));
    void navigate(usernameSuccessRoute, { replace: true });
  };

  return (
    <SecondaryPageLayout
      title="account_center.username.title"
      description="account_center.username.description"
    >
      <form className={styles.container} onSubmit={handleSubmit}>
        <SmartInputField
          key={inputKey}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          className={styles.identifierInput}
          name="username"
          label={t('input.username')}
          defaultValue={pendingUsername}
          enabledTypes={[SignInIdentifier.Username]}
          errorMessage={usernameError}
          isDanger={Boolean(usernameError)}
          onChange={(inputValue) => {
            setPendingUsername(inputValue.value);
          }}
        />
        <Button
          className={styles.submit}
          title="action.continue"
          htmlType="submit"
          isLoading={loading}
        />
      </form>
    </SecondaryPageLayout>
  );
};

export default Username;
