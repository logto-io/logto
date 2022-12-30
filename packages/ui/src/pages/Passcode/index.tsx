import { SignInIdentifier } from '@logto/schemas';
import { t } from 'i18next';
import { useParams, useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import PasscodeValidation from '@/containers/PasscodeValidation';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { UserFlow } from '@/types';
import { passcodeStateGuard, passcodeMethodGuard, userFlowGuard } from '@/types/guard';
import { formatPhoneNumberWithCountryCallingCode } from '@/utils/country-code';

type Parameters = {
  type: UserFlow;
  method: string;
};

const Passcode = () => {
  const { method, type = '' } = useParams<Parameters>();
  const { signInMethods } = useSieMethods();
  const { state } = useLocation();

  const invalidType = !is(type, userFlowGuard);
  const invalidMethod = !is(method, passcodeMethodGuard);
  const invalidState = !is(state, passcodeStateGuard);

  if (invalidType || invalidMethod) {
    return <ErrorPage />;
  }

  // SignIn Method not enabled
  const methodSettings = signInMethods.find(({ identifier }) => identifier === method);

  if (!methodSettings && type !== UserFlow.forgotPassword) {
    return <ErrorPage />;
  }

  const target = !invalidState && state[method === SignInIdentifier.Email ? 'email' : 'phone'];

  if (!target) {
    return <ErrorPage title={method === 'email' ? 'error.invalid_email' : 'error.invalid_phone'} />;
  }

  return (
    <SecondaryPageWrapper
      title="action.enter_passcode"
      description="description.enter_passcode"
      descriptionProps={{
        address: t(`description.${method === 'email' ? 'email' : 'phone_number'}`),
        target: method === 'email' ? target : formatPhoneNumberWithCountryCallingCode(target),
      }}
    >
      <PasscodeValidation
        type={type}
        method={method}
        target={target}
        hasPasswordButton={type === UserFlow.signIn && methodSettings?.password}
      />
    </SecondaryPageWrapper>
  );
};

export default Passcode;
