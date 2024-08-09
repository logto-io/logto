import { SignInIdentifier } from '@logto/schemas';
import { t } from 'i18next';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import VerificationCodeContainer from '@/containers/VerificationCode';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import { userFlowGuard } from '@/types/guard';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

type Parameters = {
  flow: string;
};

const VerificationCode = () => {
  const { flow } = useParams<Parameters>();
  const { signInMethods } = useSieMethods();

  const { identifierInputValue, forgotPasswordIdentifierInputValue } =
    useContext(UserInteractionContext);

  const [, userFlow] = validate(flow, userFlowGuard);

  if (!userFlow) {
    return <ErrorPage />;
  }

  const cachedIdentifierInputValue =
    flow === UserFlow.ForgotPassword ? forgotPasswordIdentifierInputValue : identifierInputValue;

  const { type, value } = cachedIdentifierInputValue ?? {};

  if (!type || type === SignInIdentifier.Username || !value) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const methodSettings = signInMethods.find((method) => method.identifier === type);

  // SignIn Method not enabled
  if (!methodSettings && flow !== UserFlow.ForgotPassword) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageLayout
      title={`description.verify_${type}`}
      description="description.enter_passcode"
      descriptionProps={{
        address: t(`description.${type === SignInIdentifier.Email ? 'email' : 'phone_number'}`),
        target:
          type === SignInIdentifier.Phone ? formatPhoneNumberWithCountryCallingCode(value) : value,
      }}
    >
      <VerificationCodeContainer
        flow={userFlow}
        identifier={type}
        target={value}
        hasPasswordButton={userFlow === UserFlow.SignIn && methodSettings?.password}
      />
    </SecondaryPageLayout>
  );
};

export default VerificationCode;
