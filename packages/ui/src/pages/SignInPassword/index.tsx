import { SignInIdentifier } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { passwordIdentifierStateGuard } from '@/types/guard';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';
import { identifierInputDescriptionMap } from '@/utils/form';

import PasswordForm from './PasswordForm';

const SignInPassword = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const { signInMethods } = useSieMethods();

  const [_, identifierState] = validate(state, passwordIdentifierStateGuard);

  if (!identifierState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { identifier, value } = identifierState;

  const methodSetting = signInMethods.find((method) => method.identifier === identifier);

  // Sign-In method not enabled
  if (!methodSetting || !methodSetting.password) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageWrapper
      title="description.enter_password"
      description="description.enter_password_for"
      descriptionProps={{
        method: t(identifierInputDescriptionMap[identifier]),
        value:
          identifier === SignInIdentifier.Phone
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
    </SecondaryPageWrapper>
  );
};

export default SignInPassword;
