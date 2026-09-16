import { SignInIdentifier, VerificationType } from '@logto/schemas';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import StepUpCodeVerification from '@/containers/StepUpCodeVerification';
import useStepUpContext from '@/hooks/use-step-up-context';
import ErrorPage from '@/pages/ErrorPage';
import { type VerificationCodeIdentifier } from '@/types';
import { codeVerificationTypeMap } from '@/utils/sign-in-experience';

type Parameters = {
  type: string;
};

/** The pinned-user code method of an identifier type, and the masked identifier it is sent to. */
const codeMethods = Object.freeze({
  [SignInIdentifier.Email]: {
    verificationType: VerificationType.EmailVerificationCode,
    maskedIdentifierKey: 'email',
  },
  [SignInIdentifier.Phone]: {
    verificationType: VerificationType.PhoneVerificationCode,
    maskedIdentifierKey: 'phone',
  },
} as const satisfies Record<VerificationCodeIdentifier, unknown>);

const isCodeIdentifierType = (type?: string): type is VerificationCodeIdentifier =>
  type === SignInIdentifier.Email || type === SignInIdentifier.Phone;

/**
 * `/step-up/verification-code/:type`: verify the code sent to the pinned subject's primary email
 * or phone.
 *
 * The identifier type rides in the path, so a refresh lands on the same method, and the code is
 * addressed by the verification ID the send stored. Only the masked identifier from the server
 * context is displayed: the raw primary email or phone never reaches the browser.
 */
const VerificationCode = () => {
  const { type } = useParams<Parameters>();
  const { authenticationContext } = useStepUpContext();
  const { verificationIdsMap } = useContext(UserInteractionContext);

  if (!isCodeIdentifierType(type)) {
    return <ErrorPage />;
  }

  const { verificationType, maskedIdentifierKey } = codeMethods[type];

  if (!authenticationContext?.availableMethods.includes(verificationType)) {
    return <ErrorPage message="error.invalid_session" />;
  }

  // The code is sent before this page opens; without its ID there is nothing to verify against.
  const verificationId = verificationIdsMap[codeVerificationTypeMap[type]];

  if (!verificationId) {
    return <ErrorPage message="error.invalid_session" />;
  }

  return (
    <SecondaryPageLayout
      title="step_up.verify_your_identity"
      description="step_up.enter_verification_code_description"
      descriptionProps={{
        identifier: authenticationContext.maskedIdentifiers[maskedIdentifierKey],
      }}
    >
      <StepUpCodeVerification identifierType={type} verificationId={verificationId} />
    </SecondaryPageLayout>
  );
};

export default VerificationCode;
