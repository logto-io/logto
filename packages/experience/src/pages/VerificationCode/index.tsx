import { SignInIdentifier, type VerificationCodeIdentifier } from '@logto/schemas';
import { t } from 'i18next';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { type IdentifierInputValue } from '@/components/InputFields/SmartInputField';
import VerificationCodeContainer from '@/containers/VerificationCode';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import { userFlowGuard } from '@/types/guard';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

type Parameters = {
  flow: string;
};

const isValidVerificationCodeIdentifier = (
  identifierInputValue: IdentifierInputValue | undefined
): identifierInputValue is VerificationCodeIdentifier =>
  Boolean(
    identifierInputValue?.type &&
      identifierInputValue.type !== SignInIdentifier.Username &&
      identifierInputValue.value
  );

const VerificationCode = () => {
  const { flow } = useParams<Parameters>();
  const { signInMethods } = useSieMethods();

  const { identifierInputValue, forgotPasswordIdentifierInputValue, verificationIdsMap } =
    useContext(UserInteractionContext);

  const [, userFlow] = validate(flow, userFlowGuard);

  if (!userFlow) {
    return <ErrorPage />;
  }

  const cachedIdentifierInputValue =
    flow === UserFlow.ForgotPassword ? forgotPasswordIdentifierInputValue : identifierInputValue;

  if (!isValidVerificationCodeIdentifier(cachedIdentifierInputValue)) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { type, value } = cachedIdentifierInputValue;

  // SignIn Method not enabled
  const methodSettings = signInMethods.find((method) => method.identifier === type);
  if (!methodSettings && flow !== UserFlow.ForgotPassword) {
    return <ErrorPage />;
  }

  // VerificationId not found
  const verificationId = verificationIdsMap[codeVerificationTypeMap[type]];
  if (!verificationId) {
    return <ErrorPage title="error.invalid_session" rawMessage="Verification ID not found" />;
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
        identifier={cachedIdentifierInputValue}
        verificationId={verificationId}
        hasPasswordButton={userFlow === UserFlow.SignIn && methodSettings?.password}
      />
    </SecondaryPageLayout>
  );
};

export default VerificationCode;
