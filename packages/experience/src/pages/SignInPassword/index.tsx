import { SignInIdentifier } from '@logto/schemas';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';
import { identifierInputDescriptionMap } from '@/utils/form';

import PasswordForm from './PasswordForm';

const SignInPassword = () => {
  const { t } = useTranslation();
  const { signInMethods } = useSieMethods();

  const { identifierInputValue } = useContext(UserInteractionContext);

  if (!identifierInputValue) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { type, value } = identifierInputValue;

  const methodSetting = signInMethods.find((method) => method.identifier === type);

  // Sign-in method not enabled
  if (!methodSetting?.password) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageLayout
      title="description.enter_password"
      description="description.enter_password_for"
      descriptionProps={{
        method: t(identifierInputDescriptionMap[methodSetting.identifier]),
        value:
          methodSetting.identifier === SignInIdentifier.Phone
            ? formatPhoneNumberWithCountryCallingCode(value)
            : value,
      }}
    >
      <PasswordForm
        autoFocus
        identifier={methodSetting.identifier}
        value={value}
        isVerificationCodeEnabled={methodSetting.verificationCode}
      />
    </SecondaryPageLayout>
  );
};

export default SignInPassword;
