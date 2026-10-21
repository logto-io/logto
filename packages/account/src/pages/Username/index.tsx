import Button from '@experience/shared/components/Button';
import SmartInputField from '@experience/shared/components/InputFields/SmartInputField';
import { buildUsernamePolicyDescription } from '@experience/shared/utils/username-policy-description';
import { validateUsername } from '@experience/shared/utils/validate-username';
import { AccountCenterControlValue, SignInIdentifier } from '@logto/schemas';
import { useContext, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { updateUsername } from '@ac/apis/account';
import ErrorPage from '@ac/components/ErrorPage';
import StepUpEntryFallback from '@ac/components/StepUpEntryFallback';
import { usernameSuccessRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useIdentifierParam from '@ac/hooks/use-identifier-param';
import useStepUp, { useStepUpEntry } from '@ac/hooks/use-step-up';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from '../CodeFlow/index.module.scss';

const Username = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const { accountCenterSettings, experienceSettings, refreshUserInfo, setToast, userInfo } =
    useContext(PageContext);
  const identifierParam = useIdentifierParam();
  const defaultUsername = identifierParam ?? userInfo?.username ?? '';
  const [pendingUsername, setPendingUsername] = useState(defaultUsername);
  const [inputKey, setInputKey] = useState(defaultUsername);
  const [usernameError, setUsernameError] = useState<string>();
  const updateUsernameRequest = useApi(updateUsername);
  const handleError = useErrorHandler();
  const { requestStepUp } = useStepUp();
  const isEnabled =
    Boolean(accountCenterSettings?.enabled) &&
    accountCenterSettings?.fields.username === AccountCenterControlValue.Edit;
  const { isReady, hasFailed } = useStepUpEntry({ enabled: isEnabled });

  useEffect(() => {
    setPendingUsername((current) => current || defaultUsername);
    setInputKey(defaultUsername);
  }, [defaultUsername]);

  /**
   * Replaces the static page description (which states the default hard-floor rules) when the
   * tenant policy is restrictive, so the page never contradicts the enforced policy.
   */
  const usernamePolicyDescription = useMemo(
    () => buildUsernamePolicyDescription(experienceSettings?.usernamePolicy, t),
    [experienceSettings?.usernamePolicy, t]
  );

  if (!isEnabled) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!isReady) {
    return <StepUpEntryFallback hasFailed={hasFailed} />;
  }

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    setUsernameError(undefined);

    const username = pendingUsername.trim();

    if (!username) {
      setUsernameError(t('error.username_required'));
      return;
    }

    const validationError = validateUsername(username, experienceSettings?.usernamePolicy);

    if (validationError) {
      const message =
        typeof validationError === 'string'
          ? t(`error.${validationError}`)
          : t(`error.${validationError.code}`, validationError.data ?? {});
      setUsernameError(message);
      return;
    }

    const [error] = await updateUsernameRequest({ username });

    if (error) {
      if (await requestStepUp(error, { type: 'enter-subpage' })) {
        return;
      }

      await handleError(error, {
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

    await refreshUserInfo();
    navigate(usernameSuccessRoute, { replace: true });
  };

  return (
    <SecondaryPageLayout
      title="account_center.username.title"
      description={
        usernamePolicyDescription
          ? 'account_center.username.policy_description'
          : 'account_center.username.description'
      }
      descriptionProps={{ requirements: usernamePolicyDescription }}
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
          title="action.save"
          htmlType="submit"
          isLoading={loading}
        />
      </form>
    </SecondaryPageLayout>
  );
};

export default Username;
