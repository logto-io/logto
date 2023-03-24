import { SignInIdentifier } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import { passwordIdentifierStateGuard } from '@/types/guard';
import { identifierInputDescriptionMap } from '@/utils/form';

import ErrorPage from '../ErrorPage';

import ForgotPasswordForm from './ForgotPasswordForm';

const ForgotPassword = () => {
  const { isForgotPasswordEnabled, enabledMethodSet } = useForgotPasswordSettings();
  const { state } = useLocation();
  const { t } = useTranslation();
  const enabledMethods = [...enabledMethodSet];

  const getDefaultIdentifierType = useCallback(
    (identifier?: SignInIdentifier) => {
      if (
        identifier === SignInIdentifier.Username ||
        identifier === SignInIdentifier.Email ||
        !identifier
      ) {
        return enabledMethodSet.has(SignInIdentifier.Email)
          ? SignInIdentifier.Email
          : SignInIdentifier.Phone;
      }

      return enabledMethodSet.has(SignInIdentifier.Phone)
        ? SignInIdentifier.Phone
        : SignInIdentifier.Email;
    },
    [enabledMethodSet]
  );

  if (!isForgotPasswordEnabled) {
    return <ErrorPage />;
  }

  const [_, identifierState] = validate(state, passwordIdentifierStateGuard);

  const defaultType = getDefaultIdentifierType(identifierState?.identifier);
  const defaultValue = (identifierState?.identifier === defaultType && identifierState.value) || '';

  return (
    <SecondaryPageLayout
      title="description.reset_password"
      description="description.reset_password_description"
      descriptionProps={{
        types: enabledMethods.map((method) => t(identifierInputDescriptionMap[method])),
      }}
    >
      <ForgotPasswordForm
        autoFocus
        defaultType={defaultType}
        defaultValue={defaultValue}
        enabledTypes={enabledMethods}
      />
    </SecondaryPageLayout>
  );
};

export default ForgotPassword;
