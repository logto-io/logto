import usePasswordErrorMessage from '@experience/shared/hooks/use-password-error-message';
import { PasswordPolicyChecker, passwordPolicyGuard } from '@logto/core-kit';
import { AccountCenterControlValue } from '@logto/schemas';
import { condArray } from '@silverhand/essentials';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { updatePassword } from '@ac/apis/account';
import ErrorPage from '@ac/components/ErrorPage';
import SetPassword from '@ac/components/SetPassword';
import StepUpEntryFallback from '@ac/components/StepUpEntryFallback';
import { passwordSuccessRoute } from '@ac/constants/routes';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import useStepUp, { useStepUpEntry } from '@ac/hooks/use-step-up';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';
import { canSetInitialPasswordWithoutVerification } from '@ac/utils/security-page';

import styles from '../CodeFlow/index.module.scss';

const Password = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading } = useContext(LoadingContext);
  const { accountCenterSettings, experienceSettings, userInfo, refreshUserInfo } =
    useContext(PageContext);
  const updatePasswordRequest = useApi(updatePassword);
  const handleError = useErrorHandler();
  const { requestStepUp } = useStepUp();
  const [errorMessage, setErrorMessage] = useState<string>();
  const clearErrorMessage = useCallback(() => {
    setErrorMessage(undefined);
  }, []);
  const { getErrorMessage, getErrorMessageFromBody } = usePasswordErrorMessage();

  const passwordPolicy = useMemo(
    () => passwordPolicyGuard.parse(experienceSettings?.passwordPolicy ?? {}),
    [experienceSettings]
  );
  const passwordPolicyChecker = useMemo(
    () => new PasswordPolicyChecker(passwordPolicy),
    [passwordPolicy]
  );

  const requirementsDescription = useMemo(() => {
    const {
      length: { min, max },
      characterTypes: { min: characterTypeMin },
    } = passwordPolicy;
    const items = condArray(
      min > characterTypeMin && t('description.password_requirement.length', { count: min }),
      characterTypeMin > 1 &&
        t('description.password_requirement.character_types', { count: characterTypeMin })
    );

    return items.length === 0 ? undefined : t('description.password_requirements', { items, max });
  }, [passwordPolicy, t]);

  const isEnabled =
    Boolean(accountCenterSettings?.enabled) &&
    accountCenterSettings?.fields.password === AccountCenterControlValue.Edit;
  const canSkipVerification = canSetInitialPasswordWithoutVerification(
    userInfo,
    accountCenterSettings?.fields
  );
  const { isReady, hasFailed } = useStepUpEntry({
    enabled: isEnabled,
    skip: canSkipVerification,
  });

  if (!isEnabled) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!isReady) {
    return <StepUpEntryFallback hasFailed={hasFailed} />;
  }

  const handleSubmit = async (password: string) => {
    clearErrorMessage();

    const fastCheckIssues = passwordPolicyChecker.fastCheck(password);
    const policyError = getErrorMessage(fastCheckIssues);

    if (policyError) {
      setErrorMessage(policyError);
      return;
    }

    if (loading) {
      return;
    }

    const [error] = await updatePasswordRequest({ password });

    if (error) {
      if (await requestStepUp(error, { type: 'enter-subpage' })) {
        return;
      }

      await handleError(error, {
        'password.rejected': async (requestError) => {
          setErrorMessage(getErrorMessageFromBody(requestError) ?? requestError.message);
        },
        'user.same_password': async (requestError) => {
          setErrorMessage(requestError.message);
        },
      });
      return;
    }

    await refreshUserInfo();
    navigate(passwordSuccessRoute, { replace: true });
  };

  const description =
    requirementsDescription === undefined ? (
      'account_center.password.description'
    ) : (
      <>
        <div>{t('account_center.password.description')}</div>
        <div className={styles.message}>{requirementsDescription}</div>
      </>
    );

  return (
    <SecondaryPageLayout title="account_center.password.title" description={description}>
      <div className={styles.container}>
        <SetPassword
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          clearErrorMessage={clearErrorMessage}
          errorMessage={errorMessage}
          maxLength={passwordPolicy.length.max}
          onSubmit={async (value) => handleSubmit(value)}
        />
      </div>
    </SecondaryPageLayout>
  );
};

export default Password;
