import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import { identifierInputDescriptionMap } from '@/utils/form';

import ErrorPage from '../ErrorPage';

import ForgotPasswordForm from './ForgotPasswordForm';

const ForgotPassword = () => {
  const { isForgotPasswordEnabled, enabledMethodSet } = useForgotPasswordSettings();
  const { t } = useTranslation();
  const enabledMethods = [...enabledMethodSet];
  const { forgotPasswordIdentifierInputValue } = useContext(UserInteractionContext);

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

  const defaultType = getDefaultIdentifierType(forgotPasswordIdentifierInputValue?.type);
  const defaultValue =
    (forgotPasswordIdentifierInputValue?.type === defaultType &&
      forgotPasswordIdentifierInputValue.value) ||
    '';

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
