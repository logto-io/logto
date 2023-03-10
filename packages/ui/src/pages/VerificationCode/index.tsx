import { t } from 'i18next';
import { useParams, useLocation } from 'react-router-dom';
import { validate } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import VerificationCodeContainer from '@/containers/VerificationCode';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import { verificationCodeStateGuard, userFlowGuard } from '@/types/guard';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

type Parameters = {
  flow: string;
};

const VerificationCode = () => {
  const { flow } = useParams<Parameters>();
  const { signInMethods } = useSieMethods();
  const { state } = useLocation();

  const [, identifierState] = validate(state, verificationCodeStateGuard);
  const [, useFlow] = validate(flow, userFlowGuard);

  if (!useFlow) {
    return <ErrorPage />;
  }

  if (!identifierState) {
    return <ErrorPage title="error.invalid_session" />;
  }

  const { identifier, value } = identifierState;

  const methodSettings = signInMethods.find((method) => method.identifier === identifier);

  // SignIn Method not enabled
  if (!methodSettings && flow !== UserFlow.forgotPassword) {
    return <ErrorPage />;
  }

  return (
    <SecondaryPageLayout
      title="action.enter_passcode"
      description="description.enter_passcode"
      descriptionProps={{
        address: t(`description.${identifier === 'email' ? 'email' : 'phone_number'}`),
        target: identifier === 'phone' ? formatPhoneNumberWithCountryCallingCode(value) : value,
      }}
    >
      <VerificationCodeContainer
        flow={useFlow}
        identifier={identifier}
        target={value}
        hasPasswordButton={useFlow === UserFlow.signIn && methodSettings?.password}
      />
    </SecondaryPageLayout>
  );
};

export default VerificationCode;
